import { Global, Module } from '@nestjs/common';
import { EVENT_PUBLISHER } from './application/ports/event-publisher.port';
import { InboxService } from './infrastructure/messaging/inbox.service';
import { OutboxEventPublisher } from './infrastructure/messaging/outbox-event-publisher';
import { OutboxRelay } from './infrastructure/messaging/outbox-relay';
import { RabbitMqPublisher } from './infrastructure/messaging/rabbitmq.publisher';
import { PrismaService } from './infrastructure/prisma/prisma.service';

@Global()
@Module({
  providers: [
    PrismaService,
    RabbitMqPublisher,
    OutboxRelay,
    InboxService,
    OutboxEventPublisher,
    { provide: EVENT_PUBLISHER, useExisting: OutboxEventPublisher },
  ],
  exports: [PrismaService, InboxService, OutboxEventPublisher, EVENT_PUBLISHER],
})
export class SharedModule {}
