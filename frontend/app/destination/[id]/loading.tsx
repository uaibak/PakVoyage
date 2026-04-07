import { PageLoader } from '@/components/page-loader';

export default function Loading() {
  return (
    <PageLoader
      eyebrow="Destination"
      title="Loading destination details"
      description="Fetching regional highlights, travel timing, and estimated daily costs."
    />
  );
}
