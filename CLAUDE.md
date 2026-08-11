# 1. 사용기술

## 1-1. 언어
- TypeScript


## 1-2. 프레임워크 & 라이브러리
### 프론트엔드
- React, TanStackQuery, Zustand
- TailwindCSS, Shadcn
- 아키텍처: FSD (Feature-Sliced Design) — spec.md ADR-002 참고

### 백엔드
- NestJS, prisma ORM

### 메시징 & 이벤트
- @nestjs/cqrs (CommandBus / QueryBus / EventBus / Saga)
- RabbitMQ (도메인 이벤트 백본, amqplib 기반 어댑터 — spec.md ADR-001 참고)
  - 추후 Redis Streams로 확장 가능하도록 포트/어댑터로 추상화 — 상세는 spec.md의 ADR-001 참고
- BullMQ (백그라운드 잡 큐, Redis 기반)

### RPC
- tRPC

### 테스트
- Jest

## 1-3. 인프라

### 배포
- Railway

### 가상화
- Docker, docker compose

### 인증
- JWT

## 1-4 데이터베이스 및 캐시
### 데이터베이스
- postgreSQL
### 캐시
- Redis


## 1-5. 기타

### 모노레포
- Turborepo + pnpm workspace

### 린트 및 포메터
- Biome, prettier


