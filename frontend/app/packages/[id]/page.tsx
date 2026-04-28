import { notFound } from 'next/navigation';
import { BookingForm } from '@/components/booking-form';
import { GalleryStrip } from '@/components/gallery-strip';
import { StatPill } from '@/components/stat-pill';
import { apiBaseUrl } from '@/lib/api';
import { TourPackage } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface PackageDetailPageProps {
  params: {
    id: string;
  };
}

async function getPackage(id: string): Promise<TourPackage | null> {
  try {
    const response = await fetch(`${apiBaseUrl}/packages/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as TourPackage;
  } catch {
    return null;
  }
}

export default async function PackageDetailPage({
  params,
}: PackageDetailPageProps) {
  const travelPackage = await getPackage(params.id);

  if (!travelPackage) {
    notFound();
  }

  const formattedDate = new Date(travelPackage.travel_date).toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="shell py-16">
      <section className="premium-card-dark overflow-hidden">
        <img
          src={travelPackage.cover_image_url}
          alt={travelPackage.title}
          className="h-72 w-full object-cover opacity-75"
        />
        <div className="px-8 py-10 md:px-12 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
              {travelPackage.region}
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl leading-[0.95] text-white md:text-7xl [font-family:var(--font-heading)]">
              {travelPackage.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-100">
              {travelPackage.description}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <StatPill label="Travel date" value={formattedDate} tone="dark" />
            <StatPill label="Pickup city" value={travelPackage.pickup_city} tone="dark" />
            <StatPill
              label="Price per seat"
              value={`PKR ${travelPackage.price_per_seat.toLocaleString()}`}
              tone="dark"
            />
          </div>
        </div>
        </div>
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-8">
          <div className="premium-card p-7 md:p-8">
            <p className="eyebrow">Package snapshot</p>
            <h2 className="mt-4 text-4xl text-slate-950 [font-family:var(--font-heading)]">
              Departure details
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-600">Duration</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {travelPackage.duration_days} days
                </p>
              </div>
              <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-600">Seats left</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {travelPackage.available_seats} / {travelPackage.total_seats}
                </p>
              </div>
              <div className="rounded-[22px] border border-slate-200 bg-white p-4 sm:col-span-2">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-600">Destinations</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {travelPackage.destinations.map((destination) => (
                    <span
                      key={destination}
                      className="rounded-full border border-slate-200 bg-[rgba(245,239,229,1)] px-3 py-2 text-sm text-slate-800"
                    >
                      {destination}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-600">Stay style</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{travelPackage.stay_style}</p>
              </div>
              <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-600">Difficulty</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{travelPackage.difficulty_level}</p>
              </div>
            </div>
          </div>

          <div className="premium-card p-7 md:p-8">
            <p className="eyebrow">What is included</p>
            <h2 className="mt-4 text-4xl text-slate-950 [font-family:var(--font-heading)]">
              Package inclusions
            </h2>
            <div className="mt-6 space-y-3">
              {travelPackage.inclusions.map((item) => (
                <div
                  key={item}
                  className="rounded-[20px] border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>

            <p className="eyebrow mt-8">What to budget separately</p>
            <div className="mt-4 space-y-3">
              {travelPackage.exclusions.map((item) => (
                <div
                  key={item}
                  className="rounded-[20px] border border-slate-200 bg-[rgba(248,243,235,0.9)] px-4 py-4 text-sm leading-6 text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="premium-card p-7 md:p-8">
            <p className="eyebrow">Route rhythm</p>
            <h2 className="mt-4 text-4xl text-slate-950 [font-family:var(--font-heading)]">
              Package pacing
            </h2>
            <div className="mt-6 space-y-3">
              {travelPackage.itinerary_overview.map((item) => (
                <div
                  key={item}
                  className="rounded-[20px] border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-[22px] border border-slate-200 bg-[rgba(248,243,235,0.9)] px-5 py-5 text-sm leading-7 text-slate-700">
              {travelPackage.departure_notes}
            </div>
          </div>

          <div className="premium-card p-7 md:p-8">
            <p className="eyebrow">Gallery</p>
            <h2 className="mt-4 text-4xl text-slate-950 [font-family:var(--font-heading)]">
              Visual preview
            </h2>
            <div className="mt-6">
              <GalleryStrip images={travelPackage.gallery_image_urls} title={travelPackage.title} />
            </div>
          </div>
        </div>

        <BookingForm travelPackage={travelPackage} />
      </section>
    </div>
  );
}
