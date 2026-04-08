import { PageLoader } from '@/components/page-loader';

export default function Loading() {
  return (
    <PageLoader
      eyebrow="Admin"
      title="Loading admin portal"
      description="Preparing operations dashboards and management controls."
    />
  );
}
