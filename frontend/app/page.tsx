import Link from 'next/link';
import { DestinationCard } from '@/components/destination-card';
import { apiBaseUrl } from '@/lib/api';
import { Destination } from '@/lib/types';

async function getDestinations(): Promise<Destination[]> {
  try {
    const response = await fetch(`${apiBaseUrl}/destinations`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as Destination[];
  } catch {
    return [];
  }
}

export default async function HomePage(): Promise<JSX.Element> {
  const destinations = await getDestinations();
  const featuredDestinations = destinations.slice(0, 4);

  return (
    <div className="space-y-24 pb-20">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.25),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(251,191,36,0.18),_transparent_32%),linear-gradient(135deg,#020617,#0f172a_52%,#1e293b)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">
              Pakistan travel planner
            </p>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-tight text-white sm:text-6xl">
              Plan mountain escapes, cultural city breaks, and food-focused trips in one place.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300">
              PakVoyage creates usable itineraries for Pakistan based on your days,
              budget, and interests, then gives you a simple cost estimate and route
              logic you can act on.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/planner"
                className="inline-flex rounded-full bg-emerald-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200"
              >
                Start planning
              </Link>
              <a
                href="#destinations"
                className="inline-flex rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40"
              >
                Explore destinations
              </a>
            </div>
          </div>

          <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
            {[
              '3-5 days: one destination with room to slow down',
              '6-10 days: combine city energy with northern scenery',
              'Budget-aware estimates for hotel, transport, and food',
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-5 text-sm leading-6 text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6">
        <div className="grid gap-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] lg:grid-cols-3">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-700">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              Simple inputs, practical trip output
            </h2>
          </div>
          <div className="text-sm leading-6 text-slate-600">
            Enter your available days, budget, and interests, and PakVoyage maps them
            into destinations that make sense together.
          </div>
          <div className="text-sm leading-6 text-slate-600">
            You get a day-by-day flow, estimated cost breakdown, and the option to save
            the itinerary for later retrieval.
          </div>
        </div>
      </section>

      <section id="destinations" className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-700">Destinations</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              Featured routes across Pakistan
            </h2>
          </div>
          <Link
            href="/planner"
            className="inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-950"
          >
            Build custom trip
          </Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {featuredDestinations.length > 0 ? (
            featuredDestinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))
          ) : (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-sm leading-6 text-slate-600">
              Destination data will appear here once the backend API is running and seeded.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
