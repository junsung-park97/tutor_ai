import { initTRPC } from '@trpc/server';

// 이 파일은 Nest DI 바깥의 순수 tRPC 라우터다.
// 웹 앱이 타입만 임포트하므로 Nest 데코레이터를 여기에 두지 않는다.
const t = initTRPC.create();

export const appRouter = t.router({
  health: t.procedure.query(() => ({ status: 'ok' as const })),
});

export type AppRouter = typeof appRouter;
