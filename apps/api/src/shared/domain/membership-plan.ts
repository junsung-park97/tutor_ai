/**
 * 멤버십 플랜의 도메인 소유 단일 정의.
 * 도메인 계층은 Prisma 를 임포트할 수 없으므로(ADR-001 제약 1) 여기서 직접 정의하고,
 * Prisma enum 과의 동기화는 infrastructure 계층의 테스트가 검증한다
 * (shared/infrastructure/prisma/membership-plan.sync.spec.ts).
 */
export const MEMBERSHIP_PLANS = ['BASIC', 'PREMIUM'] as const;

export type MembershipPlan = (typeof MEMBERSHIP_PLANS)[number];
