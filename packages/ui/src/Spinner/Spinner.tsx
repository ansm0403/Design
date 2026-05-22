import { forwardRef } from "react";
import type { ForwardedRef, SVGProps } from "react";
import { cn } from "../utils/cn";

type SpinnerSize = "sm" | "md" | "lg";

const sizeClass: Record<SpinnerSize, string> = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

export type SpinnerProps = SVGProps<SVGSVGElement> & {
  size?: SpinnerSize;
  /** 스크린리더 낭독 텍스트. aria-hidden 전달 시 무시된다(장식 경로). */
  label?: string;
};

function SpinnerInner(
  {
    size = "md",
    label = "로딩 중",
    className,
    "aria-hidden": ariaHidden,
    ...rest
  }: SpinnerProps,
  ref: ForwardedRef<SVGSVGElement>,
) {
  // aria-hidden 이 오면 장식 경로 — role/label 을 제거하고 보조기술에서 숨긴다.
  // 단독으로 쓸 때는 role="status" + aria-label 로 로딩 상태를 알린다.
  const isDecorative = ariaHidden === true || ariaHidden === "true";

  return (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("animate-spin", sizeClass[size], className)}
      role={isDecorative ? undefined : "status"}
      aria-label={isDecorative ? undefined : label}
      aria-hidden={isDecorative ? true : undefined}
      {...rest}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

const SpinnerImpl = forwardRef(SpinnerInner);
SpinnerImpl.displayName = "Spinner";
export const Spinner = SpinnerImpl;
