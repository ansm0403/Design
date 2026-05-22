import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Divider } from "./Divider";

describe("Divider", () => {
  it("기본으로 role='separator' 와 aria-orientation='horizontal' 이 붙는다", () => {
    const { container } = render(<Divider />);
    const divider = container.querySelector("[role='separator']");
    expect(divider).toBeInTheDocument();
    expect(divider).toHaveAttribute("aria-orientation", "horizontal");
  });

  it("orientation='vertical' 이면 aria-orientation='vertical' 이 붙는다", () => {
    const { container } = render(<Divider orientation="vertical" />);
    const divider = container.querySelector("[role='separator']");
    expect(divider).toBeInTheDocument();
    expect(divider).toHaveAttribute("aria-orientation", "vertical");
  });

  it("decorative 이면 role 이 없고 aria-hidden='true' 가 붙는다", () => {
    const { container } = render(<Divider decorative />);
    expect(container.querySelector("[role='separator']")).toBeNull();
    expect(container.querySelector("[aria-hidden='true']")).toBeInTheDocument();
  });

  it("horizontal 은 h-px w-full 클래스가 붙는다", () => {
    const { container } = render(<Divider />);
    const divider = container.firstChild as HTMLElement;
    expect(divider).toHaveClass("h-px", "w-full");
  });

  it("vertical 은 w-px self-stretch 클래스가 붙는다", () => {
    const { container } = render(<Divider orientation="vertical" />);
    const divider = container.firstChild as HTMLElement;
    expect(divider).toHaveClass("w-px", "self-stretch");
  });

  describe("접근성 (vitest-axe)", () => {
    it("기본 Divider 는 접근성 위반이 없다", async () => {
      const { container } = render(
        <main>
          <Divider />
        </main>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("vertical Divider 는 접근성 위반이 없다", async () => {
      const { container } = render(
        <main>
          <Divider orientation="vertical" />
        </main>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("장식 Divider 는 접근성 위반이 없다", async () => {
      const { container } = render(
        <main>
          <Divider decorative />
        </main>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
