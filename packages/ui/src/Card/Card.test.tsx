import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Card } from "./Card";

describe("Card", () => {
  it("children 을 렌더한다", () => {
    render(<Card>카드 내용</Card>);
    expect(screen.getByText("카드 내용")).toBeInTheDocument();
  });

  it("기본 variant 는 outlined — border border-border 클래스가 붙는다", () => {
    const { container } = render(<Card>카드</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("border", "border-border");
  });

  it.each([
    {
      label: "outlined → border border-border",
      props: { variant: "outlined" } as const,
      classes: ["border", "border-border", "bg-surface"],
    },
    {
      label: "elevated → shadow-md",
      props: { variant: "elevated" } as const,
      classes: ["shadow-md", "bg-surface"],
    },
    {
      label: "filled → bg-surface (테두리·그림자 없음)",
      props: { variant: "filled" } as const,
      classes: ["bg-surface"],
    },
    {
      label: "padding none → 패딩 클래스 없음, rounded-md 는 유지",
      props: { padding: "none" } as const,
      classes: ["rounded-md"],
    },
    {
      label: "padding sm → p-3",
      props: { padding: "sm" } as const,
      classes: ["p-3"],
    },
    {
      label: "padding lg → p-6",
      props: { padding: "lg" } as const,
      classes: ["p-6"],
    },
  ])("variant·padding → 토큰 클래스 적용: $label", ({ props, classes }) => {
    const { container } = render(<Card {...props}>카드</Card>);
    const card = container.firstChild as HTMLElement;
    for (const cls of classes) {
      expect(card).toHaveClass(cls);
    }
  });

  it("className prop 이 병합된다", () => {
    const { container } = render(<Card className="w-full">카드</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("w-full", "rounded-md");
  });

  describe("접근성 (vitest-axe)", () => {
    it("기본 Card 는 접근성 위반이 없다", async () => {
      const { container } = render(
        <main>
          <Card>카드 내용</Card>
        </main>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("모든 variant 는 접근성 위반이 없다", async () => {
      const { container } = render(
        <main>
          <Card variant="outlined">outlined</Card>
          <Card variant="elevated">elevated</Card>
          <Card variant="filled">filled</Card>
        </main>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
