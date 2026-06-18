import { ResultsView } from '@/components/results-view';

interface ResultsPageProps {
  searchParams?: {
    id?: string;
  };
}

export default function ResultsPage({ searchParams }: ResultsPageProps) {
  return (
    <div className="shell py-16">
      <ResultsView itineraryId={searchParams?.id} />
    </div>
  );
}
