import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
// DI 주입 클래스는 값 임포트여야 한다 — import type 은 design:paramtypes 메타데이터를 지운다
import { PrismaService } from '../prisma/prisma.service';

const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

/**
 * 컨슈머 멱등성 (inbox 패턴, ADR-001 제약 3).
 *
 * 사용 규약: 컨슈머는 비즈니스 처리와 **같은 트랜잭션** 안에서 tryMarkProcessed 를
 * 먼저 호출하고, false 면 이미 처리된 이벤트이므로 스킵한다.
 *
 * create-first 방식이라 같은 이벤트가 동시에 배달되어도 (eventId, consumer)
 * 유니크 제약이 정확히 한 쪽만 통과시킨다 — check-then-act 경쟁 없음 (리뷰 C4).
 * 트랜잭션이 롤백되면 claim 도 함께 롤백되어 다음 재배달에서 다시 처리된다.
 */
@Injectable()
export class InboxService {
  constructor(private readonly prisma: PrismaService) {}

  /** @returns true = 이번이 첫 처리 (진행), false = 이미 처리됨 (스킵) */
  async tryMarkProcessed(
    eventId: string,
    consumer: string,
    tx?: Prisma.TransactionClient,
  ): Promise<boolean> {
    const client = tx ?? this.prisma;
    try {
      await client.processedEvent.create({ data: { eventId, consumer } });
      return true;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_CONSTRAINT_VIOLATION
      ) {
        return false;
      }
      throw error;
    }
  }
}
