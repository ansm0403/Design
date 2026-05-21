/**
 * 토큰 Object → CSS 변수 문자열 생성기.
 *
 * "Object 가 진실, CSS 는 파생물" 원칙의 구현체.
 * 손으로 CSS 변수를 적으면 Object 와 동기화가 깨지므로, 토큰 Object 를
 * 받아 CSS 텍스트를 만들어내는 이 함수를 단일 생성 경로로 둔다.
 *   → Immutable Rule 4: CSS 변수는 이 함수로만 생성한다(수기 금지).
 */

// 타입만 import 한다 — generate-css 는 토큰의 "값"에 런타임 의존하지 않는다.
// 실제 토큰 값은 호출부(scripts/build-css.ts)가 인자로 주입한다.
import type { Colors } from "./colors";
import type { Typography } from "./typography";
import type { Shadow } from "./shadow";
import type { Radius } from "./radius";

/**
 * generateCss 의 입력 — 모든 토큰 그룹을 한 객체로 받는다.
 *
 * 위치 인자 대신 객체 인자를 쓰는 이유: 토큰 그룹이 늘어나도(타이포·shadow·radius)
 * 호출 순서를 혼동할 일 없이 키만 추가하면 된다.
 */
type GenerateCssInput = {
  colors: Colors;
  typography: Typography;
  shadow: Shadow;
  radius: Radius;
};

/**
 * camelCase → kebab-case 변환 (예: someKey → some-key).
 *
 * 토큰 키를 CSS 변수명으로 쓸 때 kebab 으로 정규화한다 — CSS·Tailwind 의 관례가
 * kebab 이기 때문. 현재 토큰 키는 모두 소문자 단어라 실제 변환은 일어나지 않지만,
 * 이후 camelCase 키가 추가돼도 CSS 출력이 관례를 따르도록 방어적으로 둔다.
 */
const toKebabCase = (s: string): string =>
  s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

/**
 * 평탄한 { 키: 값 } 레코드를 CSS 변수 선언 줄 묶음으로 변환한다.
 * 키는 kebab-case 로 정규화되고, 각 줄은 2칸 들여쓰기된다.
 *
 * @param vars   역할(또는 단계) → 값 레코드. 예: { primary: "#3b82f6" }
 * @param prefix 변수명 접두사. 예: "--color-"
 */
const declarations = (vars: Record<string, string>, prefix: string): string =>
  Object.entries(vars)
    .map(([key, value]) => `  ${prefix}${toKebabCase(key)}: ${value};`)
    .join("\n");

/** CSS 선택자 블록으로 감싼다. `selector { ...body... }` */
const block = (selector: string, body: string): string =>
  `${selector} {\n${body}\n}`;

/**
 * 전체 토큰 Object → CSS 변수 문자열.
 *
 * - color(light) · typography · shadow · radius → `:root { ... }`
 *   (typography/shadow/radius 는 light/dark 구분이 없어 `:root` 한 곳에만 출력)
 * - color(dark) → `[data-theme="dark"] { ... }`  (data-theme 토글 시 색만 교체)
 *
 * 두 블록의 color 변수는 같은 이름(`--color-primary` 등)을 쓰고 값만 다르다.
 * → 컴포넌트는 light/dark 를 의식하지 않는다 (architecture.md 규칙 7).
 */
export function generateCss(tokens: GenerateCssInput): string {
  const { colors, typography, shadow, radius } = tokens;
  const { light, dark } = colors.semantic;
  const { fontSize, fontWeight, lineHeight } = typography;

  // typography/shadow/radius 는 테마 무관 → light 컬러와 함께 `:root` 한 블록에.
  const rootBody = [
    declarations(light, "--color-"),
    declarations(fontSize, "--font-size-"),
    declarations(fontWeight, "--font-weight-"),
    declarations(lineHeight, "--line-height-"),
    declarations(shadow, "--shadow-"),
    declarations(radius, "--radius-"),
  ].join("\n");

  return [
    "/* 이 파일은 generate-css.ts 에서 자동 생성됩니다. 직접 수정하지 마세요. */",
    "",
    block(":root", rootBody),
    "",
    block('[data-theme="dark"]', declarations(dark, "--color-")),
    "",
  ].join("\n");
}
