import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Retorna o token do backend a partir do JWT do NextAuth.
 * Usado quando a sessão no client não inclui accessToken (fallback).
 */
export async function GET(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || 'habithub-dev-secret-change-in-production',
  });
  const accessToken = (token as { accessToken?: string } | null)?.accessToken;
  if (!accessToken) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }
  return NextResponse.json({ token: accessToken });
}
