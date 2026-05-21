import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// cn — className 병합 유틸리티. 모든 컴포넌트가 className 을 합칠 때 이 함수를 쓴다.
//
// 두 라이브러리를 조합한다:
//  - clsx     : 조건부 className 을 하나의 문자열로 합친다.
//               예) clsx("a", cond && "b", { c: true }) → "a c"  (cond 가 false 면)
//  - twMerge  : 합쳐진 문자열에서 "충돌하는 Tailwind 클래스" 를 뒤엣것 우선으로 정리한다.
//               예) twMerge("bg-red-500 bg-blue-500") → "bg-blue-500"
//
// clsx 만 쓰면 "bg-red-500 bg-blue-500" 처럼 둘 다 살아남아 어느 색이 적용될지
// CSS 소스 순서에 의존하게 된다. twMerge 로 dedupe 해야 예측 가능해진다.
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
