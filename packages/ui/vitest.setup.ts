// vitest.config.ts 의 setupFiles 로 지정 — 모든 테스트 파일 실행 전에 한 번 로드된다.
// 커스텀 매처(matcher)를 expect 에 등록한다.
import { expect } from "vitest";
// ⚠️ "vitest-axe/matchers"(루트 진입점)가 아니라 "dist/matchers.js" 에서 직접 가져온다.
//    루트의 matchers.d.ts 는 `export type *` 로 선언돼 있어, 런타임 함수인
//    toHaveNoViolations 까지 "타입 전용" 으로 취급된다(TS1362 — 값으로 못 씀).
//    dist 의 .d.ts 는 일반 export 라 함수가 값으로 올바르게 타이핑된다.
import { toHaveNoViolations, type AxeMatchers } from "vitest-axe/dist/matchers.js";

// toBeInTheDocument / toHaveAttribute 등 DOM 매처 등록.
// "/vitest" 진입점: Vitest 의 expect 에 매처와 타입(declare module "vitest")을
// 함께 확장하는 공식 경로다.
import "@testing-library/jest-dom/vitest";

// vitest-axe 접근성 매처(toHaveNoViolations) 등록.
// ⚠️ vitest-axe 0.1.0 의 "vitest-axe/extend-expect" 진입점은 쓰지 않는다 —
//    빌드 산출물 dist/extend-expect.js 가 빈 파일이라 런타임 등록이 안 되고,
//    그 .d.ts 는 obsolete 한 `namespace Vi` 를 augment 해 Vitest 3 에 안 먹는다.
//    matchers 모듈에서 매처를 직접 가져와 expect.extend 로 등록한다.
expect.extend({ toHaveNoViolations });

// 위 expect.extend 의 타입 짝 — jest-dom/vitest 와 동일하게 Vitest 3 의 매처
// 인터페이스(declare module "vitest")를 확장해 toHaveNoViolations 타입을 노출한다.
// ⚠️ Assertion 의 타입 파라미터 <T = any> 는 다른 augmentation(jest-dom/vitest 등)·
//    Vitest 원본 선언과 글자 그대로 같아야 interface 병합이 된다.
declare module "vitest" {
  interface Assertion<T = any> extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
