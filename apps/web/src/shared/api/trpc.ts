import type { AppRouter } from '@api/trpc/app.router';
import { createTRPCReact } from '@trpc/react-query';

export const trpc = createTRPCReact<AppRouter>();
