import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextInput } from "./TextInput";

// 데모용 돋보기 아이콘. stroke="currentColor" → addon 컨테이너의 text-muted 색을
// 그대로 따른다. aria-hidden: 장식용이므로 보조기술에서 숨긴다.
const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

// CSF3: default export = 메타, named export = 각 스토리.
const meta: Meta<typeof TextInput> = {
  title: "Components/TextInput",
  component: TextInput,
  tags: ["autodocs"], // 타입에서 props 표가 자동 생성되는 Docs 탭 활성화
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
    helperText: { control: "text" },
    error: { control: "text" },
    disabled: { control: "boolean" },
  },
  args: {
    label: "이메일",
    placeholder: "you@example.com",
  },
  // 입력창이 캔버스 전체 폭으로 늘어나지 않도록 폭을 제한한다.
  decorators: [
    (Story) => (
      <div className="max-w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Playground — Controlled(제어) 방식 데모. value 를 useState 로 들고 매 입력마다
// onChange 로 갱신한다. Controls 패널에서 label/helperText/error 등을 바꿔볼 수 있다.
export const Playground: Story = {
  args: { helperText: "회사 이메일을 입력하세요." },
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <TextInput
        {...args}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  },
};

// 기본 — label + helperText 가 있는 가장 단순한 형태.
export const Default: Story = {
  args: { helperText: "회사 이메일을 입력하세요." },
};

// 에러 — error prop 이 있으면 빨간 테두리 + aria-invalid + 에러 메시지를 표시.
export const WithError: Story = {
  args: {
    defaultValue: "invalid-email",
    error: "올바른 이메일 형식이 아닙니다.",
  },
};

// 비활성 — disabled. 전체가 흐려지고 입력이 막힌다.
export const Disabled: Story = {
  args: {
    defaultValue: "you@example.com",
    disabled: true,
    helperText: "이 필드는 수정할 수 없습니다.",
  },
};

// STEP 3-5 — leftAddon: 입력창 왼쪽에 검색 아이콘을 붙인다.
export const WithLeftAddon: Story = {
  args: {
    label: "검색",
    placeholder: "검색어를 입력하세요",
    leftAddon: <SearchIcon />,
  },
};

// STEP 3-5 — rightAddon: 입력창 오른쪽에 인터랙티브 버튼(비밀번호 표시 토글).
export const WithRightAddon: Story = {
  args: { label: "비밀번호" },
  render: (args) => {
    const [value, setValue] = useState("");
    const [visible, setVisible] = useState(false);
    return (
      <TextInput
        {...args}
        type={visible ? "text" : "password"}
        placeholder="비밀번호를 입력하세요"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rightAddon={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="cursor-pointer text-sm font-medium text-primary"
          >
            {visible ? "숨김" : "표시"}
          </button>
        }
      />
    );
  },
};

// STEP 3-5 — 좌/우 동시: URL 입력의 접두/접미 텍스트.
export const WithBothAddons: Story = {
  args: {
    label: "웹사이트",
    placeholder: "my-site",
    leftAddon: <span className="text-sm">https://</span>,
    rightAddon: <span className="text-sm">.com</span>,
  },
};
