import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ForwardedRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";

// Badge 는 Button STEP 3-1 의 cva compoundVariants 패턴을 그대로 재사용한다.
// variant·color 가 단독으로는 시각 결과를 결정하지 못해 조합으로 클래스를 부여한다.
// size 만 독립 variant — padding·글자 크기만 정한다.
const badgeStyles = cva(
  "inline-flex items-center justify-center rounded-full font-medium whitespace-nowrap",
  {
    variants: {
      variant: { solid: "", subtle: "", outline: "" },
      color: { primary: "", danger: "", success: "", neutral: "" },
      size: {
        sm: "h-5 px-2 text-xs",
        md: "h-6 px-2.5 text-sm",
      },
    },
    compoundVariants: [
      // solid — 채운 배경. 글자색은 text-background(Button 과 동일 근거).
      { variant: "solid", color: "primary", className: "bg-primary text-background" },
      { variant: "solid", color: "danger", className: "bg-danger text-background" },
      { variant: "solid", color: "success", className: "bg-success text-background" },
      { variant: "solid", color: "neutral", className: "bg-neutral text-background" },
      // subtle — 옅은 배경(opacity modifier). 토큰 색 + 투명도라 규칙 3 위반 아님.
      { variant: "subtle", color: "primary", className: "bg-primary/10 text-primary" },
      { variant: "subtle", color: "danger", className: "bg-danger/10 text-danger" },
      { variant: "subtle", color: "success", className: "bg-success/10 text-success" },
      { variant: "subtle", color: "neutral", className: "bg-neutral/10 text-neutral" },
      // outline — 투명 배경 + 색 테두리/글자.
      { variant: "outline", color: "primary", className: "border border-primary text-primary" },
      { variant: "outline", color: "danger", className: "border border-danger text-danger" },
      { variant: "outline", color: "success", className: "border border-success text-success" },
      { variant: "outline", color: "neutral", className: "border border-neutral text-neutral" },
    ],
    defaultVariants: { variant: "solid", color: "primary", size: "md" },
  },
);

export type BadgeProps = VariantProps<typeof badgeStyles> &
  ComponentPropsWithoutRef<"span">;

function BadgeInner(
  { variant, color, size, className, ...rest }: BadgeProps,
  ref: ForwardedRef<HTMLSpanElement>,
) {
  return (
    <span
      ref={ref}
      className={cn(badgeStyles({ variant, color, size }), className)}
      {...rest}
    />
  );
}

const BadgeImpl = forwardRef(BadgeInner);
BadgeImpl.displayName = "Badge";
export const Badge = BadgeImpl;
