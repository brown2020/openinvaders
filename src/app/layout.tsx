// app/layout.tsx

import type { Metadata, Viewport } from 'next';
import { Press_Start_2P } from 'next/font/google';
import './globals.css';

const pixelFont = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Space Invaders | Arcade Classic',
  description: 'A beautifully crafted remake of the classic Space Invaders arcade game with modern visuals and smooth gameplay.',
  keywords: ['space invaders', 'arcade', 'game', 'retro', 'classic'],
  authors: [{ name: 'OpenInvaders Team' }],
  openGraph: {
    title: 'Space Invaders',
    description: 'Play the classic arcade game with stunning modern visuals',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a18',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body 
        className={`${pixelFont.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
