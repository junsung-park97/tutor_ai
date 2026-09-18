import { createAppRouter } from './app.router';

describe('appRouter.health', () => {
  test('returns ok when db and broker are both healthy', async () => {
    // Arrange
    const router = createAppRouter({
      isDbHealthy: async () => true,
      isBrokerConnected: () => true,
    });
    const caller = router.createCaller({});

    // Act
    const result = await caller.health();

    // Assert
    expect(result).toEqual({ status: 'ok', db: true, broker: true });
  });

  test('returns degraded when the broker is disconnected', async () => {
    // Arrange
    const router = createAppRouter({
      isDbHealthy: async () => true,
      isBrokerConnected: () => false,
    });
    const caller = router.createCaller({});

    // Act
    const result = await caller.health();

    // Assert
    expect(result).toEqual({ status: 'degraded', db: true, broker: false });
  });

  test('returns degraded when the database probe fails', async () => {
    // Arrange
    const router = createAppRouter({
      isDbHealthy: async () => false,
      isBrokerConnected: () => true,
    });
    const caller = router.createCaller({});

    // Act
    const result = await caller.health();

    // Assert
    expect(result).toEqual({ status: 'degraded', db: false, broker: true });
  });
});
