# Phase 4 — 엣지케이스 수정 기록

> `edgecase-review` 스킬에서 ⚠️ WARN / ❌ FAIL 로 발견된 항목을 기록한다.
> Phase 4 의 모든 STEP 이 이 파일을 공유한다.
> 최초 작성: 2026-05-22 (STEP 4-1 검토).

---

#### STEP 4-1 — Vitest + Testing Library + vitest-axe 테스트 환경 세팅

##### ⚠️ vitest-axe 0.1.0 의 빌드 산출물 결함 — `extend-expect` 진입점이 동작 안 함

**Problem**: `phases.md` STEP 4-1 명세는 `vitest.setup.ts` 에서
`import "vitest-axe/extend-expect"` 로 접근성 매처(`toHaveNoViolations`)를 등록하라고
한다. 그러나 vitest-axe 0.1.0(유일하게 배포된 버전)은 빌드 산출물이 결함이 있어 이
진입점이 **두 가지로 깨져 있다**.

1. **런타임 결함** — `dist/extend-expect.js` 가 **빈 파일**이다. 따라서
   `import "vitest-axe/extend-expect"` 는 아무것도 실행하지 않고, `toHaveNoViolations`
   매처가 `expect` 에 등록되지 않는다 → 테스트 실행 시 `Invalid Chai property:
   toHaveNoViolations` 에러.
2. **타입 결함** — `dist/extend-expect.d.ts` 는 obsolete 한 `declare global {
   namespace Vi { interface Assertion ... } }` 패턴으로 타입을 augment 한다. Vitest 3
   은 `declare module "vitest"` 의 `interface Assertion` / `AsymmetricMatchersContaining`
   을 읽으므로(jest-dom 의 `@testing-library/jest-dom/vitest` 가 쓰는 방식),
   `namespace Vi` augment 는 Vitest 3 에 적용되지 않는다.

추가로, 우회로 후보인 루트 진입점 `vitest-axe/matchers` 도 타입이 깨져 있다 —
패키지 루트의 `matchers.d.ts` 가 `export type * from "./dist/matchers"` 로 선언돼,
**런타임 함수인 `toHaveNoViolations` 까지 "타입 전용" export 로 취급**된다
(`error TS1362: 'toHaveNoViolations' cannot be used as a value`).

**Before** (명세 그대로 — 동작 안 함):
```ts
// vitest.setup.ts
import "@testing-library/jest-dom";
import "vitest-axe/extend-expect";   // dist/extend-expect.js 가 빈 파일 → 등록 안 됨
```

**After** (실제 구현 — `dist/matchers.js` 에서 직접 등록):
```ts
// vitest.setup.ts
import { expect } from "vitest";
// 루트 "vitest-axe/matchers" 가 아니라 dist 경로에서 직접 — 루트 .d.ts 의
// `export type *` 결함을 우회해 함수가 값으로 올바르게 타이핑된다.
import { toHaveNoViolations, type AxeMatchers } from "vitest-axe/dist/matchers.js";

import "@testing-library/jest-dom/vitest";   // 이쪽은 정상 (런타임·타입 모두)
expect.extend({ toHaveNoViolations });

// 타입 짝 — Vitest 3 의 매처 인터페이스로 직접 augment (jest-dom/vitest 와 동일 패턴)
declare module "vitest" {
  interface Assertion<T = any> extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
```

**Why**: CLAUDE.md 가 `jest-axe` 사용을 금지(`vitest-axe` 만 허용)하므로 패키지 교체는
불가 — 결함을 우회한다. 매처 함수 자체(`dist/matchers.js`)는 런타임·타입 모두 정상이라,
깨진 진입점(`extend-expect`)·깨진 루트 타입 shim(`matchers.d.ts`)을 건너뛰고 `dist`
경로에서 직접 가져와 `expect.extend` 로 수동 등록한다. 타입 augment 도 obsolete 한
`namespace Vi` 대신 Vitest 3 표준인 `declare module "vitest"` 로 직접 작성했다.
검증: 스모크 테스트 4/4 통과 + `tsc` 클린.

⚠️ 잔여 한계: `vitest-axe/dist/matchers.js` 는 패키지 `dist` 내부로의 deep import 다.
vitest-axe 0.1.0 은 `exports` 필드가 없어 현재는 문제없이 해석되지만, 향후 vitest-axe
가 결함을 고치며 `exports` 필드를 추가하면 이 deep 경로가 막힐 수 있다. 그 경우
업그레이드 시 `vitest-axe/extend-expect`(정상화됐다면)로 되돌리면 된다.

##### ⚠️ jsdom 은 canvas 를 구현하지 않음 — axe 의 색 대비(color-contrast) 검사 불가

**Problem**: 테스트 실행 시 stderr 에 다음 경고가 출력된다:
`Not implemented: HTMLCanvasElement's getContext() method`.
axe-core 의 `color-contrast` 규칙은 픽셀 색을 읽기 위해 `<canvas>` 를 사용하는데,
jsdom 은 canvas 렌더링을 구현하지 않는다(`canvas` npm 패키지 — 무거운 네이티브
의존성 — 를 설치해야 동작). 결과적으로 **jsdom 환경의 vitest-axe 테스트는
색 대비 위반을 잡지 못한다**(해당 규칙은 incomplete 처리되어 skip 된다).

**Before / After**: 코드 변경 없음 — 환경적 한계의 기록이다.

**Why**: 이 한계는 STEP 4-3(vitest-axe 접근성 테스트) 설계에 직접 영향을 준다.
`docs/edgecase/phase-3.md` STEP 3-1 의 잔여 한계 메모는 "light 테마 solid primary
버튼의 대비(~3.9:1, WCAG AA 미만)를 STEP 4-3 의 vitest-axe 에서 재확인" 한다고
적었으나, **jsdom + axe 로는 색 대비를 검증할 수 없다**. 따라서:
- STEP 4-3 의 `toHaveNoViolations` 는 color-contrast 외의 위반(레이블 누락, role,
  aria 등)만 신뢰성 있게 검사한다 — 이것이 단위 접근성 테스트의 정상 범위다.
- 색 대비 검증이 꼭 필요하면 별도 수단(브라우저 기반 axe, Storybook a11y addon,
  수동 대비 계산)으로 분리해야 한다 — MVP 범위 밖.
경고 자체는 무해하므로 `canvas` 패키지는 설치하지 않는다(네이티브 빌드 의존성
추가는 비용 대비 이득이 없다).

##### ⚠️ 라이브러리 CSS 빌드가 `*.test.tsx` 를 스캔 — STEP 4-2 에서 테스트 클래스 누출 위험

**Problem**: `src/library.css` 는 `@source not "**/*.stories.tsx"` 로 **스토리 파일만**
Tailwind 스캔에서 제외한다(STEP 2-4 의 CSS 누출 수정). 그러나 CLAUDE.md 테스트 정책은
테스트 파일을 컴포넌트 옆에 두도록 규정한다(`Button.tsx` → `Button.test.tsx`).
STEP 4-2 에서 `src/` 에 `*.test.tsx` 파일이 생기면, 라이브러리 빌드의 Tailwind 스캐너가
그 파일들을 읽어 **테스트 전용 유틸리티 클래스가 `dist/styles.css` 로 누출**된다 —
STEP 2-4 의 스토리 누출과 동일한 종류의 버그다. STEP 4-1 시점에는 테스트 파일이 0개라
아직 실제 누출은 없다(예방적 발견).

**Before** (`src/library.css` — 현재):
```css
@import "./theme.css";
@source not "**/*.stories.tsx";
```

**After** (STEP 4-2 진입 시 적용 권장):
```css
@import "./theme.css";
@source not "**/*.stories.tsx";
@source not "**/*.test.ts";
@source not "**/*.test.tsx";
```

**Why**: `library.css` 는 라이브러리 배포용 진입 CSS 이고, 테스트 파일은 배포 산출물과
무관하다 — 스토리 파일과 똑같이 스캔에서 제외해야 한다. `@source not` 은 공유
`theme.css` 가 아니라 라이브러리 진입 파일(`library.css`)에만 둔다(Storybook 은
`theme.css` 를 직접 쓰므로 영향 없음 — STEP 2-4 결정과 동일). 이 수정은 STEP 4-2 가
첫 테스트 파일을 추가하기 전(또는 함께) 적용한다.
