import { defineConfig } from "tsdown";

// tsdown: tsup 의 후속 번들러. Rolldown(Rust 기반) 위에서 동작하며
// TypeScript 트랜스파일과 .d.ts 생성을 플러그인 없이 내장 지원한다.
//
// 역할 분담: tsdown 은 JS + .d.ts 만 담당한다. CSS(theme.css → styles.css)는
// tsdown 이 아니라 @tailwindcss/cli 가 별도로 빌드한다 (package.json 의 build
// 스크립트 `tsdown && tailwindcss ...` 참조). 처음엔 @tailwindcss/vite 플러그인을
// tsdown 에 끼우려 했으나, tsdown(Rolldown)은 Vite 가 아니라 플러그인이 Vite
// 전용 컨텍스트를 찾다 crash 한다 → 공식 CLI 를 쓰는 2단계 빌드로 전환.
export default defineConfig({
  // 빌드 진입점. 이 파일이 export 한 것이 @my-ds/ui 의 공개 API 가 된다.
  entry: ["src/index.ts"],

  // ESM 만 출력 (package.json 의 "type": "module" 과 일치).
  format: ["esm"],

  // tsdown 은 platform 이 node(라이브러리 기본값)면 fixedExtension 기본값이
  // true → ESM 을 .mjs / .d.mts 로 출력한다.
  // false 로 두면 "type": "module" 환경에서 ESM 이 .js / .d.ts 로 출력되어
  // package.json 의 exports("./dist/index.js", "./dist/index.d.ts") 와 정확히 일치한다.
  fixedExtension: false,

  // .d.ts 타입 정의 파일 생성 → 사용처에서 자동완성·타입 체크가 동작.
  dts: true,

  // 빌드 전에 dist 폴더를 비운다.
  // build 스크립트는 `tsdown && tailwindcss ...` 순서다 — tsdown 이 먼저 dist 를
  // 비우고 index.js / index.d.ts 를 만든 뒤, @tailwindcss/cli 가 styles.css 를
  // 추가한다. CSS 를 먼저 만들면 clean 이 지운다 (tokens 패키지와 동일한 순서).
  clean: true,

  // react / react-dom 을 번들에 포함하지 않고 "외부 의존성" 으로 남긴다.
  // 이유: 라이브러리가 React 를 함께 번들하면, 이 라이브러리를 쓰는 앱이 가진
  // React 와 합쳐져 React 가 두 벌 로드된다 → "Invalid hook call" 런타임 에러.
  // 그래서 React 는 package.json 에서 peerDependencies(= 사용처가 직접 제공)로
  // 선언하고, 번들러에게도 "번들하지 말 것" 으로 알려 빌드 산출물에서 제외한다.
  // "react/jsx-runtime" 은 jsx: "react-jsx" 자동 변환이 내부적으로 import 하는
  // 모듈이라 함께 제외해야 번들에 끌려들어오지 않는다.
  //
  // ⚠️ phases.md STEP 2-1 스펙의 최상위 `external` 옵션은 tsdown 0.21.x 에서
  // deprecated 됐다("`external` is deprecated. Use `deps.neverBundle` instead.").
  // 동작은 하지만 빌드마다 경고가 떠 현행 API 인 `deps.neverBundle` 로 작성한다.
  deps: {
    neverBundle: ["react", "react-dom", "react/jsx-runtime"],
  },
});
