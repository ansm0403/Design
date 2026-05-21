// TextInput 폴더의 공개 출입구.
// 루트 packages/ui/src/index.ts 로의 재노출은 브랜치 머지 후 메인에서
// 일괄 처리한다 (이 Lane 의 작업 범위 밖).
export { TextInput } from "./TextInput";
// isolatedModules 환경에서 타입 re-export 는 반드시 `export type` 로 분리한다.
export type { TextInputProps } from "./TextInput";
