import { PackageCard } from '@/components/package-card';
import { SectionHeading } from '@/components/section-heading';
import { apiBaseUrl } from '@/lib/api';
import { TourPackage } from '@/lib/types';

interface PackagesPageProps {
  searchParams?: {
    search?: string;
    region?: string;
    package_type?: string;
    month?: string;
    max_price?: string;
  };
}

async function getPackages(searchParams?: PackagesPageProps['searchParams']): Promise<TourPackage[]> {
  try {
    const params = new URLSearchParams();

    if (searchParams?.search) params.set('search', searchParams.search);
    if (searchParams?.region) params.set('region', searchParams.region);
    if (searchParams?.package_type) params.set('package_type', searchParams.package_type);
    if (searchParams?.month) params.set('month', searchParams.month);
    if (searchParams?.max_price) params.set('max_price', searchParams.max_price);

    const response = await fetch(`${apiBaseUrl}/packages?${params.toString()}`, {
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

export default async function PackagesPage({ searchParams }: PackagesPageProps) {
  const packages = await getPackages(searchParams);

  return (
    <div className="shell py-16">
      <section className="premium-card-dark overflow-hidden px-8 py-12 md:px-12 md:py-16">
        <SectionHeading
          eyebrow="Travel packages"
          title="Choose a fixed departure and reserve your seat with confidence."
          description="Browse guided packages, compare dates and prices, and register seats directly from PakVoyage."
          theme="dark"
        />
      </section>

      <section className="mt-10">
        <form className="premium-card mb-8 grid gap-4 p-5 md:grid-cols-5">
          <input
            type="text"
            name="search"
            defaultValue={searchParams?.search ?? ''}
            placeholder="Search packages"
            className="rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          />
          <input
            type="text"
            name="region"
            defaultValue={searchParams?.region ?? ''}
            placeholder="Region"
            className="rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          />
          <input
            type="text"
            name="package_type"
            defaultValue={searchParams?.package_type ?? ''}
            placeholder="Package type"
            className="rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          />
          <input
            type="number"
            min={1}
            max={12}
            name="month"
            defaultValue={searchParams?.month ?? ''}
            placeholder="Travel month"
            className="rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          />
          <div className="flex gap-3">
            <input
              type="number"
              min={0}
              name="max_price"
              defaultValue={searchParams?.max_price ?? ''}
              placeholder="Max price"
              className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
            />
            <button type="submit" className="cta-primary shrink-0 px-5">
              Apply
            </button>
          </div>
        </form>

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {packages.length > 0 ? (
            packages.map((travelPackage) => (
              <PackageCard key={travelPackage.id} travelPackage={travelPackage} />
            ))
          ) : (
            <div className="premium-card p-10 text-sm leading-7 text-slate-700">
              No travel packages are available right now. Seed the backend packages to show bookable departures here.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
