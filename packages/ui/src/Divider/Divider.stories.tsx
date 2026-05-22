import type { Meta, StoryObj } from "@storybook/react-vite";
import { Divider } from "./Divider";

const meta = {
  title: "Components/Divider",
  component: Divider,
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    decorative: { control: "boolean" },
  },
  args: {
    orientation: "horizontal",
    decorative: false,
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Horizontal: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-64">
      <p>위 항목</p>
      <Divider />
      <p>아래 항목</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex items-stretch gap-4 h-16">
      <p className="self-center">왼쪽</p>
      <Divider orientation="vertical" />
      <p className="self-center">오른쪽</p>
    </div>
  ),
};

// decorative=true: 시각 장식 전용 — role·aria-orientation 없이 aria-hidden="true".
export const Decorative: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-64">
      <p>내용 A</p>
      <Divider decorative />
      <p>내용 B</p>
    </div>
  ),
};
