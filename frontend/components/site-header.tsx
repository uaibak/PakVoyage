import Link from 'next/link';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/planner', label: 'Planner' },
];

export function SiteHeader(): JSX.Element {
  return (
    <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-[0.18em] text-white uppercase">
          PakVoyage
        </Link>
        <nav className="flex items-center gap-5 text-sm text-slate-200">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-emerald-300"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
