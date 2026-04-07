import { PageLoader } from '@/components/page-loader';

export default function Loading() {
  return (
    <PageLoader
      eyebrow="Results"
      title="Preparing your itinerary"
      description="Loading the day-by-day trip plan, cost breakdown, and destination details."
    />
  );
}
