import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiBaseUrl } from '@/lib/api';
import { StatPill } from '@/components/stat-pill';
import { Destination } from '@/lib/types';

export const dynamic = 'force-dynamic';

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
}: DestinationPageProps) {
  const destination = await getDestination(params.id);

  if (!destination) {
    notFound();
  }

  return (
    <div className="shell py-16">
      <section className="premium-card-dark soft-grid overflow-hidden px-7 py-8 md:px-10 md:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
              {destination.region}
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl leading-[0.95] text-white md:text-7xl [font-family:var(--font-heading)]">
              {destination.name}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">
              {destination.description}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <StatPill label="Region" value={destination.region} tone="dark" />
            <StatPill label="Best season" value={destination.best_time} tone="dark" />
            <StatPill
              label="Average daily cost"
              value={`PKR ${destination.avg_cost_per_day.toLocaleString()}`}
              tone="dark"
            />
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="premium-card p-7 md:p-8">
          <p className="eyebrow">Travel notes</p>
          <h2 className="mt-4 text-4xl text-slate-950 [font-family:var(--font-heading)]">
            Why this stop belongs in your route
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-700">
            {destination.name} offers a strong mix of scenery, local texture, and pacing for
            travelers building a more memorable Pakistan journey. Use it as a focused stay for a
            shorter trip or combine it with nearby regions for a broader route.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-[rgba(255,255,255,0.7)] p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Best timing
              </p>
              <p className="mt-3 text-2xl text-slate-950 [font-family:var(--font-heading)]">
                {destination.best_time}
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-[rgba(255,255,255,0.7)] p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Daily spend
              </p>
              <p className="mt-3 text-2xl text-slate-950 [font-family:var(--font-heading)]">
                PKR {destination.avg_cost_per_day.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="premium-card p-7 md:p-8">
          <p className="eyebrow">Plan from here</p>
          <h2 className="mt-4 text-4xl text-slate-950 [font-family:var(--font-heading)]">
            Turn this destination into a full itinerary
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-700">
            Open the planner to shape a trip around this destination, set your budget, and let
            PakVoyage map the pacing for you.
          </p>

          <div className="mt-8 rounded-[28px] bg-[linear-gradient(135deg,rgba(34,101,74,0.08),rgba(198,154,83,0.12))] p-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-600">
              Recommended use
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Ideal for travelers who want a more grounded, region-led stop with a clear sense of
              place, whether the trip focuses on culture, mountain scenery, or a balanced mix.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/planner" className="cta-primary">
              Plan a trip here
            </Link>
            <Link href="/" className="cta-secondary">
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
