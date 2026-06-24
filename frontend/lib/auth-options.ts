import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/** URL do oauth-user: proxy na Vercel (servidor) evita timeout/CORS e usa o mesmo fluxo do cadastro. */
function oauthUserEndpoint(): string {
  const base = process.env.NEXTAUTH_URL?.replace(/\/$/, '');
  if (base) return `${base}/api/oauth-user`;
  return `${API_URL}/api/auth/oauth-user`;
}

async function syncOAuthUser(user: {
  email?: string | null;
  name?: string | null;
  image?: string | null;
}, provider: string): Promise<{ ok: boolean; userId?: string; token?: string; error?: string }> {
  if (!user.email) return { ok: false, error: 'Email não retornado pelo provedor OAuth.' };
  try {
    const res = await fetch(oauthUserEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        name: user.name,
        avatar: user.image,
        provider,
      }),
      signal: AbortSignal.timeout(90_000),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: (err as { error?: string }).error ?? `Backend respondeu ${res.status}` };
    }
    const data = await res.json();
    return { ok: true, userId: data.user?.id, token: data.token };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const isTimeout = e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError');
    return {
      ok: false,
      error: isTimeout
        ? 'Servidor demorou (Render acordando). Aguarde 1 minuto e tente de novo.'
        : msg,
    };
  }
}

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
const githubClientId = process.env.GITHUB_CLIENT_ID?.trim();
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();

const oauthProviders = [
  ...(googleClientId && googleClientSecret
    ? [
        GoogleProvider({
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        }),
      ]
    : []),
  ...(githubClientId && githubClientSecret
    ? [
        GitHubProvider({
          clientId: githubClientId,
          clientSecret: githubClientSecret,
        }),
      ]
    : []),
];

export const authOptions: NextAuthOptions = {
  providers: [
    ...oauthProviders,
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            signal: AbortSignal.timeout(90_000),
          });
          if (res.status === 503) {
            throw new Error('Banco ou servidor indisponível. Aguarde 1 minuto e tente de novo.');
          }
          if (!res.ok) return null;
          const data = await res.json();
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            image: data.user.avatar,
            accessToken: data.token,
          };
        } catch (e) {
          if (e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError')) {
            throw new Error('Servidor demorou para responder. O Render pode estar acordando — aguarde 1 minuto.');
          }
          if (e instanceof Error && e.message.includes('indisponível')) throw e;
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && (account.provider === 'google' || account.provider === 'github') && user?.email) {
        const synced = await syncOAuthUser(user, account.provider);
        if (synced.ok) {
          token.userId = synced.userId ?? user.id;
          token.accessToken = synced.token;
        }
      } else if (user) {
        token.userId = user.id;
        token.accessToken = (user as { accessToken?: string }).accessToken ?? token.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId ?? undefined;
        session.accessToken = token.accessToken as string | undefined;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider !== 'google' && account?.provider !== 'github') return true;
      const synced = await syncOAuthUser(user, account.provider);
      if (!synced.ok) {
        throw new Error(synced.error ?? 'Falha ao sincronizar usuário com o backend.');
      }
      return true;
    },
  },
  session: { strategy: 'jwt', maxAge: 7 * 24 * 60 * 60 },
  pages: { signIn: '/auth/login' },
  secret: process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV === 'development' ? 'habithub-dev-secret-change-in-production' : undefined),
};
