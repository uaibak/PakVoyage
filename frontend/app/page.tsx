import Link from 'next/link';
import { DestinationCard } from '@/components/destination-card';
import { PackageCard } from '@/components/package-card';
import { SectionHeading } from '@/components/section-heading';
import { StatPill } from '@/components/stat-pill';
import { apiBaseUrl } from '@/lib/api';
import { Destination, TourPackage } from '@/lib/types';

async function getDestinations(): Promise<Destination[]> {
  try {
    const response = await fetch(`${apiBaseUrl}/destinations`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as Destination[];
  } catch {
    return [];
  }
}

async function getPackages(): Promise<TourPackage[]> {
  try {
    const response = await fetch(`${apiBaseUrl}/packages`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as TourPackage[];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const destinations = await getDestinations();
  const packages = await getPackages();
  const featuredDestinations = destinations.slice(0, 3);
  const featuredPackages = packages.slice(0, 2);

  return (
    <div className="pb-20">
      <section className="section-space shell">
        <div className="premium-card-dark relative overflow-hidden px-8 py-12 md:px-12 md:py-16">
          <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-emerald-200">
                Pakistan trip planning
              </p>
              <h1 className="mt-6 max-w-4xl text-5xl leading-[0.95] text-white md:text-7xl [font-family:var(--font-heading)]">
                Plan your Pakistan trip in minutes.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-100">
                Pick days, budget, and interests. PakVoyage builds a practical itinerary, shows
                cost estimates, and helps you book confidently.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/planner" className="cta-primary">
                  Start planning
                </Link>
                <Link href="/packages" className="cta-secondary border-white/25 bg-white/10 text-white hover:bg-white/15">
                  View packages
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <StatPill label="Step 1" value="Enter trip details" tone="dark" />
                <StatPill label="Step 2" value="Get itinerary + costs" tone="dark" />
                <StatPill label="Step 3" value="Save or register" tone="dark" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {[
                {
                  title: 'Fast planning',
                  body: 'Create a day-by-day route in one flow without switching screens.',
                },
                {
                  title: 'Budget clarity',
                  body: 'See hotel, food, and transport totals before you commit.',
                },
                {
                  title: 'Booking ready',
                  body: 'Reserve fixed packages or register for a generated custom plan.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[26px] border border-white/12 bg-black/15 p-6"
                >
                  <h2 className="text-2xl text-white [font-family:var(--font-heading)]">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-100">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="destinations" className="shell section-space pt-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Explore"
            title="Top destinations"
            description="Start with a few popular picks, then customize your full trip in the planner."
          />
          <Link href="/planner" className="cta-secondary">
            Open planner
          </Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {featuredDestinations.length > 0 ? (
            featuredDestinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))
          ) : (
            <div className="premium-card p-10 text-sm leading-7 text-slate-600">
              Destination data will appear here once the backend is running and seeded.
            </div>
          )}
        </div>
      </section>

      <section className="shell section-space pt-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Ready to book"
            title="Upcoming group packages"
            description="Prefer a ready-made trip? Pick a departure and reserve seats directly."
          />
          <Link href="/packages" className="cta-secondary">
            View all packages
          </Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {featuredPackages.length > 0 ? (
            featuredPackages.map((travelPackage) => (
              <PackageCard key={travelPackage.id} travelPackage={travelPackage} />
            ))
          ) : (
            <div className="premium-card p-10 text-sm leading-7 text-slate-700">
              Package departures will appear here once the backend package data is seeded.
            </div>
          )}
        </div>
      </section>

      <section className="shell section-space pt-4">
        <div className="premium-card p-8 md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="eyebrow">Quick start</p>
              <h2 className="mt-3 text-4xl text-slate-950 [font-family:var(--font-heading)]">
                Ready to build your route?
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                Generate your custom itinerary now and register if the plan fits.
              </p>
            </div>
            <Link href="/planner" className="cta-primary">
              Create itinerary
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
