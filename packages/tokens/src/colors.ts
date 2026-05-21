/**
 * 컬러 토큰 — 디자인 시스템의 "색" 단일 진실의 원천(Single Source of Truth).
 *
 * 2단계 구조:
 *  1) primitive — 실제 hex 값의 팔레트. 역할 정보가 없는 "그냥 색".
 *  2) semantic  — 역할 기반 이름이 primitive 를 "참조". 컴포넌트는 이것만 본다.
 *
 * 왜 2단계로 나누는가:
 *  - 브랜드 색을 파랑→초록으로 바꿔도 semantic 의 참조 한 줄만 고치면 끝.
 *  - 컴포넌트는 `blue[500]`(값)이 아니라 `primary`(역할)를 소비 → 코드에 의미가 드러난다.
 */

// ── 1) Primitive (원시) 토큰 — 팔레트 ───────────────────────────────
// 50(가장 밝음) ~ 900(가장 어두움) 10단계 스케일. 검증된 Tailwind 계열 hex 값.
//
// primitive 는 CSS 변수로 출력되지 않는다 — 어디까지나 내부 팔레트다.
// CSS 변수(`--color-*`)가 되는 것은 아래 semantic 토큰뿐이다(STEP 1-3).
const primitive = {
  white: "#ffffff",
  black: "#000000",

  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
  blue: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },
  green: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },
  red: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },
} as const;

// ── 2) Semantic (의미) 토큰 — 역할 ──────────────────────────────────

/**
 * 의미 토큰이 가져야 할 "역할 집합".
 *
 * light / dark 두 테마가 *반드시* 동일한 키를 갖도록 이 타입으로 강제한다
 * (아래 `satisfies`). 한쪽 테마에만 역할을 추가하는 실수를 컴파일 타임에 잡는다.
 *   → architecture.md 규칙 7: "같은 역할 이름, data-theme 에 따라 값만 교체"
 */
type SemanticTokens = {
  primary: string; // 주요 액션 · 브랜드
  danger: string; // 파괴적 액션 · 에러
  success: string; // 긍정 · 완료
  neutral: string; // 중립 액션 · 보조
  background: string; // 페이지 배경
  surface: string; // 카드 · 토스트 등 떠 있는 표면
  foreground: string; // 기본 텍스트(전경) 색
  muted: string; // 보조 텍스트 · 설명문
  border: string; // 테두리 · 구분선
};

/**
 * light / dark 두 세트. 역할 이름은 동일, 값만 다르다.
 * STEP 1-3 에서 light → `:root`, dark → `[data-theme="dark"]` 블록으로 출력되어
 * data-theme 토글만으로 색이 교체된다 (컴포넌트 코드는 수정 불필요).
 *
 * `as const satisfies {...}` 의 의미:
 *  - `as const`  → 값을 읽기 전용 + 리터럴 타입("#3b82f6")으로 고정.
 *  - `satisfies` → 객체가 SemanticTokens 형태(9개 역할, 모두 string)를 만족하는지
 *                  검사하되, `as const` 로 좁혀진 리터럴 타입은 그대로 보존한다.
 */
const semantic = {
  light: {
    primary: primitive.blue[500],
    danger: primitive.red[500],
    success: primitive.green[500],
    neutral: primitive.gray[600],
    background: primitive.gray[50],
    surface: primitive.white,
    foreground: primitive.gray[900],
    muted: primitive.gray[500],
    border: primitive.gray[200],
  },
  dark: {
    primary: primitive.blue[300],
    danger: primitive.red[400],
    success: primitive.green[400],
    neutral: primitive.gray[400],
    background: primitive.gray[900],
    surface: primitive.gray[800],
    foreground: primitive.gray[50],
    muted: primitive.gray[400],
    border: primitive.gray[700],
  },
} as const satisfies { light: SemanticTokens; dark: SemanticTokens };

/** 통합 컬러 토큰 — primitive(팔레트) + semantic(역할). */
export const colors = {
  primitive,
  semantic,
} as const;

/** 전체 컬러 토큰 객체의 타입. */
export type Colors = typeof colors;

/** semantic 역할 이름의 유니온 — "primary" | "danger" | ... (컴포넌트 prop 등에서 재사용). */
export type SemanticColorRole = keyof SemanticTokens;
