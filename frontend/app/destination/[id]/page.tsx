import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiBaseUrl } from '@/lib/api';
import { Destination } from '@/lib/types';

interface DestinationPageProps {
  params: {
    id: string;
  };
}

async function getDestination(id: string): Promise<Destination | null> {
  try {
    const response = await fetch(`${apiBaseUrl}/destinations/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as Destination;
  } catch {
    return null;
  }
}

export default async function DestinationPage({
  params,
}: DestinationPageProps): Promise<JSX.Element> {
  const destination = await getDestination(params.id);

  if (!destination) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="overflow-hidden rounded-[2.5rem] bg-slate-950 text-white shadow-[0_32px_80px_rgba(15,23,42,0.28)]">
        <div className="bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.3),_transparent_28%),linear-gradient(135deg,#0f172a,#020617)] px-8 py-14 sm:px-12">
          <p className="text-sm uppercase tracking-[0.28em] text-emerald-300">
            {destination.region}
          </p>
          <h1 className="mt-4 text-5xl font-semibold">{destination.name}</h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-slate-300">
            {destination.description}
          </p>
        </div>

        <div className="grid gap-6 px-8 py-10 sm:px-12 lg:grid-cols-3">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-300">Best time</p>
            <p className="mt-3 text-2xl font-semibold">{destination.best_time}</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-300">Average cost</p>
            <p className="mt-3 text-2xl font-semibold">
              PKR {destination.avg_cost_per_day.toLocaleString()}
            </p>
            <p className="mt-2 text-sm text-slate-300">Estimated per day for a practical trip</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-300">Next step</p>
            <Link
              href="/planner"
              className="mt-3 inline-flex rounded-full bg-emerald-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200"
            >
              Plan a trip here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
