import { forwardRef } from "react";
import type { ForwardedRef } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../utils/cn";

// Toast — 화면에 잠깐 떠올랐다 사라지는 알림 "한 개" 의 시각 컴포넌트다.
// 언제 뜨고 언제 사라지는지(상태 관리)는 ToastProvider 가 맡고, 이 파일은
// "어떻게 보이는지" 만 책임진다 (관심사 분리).

// 토스트의 시각 변형.
//  - success : 성공 · 완료  → success 토큰(초록)
//  - error   : 실패 · 에러  → danger 토큰(빨강)
//  - info    : 일반 정보    → primary 토큰(파랑)
//
// ⚠️ "info" 전용 토큰은 tokens 패키지에 아직 없다. 전용 `info` 토큰을 두려면
//    tokens/colors.ts 와 theme.css 를 함께 고쳐야 하는데, 이는 이번 작업 범위
//    (packages/ui/src/Toast/) 밖이다. 그래서 "정보" 의 관용색인 파랑 = 기존
//    primary 토큰을 재사용한다.
export type ToastVariant = "success" | "error" | "info";

// cva — variant 별 className 을 if/삼항 없이 "표" 로 선언하는 도구(Button.tsx 와 동일 패턴).
const toastStyles = cva(
  // 베이스 — 모든 토스트가 공유한다.
  //  - bg-surface          : 떠 있는 표면(카드·토스트)용 토큰 색
  //  - border-l-4          : 왼쪽만 굵은 테두리 → 여기에 variant 색을 입혀 종류를 구분
  //  - pointer-events-auto : 뷰포트가 pointer-events-none 이라, 토스트만 클릭 가능하게 되살린다
  //  - shadow-lg/rounded-md: shadow·radius 토큰은 아직 @theme 에 연결돼 있지 않아
  //    Tailwind 기본값을 쓴다 (Button 이 타이포에서 기본값을 쓰는 것과 같은 방식).
  "pointer-events-auto flex w-full items-start gap-3 rounded-md border border-border border-l-4 bg-surface px-4 py-3 shadow-lg",
  {
    variants: {
      // variant 는 왼쪽 테두리 색만 바꾼다 — 단독으로 결과가 정해지므로
      // Button 처럼 variant×color 조합(compoundVariants)이 필요 없다.
      variant: {
        success: "border-l-success",
        error: "border-l-danger",
        info: "border-l-primary",
      },
    },
    // prop 미지정 시 기본 변형.
    defaultVariants: { variant: "info" },
  },
);

// variant → 색점(dot) 배경 클래스 정적 매핑.
// ⚠️ `bg-${variant}` 같은 동적 조합은 Tailwind v4 스캐너가 못 찾는다 →
//    Flex 의 directionClass 처럼 완성된 클래스명을 리터럴로 나열한다.
const dotClass: Record<ToastVariant, string> = {
  success: "bg-success",
  error: "bg-danger",
  info: "bg-primary",
};

export interface ToastProps {
  /** 토스트에 표시할 메시지. */
  message: string;
  /** 시각 변형. 기본 "info". */
  variant?: ToastVariant;
  /** 닫기(✕) 버튼을 눌렀을 때 호출된다. */
  onDismiss?: () => void;
}

function ToastInner(
  // variant 가 잘못된 값이어도 cva/dotClass 가 폴백을 처리하므로 크래시하지 않는다.
  { message, variant = "info", onDismiss }: ToastProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div ref={ref} className={cn(toastStyles({ variant }))}>
      {/* 색점 — variant 를 한눈에 구분시키는 보조 표식. 장식이라 스크린리더에선 숨긴다. */}
      <span
        aria-hidden="true"
        className={cn(
          "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
          dotClass[variant],
        )}
      />
      {/* 메시지 본문. flex-1 로 남은 폭을 채워 닫기 버튼을 오른쪽 끝으로 민다. */}
      <p className="flex-1 text-sm text-foreground">{message}</p>
      {/* 닫기 버튼 — <button> 이라 키보드 포커스·Enter/Space 가 기본 동작한다.
          글리프(✕)만 있으므로 aria-label 로 "접근 가능한 이름" 을 따로 준다. */}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="알림 닫기"
        className="shrink-0 cursor-pointer rounded text-muted transition-colors hover:text-foreground"
      >
        <span aria-hidden="true">✕</span>
      </button>
    </div>
  );
}

// forwardRef: 부모가 ref 로 실제 <div> DOM 에 접근할 수 있게 한다 (라이브러리 필수).
// Toast 는 polymorphic 이 아니라 항상 <div> 다 → Button 처럼 forwardRef 결과를
// 그대로 쓰고 displayName 만 지정하면 된다 (Box/Flex 의 캐스팅 함정 없음).
export const Toast = forwardRef(ToastInner);
Toast.displayName = "Toast";
