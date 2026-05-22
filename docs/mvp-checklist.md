# MVP Checklist — 진행 추적

> 작업할 때마다 완료된 항목을 체크한다.
> MVP 목표 = Phase 0~4 (1·2순위 컴포넌트) + Phase 5의 CI까지.
> 최종 갱신: 2026-05-22 — Phase 4 STEP 4-2·4-3 배치 완료 (Button·TextInput 단위 테스트 +
>   Button·TextInput·Toast axe 접근성 테스트, 17/17 통과). 선행: library.css @source not 보강.

---

## Phase 0 — 프로젝트 뼈대
- [x] Node 20+, pnpm 9+ 버전 확인 (Node 20.19.0, pnpm 10.33.4)
- [x] 루트 package.json (private: true, type: module, packageManager, engines.node)
- [x] pnpm-workspace.yaml (packages/*)
- [x] tsconfig.base.json (declaration: true, jsx: react-jsx, moduleResolution: Bundler)
- [x] .gitignore
- [x] `pnpm install` 정상 (pnpm-lock.yaml 생성)

## Phase 1 — 토큰 패키지
- [x] packages/tokens 생성 (package.json, tsconfig, tsdown.config)
- [x] package.json exports: JS + CSS 진입점, sideEffects: ["*.css"]
- [x] colors.ts — primitive + semantic(light/dark) 2단계 구조
- [x] generate-css.ts — Object → CSS 변수 문자열 생성 함수
- [x] scripts/build-css.ts — dist/tokens.css 파일 생성 스크립트
- [x] 다크모드 — light(:root) / dark([data-theme="dark"]) 두 세트
- [x] typography.ts — fontSize/fontWeight/lineHeight 스케일
- [x] shadow.ts, radius.ts
- [x] index.ts 통합 export
- [x] 빌드 검증: dist에 index.js + index.d.ts + tokens.css 생성, 전 변수 포함

## Phase 2 — UI 기반
- [x] packages/ui 뼈대 (package.json, tsconfig, tsdown.config)
- [x] package.json: React peerDep, tokens workspace 의존, sideEffects: ["*.css"]
- [x] package.json exports: JS + CSS 진입점
- [x] Tailwind v4 설치 (@tailwindcss/cli — vite 플러그인은 tsdown 비호환)
- [x] theme.css: @import tailwindcss + tokens.css + @theme inline { CSS변수 매핑 }
- [x] 빌드 검증: dist/styles.css 에 토큰 기반 유틸리티 클래스 포함 (probe 로 확인)
- [x] clsx + tailwind-merge 설치, cn() 유틸 함수 생성
- [x] Box (polymorphic as, forwardRef, cn() 기반 className 병합)
- [x] Storybook 10 세팅 (react-vite 프레임워크)
- [x] Storybook: theme.css 로드 (tokens.css 포함)
- [x] Storybook: 글로벌 데코레이터 + toolbar 다크모드 토글
- [x] Box 스토리
- [x] Flex / Stack
- [x] Flex/Stack 스토리
- [x] 검증: Storybook에서 토큰 색 렌더 + 다크모드 토글 동작 *(사용자 시각 확인 완료)*

## Phase 3 — 핵심 컴포넌트
- [x] cva(class-variance-authority) 설치
- [x] Button (1) — variant/color/size (cva 활용)
- [x] Button (2) — loading/disabled/a11y (isLoading 스피너, aria-busy, focus-visible ring, aria-disabled)
- [x] Button — headless(useButton) 분리 + ToggleButton *(선택 항목이었으나 완료됨)*
- [x] TextInput (1) — Controlled, label/error/helper, 접근성 (useId, aria-invalid/describedby)
- [x] TextInput (2) — left/right Addons (Flex 기반)
- [x] Toast — Provider + useToast + UI + aria-live (자동소멸 타이머, info=primary 재사용)
- [x] 각 컴포넌트 Storybook 스토리 (Button/TextInput/Toast + ToggleButton)
- [x] 검증: 전 컴포넌트 동작 + 다크모드 *(tsc·build 통과 / Storybook·다크모드 토글 사용자 시각 확인 완료)*

## Phase 4 — 테스트
- [x] Vitest 3.2.4 + Testing Library + vitest-axe 세팅 (jsdom 환경, happy-dom 금지)
- [x] vitest.setup.ts: @testing-library/jest-dom/vitest + vitest-axe 매처 수동 등록 *(extend-expect 결함 우회 — phase-4.md)*
- [x] Button 단위 테스트
- [x] TextInput 단위 테스트
- [x] 접근성 테스트 (vitest-axe, 주요 컴포넌트)
- [x] 검증: `pnpm --filter @my-ds/ui test` 전체 통과 *(vitest run 17/17)*

## Phase 5 — 문서화 & CI/CD
- [x] Storybook autodocs/MDX 문서 (Button/TextInput/Toast)
- [x] GitHub Actions ci.yml (Node 20, install→build→test→build-storybook)
- [ ] (선택) 배포 준비 (publishConfig, files, dry-run)
- [ ] 검증: CI 초록불 *(push 후 사용자 확인 대기)*

---

## MVP 이후 (선택 / 백로그)
- [x] ~~Button headless(useButton) 분리~~ — 건너뛰지 않고 Phase 3 STEP 3-3 에서 완료
- [ ] Accordion (ARIA 심화)
- [ ] Select Input
- [ ] Grid
- [ ] List
- [ ] Tailwind prefix 옵션 + tree-shaking 문제 해결
- [ ] 비주얼 회귀 테스트
- [ ] 별도 문서 사이트 (nextra 등)
- [ ] 실제 npm 배포

---

## 진행 로그 (작업하며 기록)
> 날짜 / 완료한 것 / 막힌 것 / 다음 할 것 을 간단히 남긴다.

- 2026-05-21 | 설계 검토 완료, 문서 v2 갱신 | — | Phase 0 시작
- 2026-05-21 | Phase 0 완료 (뼈대 + pnpm install) | pnpm 11.1.3 업데이트 알림 (10.33.4 유지) | Phase 1 시작 예정
- 2026-05-22 | Phase 1 STEP 1-1 완료 (tokens 패키지 뼈대 + 빌드 검증) | tsdown 0.22+ 가 Node 22+ 요구 → 0.21.10 채택 / tsdown 기본 .mjs 출력 → fixedExtension:false 로 .js 전환 | STEP 1-2 (컬러 토큰 Object) 예정
- 2026-05-22 | Phase 1 STEP 1-2 완료 (colors.ts — primitive 6팔레트 + semantic 9역할 ×2테마, tsc·런타임 검증) | — | STEP 1-3 (Object→CSS 생성기) 예정
- 2026-05-22 | STEP 1-1·1-2 edgecase-review 수행 (FAIL 0, WARN 2) | clean 빌드순서 충돌 / textMuted kebab 변환 → docs/edgecase/phase-1.md 기록 | STEP 1-3 진입 시 WARN 2건 우선 반영
- 2026-05-22 | Phase 1 STEP 1-3 완료 (generate-css.ts + scripts/build-css.ts, tokens.css 생성·전체 빌드 검증) | build-css 의 node 빌트인 import 로 @types/node 필요 → tokens devDep 추가 / W1·W2 반영 완료 | STEP 1-4 (다크모드 시각 검증) 예정
- 2026-05-22 | STEP 1-3 edgecase-review 수행 (FAIL 0, WARN 0, 신규 edgecase 기록 없음) | — | STEP 1-4 예정
- 2026-05-22 | Phase 1 STEP 1-4 완료 (test-dark.html 생성, 다크모드 시각 검증 통과) | — | STEP 1-5 (타이포그래피) 예정
- 2026-05-22 | STEP 1-4 edgecase-review 수행 (FAIL 0, WARN 0, 신규 edgecase 기록 없음) | — | STEP 1-5 예정
- 2026-05-22 | Phase 1 STEP 1-5·1-6 배치 완료 (typography·shadow·radius 토큰, generate-css 4-key 확장, index.ts 통합 export, 빌드 검증) | — | Phase 1 종료 → Phase 2 시작 예정
- 2026-05-22 | STEP 1-5·1-6 edgecase-review 수행 (FAIL 0, WARN 0, 신규 edgecase 기록 없음) | — | Phase 2 (ui 패키지) 예정
- 2026-05-22 | Phase 2 STEP 2-1 완료 (ui 패키지 뼈대 — package.json/tsconfig/tsdown.config/빈 index.ts, pnpm install·빌드·tsc 검증) | tsdown 0.21.x 에서 `external` deprecated → `deps.neverBundle` 로 작성 | STEP 2-2 (Tailwind v4 연결) 예정
- 2026-05-22 | STEP 2-1 edgecase-review 수행 (FAIL 0, WARN 1) | react/react-dom peerDep 만 선언·devDep 없음 → STEP 2-3 진입 시 설치 필요, docs/edgecase/phase-2.md 기록 | STEP 2-2 예정
- 2026-05-22 | Phase 2 STEP 2-2 완료 (Tailwind v4 연결 — theme.css @theme inline, @tailwindcss/cli 별도 빌드, dist/styles.css 검증) | @tailwindcss/vite 가 tsdown 비호환(createResolver crash) → @tailwindcss/cli 2단계 빌드 전환, architecture.md §6 갱신 | STEP 2-3 (Box) 예정
- 2026-05-22 | STEP 2-2 edgecase-review 수행 (FAIL 0, WARN 2) | text/textMuted 역할명 → text-text 유틸리티 / theme.css @theme 목록 수동 유지 → docs/edgecase/phase-2.md 기록 | STEP 2-3 예정
- 2026-05-22 | STEP 2-2 후속: W1 해결 — tokens semantic 역할 text→foreground, textMuted→muted 개명 (사용자 결정), tokens·ui 재빌드·probe 검증 | — | STEP 2-3 (Box) 예정
- 2026-05-22 | STEP 2-1~2-2 + W1 통합 edgecase-review 재수행 (FAIL 0, WARN 2 — 모두 기존 문서화 항목, 신규 0) | W1 개명 정합성 확인, phase-2.md 수정 불필요 | STEP 2-3 예정
- 2026-05-22 | Phase 2 STEP 2-3·2-5 배치 완료 (cn 유틸 + Box/Flex/Stack 컴포넌트, react devDep·clsx·tailwind-merge 설치, 빌드·tsc·styles.css 유틸리티 검증) | 스토리는 STEP 2-4 로 이월(Storybook 미설치) | STEP 2-4 (Storybook 세팅 + Box/Flex/Stack 스토리 일괄 작성) 예정
- 2026-05-22 | STEP 2-3·2-5 edgecase-review 수행 (FAIL 0, WARN 1) | polymorphic+forwardRef 캐스팅으로 displayName 누락 → 캐스팅 전 설정으로 수정, docs/edgecase/phase-2.md 기록 | STEP 2-4 예정
- 2026-05-22 | Phase 2 STEP 2-4 완료 (Storybook 10.4 수동 세팅 + main.ts/preview.tsx + Box/Flex/Stack 스토리, library build·storybook build 검증) | storybook init 비대화형 실패(빌더 자동감지) → 수동 설치 / pnpm 빌드스크립트 차단 → onlyBuiltDependencies 설정 | 토큰색·다크모드 시각 확인은 사용자 대기 → Phase 3 예정
- 2026-05-22 | STEP 2-4 edgecase-review 수행 (FAIL 0, WARN 1) | 스토리 클래스가 라이브러리 dist/styles.css 로 누출 → src/library.css 분리(@source not)로 수정, docs/edgecase/phase-2.md 기록 | Phase 3 (핵심 컴포넌트) 예정
- 2026-05-22 | STEP 2-4 edgecase-review 재실행 (사용자 요청, FAIL 0, 신규 WARN 0) | CSS 누출 수정 검증 — dist/styles.css 스토리 클래스 0 재확인 / Storybook 동작 사용자 시각 확인 완료 → Phase 2 종료 | Phase 3 시작 예정
- 2026-05-22 | Phase 3 STEP 3-1 완료 (Button — variant/color/size, cva 설치·compoundVariants 9조합, 순수 button+forwardRef, Playground/AllCombinations 스토리, tsc·build·styles.css 검증) | solid 글자색을 문서 예시 text-white 대신 text-background 로 — 규칙3 위반·다크 대비 회피 (docs/edgecase/phase-3.md) | STEP 3-2 (loading/접근성) 예정
- 2026-05-22 | STEP 3-1 edgecase-review 수행 (FAIL 0, WARN 1) | text-white→text-background 결정 근거 docs/edgecase/phase-3.md 기록, architecture.md §6 예시 스니펫 정정은 사용자 판단 위임 | STEP 3-2 예정
- 2026-05-22 | STEP 3-1 edgecase-review 재실행 (사용자 요청, FAIL 0, WARN +1) | dist/styles.css 전수 검사 — cva `"outline"` 식별자가 Tailwind 스캐너에 잡혀 dead `.outline` 누출(수용) / 선재 누출 발견: cn.ts 주석의 따옴표 예시 → `.bg-blue-500`·`.bg-red-500` 배포 CSS 누출(Phase 2 파일, 후속 수정 권장). docs/edgecase/phase-3.md 갱신 | STEP 3-2 예정
- 2026-05-22 | Phase 3 STEP 3-2·3-3 완료 (git worktree `phase3/button`, 커밋 7530972 — Button 로딩/접근성 + headless useButton + ToggleButton) | worktree 작업이라 per-step 설계·진행 로그가 없었음 → 본 세션에서 코드 분석으로 phases.md 진행기록 역작성 | STEP 3-4 계속
- 2026-05-22 | Phase 3 STEP 3-4·3-5 완료 (git worktree `phase3/textinput`, 커밋 82fd8bd — TextInput Controlled + label/error/helper + 좌우 Addon) | TextInput 이 처음부터 addon 포함해 작성 → 3-4·3-5 가 한 커밋 | STEP 3-6 계속
- 2026-05-22 | Phase 3 STEP 3-6 완료 (git worktree `phase3/toast`, 커밋 f39eb33 — ToastProvider/useToast/Toast, aria-live, 자동소멸 타이머) | 계획과 달리 info 전용 토큰 미추가 → primary 토큰 재사용(tokens 무변경) | Phase 3 종료
- 2026-05-22 | STEP 3-1~3-6 문서 동기화 (코드 분석 기반: phases.md 진행기록 5건 역작성, mvp-checklist 항목 갱신, architecture.md §6 예시 text-white→text-background 정정) | tsc·build 검증 통과 / 다크모드 시각 확인은 사용자 대기 / edgecase-review 는 3-2~3-6 미수행 | Phase 4 (테스트) 예정
- 2026-05-22 | Phase 3 다크모드·Storybook 동작 사용자 시각 확인 완료 (검증 항목 체크) | — | —
- 2026-05-22 | STEP 3-2~3-6 edgecase-review 수행 (FAIL 1, WARN 1) | 로딩 버튼이 `invisible`(visibility:hidden) 탓에 accessible name 소실 → STEP 4-3 axe `button-name` 위반 예상(FAIL, Button.tsx) / disabled TextInput 이 addon 내부 인터랙티브 요소를 비활성화 못 함(WARN). docs/edgecase/phase-3.md 기록 | FAIL 수정(`invisible`→`opacity-0`) 적용 여부 사용자 확인 대기
- 2026-05-22 | STEP 3-2 FAIL 수정 완료 (Button.tsx `invisible`→`opacity-0`, 사용자 승인) — 로딩 중 버튼 accessible name 보존. tsc·build 재검증 통과 | WARN(disabled TextInput addon)은 문서화로 종결 | Phase 4 (테스트) 예정
- 2026-05-22 | Phase 4 STEP 4-1 완료 (Vitest 3.2.4 + RTL + vitest-axe + jsdom 세팅 — vitest.config.ts·vitest.setup.ts 신규, tsconfig types/include, test 스크립트, 임시 스모크 테스트로 4/4 검증 후 삭제) | vitest-axe 0.1.0 의 extend-expect 결함(빈 js + obsolete 타입) → dist/matchers.js deep import + 수동 expect.extend 로 우회 / Vitest 는 CLAUDE.md 핀대로 3.x 유지(최신 4.1.7 안 씀) | STEP 4-2·4-3 배치 예정
- 2026-05-22 | STEP 4-1 edgecase-review 수행 (FAIL 0, WARN 3) | vitest-axe 0.1.0 결함 우회 / jsdom canvas 미구현 → axe color-contrast 검사 불가(phase-3 의 4-3 재확인 계획에 영향) / library.css 가 *.test.tsx 도 스캔 → STEP 4-2 테스트 클래스 누출 위험 → docs/edgecase/phase-4.md 기록 | STEP 4-2 진입 시 library.css @source not 보강 후 4-2·4-3 배치
- 2026-05-22 | 선행+STEP 4-2·4-3 배치 완료 (library.css @source not 보강 [WARN 3 해결] + Button·TextInput 단위 5건씩 + Button·TextInput·Toast axe 접근성 — 17/17 통과, tsc·build 클린) | region best-practice 규칙 → <main> 래퍼로 해결(규칙 disable 불필요) / vitest-axe axe 는 루트 진입점 정상(deep import 불필요) / canvas stderr 경고는 무해(color-contrast skip 수용) | Phase 4 완료 → Phase 5 예정
- 2026-05-22 | STEP 4-2·4-3 edgecase-review 수행 (FAIL 0, WARN 0) | 신규 엣지케이스 없음 — phase-4.md 미수정 | —
- 2026-05-22 | Phase 5 STEP 5-1·5-2 배치 완료 (Button/TextInput/Toast MDX 문서 + .github/workflows/ci.yml, tsc·build·vitest 17/17 클린) | edgecase-review WARN 1 — Toast.mdx 미사용 Controls import → 즉시 수정, docs/edgecase/phase-5.md 신규 작성 | CI 초록불은 push 후 사용자 확인 / STEP 5-3 진행 여부 협의
- 2026-05-22 | STEP 5-1 사용자 검증 중 Storybook 빌드 실패 발견·수정 (커스텀 MDX + tags:["autodocs"] 공존 → SB10 인덱싱 충돌) | 세 CSF 에서 tags:["autodocs"] 제거 → build-storybook 성공 재확인, phase-5.md FAIL 기록 | MDX Docs 탭 시각 확인 사용자 대기
