/**
 * 타이포그래피 토큰 — 폰트 크기·굵기·줄간격의 단일 진실의 원천.
 *
 * 디자인 시스템의 본질: 크기는 임의 값이 아니라 "스케일(비율 단계)"로 둔다.
 * 컴포넌트는 `--font-size-md` 처럼 정해진 단계만 선택한다 (임의 값 남발 금지).
 *
 * 컬러와 달리 타이포는 light/dark 구분이 없다 → CSS 출력 시 `:root` 한 블록.
 */

/**
 * 타이포 토큰이 가져야 할 형태.
 *
 * 모든 leaf 값을 string 으로 강제한다 — generate-css 의 declarations() 헬퍼가
 * Record<string, string> 를 받으므로, fontWeight 도 400(number)이 아니라
 * "400"(string)이어야 그대로 재사용된다. CSS 값은 어차피 텍스트라 무방하다.
 */
type TypographyTokens = {
  fontSize: Record<"xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl", string>;
  fontWeight: Record<"normal" | "medium" | "bold", string>;
  lineHeight: Record<"tight" | "normal" | "relaxed", string>;
};

export const typography = {
  // rem 단위 — 사용자 브라우저 기본 폰트 크기에 비례한다(접근성). md(1rem)=16px 기준.
  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    md: "1rem", // 16px — 본문 기준
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    // "2xl"/"3xl" 은 TS 식별자가 아니므로 객체 키에 따옴표 필수.
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    bold: "700",
  },
  // 단위 없는 값 — 폰트 크기에 비례해 줄간격이 함께 늘어난다(권장 방식).
  lineHeight: {
    tight: "1.25",
    normal: "1.5",
    relaxed: "1.75",
  },
} as const satisfies TypographyTokens;

/** 전체 타이포그래피 토큰 객체의 타입. */
export type Typography = typeof typography;
