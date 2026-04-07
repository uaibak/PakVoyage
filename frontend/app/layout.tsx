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
      <body
        suppressHydrationWarning
        className="min-h-screen text-slate-950 antialiased [font-family:var(--font-body)]"
      >
        <div className="relative min-h-screen overflow-x-hidden">
          <SiteHeader />
          <main className="relative z-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
