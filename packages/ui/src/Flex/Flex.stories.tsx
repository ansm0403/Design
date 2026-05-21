import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box } from "../Box";
import { Flex } from "./Flex";

const meta = {
  title: "Layout/Flex",
  component: Flex,
  tags: ["autodocs"],
  // argTypes: 각 prop 을 Controls 패널에서 어떤 UI 로 조작할지 지정한다.
  argTypes: {
    direction: { control: "inline-radio", options: ["row", "column"] },
    align: {
      control: "select",
      options: ["start", "center", "end", "stretch", "baseline"],
    },
    justify: {
      control: "select",
      options: ["start", "center", "end", "between", "around"],
    },
    gap: { control: "select", options: [0, 1, 2, 3, 4, 6, 8] },
    children: { control: false }, // JSX 라 컨트롤로 편집 불가 → 숨김
  },
} satisfies Meta<typeof Flex>;

export default meta;
type Story = StoryObj<typeof meta>;

// 정렬·간격이 눈에 보이도록 색 박스 3개를 자식으로 둔다.
const demoItems = ["1", "2", "3"].map((n) => (
  <Box key={n} className="bg-primary rounded px-4 py-2 text-white">
    {n}
  </Box>
));

// Controls 패널로 direction·align·justify·gap 을 직접 바꿔보는 스토리.
export const Playground: Story = {
  args: {
    direction: "row",
    gap: 4,
    className: "bg-surface border border-border rounded p-4",
    children: demoItems,
  },
};

export const Column: Story = {
  args: {
    direction: "column",
    gap: 2,
    className: "bg-surface border border-border rounded p-4",
    children: demoItems,
  },
};

// justify="between": 남는 공간을 항목 사이에 분배 — 너비가 있어야 보인다.
export const SpaceBetween: Story = {
  args: {
    justify: "between",
    className: "bg-surface border border-border rounded p-4",
    style: { width: 320 },
    children: demoItems,
  },
};
