import type { Metadata } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CloudGuard Bank — FinTech Resilience & Operations Control',
  description: 'Event-Driven Banking Transaction, Security, Compliance and Cloud Resilience Platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body
        className="bg-[#F5F3EF] text-[#171717] antialiased min-h-screen selection:bg-[#F45B2A]/20 selection:text-[#F45B2A]"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
