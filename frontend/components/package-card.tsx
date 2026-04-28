import Link from 'next/link';
import { TourPackage } from '@/lib/types';

interface PackageCardProps {
  travelPackage: TourPackage;
}

export function PackageCard({
  travelPackage,
}: PackageCardProps) {
  const formattedDate = new Date(travelPackage.travel_date).toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <article className="premium-card group flex h-full flex-col justify-between overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-medium)]">
      <img
        src={travelPackage.cover_image_url}
        alt={travelPackage.title}
        className="h-56 w-full object-cover"
      />
      <div className="p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">{travelPackage.region}</p>
            <h3 className="mt-3 text-3xl text-slate-950 [font-family:var(--font-heading)]">
              {travelPackage.title}
            </h3>
          </div>
          <span className="rounded-full border border-[rgba(21,55,42,0.12)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--emerald)]">
            {travelPackage.package_type}
          </span>
        </div>

        <p className="mt-5 text-sm leading-7 text-slate-700">{travelPackage.summary}</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[22px] border border-slate-200 bg-white p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-600">Travel date</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{formattedDate}</p>
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-white p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-600">Per seat</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              PKR {travelPackage.price_per_seat.toLocaleString()}
            </p>
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-white p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-600">Pickup city</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{travelPackage.pickup_city}</p>
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-white p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-600">Seats left</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {travelPackage.available_seats} / {travelPackage.total_seats}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <span className="rounded-full border border-slate-200 bg-[rgba(248,243,235,0.9)] px-3 py-2 text-xs uppercase tracking-[0.12em] text-slate-700">
            {travelPackage.stay_style}
          </span>
          <span className="rounded-full border border-slate-200 bg-[rgba(248,243,235,0.9)] px-3 py-2 text-xs uppercase tracking-[0.12em] text-slate-700">
            {travelPackage.difficulty_level}
          </span>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4">
          <span className="text-sm text-slate-600">
            {travelPackage.duration_days} days of guided planning
          </span>
          <Link
            href={`/packages/${travelPackage.id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--pine)] transition group-hover:text-[var(--emerald)]"
          >
            View package
            <span aria-hidden="true">-&gt;</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
