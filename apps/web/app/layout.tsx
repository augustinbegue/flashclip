import { Outlet, Link } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="text-xl font-bold text-gray-900">
                Flashclip              </Link>
              <div className="flex gap-6">
                <Link to="/videos" className="text-gray-600 hover:text-gray-900">
                  Videos
                </Link>
                <Link to="/devices" className="text-gray-600 hover:text-gray-900">
                  Devices
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main>
          <Outlet />
        </main>
      </div>
    </QueryClientProvider>
  );
}
