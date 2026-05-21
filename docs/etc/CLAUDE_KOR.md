
# 한국어 번역본 (Korean Translation)

## 필수조건

설계 생성·변경, STEP 구현, 문서 갱신 등 이 프로젝트의 실질 작업을 수행할 때는,
답변을 "지침에 의거하여 답변할게" 로 시작해 이 파일을 적용 중임을 표시한다.
지침이 적용되지 않는 단순 개념 질문·잡담에는 생략한다.

## 프로젝트

**디자인 시스템 모노레포** — 디자인 토큰 + 재사용 가능한 UI 컴포넌트 라이브러리.
학습용으로 만들지만 현업 수준의 코드 품질을 지향한다. 모든 컴포넌트를 망라하지 않고,
가장 자주 쓰이는 핵심 컴포넌트에 집중한다.

엄격하게 층위가 나뉜 두 패키지:
- `@my-ds/tokens` — 디자인 값을 CSS 변수로 (React 없음, 런타임 의존성 없음)
- `@my-ds/ui` — 토큰을 소비하는 React 컴포넌트 라이브러리

## 사용자 컨텍스트

- **경험 있음**: React, TypeScript, 상태 관리, 프론트엔드 개발
- **처음 다룸**: 디자인 시스템, 모노레포, pnpm workspaces, Tailwind v4(CSS-first),
  tsdown, Storybook, 라이브러리 배포
- "처음 다룸" 항목을 설명할 때는 초심자 친화적으로 설명하고, 자명하지 않은 개념
  (peerDependency, `sideEffects`, `workspace:*`, polymorphic 컴포넌트, `forwardRef`,
  headless 패턴)은 코드에 짧은 주석을 단다.
- 사용자는 STEP들을 학습 과정으로 따라간다. 연관된 여러 STEP을 한 배치로 묶어
  구현하는 것은 정상(워크플로 규칙 참고) — 다만 합의된 범위를 넘거나 사용자
  확인을 건너뛰지 않는다. 전 과정에 동일한 엔지니어링 기준(올바른 타이핑,
  접근성, 빌드 정확성)을 적용하되, 과한 설계(성급한 추상화, 추측성 일반화)는
  피한다.

## 기술 스택 (핵심)

| 영역 | 선택 | 비고 |
|---|---|---|
| 패키지 매니저 | pnpm 10.x (workspaces) | 모노레포, 별도 도구 불필요 |
| 언어 | TypeScript 5+ | strict 모드 |
| 번들러 | tsdown 0.20.x | Rolldown 기반, React·dts 내장 |
| 스타일 | Tailwind CSS v4.x | CSS-first(`@theme`), `tailwind.config.js` 없음 |
| 토큰 | CSS 변수 | `[data-theme]` 로 다크모드 |
| 미리보기 | Storybook 10.x | `@storybook/react-vite`, Node 20+ |
| 테스트 | Vitest 3.x + Testing Library + vitest-axe | jsdom 환경 |
| CI/CD | GitHub Actions | 빌드 + 테스트 |

**MVP에서 추가 금지** (사용자의 명시적 승인 없이):
- `config/` 패키지나 `tailwind.config.js` / PostCSS preset — Tailwind v4는 CSS-first.
- `jest-axe` (→ `vitest-axe` 사용), `happy-dom` (→ `jsdom` 사용).
- 3순위 컴포넌트 (Accordion, Select, Grid, List).
- Changesets, 별도 문서 사이트(nextra), 실제 npm 배포.

## 참조 문서

**CLAUDE.md(이 파일)가 단일 진입점이다.** 새 컨텍스트는 이 파일을 먼저 읽고,
여기서 아래 문서들로 라우팅된다. 매 세션 항상 로드된다.

| 파일 | 역할 | 갱신 시점 |
|---|---|---|
| `docs/architecture.md` | 설계 헌법 — 원칙·구조·기술 결정 | 설계 결정이 바뀔 때 (먼저 수정 후 코드) |
| `docs/phases.md` | Phase 0~5 STEP별 구현 지시서 | 구현 중 함정·노하우 발견 시 |
| `docs/mvp-checklist.md` | 진행 추적 + 작업 로그 | 매 STEP 완료 시 |
| `docs/for-claude-code.md` | 새 컨텍스트용 핸드오프 프롬프트 | 거의 고정 |

라우팅 단축:
- 구조적·멀티파일 변경 → `architecture.md` 를 먼저 읽는다.
- 사용자가 "STEP N" 을 언급 → `phases.md` 의 해당 STEP + `mvp-checklist.md`.
- 새 컨텍스트/모델로 인계 → `for-claude-code.md` 사용.

## 불변 규칙 (Immutable Rules)

절대 어겨선 안 된다. 요청이 이와 충돌하면 대안을 제시한다.

1. **의존성은 단방향**: `tokens → ui`. `tokens` 가 `ui` 를 import하면 절대 안 된다
   (순환 의존 = 빌드 지옥).
2. `@my-ds/tokens` 는 **런타임 의존성이 0** 이다 — React조차 모른다.
   순수 값 + 생성된 CSS 뿐이다.
3. 모든 디자인 값(색·간격·타이포)은 토큰으로만 정의한다.
   컴포넌트 안에 색·간격·폰트를 하드코딩하지 않는다.
4. CSS 변수는 `generate-css` 로만 생성한다. CSS 변수 파일을 손으로 작성하지 않는다 —
   토큰 Object가 단일 진실의 원천이고, CSS는 파생물이다.
5. `react` / `react-dom` 은 `@my-ds/ui` 의 **peerDependency** 다. 절대 `dependencies`
   가 아니다 (React가 번들에 포함되면 사용처에서 React 중복 → "Invalid hook call" 에러).
6. Tailwind v4는 **CSS-first** 를 유지한다. `tailwind.config.js` 나 preset 파일을
   만들지 않는다. 토큰↔Tailwind 연결은 `packages/ui/src/theme.css` 의 `@theme` 에 둔다.
7. semantic 토큰은 **단일 키**(`primary`, `danger`, …)로 노출한다.
   컴포넌트는 light/dark를 의식해선 안 된다 — CSS 변수 값만 교체된다.
8. MVP 스코프(Phase 0~5, 1·2순위 컴포넌트)를 사용자 승인 없이 확장하지 않는다.

## 워크플로 규칙

- **기본 실행 모드는 다중 Step(배치)이다.** 연관된 Step들을 묶어 한 번에
  구현하는 것이 기본값 — 시간과 토큰을 아끼기 위한 원칙이다.
- 단독 Step 진행(하나씩)은 해당 Step이 정말로 크거나, 위험하거나, 복잡하거나,
  프로젝트의 중요한 부분과 관련된 경우에만 사용한다. 단독 Step은 예외이지
  기본이 아니다.
- 작업 전 어떤 모드인지 밝힌다. 배치는 전제이므로 별도 설명이 필요 없고,
  단독 Step을 선택할 때만 한 줄짜리 사유를 덧붙인다.
- 여러 Step을 배치로 완료하거나(혹은 단독 Step 하나를 완료하거나) 멈추고
  작업 내용을 요약한 뒤 사용자 확인을 기다린다.
- 단일 Phase 안에서는 배치를 자유롭게 묶는다. 여러 Phase를 하나의 배치로
  묶는 것은 합산 범위가 작고 위험도가 낮으며 명확히 관리 가능한 경우에만 허용.
- 멀티파일·아키텍처 변경 전에는 짧은 계획을 제시하고 승인을 기다린다.
- 설계 결정이 바뀌면 `architecture.md` 를 먼저 수정하고 코드를 바꾼다.
- STEP 완료 시: `mvp-checklist.md` 항목을 체크하고 작업 로그를 남긴다.
- 구현 중 발견한 함정·노하우는 `phases.md` 의 해당 STEP에 주석으로 기록한다.
- 모든 패키지의 `package.json` 은 `"sideEffects": ["*.css"]` 를 선언하고, CSS는
  `exports` 필드로 노출한다 — 자동 주입에 의존하지 않는다.
- 패키지 스크립트가 필요하면 명령을 추측하지 말고 `package.json` 을 확인한다.
- 새 라이브러리 설치 전 최신 안정 버전과 기존 스택과의 호환성을 확인한다.
- 무관한 파일 편집을 피한다. 현재 STEP 스코프 안에 머문다.
- 버전·설정이 불확실하면 단정하지 않는다 — 먼저 확인한다. 막히면 임의로 진행하지
  말고 선택지를 제시하고 사용자에게 묻는다.

## 에러 & 엣지 케이스 기본값

- `package.json` 의 `exports` 경로는 실제 `dist` 출력과 반드시 일치해야 한다.
  가정하지 말고 `build` 스크립트를 실행해 `dist` 를 확인한다.
- 컴포넌트는 잘못되거나 누락된 prop에 크래시하지 않는다 — 합리적 기본값으로 fallback.
- 모든 인터랙티브 컴포넌트는 키보드 조작과 ARIA 속성을 기본 제공한다.
- 빌드 산출물(`dist/`)은 gitignore 대상. 검증은 빌드 명령 출력으로 한다.

## 테스트 정책

- 도구: **Vitest 3 + @testing-library/react + vitest-axe**. 환경은 **jsdom**
  (happy-dom은 axe-core와 비호환).
- Phase 4에서 도입한다. 그 전에는 테스트를 작성하지 않는다.
- 구현 디테일이 아니라 **동작**을 테스트한다: 클릭, `onChange`, 상태 전환,
  접근성(`vitest-axe` → `toHaveNoViolations`).
- 사용자 관점 쿼리를 우선한다: `getByRole`, `getByLabelText`.
- 테스트 파일은 컴포넌트 옆에 둔다: `Button.tsx` → `Button.test.tsx`.
- STEP별 테스트 범위는 `phases.md` 의 Phase 4 참조.

## 커밋 컨벤션

Conventional commits 사용: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`.
가능하면 각 커밋을 하나의 STEP 범위로 유지한다.
