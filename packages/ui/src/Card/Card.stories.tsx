import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "./Card";

const variants = ["outlined", "elevated", "filled"] as const;
const paddings = ["none", "sm", "md", "lg"] as const;

const meta = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "inline-radio", options: variants },
    padding: { control: "inline-radio", options: paddings },
  },
  args: {
    variant: "outlined",
    padding: "md",
    children: "카드 내용",
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-72">
      {variants.map((variant) => (
        <Card key={variant} variant={variant}>
          <p className="font-medium">{variant}</p>
          <p className="text-muted text-sm mt-1">카드 설명 텍스트입니다.</p>
        </Card>
      ))}
    </div>
  ),
};

export const WithComposition: Story = {
  render: () => (
    <Card className="w-72">
      <div className="flex items-center justify-between">
        <p className="font-medium">제목</p>
        <span className="text-muted text-sm">부제목</span>
      </div>
      <p className="text-muted text-sm mt-2">
        Card 는 단순 컨테이너입니다. Stack·Flex·Box 등 레이아웃 컴포넌트와
        자유롭게 조합할 수 있습니다.
      </p>
    </Card>
  ),
};
