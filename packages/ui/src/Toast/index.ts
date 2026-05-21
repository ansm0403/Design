// Toast 시스템의 배럴 파일 — 폴더 단위로 공개 API 를 한곳에 모은다.
// 루트 src/index.ts 는 이 작업 범위 밖이라, 여기서 모은 export 를
// 머지 후 메인에서 루트 배럴에 연결한다.

export { ToastProvider } from "./ToastProvider";
export { useToast } from "./useToast";
export { Toast } from "./Toast";

// 컴포넌트 prop 타입도 함께 노출 — 사용처에서 확장할 때 쓴다.
// isolatedModules 환경이라 값 export 와 분리해 `export type` 로 둔다.
export type {
  ToastProviderProps,
  ToastOptions,
  ToastApi,
} from "./ToastProvider";
export type { ToastProps, ToastVariant } from "./Toast";
