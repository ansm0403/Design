import { useCallback } from "react";
import type { MouseEventHandler } from "react";

// ── headless 패턴이란? ────────────────────────────────────────────────
// "headless" = 동작(로직)과 겉모습(스타일)을 분리하는 설계다.
//   · 이 훅(useButton)      → 클릭 차단·로딩·비활성 같은 "동작" 만 책임진다.
//   · 시각 컴포넌트(Button) → 그 동작을 받아 className·스피너 같은 "겉모습" 만 그린다.
//
// 왜 분리하나? 동작 로직을 훅으로 빼두면, 모양이 전혀 다른 버튼
// (ToggleButton, IconButton, 링크처럼 생긴 버튼 …)도 같은 훅을 재사용해
// "로딩 중 클릭 차단" 같은 동작을 공짜로 똑같이 얻는다. 스타일을 바꾸려고
// 동작 코드를 복사·붙여넣기 할 필요가 없어 버그가 한 곳으로 모인다.
// (실제 재사용 예시는 같은 폴더의 ToggleButton.tsx 참고)

export interface UseButtonOptions {
  /** true 면 작업 진행 중 — 클릭을 막고 aria-busy 를 켠다. (스피너 렌더는 시각 컴포넌트 몫) */
  isLoading?: boolean;
  /** 표준 비활성. 네이티브 `disabled` 속성이라 포커스조차 불가능해진다. */
  disabled?: boolean;
  /**
   * "부드러운" 비활성. 네이티브 `disabled` 와 달리 포커스는 유지한 채 클릭만 막는다.
   * 키보드/스크린리더 사용자가 Tab 으로 버튼에 도달해 "지금은 못 누른다" 는 사실
   * 자체를 인지할 수 있다 — 네이티브 disabled 버튼은 Tab 순회에서 통째로 빠져
   * 존재 자체를 모르게 된다.
   */
  ariaDisabled?: boolean;
  /** 실제 클릭 핸들러. 비활성/로딩 상태에서는 호출되지 않는다. */
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export interface UseButtonResult {
  /** <button> 엘리먼트에 그대로 펼치는(spread) 동작 관련 props 묶음. */
  buttonProps: {
    disabled: boolean;
    onClick: MouseEventHandler<HTMLButtonElement>;
    /** 로딩 중일 때만 true — 보조기술에 "이 요소가 작업 중" 임을 알린다. */
    "aria-busy": true | undefined;
    /** 부드러운 비활성일 때만 true. */
    "aria-disabled": true | undefined;
  };
  /** 로딩 중 여부 — 시각 컴포넌트가 스피너 렌더 여부를 결정할 때 쓴다. */
  isLoading: boolean;
  /** 어떤 형태로든(disabled·aria-disabled·loading) 클릭이 막힌 상태인지. */
  isDisabled: boolean;
}

/**
 * 버튼의 "동작" 만 담당하는 headless 훅.
 * 클릭/로딩/비활성 처리를 한곳에 모아, 어떤 모양의 버튼이든 재사용하게 한다.
 */
export function useButton(options: UseButtonOptions = {}): UseButtonResult {
  const {
    isLoading = false,
    disabled = false,
    ariaDisabled = false,
    onClick,
  } = options;

  // 로딩 중에는 중복 클릭(예: 폼 이중 제출)을 막아야 하므로 "부드러운 비활성" 으로 묶는다.
  const isSoftDisabled = ariaDisabled || isLoading;
  // 시각 컴포넌트가 스타일링에 쓰는 통합 플래그 — 셋 중 하나라도 켜지면 비활성.
  const isDisabled = disabled || isSoftDisabled;

  const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (event) => {
      // 부드러운 비활성(aria-disabled/로딩)은 네이티브 disabled 가 아니라서
      // 브라우저가 클릭을 막아주지 않는다 → 여기서 직접 차단한다.
      // (네이티브 disabled 는 브라우저가 이미 막으므로 따로 검사할 필요 없다.)
      if (isSoftDisabled) {
        // 네이티브 disabled 버튼은 클릭 이벤트 자체가 발생하지 않아 부모로
        // 버블링도 안 된다. 부드러운 비활성이 그 동작을 똑같이 흉내내려면
        // 기본 동작(preventDefault)뿐 아니라 전파(stopPropagation)까지 막아,
        // 상위 요소의 onClick 도 함께 차단해야 한다.
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      onClick?.(event);
    },
    [isSoftDisabled, onClick],
  );

  return {
    buttonProps: {
      disabled,
      onClick: handleClick,
      // false 대신 undefined 로 둬서, 비활성/로딩이 아닐 땐 속성 자체를 렌더하지 않는다
      // (`aria-busy="false"` 가 모든 버튼에 붙는 노이즈를 피한다).
      "aria-busy": isLoading || undefined,
      // 네이티브 disabled 는 이미 보조기술에 비활성을 알리므로, aria-disabled 는
      // 부드러운 비활성일 때만 노출한다(둘을 같이 거는 중복 표기 방지).
      "aria-disabled": isSoftDisabled || undefined,
    },
    isLoading,
    isDisabled,
  };
}
