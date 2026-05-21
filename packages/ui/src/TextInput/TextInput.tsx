import { forwardRef, useId } from "react";
import type { ComponentPropsWithoutRef, ForwardedRef, ReactNode } from "react";
import { cva } from "class-variance-authority";
import { Flex } from "../Flex";
import { cn } from "../utils/cn";

// ── Controlled vs Uncontrolled (제어 vs 비제어) ───────────────────────
// TextInput 은 입력값 state 를 스스로 갖지 않는 표현용(presentational) 컴포넌트다.
// "제어/비제어" 는 *소비자가 어떤 prop 을 넘기느냐* 로 갈린다.
//
//  • Controlled(제어) — value + onChange 를 함께 넘긴다. 입력값의 진실은
//      React state. 키 입력마다 onChange 로 state 를 갱신해야 화면 값이 바뀐다.
//        const [email, setEmail] = useState("");
//        <TextInput value={email} onChange={(e) => setEmail(e.target.value)} />
//      검증·포맷팅·다른 필드와의 연동에 유리 → 디자인 시스템 기본 권장 방식.
//
//  • Uncontrolled(비제어) — value 를 넘기지 않는다(초기값이 필요하면
//      defaultValue 만). 입력값의 진실은 DOM <input> 자신이고, 값은 ref 로 읽는다.
//
// value · onChange · defaultValue 는 모두 아래 ...rest 를 통해 <input> 으로
// 그대로 전달된다 — TextInput 은 두 방식 다 지원하며, STEP 3-4 권장은 Controlled.
// ─────────────────────────────────────────────────────────────────────

// 필드 외곽 상자(테두리)의 상태별 스타일. cva 로 invalid/disabled 를 표로 관리한다.
// 포커스는 자식 <input> 에서 일어나므로 focus-within: 으로 *래퍼* 가 포커스 링을
// 그린다 — 이렇게 하면 addon(STEP 3-5)이 있든 없든 동일하게 동작한다.
const fieldStyles = cva(
  "rounded-md border bg-background transition-colors focus-within:ring-2",
  {
    variants: {
      // invalid: error prop 유무. 테두리·포커스 링 색을 danger 토큰으로 바꾼다.
      invalid: {
        true: "border-danger focus-within:border-danger focus-within:ring-danger/30",
        false:
          "border-border focus-within:border-primary focus-within:ring-primary/30",
      },
      // disabled: 입력 불가 상태. 전체를 흐리게 + 커서 차단.
      disabled: {
        true: "cursor-not-allowed opacity-60",
        false: "",
      },
    },
    defaultVariants: { invalid: false, disabled: false },
  },
);

// addon(좌/우 부가요소) 컨테이너 — 패딩 + muted 글자색.
// 배경을 두지 않아 아이콘·단위 텍스트·버튼 무엇이 와도 입력창과 자연스럽게
// 어울린다. stroke="currentColor" 인 SVG 아이콘은 이 muted 색을 그대로 따른다.
const addonClass = "flex items-center px-3 text-muted";

// TextInput 이 직접 소유하는 prop. 그 외 속성은 네이티브 <input> 의 것.
type TextInputOwnProps = {
  // label: 있으면 <label> 을 그리고 htmlFor 로 input 과 연결한다.
  label?: string;
  // helperText: 입력창 아래 보조 설명. error 가 있으면 가려진다.
  helperText?: string;
  // error: 에러 메시지. 값이 있으면 에러 상태(빨간 테두리 + aria-invalid).
  error?: string;
  // leftAddon/rightAddon: 입력창 좌/우에 붙는 부가 요소(아이콘·단위·버튼 등).
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
};

export type TextInputProps = TextInputOwnProps &
  // TextInput 고유 prop 키는 제거해 네이티브 input 속성과 충돌하지 않게 한다.
  Omit<ComponentPropsWithoutRef<"input">, keyof TextInputOwnProps>;

function TextInputInner(
  {
    label,
    helperText,
    error,
    leftAddon,
    rightAddon,
    id,
    className,
    disabled,
    // 소비자가 직접 넘긴 aria-* 는 우리가 만든 연결과 병합해야 하므로 따로 뽑는다.
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    ...rest
  }: TextInputProps,
  ref: ForwardedRef<HTMLInputElement>,
) {
  // useId: 렌더 간 안정적인 고유 id 생성기(SSR 에서 서버·클라이언트 값이 일치).
  // label↔input, input↔설명문(에러/도움말)을 id 로 잇는 데 쓴다.
  const reactId = useId();
  // 소비자가 id 를 직접 넘기면 그것을, 아니면 생성한 id 를 쓴다.
  const inputId = id ?? reactId;
  const descriptionId = `${reactId}-description`;

  const hasError = Boolean(error);
  // 설명문은 하나만 보여준다 — 에러가 있으면 에러가 helperText 를 가린다.
  const description = hasError ? error : helperText;

  // aria-describedby: 우리 설명문 id + 소비자가 넘긴 값을 합친다(둘 다 보존).
  const describedBy =
    [description ? descriptionId : undefined, ariaDescribedBy]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    // 루트: [label / 필드 / 설명문] 세로 스택. className 은 루트에 병합된다
    // (소비자가 폭·여백을 조절하는 가장 흔한 지점).
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      {/* 필드 외곽: Flex 로 [leftAddon | input | rightAddon] 를 가로 배치한다.
          align="stretch" → addon 이 input 높이(h-10)에 맞춰 늘어난다.
          (Box→Flex 위에 TextInput 을 얹는 "기반 컴포넌트 재사용" 패턴.) */}
      <Flex
        align="stretch"
        className={fieldStyles({
          invalid: hasError,
          disabled: Boolean(disabled),
        })}
      >
        {leftAddon && <span className={addonClass}>{leftAddon}</span>}

        <input
          // ...rest 를 먼저 펼치고 접근성·연결 속성을 뒤에 둬, 항상 우리 값이
          // 이기게 한다 (value/onChange/defaultValue/type 등은 rest 로 전달).
          {...rest}
          ref={ref}
          id={inputId}
          disabled={disabled}
          // error 가 있으면 invalid, 없으면 소비자가 넘긴 aria-invalid 를 존중.
          aria-invalid={hasError ? true : ariaInvalid}
          // 설명문이 있으면 그 요소와 연결 → 포커스 시 스크린리더가 함께 읽는다.
          aria-describedby={describedBy}
          className={cn(
            // 테두리·배경·포커스 링은 래퍼가 담당 → input 에선 모두 제거한다.
            // min-w-0: flex 자식인 input 이 컨테이너보다 좁아질 수 있게 한다
            //   (없으면 input 의 기본 최소 너비 탓에 좁은 폭에서 넘친다).
            "h-10 min-w-0 flex-1 border-0 bg-transparent px-3 text-base text-foreground outline-none",
            "placeholder:text-muted disabled:cursor-not-allowed",
            // addon 이 붙는 쪽의 패딩 제거 — addon 컨테이너가 이미 px-3 을 가져,
            // 그대로 두면 addon 과 입력 텍스트 사이 간격이 두 배가 된다.
            leftAddon && "pl-0",
            rightAddon && "pr-0",
          )}
        />

        {rightAddon && <span className={addonClass}>{rightAddon}</span>}
      </Flex>

      {description && (
        <p
          id={descriptionId}
          className={cn("text-sm", hasError ? "text-danger" : "text-muted")}
        >
          {description}
        </p>
      )}
    </div>
  );
}

// TextInput 은 항상 <input> 으로 렌더된다(polymorphic 아님) → Box/Flex 처럼
// 제네릭을 보존하는 캐스팅이 필요 없다. forwardRef 결과를 그대로 쓰고
// displayName 만 지정한다 (Button 과 동일한 패턴).
export const TextInput = forwardRef(TextInputInner);
TextInput.displayName = "TextInput";
