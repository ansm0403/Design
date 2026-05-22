import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Grid } from "./Grid";

describe("Grid", () => {
  it("grid 클래스와 cols 클래스가 붙는다", () => {
    const { container } = render(<Grid cols={3}>내용</Grid>);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass("grid", "grid-cols-3");
  });

  it("cols 기본값은 1 — grid-cols-1 이 붙는다", () => {
    const { container } = render(<Grid>내용</Grid>);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass("grid-cols-1");
  });

  it.each([1, 2, 3, 4, 5, 6] as const)(
    "cols=%i → grid-cols-%i 클래스가 붙는다",
    (cols) => {
      const { container } = render(<Grid cols={cols}>내용</Grid>);
      const el = container.firstChild as HTMLElement;
      expect(el).toHaveClass(`grid-cols-${cols}`);
    },
  );

  it("gap 이 0 이어도 gap-0 클래스가 붙는다", () => {
    // gap=0 은 falsy 라 `gap && gapClass[gap]` 패턴이면 건너뛴다 —
    // undefined 검사를 쓰는 이유를 보장하는 회귀 방지 테스트.
    const { container } = render(<Grid gap={0}>내용</Grid>);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass("gap-0");
  });

  it("gap 미지정 시 gap 클래스가 붙지 않는다", () => {
    const { container } = render(<Grid>내용</Grid>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).not.toMatch(/\bgap-/);
  });

  it("as prop 으로 시맨틱 태그를 렌더할 수 있다", () => {
    const { container } = render(<Grid as="section">내용</Grid>);
    expect(container.querySelector("section")).toBeInTheDocument();
  });

  describe("접근성 (vitest-axe)", () => {
    it("기본 Grid 는 접근성 위반이 없다", async () => {
      const { container } = render(
        <main>
          <Grid cols={2}>
            <div>1</div>
            <div>2</div>
          </Grid>
        </main>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
