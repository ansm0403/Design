import type { Preview } from "@storybook/react-vite";

// theme.css 를 import 하면 토큰 CSS 변수 + Tailwind 유틸리티가 Storybook 전체에
// 로드된다. (@tailwindcss/vite 가 main.ts 의 viteFinal 에서 이 파일을 처리한다.)
// 데코레이터가 JSX 를 반환하므로 이 파일의 확장자는 .ts 가 아니라 .tsx 다.
import "../src/theme.css";

const preview: Preview = {
  // globalTypes: 상단 툴바에 전역 선택기를 추가한다. 여기선 라이트/다크 테마 선택기.
  globalTypes: {
    theme: {
      description: "컴포넌트 미리보기 테마",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },

  // initialGlobals: 전역 값의 초기 상태.
  initialGlobals: { theme: "light" },

  // decorators: 모든 스토리를 공통으로 감싸는 래퍼.
  // 툴바에서 고른 theme 을 래퍼 div 의 data-theme 속성에 적용한다 →
  // tokens.css 의 [data-theme="dark"] 규칙이 매칭돼 CSS 변수 값만 교체된다.
  // (배경·글자색은 토큰 CSS 변수를 직접 참조해, 테마 전환이 한눈에 보이게 한다.)
  decorators: [
    (Story, context) => (
      <div
        data-theme={context.globals.theme}
        style={{
          backgroundColor: "var(--color-background)",
          color: "var(--color-foreground)",
          padding: "2rem",
          minHeight: "100vh",
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default preview;
