import { forwardRef } from "react";
import type {
  ComponentPropsWithoutRef,
  ElementType,
  ForwardedRef,
  ReactElement,
  Ref,
} from "react";
import { cn } from "../utils/cn";

// Box 는 디자인 시스템의 모든 컴포넌트가 기반으로 삼는 기본 상자다.
//
// polymorphic 컴포넌트 = `as` prop 으로 렌더링할 태그를 바꿀 수 있는 패턴.
//   <Box>            → <div>
//   <Box as="section"> → <section>
//   <Box as="a" href="..."> → <a href="...">  (a 태그 전용 prop 까지 타입에 포함)
//
// 제네릭 T 가 `as` 값을 따라가므로, as 가 "a" 면 ComponentPropsWithoutRef<"a"> 가
// 펼쳐져 href 같은 prop 이 타입상 허용된다.
export type BoxProps<T extends ElementType = "div"> = {
  // as: 렌더링할 HTML 태그 또는 React 컴포넌트. 기본값 "div".
  as?: T;
  // Omit<..., "as"> — 만약 T 의 props 에 "as" 가 있어도 우리 정의가 우선되도록 제거.
} & Omit<ComponentPropsWithoutRef<T>, "as">;

// 구현부 props 는 BoxProps<ElementType> 로 "느슨하게" 둔다.
// 제네릭 T 를 그대로 쓰면 className 구조분해·rest 전개 지점에서 TS 가
// "이 키가 존재하는지 알 수 없다" 며 막는다. 정확한 제네릭 타입은 아래
// export 캐스팅이 공개 API 에 부여하므로, 내부 구현은 단순하게 간다.
function BoxInner(
  { as, className, ...rest }: BoxProps<ElementType>,
  ref: ForwardedRef<Element>,
) {
  // as 가 없거나 잘못된 값이어도 안전하게 div 로 폴백한다.
  const Component = as ?? "div";
  return <Component ref={ref} className={cn(className)} {...rest} />;
}

// forwardRef: 부모가 ref 로 실제 DOM 요소에 접근할 수 있게 한다 (라이브러리 필수).
//
// 캐스팅 이유: forwardRef 는 제네릭 컴포넌트의 타입 파라미터(T)를 보존하지
// 못하는 알려진 한계가 있다. BoxInner 의 제네릭 시그니처를 공개 API 에 그대로
// 살리기 위해, forwardRef 결과를 "T 를 받는 호출 시그니처" 로 캐스팅한다.
const BoxImpl = forwardRef(BoxInner);

// displayName 은 캐스팅 "전"에 설정한다. 아래 캐스팅 후의 타입은 순수 함수
// 시그니처라 .displayName 프로퍼티를 받지 못한다. 이게 없으면 React DevTools 와
// Storybook autodocs 가 컴포넌트를 내부 함수명("BoxInner")으로 표기한다.
BoxImpl.displayName = "Box";

export const Box = BoxImpl as <T extends ElementType = "div">(
  props: BoxProps<T> & { ref?: Ref<Element> },
) => ReactElement | null;
