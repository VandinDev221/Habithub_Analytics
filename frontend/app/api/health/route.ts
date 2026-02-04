import { NextResponse } from 'next/server';

/** Rota de diagnóstico: se retornar 200, o app Next está no ar e o Root Directory está correto. */
export async function GET() {
  return NextResponse.json({ ok: true, source: 'frontend-api' });
}
