import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { localCodeRefactoring } from '@/ai/flows/local-code-refactoring';

export const dynamic = 'force-dynamic';

const CONFIG_PATH = path.join(process.cwd(), 'config.json');

/**
 * AI Refactoring Router.
 * Handles switching between cloud Genkit providers and local inference engines.
 * Strictly gates Cloud AI providers behind GitHub authentication.
 */
export async function POST(req: NextRequest) {
  try {
    const { code, language, provider, style, isAnonymous } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Source code is required' }, { status: 400 });
    }

    // 1. Strict Provider-Level Authorization
    const isCloud = ['openai', 'anthropic', 'gemini'].includes(provider) || !['ollama', 'llamacpp'].includes(provider);
    
    // Check if the user is anonymous attempting to use a cloud provider
    if (isCloud && isAnonymous) {
      return NextResponse.json(
        { error: 'Cloud providers require a registered GitHub account for secure key management.' }, 
        { status: 403 }
      );
    }

    if (provider === 'ollama') {
      return await handleOllamaRefactor(code, language, style);
    }

    if (provider === 'llamacpp') {
      return await handleLlamaCppRefactor(code, language, style);
    }

    // Default to Genkit cloud providers (Gemini, etc.)
    const result = await localCodeRefactoring({ code, language, style });
    return NextResponse.json(result);

  } catch (err: any) {
    console.error("[AI API ERROR]:", err);
    return NextResponse.json(
      { error: err.message || 'The AI engine encountered an internal error. Please check your configuration.' }, 
      { status: 500 }
    );
  }
}

async function handleOllamaRefactor(code: string, language: string, style?: any) {
  let config: Record<string, any> = { 
    ollamaUrl: 'http://127.0.0.1:11434', 
    ollamaModel: 'qwen2.5-coder' 
  };

  try {
    const data = await fs.readFile(CONFIG_PATH, 'utf-8');
    config = { ...config, ...JSON.parse(data) };
  } catch (e) {}

  const systemPrompt = `You are the CaramelPepper 🌶️ expert code refactoring assistant.
CRITICAL CONSTRAINT: VERTICAL PACING
You MUST preserve 100% of the original vertical spacing. Do not minify.
${style ? `STYLE ALIGNMENT:
- Naming: ${style.namingConvention}
- Indentation: ${style.indentation}
- Braces: ${style.braceStyle}` : ''}

Your goal is to improve code quality and reduce complexity.
Provide response as a JSON object with: "refactoredCode", "suggestions" (array), "complexityAnalysis" (string).`;

  const userPrompt = `Refactor this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``;

  try {
    const response = await fetch(`${config.ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.ollamaModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        stream: false,
        format: 'json'
      }),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama service error: ${response.status} ${errorText || response.statusText}`);
    }

    const data = await response.json();
    if (!data.message?.content) {
      throw new Error('Ollama returned an empty response.');
    }

    const result = JSON.parse(data.message.content);
    return NextResponse.json(result);

  } catch (err: any) {
    const message = err.name === 'TimeoutError' 
      ? 'Ollama request timed out. Ensure the model is loaded.' 
      : (err.message.includes('fetch failed') ? `Could not connect to Ollama at ${config.ollamaUrl}. Ensure it is running.` : err.message);
    
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handleLlamaCppRefactor(code: string, language: string, style?: any) {
  let config: Record<string, any> = { 
    llamacppUrl: 'http://127.0.0.1:8080'
  };

  try {
    const data = await fs.readFile(CONFIG_PATH, 'utf-8');
    config = { ...config, ...JSON.parse(data) };
  } catch (e) {}

  const systemPrompt = `You are the CaramelPepper 🌶️ expert assistant.
CRITICAL: Preserve 100% original vertical spacing.
${style ? `Use style: ${style.namingConvention}, ${style.indentation}` : ''}
Format: JSON object with "refactoredCode", "suggestions" (array), "complexityAnalysis" (string).`;

  const userPrompt = `Refactor this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``;

  try {
    const response = await fetch(`${config.llamacppUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        stream: false
      }),
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      throw new Error(`llama.cpp server error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    
    return NextResponse.json(result);

  } catch (err: any) {
    const message = err.message.includes('fetch failed') 
      ? `Could not connect to llama.cpp at ${config.llamacppUrl}.` 
      : err.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}