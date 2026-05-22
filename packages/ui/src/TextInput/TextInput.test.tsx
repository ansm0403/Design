import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { TextInput } from "./TextInput";

describe("TextInput", () => {
  // ── 단위 테스트 (STEP 4-2) ──────────────────────────────────────────

  it("입력하면 onChange 가 호출된다", async () => {
    const spy = vi.fn();
    const user = userEvent.setup();
    // 비제어(value 미전달): DOM 이 직접 값을 보유해 toHaveValue 단언이 가능하다.
    render(<TextInput label="이메일" onChange={spy} />);
    const input = screen.getByLabelText("이메일");
    await user.type(input, "a@b.com");
    expect(spy).toHaveBeenCalled();
    expect(input).toHaveValue("a@b.com");
  });

  it("label 과 input 이 연결된다", () => {
    render(<TextInput label="이메일" />);
    // getByLabelText 가 성공하는 것 자체가 htmlFor↔id 연결의 증명이다.
    const input = screen.getByLabelText("이메일");
    expect(input.tagName).toBe("INPUT");
  });

  it("error 가 있으면 aria-invalid=true 이고 에러 메시지가 표시된다", () => {
    render(<TextInput label="이메일" error="필수 항목입니다" />);
    const input = screen.getByLabelText("이메일");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("필수 항목입니다")).toBeInTheDocument();
    // aria-describedby 로 에러 메시지와 연결됐는지 검사
    expect(input).toHaveAccessibleDescription("필수 항목입니다");
  });

  it("error 가 없으면 aria-invalid 속성이 없다", () => {
    render(<TextInput label="이메일" />);
    const input = screen.getByLabelText("이메일");
    // aria-invalid={undefined} → 속성 자체가 렌더되지 않아야 한다
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("disabled 면 입력이 비활성화된다", () => {
    render(<TextInput label="이메일" disabled />);
    expect(screen.getByLabelText("이메일")).toBeDisabled();
  });

  // ── 접근성 테스트 (STEP 4-3) ─────────────────────────────────────────

  describe("접근성 (vitest-axe)", () => {
    // label 없이 렌더하면 axe 의 label 규칙 위반이 발생하므로 반드시 label 포함.
    it("기본 TextInput 은 접근성 위반이 없다", async () => {
      const { container } = render(
        <main>
          <TextInput label="이메일" />
        </main>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("error 상태 TextInput 은 접근성 위반이 없다", async () => {
      const { container } = render(
        <main>
          <TextInput label="이메일" error="필수 항목입니다" />
        </main>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
