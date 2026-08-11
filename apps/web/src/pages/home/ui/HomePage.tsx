import { trpc } from '@/shared/api/trpc';

const HealthCheck = () => {
  const health = trpc.health.useQuery();
  return <p className="text-sm text-gray-500">API: {health.data?.status ?? 'connecting...'}</p>;
};

export const HomePage = () => (
  <main className="flex min-h-screen items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold">AI Tutoring</h1>
      <HealthCheck />
    </div>
  </main>
);
