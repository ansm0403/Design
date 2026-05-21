import { useContext } from "react";
import { ToastContext } from "./ToastProvider";
import type { ToastApi } from "./ToastProvider";

/**
 * useToast — 컴포넌트 어디서든 토스트 API 를 꺼내는 훅.
 *
 *   const toast = useToast();
 *   toast.show("저장되었습니다", { variant: "success" });
 *
 * Context 패턴의 "소비자" 쪽 절반이다 — ToastProvider 가 value 로 내려준 API 를
 * useContext 로 꺼내 온다.
 *
 * Provider 밖에서 호출하면 context 값이 null 이다. 그대로 두면 `toast.show` 에서
 * "null 의 프로퍼티를 읽을 수 없음" 류의 모호한 에러가 나므로, 여기서 원인을
 * 분명히 알려 주는 에러를 대신 던진다.
 */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (api === null) {
    throw new Error(
      "useToast 는 <ToastProvider> 안에서만 사용할 수 있습니다. 앱을 <ToastProvider> 로 감쌌는지 확인하세요.",
    );
  }
  return api;
}
