import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/**
 * Proxy público para registro: evita CORS ao chamar o backend a partir do mesmo domínio.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
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
    console.error('[backend-auth/register]', err);
    const message = err instanceof Error ? err.message : 'Erro ao conectar ao servidor';
    return NextResponse.json(
      { error: message },
      { status: 502 }
    );
  }
}
