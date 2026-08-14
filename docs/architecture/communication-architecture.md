# 통신 아키텍처 다이어그램

시스템의 통신 채널별 프로토콜·스타일·전달 보장, 그리고 핵심 흐름 2개의 시퀀스.

## 통신 채널 요약

| 경로 | 기술 | 스타일 | 보장 / 특성 |
|---|---|---|---|
| Web ↔ API | tRPC (HTTP) | 동기 요청/응답 | 타입 공유 (AppRouter) |
| Web ↔ 튜터링 | WebSocket | 실시간 양방향 스트리밍 | 저지연 우선, 이벤트 인프라 미경유 |
| 모듈 내부 | @nestjs/cqrs CommandBus/QueryBus | 인프로세스 동기 | 유스케이스 오케스트레이션 |
| 컨텍스트 간 | Outbox → RabbitMQ topic exchange | 비동기 pub/sub | **at-least-once** + 멱등 컨슈머 (inbox) |
| 무거운 작업 | BullMQ (Redis) | 비동기 잡 큐 | 재시도·백오프·지연 실행 |
| mock PG → API | HTTP 웹훅 | 비동기 콜백 | 중복·순서역전 가정 → inbox 멱등 처리 |

## 시퀀스 1 — 결제 → 멤버십 부여 (이벤트 전파 + Saga)

트랜잭셔널 아웃박스와 멱등 컨슈머가 협력하는 신뢰성 경로.

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

## 시퀀스 2 — 실시간 튜터링 핫패스 + 이벤트 탭

핫패스는 스트리밍으로 흐르고, 도메인 이벤트는 옆으로 흘리기만 한다
("이벤트로 통지하되, 이벤트로 진행하지 않는다").

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

## 전달 보장의 계층

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
