import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box } from "../Box";
import { Stack } from "./Stack";

const meta = {
  title: "Layout/Stack",
  component: Stack,
  tags: ["autodocs"],
  // Stack 은 direction 을 column 으로 고정하므로 direction 컨트롤이 없다.
  argTypes: {
    align: {
      control: "select",
      options: ["start", "center", "end", "stretch", "baseline"],
    },
    justify: {
      control: "select",
      options: ["start", "center", "end", "between", "around"],
    },
    gap: { control: "select", options: [0, 1, 2, 3, 4, 6, 8] },
    children: { control: false },
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

const demoItems = ["First", "Second", "Third"].map((label) => (
  <Box key={label} className="bg-primary rounded px-4 py-2 text-white">
    {label}
  </Box>
));

export const Default: Story = {
  args: {
    gap: 2,
    className: "bg-surface border border-border rounded p-4",
    children: demoItems,
  },
};

export const LargeGap: Story = {
  args: {
    gap: 6,
    className: "bg-surface border border-border rounded p-4",
    children: demoItems,
  },
};
