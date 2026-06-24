import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/** Proxy para criar/atualizar usuário OAuth no backend (NextAuth chama no servidor Vercel). */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const res = await fetch(`${BACKEND_URL.replace(/\/$/, '')}/api/auth/oauth-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body || undefined,
      signal: AbortSignal.timeout(90_000),
    });
    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const isTimeout = err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError');
    return NextResponse.json(
      {
        error: isTimeout
          ? 'Servidor demorou para responder. O Render pode estar acordando — tente de novo em 1 minuto.'
          : `Erro ao conectar ao servidor: ${message}`,
      },
      { status: 502 }
    );
  }
}
