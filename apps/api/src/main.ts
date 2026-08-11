import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as trpcExpress from '@trpc/server/adapters/express';
import { AppModule } from './app.module';
import { RabbitMqPublisher } from './shared/infrastructure/messaging/rabbitmq.publisher';
import { PrismaService } from './shared/infrastructure/prisma/prisma.service';
import { createAppRouter } from './trpc/app.router';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  // SIGTERM/SIGINT 시 onModuleDestroy(Prisma $disconnect, AMQP close)가 실행되도록 보장
  app.enableShutdownHooks();

  const prisma = app.get(PrismaService);
  const broker = app.get(RabbitMqPublisher);
  app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
      router: createAppRouter({
        isDbHealthy: () => prisma.isHealthy(),
        isBrokerConnected: () => broker.isConnected(),
      }),
    }),
  );

  const port = Number(process.env.API_PORT ?? 3001);
  await app.listen(port);
};

bootstrap().catch((error: unknown) => {
  // 부팅 실패를 구조화된 로그로 남기고 명시적으로 종료한다 (unhandled rejection 에 의존하지 않음)
  new Logger('Bootstrap').error(
    'application bootstrap failed',
    error instanceof Error ? error.stack : String(error),
  );
  process.exit(1);
});
