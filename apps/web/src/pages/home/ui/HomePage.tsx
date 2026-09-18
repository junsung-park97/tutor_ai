import { trpc } from '@/shared/api/trpc';

const HealthCheck = () => {
  const health = trpc.health.useQuery();

  if (health.isPending) {
    return <p className="text-sm text-gray-500">API: connecting...</p>;
  }
  if (health.isError) {
    return <p className="text-sm text-red-600">API: 연결 실패 — 서버가 응답하지 않습니다</p>;
  }
  return (
    <p className={health.data.status === 'ok' ? 'text-sm text-gray-500' : 'text-sm text-amber-600'}>
      API: {health.data.status}
      {health.data.status === 'degraded' &&
        ` (db: ${health.data.db ? 'ok' : 'down'}, broker: ${health.data.broker ? 'ok' : 'down'})`}
    </p>
  );
};

export const HomePage = () => (
  <main className="flex min-h-screen items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold">AI Tutoring</h1>
      <HealthCheck />
    </div>
  </main>
);
