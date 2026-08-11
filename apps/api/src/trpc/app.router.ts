import { initTRPC } from '@trpc/server';

// 이 파일은 Nest DI 바깥의 순수 tRPC 라우터다.
// 웹 앱이 타입만 임포트하므로 Nest 데코레이터를 여기에 두지 않고,
// DI 가 필요한 의존(헬스 프로브)은 main.ts 가 부팅 시점에 주입한다.
const t = initTRPC.create();

export interface AppRouterDeps {
  isDbHealthy(): Promise<boolean>;
  isBrokerConnected(): boolean;
}

export const createAppRouter = (deps: AppRouterDeps) =>
  t.router({
    // 실제 의존성 상태를 반영하는 헬스체크 — 장애 중 'ok' 를 보고하지 않는다
    health: t.procedure.query(async () => {
      const isDbHealthy = await deps.isDbHealthy();
      const isBrokerConnected = deps.isBrokerConnected();
      return {
        status: isDbHealthy && isBrokerConnected ? ('ok' as const) : ('degraded' as const),
        db: isDbHealthy,
        broker: isBrokerConnected,
      };
    }),
  });

export type AppRouter = ReturnType<typeof createAppRouter>;
