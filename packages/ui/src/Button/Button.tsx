import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ForwardedRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";

// ── cva (class-variance-authority) 란? ───────────────────────────────
// variant(시각 변형)별 className 을 if/삼항 분기 없이 "표" 로 선언하는 도구다.
//   cva(베이스클래스, { variants, compoundVariants, defaultVariants })
// 반환값은 함수다 — variant 값을 넘기면 최종 className 문자열을 만들어 준다.
//   buttonStyles({ variant: "outline", color: "danger", size: "sm" })
//     → "inline-flex ... border-danger text-danger ... h-8 px-3 text-sm"
// variant 종류가 늘어도 객체에 줄만 추가하면 되는 게 핵심 장점이다.

const buttonStyles = cva(
  // 베이스 — 모든 버튼이 공유하는 클래스.
  // border-transparent: solid/ghost 도 1px 투명 테두리를 둬서, 색 테두리가 있는
  //   outline 과 박스 크기(높이·너비)가 픽셀 단위로 정확히 일치하게 만든다.
  // cursor-pointer: Tailwind v4 는 버튼에 pointer 커서를 기본 적용하지 않는다.
  "inline-flex items-center justify-center whitespace-nowrap rounded-md border border-transparent font-medium transition-colors cursor-pointer",
  {
    variants: {
      // size 는 variant/color 와 독립적이다 — 패딩·높이·글자 크기만 정한다.
      // text-sm/base/lg 의 값(0.875 / 1 / 1.125rem)은 타이포 토큰
      // fontSize.sm/md/lg 와 동일하다. 타이포 토큰은 아직 @theme 에 연결돼 있지
      // 않아 Tailwind 기본 유틸리티를 쓰지만, 값이 일치하므로 디자인 드리프트는
      // 없다 (Box/Flex 가 spacing 에서 Tailwind 기본값을 쓰는 것과 같은 방식).
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
      },
      // variant 와 color 는 단독으로는 시각 결과를 결정하지 못한다 —
      // 배경·테두리·글자색이 "둘의 조합" 으로 정해지기 때문이다. 그래서 여기서는
      // 선택지만 선언하고, 실제 클래스는 아래 compoundVariants 가 부여한다.
      variant: { solid: "", outline: "", ghost: "" },
      color: { primary: "", danger: "", neutral: "" },
    },
    // compoundVariants — 여러 variant 가 "동시에 특정 값" 일 때만 적용되는 규칙.
    // variant(3) × color(3) = 9 조합을 토큰 기반 클래스로 매핑한다.
    compoundVariants: [
      // solid — 채운 배경. 글자색은 text-background(배경색 토큰)로 둔다.
      //   배경 토큰은 light 에서 거의 흰색, dark 에서 거의 검정 → data-theme 가
      //   바뀌면 글자색도 함께 뒤집혀, 옅은 색/짙은 색 배경 모두에서 대비가
      //   확보된다. (text-white 로 고정하면 dark 테마의 옅은 primary 위에서
      //   대비가 깨지고, 색을 직접 박는 것은 토큰 원칙에도 어긋난다.)
      {
        variant: "solid",
        color: "primary",
        className: "bg-primary text-background hover:bg-primary/90",
      },
      {
        variant: "solid",
        color: "danger",
        className: "bg-danger text-background hover:bg-danger/90",
      },
      {
        variant: "solid",
        color: "neutral",
        className: "bg-neutral text-background hover:bg-neutral/90",
      },
      // outline — 투명 배경 + 색 테두리/글자. hover 시 옅은 색 배경을 깐다.
      {
        variant: "outline",
        color: "primary",
        className: "border-primary text-primary hover:bg-primary/10",
      },
      {
        variant: "outline",
        color: "danger",
        className: "border-danger text-danger hover:bg-danger/10",
      },
      {
        variant: "outline",
        color: "neutral",
        className: "border-neutral text-neutral hover:bg-neutral/10",
      },
      // ghost — 배경·테두리 없음 + 색 글자. hover 시 옅은 색 배경만 깐다.
      {
        variant: "ghost",
        color: "primary",
        className: "text-primary hover:bg-primary/10",
      },
      {
        variant: "ghost",
        color: "danger",
        className: "text-danger hover:bg-danger/10",
      },
      {
        variant: "ghost",
        color: "neutral",
        className: "text-neutral hover:bg-neutral/10",
      },
    ],
    // prop 미지정 시 적용할 기본 조합.
    defaultVariants: { variant: "solid", color: "primary", size: "md" },
  },
);

// VariantProps<typeof buttonStyles> 는 cva 정의에서 { variant?, color?, size? }
// 타입을 자동 추출한다 — variant 옵션을 바꾸면 prop 타입도 자동으로 따라간다.
// 거기에 <button> 의 기본 props(onClick, disabled, children ...)를 합친다.
export type ButtonProps = VariantProps<typeof buttonStyles> &
  ComponentPropsWithoutRef<"button">;

// Button 은 polymorphic 이 아니라 항상 <button> 으로 렌더된다 → Box 처럼
// 제네릭 타입을 보존하는 캐스팅이 필요 없다. 구현부 타입도 그대로 ButtonProps.
function ButtonInner(
  { variant, color, size, className, type, ...rest }: ButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  return (
    <button
      ref={ref}
      // type 미지정 버튼은 <form> 안에서 submit 으로 동작하는 함정이 있다 →
      // 명시값이 없으면 "button" 으로 폴백한다 (sane default).
      type={type ?? "button"}
      // buttonStyles(...) 가 variant 클래스를 만들고, cn 이 그 뒤에 사용자
      // className 을 병합한다 (twMerge 로 충돌 시 사용자 className 이 우선).
      className={cn(buttonStyles({ variant, color, size }), className)}
      {...rest}
    />
  );
}

// forwardRef: 부모가 ref 로 실제 <button> DOM 에 접근할 수 있게 한다 (라이브러리 필수).
// 비-polymorphic 컴포넌트라 forwardRef 결과를 그대로 쓰고 displayName 만 지정하면
// 된다 (Box/Flex 의 캐스팅 후 displayName 함정이 여기선 발생하지 않는다).
export const Button = forwardRef(ButtonInner);
Button.displayName = "Button";
