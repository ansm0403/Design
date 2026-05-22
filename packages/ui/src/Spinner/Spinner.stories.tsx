import type { Meta, StoryObj } from "@storybook/react-vite";
import { Spinner } from "./Spinner";

const meta = {
  title: "Components/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    label: { control: "text" },
  },
  args: {
    size: "md",
    label: "로딩 중",
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <Spinner size="sm" />
        <span className="text-xs text-muted">sm</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner size="md" />
        <span className="text-xs text-muted">md</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner size="lg" />
        <span className="text-xs text-muted">lg</span>
      </div>
    </div>
  ),
};

// aria-hidden 전달 시 장식 경로 — role/aria-label 없이 보조기술에서 숨겨진다.
// 버튼 안에서 isLoading 상태와 함께 쓸 때 이 패턴을 사용한다.
export const Decorative: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Spinner aria-hidden />
      <span>로딩 중...</span>
    </div>
  ),
};
