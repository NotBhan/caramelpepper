import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const VAULT_PATH = path.join(process.cwd(), 'secrets.json');

function maskKey(key: string): string {
  if (!key) return '';
  if (key.length <= 8) return 'sk-****';

  let prefix = '';
  if (key.startsWith('sk-ant-')) prefix = 'sk-ant-';
  else if (key.startsWith('sk-or-')) prefix = 'sk-or-';
  else if (key.startsWith('sk-proj-')) prefix = 'sk-proj-';
  else if (key.startsWith('sk-')) prefix = 'sk-';
  else if (key.startsWith('AIza')) prefix = 'AIza';
  else prefix = key.slice(0, 3);

  const suffix = key.slice(-4);
  return `${prefix}****...${suffix}`;
}

export async function GET() {
  const providers = ['openai', 'anthropic', 'gemini', 'openrouter'];
  const status: Record<string, { configured: boolean; maskedKey: string }> = {};

  let vault: Record<string, string> = {};
  try {
    vault = JSON.parse(await fs.readFile(VAULT_PATH, 'utf-8'));
  } catch {}

  for (const p of providers) {
    let key = vault[p] || '';
    if (!key) {
      if (p === 'openai') key = process.env.OPENAI_API_KEY || '';
      else if (p === 'anthropic') key = process.env.ANTHROPIC_API_KEY || '';
      else if (p === 'gemini') key = process.env.GEMINI_API_KEY || '';
      else if (p === 'openrouter') key = process.env.OPENROUTER_API_KEY || '';
    }

    status[p] = {
      configured: Boolean(key && key.length > 5),
      maskedKey: maskKey(key)
    };
  }

  return NextResponse.json(status);
}
