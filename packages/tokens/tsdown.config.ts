import { defineConfig } from "tsdown";

// tsdown: tsup 의 후속 번들러. Rolldown(Rust 기반) 위에서 동작하며
// TypeScript 트랜스파일과 .d.ts 생성을 플러그인 없이 내장 지원한다.
export default defineConfig({
  // 빌드 진입점. 이 파일에서 export 한 것이 패키지의 공개 API 가 된다.
  entry: ["src/index.ts"],

  // ESM 만 출력 (package.json 의 "type": "module" 과 일치).
  format: ["esm"],

  // 출력 확장자를 .mjs/.cjs 로 고정하지 않고 package.json 의 "type" 에 맡긴다.
  // tsdown 은 platform 이 node(라이브러리 기본값)면 fixedExtension 기본값이
  // true → ESM 을 .mjs 로 출력한다.
  // false 로 두면 "type": "module" 환경에서 ESM 이 .js / .d.ts 로 출력되어
  // package.json 의 exports("./dist/index.js", "./dist/index.d.ts") 와 정확히 일치한다.
  fixedExtension: false,

  // .d.ts 타입 정의 파일 생성 → 사용처에서 자동완성·타입 체크가 동작.
  dts: true,

  // 빌드 전에 dist 폴더를 비운다.
  // build 스크립트는 `tsdown && tsx scripts/build-css.ts` 순서다 — tsdown 이
  // 먼저 dist 를 비우고 index.js/index.d.ts 를 만든 뒤, build-css.ts 가
  // tokens.css 를 추가한다. clean 이 방금 만든 CSS 를 지우는 충돌은 이 순서로
  // 해소된다 (STEP 1-3 / edgecase phase-1 W1).
  clean: true,
});
