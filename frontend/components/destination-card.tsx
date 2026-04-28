import Link from 'next/link';
import { Destination } from '@/lib/types';

interface DestinationCardProps {
  destination: Destination;
}

export function DestinationCard({
  destination,
}: DestinationCardProps) {
  return (
    <article className="premium-card group relative overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-medium)]">
      <img
        src={destination.cover_image_url}
        alt={destination.name}
        className="h-56 w-full object-cover"
      />
      <div className="relative">
        <div className="p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">{destination.region}</p>
              <h3 className="mt-3 text-3xl text-slate-950 [font-family:var(--font-heading)]">
                {destination.name}
              </h3>
            </div>
            <span className="rounded-full border border-[rgba(21,55,42,0.12)] bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--emerald)]">
              Curated
            </span>
          </div>

          <p className="mt-5 text-sm leading-7 text-slate-700">{destination.short_summary}</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] border border-slate-200/80 bg-white/92 p-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-600">
                Best window
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {destination.best_time}
              </p>
            </div>
            <div className="rounded-[22px] border border-slate-200/80 bg-white/92 p-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-600">
                Estimated from
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                PKR {destination.avg_cost_per_day.toLocaleString()} / day
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {destination.ideal_for.slice(0, 2).map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-200 bg-[rgba(248,243,235,0.9)] px-3 py-2 text-xs uppercase tracking-[0.12em] text-slate-700"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <span className="text-sm leading-6 text-slate-600">
              Scenic planning notes, gallery, and route-ready details
            </span>
            <Link
              href={`/destination/${destination.id}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--pine)] transition group-hover:text-[var(--emerald)]"
            >
              Explore
              <span aria-hidden="true">-&gt;</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
