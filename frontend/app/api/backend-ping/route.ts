import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/** Tenta /health e /api/health para funcionar com ou sem /api na URL base. */
async function pingBackend(base: string): Promise<{ res: Response; url: string }> {
  const normalized = base.replace(/\/$/, '');
  const urls = [`${normalized}/health`, `${normalized}/api/health`];
  let last = await fetch(urls[0], { method: 'GET', cache: 'no-store', headers: { Accept: 'application/json' } });
  if (last.ok) return { res: last, url: urls[0] };
  last = await fetch(urls[1], { method: 'GET', cache: 'no-store', headers: { Accept: 'application/json' } });
  return { res: last, url: urls[1] };
}

/**
 * Diagnóstico: testa se o frontend (Vercel) consegue falar com o backend (Railway).
 * GET /api/backend-ping → { ok: true, backend: true } ou { ok: false, error: "..." }
 */
export async function GET() {
  try {
    const { res, url } = await pingBackend(BACKEND_URL);
    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          backend: false,
          error: `Backend respondeu com status ${res.status} em ${url}. URL base deve ser a raiz do backend (ex.: https://xxx.up.railway.app).`,
          backendUrl: BACKEND_URL.replace(/\/$/, ''),
        },
        { status: 502 }
      );
    }
    const data = await res.json().catch(() => ({}));
    return NextResponse.json({
      ok: true,
      backend: true,
      backendStatus: data.status ?? 'ok',
      backendUrl: BACKEND_URL.replace(/\/$/, ''),
      checkedUrl: url,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        ok: false,
        backend: false,
        error: `Backend inacessível: ${message}. Verifique NEXT_PUBLIC_API_URL na Vercel.`,
        backendUrl: BACKEND_URL.replace(/\/$/, ''),
      },
      { status: 502 }
    );
  }
}
