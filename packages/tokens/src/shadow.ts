/**
 * 그림자(box-shadow) 토큰 — 표면의 "높이(elevation)"를 단계로 표현한다.
 *
 * 카드·토스트·드롭다운처럼 떠 있는 요소가 단계만 선택하게 한다.
 * 테마 무관(light/dark 구분 없음) → CSS 출력 시 `:root` 한 블록.
 */

/** 그림자 단계 — none(없음) → xl(가장 높음). 모든 값은 box-shadow 문자열. */
type ShadowTokens = Record<"none" | "sm" | "md" | "lg" | "xl", string>;

export const shadow = {
  none: "none",
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
} as const satisfies ShadowTokens;

/** 전체 그림자 토큰 객체의 타입. */
export type Shadow = typeof shadow;
