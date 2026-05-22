import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Button } from "./Button";

describe("Button", () => {
  // ── 단위 테스트 (STEP 4-2) ──────────────────────────────────────────

  it("클릭하면 onClick 이 호출된다", async () => {
    const spy = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={spy}>저장</Button>);
    await user.click(screen.getByRole("button", { name: "저장" }));
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("disabled 면 클릭해도 onClick 이 호출되지 않는다", async () => {
    const spy = vi.fn();
    const user = userEvent.setup();
    render(<Button disabled onClick={spy}>저장</Button>);
    const button = screen.getByRole("button", { name: "저장" });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(spy).not.toHaveBeenCalled();
  });

  it("isLoading 이면 클릭이 차단되고 aria-busy 가 켜지며 accessible name 이 보존된다", async () => {
    // accessible name 보존: opacity-0 으로 숨겨서 접근성 트리에 남아있어야 한다
    // (Phase 3 edgecase-review FAIL 수정 — invisible→opacity-0 의 회귀 방지 가드)
    const spy = vi.fn();
    const user = userEvent.setup();
    render(<Button isLoading onClick={spy}>저장</Button>);
    const button = screen.getByRole("button", { name: "저장" }); // name 보존 검증
    expect(button).toHaveAttribute("aria-busy", "true");
    await user.click(button);
    expect(spy).not.toHaveBeenCalled();
  });

  it("aria-disabled 면 클릭이 차단되지만 포커스는 유지된다", async () => {
    // aria-disabled: 네이티브 disabled 와 달리 포커스를 잃지 않는다
    const spy = vi.fn();
    const user = userEvent.setup();
    render(<Button aria-disabled onClick={spy}>저장</Button>);
    const button = screen.getByRole("button", { name: "저장" });
    expect(button).toHaveAttribute("aria-disabled", "true");
    await user.click(button);
    expect(spy).not.toHaveBeenCalled();
    // 네이티브 disabled 가 아니므로 포커스 가능
    button.focus();
    expect(button).toHaveFocus();
  });

  it.each([
    {
      label: "solid primary(기본) → bg-primary",
      props: {} as const,
      classes: ["bg-primary"],
    },
    {
      label: "outline danger → border-danger, text-danger",
      props: { variant: "outline", color: "danger" } as const,
      classes: ["border-danger", "text-danger"],
    },
    {
      label: "size sm → h-8",
      props: { size: "sm" } as const,
      classes: ["h-8"],
    },
  ])("variant·color·size → 토큰 클래스 적용: $label", ({ props, classes }) => {
    render(<Button {...props}>버튼</Button>);
    const button = screen.getByRole("button", { name: "버튼" });
    for (const cls of classes) {
      expect(button).toHaveClass(cls);
    }
  });

  // ── 접근성 테스트 (STEP 4-3) ─────────────────────────────────────────

  describe("접근성 (vitest-axe)", () => {
    // <main> 래퍼: region best-practice 규칙이 "모든 콘텐츠는 landmark 안에" 를
    // 요구하므로, 단독 컴포넌트 렌더 시 위반이 발생하지 않도록 감싼다.
    it("기본 버튼은 접근성 위반이 없다", async () => {
      const { container } = render(
        <main>
          <Button>저장</Button>
        </main>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("로딩 중 버튼은 접근성 위반이 없다 (button-name 보존 확인)", async () => {
      const { container } = render(
        <main>
          <Button isLoading>저장</Button>
        </main>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
