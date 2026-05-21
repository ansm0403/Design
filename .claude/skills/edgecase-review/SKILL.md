---
name: edgecase-review
description: my-design-system 모노레포 전용 엣지케이스·불변규칙 점검 스킬. 단일 Step이든 여러 Step을 묶은 배치든, 완료 직후 변경된 tokens/ui 코드를 다음 단계로 넘어가기 전에 검증할 때 사용한다.
---

# Edge Case Review

Lightweight edge-case + design-rule check for `my-design-system`.
Works for a **single Step or a multi-Step batch** — the default execution mode
is multi-Step (see CLAUDE.md Workflow Rules), so this skill usually reviews a
whole batch at once. Run the universal checks, then add per-Step checks for
every Step in scope.

**How to run:** fill the Step Context (list every Step in the batch) → run all
universal checks once over the combined changes → derive per-Step checks for
each Step → output one consolidated report (concise, real problems only).

## Step Context
```
SCOPE  : [single Step or batch — list every Step, e.g. STEP 1-3, 1-4, 1-5]
PHASE  : [phase number(s) covered]
FILES  : [changed files across the whole batch]   SKIP : [areas not relevant]
```

## Universal Checks (always)

Run these once over the **combined changes of the whole batch**.

**Immutable rules (CLAUDE.md)**
- [ ] Dependency one-way — `tokens` never imports `ui`?
- [ ] No hardcoded color/spacing/font — values come from tokens only?
- [ ] CSS variables produced by `generate-css` only (never hand-written)?
- [ ] `react`/`react-dom` are peerDependencies of `ui`, not dependencies?
- [ ] No `tailwind.config.js` / PostCSS preset (Tailwind v4 is CSS-first)?
- [ ] Semantic tokens single-key — components unaware of light/dark?

**Build & packaging**
- [ ] `package.json` exports paths match the actual `dist/` output?
- [ ] `sideEffects: ["*.css"]` present and CSS exposed via `exports`?
- [ ] Build script runs clean (`pnpm --filter <pkg> build`)?

**Component robustness (UI only — N/A for tokens)**
- [ ] Missing/invalid props fall back to sane defaults — no crash?
- [ ] `forwardRef` forwards the ref; polymorphic `as` prop handled?
- [ ] `className` merges correctly (tailwind-merge dedupes conflicts)?
- [ ] Keyboard operable + ARIA attributes present by default?
- [ ] Dark mode works via CSS-variable swap only (no component change)?

## Per-Step Checks (one set per Step in scope)

After the universal checks, open EVERY Step of the batch in `docs/phases.md`
and `docs/mvp-checklist.md`, and derive extra checks from each Step's
**핵심 포인트 / 주의 / 완료 기준**. Group the derived checks per Step so the
report stays traceable. Examples:
- Phase 1 (tokens): every token appears in `tokens.css`; light + dark both emitted.
- Phase 2 (UI base): `dist/styles.css` has token utilities (`bg-primary`).
- Phase 3 (components): loading blocks double-click; label↔input wired; Toast clears timers.
- Phase 4 (tests): jsdom env; behavior queries (`getByRole` / `getByLabelText`).

## Open-Ended Review

After the checklist, re-scan the changed files with fresh eyes — fragile
assumptions, anything that breaks if input/environment shifts unexpectedly.
Pay extra attention to interactions BETWEEN Steps of the batch (a later Step
quietly breaking an earlier Step's behavior). Report under WARN/FAIL, noted as
found outside the checklist.

## Report Format
```
### Edge Case Review — [single Step / batch range, e.g. STEP 1-3~1-5]
✅ OK   : [list]      ⏭️ N/A  : [list]
⚠️ WARN : [STEP X-Y] [issue + one-line fix]
❌ FAIL : [STEP X-Y] [issue + file:line + fix]
Priority fixes: 1. [most critical]  2. [next]
Outside checklist: - [anything fragile spotted]
```
Tag each WARN/FAIL with the STEP it belongs to so a batch report stays traceable.

## Edge Case Documentation

When the report contains ⚠️ WARN or ❌ FAIL items:
- Create or update `docs/edgecase/phase-{N}.md` (N = Phase number).
  Steps in the same Phase share one file — e.g. STEP 1-1 and STEP 1-2 both write to `phase-1.md`.
- For a batch: append one `#### STEP {X-Y}` block per affected Step. A batch
  inside one Phase → all blocks go to that single `phase-{N}.md`. A batch
  spanning two Phases → write each Step's block to its own phase file.
- If all results are ✅ OK / ⏭️ N/A only, do **not** create or modify any file.

### Entry template (append one block per WARN/FAIL item)

#### STEP {X-Y} — {Step name}

##### {Edge case title}
**Problem**: What failure or bug does this edge case cause?  
**Before**: *(code snippet — the problematic version)*  
**After**: *(code snippet — the fixed version)*  
**Why**: Reason for this approach; trade-offs vs alternatives.
