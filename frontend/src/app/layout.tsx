import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import type { ReactNode } from 'react';

import './globals.css';
import { AppProviders } from './providers';
import { Navigation } from '@/components/Navigation';

const notoSans = Noto_Sans_JP({ subsets: ['latin'], weight: ['400', '500', '700'] });

export const metadata: Metadata = {
  title: '価格設定支援システム',
  description: '粗利率を元に最適な販売価格を算出するシミュレーションツール',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" className={notoSans.className}>
      <body>
        <AppProviders>
          <Navigation />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
