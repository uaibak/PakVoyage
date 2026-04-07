import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/site-header';
import './globals.css';

export const metadata: Metadata = {
  title: 'PakVoyage',
  description:
    'All-in-one Pakistan travel planner for destinations, itineraries, and trip budgeting.',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 text-slate-950 antialiased">
        <div className="min-h-screen bg-[linear-gradient(180deg,rgba(240,253,250,0.8),rgba(248,250,252,0.92)_24%,rgba(248,250,252,1)_100%)]">
          <SiteHeader />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
