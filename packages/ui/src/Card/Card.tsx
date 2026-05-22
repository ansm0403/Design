import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ForwardedRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";

// Card 는 surface·border·shadow·radius 토큰의 첫 실제 소비자.
// variant 와 padding 이 독립적이라 compoundVariants 없이 두 개의 독립 variant 그룹으로 충분.
// (Button/Badge 와 달리 조합 매트릭스가 필요 없는 단순한 cva 사용 사례)
const cardStyles = cva(
  // rounded-md: 토큰 --radius-md(0.375rem). tokens.css(:root)가 Tailwind의 기본값을
  // cascade(unlayered > @layer)로 덮어쓰므로 @theme 추가 없이도 토큰 값이 적용된다.
  "rounded-md",
  {
    variants: {
      variant: {
        // outlined: 표면색 배경 + 테두리.
        outlined: "bg-surface border border-border",
        // elevated: 표면색 배경 + 그림자. shadow-md 도 tokens.css 값으로 cascade 적용.
        elevated: "bg-surface shadow-md",
        // filled: 표면색 배경만(테두리·그림자 없음).
        filled: "bg-surface",
      },
      padding: {
        none: "",
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
      },
    },
    defaultVariants: { variant: "outlined", padding: "md" },
  },
);

export type CardProps = VariantProps<typeof cardStyles> &
  ComponentPropsWithoutRef<"div">;

// 단순 <div> + forwardRef — Button 패턴 준용. polymorphic(as) 은 의도적으로 생략.
// 시맨틱 태그(article 등)가 필요하면 className 으로 className 은 cn() 으로 병합 가능.
function CardInner(
  { variant, padding, className, ...rest }: CardProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      className={cn(cardStyles({ variant, padding }), className)}
      {...rest}
    />
  );
}

const CardImpl = forwardRef(CardInner);
CardImpl.displayName = "Card";
export const Card = CardImpl;
