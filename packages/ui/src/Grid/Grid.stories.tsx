import type { Meta, StoryObj } from "@storybook/react-vite";
import { Grid } from "./Grid";

const colOptions = [1, 2, 3, 4, 5, 6] as const;
const gapOptions = [0, 1, 2, 3, 4, 6, 8] as const;

// Grid 는 polymorphic 제네릭이라 satisfies Meta<typeof Grid> 대신 타입 단언을 쓴다.
const meta = {
  title: "Components/Grid",
  component: Grid,
  tags: ["autodocs"],
  argTypes: {
    cols: { control: "inline-radio", options: colOptions },
    gap: { control: "inline-radio", options: gapOptions },
  },
  args: {
    cols: 3,
    gap: 4,
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Grid cols={args.cols ?? 3} gap={args.gap ?? 4}>
      {Array.from({ length: args.cols ?? 3 }, (_, i) => (
        <div
          key={i}
          className="bg-surface border border-border rounded-md p-4 text-center text-sm"
        >
          {i + 1}
        </div>
      ))}
    </Grid>
  ),
};

export const AllCols: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {colOptions.map((col) => (
        <div key={col} className="flex flex-col gap-2">
          <p className="text-muted text-sm font-medium">cols = {col}</p>
          <Grid cols={col} gap={2}>
            {Array.from({ length: col }, (_, i) => (
              <div
                key={i}
                className="bg-surface border border-border rounded-md p-3 text-center text-sm"
              >
                {i + 1}
              </div>
            ))}
          </Grid>
        </div>
      ))}
    </div>
  ),
};
