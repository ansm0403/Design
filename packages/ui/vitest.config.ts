import { defineConfig } from "vitest/config";

// Vitest 설정. tsdown(빌드)·tailwindcss(CSS)와 분리된 독립 테스트 파이프라인이다.
// vitest 3 은 자체 vite 를 dependency 로 번들하므로 Storybook 의 vite 8 과 충돌하지 않는다.
export default defineConfig({
  test: {
    // jsdom: 브라우저 DOM 을 Node 에서 시뮬레이션한다.
    // ⚠️ happy-dom 금지 — axe-core(vitest-axe)와 호환성 버그가 있다.
    environment: "jsdom",

    // describe / it / expect 를 import 없이 전역으로 쓴다.
    // 타입은 tsconfig 의 types: ["vitest/globals"] 가 제공한다.
    globals: true,

    // 모든 테스트 파일 실행 전에 한 번 로드되는 셋업 파일 (매처 등록).
    setupFiles: ["./vitest.setup.ts"],
  },
});
