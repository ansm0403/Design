import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";

// Storybook 메인 설정 — Storybook 이 무엇을, 어떻게 빌드할지 정의한다.
const config: StorybookConfig = {
  // 스토리 파일 위치. 컴포넌트 옆에 co-locate 한 *.stories.tsx 를 찾는다.
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],

  // addon-docs: 컴포넌트 타입에서 props 표·문서(autodocs 탭)를 자동 생성한다.
  addons: ["@storybook/addon-docs"],

  // react-vite: React 렌더러 + Vite 빌더를 묶은 프레임워크.
  framework: "@storybook/react-vite",

  // viteFinal: Storybook 내장 Vite 설정을 확장하는 훅.
  // @tailwindcss/vite 를 끼워 src/theme.css 의 @import "tailwindcss" 를 처리한다.
  // (라이브러리 배포 빌드는 @tailwindcss/cli 를 쓰지만, Storybook 은 Vite 기반이라
  //  Vite 전용 플러그인이 정상 동작한다 — architecture.md §6 참조.)
  viteFinal(viteConfig) {
    viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()];
    return viteConfig;
  },

  // 익명 사용 통계 수집 비활성화.
  core: { disableTelemetry: true },
};

export default config;
