import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import { Agentation } from 'agentation';
import { Providers } from '@/providers';
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
  title: 'Prepvers',
  description: 'Prepvers learner app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>
          {children}
          {process.env.NODE_ENV === 'development' && <Agentation />}
        </Providers>
      </body>
    </html>
  );
}
