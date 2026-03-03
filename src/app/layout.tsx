import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'ONYX - Barber Lab',
  description: 'L\'expérience ultime du grooming masculin.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark scroll-smooth">
      <body className={`${inter.variable} ${playfair.variable} bg-neutral-950 text-neutral-100 antialiased font-sans`}>
        {children}
      </body>
    </html>
  );
}
