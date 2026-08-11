import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import amqp, { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager';
import type { Channel } from 'amqplib';
import type { EventEnvelope } from '../../domain/event-envelope';
import { DOMAIN_EVENTS_EXCHANGE } from './messaging.constants';

/** 브로커 다운 시 publish 가 무한 대기하지 않고 reject 되도록 하는 상한 (리뷰 C2) */
const PUBLISH_TIMEOUT_MS = 10_000;

/**
 * 브로커에 직접 발행하는 유일한 컴포넌트 — OutboxRelay 전용 (ADR-001 제약 4).
 * 애플리케이션 코드는 EventPublisherPort(OutboxEventPublisher)만 사용한다.
 *
 * amqp-connection-manager 는 브로커 미가동 시 자동 재연결을 시도하므로
 * RabbitMQ 장애가 앱 부팅과 핫패스를 막지 않는다 (핫패스 불변 원칙).
 * publishTimeout 덕분에 장애 중의 publish 는 상한 시간 후 reject 되어
 * OutboxRelay 의 catch/재시도 경로가 정상 동작한다.
 */
@Injectable()
export class RabbitMqPublisher implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqPublisher.name);
  private connection!: AmqpConnectionManager;
  private channel!: ChannelWrapper;

  onModuleInit(): void {
    const url = process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672';
    this.connection = amqp.connect([url]);
    this.connection.on('connectFailed', ({ err }) => {
      this.logger.warn(`RabbitMQ connect failed: ${err.message}`);
    });
    this.channel = this.connection.createChannel({
      json: true,
      publishTimeout: PUBLISH_TIMEOUT_MS,
      setup: (ch: Channel) => ch.assertExchange(DOMAIN_EVENTS_EXCHANGE, 'topic', { durable: true }),
    });
    // 리스너 없는 'error' emit 은 프로세스를 죽인다 — setup 실패(exchange 속성 불일치 등) 시
    // 크래시 대신 로그로 격리한다 (리뷰 C1)
    this.channel.on('error', (error: Error) => {
      this.logger.error(`RabbitMQ channel error: ${error.message}`);
    });
  }

  /** routingKey = envelope.eventType (예: 'tutoring.conversation.ended') */
  async publish(envelope: EventEnvelope): Promise<void> {
    await this.channel.publish(DOMAIN_EVENTS_EXCHANGE, envelope.eventType, envelope, {
      persistent: true,
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.connection.close();
  }
}
