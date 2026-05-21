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

// Flex 는 Box 위에 만든 첫 응용 컴포넌트다 — "기반 컴포넌트의 재사용" 예시.
// flexbox 레이아웃을 prop 으로 다루며, 실제 렌더링은 Box 에 위임한다.

type FlexDirection = "row" | "column";
type FlexAlign = "start" | "center" | "end" | "stretch" | "baseline";
type FlexJustify = "start" | "center" | "end" | "between" | "around";
// gap: Tailwind 기본 spacing 스케일의 단계 번호. (gap-1 = 0.25rem, gap-4 = 1rem ...)
// spacing 토큰은 STEP 2-2 에서 @theme 에 매핑하지 않았으므로 Tailwind 기본값을 쓴다.
type FlexGap = 0 | 1 | 2 | 3 | 4 | 6 | 8;

// prop 값 → 완성된 Tailwind 클래스명 정적 매핑.
//
// ⚠️ Tailwind v4 는 소스 파일을 스캔해 "실제로 등장한 클래스만" CSS 로 생성한다.
//    `flex-${direction}` 처럼 동적으로 조합한 문자열은 스캐너가 찾지 못해
//    유틸리티가 생성되지 않는다. 그래서 완성된 클래스명을 리터럴로 나열한다.
const directionClass: Record<FlexDirection, string> = {
  row: "flex-row",
  column: "flex-col",
};
const alignClass: Record<FlexAlign, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
};
const justifyClass: Record<FlexJustify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
};
const gapClass: Record<FlexGap, string> = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  6: "gap-6",
  8: "gap-8",
};

// Flex 가 직접 소유하는 prop. 그 외 prop 은 as 가 가리키는 태그의 것.
type FlexOwnProps<T extends ElementType> = {
  as?: T;
  direction?: FlexDirection;
  align?: FlexAlign;
  justify?: FlexJustify;
  gap?: FlexGap;
};

export type FlexProps<T extends ElementType = "div"> = FlexOwnProps<T> &
  // Flex 자신의 prop 키는 제거해, as 태그의 props 와 충돌하지 않게 한다.
  Omit<ComponentPropsWithoutRef<T>, keyof FlexOwnProps<T>>;

// 구현부는 Box 와 동일하게 느슨한 타입(ElementType)으로 둔다. 정확한 제네릭은
// 아래 export 캐스팅이 부여한다.
function FlexInner(
  {
    as,
    direction = "row",
    align,
    justify,
    gap,
    className,
    ...rest
  }: FlexProps<ElementType>,
  ref: ForwardedRef<Element>,
) {
  return (
    <Box
      as={as}
      ref={ref}
      className={cn(
        "flex",
        directionClass[direction],
        // align/justify 는 선택값 — 없으면 클래스를 붙이지 않는다.
        align && alignClass[align],
        justify && justifyClass[justify],
        // gap 은 0 이 유효값(gap-0)이라 `gap &&` 가 아니라 undefined 검사를 쓴다.
        gap !== undefined && gapClass[gap],
        className,
      )}
      {...rest}
    />
  );
}

const FlexImpl = forwardRef(FlexInner);

// displayName 은 캐스팅 전에 설정한다 (Box.tsx 와 동일한 이유 — 캐스팅 후의
// 함수 시그니처 타입은 .displayName 을 받지 못한다).
FlexImpl.displayName = "Flex";

export const Flex = FlexImpl as <T extends ElementType = "div">(
  props: FlexProps<T> & { ref?: Ref<Element> },
) => ReactElement | null;
