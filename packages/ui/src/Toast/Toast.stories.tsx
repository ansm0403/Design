import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toast } from "./Toast";
import { ToastProvider } from "./ToastProvider";
import { useToast } from "./useToast";
import { Button } from "../Button";

// 토스트는 "버튼 클릭 → 띄움" 흐름이라 useToast 를 쓰는 작은 데모 컴포넌트가 필요하다.
// 훅은 컴포넌트 함수 안에서만 호출할 수 있으므로, 스토리 본문이 아니라 이 컴포넌트에 둔다.
function ToastDemo() {
  const toast = useToast();
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        color="primary"
        onClick={() =>
          toast.show("새 메시지가 도착했습니다.", { variant: "info" })
        }
      >
        info 토스트
      </Button>
      <Button
        color="primary"
        onClick={() =>
          toast.show("변경 사항이 저장되었습니다.", { variant: "success" })
        }
      >
        success 토스트
      </Button>
      <Button
        color="danger"
        onClick={() =>
          toast.show("저장에 실패했습니다. 다시 시도해 주세요.", {
            variant: "error",
          })
        }
      >
        error 토스트
      </Button>
    </div>
  );
}

// CSF3: default export = 메타, named export = 각 스토리.
// ⚠️ `satisfies Meta<typeof Toast>` 대신 명시적 타입 어노테이션을 쓴다 —
//    decorators 가 있을 때 satisfies 로 좁혀진 추론 타입이 storybook 내부 경로를
//    참조해 TS2742("cannot be named without a reference to ...") 가 발생한다.
//    명시적 어노테이션은 export default meta 의 타입을 Meta<typeof Toast> 로
//    직접 지정해 이 문제를 피한다.
const meta: Meta<typeof Toast> = {
  title: "Components/Toast",
  component: Toast,
  tags: ["autodocs"], // 타입에서 props 표가 자동 생성되는 Docs 탭 활성화
  // 모든 스토리를 ToastProvider 로 감싼다 — useToast 가 동작하려면 필수.
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
  // render 전용 스토리라도 Meta<typeof Toast> 는 필수 prop(message)을
  // args 로 제공하도록 요구한다 — 기본값을 둬야 StoryAnnotations 타입을 만족한다.
  args: {
    message: "알림 메시지입니다.",
    variant: "info",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 버튼을 누르면 화면 우하단에 토스트가 뜨고, 4초 뒤 자동으로 사라진다.
// (닫기 ✕ 버튼으로 즉시 닫을 수도 있다.)
export const Playground: Story = {
  render: () => <ToastDemo />,
};

// variant 3종의 정적(자동 소멸 없는) 외형 비교 — autodocs 갤러리용.
// 여기서는 Provider 흐름 없이 Toast 컴포넌트를 직접 그려 색·레이아웃만 확인한다.
export const Appearance: Story = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-2">
      <Toast variant="info" message="새 메시지가 도착했습니다." />
      <Toast variant="success" message="변경 사항이 저장되었습니다." />
      <Toast
        variant="error"
        message="저장에 실패했습니다. 다시 시도해 주세요."
      />
    </div>
  ),
};
