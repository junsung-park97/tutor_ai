import { Module } from '@nestjs/common';

/**
 * 멤버십 바운디드 컨텍스트.
 * 플랜(BASIC/PREMIUM)별 기능 접근 제어의 근거 데이터를 소유한다.
 * 튜터링 접속 전 멤버십 확인은 이 컨텍스트에 대한 Query 로 처리한다.
 */
@Module({})
export class MembershipModule {}
