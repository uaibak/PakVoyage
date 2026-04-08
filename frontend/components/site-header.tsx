import Link from 'next/link';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/#destinations', label: 'Destinations' },
  { href: '/packages', label: 'Packages' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[rgba(250,247,241,0.96)] backdrop-blur-xl">
      <div className="shell flex items-center justify-between py-4">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(21,55,42,0.12)] bg-[rgba(255,252,247,0.86)] text-sm font-bold text-[var(--pine)] shadow-[var(--shadow-soft)]">
            PV
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--emerald)]">
              Pakistan Travel Planner
            </p>
            <p className="text-2xl leading-none text-[var(--pine)] [font-family:var(--font-heading)]">
              PakVoyage
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-6 rounded-full border border-[rgba(21,55,42,0.12)] bg-white px-5 py-3 text-sm text-slate-800 shadow-[var(--shadow-soft)] md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition hover:text-[var(--emerald)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link href="/planner" className="cta-primary">
            Plan trip
          </Link>
        </div>
      </div>
    </header>
  );
}
