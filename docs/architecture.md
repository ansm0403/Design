# Architecture — 디자인 시스템 설계 문서

> 이 문서는 프로젝트의 **헌법**이다. 무엇을, 왜, 어떤 구조로 만드는지의 기준.
> 구현 중 판단이 흔들릴 때 이 문서로 돌아온다.
> 최종 갱신: 2026-05-22 — Phase 3(STEP 3-1~3-6) 완료 반영(코드 분석 기반 동기화):
>   §6 [4] 예시를 `text-white` → `text-background` 로 정정(실제 Button 코드와 일치).
>   §7 에 headless `useButton`·`ToggleButton`(STEP 3-3) 추가 명시.
> 2026-05-22 — STEP 2-4: Storybook 은 Vite 기반이라 Tailwind 처리를
>   @tailwindcss/vite(viteFinal)로 한다. §6 에 Storybook 처리 경로 추가.
> 2026-05-22 — STEP 2-2: CSS 빌드를 @tailwindcss/cli 별도 단계로 전환
>   (@tailwindcss/vite 플러그인이 tsdown/Rolldown 과 비호환). @theme → @theme inline.
> 2026-05-22 — tsdown 0.21.x 로 고정 (Node 20.19.0 호환 상한).
> 2026-05-21 — Tailwind v4 CSS-first, Storybook 10, vitest-axe 반영.

---

## 1. 프로젝트 한 줄 정의

재사용 가능한 **디자인 토큰 + UI 컴포넌트 라이브러리**를 모노레포로 구축한다.
학습용이되 현업 수준의 코드 품질을 지향하고, 자주 쓰이는 핵심 컴포넌트에 집중한다.

---

## 2. 핵심 설계 원칙

1. **단일 진실의 원천 (Single Source of Truth)**
   모든 디자인 값(색·간격·폰트)은 토큰으로만 정의한다. 컴포넌트는 색을 직접 적지 않는다.

2. **층위 분리**
   - 토큰 = CSS 변수 (값의 정의)
   - Tailwind = CSS 변수를 클래스로 노출 (값의 사용 인터페이스)
   - 컴포넌트 = Tailwind 클래스 조합 (값의 소비)

3. **의존성은 한 방향**
   tokens → ui → (storybook · test · docs). 역방향 의존 금지.

4. **기능과 스타일 분리 (headless 지향)**
   복잡한 컴포넌트는 동작 로직과 시각 스타일을 분리해 재사용성을 높인다.

5. **접근성 기본 (a11y by default)**
   컴포넌트는 키보드 조작·ARIA 속성을 기본 제공한다.

---

## 3. 기술 스택 (확정)

| 영역 | 선택 | 버전 기준 | 이유 |
|---|---|---|---|
| 패키지 매니저 | **pnpm** | 9+ | 모노레포 지원 강력, 디스크 효율 |
| 모노레포 | **pnpm workspaces** | — | 별도 도구 없이 pnpm 내장 기능으로 충분 |
| 언어 | **TypeScript** | 5+ | 타입 안전성, 라이브러리 자동완성 |
| 번들러 | **tsdown** | 0.21.x | tsup 후속. Rolldown 기반. React/dts 플러그인 없이 내장 지원. 0.22+ 는 Node 22+ 요구 → 현 Node 20.19.0 환경의 최신 호환 버전은 0.21.x. |
| 토큰 표현 | **CSS 변수** | — | 다크모드·런타임 테마 교체에 유리 |
| 컴포넌트 스타일 | **Tailwind CSS v4** | 4.x | CSS-first(`@theme`). `tailwind.config.js` 불필요. 토큰 CSS 변수와 자연스럽게 연결. |
| 컴포넌트 미리보기 | **Storybook** | 10.x | 디자인 시스템 사실상 표준. Node 20+ 필요. |
| 테스트 | **Vitest + Testing Library** | Vitest 3.x | 빠르고 React 친화적 |
| 접근성 테스트 | **vitest-axe** | latest | jest-axe의 Vitest 포크. Vitest 환경과 타입 완전 호환. |
| 문서화 | **Storybook 통합** | — | 별도 사이트(nextra) 생략해 단순화 |
| CI/CD | **GitHub Actions** | — | 빌드·테스트 자동화 |

> **환경 요구사항**: Node.js 20+, pnpm 9+
>
> ⚠️ Vitest 환경은 반드시 **jsdom** 사용. happy-dom은 axe-core와 호환성 버그 있음(2026년 기준).

---

## 4. 전체 폴더 구조

```
my-design-system/
├─ package.json              # 루트 (private: true)
├─ pnpm-workspace.yaml       # 워크스페이스 선언
├─ tsconfig.base.json        # 공통 TS 설정 (각 패키지가 extends)
├─ .gitignore
├─ .github/
│  └─ workflows/
│     └─ ci.yml              # Phase 5: CI 파이프라인
└─ packages/
   ├─ tokens/                # Phase 1: 디자인 토큰
   │  ├─ src/
   │  │  ├─ colors.ts        # 컬러 토큰 Object (primitive + semantic)
   │  │  ├─ typography.ts    # 타이포 토큰
   │  │  ├─ shadow.ts        # 그림자 토큰
   │  │  ├─ radius.ts        # 모서리 토큰
   │  │  ├─ generate-css.ts  # Object → CSS 변수 문자열 생성 함수
   │  │  └─ index.ts         # 토큰 Object + generateCss 통합 export
   │  ├─ scripts/
   │  │  └─ build-css.ts     # CSS 파일 생성 스크립트 (tsx로 실행)
   │  ├─ tsdown.config.ts
   │  ├─ tsconfig.json
   │  └─ package.json
   └─ ui/                    # Phase 2~4: UI 컴포넌트
      ├─ src/
      │  ├─ theme.css         # 공유 테마: @import tailwindcss + 토큰 + @theme inline (Storybook 입력)
      │  ├─ library.css       # 라이브러리 빌드 입력: theme.css + @source not(스토리 제외)
      │  ├─ utils/            # cn() 등 내부 유틸리티
      │  ├─ Box/
      │  ├─ Flex/
      │  ├─ Button/
      │  ├─ TextInput/
      │  ├─ Toast/
      │  └─ index.ts
      ├─ .storybook/          # Storybook 설정 (main.ts, preview.tsx)
      ├─ tsdown.config.ts
      ├─ tsconfig.json
      └─ package.json
```

> **config 패키지 없음**: Tailwind v4에서는 `tailwind.config.js`/preset이 불필요.
> 토큰↔Tailwind 연결은 `packages/ui/src/theme.css` 안에서 CSS로 직접 처리한다.

---

## 5. 의존성 흐름 (절대 규칙)

```
@my-ds/tokens   (의존 없음, 최하위)
      ↓ import
@my-ds/ui       (tokens에 의존)
      ↓ import
storybook / tests / 사용처 앱
```

- `tokens`는 그 무엇에도 의존하지 않는다 (React조차 모름, 순수 값+CSS).
- `ui`는 `tokens`를 가져다 쓴다.
- 절대 `tokens`가 `ui`를 import하지 않는다 (순환 의존 = 빌드 지옥).

**배포 시 필수 설정**:
- 각 패키지 `package.json`에 `"sideEffects": ["*.css"]` — 번들러가 CSS를 tree-shake로 삭제하는 사고 방지.
- CSS는 `exports["./styles.css"]`로 별도 노출. 사용자가 명시적으로 import.

> 💡 패키지 이름 접두사 `@my-ds/` 는 예시다. npm scope로 바꿔도 되고,
> 학습용이면 그대로 둬도 된다. 일관성만 유지할 것.

---

## 6. 토큰 → Tailwind 연결 방식 (핵심 메커니즘, Tailwind v4 기준)

이 프로젝트에서 가장 중요한 설계. 4단계로 동작한다.

```
[1] tokens 패키지가 CSS 변수 정의 → dist/tokens.css 생성
    :root { --color-primary: #1976d2; --color-danger: #d32f2f; ... }
    [data-theme="dark"] { --color-primary: #90caf9; ... }

           ↓ @import

[2] ui 패키지의 theme.css 가 tokens.css 를 가져오고
    Tailwind v4 @theme 으로 CSS 변수를 Tailwind 유틸리티로 노출

    @import "tailwindcss";
    @import "@my-ds/tokens/styles.css";

    @theme inline {
      --color-primary: var(--color-primary);   /* → bg-primary, text-primary 클래스 생성 */
      --color-danger:  var(--color-danger);    /* → bg-danger, text-danger 클래스 생성 */
    }
    /* `inline`: 외부 CSS 변수(토큰)를 @theme 에 별칭으로 둘 때의 표준 관용.
       유틸리티가 토큰 변수를 직접 참조 → [data-theme] 다크 전환이 자동 반영.
       토큰의 실제 값은 unlayered tokens.css 가 정의하며, CSS @layer 우선순위상
       unlayered 선언이 Tailwind 의 @layer theme 출력을 이긴다. */

           ↓ @tailwindcss/cli 로 CSS 빌드 (tsdown 과 분리된 별도 단계)

[3] dist/styles.css 생성
    (Tailwind 유틸리티 클래스 + CSS 변수 모두 포함된 단일 CSS 파일)

           ↓ 컴포넌트가 클래스 사용

[4] <button className="bg-primary text-background hover:bg-primary/90">
    ← 색을 직접 안 적음(토큰 유틸리티만 사용). 다크모드 때도 코드 변경 없음.
    ※ solid 버튼 글자색은 text-background — 배경색 토큰이 light/dark 로 자동
      반전돼 두 테마 모두 대비가 확보된다(실제 Button 구현 · docs/edgecase/phase-3.md).
```

**다크모드**: `<html data-theme="dark">` 속성만 토글하면 [1]의 CSS 변수가 교체되고,
Tailwind 클래스는 그대로인데 색만 바뀐다. 컴포넌트 코드 수정 불필요.

**semantic 토큰 구조 결정**:
컴포넌트는 `light/dark`를 의식하지 않는다. semantic 토큰은 하나의 키로만 노출
(예: `primary`, `danger`). CSS 변수의 값이 `data-theme`에 따라 교체되는 방식.
→ colors.ts 에서 `semantic.light`/`semantic.dark` 로 분리해 정의하되,
  CSS 변수로 출력할 때는 같은 이름(`--color-primary`)으로 두 세트를 생성.

**라이브러리 배포 결정**:
- CSS 번들 동봉(A안)으로 확정. 사용자가 `import "@my-ds/ui/styles.css"` 한 줄 추가.
- tsdown은 기본적으로 CSS import를 JS에 자동 주입하지 않으므로 **명시적 CSS export** 사용.

**CSS 빌드 방식 결정 (STEP 2-2, 2026-05-22)**:
- `dist/styles.css` 컴파일은 **`@tailwindcss/cli` 별도 빌드 단계**로 한다.
  ui 의 build 스크립트는 `tsdown && tailwindcss -i src/library.css -o dist/styles.css`
  (tokens 의 `tsdown && tsx scripts/build-css.ts` 와 같은 2단계 패턴).
  입력이 `theme.css` 가 아닌 `library.css` 인 이유는 아래 Storybook 처리 항목 참조.
- 처음 계획한 `@tailwindcss/vite` 플러그인을 tsdown 에 끼우는 방식은 폐기 — tsdown
  (Rolldown)은 Vite 가 아니라, 플러그인이 Vite 전용 컨텍스트를 찾다 crash 한다
  (`TypeError: Cannot read properties of null (reading 'createResolver')`).
- tsdown 은 JS+`.d.ts` 만, CSS 는 공식 Tailwind CLI 가 — 각 도구가 잘하는 일만 맡는다.
- Tailwind v4 유틸리티는 **사용처 스캔 기반(on-demand)** 이다. 컴포넌트가 실제로
  `bg-primary` 를 써야 그 클래스가 `dist/styles.css` 에 생성된다. 컴포넌트가 없는
  STEP 2-2 시점의 `styles.css` 는 preflight + 토큰 변수까지만 — 정상이다.

**Storybook 의 Tailwind 처리 (STEP 2-4, 2026-05-22)**:
- Storybook 은 **Vite 기반**이라, Storybook 안에서는 `theme.css` 를
  `@tailwindcss/vite` 플러그인으로 처리한다 (`.storybook/main.ts` 의 `viteFinal` 훅).
- 이는 위 "CSS 빌드 방식 결정" 과 모순되지 않는다 — 거기서 `@tailwindcss/vite` 를
  버린 건 **tsdown**(Rolldown, Vite 아님)과 비호환이라서다. Storybook 의 빌더는
  진짜 Vite 라 이 플러그인의 정상 사용처다.
- 정리하면 Tailwind 처리 경로가 둘로 갈리고, **입력 CSS 도 갈라진다**:
  · 라이브러리 배포용 → `@tailwindcss/cli`, 입력 `src/library.css` → `dist/styles.css`
  · Storybook 개발용  → `@tailwindcss/vite`(`viteFinal`), 입력 `src/theme.css`(HMR)
- `theme.css` 는 공유 base 다 — `@import "tailwindcss"` + 토큰 + `@theme inline`.
  `library.css` 는 `theme.css` 를 `@import` 한 뒤 `@source not "**/*.stories.tsx"` 로
  스토리 파일을 Tailwind 스캔에서 제외한다 → 스토리 전용 클래스가 배포 CSS 로
  새지 않게 한다(`@theme` 정의는 `theme.css` 한 곳 — single source of truth 유지).
  `@source not` 을 공유 `theme.css` 에 두면 Storybook 까지 스토리 클래스를 잃으므로
  반드시 라이브러리 진입 파일에만 둔다 (`docs/edgecase/phase-2.md` STEP 2-4 참조).

> ⚠️ **Tailwind v4 라이브러리 prefix 한계**: v4의 prefix 옵션은 있으나
> 라이브러리 빌드 시 tree-shaking이 불완전 (사용 여부와 무관하게 모든 prefix 유틸리티가 번들에 포함됨).
> MVP 단계에서는 prefix 없이 CSS 동봉 방식(A안)으로 가고, 이 문제는 MVP 이후 검토.

---

## 7. 만들 컴포넌트 범위 (우선순위)

### 1순위 — 반드시 (디자인 시스템 뼈대)
- **Box** — 모든 컴포넌트의 기반. 스타일 prop을 받는 기본 상자.
- **Button** — variant/색/사이즈/로딩/접근성. 디자인 시스템 패턴의 교과서.
- **TextInput** — Controlled 패턴, 폼 처리 기본.

### 2순위 — 권장 (자주 쓰임 + 배울 것 많음)
- **Flex / Stack** — 레이아웃의 대부분을 차지.
- **Toast** — Provider 패턴(전역 상태)을 배우는 예제.

### 3순위 — 선택 (시간 되면)
- **Accordion** — 접근성(ARIA) 심화.
- **Select**, **Grid**, **List** 등.

> MVP는 1순위 + 2순위까지를 목표로 한다. 3순위는 여유 시.

> 💡 STEP 3-3 에서 Button 의 headless 동작 훅 `useButton` 과 그 응용 컴포넌트
> `ToggleButton`(눌림 상태 토글)이 추가됐다 — §2 원칙 4(기능과 스타일 분리)의
> 실증이다. 둘 다 패키지 공개 API 로 export 된다(`useButton` 으로 소비자가 자기만의
> 버튼을 만들 때 클릭 차단·로딩 동작을 그대로 재사용).

---

## 8. Phase 로드맵 요약

| Phase | 내용 | STEP 수 |
|---|---|---|
| **0** | 모노레포 뼈대 (workspace, tsconfig, .gitignore) | 4 |
| **1** | 토큰 패키지 (컬러·다크모드·타이포·shadow·radius) | 6 |
| **2** | UI 기반 (ui 패키지 뼈대, Tailwind v4 연결, Box, Storybook, Flex) | 5 |
| **3** | 핵심 컴포넌트 (Button, TextInput, Toast) | 6 |
| **4** | 테스트 (단위·접근성) | 3 |
| **5** | 문서화 & CI/CD | 3 |

상세 STEP은 `phases.md` 참조. 진행 추적은 `mvp-checklist.md` 참조.

---

## 9. 이 문서의 갱신 규칙

- 설계 결정이 바뀌면 **반드시 이 문서를 먼저 수정**하고 코드를 고친다.
- "왜 이렇게 했는지"를 항상 기록한다 (미래의 나/팀원을 위해).
- 도구 버전을 올렸으면 3번 표에 반영한다.
