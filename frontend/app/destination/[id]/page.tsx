import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiBaseUrl } from '@/lib/api';
import { FilterChip } from '@/components/filter-chip';
import { GalleryStrip } from '@/components/gallery-strip';
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
      <section className="premium-card-dark overflow-hidden">
        <img src={destination.cover_image_url} alt={destination.name} className="h-72 w-full object-cover opacity-75" />
        <div className="px-7 py-8 md:px-10 md:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
              {destination.region}
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl leading-[0.95] text-white md:text-7xl [font-family:var(--font-heading)]">
              {destination.name}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200">
              {destination.short_summary}
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
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="premium-card p-7 md:p-8">
          <p className="eyebrow">Travel notes</p>
          <h2 className="mt-4 text-4xl text-slate-950 [font-family:var(--font-heading)]">
            Why this stop belongs in your route
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-700">
            {destination.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {destination.ideal_for.map((item) => (
              <FilterChip key={item} label={item} />
            ))}
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-[rgba(255,255,255,0.92)] p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Best timing
              </p>
              <p className="mt-3 text-2xl text-slate-950 [font-family:var(--font-heading)]">
                {destination.best_time}
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-[rgba(255,255,255,0.92)] p-5">
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

          <div className="mt-8 rounded-[28px] border border-slate-200 bg-[rgba(248,243,235,1)] p-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-600">Highlights</p>
            <div className="mt-4 space-y-3">
              {destination.highlights.map((item) => (
                <p key={item} className="rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-slate-200 bg-[rgba(248,243,235,1)] p-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-600">Travel tips</p>
            <div className="mt-4 space-y-3">
              {destination.travel_tips.map((item) => (
                <p key={item} className="rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                  {item}
                </p>
              ))}
            </div>
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

      <section className="mt-8">
        <div className="premium-card p-7 md:p-8">
          <p className="eyebrow">Gallery</p>
          <h2 className="mt-4 text-4xl text-slate-950 [font-family:var(--font-heading)]">
            A visual feel for {destination.name}
          </h2>
          <div className="mt-6">
            <GalleryStrip images={destination.gallery_image_urls} title={destination.name} />
          </div>
        </div>
      </section>
    </div>
  );
}
