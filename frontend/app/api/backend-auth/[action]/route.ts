import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const ALLOWED_ACTIONS = ['register', 'login'] as const;

/**
 * Proxy público para register/login: evita CORS ao chamar o backend no mesmo domínio.
 * Rotas: POST /api/backend-auth/register e POST /api/backend-auth/login
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;
  if (!ALLOWED_ACTIONS.includes(action as (typeof ALLOWED_ACTIONS)[number])) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }
  try {
    const body = await req.text();
    const res = await fetch(`${BACKEND_URL}/api/auth/${action}`, {
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
    console.error('[backend-auth]', action, err);
    const message = err instanceof Error ? err.message : 'Erro ao conectar ao servidor';
    return NextResponse.json(
      { error: message },
      { status: 502 }
    );
  }
}
