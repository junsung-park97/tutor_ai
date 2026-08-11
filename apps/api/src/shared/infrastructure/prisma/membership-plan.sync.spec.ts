import { MembershipPlan as PrismaMembershipPlan } from '@prisma/client';
import { MEMBERSHIP_PLANS } from '../../domain/membership-plan';

// 도메인 계층은 Prisma 를 임포트할 수 없어 플랜 타입을 직접 정의한다.
// 이 테스트가 도메인 정의와 DB enum 의 드리프트를 CI 에서 잡는다.
describe('MembershipPlan domain type ↔ Prisma enum sync', () => {
  test('domain plan values match the Prisma enum exactly', () => {
    // Arrange
    const domainPlans = [...MEMBERSHIP_PLANS].sort();
    const prismaPlans = Object.values(PrismaMembershipPlan).sort();

    // Act & Assert
    expect(domainPlans).toEqual(prismaPlans);
  });
});
