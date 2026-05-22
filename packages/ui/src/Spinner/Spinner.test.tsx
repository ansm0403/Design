import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("단독으로 쓰면 role='status' 와 aria-label 이 붙는다", () => {
    render(<Spinner label="로딩 중" />);
    expect(screen.getByRole("status", { name: "로딩 중" })).toBeInTheDocument();
  });

  it("label 기본값은 '로딩 중' 이다", () => {
    render(<Spinner />);
    expect(screen.getByRole("status", { name: "로딩 중" })).toBeInTheDocument();
  });

  it("aria-hidden 이면 role 이 없고 aria-hidden='true' 가 붙는다", () => {
    const { container } = render(<Spinner aria-hidden />);
    const svg = container.querySelector("svg");
    expect(svg).not.toHaveAttribute("role");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("aria-hidden='true' 문자열도 장식 경로로 처리된다", () => {
    const { container } = render(<Spinner aria-hidden="true" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).not.toHaveAttribute("role");
  });

  describe("접근성 (vitest-axe)", () => {
    it("단독 스피너는 접근성 위반이 없다", async () => {
      const { container } = render(
        <main>
          <Spinner label="로딩 중" />
        </main>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("장식 스피너는 접근성 위반이 없다", async () => {
      const { container } = render(
        <main>
          <Spinner aria-hidden />
        </main>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
