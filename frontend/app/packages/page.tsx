import { PackageCard } from '@/components/package-card';
import { SectionHeading } from '@/components/section-heading';
import { apiBaseUrl } from '@/lib/api';
import { TourPackage } from '@/lib/types';

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

export default async function PackagesPage() {
  const packages = await getPackages();

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
