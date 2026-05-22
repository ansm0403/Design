# Phase 5 — 엣지케이스 수정 기록

> `edgecase-review` 스킬에서 ⚠️ WARN / ❌ FAIL 로 발견된 항목을 기록한다.
> Phase 5 의 모든 STEP 이 이 파일을 공유한다.
> 최초 작성: 2026-05-22 (STEP 5-1·5-2 배치 검토).

---

#### STEP 5-1 — Storybook MDX 문서화

##### ⚠️ Toast.mdx 에서 Controls 가 import 됐지만 사용 안 됨

**Problem**: `Toast.mdx` 초안에서 `Controls`를 Button·TextInput 과 동일하게 import
했으나, Toast 의 `Playground` 스토리는 `render: () => <ToastDemo />` 방식을 써
arg-binding 구조가 없다 — `<Controls of={...}>` 를 쓰면 빈 표가 렌더될 뿐이라
사용하지 않았다. 그 결과 import 된 심볼이 사용되지 않아 불필요한 dead import 가 됐다.
TypeScript/ESLint 가 없더라도 코드 가독성 저하 및 향후 혼동 원인이 된다.

**Before**:
```mdx
import { Meta, Canvas, Controls, ArgTypes } from "@storybook/addon-docs/blocks";
```

**After**:
```mdx
import { Meta, Canvas, ArgTypes } from "@storybook/addon-docs/blocks";
```

**Why**: Toast 의 최상위 Playground 스토리는 인터랙티브 Controls 와 맞지 않는다
(`render` 함수가 args 대신 내부 state 로 동작). 정적 props 표인 `<ArgTypes>` 만으로
충분하므로 `Controls` import 를 제거했다. Button·TextInput 은 Playground 가
arg-binding 기반이라 `<Controls>` 사용이 올바르다 — 두 패턴을 혼동한 단순 실수.

##### ❌ 커스텀 MDX Docs 페이지 + `tags:["autodocs"]` 공존 → Storybook 인덱싱 충돌

**Problem**: 배치 설계 단계에서 "`<Meta of={Stories}/>` 커스텀 MDX 가 있으면
`tags:["autodocs"]` 가 자동 생성하던 Docs 탭을 **조용히 교체**한다" 고 가정했다.
이는 Storybook 7~8 의 동작이고, **Storybook 10 에서는 틀리다**. SB10 은 한 컴포넌트에
(1) 커스텀 MDX Docs 페이지와 (2) autodocs 태그가 동시에 존재하면 "같은 Docs 페이지를
두 번 만들려는 실수" 로 판단해 인덱싱 자체를 실패시킨다 — `storybook dev`/`build`
양쪽 모두 기동 불가.

```
Error: Unable to index files:
- ./src/Button/Button.mdx,./src/Button/Button.stories.tsx: You created a
  component docs page for 'Components/Button', but also tagged the CSF file
  with 'autodocs'. This is probably a mistake.
```

**Before** (각 `*.stories.tsx` 의 meta):
```ts
const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],   // ← MDX 와 충돌
  ...
};
```

**After**:
```ts
const meta = {
  title: "Components/Button",
  component: Button,
  // Docs 탭은 Button.mdx 가 제공한다 → tags:["autodocs"] 를 두지 않는다.
  ...
};
```

**Why**: 커스텀 MDX 와 autodocs 는 **같은 Docs 페이지 슬롯**을 두고 경쟁한다 —
공존이 불가능하다. 커스텀 MDX 로 문서를 큐레이션하기로 한 이상, autodocs 태그는
제거하는 것이 정답이다. props 표는 `<Controls>`/`<ArgTypes>` 가 여전히 meta 의
`argTypes` + 컴포넌트 타입에서 읽으므로, 태그를 빼도 props 문서는 그대로 동작한다.
세 CSF 파일(`Button`/`TextInput`/`Toast`.stories.tsx)에서 모두 제거 후
`build-storybook` 성공으로 확인. 사용자 검증(`storybook dev`) 중 발견된 항목이다.
