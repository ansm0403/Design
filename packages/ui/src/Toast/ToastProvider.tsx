import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { Toast } from "./Toast";
import type { ToastVariant } from "./Toast";

// ── Context / Provider 패턴 ──────────────────────────────────────────
// React Context 는 props 를 트리 아래로 단계마다 넘기지 않고(prop drilling 회피),
// 트리 어디서든 공유 값을 꺼내 쓰게 해 주는 메커니즘이다.
// "앱 어디서든 toast.show() 를 호출" 해야 하는 토스트에 딱 맞는 패턴이다.
//
//   ToastProvider — 앱 최상단에서 토스트 목록(state)을 소유하고 화면에 그린다.
//   ToastContext  — Provider 가 만든 toast API 가 흐르는 "통로".
//   useToast      — 그 통로에서 API 를 꺼내는 훅 (useToast.ts).
//
// "상태를 가진 Provider + 값을 꺼내는 훅" 조합은 전역 상태 관리의 기본형이다.

/** toast.show 의 두 번째 인자 — 토스트 동작 옵션. */
export interface ToastOptions {
  /** 시각 변형. 기본 "info". */
  variant?: ToastVariant;
  /** 자동으로 사라지기까지의 시간(ms). 0 이하면 자동으로 사라지지 않는다. */
  duration?: number;
}

/** useToast() 가 돌려주는 공개 API. */
export interface ToastApi {
  /** 토스트를 띄운다. 생성된 토스트의 id 를 반환한다. */
  show: (message: string, options?: ToastOptions) => number;
  /** id 로 특정 토스트를 즉시 닫는다. */
  dismiss: (id: number) => void;
}

/** 화면에 떠 있는 토스트 하나의 데이터 (Provider 내부 state 의 단위). */
interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

// createContext 의 초기값을 null 로 둔다 — Provider 로 감싸지 않은 채
// useToast 를 호출하면 이 null 이 잡혀, useToast.ts 가 명확한 에러를 던질 수 있다.
export const ToastContext = createContext<ToastApi | null>(null);

/** 개별 show 가 duration 을 지정하지 않았을 때 쓰는 기본 노출 시간(ms). */
const DEFAULT_DURATION = 4000;

export interface ToastProviderProps {
  /** Provider 가 감쌀 앱 트리. */
  children: ReactNode;
  /** 토스트 자동 소멸 시간(ms) 기본값. 개별 show 의 duration 이 이 값을 덮어쓴다. */
  duration?: number;
}

/**
 * ToastProvider — 앱(또는 일부 트리)을 감싸 토스트 기능을 제공한다.
 * 보통 앱 최상단에 한 번만 둔다: `<ToastProvider><App /></ToastProvider>`
 */
export function ToastProvider({
  children,
  duration = DEFAULT_DURATION,
}: ToastProviderProps) {
  // 화면에 떠 있는 토스트 목록. 이 state 가 바뀌면 아래 뷰포트가 다시 그려진다.
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // 다음 토스트에 줄 고유 id. 렌더 결과와 무관한 값이라 state 가 아닌 ref 에 둔다
  // (state 로 두면 id 를 올릴 때마다 불필요한 리렌더가 발생한다).
  const nextId = useRef(0);

  // 토스트별 자동 소멸 타이머. 수동으로 닫거나 언마운트될 때 정리하려고 보관한다.
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  // dismiss — 토스트 하나를 목록에서 제거하고, 걸려 있던 타이머도 함께 정리한다.
  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  // show — 토스트를 목록에 추가하고, duration 이 양수면 자동 소멸 타이머를 건다.
  const show = useCallback(
    (message: string, options?: ToastOptions) => {
      const id = nextId.current++;
      const variant = options?.variant ?? "info";
      setToasts((prev) => [...prev, { id, message, variant }]);

      const ms = options?.duration ?? duration;
      // ms 가 0 이하면 타이머를 걸지 않는다 → 사용자가 직접 닫을 때까지 유지된다.
      if (ms > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), ms),
        );
      }
      return id;
    },
    [dismiss, duration],
  );

  // 언마운트 시 살아 있는 타이머를 전부 정리한다 (메모리 누수 · 죽은 setState 방지).
  useEffect(() => {
    const map = timers.current;
    return () => {
      for (const timer of map.values()) clearTimeout(timer);
      map.clear();
    };
  }, []);

  // context 로 내려보낼 값. show/dismiss 가 useCallback 으로 안정적이므로
  // useMemo 로 이 객체도 고정한다 → Provider 가 리렌더돼도, 값이 그대로면
  // 소비자(useToast 를 쓰는 컴포넌트)가 불필요하게 리렌더되지 않는다.
  const api = useMemo<ToastApi>(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* ToastViewport — 화면 우하단에 고정되어 토스트를 세로로 쌓는 영역.
          · fixed right-0 bottom-0 : 뷰포트 기준 우하단 고정
          · pointer-events-none    : 빈 영역이 뒤쪽 UI 의 클릭을 가로막지 않게 한다
                                     (토스트 자체는 pointer-events-auto 로 되살림)
          · aria-live="polite"     : 이 영역에 토스트가 추가되면 스크린리더가
                                     "현재 작업을 방해하지 않는 선에서" 읽어 준다.
                                     라이브 영역은 내용보다 먼저 DOM 에 있어야 하므로
                                     toasts 가 비어도 이 div 는 항상 렌더한다. */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-0 bottom-0 z-50 flex w-full max-w-sm flex-col gap-2 p-4"
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            variant={toast.variant}
            onDismiss={() => dismiss(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
