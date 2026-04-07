import Link from 'next/link';
import { Destination } from '@/lib/types';

interface DestinationCardProps {
  destination: Destination;
}

export function DestinationCard({
  destination,
}: DestinationCardProps): JSX.Element {
  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
      <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-700">
        {destination.region}
      </p>
      <h3 className="mt-3 text-2xl font-semibold text-slate-950">
        {destination.name}
      </h3>
      <p className="mt-4 text-sm leading-6 text-slate-600">
        {destination.description}
      </p>
      <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-5 text-sm text-slate-700">
        <span>Best time: {destination.best_time}</span>
        <span>From PKR {destination.avg_cost_per_day.toLocaleString()}/day</span>
      </div>
      <Link
        href={`/destination/${destination.id}`}
        className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
      >
        View details
      </Link>
    </article>
  );
}
