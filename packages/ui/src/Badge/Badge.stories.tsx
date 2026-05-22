import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./Badge";

const variants = ["solid", "subtle", "outline"] as const;
const colors = ["primary", "danger", "success", "neutral"] as const;
const sizes = ["sm", "md"] as const;

const meta = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "inline-radio", options: variants },
    color: { control: "inline-radio", options: colors },
    size: { control: "inline-radio", options: sizes },
    children: { control: "text" },
  },
  args: {
    children: "Badge",
    variant: "solid",
    color: "primary",
    size: "md",
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const AllCombinations: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {variants.map((variant) => (
        <div key={variant} className="flex flex-col gap-2">
          <p className="text-muted text-sm font-medium">variant = {variant}</p>
          <div className="flex flex-wrap items-center gap-2">
            {colors.map((color) => (
              <Badge key={color} variant={variant} color={color}>
                {color}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      {sizes.map((size) => (
        <Badge key={size} size={size}>
          {size}
        </Badge>
      ))}
    </div>
  ),
};
