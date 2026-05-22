import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ForwardedRef } from "react";
import { cn } from "../utils/cn";

export type DividerProps = ComponentPropsWithoutRef<"div"> & {
  /** 선 방향. 기본값 horizontal. */
  orientation?: "horizontal" | "vertical";
  /**
   * 장식용(true)이면 role/aria-orientation 을 붙이지 않고 aria-hidden="true" 로 숨긴다.
   * 의미 있는 콘텐츠 경계(메뉴 그룹 구분 등)에는 false(기본) 를 유지한다.
   */
  decorative?: boolean;
};

function DividerInner(
  {
    orientation = "horizontal",
    decorative = false,
    className,
    ...rest
  }: DividerProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      role={decorative ? undefined : "separator"}
      // vertical 에서는 aria-orientation="vertical" 이 필수 — 기본이 horizontal 이므로
      // 방향을 명시해야 스크린리더가 올바른 방향을 인지한다.
      aria-orientation={decorative ? undefined : orientation}
      aria-hidden={decorative ? true : undefined}
      className={cn(
        "bg-border shrink-0",
        orientation === "horizontal" ? "h-px w-full" : "w-px self-stretch",
        className,
      )}
      {...rest}
    />
  );
}

const DividerImpl = forwardRef(DividerInner);
DividerImpl.displayName = "Divider";
export const Divider = DividerImpl;
