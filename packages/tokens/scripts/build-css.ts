/**
 * 토큰 Object → dist/tokens.css 파일 생성 스크립트.
 *
 * `tsx`(TypeScript 를 빌드 없이 Node 에서 바로 실행하는 도구)로 구동된다.
 * build 스크립트(`tsdown && tsx scripts/build-css.ts`)의 두 번째 단계 —
 * tsdown 이 JS/d.ts 를 만들고 dist 를 비운(clean) 뒤, 이 스크립트가
 * tokens.css 를 dist 에 추가한다.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { colors } from "../src/colors";
import { typography } from "../src/typography";
import { shadow } from "../src/shadow";
import { radius } from "../src/radius";
import { generateCss } from "../src/generate-css";

// ESM 모듈에는 CommonJS 의 __dirname 이 없다.
// import.meta.url("file://...현재 파일 경로")을 실제 파일 경로로 변환해
// 이 스크립트의 위치를 기준으로 dist 경로를 잡는다 → 실행 시 cwd 와 무관.
const scriptDir = dirname(fileURLToPath(import.meta.url));
const distDir = join(scriptDir, "..", "dist");
const outFile = join(distDir, "tokens.css");

const css = generateCss({ colors, typography, shadow, radius });

// recursive: true → dist 가 이미 있어도(빌드 후 실행) 없어도(단독 실행) 안전.
mkdirSync(distDir, { recursive: true });
writeFileSync(outFile, css, "utf8");

// css.length 는 문자 수(UTF-16 단위). 파일은 UTF-8 로 저장되므로
// 한글 헤더 주석 등 멀티바이트 문자가 있으면 실제 바이트 수와 다르다.
// Buffer.byteLength 로 디스크에 기록되는 실제 바이트 수를 보고한다.
console.log(`✓ dist/tokens.css 생성 완료 (${Buffer.byteLength(css, "utf8")} bytes)`);
