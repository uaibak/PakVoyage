import { PageLoader } from '@/components/page-loader';

export default function Loading() {
  return (
    <PageLoader
      eyebrow="Package detail"
      title="Preparing your departure details"
      description="Loading schedule, seats, pricing, and the registration form for this package."
    />
  );
}
