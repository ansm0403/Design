# Phases — 상세 구현 설계도

> 각 STEP의 구조: **무엇을 / 왜 / 지시 프롬프트 / 핵심 포인트 / 주의**
> 한 STEP 끝나면 `edgecase-review` 스킬로 검증한 뒤 `mvp-checklist.md` 의 해당 항목을 체크한다.
> 최종 갱신: 2026-05-21 — Tailwind v4, Storybook 10, vitest-axe, STEP 2 재구성.

---
---

# Phase 0 — 프로젝트 뼈대

> 목표: 코드를 담을 그릇을 만든다. 아직 실행할 코드는 없다.

## STEP 0-1. 프로젝트 초기화

**무엇을**: 빈 폴더 + 루트 package.json + .gitignore 생성.

**지시 프롬프트**
```
my-design-system 프로젝트를 시작한다.
0. 먼저 Node 버전이 20 이상인지 확인한다. (node --version)
1. 루트 package.json 생성:
   - name: "my-design-system", private: true, type: "module"
   - packageManager 필드에 현재 pnpm 버전 명시
   - engines: { "node": ">=20" }
   - scripts 는 비워둠
2. .gitignore 생성: node_modules, dist, *.log, .DS_Store, coverage, .turbo
```

**핵심 포인트**
- `private: true`: 루트를 실수로 npm 배포하는 사고 방지. 필수.
- `type: "module"`: 최신 ESM 사용.
- `engines.node`: Storybook 10, tsdown 모두 Node 20+ 요구.

---

## STEP 0-2. 워크스페이스 선언

**무엇을**: pnpm에게 모노레포임을 알림.

**지시 프롬프트**
```
루트에 pnpm-workspace.yaml 생성:

packages:
  - "packages/*"
```

**핵심 포인트**
- 이 설정으로 packages 하위 폴더들이 서로 로컬 import 가능해진다.

---

## STEP 0-3. 공통 TypeScript 설정

**무엇을**: 모든 패키지가 상속할 tsconfig.base.json.

**지시 프롬프트**
```
루트에 tsconfig.base.json 생성. 라이브러리+React 개발용:
- target: ES2020, module: ESNext, moduleResolution: Bundler
- jsx: react-jsx, strict: true, declaration: true
- esModuleInterop: true, skipLibCheck: true
- include/exclude 는 넣지 않음 (각 패키지에서 지정)
최신 TS 권장 옵션과 다른 부분이 있으면 알려줘.
```

**핵심 포인트**
- `declaration: true`: .d.ts(타입 정의) 자동 생성 → 라이브러리 자동완성.
- `moduleResolution: Bundler`: 번들러(tsdown) 사용 환경에 맞는 모듈 해석 방식.

---

## STEP 0-4. 검증

**지시 프롬프트**
```
지금까지 구조를 트리로 보여주고, pnpm install 실행해
워크스페이스가 정상 인식되는지 확인. (lockfile 생성되면 정상)
```

---
---

# Phase 1 — 토큰 패키지

> 목표: 첫 실제 패키지. 디자인 값을 코드로 정의하고 CSS 변수로 생성.
> 이 프로젝트의 심장.

## STEP 1-1. tokens 패키지 생성

**무엇을**: packages/tokens 폴더 + package.json + tsconfig + tsdown 설정.

**왜**: 토큰을 독립 패키지로 두면, 나중에 토큰만 따로 버전 관리·배포 가능.

**지시 프롬프트**
```
packages/tokens 패키지를 생성한다.
1. package.json:
   - name: "@my-ds/tokens", version: "0.0.0", type: "module"
   - sideEffects: ["*.css"]  ← 필수: 번들러가 CSS를 삭제하는 사고 방지
   - exports 필드:
     ".":            { import: "./dist/index.js", types: "./dist/index.d.ts" }
     "./styles.css": "./dist/tokens.css"
   - scripts: "build": "tsx scripts/build-css.ts && tsdown"
   - devDependencies: tsx (스크립트 실행용)
   - 그 외 의존성 없음 (순수 패키지)
2. tsconfig.json: 루트 tsconfig.base.json 을 extends, src 를 include
3. tsdown.config.ts: src/index.ts 진입, ESM 출력, dts: true, clean: true
4. src/index.ts 빈 파일 생성
5. scripts/build-css.ts 빈 파일 생성 (실제 구현은 STEP 1-3)
tsdown 0.20.x 최신 설정법을 확인해서 적용해줘.
```

**핵심 포인트**
- `exports` 필드: 패키지의 "공식 출입구". JS와 CSS를 각각 노출.
- `sideEffects: ["*.css"]`: tree-shaking 시 CSS가 날아가는 흔한 함정 방지.
- tokens는 **React도 모르는 순수 패키지**. 의존성 최소.
- `tsx`로 스크립트를 실행하는 이유: TypeScript 파일을 빌드 없이 바로 실행 가능.

**주의**
- package.json의 exports 경로가 실제 dist 출력과 일치해야 함.
  안 맞으면 import 시 "모듈 못 찾음" 에러.

**진행 기록 (2026-05-22, STEP 1-1 완료)**
- tsdown 버전: 0.22.0 은 Node `^22.18.0 || >=24` 를 요구 → 현 Node 20.19.0 에서
  동작하는 최신은 **0.21.10**. package.json 의 캐럿 범위 `^0.21.10` 이 0.22 를 자동 차단.
- ⚠️ tsdown 은 `platform: "node"`(라이브러리 기본값)에서 `fixedExtension` 기본값이
  `true` → ESM 을 `.mjs` / `.d.mts` 로 출력한다. exports 가 `.js` / `.d.ts` 라 불일치.
  `tsdown.config.ts` 에 **`fixedExtension: false`** 를 추가해 `.js` / `.d.ts` 출력으로 일치시킴.
- ⚠️ build 스크립트(`tsx scripts/build-css.ts && tsdown`)에서 tsdown `clean: true`
  가 dist 폴더 전체를 비운다. STEP 1-3 에서 build-css.ts 가 dist/tokens.css 를 먼저
  만들면 뒤이어 실행되는 tsdown 의 clean 이 그 CSS 를 지운다 → STEP 1-3 에서
  빌드 순서 또는 clean 범위를 반드시 재조정할 것.

---

## STEP 1-2. 컬러 토큰 Object 정의

**무엇을**: 색을 TypeScript Object로 정의.

**왜**: 색을 코드로 구조화하면 타입 안전 + 자동완성 + 일괄 변환 가능.

**지시 프롬프트**
```
packages/tokens/src/colors.ts 를 만든다.
2단계 구조로 설계:

1) primitive(원시) 컬러: 실제 색상값. 팔레트.
   예: blue: { 50, 100, ..., 900 } 각 단계별 hex
   gray, red, green 등 기본 팔레트.

2) semantic(의미) 컬러: 역할 기반 이름이 primitive를 참조.
   구조: { light: { primary, danger, background, text, ... },
           dark:  { primary, danger, background, text, ... } }
   예: light.primary → blue[500], dark.primary → blue[300]

as const 로 타입 고정. 전체를 export.
```

**핵심 포인트**
- **2단계 구조가 핵심.** primitive(값)와 semantic(역할)을 분리한다.
  - primitive: `blue[500] = #1976d2` (그냥 색)
  - semantic: `primary = blue[500]` (역할 = 값 참조)
- 이렇게 하면 "브랜드 색을 파랑→초록으로 변경" 시 semantic의 참조만 바꾸면 끝.
- `as const`: Object를 읽기전용 리터럴 타입으로 고정 → 자동완성 정확.

**설계 결정 (확정)**
- semantic 토큰은 `light`/`dark` 두 세트로 분리해 colors.ts 에 정의.
- 컴포넌트는 `light`/`dark`를 의식하지 않는다. CSS 변수를 한 이름으로 노출.
  → CSS 출력 시 `:root { --color-primary: ...light 값 }`, `[data-theme="dark"] { --color-primary: ...dark 값 }` 으로 자동 분기.

**진행 기록 (2026-05-22, STEP 1-2 완료)**
- primitive 팔레트: `white`, `black` + `gray`·`blue`·`green`·`red` 4계열(각 50–900,
  Tailwind 계열 hex). primitive 는 CSS 로 출력하지 않는 내부 팔레트 — semantic 만 CSS 변수가 됨.
- semantic 역할 9개(light/dark 동일): `primary, danger, success, neutral, background,
  surface, foreground, muted, border`. MVP 컴포넌트가 실제로 쓰는 역할만 정의했다.
  ⚠️ `text`/`textMuted` 로 시작했으나 STEP 2-2 에서 `foreground`/`muted` 로 개명
  (Tailwind `text-` 접두사 충돌 — `docs/edgecase/phase-2.md` W1).
  `info`/`warning` 은 의도적으로 보류 — Toast 의 info variant 는 STEP 3-6 에서 문서
  갱신 후 추가하는 편이 speculative 정의를 피한다.
- light/dark 키 불일치 방지: `SemanticTokens` 타입 + `as const satisfies` 로 두 테마가
  동일한 역할 집합을 갖도록 컴파일 타임에 강제(architecture.md 규칙 7 보강).
- 검증: `tsc --noEmit` 통과 + `tsx` 런타임 출력으로 primitive 참조가 정확한 hex 로
  해석됨을 확인.

---

## STEP 1-3. Object → CSS 변수 생성기

**무엇을**: 컬러 Object를 CSS 변수 문자열로 변환하는 함수 + 파일 생성 스크립트.

**왜**: 손으로 CSS 변수를 적으면 Object와 동기화가 깨진다. 자동 생성으로 일치 보장.

**지시 프롬프트**
```
두 파일을 만든다.

(A) packages/tokens/src/generate-css.ts
- colors Object를 받아 CSS 변수 문자열을 반환하는 함수 작성
- semantic.light → :root { --color-primary: ...; } 블록
- semantic.dark  → [data-theme="dark"] { --color-primary: ...; } 블록
- 중첩 Object를 평탄화해 --color-{역할} 형태 변수명 생성

(B) packages/tokens/scripts/build-css.ts
- generate-css 함수를 호출해 dist/tokens.css 파일을 생성
- fs.mkdirSync / fs.writeFileSync 로 dist 폴더에 저장
- "dist/tokens.css 생성 완료" 로그 출력
tsx scripts/build-css.ts 로 직접 실행해서 정상 동작 확인.
```

**핵심 포인트**
- 변수명 규칙을 일관되게: `--color-{역할}`, `--spacing-{단계}` 등.
- "Object가 진실, CSS는 파생물"이라는 원칙의 구현체.
- `tsx`는 TypeScript 파일을 빌드 없이 Node.js에서 바로 실행하는 도구.

**주의**
- build 스크립트는 `tsdown && tsx scripts/build-css.ts` 순서다 — tsdown 이
  먼저 dist 를 비우고(clean) JS/d.ts 를 만든 뒤 build-css 가 tokens.css 를
  추가한다. (CSS 를 먼저 만들면 tsdown clean 이 그것을 지운다 — 아래 W1 참조)

**엣지케이스 반영 (edgecase-review 2026-05-22 — `docs/edgecase/phase-1.md` 참조)**
- ⚠️ 빌드 순서: 위 주의의 "CSS 먼저" 는 tsdown `clean: true` 와 충돌한다 — clean 이
  방금 만든 `dist/tokens.css` 를 지운다. build 스크립트를
  **`tsdown && tsx scripts/build-css.ts`** 로 반전할 것(JS 먼저 clean+빌드 → CSS 추가).
  `index.ts` 는 `tokens.css` 를 import 하지 않아 tsdown 선행에 문제 없음.
- ⚠️ 변수명: semantic 역할 키 `textMuted` 는 camelCase. generate-css 에서
  camelCase→kebab 변환을 적용해 **`--color-text-muted`** 로 출력할 것
  (`--color-textMuted` 는 kebab 관례·Tailwind `@theme` 유틸리티명과 불일치).

**진행 기록 (2026-05-22, STEP 1-3 완료)**
- `src/generate-css.ts` 신규: 내부 헬퍼 `toKebabCase`/`declarations`/`block` +
  `generateCss(colors)` export. W2(kebab)는 `declarations` 가 모든 키에 적용
  → `textMuted` → `--color-text-muted`. light→`:root`, dark→`[data-theme="dark"]`.
- W1(빌드 순서) 반전 완료: `tsdown && tsx scripts/build-css.ts`. 전체 빌드 후
  dist 에 `index.js`·`index.d.ts`·`tokens.css` 3개 공존 확인.
- ⚠️ 함정: STEP 1-1 의 `build-css.ts` 는 빈 stub 이라 node 빌트인을 import 하지
  않아 `@types/node` 없이도 tsc 가 통과했다. STEP 1-3 에서 `node:fs/path/url` 을
  실제 import 하자 `tsc` 가 TS2307(모듈 못 찾음) → `@types/node@^20`(Node 20 환경
  매칭)을 tokens 의 devDependency 로 추가. dev·타입 전용이라 규칙 2(런타임 의존성 0)
  에 위배되지 않음(기존 `tsx` 와 동일 성격).
- 로그 바이트 수는 `css.length`(UTF-16 문자 수)가 아니라
  `Buffer.byteLength(css, "utf8")` 로 보고 — 한글 헤더 주석 때문에
  문자 수(596)≠UTF-8 바이트(640).
- `generateCss` 시그니처는 현재 `Colors` 단일 인자. STEP 1-5(타이포)에서
  다중 토큰을 받도록 확장 예정 — 지금 미리 일반화하지 않음.

---

## STEP 1-4. 다크모드 대응

**무엇을**: light/dark 두 테마의 CSS 변수 세트 생성 확인.

**왜**: 변수값만 교체하는 방식이면 컴포넌트 수정 없이 테마 전환 가능.

**지시 프롬프트**
```
generate-css.ts 가 light는 :root, dark는 [data-theme="dark"] 로
출력하는지 확인하고, 누락됐으면 보완한다.
간단한 테스트용 HTML 파일(test-dark.html)을 만들어,
<button>으로 data-theme="dark" 를 토글하면 배경색이 바뀌는 걸
눈으로 확인할 수 있게 해줘. (완료 후 이 HTML은 삭제해도 됨)
```

**핵심 포인트**
- 다크모드 = 같은 변수명, 다른 값. 클래스/컴포넌트는 그대로.

**진행 기록 (2026-05-22, STEP 1-4 완료)**
- generate-css 재확인: `:root`(light 9역할) + `[data-theme="dark"]`(dark 9역할)
  두 블록 모두 정상 — 보완 불필요(STEP 1-3 에서 이미 충족).
- `packages/tokens/test-dark.html` 생성: `./dist/tokens.css` 링크, semantic 9역할
  시각화(배경·카드·텍스트·색칩), `<html data-theme>` 토글 버튼.
- 사용자 시각 검증 통과: 토글 시 배경·표면·텍스트·색 칩 전체 전환 확인.
- edgecase-review: FAIL 0 / WARN 0.
- 참고: `data-theme="light"` 는 tokens.css 에 선택자 없음 → `:root` 만 적용
  = 라이트와 동일. 의도된 동작(dark 만 재정의, light 는 기본값).

---

## STEP 1-5. 타이포그래피 토큰

**무엇을**: 폰트 크기·굵기·줄간격 토큰.

**지시 프롬프트**
```
packages/tokens/src/typography.ts 생성.
- fontSize: xs/sm/md/lg/xl/2xl/3xl 스케일 (rem 단위)
- fontWeight: normal(400)/medium(500)/bold(700)
- lineHeight: tight/normal/relaxed
- (선택) 자주 쓰는 조합을 textStyle 프리셋으로 (heading, body, caption)
generate-css 함수를 확장해 typography도 CSS 변수로 출력:
--font-size-md, --font-weight-bold, --line-height-normal 형태.
```

**핵심 포인트**
- 크기는 **스케일(비율 단계)**로. 임의 값 남발 금지가 디자인 시스템의 본질.

**진행 기록 (2026-05-22, STEP 1-5·1-6 배치로 완료)**
- `src/typography.ts` 신규: `fontSize`(xs~3xl 7단계, rem) + `fontWeight`(normal/medium/bold)
  + `lineHeight`(tight/normal/relaxed). `as const satisfies TypographyTokens` 로 형태 고정.
- ⚠️ 모든 leaf 값을 **string** 으로 둔다 — `declarations()` 헬퍼가 `Record<string,string>`
  를 받으므로 `fontWeight` 도 `400`(number)이 아닌 `"400"`(string). CSS 값은 텍스트라 무방.
- ⚠️ `"2xl"`/`"3xl"` 키는 TS 식별자가 아니라 객체 리터럴에서 따옴표 필수. `toKebabCase`
  정규식 `/[A-Z]/g` 은 숫자를 건드리지 않아 `--font-size-2xl` 로 정상 출력.
- typography 는 light/dark 구분이 없어 light 컬러와 같은 `:root` 블록에 함께 출력.
- textStyle 프리셋(heading/body/caption)은 speculative 라 보류 — 실제 소비 컴포넌트가
  생길 때 추가(architecture.md 폴더 구조에도 없음).

---

## STEP 1-6. Shadow & Radius 토큰

**무엇을**: 그림자, 모서리 둥글기 토큰.

**지시 프롬프트**
```
packages/tokens/src/shadow.ts 와 radius.ts 생성.
- shadow: none/sm/md/lg/xl 단계별 box-shadow 값
- radius: none/sm/md/lg/full 단계별 border-radius 값
generate-css 에 통합하고, index.ts 에서 모든 토큰을 통합 export.
pnpm --filter @my-ds/tokens build 실행해서 dist 에
index.js + index.d.ts + tokens.css 가 생성되고,
tokens.css 에 색·타이포·shadow·radius 변수가 모두 들어가는지 확인.
```

**Phase 1 완료 기준**: `pnpm --filter @my-ds/tokens build` 실행 시
`dist/index.js`, `dist/index.d.ts`, `dist/tokens.css` 가 생성되고,
CSS에 `--color-*`, `--font-size-*`, `--shadow-*`, `--radius-*` 변수가 포함됨.

**진행 기록 (2026-05-22, STEP 1-5·1-6 배치로 완료)**
- `src/shadow.ts`(none/sm/md/lg/xl)·`src/radius.ts`(none/sm/md/lg/full) 신규 — 둘 다
  flat record 라 `declarations()` 헬퍼를 직접 재사용. 테마 무관 → `:root` 단일 출력.
  `radius.full` 은 `9999px`(pill) — `50%` 는 정사각형만 원이 되므로 임의 비율 대응 불가.
- ⚠️ shadow 값의 쉼표(`0 4px 6px..., 0 2px 4px...`)는 CSS 변수 값으로 유효 — 별도 처리 불필요.
- `generateCss` 시그니처 확장: 위치 인자 → **객체 인자** `generateCss({ colors, typography,
  shadow, radius })`. 명명 타입 `GenerateCssInput` 으로 추출(미exported, 내부 전용).
  토큰 그룹이 늘어도 호출 순서 혼동 없이 키만 추가하면 된다.
- `index.ts` 통합 export 완성: `colors`/`typography`/`shadow`/`radius`/`generateCss` +
  타입(`Colors`/`SemanticColorRole`/`Typography`/`Shadow`/`Radius`). ⚠️ tsconfig
  `isolatedModules` 가 켜져 있어 타입 re-export 는 반드시 `export type` 로 분리.
- ⚠️ 빌드 파이프라인(tsdown 진입점 = index.ts only / build-css 는 tsx 가 타입 스트립)은
  STEP 1-5 까지 `typography.ts` 등을 타입검사하지 않았다. STEP 1-6 에서 index.ts 가
  전 토큰을 import 하며 tsdown 빌드 범위에 들어왔고, 별도 `tsc --noEmit` 게이트도 유지.
- 검증: `tsc --noEmit` 통과 + `build` 후 `dist` 에 `index.js`·`index.d.ts`·`tokens.css`
  공존, `tokens.css` 에 color(9×2)·font-size(7)·font-weight(3)·line-height(3)·
  shadow(5)·radius(5) 전량 포함 확인. **Phase 1 완료.**

---
---

# Phase 2 — UI 기반 (Box, Flex, Storybook)

> 목표: Tailwind v4를 토큰과 연결하고, 가장 기본인 레이아웃 컴포넌트와
> 미리보기 환경(Storybook)을 만든다.

## STEP 2-1. ui 패키지 뼈대 생성

**무엇을**: packages/ui 폴더 + 의존성 + tsdown 설정.

**왜**: 컴포넌트 개발 전에 빌드 환경을 먼저 잡아야 한다.

**지시 프롬프트**
```
packages/ui 패키지를 생성한다.
1. package.json:
   - name: "@my-ds/ui", version: "0.0.0", type: "module"
   - sideEffects: ["*.css"]
   - peerDependencies: react (18 or 19), react-dom
   - dependencies: "@my-ds/tokens": "workspace:*"
   - exports:
     ".":             { import: "./dist/index.js", types: "./dist/index.d.ts" }
     "./styles.css":  "./dist/styles.css"
   - scripts: "build": "tsdown"
2. tsconfig.json: 루트 tsconfig.base.json extends, src 포함
3. tsdown.config.ts:
   - 진입점: src/index.ts
   - ESM 출력, dts: true, clean: true
   - external: ["react", "react-dom", "react/jsx-runtime"]
     (라이브러리에 React를 중복 포함하지 않으려면 external 처리 필수)
4. src/index.ts 빈 파일 생성

peerDependency와 external 처리 이유, workspace:* 의미를 주석으로 남겨줘.
pnpm install 실행해서 workspace 의존성이 인식되는지 확인.
```

**핵심 포인트**
- **React를 peerDependency로**: 사용처의 React를 쓰도록 함. 안 그러면 React가
  두 벌 로드돼 "Hooks can only be called inside of the body of a function component" 에러.
- **workspace:\***: 로컬 `@my-ds/tokens` 패키지를 디렉토리에서 직접 참조. npm publish 전에도 동작.
- CSS는 별도 `exports["./styles.css"]` 로 노출. JS import 와 CSS import 를 분리.

**진행 기록 (2026-05-22, STEP 2-1 완료)**
- `packages/ui` 신규: `package.json`·`tsconfig.json`·`tsdown.config.ts`·빈
  `src/index.ts` 4파일. `pnpm install` → 워크스페이스 3개 인식,
  `packages/ui/node_modules/@my-ds/tokens` 심볼릭 링크 생성 확인.
- ⚠️ **tsdown 0.21.x — `external` 옵션 deprecated**: 위 스펙의 최상위 `external` 은
  `WARN  \`external\` is deprecated. Use \`deps.neverBundle\` instead.` 경고를 낸다.
  동작은 하나 빌드마다 경고가 떠 현행 API 인 **`deps: { neverBundle: [...] }`** 로
  작성했다. `neverBundle` 은 `ExternalOption`(문자열·정규식·배열)을 받는다.
- `fixedExtension: false` 적용 — tokens STEP 1-1 함정과 동일. ESM 이 `.mjs` 아닌
  `.js`/`.d.ts` 로 출력돼 `exports` 경로와 일치함을 빌드로 확인.
- `src/index.ts` 는 `export {}` 만 둔 빈 ESM 모듈 — `isolatedModules` 환경에서
  빈 파일을 명시적 모듈로 만들고 tsdown 이 `.d.ts` 를 생성하게 한다. 컴포넌트
  export 는 STEP 2-3 부터 추가.
- 검증: `pnpm --filter @my-ds/ui build` → `dist/index.js`·`dist/index.d.ts` 생성,
  경고 0. `tsc -p tsconfig.json` 통과.
- ⚠️ `exports["./styles.css"]` → `dist/styles.css` 는 아직 없음 — STEP 2-2 의
  `theme.css` 가 만든다. tokens STEP 1-1 과 같은 일시적 forward 선언이라
  소비자가 없는 현재 시점에선 무방.
- ⚠️ `react`/`react-dom` 은 `peerDependencies` 로만 선언 — devDependency 없음.
  빈 `index.ts` 라 STEP 2-1 빌드엔 무영향이나, **STEP 2-3(Box) 진입 시
  `react`·`react-dom`·`@types/react`·`@types/react-dom` 을 `devDependencies` 로
  먼저 설치**해야 React 코드 빌드·타입검사가 된다 (`docs/edgecase/phase-2.md` 참조).
- tsdown 0.21.10 이 `Node.js v20.19.0 is deprecated` 안내를 출력 — 의도된 핀
  (0.22+ 는 Node 22+ 요구). 업그레이드 금지.

---

## STEP 2-2. Tailwind v4 + 토큰 연결

**무엇을**: Tailwind v4를 설치하고, tokens.css의 CSS 변수를 Tailwind 유틸리티로 노출.

**왜**: 컴포넌트가 `bg-primary` 같은 토큰 기반 클래스를 쓸 수 있게 하는 토대.

**지시 프롬프트**
```
packages/ui 에 Tailwind v4를 설치하고 토큰과 연결한다.

1. 설치: pnpm --filter @my-ds/ui add -D tailwindcss @tailwindcss/vite
   (v4는 tailwind.config.js 불필요. PostCSS 플러그인도 불필요.)

2. tsdown.config.ts 에 @tailwindcss/vite 플러그인 추가

3. packages/ui/src/theme.css 생성:
   @import "tailwindcss";
   @import "@my-ds/tokens/styles.css";

   @theme {
     --color-primary:    var(--color-primary);
     --color-danger:     var(--color-danger);
     --color-background: var(--color-background);
     --color-text:       var(--color-text);
     /* (tokens.css 에 있는 모든 semantic 변수를 @theme 에 매핑) */
   }

4. tsdown.config.ts 의 CSS 진입점에 src/theme.css 추가

5. 검증: pnpm --filter @my-ds/ui build 후 dist/styles.css 에
   bg-primary, text-primary 같은 유틸리티 클래스가 있는지 확인.
   없으면 @theme 설정을 재확인.

Tailwind v4 설정법이 문서와 다른 부분이 있으면 알려줘.
```

**핵심 포인트**
- **v4의 핵심**: `@import "tailwindcss"` + `@theme { }` 블록이 전부. config 파일 없음.
- `@theme`에 CSS 변수를 등록하면 Tailwind가 자동으로 `bg-*`, `text-*`, `border-*` 등 유틸리티 생성.
- `@import "@my-ds/tokens/styles.css"` 를 먼저 해야 `var(--color-primary)` 참조가 유효.

**주의**
- `@tailwindcss/vite` 플러그인이 tsdown(Rolldown 기반)과 호환되는지 빌드 결과로 확인 필요.
  문제가 생기면 대안(`@tailwindcss/postcss` + postcss 플러그인) 으로 전환.

**진행 기록 (2026-05-22, STEP 2-2 완료)**
- 설치: `tailwindcss@4.3.0` + `@tailwindcss/cli@4.3.0` (ui devDependency).
  `@tailwindcss/vite` 는 설치했다가 제거.
- ⚠️ **`@tailwindcss/vite` ↔ tsdown 비호환** (위 주의의 리스크가 현실화): tsdown
  빌드 시 `TypeError: Cannot read properties of null (reading 'createResolver')` —
  플러그인이 Vite 전용 컨텍스트를 기대한다. 스펙의 폴백 `@tailwindcss/postcss` 도
  tsdown 의 postcss 호스팅이 불안정(실험적 `@tsdown/css` 패키지 필요)해, 공식
  **`@tailwindcss/cli` 별도 빌드 단계**로 전환했다.
  build 스크립트 = `tsdown && tailwindcss -i src/theme.css -o dist/styles.css`
  (tokens 의 `tsdown && tsx ...` 2단계 패턴과 동일). 설계 결정 변경이라
  `architecture.md` §6 을 먼저 갱신.
- `src/theme.css` 신규: `@import "tailwindcss"` + `@import "@my-ds/tokens/styles.css"`
  + `@theme inline { semantic 컬러 9역할 }`.
- ⚠️ **`@theme inline` 채택** (스펙은 plain `@theme`): 외부 토큰 변수를 `@theme` 에
  별칭으로 둘 때의 표준 관용. ※ "plain `@theme` 는 자기참조 순환으로 깨진다" 는
  부정확하다 — Tailwind v4 는 `@theme` 출력을 `@layer theme` 안에 넣고, layer 가 없는
  `tokens.css` 선언이 CSS cascade 에서 이겨 토큰 값이 항상 권위를 가진다. inline/plain
  둘 다 동작하나 inline 이 의도를 드러내는 올바른 관용이라 채택.
- ⚠️ **Tailwind v4 유틸리티는 사용처 스캔 기반(on-demand)**: 컴포넌트가 없는 STEP 2-2
  클린 빌드의 `dist/styles.css` 는 `@layer utilities` 가 비어 있다(정상). 스펙의
  "`bg-primary` 있는지 확인" 은 v3식 가정 — 임시 probe 파일(`src/_tw-probe.ts`)로
  `.bg-primary { background-color: var(--color-primary) }` 생성을 확인한 뒤 probe 를
  삭제했다. 실제 유틸리티는 STEP 2-3+ 컴포넌트가 클래스를 쓰면 생성된다.
- 검증: `dist` 에 `index.js`·`index.d.ts`·`styles.css`. `styles.css` 에 Tailwind
  preflight + `@layer theme`(컬러 9역할 매핑) + `tokens.css` 인라인(`:root`·
  `[data-theme="dark"]` 전 변수) 포함 확인.
- 엣지케이스(`docs/edgecase/phase-2.md`): (W1) `text`/`textMuted` 역할명이 어색한
  `text-text`/`text-text-muted` 유틸리티를 만들어 → 사용자 결정으로 tokens 에서
  `foreground`/`muted` 로 **개명 완료**(유틸리티가 `text-foreground`/`text-muted` 로 정상화).
  (W2) `theme.css` 의 `@theme` 목록은 수동 유지 — 토큰 역할 변경(STEP 3-6 info variant 등)
  시 동기화 필요.

---

## STEP 2-3. Box 컴포넌트

**무엇을**: 모든 컴포넌트의 기반이 되는 기본 상자.

**왜**: Box를 이해하면 나머지 컴포넌트가 응용으로 보인다.

**지시 프롬프트**
```
packages/ui/src/Box 에 Box 컴포넌트를 만든다.
- as prop 으로 렌더링할 태그 변경 가능 (polymorphic, 기본 div)
- className 을 받아 Tailwind 클래스 병합
  clsx + tailwind-merge 조합 사용:
    pnpm --filter @my-ds/ui add clsx tailwind-merge
  cn() 유틸 함수를 src/utils/cn.ts 에 만들고 Box에서 사용.
- forwardRef 로 ref 전달 지원
- TypeScript로 as 에 따라 props 타입이 바뀌도록 (가능한 범위에서)
간단하게 시작하고, 과한 polymorphic 타입은 피해서 가독성 우선.
```

**핵심 포인트**
- **polymorphic(as prop)**: `<Box as="section">` 처럼 태그를 바꿀 수 있는 패턴.
- **tailwind-merge**: `cn("bg-red-500", "bg-blue-500")` → `"bg-blue-500"` 으로
  충돌하는 Tailwind 클래스를 자동 dedupe. clsx만 쓰면 둘 다 남아서 예측 불가.
- `forwardRef`: 부모가 DOM 요소에 직접 접근할 수 있게. 라이브러리 컴포넌트 필수.

**진행 기록 (2026-05-22, STEP 2-3·2-5 배치로 완료)**
- 선행 설치: `react`·`react-dom`·`@types/react`·`@types/react-dom` 를 ui 의
  **devDependencies** 로(react 19.2.6 — peerDep `^18||^19` 충족). `clsx`(^2.1.1)·
  `tailwind-merge`(^3.6.0) 는 **dependencies**. ⚠️ tailwind-merge 는 v3+ 가
  Tailwind v4 호환(v2 는 v3 용) — 현 tailwind 4.3.0 과 맞다. tsdown 은
  `dependencies` 를 자동 external 처리해 clsx/tailwind-merge 가 번들에 안 들어간다.
- `src/utils/cn.ts`: `cn(...inputs) = twMerge(clsx(inputs))`. clsx 는 조건부 병합,
  twMerge 는 충돌 Tailwind 클래스 dedupe.
- `src/Box/Box.tsx`: polymorphic Box. 공개 타입 `BoxProps<T>` = `{as?: T} &
  Omit<ComponentPropsWithoutRef<T>, "as">`. ⚠️ **구현부 props 는 `BoxProps<ElementType>`
  로 느슨하게** 둔다 — 제네릭 T 그대로면 `className` 구조분해·`...rest` 전개에서
  TS 가 "키 존재 불명" 으로 막는다. 정확한 제네릭은 export 캐스팅이 공개 API 에
  부여한다(`forwardRef` 가 제네릭을 보존 못 하는 한계 우회). `as` 누락 시 `div` 폴백.
- ⚠️ **displayName 함정**(edgecase-review WARN, `docs/edgecase/phase-2.md`):
  캐스팅 후의 타입은 순수 함수라 `.displayName` 을 못 받는다 → `forwardRef` 결과를
  중간 변수(`BoxImpl`)로 끊고 캐스팅 "전" 에 displayName 설정. Box·Flex·Stack 동일.

---

## STEP 2-4. Storybook 세팅

**무엇을**: 컴포넌트를 앱 없이 미리보는 환경.

**지시 프롬프트**
```
packages/ui 에 Storybook 10 을 세팅한다.
- React + Vite 기반: pnpm dlx storybook@latest init
  (packages/ui 디렉토리 안에서 실행. 프레임워크: react-vite 선택)
- .storybook/preview.ts 에 theme.css import (토큰 변수 + 유틸리티 클래스 로드)
- 다크모드 토글: 글로벌 데코레이터 방식으로 구현
  .storybook/preview.ts 에 toolbar globalType "theme" 추가,
  데코레이터에서 story를 감싸는 div에 data-theme 을 적용.
  나중에 @storybook/addon-themes 로 교체 가능하도록 data-theme 속성은 유지.
- Box 컴포넌트의 첫 스토리(.stories.tsx) 작성:
  Primary(기본), AsParagraph(as prop 예시) 두 스토리.
scripts: "storybook": "storybook dev -p 6006" 추가.
Storybook 10 기준 설치 명령·설정을 확인해서 진행해줘.
```

**핵심 포인트**
- Storybook에 theme.css를 로드해야 컴포넌트가 토큰 색으로 보인다.
- 글로벌 데코레이터: Storybook의 모든 스토리에 공통 래퍼를 씌우는 방법.
  `data-theme` 값을 데코레이터가 제어하면 모든 컴포넌트의 다크모드를 즉시 확인 가능.

**진행 기록 (2026-05-22, STEP 2-4 완료)**
- Storybook **10.4.0** + `@storybook/react-vite` + `@storybook/addon-docs`(전부 10.4.0)
  설치. Node 요구사항은 20.16+ — 현 20.19.0 통과. SB10 은 ESM-only.
- ⚠️ **`storybook init` 비대화형 실패**: `CI=true ... init` 으로 실행했으나
  `packages/ui` 에 Vite/Webpack 이 없어 빌더 자동감지에 실패 → 대화형 select 프롬프트
  에서 멈춤(비-TTY 라 응답 불가). init 은 흔적을 남기지 않았다(클린). → **수동 설치**
  로 전환: 패키지 직접 설치 + `.storybook/main.ts`·`preview.tsx` 직접 작성.
- ⚠️ **pnpm 빌드 스크립트 차단**: pnpm 10 은 의존성의 install/postinstall 을 기본
  차단한다. Vite 가 쓰는 `esbuild`, Storybook 의 `@parcel/watcher` 가 막혀
  → 루트 `package.json` 에 `"pnpm": { "onlyBuiltDependencies": ["esbuild",
  "@parcel/watcher"] }` 추가 후 `pnpm install` 재실행해 네이티브 빌드 수행.
- Tailwind 처리: A안 채택 — `.storybook/main.ts` 의 `viteFinal` 에 `@tailwindcss/vite`
  플러그인을 끼워 `theme.css` 를 Storybook(Vite) 에서 라이브 처리. STEP 2-2 에서
  tsdown 비호환으로 버린 그 플러그인을, 진짜 Vite 인 Storybook 에서 정상 사용.
  버전: `vite@8`·`@storybook/react-vite@10.4`·`@tailwindcss/vite@4.3` peer 호환 확인.
- `.storybook/preview.tsx`(`.tsx` — 데코레이터가 JSX 반환): `theme.css` import +
  `globalTypes.theme` 툴바 선택기 + `data-theme` 래퍼 데코레이터(배경·글자색은
  토큰 CSS 변수 `var(--color-*)` 직접 참조 → 테마 전환이 한눈에 보임).
- 스토리: `Box`(Primary/AsParagraph — AsParagraph 는 `as="p"` 타입 충돌 회피로
  `render` 사용), `Flex`(Playground/Column/SpaceBetween + argTypes 컨트롤),
  `Stack`(Default/LargeGap). CSF3 형식, `tags:["autodocs"]`.
- ⚠️ **CSS 누출 엣지케이스**(edgecase-review WARN, `docs/edgecase/phase-2.md`):
  `src/` 에 들어온 `*.stories.tsx` 가 라이브러리 빌드 Tailwind 스캔에 잡혀 스토리
  전용 클래스가 `dist/styles.css` 로 새어 나갔다. → `src/library.css`(= `theme.css`
  `@import` + `@source not "**/*.stories.tsx"`)를 라이브러리 빌드 진입 CSS 로 분리,
  build 스크립트를 `-i src/library.css` 로 변경. `theme.css` 는 `@source not` 없는
  공유 base 로 유지(Storybook 은 이걸 직접 import 해 스토리 클래스 정상 생성).
- 검증: `tsc` 통과 / 라이브러리 빌드 — `dist/styles.css` 에 스토리 클래스 0,
  레이아웃 클래스 정상 / `storybook build` 성공 — `storybook-static` CSS 에 스토리
  클래스 포함 / `storybook dev` 정상 기동(localhost:6006). ⚠️ 토큰 색 렌더·다크모드
  토글의 **시각 확인은 사용자 몫**(에이전트가 브라우저를 볼 수 없음).

---

## STEP 2-5. Flex / Stack 컴포넌트

**무엇을**: 레이아웃 컴포넌트.

**지시 프롬프트**
```
Box를 기반으로 Flex 컴포넌트를 만든다.
- direction, align, justify, gap prop 을 토큰 기반으로
- gap 은 Tailwind spacing 유틸리티 사용
- Box를 내부적으로 활용 (as 활용)
이어서 세로 정렬 단축인 Stack(VStack)도 간단히.
각각 Storybook 스토리 작성.
```

**핵심 포인트**
- Flex가 Box 위에 만들어진다는 점에서 "기반 컴포넌트의 재사용"을 체득.

**진행 기록 (2026-05-22, STEP 2-3·2-5 배치로 완료)**
- `src/Flex/Flex.tsx`: Box 기반(`<Box as={as} .../>`). props `direction`(기본 row)·
  `align`·`justify`·`gap`. ⚠️ **prop→클래스는 정적 매핑 객체** 로 둔다 — Tailwind v4
  는 소스를 스캔해 등장한 클래스만 생성하므로 `flex-${dir}` 같은 동적 조합은 못
  찾는다. `directionClass`/`alignClass`/`justifyClass`/`gapClass` 에 완성 클래스명
  리터럴을 나열. gap 스케일은 Tailwind 기본 spacing 단계 `0|1|2|3|4|6|8`.
  ⚠️ gap 은 `0` 이 유효값(`gap-0`)이라 `gap &&` 가 아닌 `gap !== undefined` 로 검사.
- `src/Flex/Stack.tsx`: `direction="column"` 고정 단축. `StackProps` =
  `Omit<FlexProps, "direction">` 로 direction 을 외부에서 못 덮어쓰게 한다.
  Flex→Box 체인 위에 다시 얹혀 "기반 재사용" 이 2단이 된다.
- ⚠️ **스토리 미작성**: STEP 2-4(Storybook)가 분리돼 Storybook 미설치 상태 →
  Box·Flex·Stack 의 `.stories.tsx` 는 전부 STEP 2-4 로 이월(STEP 2-4 진입 시 일괄 작성).
- 검증: `pnpm --filter @my-ds/ui build` 통과, `tsc` 통과. `dist/styles.css` 에
  `.flex`·`.flex-row/col`·`.items-*`(5)·`.justify-*`(5)·`.gap-*`(7) 유틸리티가
  on-demand 로 생성됨을 확인(STEP 2-2 까지 비어 있던 `@layer utilities` 가 채워짐).
  `dist/index.d.ts` 에 3컴포넌트의 제네릭 시그니처 + prop 타입 export 확인.

**Phase 2 완료 기준**: `pnpm --filter @my-ds/ui storybook` 실행 시
Box, Flex가 토큰 색으로 렌더되고, toolbar에서 다크모드 토글이 동작.

---
---

# Phase 3 — 핵심 컴포넌트

> 목표: 디자인 시스템의 꽃. Button, TextInput, Toast.

## STEP 3-1. Button (1) — variant / color / size

**무엇을**: 버튼의 시각 변형 체계.

**지시 프롬프트**
```
packages/ui/src/Button 에 Button 컴포넌트를 만든다.
- variant: solid / outline / ghost
- color: primary / danger / neutral (토큰 기반)
- size: sm / md / lg
- variant×color 조합별 Tailwind 클래스 관리에 cva(class-variance-authority) 사용:
    pnpm --filter @my-ds/ui add class-variance-authority
- Box 또는 button 기반, forwardRef 지원
모든 variant×color×size 조합을 보여주는 Storybook 스토리 작성.
cva 사용법을 주석으로 간단히 설명해줘.
```

**핵심 포인트**
- **variant 패턴**: 같은 컴포넌트의 여러 모습을 prop으로 관리하는 핵심 패턴.
- **cva**: `cva("base-class", { variants: { variant: { solid: "...", outline: "..." } } })` 형태.
  variant 조합이 많아질 때 클래스 관리를 깔끔하게 해준다.

**진행 기록 (2026-05-22, STEP 3-1 완료)**
- `class-variance-authority@^0.7.1` 을 ui 의 **`dependencies`** 로 설치 — cva 는
  런타임에 className 을 계산하므로 dependency 다(clsx/tailwind-merge 와 동일 성격).
  tsdown 이 `dependencies` 를 자동 external 처리해 번들에 안 들어간다.
- `Button.tsx`: **순수 `<button>` + `forwardRef`** 로 구현(Box 기반 아님). Button 은
  polymorphic 이 아니라 항상 button 이므로 Box·Flex 의 제네릭 캐스팅(→ displayName
  함정)이 불필요하다. `forwardRef(ButtonInner)` 결과에 `.displayName` 을 바로 지정.
- ⚠️ **cva 구조**: `variant`(solid/outline/ghost)·`color`(primary/danger/neutral)는
  단독으로는 시각 결과를 못 정한다(배경·테두리·글자색이 둘의 *조합*으로 결정) →
  `variants` 에는 옵션만 빈 문자열로 선언하고, 실제 클래스는 `compoundVariants` 가
  variant×color 9조합으로 부여한다. `size` 만 독립적이라 `variants.size` 에 단독 선언.
- ⚠️ **베이스에 `border border-transparent`**: solid/ghost 도 1px 투명 테두리를 둬
  outline(색 테두리)과 박스 크기를 픽셀 단위로 일치시킨다. cva 출력이
  `border-transparent` → (outline 시) `border-primary` 순서라 `cn`/twMerge 가
  뒤엣것을 남겨 정상 dedupe 된다.
- ⚠️ **solid 글자색 = `text-background`** (문서 예시의 `text-white` 아님): `text-white`
  는 불변규칙 3(색 하드코딩) 위반 + dark 테마의 옅은 primary 위에서 대비가 깨진다.
  `text-background` 는 토큰 기반이며 light=거의 흰색/dark=거의 검정으로 자동 반전돼
  두 테마 모두 대비 확보(`docs/edgecase/phase-3.md` 참조).
- ⚠️ **타입은 `VariantProps<typeof buttonStyles>`** 로 cva 정의에서 자동 추출 —
  variant 옵션 변경 시 prop 타입이 자동 추종. `ComponentPropsWithoutRef<"button">`
  와 합쳐도 `color`/`size` 키 충돌 없음(네이티브 button 속성에 없는 이름).
- `type` 미지정 시 `"button"` 폴백 — `<form>` 안에서 submit 으로 동작하는 함정 방지.
- 스토리: `Playground`(Controls) + `AllCombinations`(size별 variant×color 27조합 전체).
  Tailwind 정적 클래스 원칙은 cva 가 보장 — 조합 클래스 리터럴이 Button.tsx 안에
  있어 스캐너가 인식한다(스토리가 variant 값을 동적으로 넘겨도 무방).
- 검증: `tsc -p tsconfig.json` 통과 / `build` 후 `dist` 에 index.js·d.ts·styles.css,
  d.ts 에 Button + ButtonProps(variant·color·size 리터럴 유니온) export, styles.css
  에 토큰 유틸리티(`bg-primary`·`text-background`·`border-danger`·`hover:bg-*/90` 등)
  전량 생성 확인. `disabled`/`focus-visible` 스타일은 STEP 3-2 범위라 제외.

---

## STEP 3-2. Button (2) — loading / 접근성

**무엇을**: 로딩 상태 + 기본 접근성.

**지시 프롬프트**
```
Button에 추가한다.
- isLoading prop: true면 스피너 표시 + 버튼 비활성 + aria-busy="true"
- disabled 처리, 포커스 스타일 (focus-visible 활용)
- aria-disabled (실제 disabled 와 달리 포커스 유지 가능)
로딩/비활성 상태 스토리 추가.
```

**핵심 포인트**
- 로딩 중엔 중복 클릭을 막아야 함 (disabled + aria-busy).
- `focus-visible`: 마우스 클릭 시엔 포커스 링 안 보이고, 키보드 탐색 시엔 보임.

**진행 기록 (2026-05-22, STEP 3-2·3-3 배치 — git worktree `phase3/button`, 커밋 7530972)**
- `isLoading` prop 추가. 스피너는 인라인 SVG(`animate-spin`, `stroke`/`fill` =
  `currentColor` → 버튼 글자색 토큰을 그대로 상속, `aria-hidden`).
- ⚠️ **스피너 오버레이 + 너비 보존**: 스피너를 `absolute inset-0` 로 버튼 위에
  겹치고 children 은 `invisible` 로 자리만 차지시킨다 → 로딩 중에도 버튼 너비가
  글자 기준으로 유지돼 레이아웃 시프트가 없다. 베이스에 `relative` 추가(겹침 기준점).
- focus 스타일: 베이스에 `focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-offset-2 focus-visible:ring-offset-background`. ring 색은
  color 단독으로 정해지므로 `color` variant 가 `focus-visible:ring-{color}` 를
  직접 보유한다(STEP 3-1 의 빈 문자열에서 변경). 키보드 Tab 포커스에서만 링 표시.
- ⚠️ **disabled 처리 = 하이브리드 2경로**: `disabled` prop → 네이티브 `disabled`
  (포커스 자체가 불가). `aria-disabled` prop·`isLoading` → "부드러운 비활성"
  (포커스는 유지, 클릭만 JS 로 차단). spec 의 "aria-disabled (실제 disabled 와
  달리 포커스 유지)" 를 별도 경로로 구현 — 둘을 한 버튼에 동시에 걸지 않는다.
- 시각: 순수 비활성(`isDisabled && !loading`)일 때만 `opacity-50 cursor-not-allowed`
  (로딩은 스피너가 신호라 안 흐리게), 로딩 중에는 `cursor-wait`.
- 동작 로직(클릭 차단·`aria-busy`·`aria-disabled`)은 STEP 3-3 의 `useButton` 훅으로
  바로 분리해 구현(3-2·3-3 이 한 커밋). `aria-disabled` 속성값은 boolean·"true"
  문자열 모두 정규화해 훅에 전달.
- 스토리: `Loading`·`Disabled`·`DisabledVariants`(native disabled ↔ aria-disabled 비교).

---

## STEP 3-3. Button — headless 분리 (개념 심화)

**무엇을**: 동작과 스타일 분리.

**왜**: 토글 버튼 등 동작이 복잡한 경우, 로직을 재사용하기 위해.

**지시 프롬프트**
```
Button의 동작 로직(클릭/로딩/비활성 처리)을 useButton 커스텀 훅으로 분리하고,
시각 컴포넌트는 그 훅을 사용하도록 리팩터링한다.
이어서 같은 패턴으로 ToggleButton(눌림 상태 토글)을 만든다.
headless 패턴의 이점을 주석으로 설명해줘.
```

**핵심 포인트**
- **headless = 로직(훅) + 스타일(컴포넌트) 분리.** 로직 재사용성↑.
- Button을 충분히 이해한 뒤 진행.

> ⚡ 시간이 부족하면 이 STEP은 백로그로 미뤄도 된다. Toast(STEP 3-6)가 더 우선.

**진행 기록 (2026-05-22, STEP 3-2·3-3 배치 — 같은 커밋 7530972)**
- ⚠️ 이 STEP 은 위 "백로그로 미뤄도 된다" 표시였으나 **실제로 완료됨** —
  mvp-checklist 의 해당 줄을 체크 처리했다.
- `useButton.ts` 신규 — headless 동작 훅. `UseButtonOptions{ isLoading, disabled,
  ariaDisabled, onClick }` → `UseButtonResult{ buttonProps, isLoading, isDisabled }`.
  `buttonProps`(`disabled`·`onClick`·`aria-busy`·`aria-disabled`)를 `<button>` 에
  그대로 spread 한다.
- ⚠️ **클릭 차단에 `stopPropagation` 까지**: 부드러운 비활성(`ariaDisabled ||
  isLoading`)일 때 `preventDefault()` + **`stopPropagation()`** 를 함께 호출한다.
  네이티브 disabled 버튼은 클릭 이벤트 자체가 안 생겨 부모로 버블링도 안 되는데,
  부드러운 비활성이 그 동작을 흉내내려면 전파까지 막아 상위 `onClick` 도 차단해야
  한다. `handleClick` 은 `useCallback` 으로 안정화.
- `Button.tsx` 를 useButton 사용하도록 리팩터링 — 시각 컴포넌트는 스피너·className
  만, 동작은 전부 훅에 위임.
- `ToggleButton.tsx` 신규 — 제어/비제어 양쪽 지원(`pressed`/`defaultPressed`/
  `onPressedChange`), `aria-pressed` 자동 계산. 눌림=solid·안눌림=outline 으로
  `buttonStyles` 표를 재사용 → 색·크기 체계가 Button 과 완전 일치. 동작(useButton)
  + 룩(buttonStyles) 재사용 + 토글 로직만 신규 작성 = headless 패턴의 실증.
- ⚠️ `buttonStyles`·`ButtonVariantProps` 가 `Button.tsx` 에서 export 됨(ToggleButton
  재사용용). 단 `Button/index.ts` 배럴에는 미포함 → 패키지 공개 API 가 아닌 폴더
  내부 공유다.
- `ToggleButton` 은 `aria-pressed` 를 눌림 상태에서 자동 계산하므로
  `Omit<...,"aria-pressed">` 로 외부 덮어쓰기를 막고, variant 대신 `color`/`size` 만
  `Pick` 으로 노출(variant 는 눌림 상태가 결정).
- 스토리: `Toggle`(Button.stories.tsx 에 포함).

---

## STEP 3-4. TextInput (1) — Controlled 개념

**무엇을**: 입력값을 React가 관리하는 Controlled 컴포넌트.

**지시 프롬프트**
```
packages/ui/src/TextInput 에 TextInput을 만든다.
- Controlled 방식 기본 (value + onChange)
- 토큰 기반 스타일, 포커스/에러/비활성 상태
- label, helperText, error prop 지원, 적절한 aria 연결:
  (label-input id 연결, aria-invalid, aria-describedby)
스토리: 기본/에러/비활성 상태.
Controlled vs Uncontrolled 차이를 주석으로 간단히.
```

**핵심 포인트**
- **Controlled**: value를 React state로 관리. 폼 검증·제어에 유리. 기본 권장.
- 접근성: label과 input을 id로 연결, 에러는 aria-invalid + aria-describedby.

**진행 기록 (2026-05-22, STEP 3-4·3-5 배치 — git worktree `phase3/textinput`, 커밋 82fd8bd)**
- `TextInput.tsx` 신규 — 입력값 state 를 스스로 두지 않는 presentational 컴포넌트.
  `value`/`onChange`/`defaultValue` 가 모두 `...rest` 로 네이티브 `<input>` 에
  전달돼 Controlled·Uncontrolled 양쪽이 동작한다(권장은 Controlled).
- `cva` `fieldStyles` — 외곽 상자(테두리·배경·포커스 링)를 `invalid`(error 유무)·
  `disabled` 두 boolean variant 표로 관리.
- ⚠️ **포커스 링은 래퍼가 `focus-within:` 으로**: 자식 `<input>` 이 포커스를 받아도
  *래퍼* 가 링을 그린다 → addon(STEP 3-5)이 있든 없든 동일하게 동작한다. input
  자신은 `border-0 bg-transparent outline-none` 으로 테두리·링을 제거.
- 접근성: `useId` 로 안정적 id 생성 → `label htmlFor` ↔ `input id` 연결,
  설명문(error/helper) id ↔ `aria-describedby`. `error` 있으면 `aria-invalid`.
  소비자가 직접 넘긴 `aria-describedby` 와 우리 id 를 공백으로 병합(둘 다 보존).
- 설명문은 하나만 — error 가 있으면 helperText 를 가린다.
- Flex 기반(`Box → Flex → TextInput` 재사용 체인).
- 스토리: `Playground`(controlled)·`Default`·`WithError`·`Disabled`.

---

## STEP 3-5. TextInput (2) — Addons (응용)

**무엇을**: 입력창 좌/우에 아이콘·버튼 붙이기.

**지시 프롬프트**
```
TextInput에 leftAddon / rightAddon prop을 추가한다.
(검색 아이콘, 단위 표시, 비밀번호 표시 토글 등을 넣을 수 있게)
레이아웃이 깨지지 않게 Flex 기반으로 감싸고, 스토리 추가.
```

**진행 기록 (2026-05-22, STEP 3-4·3-5 배치 — 같은 커밋 82fd8bd)**
- `leftAddon`/`rightAddon` prop(`ReactNode`) — `TextInput` 이 처음부터 addon 지원을
  포함해 작성됐다(3-4·3-5 가 한 커밋). Flex(`align="stretch"`)로
  `[leftAddon | input | rightAddon]` 가로 배치, addon 컨테이너는 `px-3 text-muted`
  (SVG 아이콘이 `currentColor` 로 muted 색을 상속).
- ⚠️ addon 이 붙는 쪽의 input 패딩 제거(`leftAddon` → `pl-0`, `rightAddon` →
  `pr-0`) — 안 그러면 addon 의 `px-3` 과 input 의 `px-3` 이 겹쳐 간격이 두 배가 된다.
- `min-w-0` 로 flex 자식 input 이 좁은 폭에서 컨테이너를 넘치지 않게 한다.
- 스토리: `WithLeftAddon`(검색 아이콘)·`WithRightAddon`(비밀번호 표시 토글 버튼)·
  `WithBothAddons`(`https://` 접두 + `.com` 접미).

---

## STEP 3-6. Toast Provider (전역 상태 패턴)

**무엇을**: 알림 메시지를 띄우는 전역 시스템.

**왜**: Provider + Context + Hook 으로 전역 상태를 다루는 핵심 패턴 학습.

**지시 프롬프트**
```
packages/ui/src/Toast 에 Toast 시스템을 만든다.
- ToastProvider: 앱을 감싸는 Context Provider
- useToast 훅: toast.show('메시지', { variant: 'success' }) 형태
- Toast UI: 화면 모서리에 쌓이고, 일정 시간 후 자동 사라짐
- 접근성: role="status" 또는 aria-live="polite" 로 스크린리더 알림
- 토큰 기반 스타일, success/error/info variant (cva 활용)
Storybook에서 버튼 클릭으로 토스트를 띄우는 데모 스토리 작성.
Context/Provider 패턴을 주석으로 설명해줘.
```

**핵심 포인트**
- **Provider 패턴**: 앱 최상단에서 Context로 전역 기능 제공.
- `useToast` 로 어디서든 토스트 호출. 전역 상태 관리의 기본형.
- `aria-live`: 동적으로 나타나는 메시지를 스크린리더가 읽게.

**진행 기록 (2026-05-22, STEP 3-6 — git worktree `phase3/toast`, 커밋 f39eb33)**
- `ToastProvider.tsx` — Context + Provider. `toasts` 목록 state, `show(message,
  options) → id` / `dismiss(id)` API. id 는 `useRef` 카운터(리렌더와 무관),
  자동소멸 타이머는 `useRef(Map)` 에 보관 → 수동 닫기·언마운트 시 `clearTimeout`
  으로 정리(메모리 누수·죽은 setState 방지). API 객체는 `useMemo`+`useCallback`
  으로 안정화해 불필요한 소비자 리렌더를 막는다.
- **ToastViewport**: `fixed right-0 bottom-0`, `aria-live="polite"`(토스트 추가 시
  스크린리더가 낭독), `pointer-events-none`(빈 영역이 뒤 UI 클릭을 막지 않게) +
  토스트만 `pointer-events-auto` 로 되살림. 라이브 영역은 toasts 가 비어도 항상 렌더.
- `useToast.ts` — `useContext` 소비자 훅. Provider 밖에서 호출하면 null 가드로
  명확한 에러를 던진다.
- `Toast.tsx` — 단일 토스트 시각. `cva` `toastStyles`, `variant` success/error/info
  → 왼쪽 굵은 테두리(`border-l-4`) 색 + 색점. variant 가 단독으로 결과를 정하므로
  Button 과 달리 compoundVariants 가 필요 없다. 닫기 ✕ 버튼(`aria-label="알림 닫기"`).
- 자동 소멸 기본 `DEFAULT_DURATION` 4000ms, `duration <= 0` 이면 영구(수동 닫기까지).
- ⚠️ **`info` 전용 토큰 미추가**: STEP 1-2 진행기록의 "info 토큰은 STEP 3-6 에서
  추가" 계획과 달리, 실제 구현은 tokens 패키지를 건드리지 않고 info variant 에
  기존 `primary`(파랑) 토큰을 재사용했다. `tokens/colors.ts`·`theme.css` 변경 없음
  → 작업 범위를 ui 패키지로 한정. (전용 info 토큰이 필요해지면 추후 Phase 1 재방문.)
- spec 의 "role=status 또는 aria-live=polite" 중 **`aria-live="polite"`** 채택.
- 스토리: `Playground`(버튼 클릭 → 토스트, `ToastProvider` decorator)·`Appearance`
  (success/error/info 3종 정적 비교).

**Phase 3 완료 기준**: Button(variant/loading/a11y), TextInput(addon 포함),
Toast가 Storybook에서 모두 동작 + 다크모드 정상.

**Phase 3 완료 기록 (2026-05-22)**: STEP 3-1~3-6 전부 구현 완료 — git worktree
3개 브랜치(`phase3/button`·`phase3/textinput`·`phase3/toast`)에서 작업 후 main 에
머지(커밋 9ed8963·7530972·82fd8bd·f39eb33). `tsc -p tsconfig.json` 통과,
`pnpm --filter @my-ds/ui build` 통과 — `dist/index.d.ts` 에 Box·Flex·Stack·Button·
ToggleButton·TextInput·Toast·ToastProvider·useButton·useToast 등 전 공개 API 노출
확인. 다크모드·Storybook 의 실제 동작 시각 확인은 사용자 몫. ⚠️ `edgecase-review`
는 STEP 3-1 만 수행됨 — 3-2~3-6 은 미수행(Phase 4 진입 전 일괄 점검 권장).

---
---

# Phase 4 — 테스트

> 목표: 만든 컴포넌트가 안 깨지는지 자동 검증.

## STEP 4-1. 테스트 환경 세팅

**지시 프롬프트**
```
packages/ui 에 Vitest + React Testing Library + vitest-axe 를 세팅한다.
- 패키지: vitest, @testing-library/react, @testing-library/jest-dom,
  @testing-library/user-event, jsdom, vitest-axe
- vitest.config.ts:
    environment: "jsdom"  ← happy-dom 금지 (axe-core 호환성 버그 있음)
    globals: true
    setupFiles: ["./vitest.setup.ts"]
- vitest.setup.ts:
    import "@testing-library/jest-dom"
    import "vitest-axe/extend-expect"  ← toHaveNoViolations matcher 등록
- tsconfig.json types 에 vitest/globals 추가
- package.json scripts에 "test": "vitest" 추가
최신 Vitest 설정 방식을 확인해서 적용.
```

**핵심 포인트**
- Vitest: Jest와 거의 같은 문법인데 더 빠르고 Vite/tsdown 친화적.
- Testing Library: "사용자가 보는 방식"으로 테스트하는 철학.
- **jsdom 고정**: `happy-dom` 은 `Node.prototype.isConnected` 버그로 axe-core(vitest-axe)와 비호환.
- **vitest-axe**: jest-axe의 Vitest 포크. jest-axe를 vitest에 직접 쓰면 타입/환경 충돌.

**진행 기록 (2026-05-22, STEP 4-1 완료)**
- 설치(ui devDependencies): `vitest@3.2.4`·`@testing-library/react@16.3.2`·
  `@testing-library/jest-dom@6.9.1`·`@testing-library/user-event@14.6.1`·
  `jsdom@29.1.1`·`vitest-axe@0.1.0` + **`@testing-library/dom@10.4.1`**.
- ⚠️ **`@testing-library/dom` 명시 설치**: 명세 패키지 목록엔 없으나, TL/react 16 은
  `@testing-library/dom` 을 peerDependency 로 요구한다(v15 까지는 일반 dependency 였음).
  auto-install-peers 에 기대지 않고 devDependency 로 명시 설치.
- ⚠️ **Vitest 는 3.x 유지**: 최신은 4.1.7 이나 CLAUDE.md/architecture.md 가 3.x 로
  핀했다 — 3.x 최신인 **3.2.4** 설치(스펙 준수 + vitest-axe 0.1.0 호환 안전). 4.x 로
  올리는 건 설계 결정 변경이라 architecture.md 선수정이 필요해 보류.
- ⚠️ **vitest 3 ↔ Storybook vite 8 충돌 없음**: vitest 3 은 `vite` 를 peerDependency
  가 아니라 자체 dependency 로 번들한다(vitest 4 는 vite 를 peer 로 둠). 따라서
  Storybook 이 깐 `vite@8` 과 무관하게 동작 — 검증으로 확인.
- `vitest.config.ts`: `environment:"jsdom"` + `globals:true` + `setupFiles`.
  `vitest.setup.ts`: `@testing-library/jest-dom/vitest` import + vitest-axe 매처
  수동 등록(아래 함정 참조).
- ⚠️ **jest-dom 은 `/vitest` 진입점 사용**: 명세의 `import "@testing-library/jest-dom"`
  대신 **`@testing-library/jest-dom/vitest`** — Vitest 의 `expect` 에 매처·타입
  (`declare module "vitest"`)을 함께 확장하는 공식 경로다. 진입점 없는 import 는
  매처 타입이 Vitest expect 로 확장되지 않을 수 있다.
- ⚠️ **vitest-axe 0.1.0 의 `extend-expect` 진입점이 깨져 있음** → `dist/matchers.js`
  에서 매처를 직접 가져와 `expect.extend` 로 수동 등록 + `declare module "vitest"`
  로 타입 직접 augment. 상세는 `docs/edgecase/phase-4.md` 참조.
- tsconfig: `compilerOptions.types: ["vitest/globals"]`(describe/it/expect 전역
  타입) + `include` 에 `vitest.config.ts`·`vitest.setup.ts` 추가(셋업 파일의 매처
  타입 augmentation 이 테스트 파일 전역에 보이도록). `types` 배열은 "자동 포함되는
  @types/*" 만 제한 — `react` 등 명시적 import 타입엔 영향 없음(tsc 통과로 확인).
- ⚠️ **jsdom 29.1.1 의 Node 하한**: engines 가 `^20.19.0` — 현 Node 20.19.0 이
  정확히 하한선이라 통과하나 여유가 0이다(Node 를 20.18 이하로 내리면 깨짐).
  프로젝트 Node 가 의도적으로 20.19.0 에 핀돼 있어 수용.
- ⚠️ **jsdom canvas 미구현 경고**: 테스트 실행 시 `Not implemented:
  HTMLCanvasElement's getContext()` 경고 — axe 의 color-contrast 규칙이 canvas 를
  쓰기 때문. 무해하며 STEP 4-3 의 색 대비 검사 한계로 이어진다(`phase-4.md` 참조).
- 검증: 임시 스모크 테스트(`src/__env-smoke.test.ts`)로 globals·jsdom·jest-dom
  매처·vitest-axe 매처 4항목 확인 → `vitest run` 4/4 통과 + `tsc` 클린 → 스모크
  테스트 삭제. `pnpm --filter @my-ds/ui build` 도 클린(테스트 설정 변경이 빌드
  무영향) 재확인.
- ⚠️ **STEP 4-2 선행 작업**: `src/library.css` 의 `@source not` 이 `*.stories.tsx`
  만 제외 → `src/` 에 들어올 `*.test.tsx` 가 라이브러리 CSS 빌드에 스캔돼 테스트
  클래스가 누출된다. STEP 4-2 는 첫 테스트 파일 추가 전에 `@source not
  "**/*.test.{ts,tsx}"` 를 `library.css` 에 보강할 것(`phase-4.md` 참조).

---

## STEP 4-2. 컴포넌트 단위 테스트

**지시 프롬프트**
```
다음 테스트를 작성한다:
- Button: 클릭 핸들러 호출, disabled/loading 시 클릭 안 됨, variant 클래스 적용 확인
- TextInput: 입력 시 onChange 호출, error 시 aria-invalid="true", label-input 연결 확인
사용자 관점(getByRole, getByLabelText)으로 작성.
```

**핵심 포인트**
- `getByRole`, `getByLabelText` 우선 사용 (접근성 + 견고한 테스트).
- 구현 디테일이 아니라 "동작"을 테스트.

**진행 기록 (2026-05-22, 선행+STEP 4-2·4-3 배치)**
- 선행 작업: `src/library.css` 에 `@source not "**/*.test.ts"` / `@source not "**/*.test.tsx"` 2줄 추가
  (phase-4.md WARN 3 해결 — 테스트 파일의 클래스 문자열이 dist/styles.css 로 누출되지 않도록).
- `Button.test.tsx` 신규 — `describe("Button")`:
  (1) 클릭 → onClick 호출. (2) disabled → toBeDisabled + onClick 미호출.
  (3) isLoading → aria-busy="true" + 클릭 차단 + `getByRole({name:"저장"})` 성공(accessible name
      보존 — phase-3 FAIL 수정 회귀 가드). (4) aria-disabled → 클릭 차단 + 포커스 유지(button.focus()
      후 toHaveFocus). (5) `it.each` 로 solid/outline/size 클래스 단언(`toHaveClass`).
- `TextInput.test.tsx` 신규 — `describe("TextInput")`:
  (1) 비제어 onChange + toHaveValue. (2) getByLabelText 성공 자체가 label↔input 연결 증명.
  (3) error → aria-invalid="true" + toBeInTheDocument + toHaveAccessibleDescription(aria-describedby).
  (4) error 없음 → not.toHaveAttribute("aria-invalid"). (5) disabled → toBeDisabled.
- ⚠️ **variant 클래스 단언의 한계**: `toHaveClass("bg-primary")` 는 cva+twMerge 가 실제로 그 클래스를
  출력하는지를 검사하는 구현 단언이다. CLAUDE.md "동작 테스트" 원칙에서 벗어나지만 STEP 명세가 명시적으로
  요구해 포함. 향후 cva 구조 변경 시 깨질 수 있다 — 안정적인 토큰 클래스명만 단언 대상으로 선정.
- ⚠️ **비제어 TextInput onChange 테스트**: `value` 미전달 → 비제어. onChange 는 정상 발화하고
  toHaveValue 도 DOM 값으로 단언 가능. "Controlled" 패턴의 테스트는 harness 가 필요해 보류
  (over-engineering 회피 — 단위 테스트는 onClick/onChange 호출이 핵심).

---

## STEP 4-3. 접근성 테스트

**지시 프롬프트**
```
vitest-axe로 Button, TextInput, Toast 의 접근성 위반이 없는지
자동 검사하는 테스트를 추가한다.
import { axe } from "vitest-axe"
const results = await axe(container)
expect(results).toHaveNoViolations()
```

**Phase 4 완료 기준**: `pnpm --filter @my-ds/ui test` 전부 통과.

**진행 기록 (2026-05-22, 선행+STEP 4-2·4-3 배치)**
- Button.test.tsx / TextInput.test.tsx 에 `describe("접근성 (vitest-axe)")` 블록 추가.
  Toast.test.tsx 신규(a11y 전용). 총 axe 테스트 5건.
- `import { axe } from "vitest-axe"` — 루트 진입점 정상(dist/index.d.ts 가 `export { axe }` 로
  값 export, deep import 불필요). `toHaveNoViolations` 는 setup.ts 등록분 사용.
- ⚠️ **region best-practice 규칙 → `<main>` 래퍼 채택**: axe-core 의 `region` 규칙이 "모든
  콘텐츠는 landmark 안에" 를 요구한다. 단독 컴포넌트를 맨몸으로 렌더하면 위반 위험 → 모든 axe
  테스트에서 `<main>` 으로 감싸 landmark 를 제공(규칙 disable 없이 해결). 실제 17/17 통과로 확인.
- ⚠️ **canvas stderr 경고**: `Not implemented: HTMLCanvasElement's getContext()` — axe의
  color-contrast 규칙이 canvas 를 시도하나 jsdom 미구현. 경고는 무해하고 테스트는 통과함
  (phase-4.md 기존 기록과 동일). 레이블·role·aria 구조는 정상 검사.
- ⚠️ **Toast 는 맨몸 `<Toast>` 만 테스트**: aria-live 영역은 ToastProvider 의 뷰포트에 있어
  STEP 4-3 명세("Toast 의 접근성")의 핵심 시각 컴포넌트만 대상으로 삼음. ToastProvider/useToast
  행동 테스트는 이번 배치 명세 밖 — 필요 시 후속 배치 추가 가능.
- 최종 검증: `vitest run` 17/17 통과 / `tsc` 클린 / `build` 클린 / `dist/styles.css` 테스트 클래스 누출 0.
  **Phase 4 완료.**

---
---

# Phase 5 — 문서화 & CI/CD

> 목표: 남이 쓸 수 있게 문서화하고, 자동 빌드·테스트 파이프라인 구성.

## STEP 5-1. Storybook 문서화

**지시 프롬프트**
```
주요 컴포넌트(Button, TextInput, Toast)에 대해
Storybook autodocs 를 활성화하고 MDX 문서 페이지를 작성한다.
각 컴포넌트의 props 표, 사용 예시, variant 갤러리 포함.
```

**진행 기록 (2026-05-22, STEP 5-1·5-2 배치 완료)**
- autodocs(`tags:["autodocs"]`)는 STEP 2-4 에서 활성화돼 있었으나, 5-1 에서
  `<Meta of={Stories}/>` 커스텀 MDX 가 각 컴포넌트의 Docs 탭을 제공하므로
  세 CSF 파일에서 `tags:["autodocs"]` 를 **제거**했다. ⚠️ SB10 은 커스텀 MDX 와
  autodocs 가 공존하면 교체가 아니라 인덱싱 충돌로 처리한다(설계 단계의 잘못된
  가정 — `docs/edgecase/phase-5.md` FAIL 참조).
- `@storybook/addon-docs/blocks` — Doc Block 정식 export 경로(SB 10.4 `package.json`
  exports 확인). `Meta`·`Canvas`·`Controls`·`ArgTypes` 모두 export 됨.
- `.storybook/main.ts` 의 `stories` glob 에 `"../src/**/*.mdx"` 추가(MDX 없이는
  Storybook 이 파일 자체를 인식하지 못함 — 가장 흔한 함정).
- `src/library.css` 에 `@source not "**/*.mdx"` 추가(STEP 2-4 스토리·STEP 4-2 테스트와
  동일 패턴 — MDX 발 Tailwind 클래스가 `dist/styles.css` 로 새는 것을 예방).
- MDX 3파일 신규: `Button/Button.mdx`·`TextInput/TextInput.mdx`·`Toast/Toast.mdx`.
  기존 스토리를 `<Canvas of={Story}/>` 로 재사용 — 예시 코드 중복 없음.
  Button: Playground + Controls + AllCombinations 갤러리 + 로딩/비활성 + ToggleButton.
  TextInput: Playground + Controls + 상태 갤러리(3종) + Addon 갤러리(3종).
  Toast: Provider 설치 코드 블록 + Playground(인터랙티브) + Appearance 갤러리.
- ⚠️ **Toast.mdx 미사용 Controls**: Toast Playground 는 `render: () => <ToastDemo/>`
  방식이라 arg-binding 이 없다 — `<Controls>` 를 쓰면 빈 표. import 에서 제거.
  Button·TextInput 은 Playground 가 arg 기반이라 `<Controls>` 사용이 올바르다
  (`docs/edgecase/phase-5.md` 참조).
- 검증: `tsc` 클린 / `pnpm -r build` 클린 / `vitest run` 17/17 / `dist/styles.css`
  MDX 클래스 누출 0 / `build-storybook` 성공(MDX 인덱싱·컴파일 통과).
  ⚠️ MDX Docs 탭의 시각 확인(렌더·갤러리·다크모드)은 **사용자 몫**.

---

## STEP 5-2. GitHub Actions CI

**지시 프롬프트**
```
.github/workflows/ci.yml 을 만든다.
- main 브랜치 push / PR 시 트리거
- Node 20 사용
- pnpm setup (actions/setup-node + pnpm 캐시)
- pnpm install → 전체 패키지 build → test 실행
- 실패 시 빨간불
최신 actions 버전 사용.
```

**핵심 포인트**
- CI: 코드 푸시 때마다 자동으로 빌드+테스트. 깨진 코드 병합 방지.

**진행 기록 (2026-05-22, STEP 5-1·5-2 배치 완료)**
- `.github/workflows/ci.yml` 신규. 7단계: checkout → pnpm setup → node(캐시) →
  install → build → test → build-storybook.
- ⚠️ **pnpm 을 Node 보다 먼저**: `pnpm/action-setup@v4` 가 `actions/setup-node@v4`
  앞에 있어야 `cache: pnpm` 이 동작한다. 순서가 바뀌면 "Caching for 'pnpm' failed".
- ⚠️ **vitest watch 모드 함정**: `package.json` 의 `"test": "vitest"` 는 watch 모드.
  CI 에서는 `pnpm --filter @my-ds/ui exec vitest run` 으로 1회 실행을 명시한다.
  (`CI` 환경변수로 Vitest 가 자동 감지하기도 하나 명시가 더 안전.)
- ⚠️ **위상 순서**: `pnpm -r build` 는 워크스페이스 의존 그래프 위상 순서로
  실행하므로 `tokens → ui` 가 자동 보장된다. `tokens` 를 먼저 명시할 필요 없음.
- ⚠️ **--frozen-lockfile**: CI 표준. `pnpm-lock.yaml` 이 최신 상태로 커밋돼 있어야
  통과한다(현재 git status M pnpm-lock.yaml — push 전 커밋 필요).
- build-storybook 단계 추가(D4 결정): MDX 문법 오류를 CI 에서도 잡는다.
  명세 외 추가지만 구현량이 한 줄(`pnpm --filter @my-ds/ui run build-storybook`)이라
  사용자가 채택함.
- `pnpm/action-setup@v4` 는 `version` 생략 시 루트 `package.json` 의
  `"packageManager": "pnpm@10.33.4"` 를 읽는다 — 단일 진실 원천 유지.
- 검증: 로컬에서 `pnpm install --frozen-lockfile` / `pnpm -r build` /
  `vitest run` 17/17 모두 통과. CI 초록불은 push 후 GitHub Actions 탭에서 확인.

---

## STEP 5-3. (선택) 배포 준비

**지시 프롬프트**
```
각 패키지의 package.json에 publishConfig, files 필드를 정비하고,
배포 전 검증(빌드 산출물·타입·exports 경로 확인) 절차를 문서화한다.
실제 npm 배포는 생략. dry-run 까지만.
```

**Phase 5 완료 기준**: CI가 초록불, Storybook 문서가 컴포넌트별로 완성.

---
---

# 전체 완료 기준 (Definition of Done)

- [ ] tokens 패키지: 빌드 시 `dist/tokens.css` (CSS 변수 전체) + JS + .d.ts 생성
- [ ] ui 패키지: Box/Flex/Button/TextInput/Toast 동작, `dist/styles.css` 생성
- [ ] 다크모드: `data-theme="dark"` 토글로 전체 전환
- [ ] Storybook: 모든 컴포넌트 문서화 + 다크모드 토글
- [ ] 테스트: 단위 + 접근성 통과 (vitest-axe, jsdom)
- [ ] CI: 푸시 시 자동 빌드·테스트 초록불
