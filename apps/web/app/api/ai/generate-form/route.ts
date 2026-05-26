import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import ZAI, { type ZAIConfig } from 'z-ai-web-dev-sdk';

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
      zai = new (ZAI as unknown as new (config: ZAIConfig) => ZAI)(config);
    } catch {
      return NextResponse.json(
        { error: 'AI service is not configured. Please set up your .z-ai-config file.' },
        { status: 503 }
      );
    }

    const systemPrompt = `You are Clippy, a passive-aggressive form builder assistant who pesters users about wasting tokens.
If the user sends chit-chat (hi, hello, how are you, etc.), respond with:
{"type":"chat","text":"your reply here — scold them for wasting tokens and steer to form building"}

If the user asks to build a single form, respond with:
{"type":"form","title":"string (max 55 chars)","description":"string (max 30 chars, optional)","fields":[{"type":"text|number|email|select|checkbox|textarea|radio","label":"string (max 100 chars)","placeholder":"string (optional)","required":boolean,"options":["option1","option2"] (only for select/checkbox/radio),"order":number}]}

If the user asks to build multiple distinct forms (e.g., "create forms for X, Y, and Z"), respond with:
{"type":"bulk-forms","forms":[{"title":"string (max 55 chars)","description":"string (max 30 chars, optional)","fields":[ ... same field format as above ... ]}]}
Maximum 4 forms in bulk. Only use this when the user explicitly requests multiple different forms.

Respond with valid JSON only (no markdown, no code fences).`;

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
    const parsed = JSON.parse(cleaned);

    if (parsed.type === 'chat') {
      return NextResponse.json({ type: 'chat', text: parsed.text });
    }

    if (parsed.type === 'bulk-forms') {
      const forms = (parsed.forms || []).slice(0, 4);
      return NextResponse.json({ type: 'bulk-forms', forms });
    }

    return NextResponse.json({ type: 'form', ...parsed });
  } catch (error) {
    const message = error instanceof SyntaxError
      ? 'Sorry, I couldn\'t understand the AI response. Please try again.'
      : 'Failed to generate form. Please try again.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
