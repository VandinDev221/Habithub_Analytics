import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'habithub-dev-secret-change-in-production';

/**
 * Proxy: lê o JWT da sessão NextAuth do cookie da requisição (req) e envia o accessToken do backend no header.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, await params);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, await params);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, await params);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, await params);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, await params);
}

async function proxy(
  req: NextRequest,
  { path }: { path: string[] }
) {
  try {
    // getToken lê o cookie da requisição (req) — obrigatório passar req
    const token = await getToken({
      req,
      secret: NEXTAUTH_SECRET,
    });
    const accessToken = (token as { accessToken?: string } | null)?.accessToken?.trim();
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Sessão inválida ou expirada. Faça login novamente.' },
        { status: 401 }
      );
    }

    const pathStr = path.join('/');
    const url = new URL(req.url);
    const query = url.searchParams.toString();
    const backendUrl = `${BACKEND_URL}/api/${pathStr}${query ? `?${query}` : ''}`;

    let body: string | undefined;
    try {
      body = await req.text();
    } catch {
      body = undefined;
    }

    const headers: HeadersInit =
      body && body.length > 0
        ? {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          }
        : { Authorization: `Bearer ${accessToken}` };

    const res = await fetch(backendUrl, {
      method: req.method,
      headers,
      body: body && body.length > 0 ? body : undefined,
    });

    const data = await res.text();
    const contentType = res.headers.get('content-type') || 'application/json';
    return new NextResponse(data, {
      status: res.status,
      headers: { 'Content-Type': contentType },
    });
  } catch (err) {
    console.error('[proxy]', err);
    const message = err instanceof Error ? err.message : 'Erro interno do proxy';
    return NextResponse.json(
      { error: `Proxy: ${message}` },
      { status: 500 }
    );
  }
}
