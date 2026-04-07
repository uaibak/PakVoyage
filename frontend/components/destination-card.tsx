import Link from 'next/link';
import { Destination } from '@/lib/types';

interface DestinationCardProps {
  destination: Destination;
}

export function DestinationCard({
  destination,
}: DestinationCardProps) {
  return (
    <article className="premium-card group relative overflow-hidden p-7 transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-medium)]">
      <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top_left,rgba(95,159,162,0.22),transparent_58%),linear-gradient(180deg,rgba(217,195,164,0.24),transparent)]" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">{destination.region}</p>
            <h3 className="mt-3 text-3xl text-slate-950 [font-family:var(--font-heading)]">
              {destination.name}
            </h3>
          </div>
          <span className="rounded-full border border-[rgba(21,55,42,0.1)] bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--emerald)]">
            Curated
          </span>
        </div>

        <p className="mt-5 text-sm leading-7 text-slate-600">
          {destination.description}
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[22px] border border-slate-200/80 bg-white/70 p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
              Best window
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {destination.best_time}
            </p>
          </div>
          <div className="rounded-[22px] border border-slate-200/80 bg-white/70 p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
              Estimated from
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              PKR {destination.avg_cost_per_day.toLocaleString()} / day
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Scenic planning notes and route-ready details
          </span>
          <Link
            href={`/destination/${destination.id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--pine)] transition group-hover:text-[var(--emerald)]"
          >
            Explore
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
