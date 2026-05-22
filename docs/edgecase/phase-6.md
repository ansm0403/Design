# Phase 6 — 엣지케이스 수정 기록

> STEP 6-1~6-6 edgecase-review (2026-05-22) 결과. FAIL 없음, WARN 1건.

---

#### STEP 6-2 — Badge subtle 변형의 색 대비 미검증

##### jsdom+axe 환경에서 CSS 변수 미해석으로 인한 색 대비 자동 검증 불가

**Problem**: `subtle` 변형은 `bg-{color}/10 text-{color}` 조합(옅은 배경 + 원색 텍스트)을
사용한다. jsdom 환경에서 axe-core는 CSS 변수(`--color-neutral` 등)를 실제 색으로
해석하지 못하고 투명도 변환(`/10`)도 적용하지 못해, WCAG AA 대비율 4.5:1 충족
여부를 자동으로 검증할 수 없다.

특히 `neutral` 색(중간 회색 계열)은 10% 배경 위에서 실제 대비율이 기준 미달일 수 있다.

**Before** (자동 검증만으로 충분하다고 가정한 상태):
```tsx
// Badge.test.tsx — 접근성 테스트가 axe만 의존
it("모든 color 조합은 접근성 위반이 없다", async () => {
  const { container } = render(
    <main>
      <Badge color="neutral" variant="subtle">neutral</Badge>
      ...
    </main>,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations(); // jsdom에서 색 대비를 검증하지 못한다
});
```

**After** (권장 대응 — 수동 검증):
실제 브라우저(Chrome DevTools Accessibility 패널 또는 Colour Contrast Analyser)로
아래 조합을 확인한다:
- `subtle neutral` — `bg-neutral/10` 위의 `text-neutral` 대비율 ≥ 4.5:1 (일반 텍스트 WCAG AA)
- `subtle neutral size="sm"` — 소형(14px) 텍스트는 대비율 기준이 더 엄격하므로 추가 확인

**Why**: jsdom은 CSS 렌더링 엔진이 없어 CSS 변수와 투명도를 계산하지 않는다.
axe-core가 대비율 검사를 생략(`cannot determine background color`)하면 통과 처리한다.
→ 실제 토큰 색이 확정된 뒤(또는 브라우저 실행 가능 시) Storybook에서 AllCombinations
스토리를 열고 수동으로 확인하는 것이 현실적인 대안이다.
