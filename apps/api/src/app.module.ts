import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AuditModule } from './modules/audit/audit.module';
import { ConversationModule } from './modules/conversation/conversation.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { LearningModule } from './modules/learning/learning.module';
import { MembershipModule } from './modules/membership/membership.module';
import { NotificationModule } from './modules/notification/notification.module';
import { PaymentModule } from './modules/payment/payment.module';
import { TutoringModule } from './modules/tutoring/tutoring.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    CqrsModule.forRoot(),
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
    }),
    SharedModule,
    MembershipModule,
    PaymentModule,
    LearningModule,
    TutoringModule,
    ConversationModule,
    AnalyticsModule,
    GamificationModule,
    NotificationModule,
    AuditModule,
  ],
})
export class AppModule {}
