/**
 * @my-ds/tokens 공개 진입점.
 *
 * 모든 토큰 Object(colors·typography·shadow·radius)와 CSS 생성 함수
 * generateCss, 그리고 관련 타입을 여기서 통합 export 한다.
 *
 * 타입은 `export type` 로 분리한다 — tsconfig 의 `isolatedModules` 가 켜져 있어
 * 값과 타입을 한 구문으로 섞어 re-export 하면 안전하지 않다.
 *
 * CSS 변수 파일(tokens.css)은 코드가 아니라 빌드 산출물이므로 여기서 export
 * 하지 않는다 — package.json 의 `exports["./styles.css"]` 가 별도로 노출한다.
 */

export { colors } from "./colors";
export type { Colors, SemanticColorRole } from "./colors";

export { typography } from "./typography";
export type { Typography } from "./typography";

export { shadow } from "./shadow";
export type { Shadow } from "./shadow";

export { radius } from "./radius";
export type { Radius } from "./radius";

export { generateCss } from "./generate-css";
