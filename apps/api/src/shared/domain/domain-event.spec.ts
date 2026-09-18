import { DomainEvent } from './domain-event';

class TestEvent extends DomainEvent {
  readonly eventType = 'test.happened';

  constructor(readonly payload: { value: number }) {
    super();
  }
}

describe('DomainEvent', () => {
  test('assigns a unique eventId per instance', () => {
    // Arrange & Act
    const first = new TestEvent({ value: 1 });
    const second = new TestEvent({ value: 2 });

    // Assert
    expect(first.eventId).not.toBe(second.eventId);
  });

  test('stamps occurredAt and defaults version to 1', () => {
    // Arrange & Act
    const event = new TestEvent({ value: 1 });

    // Assert
    expect(event.occurredAt).toBeInstanceOf(Date);
    expect(event.version).toBe(1);
  });
});
