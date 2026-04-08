import { PageLoader } from '@/components/page-loader';

export default function Loading() {
  return (
    <PageLoader
      eyebrow="Admin"
      title="Loading sign-in"
      description="Preparing secure admin login."
    />
  );
}
