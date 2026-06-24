import type { Metadata, Viewport } from 'next';
import { Providers } from '@/components/Providers';
import { NativeAppInit } from '@/components/NativeAppInit';
import './globals.css';

export const metadata: Metadata = {
  title: 'Habithub Analytics',
  description: 'Sistema de Análise de Hábitos com IA',
  icons: { icon: '/icon.svg' },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Habithub',
  },
  formatDetection: {
    telephone: false,
    email: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <NativeAppInit />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
