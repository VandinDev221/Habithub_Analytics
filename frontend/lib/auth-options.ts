import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

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
        try {
          const res = await fetch(`${API_URL}/api/auth/oauth-user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              avatar: user.image,
              provider: account.provider,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            token.userId = data.user?.id ?? user.id;
            token.accessToken = data.token;
          }
        } catch {
          // token sem accessToken — proxy/API falhará até novo login
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
      try {
        const res = await fetch(`${API_URL}/api/auth/oauth-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            avatar: user.image,
            provider: account.provider,
          }),
        });
        return res.ok;
      } catch {
        return false;
      }
    },
  },
  session: { strategy: 'jwt', maxAge: 7 * 24 * 60 * 60 },
  pages: { signIn: '/auth/login' },
  secret: process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV === 'development' ? 'habithub-dev-secret-change-in-production' : undefined),
};
