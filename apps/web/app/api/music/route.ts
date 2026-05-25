import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const publicDir = path.join(process.cwd(), 'public');
  const files = fs.readdirSync(publicDir);
  const songs = files
    .filter(f => f.endsWith('.mp3'))
    .sort()
    .map(f => ({
      name: f.replace(/\.mp3$/i, ''),
      url: `/${f}`,
    }));
  return NextResponse.json({ songs });
}
