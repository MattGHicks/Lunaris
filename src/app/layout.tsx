import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Space Game - Build Your Space Empire',
  description:
    'A modern space strategy MMO with real-time gameplay, fleet battles, and alliance warfare. Build your empire, research technologies, and conquer the galaxy.',
  keywords: [
    'space game',
    'strategy MMO',
    'browser game',
    'fleet combat',
    'space empire',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
