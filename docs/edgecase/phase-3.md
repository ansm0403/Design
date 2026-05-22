# Phase 3 — 엣지케이스 수정 기록

> `edgecase-review` 스킬에서 ⚠️ WARN / ❌ FAIL 로 발견된 항목을 기록한다.
> Phase 3 의 모든 STEP 이 이 파일을 공유한다.
> 최초 작성: 2026-05-22 (STEP 3-1 검토).

---

#### STEP 3-1 — Button (variant / color / size)

##### ⚠️ solid 버튼 글자색 — 문서 예시의 `text-white` 대신 `text-background` 채택

**Problem**: `phases.md` STEP 3-1 핵심 포인트와 `architecture.md` §6 [4] 의 예시
스니펫은 solid 버튼을 `<button className="bg-primary text-white ...">` 로 보여준다.
그러나 `text-white` 를 그대로 쓰면 두 가지 문제가 생긴다.

1. **불변규칙 3 위반** — `text-white` 는 색을 컴포넌트에 직접 박는 하드코딩이다.
   디자인 값은 토큰으로만 정의해야 한다. (`architecture.md` §6 [4] 의 주석
   "← 색을 직접 안 적음" 과도 모순된다 — `text-white` 는 색을 직접 적은 것이다.)
2. **dark 테마 대비 붕괴** — `colors.ts` 상 dark 테마의 `--color-primary` 는
   `blue[300]`(#93c5fd, 옅은 파랑), `danger` 는 `red[400]`, `neutral` 은 `gray[400]`
   로 모두 **밝은 색**이다. 그 위에 흰 글자(`text-white`)를 얹으면 대비가 거의 사라진다.

**Before** (문서 예시 그대로):
```tsx
// solid + primary
className="bg-primary text-white hover:bg-primary/90"
```

**After** (실제 구현 — `Button.tsx` 의 cva `compoundVariants`):
```tsx
// solid + primary
className="bg-primary text-background hover:bg-primary/90"
```

`--color-background` 는 light 에서 `gray[50]`(거의 흰색), dark 에서 `gray[900]`
(거의 검정)이다. `text-background` 를 쓰면 `data-theme` 토글 시 글자색이 배경 토큰을
따라 자동으로 뒤집혀, **옅은 색 배경(dark)·짙은 색 배경(light) 양쪽 모두에서**
solid 버튼의 글자 대비가 확보된다. 컴포넌트는 light/dark 를 의식하지 않는다
(불변규칙 7 준수 — CSS 변수 값만 교체).

**Why**: solid 버튼은 "채운 색 배경 위의 글자" 라서 본질적으로 *전경색의 반대색*
(inverse) 이 필요하다. 가장 정석은 전용 `onPrimary`/`inverse` 토큰을 두는 것이지만,
그것은 tokens 패키지 변경(STEP 3-1 범위 밖, 사용자 승인 필요)이다. `background`
역할 토큰은 이미 "전경(`foreground`)의 반대편" 성격을 가지므로, 별도 토큰 추가
없이 inverse 색으로 재사용할 수 있다 — 역할명이 약간의 의미 확장이긴 하나, 토큰
원칙과 다크모드 정합성을 모두 만족하는 가장 저렴한 선택이다.

✅ 해결 (2026-05-22): `architecture.md` §6 [4] 의 예시 스니펫을 `text-white` →
`text-background` 로 정정해 실제 Button 코드와 일치시켰다(사용자가 "문서와 코드가
다르면 코드 기준으로 수정" 을 명시 지시 — STEP 3-1~3-6 문서 동기화 작업의 일부).

⚠️ 잔여 한계(엣지케이스 아님, 메모): light 테마 solid `primary`(blue[500] 위 밝은
글자)의 대비는 약 ~3.9:1 로 WCAG AA(본문 4.5:1) 경계 미만이다. 이는 `text-white`/
`text-background` 선택과 무관한 **팔레트 자체의 한계**다. STEP 4-3(vitest-axe)에서
재확인하고, 필요 시 primitive 팔레트의 명도 조정을 검토한다.

##### ⚠️ cva variant 식별자가 Tailwind 유틸리티명과 충돌 — dead CSS 누출

**Problem**: Tailwind v4 의 콘텐츠 스캐너는 JS/TS 를 파싱하지 않고, 소스 파일의
텍스트(특히 **따옴표로 감싼 문자열** — 주석 안의 것 포함)에서 클래스 후보 토큰을
추출한다. `Button.tsx` 의 cva 정의는 `compoundVariants` 에서 `variant: "outline"` 을
따옴표 문자열로 3회 사용하는데, `outline` 은 Tailwind 의 실제 유틸리티명
(`outline-style`/`outline-width`)이다. 스캐너가 이 `"outline"` 을 클래스 사용으로
오인해 `dist/styles.css` 에 dead 규칙을 생성한다:

```css
.outline { outline-style: var(--tw-outline-style); outline-width: 1px; }
```

어떤 엘리먼트도 `class="outline"` 을 갖지 않는다(cva 는 `"outline"` 을 *variant
식별자*로 쓸 뿐, 출력 클래스는 `border-primary` 등이다) → 순수 dead CSS 다.

**같은 원인의 선재(先在) 누출** (STEP 3-1 결함 아님, 이번 재검토에서 발견):
`src/utils/cn.ts`(STEP 2-3)의 설명 주석에 `twMerge("bg-red-500 bg-blue-500")` 라는
따옴표 예시가 있어, `.bg-blue-500`·`.bg-red-500`(primitive 팔레트 색 — 컴포넌트가
절대 쓰지 않음)이 배포 CSS 로 누출돼 있다. STEP 2-4 의 CSS 누출 리뷰는 *스토리
전용 클래스*만 검사해 이 주석 누출을 놓쳤다.

참고로 `Button.tsx` 주석의 `(text-white 로 고정하면 ...)` 구절은 누출되지 **않았다**
— 따옴표 밖 + 앞뒤가 `(` 와 CJK 문자라 스캐너의 후보 경계에 걸리지 않았다.
즉 누출은 **따옴표 문자열 컨텍스트**에서만 발생한다.

**Before / After**:
```ts
// (A) Button.tsx 의 cva — variant: "outline" → .outline 누출
//     → 수용. "outline" 은 outline 버튼의 관례적 이름이고, 스캐너 회피용으로
//        rename 하는 것은 가독성을 해치는 더 나쁜 트레이드오프다. dead 규칙
//        ~80바이트는 무시 가능하다.

// (B) cn.ts 주석 — 따옴표를 풀면 스캐너가 잡지 않는다 (text-white 가 누출되지
//     않은 것과 동일 원리). 수정 시:
//   Before: twMerge("bg-red-500 bg-blue-500") → "bg-blue-500"
//   After : twMerge 에 bg-red-500 과 bg-blue-500 을 함께 주면 → bg-blue-500 만 남음
```

**Why**: 근본 원인은 Tailwind v4 스캐너가 텍스트 기반이라 "클래스로 쓰는 문자열"
과 "단순히 코드에 등장한 동명의 문자열" 을 구분하지 못하는 데 있다. Button.tsx 는
실제 컴포넌트 파일이라 반드시 스캔돼야 하므로(`@source not` 으로 제외 불가),
`.outline` 누출은 구조적으로 막기 어렵다. 비용(dead CSS 수십 바이트)이 사소하고
수정 트레이드오프가 더 비싸므로 **(A)는 수용**한다. 반면 **(B) cn.ts 주석은 의미
손실 없이 따옴표만 풀면 해결**되므로 정리 권장 — 단 cn.ts 는 Phase 2 파일이라
STEP 3-1 범위 밖, 별도 후속 작업으로 처리하고 `phase-2.md` 에도 기록한다.

**향후 주의(패턴)**: cva 등으로 컴포넌트를 늘릴 때, variant 식별자가 Tailwind 단일
단어 유틸리티명(`outline`·`flex`·`grid`·`block`·`hidden`·`table`·`fixed`·`static`·
`container`·`truncate`·`italic`·`underline` 등)과 겹치면 같은 dead CSS 누출이
생긴다. 기능 영향은 없으나, 가능하면 그런 이름은 피하거나 누출을 인지하고 둔다.

---

#### STEP 3-2 — Button (loading / 접근성)

##### ❌ 로딩 중 버튼이 접근 가능한 이름(accessible name)을 잃는다

**Problem**: 로딩 상태에서 children(버튼 라벨)을 `invisible`(Tailwind `visibility:
hidden`)로 숨긴다. `visibility:hidden` 요소는 *접근성 트리에서 제거*되어, accessible
name 계산("name from content")에서 빈 문자열로 취급된다. 스피너 SVG 는
`aria-hidden="true"` 라 이름에 기여하지 않는다 → **로딩 중 버튼의 accessible name 이
빈 값**이 된다. 스크린리더는 "버튼, 바쁨" 만 읽고 *어떤* 버튼인지 알리지 못한다.
STEP 4-3 의 vitest-axe `button-name` 규칙에서도 위반으로 잡힌다 — STEP 3-2 의
목표("기본 접근성")·`architecture.md` §2 원칙 5(접근성 기본)에 정면으로 어긋난다.

**Before** (`Button.tsx` — 로딩 시 children 래퍼):
```tsx
<span className={cn(loading && "invisible")}>{children}</span>
```

**After**:
```tsx
// opacity-0 은 시각적으로만 투명하게 만들 뿐 접근성 트리에는 그대로 남는다
// → 로딩 중에도 버튼 라벨이 accessible name 으로 유지된다. 레이아웃 공간도 유지.
<span className={cn(loading && "opacity-0")}>{children}</span>
```

**Why**: 너비 보존을 위해 children 을 화면에서 숨기되 **공간은 차지**시켜야 한다.
세 후보의 차이 — `display:none` 은 공간까지 없애 탈락, `visibility:hidden`(=`invisible`)
은 공간은 남기나 접근성 트리에서 빠진다, `opacity:0`(=`opacity-0`)만이 "공간 유지 +
접근성 트리 유지 + 시각적 투명" 셋을 모두 만족한다. 스피너는 `aria-hidden` 으로 두고
로딩 사실은 `aria-busy="true"` 가 전달하므로, 라벨만 살리면 "라벨 + 바쁨" 이 정상
안내된다. (ToggleButton 은 로딩/스피너가 없어 이 문제에 해당되지 않는다.)

**해결 (2026-05-22)**: `Button.tsx` 의 children 래퍼를 `invisible` → `opacity-0` 으로
수정하고 관련 주석을 갱신. `tsc -p tsconfig.json` 통과, `build` 후 `dist/styles.css`
에 `.opacity-0` 생성 확인. (사용자 승인 후 적용.)

---

#### STEP 3-5 — TextInput Addons

##### ⚠️ disabled 된 TextInput 이 addon 내부의 인터랙티브 요소까지 비활성화하지는 못한다

**Problem**: `disabled` prop 은 네이티브 `<input>` 만 비활성화하고 외곽 래퍼는
`opacity-60 cursor-not-allowed` 로 흐려진다. 그러나 `leftAddon`/`rightAddon` 으로
넘어온 임의의 `ReactNode` 안에 버튼 같은 인터랙티브 요소가 있으면(예:
`WithRightAddon` 스토리의 비밀번호 표시 토글), 그 요소는 **여전히 클릭·포커스
가능**하다. 시각적으로는 흐려 보이지만 동작은 살아 있어 "비활성처럼 보이지만 눌리는"
불일치가 생긴다.

**Before / After**:
```tsx
// 현재: addon 컨테이너는 disabled 와 무관하게 항상 동작한다.
const addonClass = "flex items-center px-3 text-muted";

// 완화 옵션 A (권장·근본): 소비자가 addon 으로 넘기는 인터랙티브 요소를 직접
//   disabled 처리한다. TextInput 은 임의 ReactNode 의 내부를 알 수 없으므로
//   이것이 근본 해법 — 문서/주석으로 안내한다.
// 완화 옵션 B (부분): disabled 시 addon span 에 pointer-events-none 을 더해
//   마우스 클릭만 차단한다(키보드 Tab 도달은 여전 — 완전한 해결은 아님).
```

**Why**: TextInput 은 addon 을 불투명한 `ReactNode` 로 받으므로 그 내부 컨트롤의
disabled 상태를 일반적으로 제어할 수 없다. 근본 해결은 소비자 책임(addon 콘텐츠를
함께 disabled)이고, 컴포넌트 차원에서는 `pointer-events-none` 으로 마우스 클릭만
부분 차단할 수 있다. MVP 범위에서는 **한계를 문서화**하고, 필요 시 옵션 B 를 후속
적용한다. (FAIL 이 아닌 WARN — 기본 사용 경로인 "label + input + 비인터랙티브
addon(아이콘·단위 텍스트)" 에서는 문제가 없고, addon 에 인터랙티브 요소를 넣는
경우에만 발생한다.)
