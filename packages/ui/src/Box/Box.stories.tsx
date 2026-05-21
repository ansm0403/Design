import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box } from "./Box";

// CSF3(Component Story Format 3): default export = 메타, named export = 각 스토리.
const meta = {
  title: "Layout/Box", // 사이드바 트리 경로
  component: Box,
  tags: ["autodocs"], // 타입에서 props 표가 자동 생성되는 Docs 탭 활성화
} satisfies Meta<typeof Box>;

export default meta;
type Story = StoryObj<typeof meta>;

// args 방식 — props 를 데이터로 기술한다. Controls 패널에서 실시간 편집 가능.
export const Primary: Story = {
  args: {
    children: "I am a Box",
    className: "bg-surface text-foreground border border-border rounded p-4",
  },
};

// render 방식 — JSX 를 직접 작성한다. polymorphic 한 as="p" 케이스에 쓴다.
// (meta 가 as 를 기본값 "div" 로 좁혀, args 로는 as="p" 가 타입 에러가 난다.)
export const AsParagraph: Story = {
  render: () => (
    <Box
      as="p"
      className="bg-surface text-foreground border border-border rounded p-4"
    >
      as 프로퍼티로 p 태그로 렌더된 문단입니다.
    </Box>
  ),
};
