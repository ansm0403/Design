import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";

// variant × color × size 의 전체 옵션 — argTypes 와 AllCombinations 에서 함께 쓴다.
const variants = ["solid", "outline", "ghost"] as const;
const colors = ["primary", "danger", "neutral"] as const;
const sizes = ["sm", "md", "lg"] as const;

// CSF3: default export = 메타, named export = 각 스토리.
const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"], // 타입에서 props 표가 자동 생성되는 Docs 탭 활성화
  // argTypes: 각 prop 을 Controls 패널에서 어떤 UI 로 조작할지 지정한다.
  argTypes: {
    variant: { control: "inline-radio", options: variants },
    color: { control: "inline-radio", options: colors },
    size: { control: "inline-radio", options: sizes },
    children: { control: "text" },
    disabled: { control: "boolean" },
  },
  // 모든 스토리가 공유하는 기본 args.
  args: {
    children: "Button",
    variant: "solid",
    color: "primary",
    size: "md",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Controls 패널로 variant·color·size 를 직접 바꿔보는 인터랙티브 스토리.
export const Playground: Story = {};

// STEP 3-1 요구: variant × color × size 27개 전 조합을 한눈에 보여준다.
// args 하나로는 27개를 못 그리므로 render 로 직접 그린다.
export const AllCombinations: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      {sizes.map((size) => (
        <div key={size} className="flex flex-col gap-2">
          <p className="text-muted text-sm font-medium">size = {size}</p>
          {variants.map((variant) => (
            <div key={variant} className="flex items-center gap-3">
              {colors.map((color) => (
                <Button
                  key={color}
                  variant={variant}
                  color={color}
                  size={size}
                >
                  {variant}/{color}
                </Button>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};
