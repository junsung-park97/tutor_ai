import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import * as trpcExpress from '@trpc/server/adapters/express';
import { AppModule } from './app.module';
import { appRouter } from './trpc/app.router';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use('/trpc', trpcExpress.createExpressMiddleware({ router: appRouter }));

  const port = Number(process.env.API_PORT ?? 3001);
  await app.listen(port);
};

void bootstrap();
