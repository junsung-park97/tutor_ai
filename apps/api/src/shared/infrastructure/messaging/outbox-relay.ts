import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { OutboxEvent } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RabbitMqPublisher } from './rabbitmq.publisher';

export const BATCH_SIZE = 100;
/** 이 횟수만큼 연속 실패한 행은 데드레터로 간주하고 건너뛴다 (poison 메시지 격리, 리뷰 C3) */
export const MAX_PUBLISH_ATTEMPTS = 5;

/**
 * outbox 테이블의 미발행 이벤트를 브로커로 중계한다.
 *
 * - waitForCompletion: 이전 틱이 끝나기 전에 다음 틱이 겹쳐 실행되지 않는다 (리뷰 C2)
 * - 발행 실패 시 failureCount 를 올리고 틱을 중단한다 → 다음 틱 재시도 (at-least-once)
 * - failureCount 가 한도에 도달한 행은 조회에서 제외되어 뒤의 이벤트를 막지 않는다.
 *   데드레터 행은 `failureCount >= MAX_PUBLISH_ATTEMPTS` 조회로 확인하고 수동 조치한다.
 * - 단일 인스턴스 가정. 다중 인스턴스로 확장하면 SELECT ... FOR UPDATE SKIP LOCKED 필요.
 */
@Injectable()
export class OutboxRelay {
  private readonly logger = new Logger(OutboxRelay.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly broker: RabbitMqPublisher,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS, { waitForCompletion: true })
  async relay(): Promise<void> {
    const pending = await this.prisma.outboxEvent.findMany({
      where: { publishedAt: null, failureCount: { lt: MAX_PUBLISH_ATTEMPTS } },
      orderBy: { occurredAt: 'asc' },
      take: BATCH_SIZE,
    });

    for (const row of pending) {
      try {
        await this.broker.publish({
          eventId: row.eventId,
          eventType: row.eventType,
          occurredAt: row.occurredAt.toISOString(),
          version: row.version,
          payload: row.payload,
        });
      } catch (error) {
        await this.recordFailure(row, error);
        return; // 순서 보존: 이번 틱 중단, 다음 틱에 재시도
      }

      try {
        await this.prisma.outboxEvent.update({
          where: { id: row.id },
          data: { publishedAt: new Date() },
        });
      } catch (error) {
        // 발행은 성공했으므로 다음 틱에 같은 이벤트가 한 번 더 나간다 (컨슈머 inbox 가 흡수)
        this.logger.error(
          `outbox published but not marked — 재시도 시 중복 발행됨: ${row.eventType} (${row.eventId})`,
          error instanceof Error ? error.stack : String(error),
        );
        return;
      }
    }
  }

  private async recordFailure(row: OutboxEvent, error: unknown): Promise<void> {
    const failureCount = row.failureCount + 1;
    const isDeadLettered = failureCount >= MAX_PUBLISH_ATTEMPTS;
    this.logger.error(
      `outbox publish failed (attempt ${failureCount}/${MAX_PUBLISH_ATTEMPTS}${
        isDeadLettered ? ', 데드레터 처리 — 수동 조치 필요' : ''
      }): ${row.eventType} (${row.eventId})`,
      error instanceof Error ? error.stack : String(error),
    );
    try {
      await this.prisma.outboxEvent.update({
        where: { id: row.id },
        data: { failureCount },
      });
    } catch (updateError) {
      this.logger.error(
        `outbox failureCount 갱신 실패: ${row.eventId}`,
        updateError instanceof Error ? updateError.stack : String(updateError),
      );
    }
  }
}
