# AI Tutoring

EDA · 헥사고날 · CQRS · 레포지토리 패턴 · 아토믹 패턴 학습 프로젝트.
요구사항과 아키텍처 결정(ADR)은 [spec.md](./spec.md), 이벤트 목록은 [docs/event-catalog.md](./docs/event-catalog.md) 참고.

모노레포는 **pnpm workspace + Turborepo** 구성이다. `pnpm build` / `pnpm test` 는
turbo 가 오케스트레이션하며 입력이 같으면 태스크 결과를 캐시에서 재생한다.
turbo 는 git 기반으로 입력을 해싱하므로 git 저장소가 필요하다 (초기화 완료).

## 실행

```bash
docker compose up -d          # postgres / redis / rabbitmq
cp .env.example apps/api/.env
pnpm install
pnpm --filter @ai-tutoring/api prisma:migrate   # 최초 1회
pnpm dev:api                  # http://localhost:3001
pnpm dev:web                  # http://localhost:5173 (/trpc 는 api 로 프록시)
```

RabbitMQ 관리 콘솔: http://localhost:15672 (guest/guest)

## 구조

```
apps/
├── api/   NestJS 모듈러 모놀리스
│   └── src/
│       ├── shared/            # 공유 커널: DomainEvent, EventEnvelope, 포트, Outbox/Inbox, RabbitMQ 어댑터
│       ├── modules/           # 바운디드 컨텍스트 (아래 참고)
│       └── trpc/              # tRPC 라우터 (Nest DI 바깥, 웹이 타입만 임포트)
└── web/   React + Vite
    └── src/
        ├── components/        # 아토믹 패턴: atoms / molecules / organisms / templates
        ├── pages/
        ├── stores/            # Zustand
        └── lib/               # tRPC 클라이언트, 유틸
```

### 바운디드 컨텍스트 (apps/api/src/modules/)

| 모듈 | 역할 |
|---|---|
| membership | 멤버십 플랜(BASIC/PREMIUM), 접근 제어 근거 |
| payment | mock PG 결제, 비동기 웹훅, 구매 Saga |
| learning | 학습 예제 (빈칸/독해/단어) |
| tutoring | AI 튜터링 실시간 핫패스(WS), 레벨 측정 |
| conversation | 대화 기록 영속화 (컨슈머) |
| analytics | 학습 분석 projection (컨슈머) |
| gamification | 스트릭·뱃지 (컨슈머 + 발행) |
| notification | 인앱 알림 (컨슈머) |
| audit | 전체 이벤트 감사 로그 (컨슈머) |

### 모듈 내부 레이어 규칙 (헥사고날)

각 모듈은 다음 4개 레이어를 갖는다. 의존 방향은 바깥 → 안 (domain 이 가장 안쪽):

```
modules/<context>/
├── domain/           # 엔티티, 값 객체, 도메인 이벤트 — 프레임워크 의존 금지
├── application/      # 커맨드/쿼리 핸들러, 포트 인터페이스
├── infrastructure/   # 어댑터: Prisma 레포지토리, 브로커 컨슈머, mock PG 등
└── presentation/     # tRPC 프로시저, WS 게이트웨이, 웹훅 컨트롤러
```

## 이벤트 인프라 핵심 규칙 (ADR-001 요약)

- 애플리케이션 코드는 `EventPublisherPort` 로만 발행 → Outbox 테이블 기록
- `OutboxRelay` 만 브로커(RabbitMQ topic exchange `domain.events`)에 직접 발행
- 이벤트 타입 문자열이 곧 라우팅 키: `<context>.<subject>.<action>`
- 모든 컨슈머는 `InboxService` 로 멱등 처리 (at-least-once 전제)
- 실시간 핫패스는 이벤트 발행을 기다리지 않는다 (fire-and-forget)
- 컨슈머 구현 시 큐 바인딩은 [docs/event-catalog.md](./docs/event-catalog.md)의 바인딩 표를 따른다
# tutor_ai
