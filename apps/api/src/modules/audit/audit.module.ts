import { Module } from '@nestjs/common';

/**
 * 감사 로그 바운디드 컨텍스트 (컨슈머 전용).
 * 라우팅 키 '#' 바인딩으로 모든 도메인 이벤트를 AuditLog 테이블에 기록한다.
 */
@Module({})
export class AuditModule {}
