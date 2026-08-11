/**
 * JSON 직렬화 가능한 값. 이벤트 payload 의 타입 제약으로 사용된다.
 * Date, Map, 클래스 인스턴스, undefined 는 여기에 속하지 않으므로
 * payload 에 담으려 하면 컴파일 단계에서 거부된다 (outbox/와이어 직렬화 안전성).
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonObject = { [key: string]: JsonValue };
