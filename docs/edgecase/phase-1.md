# Phase 1 — 엣지케이스 수정 기록

> `edgecase-review` 스킬에서 ⚠️ WARN / ❌ FAIL 로 발견된 항목을 기록한다.
> Phase 1 의 모든 STEP 이 이 파일을 공유한다.
> 최초 작성: 2026-05-22 (STEP 1-1 · STEP 1-2 검토).

---

#### STEP 1-1 — tokens 패키지 생성

##### ⚠️ tsdown `clean: true` 가 build-css 가 만든 tokens.css 를 삭제 (빌드 순서 충돌)

**Problem**: `build` 스크립트가 `tsx scripts/build-css.ts && tsdown` 순서다.
STEP 1-3 부터 `build-css.ts` 가 `dist/tokens.css` 를 먼저 생성하면, 이어서 실행되는
tsdown 의 `clean: true` 가 `dist` 폴더 전체를 비우며 방금 만든 `tokens.css` 까지
삭제한다. 빌드 완료 후 `dist` 에 `tokens.css` 가 없어 Phase 1 완료 기준에 미달하고,
`package.json` 의 `exports["./styles.css"]` 가 존재하지 않는 파일을 가리킨다.
(현재는 `build-css.ts` 가 빈 stub 이라 충돌이 잠복 상태)

**Before**:
```jsonc
// packages/tokens/package.json
"build": "tsx scripts/build-css.ts && tsdown"   // CSS 먼저 → tsdown clean 이 삭제
```
```ts
// packages/tokens/tsdown.config.ts
clean: true,   // dist 폴더 전체를 비움
```

**After** (STEP 1-3 에서 적용):
```jsonc
// packages/tokens/package.json — 실행 순서 반전
"build": "tsdown && tsx scripts/build-css.ts"   // JS 먼저(clean 포함) → CSS 추가
```
`clean: true` 는 유지. tsdown 이 먼저 `dist` 를 비우고 `index.js` / `index.d.ts` 를
빌드한 뒤, `build-css.ts` 가 `tokens.css` 를 기존 `dist` 에 추가한다.

**Why**: tokens 패키지의 `src/index.ts` 는 `tokens.css` 를 import 하지 않으므로
tsdown 이 CSS 보다 먼저 실행돼도 의존성 문제가 없다. 순서 반전이 가장 단순하고
견고하다. 대안으로 `clean` 을 glob 배열(`clean: ["index.*"]`)로 좁혀 CSS 만 보존할
수도 있으나, 산출물 목록을 수동 열거해야 해 더 깨지기 쉽다. 이 수정 시
`phases.md` STEP 1-3 의 "CSS 를 먼저 만들고" 주의 문구도 함께 정정한다.

---

#### STEP 1-2 — 컬러 토큰 Object 정의

##### ⚠️ camelCase 역할 키(`textMuted`)의 CSS 변수명 변환 누락 위험

**Problem**: `colors.ts` 의 semantic 역할 키 중 `textMuted` 가 camelCase 다.
STEP 1-3 의 `generate-css` 가 `--color-${key}` 식으로 단순 변환하면
`--color-textMuted` 가 생성된다. CSS 커스텀 프로퍼티는 대소문자를 구분하므로
동작 자체는 하지만, 다른 변수(`--color-text`, `--color-background` 등)의
kebab-case 와 불일치한다. 또한 STEP 2-2 에서 Tailwind v4 `@theme` 가 이 변수명으로
유틸리티 클래스를 생성할 때 `text-textMuted` 같은 비관용적 클래스명이 나온다.

**Before**:
```ts
// STEP 1-3 generate-css 가 키를 그대로 쓸 경우
`--color-${role}: ${value};`         // role = "textMuted" → --color-textMuted
```

**After** (STEP 1-3 에서 적용):
```ts
// camelCase → kebab-case 변환을 generate-css 가 담당
const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
`--color-${kebab(role)}: ${value};`  // "textMuted" → --color-text-muted
```

**Why**: CSS·Tailwind 의 관례는 kebab-case 다. 변환 책임을 `generate-css` 에 두면
`colors.ts` 는 TS 친화적인 camelCase 키(에디터 자동완성·타입에 자연스러움)를
유지하면서 CSS 출력만 kebab 으로 정규화할 수 있다. **`colors.ts` 자체는 수정하지
않는다** — 이 항목은 STEP 1-3 구현 시 반영할 지침이다.
