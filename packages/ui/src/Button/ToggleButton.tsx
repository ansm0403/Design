import { forwardRef, useState } from "react";
import type {
  ComponentPropsWithoutRef,
  ForwardedRef,
  MouseEventHandler,
} from "react";
import { cn } from "../utils/cn";
import { buttonStyles, type ButtonVariantProps } from "./Button";
import { useButton } from "./useButton";

// ── headless 패턴의 이점 (이 파일이 살아있는 증거) ────────────────────
// ToggleButton 은 Button 과 "겉모습"(버튼 룩)은 공유하지만 "동작"이 다르다 —
// 누를 때마다 눌림 상태가 토글된다. 그런데도 클릭 차단·비활성 처리 같은 공통
// 동작은 새로 짜지 않는다: Button 과 똑같이 useButton 훅을 호출하기만 하면 된다.
//   · 시각(룩)      → buttonStyles(cva) 재사용
//   · 공통 동작     → useButton 훅 재사용
//   · 고유 동작     → 이 파일의 pressed 토글 로직만 새로 작성
// 동작과 스타일이 분리돼 있어, 서로 다른 컴포넌트가 필요한 조각만 골라 조립한다.

// ComponentPropsWithoutRef<"button"> 에 이미 들어있는 aria-pressed 는 이 컴포넌트가
// 눌림 상태로부터 자동 계산하므로, 외부에서 못 덮어쓰게 Omit 한다.
export type ToggleButtonProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "aria-pressed"
> &
  // variant 는 눌림 상태로 정해지므로(아래 참고) color/size 만 노출한다.
  Pick<ButtonVariantProps, "color" | "size"> & {
    /** 눌림 상태 — 이 값을 주면 "제어 컴포넌트"가 된다(상태를 부모가 소유). */
    pressed?: boolean;
    /** 비제어 모드의 초기 눌림 상태. pressed 를 주지 않을 때만 의미가 있다. */
    defaultPressed?: boolean;
    /** 눌림 상태가 바뀔 때 호출된다. 다음 상태(boolean)를 인자로 받는다. */
    onPressedChange?: (pressed: boolean) => void;
  };

function ToggleButtonInner(
  {
    color,
    size,
    pressed,
    defaultPressed,
    onPressedChange,
    onClick,
    disabled = false,
    className,
    type,
    children,
    // Button 과 동일하게 aria-disabled 를 꺼내 useButton 에 넘긴다 — 꺼내지 않으면
    // rest 로 새어 들어가 "비활성처럼 보이지만 클릭하면 토글되는" 모순이 생긴다.
    "aria-disabled": ariaDisabledProp,
    ...rest
  }: ToggleButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  // 제어/비제어 양쪽을 지원한다.
  //  · pressed 를 주면(제어)   → 부모가 상태를 소유, 내부 state 는 무시.
  //  · pressed 가 없으면(비제어) → 내부 state 로 스스로 토글.
  const isControlled = pressed !== undefined;
  const [internalPressed, setInternalPressed] = useState(
    defaultPressed ?? false,
  );
  // 화면에 실제로 반영할 눌림 상태 — 제어면 prop, 비제어면 내부 state.
  const currentPressed = pressed ?? internalPressed;

  const handleToggle: MouseEventHandler<HTMLButtonElement> = (event) => {
    const next = !currentPressed;
    // 비제어일 때만 내부 state 를 갱신한다. 제어일 때 내부 state 를 건드리면
    // prop 과 어긋난 두 개의 진실이 생긴다.
    if (!isControlled) setInternalPressed(next);
    onPressedChange?.(next);
    onClick?.(event);
  };

  // Button 과 동일한 headless 훅 — 클릭 차단/비활성 처리를 그대로 물려받는다.
  // 토글 로직(handleToggle)을 onClick 으로 넘기면, 훅이 비활성 상태에서 그
  // 호출을 알아서 막아준다.
  const { buttonProps, isDisabled } = useButton({
    disabled,
    ariaDisabled: ariaDisabledProp === true || ariaDisabledProp === "true",
    onClick: handleToggle,
  });

  return (
    <button
      ref={ref}
      type={type ?? "button"}
      // aria-pressed: 스크린리더에 "이것은 토글 버튼이며 현재 눌림/안눌림" 임을 알린다.
      // 일반 버튼과 토글 버튼을 보조기술이 구분하는 핵심 속성이다.
      aria-pressed={currentPressed}
      // 눌림 = solid(채워진 룩), 안눌림 = outline(테두리 룩)으로 상태를 시각화한다.
      // buttonStyles 표를 재사용하므로 색/크기 체계가 Button 과 완전히 일치한다.
      className={cn(
        buttonStyles({
          variant: currentPressed ? "solid" : "outline",
          color,
          size,
        }),
        isDisabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      // rest 를 먼저, buttonProps 를 나중에 펼쳐 동작 관련 props 는 훅 결과가 우선.
      {...rest}
      {...buttonProps}
    >
      {children}
    </button>
  );
}

// forwardRef + displayName — Button 과 동일한 비-polymorphic 패턴.
export const ToggleButton = forwardRef(ToggleButtonInner);
ToggleButton.displayName = "ToggleButton";
