import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Toast } from "./Toast";

// STEP 4-3: Toast 접근성 테스트
// · 맨몸 <Toast> 시각 컴포넌트를 대상으로 한다 (ToastProvider/타이머 불필요).
// · aria-live 영역(ToastProvider 뷰포트)은 이번 배치 명세 밖이다.
describe("Toast 접근성 (vitest-axe)", () => {
  it("Toast 는 접근성 위반이 없다", async () => {
    const { container } = render(
      <main>
        <Toast
          message="저장되었습니다"
          variant="success"
          onDismiss={() => {}}
        />
      </main>,
    );
    // ⚠️ jsdom 은 canvas 를 구현하지 않으므로 color-contrast 규칙은 skip 된다.
    // 레이블·role·aria 구조(닫기 버튼 aria-label, 색점 aria-hidden 등)를 검사한다.
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
