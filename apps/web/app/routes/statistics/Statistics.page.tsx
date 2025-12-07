import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

export default function StatisticsPagePage() {
    // List page
  const { data, isLoading, error } = useQuery({
    queryKey: ['statistics'],
    queryFn: async () => {
      // TODO: Implement API call
      return [];
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Capture dashboard statistics</h1>
            <div>TODO: Render list</div>
          </div>
  );
  }
