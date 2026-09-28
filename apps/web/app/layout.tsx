import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: { default: 'Jasiri Web Studios', template: '%s | Jasiri Web Studios' },
  description: 'Technology studio designing and developing digital products, websites, web applications, and software systems.',
  openGraph: { type: 'website', siteName: 'Jasiri Web Studios' },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:m-2 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-white">
            Skip to content
          </a>
          <Navbar />
          <main id="main" className="min-h-[60vh]">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
