import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("children 을 렌더한다", () => {
    render(<Badge>신규</Badge>);
    expect(screen.getByText("신규")).toBeInTheDocument();
  });

  it.each([
    {
      label: "solid primary → bg-primary",
      props: { variant: "solid", color: "primary" } as const,
      classes: ["bg-primary", "text-background"],
    },
    {
      label: "subtle danger → bg-danger/10 text-danger",
      props: { variant: "subtle", color: "danger" } as const,
      classes: ["bg-danger/10", "text-danger"],
    },
    {
      label: "outline success → border-success text-success",
      props: { variant: "outline", color: "success" } as const,
      classes: ["border-success", "text-success"],
    },
    {
      label: "size sm → h-5",
      props: { size: "sm" } as const,
      classes: ["h-5"],
    },
    {
      label: "size md → h-6",
      props: { size: "md" } as const,
      classes: ["h-6"],
    },
  ])("variant·color·size → 토큰 클래스 적용: $label", ({ props, classes }) => {
    render(<Badge {...props}>뱃지</Badge>);
    const badge = screen.getByText("뱃지");
    for (const cls of classes) {
      expect(badge).toHaveClass(cls);
    }
  });

  describe("접근성 (vitest-axe)", () => {
    it("기본 Badge 는 접근성 위반이 없다", async () => {
      const { container } = render(
        <main>
          <Badge>신규</Badge>
        </main>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("모든 color 조합은 접근성 위반이 없다", async () => {
      const { container } = render(
        <main>
          <Badge color="primary">primary</Badge>
          <Badge color="danger">danger</Badge>
          <Badge color="success">success</Badge>
          <Badge color="neutral">neutral</Badge>
        </main>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
