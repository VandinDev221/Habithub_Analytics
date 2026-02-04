import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/**
 * Diagnóstico: testa se o frontend (Vercel) consegue falar com o backend (Railway).
 * GET /api/backend-ping → { ok: true, backend: true } ou { ok: false, error: "..." }
 */
export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          backend: false,
          error: `Backend respondeu com status ${res.status}`,
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
