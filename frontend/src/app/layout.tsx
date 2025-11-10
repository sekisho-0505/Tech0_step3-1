import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';
import { AppProviders } from './providers';
import { Navigation } from '@/components/Navigation';

export const metadata: Metadata = {
  title: '価格設定支援システム',
  description: '粗利率を元に最適な販売価格を算出するシミュレーションツール',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <AppProviders>
          <Navigation />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
