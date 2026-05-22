import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ForwardedRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";
import { useButton } from "./useButton";
import { Spinner } from "../Spinner";

// ── cva (class-variance-authority) 란? ───────────────────────────────
// variant(시각 변형)별 className 을 if/삼항 분기 없이 "표" 로 선언하는 도구다.
//   cva(베이스클래스, { variants, compoundVariants, defaultVariants })
// 반환값은 함수다 — variant 값을 넘기면 최종 className 문자열을 만들어 준다.
//   buttonStyles({ variant: "outline", color: "danger", size: "sm" })
//     → "inline-flex ... border-danger text-danger ... h-8 px-3 text-sm"
// variant 종류가 늘어도 객체에 줄만 추가하면 되는 게 핵심 장점이다.
//
// export 하는 이유: 같은 폴더의 ToggleButton 이 이 표를 그대로 재사용한다
// (버튼 룩앤필의 single source of truth — 중복 정의 방지).
export const buttonStyles = cva(
  // 베이스 — 모든 버튼이 공유하는 클래스.
  // relative: 로딩 시 스피너를 absolute 로 버튼 위에 띄우기 위한 기준점.
  // border-transparent: solid/ghost 도 1px 투명 테두리를 둬서, 색 테두리가 있는
  //   outline 과 박스 크기(높이·너비)가 픽셀 단위로 정확히 일치하게 만든다.
  // cursor-pointer: Tailwind v4 는 버튼에 pointer 커서를 기본 적용하지 않는다.
  // focus-visible:*: 키보드 탐색(Tab)으로 포커스됐을 때만 링을 그린다. 마우스
  //   클릭 시엔 안 보인다. outline-none 으로 브라우저 기본 외곽선을 끄고 ring 으로
  //   대체한다. ring-offset-background 는 링과 버튼 사이 간격을 페이지 배경색
  //   토큰으로 칠해, 라이트/다크 어디서나 링이 또렷하게 보이게 한다.
  "relative inline-flex items-center justify-center whitespace-nowrap rounded-md border border-transparent font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
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
      // variant 는 단독으로는 시각 결과를 결정하지 못한다 — 배경·테두리·글자색이
      // variant×color "조합" 으로 정해지기 때문이다. 그래서 여기서는 선택지만
      // 선언하고, 실제 클래스는 아래 compoundVariants 가 부여한다.
      variant: { solid: "", outline: "", ghost: "" },
      // color 는 배경/테두리/글자색에선 variant 와의 조합이 필요하지만, focus 링
      // 색만큼은 color 단독으로 결정된다(variant 와 무관) → 여기에 직접 둔다.
      color: {
        primary: "focus-visible:ring-primary",
        danger: "focus-visible:ring-danger",
        neutral: "focus-visible:ring-neutral",
      },
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

// cva 정의에서 자동 추출한 { variant?, color?, size? } 타입.
// ToggleButton 이 color/size 만 골라 쓰기 위해 export 한다.
export type ButtonVariantProps = VariantProps<typeof buttonStyles>;

// VariantProps 로 뽑은 variant 타입에 <button> 기본 props(onClick, disabled,
// children ...)와 라이브러리 고유 prop(isLoading)을 합친다 — variant 옵션을
// 바꾸면 prop 타입도 자동으로 따라간다.
export type ButtonProps = ButtonVariantProps &
  ComponentPropsWithoutRef<"button"> & {
    /** true 면 스피너를 표시하고 클릭을 막으며 aria-busy 를 켠다. */
    isLoading?: boolean;
  };

// Button 은 polymorphic 이 아니라 항상 <button> 으로 렌더된다 → Box 처럼
// 제네릭 타입을 보존하는 캐스팅이 필요 없다. 구현부 타입도 그대로 ButtonProps.
function ButtonInner(
  {
    variant,
    color,
    size,
    className,
    type,
    isLoading = false,
    disabled = false,
    onClick,
    children,
    // aria-disabled 는 <button> 기본 속성이라 rest 로 들어온다 — 명시적으로 꺼내
    // useButton 에 넘긴다(꺼내지 않으면 클릭 차단 로직이 동작하지 않는다).
    "aria-disabled": ariaDisabledProp,
    ...rest
  }: ButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  // 동작(클릭 차단·로딩·비활성)은 전부 headless 훅에 위임한다.
  // 이 컴포넌트는 그 결과를 받아 "겉모습" 만 그린다.
  const { buttonProps, isLoading: loading, isDisabled } = useButton({
    isLoading,
    disabled,
    // aria-disabled 속성값은 boolean 또는 "true"/"false" 문자열일 수 있다 → 정규화.
    ariaDisabled: ariaDisabledProp === true || ariaDisabledProp === "true",
    onClick,
  });

  return (
    <button
      ref={ref}
      // type 미지정 버튼은 <form> 안에서 submit 으로 동작하는 함정이 있다 →
      // 명시값이 없으면 "button" 으로 폴백한다 (sane default).
      type={type ?? "button"}
      className={cn(
        buttonStyles({ variant, color, size }),
        // 로딩은 스피너로 따로 표현하므로, "로딩이 아닌" 순수 비활성일 때만 흐리게 한다.
        isDisabled && !loading && "opacity-50 cursor-not-allowed",
        // 로딩 중에는 대기 커서를 보여 클릭이 처리 중임을 암시한다.
        loading && "cursor-wait",
        className,
      )}
      // rest 를 먼저, buttonProps 를 나중에 펼쳐 동작 관련 props(onClick·disabled·
      // aria-busy·aria-disabled)는 항상 훅 결과가 우선하도록 한다.
      {...rest}
      {...buttonProps}
    >
      {loading && (
        // 스피너는 absolute 로 버튼 위에 겹쳐 띄운다 (베이스의 relative 가 기준점).
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner
            aria-hidden
            size={size === "sm" ? "sm" : size === "lg" ? "lg" : "md"}
          />
        </span>
      )}
      {/* 로딩 중 children 은 opacity-0 으로 "시각적으로만" 숨긴다.
          - 공간은 그대로 차지 → 버튼 너비가 유지돼 레이아웃 시프트가 없다.
          - ⚠️ invisible(visibility:hidden)·display:none 은 요소를 접근성 트리에서
            제거해, 로딩 중 버튼의 accessible name(라벨)이 사라진다 → 스크린리더가
            어떤 버튼인지 못 읽는다(axe button-name 위반). opacity-0 은 접근성
            트리에 남으므로 라벨이 보존되고, 로딩 사실은 aria-busy 가 전달한다. */}
      <span className={cn(loading && "opacity-0")}>{children}</span>
    </button>
  );
}

// forwardRef: 부모가 ref 로 실제 <button> DOM 에 접근할 수 있게 한다 (라이브러리 필수).
// 비-polymorphic 컴포넌트라 forwardRef 결과를 그대로 쓰고 displayName 만 지정하면
// 된다 (Box/Flex 의 캐스팅 후 displayName 함정이 여기선 발생하지 않는다).
export const Button = forwardRef(ButtonInner);
Button.displayName = "Button";
