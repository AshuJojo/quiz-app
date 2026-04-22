import type { Metadata } from 'next';
import { Manrope, Inter } from 'next/font/google';
import { Agentation } from 'agentation';
import './globals.css';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Admin Panel',
  description: 'Quiz App Admin Panel',
};

import { Providers } from '@/providers';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          {process.env.NODE_ENV === 'development' && <Agentation />}
        </Providers>
      </body>
    </html>
  );
}
