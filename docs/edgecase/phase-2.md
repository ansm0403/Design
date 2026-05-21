# Phase 2 — 엣지케이스 수정 기록

> `edgecase-review` 스킬에서 ⚠️ WARN / ❌ FAIL 로 발견된 항목을 기록한다.
> Phase 2 의 모든 STEP 이 이 파일을 공유한다.
> 최초 작성: 2026-05-22 (STEP 2-1 검토).

---

#### STEP 2-1 — ui 패키지 뼈대 생성

##### ⚠️ react/react-dom 이 peerDependencies 로만 선언되고 devDependency 가 없음 (STEP 2-3 빌드 트랩)

**Problem**: `@my-ds/ui` 의 `package.json` 은 `react`/`react-dom` 을
`peerDependencies` 로 선언했다(규칙 5 — 사용처가 직접 제공). 하지만 두 패키지가
워크스페이스 어디에도 설치돼 있지 않다(ui 의 `devDependencies` 에도, 루트에도 없음).
`peerDependencies` 는 "사용처가 제공할 것" 을 선언할 뿐, **개발·빌드 시점에 패키지를
가져다 놓지는 않는다.** STEP 2-1 은 `src/index.ts` 가 `export {}` 뿐인 빈 모듈이라
빌드·타입검사에 React 가 필요 없어 문제가 잠복 상태다. 그러나 STEP 2-3(Box) 가
React 컴포넌트를 작성하는 순간 `tsc` 와 tsdown 의 `.d.ts` 생성이
`react` / `react/jsx-runtime` 타입을 찾지 못해
`Cannot find module 'react' or its corresponding type declarations` 로 실패한다.

**Before** (STEP 2-1 현재 — `packages/ui/package.json`):
```jsonc
"peerDependencies": {
  "react": "^18.0.0 || ^19.0.0",
  "react-dom": "^18.0.0 || ^19.0.0"
}
// devDependencies 에 react 계열 없음 → ui 가 자기 자신을 dev-build 할 수 없음
```

**After** (STEP 2-3 에서 적용 — Box.tsx 작성 직전):
```bash
pnpm --filter @my-ds/ui add -D react react-dom @types/react @types/react-dom
```
`peerDependencies` 는 그대로 두고(배포 시 사용처가 React 를 제공하는 계약),
개발·빌드·타입검사용 사본을 `devDependencies` 로 추가한다. tsdown 의
`deps.neverBundle` 가 react 계열을 external 처리하므로 devDependency 로 설치해도
빌드 산출물에는 포함되지 않는다(규칙 5 위배 아님).

**Why**: `peerDependency` + 같은 패키지의 `devDependency` 는 React 컴포넌트
라이브러리의 표준 짝이다 — peerDep 은 "배포 후 사용처가 제공" 을, devDep 은
"개발 중 로컬 빌드/타입검사용" 을 담당한다. STEP 2-1 스펙(phases.md)은
`package.json` 항목을 `name`/`version`/`type`/`sideEffects`/`peerDependencies`/
`dependencies`/`exports`/`scripts` 로만 한정하고 `devDependencies` 를 명시하지
않았다. 빈 `index.ts` 단계에서 react 를 미리 설치하는 것은 STEP 범위를 벗어난
선반영이므로, 실제로 React 가 필요한 STEP 2-3 에 설치를 미룬다. STEP 2-3 은
이미 `clsx`/`tailwind-merge` 를 추가하는 의존성 설치 STEP 이라 react 계열도
함께 설치하면 자연스럽다. **이 항목은 STEP 2-1 의 결함이 아니라 STEP 2-3 진입
시 반드시 선행할 설치 지침이다.**

---

#### STEP 2-2 — Tailwind v4 + 토큰 연결

##### ⚠️ semantic 역할명 `text` / `textMuted` 가 Tailwind `text-` 접두사와 충돌

**Problem**: tokens 의 semantic 역할 중 `text`·`textMuted` 는 텍스트 색 역할이다.
Tailwind v4 는 색 토큰마다 `bg-*`·`text-*`(글자색)·`border-*` 유틸리티를 만든다.
글자색 유틸리티의 접두사 `text-` 가 색 이름 `text`/`text-muted` 와 겹쳐
**`text-text`**, **`text-text-muted`** 라는 doubled 클래스가 생성된다. 동작은
정상이나(`.text-text-muted { color: var(--color-text-muted) }` 확인됨) 비관용적이라
Phase 3 컴포넌트가 muted 헬퍼 텍스트 등에 `text-text-muted` 를 직접 쓰게 된다.

**Before** (현재 — `colors.ts` 의 역할명, `theme.css` 가 그대로 매핑):
```ts
// semantic 역할: ... text, textMuted, ...
// → Tailwind 유틸리티: text-text, text-text-muted, bg-text, border-text ...
```

**After** (택1 — 결정 필요, 본 STEP 범위 밖):
```ts
// (A) 수용: text-text / text-text-muted 를 그대로 쓴다(추가 작업 0).
// (B) 개명: tokens 의 역할명을 관용적으로 — 예 text → foreground, textMuted → muted
//     → 유틸리티가 text-foreground / text-muted 로 자연스러워진다.
//     단 colors.ts·generate-css 출력·theme.css·tokens 재빌드가 필요(Phase 1 재방문).
```

**Why**: 다수 디자인 시스템(shadcn 등)이 글자색 역할을 `foreground`·`content` 로
부르는 이유가 정확히 이 `text-` 접두사 충돌 때문이다. 개명은 **컴포넌트가 0개인
지금이 가장 저렴**하고, Phase 3 이후엔 모든 컴포넌트의 클래스를 고쳐야 해 비싸진다.
다만 역할명은 STEP 1-2 에서 확정된 토큰 설계라 변경은 tokens 패키지(Phase 1)
재방문 + 사용자 승인이 필요하다 — STEP 2-2 가 단독으로 바꿀 사항이 아니므로
**결정을 사용자에게 위임**한다.

**해결 (2026-05-22)**: 사용자가 (B) 개명을 선택. `colors.ts` 의 `SemanticTokens`
타입 + `semantic.light`/`dark` 에서 `text`→`foreground`, `textMuted`→`muted` 로
개명하고, tokens·ui 를 재빌드했다. 결과: `--color-foreground`/`--color-muted`,
유틸리티 `text-foreground`/`text-muted` 로 정상화(probe 로 확인). `SemanticColorRole`
타입은 `keyof` 라 자동 갱신, `generate-css.ts` 는 키에 무관하게 제네릭이라 기능
변경 없음(stale 주석만 정정).

##### ⚠️ `theme.css` 의 `@theme inline` 컬러 목록이 수동 유지됨 (토큰과 드리프트 위험)

**Problem**: `theme.css` 의 `@theme inline { }` 블록은 semantic 컬러 9역할을
손으로 나열한다. 토큰 패키지에 역할이 추가/삭제되면 이 목록을 수동으로 맞춰야
한다. STEP 1-2 기록상 `info`/`warning` 역할이 STEP 3-6(Toast info variant)에서
추가 예정이라, 이 드리프트는 **실제로 발생이 예정**돼 있다. 누락 시 새 토큰은
CSS 변수로는 존재하나 Tailwind 유틸리티(`bg-info` 등)가 생성되지 않는다.

**Before** (현재 — `theme.css`):
```css
@theme inline {
  --color-primary: var(--color-primary);
  /* ... 9역할을 수동 나열 ... */
}
```

**After** (드리프트 발생 시 — 예: STEP 3-6):
```css
@theme inline {
  /* ... 기존 9역할 ... */
  --color-info: var(--color-info);      /* 토큰에 역할 추가 시 여기도 반드시 추가 */
  --color-warning: var(--color-warning);
}
```

**Why**: 이상적으로는 `@theme` 블록도 토큰 Object 에서 생성(generate-css 확장)하면
단일 진실 원천이 완성된다. 그러나 MVP 의 9역할은 안정적이고, ui 패키지에 별도
생성 스텝을 두는 것은 현 단계 과설계다. **수동 유지를 허용하되 이 결합을
문서화**한다 — 토큰 역할을 건드리는 STEP(특히 STEP 3-6)에서 `theme.css` 동기화를
체크리스트에 포함할 것.

---

#### STEP 2-3 · 2-5 — Box / Flex / Stack

##### ⚠️ 제네릭 polymorphic 컴포넌트에 `displayName` 이 누락됨 (DevTools/Storybook 표기)

**Problem**: Box·Flex·Stack 은 polymorphic 컴포넌트라 `forwardRef` 결과를
"제네릭 T 를 받는 호출 시그니처" 로 캐스팅한다(`forwardRef` 가 제네릭을 보존
못 하는 한계 우회). 그런데 캐스팅 후의 타입은 **순수 함수 시그니처**라
`.displayName` 프로퍼티를 받지 못한다. 캐스팅된 `export const Box` 에
`Box.displayName = "Box"` 를 붙이려 하면 TS 가 거부한다. 그 결과 displayName 이
비어 React DevTools 와 Storybook autodocs(STEP 2-4·5-1)가 컴포넌트를 내부 함수명
`BoxInner`/`FlexInner`/`StackInner` 또는 익명으로 표기한다 — 디자인 시스템
라이브러리로서 DX 결함이다.

**Before** (캐스팅 후엔 displayName 을 붙일 수 없음):
```tsx
export const Box = forwardRef(BoxInner) as <T extends ElementType = "div">(
  props: BoxProps<T> & { ref?: Ref<Element> },
) => ReactElement | null;
// Box.displayName = "Box";  // ❌ TS 거부 — Box 타입은 순수 함수 시그니처
```

**After** (캐스팅 "전" — `ForwardRefExoticComponent` 타입일 때 설정):
```tsx
const BoxImpl = forwardRef(BoxInner);
BoxImpl.displayName = "Box";              // ✅ ForwardRefExoticComponent 는 .displayName 보유
export const Box = BoxImpl as <T extends ElementType = "div">(
  props: BoxProps<T> & { ref?: Ref<Element> },
) => ReactElement | null;
```

**Why**: `forwardRef(...)` 의 반환 타입 `ForwardRefExoticComponent` 는
`displayName?: string` 을 갖는다. 캐스팅으로 이 정보가 사라지므로, 캐스팅을
중간 변수(`BoxImpl`)로 끊고 그 시점에 displayName 을 부여한 뒤 캐스팅한다.
런타임 객체는 동일(`displayName` 프로퍼티만 추가됨)하고 공개 타입만 제네릭
시그니처로 좁아진다. 세 컴포넌트(Box·Flex·Stack)가 같은 패턴이라 동일하게 적용.

**해결 (2026-05-22)**: Box·Flex·Stack 모두 `XxxImpl` 중간 변수 + 캐스팅 전
`displayName` 설정으로 수정. 재빌드·`tsc` 통과 확인.

---

#### STEP 2-4 — Storybook 세팅 + 스토리

##### ⚠️ 스토리 전용 Tailwind 클래스가 라이브러리 배포 CSS 로 누출

**Problem**: STEP 2-4 가 `src/` 안에 `*.stories.tsx` 를 추가했다. 라이브러리
배포 CSS 빌드(`@tailwindcss/cli -i src/theme.css -o dist/styles.css`)는 Tailwind
v4 의 자동 콘텐츠 감지로 `packages/ui` 전체를 스캔한다 → **스토리 파일까지
스캔**해, 스토리 데모에서만 쓰는 클래스(`text-white`·`px-4`·`bg-primary` 등)가
배포 CSS `dist/styles.css` 로 새어 들어간다. 배포 CSS 는 라이브러리 *컴포넌트*가
쓰는 유틸리티만 담아야 하는데, *미리보기 dev 산출물*인 스토리가 출력물을 오염시킨다
(소비자에게 불필요한 클래스 전달 — single source of truth 위반).

검증: `pnpm --filter @my-ds/ui build` 후 `dist/styles.css` 에 `.text-white`·
`.px-4`·`.bg-primary`(전부 스토리에서만 사용) 가 존재함을 확인.

**Before** (공유 `theme.css` 가 라이브러리·Storybook 양쪽의 입력):
```text
src/theme.css ──┬─→ @tailwindcss/cli  → dist/styles.css   (스토리 클래스 누출 ❌)
                └─→ Storybook(@tailwindcss/vite)
```
1차 시도 — `theme.css` 에 `@source not "**/*.stories.tsx"` 추가 → 라이브러리
CSS 는 깨끗해졌으나 **Storybook 도 스토리 클래스를 잃었다**(`@source not` 은
Vite 플러그인 경로에도 적용됨). 공유 파일에 두면 안 됨이 확인됨.

**After** (라이브러리 빌드 전용 진입 CSS 를 분리):
```text
src/theme.css   ───────────────────→ Storybook(@tailwindcss/vite)  (스토리 포함 ✅)
src/library.css ─→ @tailwindcss/cli → dist/styles.css              (스토리 제외 ✅)
  └ @import "./theme.css"; @source not "**/*.stories.tsx";
```
- `src/library.css` 신규: `theme.css` 를 `@import` 한 뒤 `@source not` 으로
  스토리만 제외. build 스크립트를 `-i src/theme.css` → `-i src/library.css` 로 변경.
- `theme.css` 는 `@source not` 없는 순수 공유 테마로 유지 → Storybook 이 직접
  `@import` 해 스토리 클래스를 정상 생성.

**Why**: `@source not` 은 한번 처리 CSS 에 들어가면 그 빌드 전체(CLI·Vite 공통)에
적용된다. 따라서 "라이브러리 빌드만 스토리 제외" 를 하려면 입력 CSS 자체를 갈라야
한다 — 공유 base(`theme.css`)는 `not` 없이 두고, 라이브러리 전용 진입 파일
(`library.css`)에만 `not` 을 둔다. `@theme` 정의는 `theme.css` 한 곳에만 있어
single source of truth 유지(`library.css` 는 import + 1줄 제외만).

**해결 (2026-05-22)**: `src/library.css` 분리 + build 스크립트 입력 변경.
검증 — 라이브러리 빌드: `dist/styles.css` 에 스토리 클래스 0, 레이아웃 클래스
(`flex`·`gap-4` 등) 정상. Storybook 빌드: `storybook-static` CSS 에 스토리 클래스
(`text-white`·`bg-primary`·`px-4`) 정상 포함. `architecture.md` §4·§6 갱신.
