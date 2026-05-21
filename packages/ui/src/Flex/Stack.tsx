import { forwardRef } from "react";
import type { ElementType, ForwardedRef, ReactElement, Ref } from "react";
import { Flex, type FlexProps } from "./Flex";

// Stack 은 세로 정렬(direction="column")로 고정한 Flex 단축 컴포넌트다.
// 세로 쌓기는 레이아웃에서 가장 흔한 패턴이라 별도 이름을 둘 가치가 있다.
//
// direction 을 Stack 이 소유(고정)하므로, 공개 props 에서 direction 을 제거한다.
export type StackProps<T extends ElementType = "div"> = Omit<
  FlexProps<T>,
  "direction"
>;

function StackInner(
  props: StackProps<ElementType>,
  ref: ForwardedRef<Element>,
) {
  // direction 을 먼저 두고 props 를 펼친다. props 에는 direction 이 없으므로
  // (StackProps 에서 Omit) 사용자가 direction 을 덮어쓸 수 없다.
  return <Flex ref={ref} direction="column" {...props} />;
}

const StackImpl = forwardRef(StackInner);

// displayName 은 캐스팅 전에 설정한다 (Box.tsx 와 동일한 이유).
StackImpl.displayName = "Stack";

export const Stack = StackImpl as <T extends ElementType = "div">(
  props: StackProps<T> & { ref?: Ref<Element> },
) => ReactElement | null;
