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

async function getPackages(): Promise<TourPackage[]> {
  try {
    const response = await fetch(`${apiBaseUrl}/packages`, {
      cache: 'no-store',
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
  const featuredDestinations = destinations.slice(0, 4);
  const featuredPackages = packages.slice(0, 3);

  return (
    <div className="pb-24">
      <section className="section-space shell">
        <div className="premium-card-dark relative overflow-hidden px-8 py-12 md:px-12 md:py-16">
          <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-emerald-200">
                Premium Pakistan trip planning
              </p>
              <h1 className="mt-6 max-w-4xl text-5xl leading-[0.95] text-white md:text-7xl [font-family:var(--font-heading)]">
                Plan Pakistan with the clarity of a route map and the feeling of a travel journal.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-100">
                PakVoyage helps you discover destinations, generate practical itineraries,
                estimate costs, and shape a more confident trip across Pakistan.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/planner" className="cta-primary">
                  Start your itinerary
                </Link>
                <a
                  href="#destinations"
                  className="inline-flex items-center justify-center rounded-full border border-white/18 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/16"
                >
                  Explore destinations
                </a>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <StatPill label="Planner" value="Days, budget, interests" tone="dark" />
                <StatPill label="Routes" value="North + city combinations" tone="dark" />
                <StatPill label="Costing" value="Hotel, food, transport" tone="dark" />
              </div>
            </div>

            <div className="grid gap-4">
              {[
                {
                  title: 'Mountain-first routes',
                  body: 'From Hunza to Skardu, shape scenic trips with sensible day splits.',
                },
                {
                  title: 'Budget-aware planning',
                  body: 'See if the route fits your budget before you commit to it.',
                },
                {
                  title: 'Premium but practical',
                  body: 'Designed for local and international travelers who want elegance with utility.',
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

      <section className="shell section-space pt-0">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <SectionHeading
            eyebrow="Why PakVoyage"
            title="A calmer, more elegant way to plan travel across Pakistan."
            description="The experience combines inspiration and clarity so your route feels exciting, realistic, and easy to act on."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              'Destination-led planning informed by travel style',
              'Premium itinerary presentation, not cluttered output',
              'Practical cost visibility for real-world decision making',
              'Mobile-friendly flow designed for quick planning',
            ].map((item) => (
              <div key={item} className="premium-card px-5 py-6 text-sm leading-7 text-slate-800">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="destinations" className="shell section-space pt-0">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Featured routes"
            title="Places that shape unforgettable Pakistan itineraries"
            description="Discover a curated set of destinations with timing, cost cues, and region context before building your route."
          />
          <Link href="/planner" className="cta-secondary">
            Build custom trip
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

      <section className="shell section-space pt-0">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Fixed departures"
            title="Bookable travel packages with dates, seats, and pricing already defined"
            description="For travelers who want a ready-made experience, PakVoyage now includes fixed packages you can reserve directly through the website."
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

      <section className="shell section-space pt-0">
        <div className="premium-card grid gap-8 p-8 md:p-10 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <SectionHeading
              eyebrow="How it works"
              title="From idea to route in a few confident steps"
              description="The flow is intentionally simple, with strong guidance around destination choice, trip duration, and affordability."
            />
          </div>
          {[
            {
              step: '01',
              title: 'Choose your trip frame',
              text: 'Set days, budget, and interests to shape the right type of route.',
            },
            {
              step: '02',
              title: 'Generate the itinerary',
              text: 'Get a route with destinations, day-by-day pacing, and trip summary.',
            },
            {
              step: '03',
              title: 'Review and save',
              text: 'Compare cost breakdowns, explore destination pages, and save the plan.',
            },
          ].map((item) => (
            <div key={item.step} className="rounded-[28px] border border-slate-200 bg-white p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--emerald)]">
                Step {item.step}
              </p>
              <h3 className="mt-4 text-2xl text-slate-950 [font-family:var(--font-heading)]">
                {item.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-slate-700">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
