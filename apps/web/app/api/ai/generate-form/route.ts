import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import ZAI from 'z-ai-web-dev-sdk';

function resolveEnvVars(value: string): string {
  return value.replace(/\$\{(\w+)\}/g, (_, name) => process.env[name] ?? '');
}

async function loadZaiConfig() {
  const configPaths = [
    path.join(process.cwd(), '.z-ai-config'),
    path.join(process.cwd(), '..', '..', '.z-ai-config'),
    path.join(process.cwd(), '..', '.z-ai-config'),
  ];
  for (const filePath of configPaths) {
    try {
      const configStr = await fs.readFile(filePath, 'utf-8');
      const raw = JSON.parse(configStr);
      const config = {
        baseUrl: resolveEnvVars(raw.baseUrl ?? ''),
        apiKey: resolveEnvVars(raw.apiKey ?? ''),
      };
      if (config.baseUrl && config.apiKey) {
        return config;
      }
    } catch {}
  }
  throw new Error('Configuration file not found');
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid "prompt" field' },
        { status: 400 }
      );
    }

    let zai: ZAI;
    try {
      const config = await loadZaiConfig();
      zai = new ZAI(config);
    } catch {
      return NextResponse.json(
        { error: 'AI service is not configured. Please set up your .z-ai-config file.' },
        { status: 503 }
      );
    }

    const systemPrompt = `You are a form builder assistant. Given a user's description, generate a form definition.
Respond with valid JSON only (no markdown, no code fences) in this exact shape:
{
  "title": "string (max 55 chars)",
  "description": "string (max 30 chars, optional)",
  "fields": [
    {
      "type": "text|number|email|select|checkbox|textarea|radio",
      "label": "string (max 100 chars)",
      "placeholder": "string (optional)",
      "required": boolean,
      "options": ["option1", "option2"] (only for select/checkbox/radio),
      "order": number
    }
  ]
}`;

    const completion = await zai.chat.completions.create({
      model: 'GLM-4.5-air',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
    });

    const text = completion.choices?.[0]?.message?.content;
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'AI returned an empty response' },
        { status: 500 }
      );
    }

    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const formDefinition = JSON.parse(cleaned);

    return NextResponse.json(formDefinition);
  } catch (error) {
    const message = error instanceof SyntaxError
      ? 'Sorry, I couldn\'t understand the AI response. Please try again.'
      : 'Failed to generate form. Please try again.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
