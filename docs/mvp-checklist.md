# MVP Checklist — 진행 추적

> 작업할 때마다 완료된 항목을 체크한다.
> MVP 목표 = Phase 0~4 (1·2순위 컴포넌트) + Phase 5의 CI까지.
> 최종 갱신: 2026-05-22 — Phase 2 STEP 2-3·2-5 완료 (Box / Flex / Stack 컴포넌트).

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
- [ ] Storybook 10 세팅 (react-vite 프레임워크)
- [ ] Storybook: theme.css 로드 (tokens.css 포함)
- [ ] Storybook: 글로벌 데코레이터 + toolbar 다크모드 토글
- [ ] Box 스토리
- [x] Flex / Stack
- [ ] Flex/Stack 스토리
- [ ] 검증: Storybook에서 토큰 색 렌더 + 다크모드 토글 동작

## Phase 3 — 핵심 컴포넌트
- [ ] cva(class-variance-authority) 설치
- [ ] Button (1) — variant/color/size (cva 활용)
- [ ] Button (2) — loading/disabled/a11y (aria-busy, focus-visible)
- [ ] Button — headless(useButton) 분리 + ToggleButton *(선택, 시간 되면)*
- [ ] TextInput (1) — Controlled, label/error/helper, 접근성
- [ ] TextInput (2) — left/right Addons
- [ ] Toast — Provider + useToast + UI + aria-live
- [ ] 각 컴포넌트 Storybook 스토리
- [ ] 검증: 전 컴포넌트 동작 + 다크모드

## Phase 4 — 테스트
- [ ] Vitest + Testing Library + vitest-axe 세팅 (jsdom 환경, happy-dom 금지)
- [ ] vitest.setup.ts: @testing-library/jest-dom + vitest-axe/extend-expect
- [ ] Button 단위 테스트
- [ ] TextInput 단위 테스트
- [ ] 접근성 테스트 (vitest-axe, 주요 컴포넌트)
- [ ] 검증: `pnpm --filter @my-ds/ui test` 전체 통과

## Phase 5 — 문서화 & CI/CD
- [ ] Storybook autodocs/MDX 문서 (Button/TextInput/Toast)
- [ ] GitHub Actions ci.yml (Node 20, install→build→test)
- [ ] (선택) 배포 준비 (publishConfig, files, dry-run)
- [ ] 검증: CI 초록불

---

## MVP 이후 (선택 / 백로그)
- [ ] Button headless(useButton) 분리 — Phase 3에서 건너뛴 경우
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
