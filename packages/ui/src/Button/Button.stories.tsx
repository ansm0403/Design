import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";
import { ToggleButton } from "./ToggleButton";

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
    isLoading: { control: "boolean" },
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

// STEP 3-2 — 로딩 상태. 스피너가 뜨고, 클릭은 막히며 aria-busy="true" 가 켜진다.
// 스피너가 버튼 위에 겹쳐 떠도 글자가 자리를 차지해 버튼 너비는 그대로다.
export const Loading: Story = {
  args: { isLoading: true },
};

// STEP 3-2 — 비활성 상태. 네이티브 disabled 라 포커스조차 받지 못한다.
export const Disabled: Story = {
  args: { disabled: true },
};

// STEP 3-2 — disabled 와 aria-disabled 의 차이.
// Tab 키로 두 버튼을 순회해 보면: native disabled 는 건너뛰어지고,
// aria-disabled 는 포커스를 받지만 클릭/Enter 는 무시된다.
export const DisabledVariants: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button disabled>native disabled</Button>
      <Button aria-disabled="true">aria-disabled (포커스 가능)</Button>
    </div>
  ),
};

// STEP 3-3 — ToggleButton. 클릭하면 눌림 상태가 토글된다(비제어 모드).
// 눌림 = solid, 안눌림 = outline 으로 상태가 보인다. Button 과 동일한
// useButton 훅 + buttonStyles 표를 재사용한다(headless 패턴).
export const Toggle: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <ToggleButton color="primary">Bold</ToggleButton>
      <ToggleButton color="primary" defaultPressed>
        Italic (기본 눌림)
      </ToggleButton>
      <ToggleButton color="danger">Underline</ToggleButton>
      <ToggleButton color="neutral" disabled>
        Disabled
      </ToggleButton>
    </div>
  ),
};
