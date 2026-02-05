import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/** Proxy para login. POST /api/login (evita 404 quando rewrite não se aplica na Vercel). */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body || undefined,
    });
    const data = await res.text();
    const contentType = res.headers.get('content-type') || 'application/json';
    return new NextResponse(data, {
      status: res.status,
      headers: { 'Content-Type': contentType },
    });
  } catch (err) {
    console.error('[api/login]', err);
    const message = err instanceof Error ? err.message : String(err);
    const hint = message.includes('fetch') || message.includes('ECONNREFUSED')
      ? ' Backend inacessível — confira NEXT_PUBLIC_API_URL e se a API está no ar. Use GET /api/backend-ping para testar.'
      : '';
    return NextResponse.json(
      { error: `Erro ao conectar ao servidor: ${message}.${hint}` },
      { status: 502 }
    );
  }
}
