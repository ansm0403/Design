// @my-ds/ui 패키지의 공개 진입점.
// 여기서 export 한 것만 `import { ... } from "@my-ds/ui"` 로 노출된다.

export { Box } from "./Box";
export { Flex, Stack } from "./Flex";
export { Button } from "./Button";
export * from "./Button";
export * from "./TextInput";
export * from "./Toast";

// 컴포넌트 prop 타입도 함께 노출 — 사용처에서 컴포넌트를 확장할 때 쓴다.
// isolatedModules 환경이라 값 export 와 분리해 `export type` 로 둔다.
export type { BoxProps } from "./Box";
export type { FlexProps, StackProps } from "./Flex";
export type { ButtonProps } from "./Button";
