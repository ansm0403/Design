import { forwardRef } from "react";
import type {
  ComponentPropsWithoutRef,
  ElementType,
  ForwardedRef,
  ReactElement,
  Ref,
} from "react";
import { Box } from "../Box";
import { cn } from "../utils/cn";

// Grid 는 Flex(1차원)의 짝인 2차원 격자 레이아웃 컴포넌트.
// Flex STEP 2-5 의 "Box 합성 + 정적 클래스 매핑" 패턴을 그대로 준용한다.

type GridCols = 1 | 2 | 3 | 4 | 5 | 6;
// Flex 와 동일한 Tailwind spacing 스케일.
type GridGap = 0 | 1 | 2 | 3 | 4 | 6 | 8;

// ⚠️ Tailwind v4 는 소스를 정적 스캔한다 → `grid-cols-${n}` 동적 조합은
// 스캐너가 찾지 못해 유틸리티가 생성되지 않는다. 완성 클래스명을 리터럴로 나열.
const colsClass: Record<GridCols, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

const gapClass: Record<GridGap, string> = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  6: "gap-6",
  8: "gap-8",
};

type GridOwnProps<T extends ElementType> = {
  as?: T;
  /** 격자 컬럼 수(고정). 1~6. 반응형 확장은 phases.md STEP 6-5 "반응형 확장 메모" 참조. */
  cols?: GridCols;
  gap?: GridGap;
};

export type GridProps<T extends ElementType = "div"> = GridOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof GridOwnProps<T>>;

function GridInner(
  { as, cols = 1, gap, className, ...rest }: GridProps<ElementType>,
  ref: ForwardedRef<Element>,
) {
  return (
    <Box
      as={as}
      ref={ref}
      className={cn(
        "grid",
        colsClass[cols],
        // gap 은 0 이 유효값(gap-0)이라 `gap &&` 가 아닌 undefined 검사를 쓴다.
        gap !== undefined && gapClass[gap],
        className,
      )}
      {...rest}
    />
  );
}

const GridImpl = forwardRef(GridInner);

// displayName 은 캐스팅 전에 설정한다 (Box·Flex 와 동일한 이유).
GridImpl.displayName = "Grid";

export const Grid = GridImpl as <T extends ElementType = "div">(
  props: GridProps<T> & { ref?: Ref<Element> },
) => ReactElement | null;
