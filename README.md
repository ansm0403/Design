# my-design-system

> 디자인 토큰과 재사용 가능한 React UI 컴포넌트 라이브러리를 하나로 묶은 **디자인 시스템 모노레포**.
> 학습용으로 시작했지만, 코드 품질만큼은 현업(production) 기준을 목표로 했습니다.

![pnpm](https://img.shields.io/badge/pnpm-10-F69220?logo=pnpm&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Storybook](https://img.shields.io/badge/Storybook-10-FF4785?logo=storybook&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-3-6E9F18?logo=vitest&logoColor=white)

<!-- CI 배지 추가 시: ![CI](https://github.com/<owner>/my-design-system/actions/workflows/ci.yml/badge.svg) -->

---

## 목차

1. [프로젝트 소개](#1-프로젝트-소개)
2. [라이브 데모](#2-라이브-데모)
3. [프로젝트 목적과 계기](#3-프로젝트-목적과-계기)
4. [기술 스택](#4-기술-스택)
5. [기술 선택 시 고민한 것들](#5-기술-선택-시-고민한-것들)
6. [주요 기능](#6-주요-기능)
7. [실행 방법](#7-실행-방법)
8. [프로젝트 구조](#8-프로젝트-구조)
9. [배운 점](#9-배운-점)
10. [아쉬운 점과 향후 개선 방향](#10-아쉬운-점과-향후-개선-방향)
11. [성능 개선 기록](#11-성능-개선-기록)
12. [트러블슈팅](#12-트러블슈팅)

---

## 1. 프로젝트 소개

**my-design-system**은 디자인 토큰과 UI 컴포넌트 라이브러리를 직접 설계·구현한
모노레포입니다. 화면을 만드는 프로젝트가 아니라, **다른 화면들이 가져다 쓸 기반**을
만드는 프로젝트입니다.

엄격하게 층을 나눈 두 개의 패키지로 구성됩니다.

| 패키지 | 역할 |
|---|---|
| `@my-ds/tokens` | 색·타이포·그림자·radius 같은 디자인 값을 CSS 변수로 정의·생성. React를 모르는 순수 패키지 |
| `@my-ds/ui` | 토큰을 소비하는 React 컴포넌트 라이브러리 |

의존성은 `tokens → ui` 한 방향으로만 흐르며, 모든 디자인 값은 토큰으로만 정의하고,
모든 인터랙티브 컴포넌트는 접근성을 기본으로 제공한다는 원칙을 끝까지 지켰습니다.

---

## 2. 라이브 데모

🔗 **Storybook 라이브 데모**: _Vercel 배포 후 URL을 여기에 추가_

배포된 Storybook에서 12종의 컴포넌트를 직접 조작해 볼 수 있습니다. 우측 Controls
패널로 props를 실시간으로 바꾸고, 상단 툴바의 테마 토글로 라이트/다크 모드를
전환하며, 각 컴포넌트의 Docs 탭에서 사용법과 variant 갤러리를 확인할 수 있습니다.

<!-- 스크린샷/GIF 추가 권장: Storybook 미리보기 화면을 docs/assets/ 에 저장 후 아래 링크
![Storybook 미리보기](docs/assets/storybook-preview.png) -->

---

## 3. 프로젝트 목적과 계기

React로 애플리케이션을 만드는 일에는 익숙했지만, 늘 한 가지가 궁금했습니다.
**"내가 매일 `import` 해서 쓰는 컴포넌트 라이브러리는, 대체 누가 어떻게 만든 걸까?"**

기능을 개발하는 일은 라이브러리를 **소비**하는 일이고, 디자인 시스템을 만드는 일은
라이브러리를 **저작**하는 일입니다. 이 프로젝트는 그 시선을 소비자에서 저작자로
옮겨보려는 시도였습니다.

디자인 시스템을 학습 주제로 고른 이유는, 프런트엔드의 여러 고급 주제가 한곳에서
만나는 지점이기 때문입니다 — 모노레포 아키텍처, 번들러와 빌드 파이프라인,
디자인 토큰과 테마, 접근성, 컴포넌트 API 설계, 라이브러리 배포, 문서화. 화면 하나를
만드는 학습이 "도구를 **쓰는** 법"을 가르친다면, 디자인 시스템은 "도구를 **만드는**
법"과 "제약을 **설계하는** 법"을 가르칩니다.

그래서 목표를 단순히 "컴포넌트 몇 개 만들기"로 두지 않았습니다. 진짜 목표는
**production 수준의 의사결정을 직접 내려보는 것**이었습니다. 모든 색은 토큰으로만,
의존성은 단방향으로, 접근성은 기본값으로 — 이런 제약을 스스로 세우고 끝까지 지키는
경험. 학습용으로 시작했지만, 그 과정에서 내리는 판단과 코드 품질만큼은 현업 기준을
타협하지 않으려 했습니다.

---

## 4. 기술 스택

| 영역 | 기술 | 비고 |
|---|---|---|
| 패키지 매니저 | **pnpm 10** (workspaces) | 별도 모노레포 도구 없이 내장 워크스페이스만 사용 |
| 언어 | **TypeScript 5** | strict mode |
| 번들러 | **tsdown 0.21** | Rolldown 기반. React·d.ts 생성 내장 |
| 스타일 | **Tailwind CSS v4** | CSS-first(`@theme`). `tailwind.config.js` 없음 |
| 디자인 토큰 | **CSS 변수** | 다크모드를 `[data-theme]`로 전환 |
| 변형 관리 | **class-variance-authority (cva)** | variant 조합별 클래스 관리 |
| 클래스 병합 | **clsx + tailwind-merge** | 충돌하는 Tailwind 클래스 자동 정리 |
| 미리보기·문서 | **Storybook 10** | `@storybook/react-vite`, MDX 문서 |
| 테스트 | **Vitest 3 + Testing Library + vitest-axe** | jsdom 환경, 접근성 자동 검증 |
| CI/CD | **GitHub Actions / Vercel** | build·test·storybook 빌드 / Storybook 호스팅 |

---

## 5. 기술 선택 시 고민한 것들

도구를 고를 때 "최신이라서"가 아니라 **이 프로젝트의 제약에 맞는가**를 기준으로
판단했습니다.

**Tailwind CSS v4 (CSS-first)**
설정 파일 없이 `@theme` 블록만으로 동작하는 새 방식. 자료가 적은 최신 버전이라
망설였지만, 디자인 토큰이 곧 CSS 변수인 이 프로젝트에서는 토큰과 Tailwind를
`@theme`로 직접 연결할 수 있어 v3보다 자연스럽게 맞물렸습니다.

**tsdown 0.21.x로 버전 고정**
tsdown 0.22+는 Node 22+를 요구하는데 개발·CI 환경은 Node 20입니다. "최신"보다
"환경 호환"을 택해 `^0.21.10`으로 범위를 고정, 자동 업그레이드를 차단했습니다.

**CSS 빌드를 번들러와 분리**
처음엔 `@tailwindcss/vite` 플러그인을 tsdown에 끼우려 했지만, tsdown은 Rolldown
기반(Vite가 아님)이라 플러그인이 크래시했습니다. JS·d.ts는 tsdown이, CSS는
`@tailwindcss/cli`가 — **각 도구가 잘하는 일만 맡도록** 빌드를 2단계로 나눴습니다.

**테스트 환경은 jsdom (happy-dom 아님)**
happy-dom이 더 빠르지만 접근성 검사 도구(axe-core)와 호환성 버그가 있습니다.
접근성 자동 검증이 이 프로젝트의 핵심 품질 기준이라, 다소 느려도 안전한 jsdom을
택했습니다.

**React를 peerDependency로**
라이브러리 번들에 React를 포함하면 소비자 앱에서 React가 두 벌 로드되어
"Invalid hook call" 오류가 납니다. React를 `peerDependency`로 선언해 **소비자의
React를 그대로 쓰도록** 했습니다.

**모노레포 도구는 pnpm workspaces만**
Nx·Turborepo 같은 전용 도구를 얹지 않았습니다. 패키지 2개 규모에서는 pnpm 내장
워크스페이스로 충분하며, 불필요한 복잡도를 더하지 않는 것도 설계 판단입니다.

---

## 6. 주요 기능

### 디자인 토큰 (`@my-ds/tokens`)
- **2단계 컬러 구조** — primitive 팔레트(실제 색값)와 semantic 역할(`primary`,
  `danger`, `background` 등)을 분리. 브랜드 색 변경 시 semantic 참조만 바꾸면 됩니다.
- 타이포그래피·shadow·radius 토큰.
- **토큰 Object가 단일 진실 원천** — `generate-css`가 Object를 CSS 변수 문자열로
  변환합니다. CSS는 손으로 쓰지 않는 파생물입니다.

### 컴포넌트 (`@my-ds/ui`) — 총 12종
- **레이아웃** — `Box`(polymorphic `as`), `Flex`, `Stack`, `Grid`, `Divider`, `Card`
- **인터랙션** — `Button`, `ToggleButton`, `TextInput`(좌/우 addon 지원),
  `Toast`(Provider 패턴 전역 알림)
- **표시** — `Badge`, `Spinner`

### 다크모드
`<html data-theme="dark">` 속성 하나만 토글하면 CSS 변수 값이 교체되어 전체 테마가
전환됩니다. **컴포넌트 코드는 라이트/다크를 전혀 알지 못합니다.**

### 접근성 기본 제공
모든 인터랙티브 컴포넌트가 키보드 조작, ARIA 속성, `focus-visible` 포커스 링을
기본으로 갖습니다. `vitest-axe`로 접근성 위반을 자동 검증합니다.

### 개발자 경험
- 모든 컴포넌트의 prop 타입을 함께 export — 소비자가 타입을 확장할 수 있습니다.
- **headless 패턴** — `useButton` 훅으로 동작 로직과 시각 스타일을 분리.
- Storybook + MDX 문서로 사용법과 variant 갤러리 제공.

---

## 7. 실행 방법

**사전 요구사항**: Node.js 20+, pnpm 10+

```bash
# 1. 의존성 설치
pnpm install

# 2. 전체 패키지 빌드 (tokens → ui 순서가 자동 보장됨)
#    Storybook의 theme.css가 tokens의 빌드 산출물을 import 하므로 빌드가 선행돼야 합니다.
pnpm -r build

# 3. Storybook 개발 서버 실행 (컴포넌트 미리보기)
pnpm --filter @my-ds/ui storybook

# 4. 테스트 실행 (단위 + 접근성)
pnpm --filter @my-ds/ui exec vitest run

# 5. Storybook 정적 빌드 (배포 산출물 생성)
pnpm --filter @my-ds/ui build-storybook
```

---

## 8. 프로젝트 구조

```
my-design-system/
├─ packages/
│  ├─ tokens/                 # @my-ds/tokens — 디자인 토큰 (CSS 변수)
│  │  └─ src/
│  │     ├─ colors.ts         # primitive 팔레트 + semantic 역할
│  │     ├─ typography.ts     # 폰트 크기·굵기·줄간격
│  │     ├─ shadow.ts / radius.ts
│  │     ├─ generate-css.ts   # 토큰 Object → CSS 변수 문자열 생성
│  │     └─ index.ts
│  └─ ui/                     # @my-ds/ui — React 컴포넌트 라이브러리
│     ├─ src/
│     │  ├─ theme.css         # 토큰 ↔ Tailwind 연결 (@theme)
│     │  ├─ Box/ Flex/ Button/ TextInput/ Toast/ ...
│     │  │                    # 컴포넌트별 폴더 (옆에 .test.tsx · .stories.tsx co-locate)
│     │  └─ index.ts          # 패키지 공개 API
│     └─ .storybook/          # Storybook 설정
├─ docs/                      # 설계 문서 (architecture · phases · checklist · edgecase)
├─ .github/workflows/ci.yml   # CI 파이프라인
└─ vercel.json                # Storybook 배포 설정
```

> 설계 의사결정의 근거와 구현 과정의 함정·노하우는 모두 [`docs/`](docs/)에
> 살아있는 문서로 기록했습니다.

---

## 9. 배운 점

- **모노레포와 단방향 의존성** — `tokens → ui` 한 방향만 허용하며, 순환 의존이 왜
  "빌드 지옥"이 되는지, 패키지 경계를 어떻게 강제하는지 체득했습니다.
- **디자인 토큰의 단일 진실 원천** — 색을 컴포넌트에 직접 쓰지 않는다는 제약.
  Object를 정의하면 CSS 변수가 파생되는 파이프라인을 직접 만들며 "값의 정의 →
  노출 → 소비"라는 층위 분리를 이해했습니다.
- **라이브러리 빌드 파이프라인** — `exports` 필드, `sideEffects`, `peerDependency`,
  d.ts 생성, 번들러의 external 처리. "앱"이 아니라 "남이 설치할 패키지"를 만들 때
  무엇을 신경 써야 하는지 배웠습니다.
- **Tailwind v4의 on-demand 스캔 모델** — 유틸리티가 소스 스캔으로 생성되기 때문에
  동적 클래스명(`grid-cols-${n}`)은 잡히지 않고, 정적 클래스 매핑이 필요하다는 점.
- **접근성은 사후 작업이 아니라 설계** — `visibility:hidden`과 `opacity:0`의 접근성
  트리 차이, `focus-visible`, ARIA, 키보드 조작. 눈에 보이지 않는 품질을 코드로
  보장하는 법을 배웠습니다.
- **구현보다 의사결정** — "설계가 바뀌면 문서를 먼저 고치고 코드를 바꾼다"는 규율,
  살아있는 문서, 모든 변경을 엣지케이스 리뷰로 점검하는 습관.

---

## 10. 아쉬운 점과 향후 개선 방향

**아쉬운 점**
- 빌드 산출물·`exports` 경로 검증까지만 진행하고, 실제 npm 배포는 하지 않았습니다.
- jsdom 환경에서는 axe가 색 대비(color-contrast)를 검증하지 못합니다 — 브라우저
  기반 접근성 검사가 별도로 필요합니다.
- 라이트 테마 solid `primary` 버튼의 글자 대비가 약 3.9:1로 WCAG AA(4.5:1) 경계에
  못 미칩니다. 팔레트 명도 조정이 필요한 부분입니다.
- `Grid`는 고정 컬럼만 지원하고, 반응형(브레이크포인트별 컬럼)은 미구현입니다.

**향후 개선 방향**
- `Grid`의 반응형 컬럼 지원 (API는 하위호환을 유지하도록 설계해 둠).
- 브라우저 기반 접근성 검사와 비주얼 회귀 테스트 도입.
- `Accordion`·`Select` 등 복잡한 컴포넌트 확장 (`Select`는 팝업 위치 계산 의존성
  검토가 선행돼야 함).
- 실제 npm 배포 및 버전 관리(changesets) 도입.

---

## 11. 성능 개선 기록

### 배포 CSS 번들에서 불필요한 클래스 제거
- **문제** — Storybook 스토리·테스트·MDX 파일이 Tailwind의 콘텐츠 스캔에 함께
  잡혀, 데모에서만 쓰는 클래스(`text-white`, `px-4` 등)가 배포용 `dist/styles.css`로
  누출됐습니다. 소비자에게 불필요한 CSS가 전달되는 상태였습니다.
- **조치** — 라이브러리 빌드 전용 진입 CSS(`library.css`)를 분리하고 `@source not`
  으로 스토리·테스트·MDX 파일을 스캔에서 제외했습니다.
- **결과** — 빌드 후 `dist/styles.css`에서 스토리/테스트 전용 클래스 **0개**를 확인.
  배포 CSS가 라이브러리 컴포넌트가 실제로 쓰는 유틸리티만 담게 됐습니다.

### 런타임 의존성을 라이브러리 번들에서 제외
- **문제** — React, `clsx`, `tailwind-merge`, `cva`가 번들에 포함되면 소비자 앱에서
  중복 로드·중복 번들이 발생합니다 (특히 React 중복은 "Invalid hook call" 유발).
- **조치** — React는 `peerDependency`로 선언하고, 나머지는 `dependencies`로 두어
  tsdown이 자동으로 external 처리하도록 했습니다.
- **결과** — `dist/index.js`에 해당 의존성이 포함되지 않아, 소비자 번들에 중복이
  쌓이지 않습니다.

### Toast Context 리렌더 최소화
- **문제** — Provider가 노출하는 API 객체가 매 렌더마다 새로 생성되면, `useToast`를
  쓰는 모든 소비자가 불필요하게 리렌더됩니다.
- **조치** — API 객체를 `useMemo`, 함수들을 `useCallback`으로 안정화했습니다.
- **결과** — Provider가 리렌더돼도 소비자가 불필요하게 리렌더되지 않습니다.

### 로딩 버튼의 레이아웃 시프트 제거
- **문제** — 버튼이 로딩 상태가 되면 라벨이 스피너로 바뀌며 너비가 변해 레이아웃이
  흔들립니다(CLS).
- **조치** — 스피너를 `absolute inset-0`로 겹치고 children은 `opacity-0`로 자리만
  유지했습니다.
- **결과** — 로딩을 토글해도 버튼 너비가 글자 기준으로 보존되어 레이아웃 시프트가
  없습니다.

---

## 12. 트러블슈팅

### `@tailwindcss/vite` 플러그인이 tsdown 빌드에서 크래시
Tailwind CSS 빌드를 번들러에 통합하려 했으나 `Cannot read properties of null
(reading 'createResolver')` 오류 발생. 원인은 tsdown이 Rolldown 기반이라 Vite 전용
플러그인이 Vite 컨텍스트를 찾지 못한 것. → CSS 빌드를 `@tailwindcss/cli` 별도
단계로 분리해 해결했습니다.

### 로딩 중인 버튼이 접근 가능한 이름(accessible name)을 잃음
로딩 시 버튼 라벨을 `invisible`(`visibility:hidden`)로 숨겼더니, 해당 요소가 접근성
트리에서 제거되어 스크린리더가 "버튼, 바쁨"만 읽고 *어떤* 버튼인지 알리지 못했습니다.
→ `opacity-0`으로 교체. 시각적으로만 투명해지고 접근성 트리·레이아웃 공간은 모두
유지됩니다.

### `vitest-axe` 0.1.0의 진입점 결함
접근성 매처를 등록하는 `vitest-axe/extend-expect`의 빌드 산출물이 빈 파일이라
`toHaveNoViolations` 매처가 등록되지 않았습니다. → 매처를 `dist` 경로에서 직접
import 해 `expect.extend`로 수동 등록하고, 타입도 직접 augment 해 우회했습니다.

### Storybook 10에서 커스텀 MDX와 autodocs가 충돌
커스텀 MDX 문서 페이지와 `tags:["autodocs"]`가 한 컴포넌트에 공존하자 Storybook이
"같은 Docs 페이지를 두 번 만들려는 실수"로 판단해 인덱싱 자체를 실패시켰습니다
(SB 7~8과 달라진 동작). → 커스텀 MDX를 쓰기로 한 컴포넌트에서 `autodocs` 태그를
제거해 해결했습니다.

---

> 이 프로젝트는 디자인 시스템의 설계·구현·배포 전 과정을 직접 경험하기 위한
> 학습 목적으로 제작되었습니다.
