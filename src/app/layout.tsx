import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import './globals.css';
import { ConvexClientProvider } from '@/src/components/ConvexClientProvider';
import { WorkspaceProvider } from '@/src/components/kitalaku/workspace-context';

export const metadata: Metadata = {
  title: 'Kitalaku.in',
  description:
    'AI-based content management dashboard for planning, scheduling, approval, and analytics.',
  icons: {
    icon: '/kitalakuin-icon.png',
    apple: '/kitalakuin-icon.png',
  },
};

type RootLayoutProps = {
  children: React.ReactNode;
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
});

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${lora.variable} antialiased`}>
        <ConvexClientProvider>
          <WorkspaceProvider>
            <main>{children}</main>
          </WorkspaceProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
