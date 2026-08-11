import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { RabbitMqPublisher } from './rabbitmq.publisher';

const BATCH_SIZE = 100;

/**
 * outbox 테이블의 미발행 이벤트를 브로커로 중계한다.
 *
 * 단일 인스턴스 가정의 단순 폴링 구현. 다중 인스턴스로 확장하면
 * SELECT ... FOR UPDATE SKIP LOCKED 로 행 잠금을 추가해야 한다.
 * 발행 실패 시 publishedAt 이 남아 다음 틱에 재시도된다 (at-least-once).
 */
@Injectable()
export class OutboxRelay {
  private readonly logger = new Logger(OutboxRelay.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly broker: RabbitMqPublisher,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async relay(): Promise<void> {
    const pending = await this.prisma.outboxEvent.findMany({
      where: { publishedAt: null },
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
        await this.prisma.outboxEvent.update({
          where: { id: row.id },
          data: { publishedAt: new Date() },
        });
      } catch (error) {
        this.logger.error(
          `outbox publish failed: ${row.eventType} (${row.eventId})`,
          error instanceof Error ? error.stack : String(error),
        );
        return; // 순서 보존을 위해 이번 틱은 중단하고 다음 틱에 재시도
      }
    }
  }
}
