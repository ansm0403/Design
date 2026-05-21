/**
 * 모서리 둥글기(border-radius) 토큰.
 *
 * 테마 무관(light/dark 구분 없음) → CSS 출력 시 `:root` 한 블록.
 */

/** 모서리 단계 — none(각짐) → full(완전히 둥근 = pill/원). */
type RadiusTokens = Record<"none" | "sm" | "md" | "lg" | "full", string>;

export const radius = {
  none: "0",
  sm: "0.125rem", // 2px
  md: "0.375rem", // 6px
  lg: "0.5rem", // 8px
  // 9999px — 임의 비율의 요소를 pill 형태로 만든다. (50% 는 정사각형만 원이 됨)
  full: "9999px",
} as const satisfies RadiusTokens;

/** 전체 모서리 토큰 객체의 타입. */
export type Radius = typeof radius;
