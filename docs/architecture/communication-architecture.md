# 통신 아키텍처 다이어그램

**모듈 단위로 누가 누구와, 동기인지 비동기인지**를 보여주는 지도.

범례: **실선 →** 동기 요청/응답 · **굵은 선 ⇒** 실시간 스트리밍 · **점선 ⇢** 비동기 (이벤트/웹훅/잡)

```mermaid
flowchart LR
  WEB["Web (React)"]
  AI["AI 프로바이더<br/>STT · LLM · TTS"]
  PGX["mock PG"]

  subgraph API["NestJS 모놀리스"]
    TUT["tutoring"]
    MEM["membership"]
    PAY["payment"]
    LRN["learning"]
    CONV["conversation"]
    ANA["analytics"]
    GAM["gamification"]
    NOT["notification"]
    AUD["audit"]
  end

  %% ── 동기 (실선) ──
  WEB -->|"tRPC"| MEM
  WEB -->|"tRPC"| PAY
  WEB -->|"tRPC"| LRN
  WEB -->|"tRPC"| CONV
  WEB -->|"tRPC"| ANA
  WEB -->|"tRPC"| NOT
  TUT -->|"멤버십 확인 Query<br/>(인프로세스 동기)"| MEM
  PAY -->|"결제 요청"| PGX

  %% ── 실시간 스트리밍 (굵은 선) ──
  WEB ==>|"WebSocket<br/>오디오/텍스트 스트림"| TUT
  TUT ==>|"스트리밍 호출"| AI

  %% ── 비동기 (점선) ──
  PGX -.->|"결제 웹훅"| PAY
  PAY -.->|"payment.completed"| MEM
  PAY -.->|"payment.failed / refunded"| NOT
  MEM -.->|"membership.granted / expired"| NOT
  TUT -.->|"conversation.* / turn.*"| CONV
  TUT -.->|"tutoring.#"| ANA
  TUT -.->|"conversation.ended / level.analyzed"| GAM
  TUT -.->|"level.analyzed"| NOT
  LRN -.->|"exercise.completed"| ANA
  LRN -.->|"exercise.completed"| GAM
  GAM -.->|"badge.awarded"| NOT
  TUT -.->|"모든 이벤트"| AUD
  PAY -.->|"모든 이벤트"| AUD
  MEM -.->|"모든 이벤트"| AUD
  LRN -.->|"모든 이벤트"| AUD
  GAM -.->|"모든 이벤트"| AUD
```

> 점선(이벤트)은 실제로는 모듈끼리 직접 닿지 않고 전부 outbox → RabbitMQ topic exchange 를
> 경유한다 (전달 보장은 아래 참고). 이 다이어그램에서는 "누가 누구에게"를 읽기 쉽게 논리적
> 관계로 축약했다. 물리 경로는 [system-overview.md](./system-overview.md) 참고.

## 통신 방식 결정 규칙

| 관계 | 방식 | 메커니즘 | 이유 |
|---|---|---|---|
| Web → 각 모듈 (조회·명령) | **동기** | tRPC (HTTP) | 사용자 요청/응답, 타입 공유 |
| Web ↔ tutoring | **실시간 스트리밍** | WebSocket | 지연 시간 NFR — 이벤트 인프라 미경유 |
| tutoring → membership | **동기** | 인프로세스 QueryBus | 접속 전 권한 확인은 즉답이 필요한 **읽기** |
| tutoring → AI 프로바이더 | **동기 스트리밍** | HTTP/WS | 핫패스 |
| payment → mock PG | **동기** | HTTP | 결제 시작 요청 |
| mock PG → payment | **비동기** | 웹훅 (중복·순서역전 가정) | 실제 PG 의 통지 방식 시뮬레이션 |
| **컨텍스트 간 상태 변경 전파 전부** | **비동기** | outbox → RabbitMQ (at-least-once) | 발행자가 구독자를 모르는 디커플링 |
| 무거운 작업 (레벨분석·알림 생성·만료) | **비동기 (셀프)** | BullMQ (Redis) | 재시도·백오프·지연 실행 |

**원칙**: 컨텍스트 사이를 넘는 **상태 변경의 전파는 예외 없이 비동기(이벤트)** 다.
동기 호출이 허용되는 곳은 두 가지뿐 — ① 클라이언트 경계(tRPC/WS), ② 즉답이 필요한
**읽기 전용 Query** (tutoring → membership 멤버십 확인). 동기 화살표가 이 둘 밖에서
발견되면 아키텍처 위반이다.

## 전달 보장의 계층 (비동기 경로의 내부)

```mermaid
flowchart LR
  A["발행 도메인"] -->|"같은 DB 트랜잭션"| B[("Outbox")]
  B -->|"5초 폴링 · 실패 시 재시도<br/>5회 초과 시 데드레터 제외"| C["OutboxRelay"]
  C -->|"publish (persistent)"| D{{"domain.events<br/>topic exchange"}}
  D -->|"라우팅 키 매칭 팬아웃"| E["컨슈머 큐들"]
  E -->|"inbox claim<br/>(eventId, consumer) 유니크"| F["멱등 처리"]
```

- 발행 측: 트랜잭셔널 아웃박스 (핫패스 이벤트만 best-effort fire-and-forget)
- 전달: at-least-once — 중복은 정상 상황으로 간주
- 소비 측: create-first inbox claim 으로 중복 무해화
- 상세 규약: [event-catalog.md](../event-catalog.md)

---

## 부록: 상세 시퀀스

### A. 결제 → 멤버십 부여 (이벤트 전파 + Saga)

```mermaid
sequenceDiagram
  autonumber
  participant PG as mock PG
  participant PAY as Payment 모듈
  participant DB as PostgreSQL
  participant RL as OutboxRelay
  participant MQ as RabbitMQ
  participant MEM as Membership 컨슈머
  participant NOT as Notification 컨슈머

  PG->>PAY: 결제 완료 웹훅 (중복 배달 가능)
  PAY->>DB: TX [ inbox claim + Payment 확정 + Outbox(payment.completed) ]
  Note over PAY,DB: 비즈니스 데이터와 이벤트가<br/>같은 트랜잭션 — 이중 쓰기 문제 봉합
  RL->>DB: 미발행 이벤트 폴링 (5초, occurredAt 순)
  RL->>MQ: publish (routing key = "payment.completed")
  MQ->>MEM: membership.events 큐로 전달
  MEM->>DB: TX [ inbox claim + 멤버십 부여 + Outbox(membership.granted) ]
  Note over MEM,DB: claim 실패(P2002) = 중복 배달 → 스킵
  RL->>MQ: publish ("membership.granted")
  MQ->>NOT: notification.events 큐로 전달
  NOT->>DB: 환영 알림 생성 (BullMQ 잡 경유)
  Note over PAY,NOT: 중간 단계 실패 시 Saga 가<br/>보상 트랜잭션(mock 환불) 실행
```

### B. 실시간 튜터링 핫패스 + 이벤트 탭

```mermaid
sequenceDiagram
  autonumber
  participant U as 유저 (마이크)
  participant W as Web (VAD 전처리)
  participant G as WS 게이트웨이
  participant AI as STT / LLM / TTS
  participant DB as PostgreSQL (Outbox)

  U->>W: 발화 (마이크 버튼)
  W->>G: 오디오 청크 스트림 (WebSocket)
  G->>AI: 스트리밍 STT
  AI-->>G: 부분/최종 텍스트
  G-)DB: UserTurnCompleted 기록
  Note right of G: fire-and-forget —<br/>await 하지 않는다
  G->>AI: LLM 프롬프트 (스트리밍)
  AI-->>G: 토큰 스트림
  G->>AI: TTS 합성
  AI-->>G: 오디오 청크
  G-->>W: 오디오/텍스트 스트림 재생
  G-)DB: AiTurnCompleted 기록
  Note over G,DB: 기록된 이벤트는 이후 relay 가 발행 →<br/>대화기록·분석·게이미피케이션 컨슈머가 소비
```
