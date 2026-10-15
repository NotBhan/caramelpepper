import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const BACKEND_URL = 'http://127.0.0.1:18080';

export interface ModelMetadata {
  id: string;
  name: string;
  filename: string;
  path: string;
  sizeBytes: number;
  sizeFormatted: string;
  ramRequiredMB: number;
  quantization: string;
  status: 'Loaded' | 'Available';
  isLocal: boolean;
  provider: string;
  description: string;
}

function extractQuantization(filename: string): string {
  const match = filename.match(/([Qq][0-9]_[Kk]_[MmLlSs]|[Qq][0-9]_[0-9]|[Ff]16|[Ff]32|[Ii][Qq][0-9]_[A-Za-z0-9_]+)/);
  return match ? match[0].toUpperCase() : 'Q4_K_M';
}

function formatReadableName(filename: string): string {
  let base = filename.replace(/\.gguf$/i, '');
  base = base.replace(/[-_]/g, ' ');
  return base.replace(/\b\w/g, (c: string) => c.toUpperCase());
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  }
  if (bytes >= 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
  return Math.round(bytes / 1024) + ' KB';
}

function estimateVram(bytes: number): number {
  return Math.round((bytes / (1024 * 1024)) * 1.25);
}

export async function GET() {
  // 1. Try forwarding to C++ backend first
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1000);

    const res = await fetch(`${BACKEND_URL}/api/models`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Backend offline; proceed with direct filesystem discovery
  }

  // 2. Discover local models in backend/models
  const modelsDir = path.join(process.cwd(), 'backend', 'models');
  const models: ModelMetadata[] = [];

  try {
    await fs.mkdir(modelsDir, { recursive: true });
    const entries = await fs.readdir(modelsDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isFile() && entry.name.toLowerCase().endsWith('.gguf')) {
        const fullPath = path.join(modelsDir, entry.name);
        const stats = await fs.stat(fullPath);
        const id = entry.name.replace(/\.gguf$/i, '');
        const sizeBytes = stats.size;

        models.push({
          id,
          name: formatReadableName(entry.name),
          filename: entry.name,
          path: fullPath,
          sizeBytes,
          sizeFormatted: formatBytes(sizeBytes),
          ramRequiredMB: estimateVram(sizeBytes),
          quantization: extractQuantization(entry.name),
          status: models.length === 0 ? 'Loaded' : 'Available',
          isLocal: true,
          provider: 'local',
          description: 'Zero-egress offline inference powered by native llama.cpp runtime.'
        });
      }
    }
  } catch (err) {
    console.warn('[Model Discovery Warning]:', err);
  }

  // Fallback defaults if no physical .gguf files placed yet
  if (models.length === 0) {
    models.push({
      id: 'qwen2.5-coder-1.5b-instruct-q4_k_m',
      name: 'Qwen 2.5 Coder 1.5B Instruct',
      filename: 'qwen2.5-coder-1.5b-instruct-q4_k_m.gguf',
      path: path.join(modelsDir, 'qwen2.5-coder-1.5b-instruct-q4_k_m.gguf'),
      sizeBytes: 1180000000,
      sizeFormatted: '1.2 GB',
      ramRequiredMB: 1450,
      quantization: 'Q4_K_M',
      status: 'Loaded',
      isLocal: true,
      provider: 'local',
      description: 'Compact, high-precision code refactoring engine (Local Offline / Zero-Egress).'
    });

    models.push({
      id: 'deepseek-coder-6.7b-instruct-q4_k_m',
      name: 'DeepSeek Coder 6.7B Instruct',
      filename: 'deepseek-coder-6.7b-instruct-q4_k_m.gguf',
      path: path.join(modelsDir, 'deepseek-coder-6.7b-instruct-q4_k_m.gguf'),
      sizeBytes: 4100000000,
      sizeFormatted: '4.1 GB',
      ramRequiredMB: 4800,
      quantization: 'Q4_K_M',
      status: 'Available',
      isLocal: true,
      provider: 'local',
      description: 'Deep reasoning coder with 16k context window for complex architectural refactoring.'
    });
  }

  // 3. Append remote models if environment keys or secrets exist
  let hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  let hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY);
  let hasGemini = Boolean(process.env.GEMINI_API_KEY);
  let hasOpenRouter = Boolean(process.env.OPENROUTER_API_KEY);

  try {
    const vaultPath = path.join(process.cwd(), 'secrets.json');
    const vaultData = JSON.parse(await fs.readFile(vaultPath, 'utf-8'));
    if (vaultData.openai) hasOpenAI = true;
    if (vaultData.anthropic || vaultData.claude) hasAnthropic = true;
    if (vaultData.gemini) hasGemini = true;
    if (vaultData.openrouter) hasOpenRouter = true;
  } catch {
    // Vault does not exist or empty
  }

  if (hasOpenAI) {
    models.push({
      id: 'gpt-4o',
      name: 'OpenAI GPT-4o',
      filename: 'remote:openai/gpt-4o',
      path: 'https://api.openai.com/v1',
      sizeBytes: 0,
      sizeFormatted: 'Cloud API',
      ramRequiredMB: 0,
      quantization: 'FP16 (Server)',
      status: 'Available',
      isLocal: false,
      provider: 'openai',
      description: 'Omni-modal flagship model with strong reasoning across complex polyglot repos.'
    });
    models.push({
      id: 'gpt-4o-mini',
      name: 'OpenAI GPT-4o Mini',
      filename: 'remote:openai/gpt-4o-mini',
      path: 'https://api.openai.com/v1',
      sizeBytes: 0,
      sizeFormatted: 'Cloud API',
      ramRequiredMB: 0,
      quantization: 'FP16 (Server)',
      status: 'Available',
      isLocal: false,
      provider: 'openai',
      description: 'Fast, lightweight remote model for instantaneous code refactors.'
    });
  }

  if (hasAnthropic) {
    models.push({
      id: 'claude-3-5-sonnet-latest',
      name: 'Anthropic Claude 3.5 Sonnet',
      filename: 'remote:anthropic/claude-3-5-sonnet',
      path: 'https://api.anthropic.com/v1',
      sizeBytes: 0,
      sizeFormatted: 'Cloud API',
      ramRequiredMB: 0,
      quantization: 'FP16 (Server)',
      status: 'Available',
      isLocal: false,
      provider: 'anthropic',
      description: 'State-of-the-art coding and architecture model with 200k token window.'
    });
  }

  if (hasGemini) {
    models.push({
      id: 'gemini-2.0-flash',
      name: 'Google Gemini 2.0 Flash',
      filename: 'remote:google/gemini-2.0-flash',
      path: 'https://generativelanguage.googleapis.com',
      sizeBytes: 0,
      sizeFormatted: 'Cloud API',
      ramRequiredMB: 0,
      quantization: 'FP16 (Server)',
      status: 'Available',
      isLocal: false,
      provider: 'gemini',
      description: 'Sub-second speed with 1M token context comprehension.'
    });
  }

  if (hasOpenRouter) {
    models.push({
      id: 'deepseek/deepseek-r1',
      name: 'DeepSeek R1 (via OpenRouter)',
      filename: 'remote:openrouter/deepseek-r1',
      path: 'https://openrouter.ai/api/v1',
      sizeBytes: 0,
      sizeFormatted: 'Cloud API',
      ramRequiredMB: 0,
      quantization: 'FP16 (Server)',
      status: 'Available',
      isLocal: false,
      provider: 'openrouter',
      description: 'High-efficiency open reasoning model routed via OpenRouter unified gateway.'
    });
  }

  return NextResponse.json(models);
}
