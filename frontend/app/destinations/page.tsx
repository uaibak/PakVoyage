import { DestinationCard } from '@/components/destination-card';
import { SectionHeading } from '@/components/section-heading';
import { apiBaseUrl } from '@/lib/api';
import { Destination } from '@/lib/types';

interface DestinationsPageProps {
  searchParams?: {
    search?: string;
    region?: string;
    max_cost_per_day?: string;
  };
}

async function getDestinations(
  searchParams?: DestinationsPageProps['searchParams'],
): Promise<Destination[]> {
  try {
    const params = new URLSearchParams();

    if (searchParams?.search) params.set('search', searchParams.search);
    if (searchParams?.region) params.set('region', searchParams.region);
    if (searchParams?.max_cost_per_day) {
      params.set('max_cost_per_day', searchParams.max_cost_per_day);
    }

    const response = await fetch(`${apiBaseUrl}/destinations?${params.toString()}`, {
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

export default async function DestinationsPage({
  searchParams,
}: DestinationsPageProps) {
  const destinations = await getDestinations(searchParams);

  return (
    <div className="shell py-16">
      <section className="premium-card-dark overflow-hidden px-8 py-12 md:px-12 md:py-16">
        <SectionHeading
          eyebrow="Destinations"
          title="Browse places worth building a trip around."
          description="Filter by region, search by mood, and compare daily spend before you open the planner."
          theme="dark"
        />
      </section>

      <section className="mt-10">
        <form className="premium-card mb-8 grid gap-4 p-5 md:grid-cols-[1.2fr_1fr_1fr_auto]">
          <input
            type="text"
            name="search"
            defaultValue={searchParams?.search ?? ''}
            placeholder="Search destinations"
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
            type="number"
            min={0}
            name="max_cost_per_day"
            defaultValue={searchParams?.max_cost_per_day ?? ''}
            placeholder="Max daily cost"
            className="rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          />
          <button type="submit" className="cta-primary">
            Apply
          </button>
        </form>

        <div className="grid gap-6 lg:grid-cols-2">
          {destinations.length > 0 ? (
            destinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))
          ) : (
            <div className="premium-card p-10 text-sm leading-7 text-slate-700">
              No destinations matched this filter set. Try a wider region or remove the cost cap.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
