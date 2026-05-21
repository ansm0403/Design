---
description: Update progress docs and generate a handoff prompt for the next context
argument-hint: "[CURRENT_BATCH] [NEXT_STEP] — both optional, auto-detected from mvp-checklist.md if omitted"
---

# Context Handoff Command

<!--
  CLAUDE CODE DIRECTIVE
  =====================
  Run this when the current context must be handed off to a NEXT context,
  whether a BATCH of STEPs has just finished OR work is still mid-STEP.

  Responsibilities:
    1. Update this project's progress/design documents to reflect the
       CURRENT state (completed / in-progress / remaining work).
    2. Generate a ready-to-paste handoff prompt for the next context.

  EXECUTION MODEL — multi-Step by default:
    Per CLAUDE.md Workflow Rules, the default execution mode is multi-Step
    (batch). A handoff therefore usually covers a BATCH of STEPs completed
    together in one session, not a single STEP. CURRENT_BATCH may hold one
    STEP (isolated single-Step work) or several — handle both the same way.

  Language Policy:
    - This project's docs (architecture.md, phases.md, mvp-checklist.md,
      for-claude-code.md) are written in Korean.
    - Keep every document update in Korean, matching each doc's existing tone.
    - The generated handoff prompt is also written in Korean.
    (Note: the previous-project version of this command kept docs in English.
     This project is Korean-first, so the policy is intentionally flipped.)

  BEFORE DOING ANYTHING:
  1. Read CLAUDE.md in the project root.
  2. Extract: project name; the four reference-document paths
     (architecture.md / phases.md / mvp-checklist.md / for-claude-code.md);
     the Immutable Rules; the Workflow Rules.
  If CLAUDE.md is missing or the document paths cannot be found, output:
  "⚠️ CLAUDE.md 또는 문서 경로를 찾을 수 없다. 경로를 추가하거나 직접 지정해 달라."
  Then stop and wait for user input.

  ARGUMENT PARSING ($ARGUMENTS — all tokens optional):
    - 0 args → auto-detect CURRENT_BATCH (every STEP worked on in this
              session) and NEXT_STEP from mvp-checklist.md and from the
              work done in this conversation.
    - 1 arg  → that token is CURRENT_BATCH; NEXT_STEP = the STEP that
              follows the LAST step of the batch in phases.md order. This
              correctly rolls over a Phase boundary (e.g. STEP 1-6 → STEP 2-1).
    - 2 args → explicit CURRENT_BATCH and NEXT_STEP (overrides auto-detect).
  STEP ids use this project's format: "STEP <phase>-<index>" (e.g. STEP 1-3).
  CURRENT_BATCH may be expressed as:
    - a single STEP       → "STEP 1-3"
    - a contiguous range  → "STEP 1-3~1-6"
    - an explicit list    → "STEP 1-3, STEP 1-5, STEP 1-6"
  Always normalize CURRENT_BATCH to the ordered list of STEPs it contains
  before using it.

  MODE — this command is given NO mode flag. Detect it in Pre-flight:
    - STEP_COMPLETE : every STEP in CURRENT_BATCH is finished AND the
                      edgecase-review skill has been run for the batch.
    - WIP           : the last STEP of CURRENT_BATCH is still in progress
                      (earlier STEPs of the batch may already be done).
  If the mode is ambiguous, ask the user ONE short question to confirm it.
  State the resolved mode explicitly in every output.
-->

## Arguments

```
$ARGUMENTS
```

---

## Pre-flight

<!--
  CLAUDE: complete every step below before starting Part 1.
-->

1. Read `CLAUDE.md` → extract project name, the four document paths, the
   Immutable Rules and the Workflow Rules.
2. Read `docs/mvp-checklist.md` → resolve CURRENT_BATCH / NEXT_STEP per the
   ARGUMENT PARSING rules. When auto-detecting: CURRENT_BATCH is every STEP
   worked on in this session (cross-check the latest `진행 로그` entries
   against this conversation); NEXT_STEP is the STEP after the batch's last
   STEP in `phases.md` order. Normalize CURRENT_BATCH to an ordered STEP list.
3. Read every STEP of CURRENT_BATCH — and NEXT_STEP — in `docs/phases.md`.
4. Resolve the MODE (STEP_COMPLETE / WIP). If unsure, ask the user.
5. If MODE = STEP_COMPLETE and the `edgecase-review` skill has not been run
   for CURRENT_BATCH, recommend running it first — do not silently skip it.
   edgecase-review reviews the whole batch in one pass. If MODE = WIP,
   edgecase-review is not expected yet; skip this check.

Report the resolved values before continuing:

```
CURRENT_BATCH : ... (STEP 목록)   NEXT_STEP : ...   MODE : STEP_COMPLETE | WIP
```

---

## Part 1 — Document Update

<!--
  CLAUDE: update ONLY content affected by the STEPs in CURRENT_BATCH. Do not
  touch anything unrelated. The four docs must stay mutually consistent.
  Never edit docs/for-claude-code.md here — it is a near-fixed kickoff
  document; the per-handoff prompt is produced in Part 2 (context only).
-->

### 1-1. Update Rules

**`docs/mvp-checklist.md`** (always)
- MODE = STEP_COMPLETE → check `[x]` for every item delivered by EVERY STEP
  in CURRENT_BATCH.
- MODE = WIP → check `[x]` for the items of the batch's already-finished
  STEPs; do NOT check the last (in-progress) STEP's items. Check only its
  genuinely finished sub-items, if the checklist is granular enough.
- Append one `진행 로그` line covering the whole batch:
  `날짜 | 완료한 것 (배치 전체) | 막힌 것 | 다음 할 것`.
  List every completed STEP in "완료한 것". In WIP mode, "다음 할 것" must
  spell out the unfinished remainder of the in-progress STEP.
- Update the `최종 갱신` line at the top to today's date.
- Never change the status of any STEP outside CURRENT_BATCH.

**`docs/phases.md`** (only when needed)
- For any STEP in CURRENT_BATCH where a pitfall / know-how / decision
  surfaced, append a `**진행 기록 (날짜, STEP X-Y ...)**` block to THAT STEP,
  matching the style of the existing 진행 기록 entries.
- If nothing noteworthy surfaced for a STEP, leave it untouched (no empty
  blocks). A batch can produce zero, one, or several 진행 기록 entries.

**`docs/architecture.md`** (only when a design decision changed)
- Per CLAUDE.md, a design change must be written to architecture.md BEFORE
  the code. At handoff time this doc should therefore already be current.
- If the implementation diverged from architecture.md but the doc was NOT
  updated → do NOT silently rewrite it. FLAG it under "직접 확인 필요" so the
  user decides. (This keeps the "edit architecture.md first" rule intact.)
- If you do edit it, update its `최종 갱신` line as well.

**`docs/for-claude-code.md`**
- Do NOT edit. It is near-fixed; editing it would collide with its role.

### 1-2. Consistency Check

- [ ] mvp-checklist 체크 상태 ↔ phases.md 진행 기록 ↔ architecture.md 가 서로 모순 없음
- [ ] CURRENT_BATCH 의 모든 STEP 이 mvp-checklist 에 빠짐없이 반영됨
- [ ] MODE = WIP 일 때, 어떤 문서도 진행 중인 STEP 을 '완료'로 표시하지 않음
- [ ] architecture.md 의 설계 결정이 실제 구현과 일치 (불일치 시 FLAG)
- [ ] 이번 작업이 Immutable Rules 를 새로 위반하지 않음
- [ ] for-claude-code.md 를 건드리지 않음

### 1-3. Summary Format (output in context)

```
## 문서 갱신 요약 — CURRENT_BATCH (MODE)

### [문서 이름]
- 변경 : [무엇을]
- 이유 : [왜]

(갱신한 문서마다 반복)

정합성 검사 : PASS / FAIL (FAIL 이면 충돌 항목 나열)

직접 확인 필요:
- [자동으로 검증하지 못한 항목 / architecture.md 불일치 FLAG 등]
```

---

## Part 2 — Handoff Prompt

<!--
  CLAUDE: produce a single copyable prompt for the NEXT context.
  Use the project name and document paths extracted from CLAUDE.md.
  The title and the 지시 section differ by MODE.
  The next context also works multi-Step by default — the 다음 작업 section
  should propose the next BATCH (not just one STEP) whenever the upcoming
  STEPs are small and related.
-->

~~~
```
## [Project Name] — [완료 모드 → "다음 배치 시작" / 중간 모드 → "진행 중 STEP 이어서"] 프롬프트

### 핸드오프 모드
[Step 완료 핸드오프 / 중간 핸드오프]

### 현재 상태
- 완료    : [완료된 Phase / STEP 목록 — 이번 배치에서 끝낸 STEP 포함]
- 진행 중 : [WIP → 진행 중 STEP 에서 끝낸 부분 + 남은 부분 / 완료 모드 → "없음"]
- 남은 작업 : [현재 Phase 의 남은 STEP + 이후 Phase 요약]

### 다음 작업
[완료 모드 → NEXT_STEP 부터 시작. 이어지는 STEP 들이 작고 연관되면 하나의
 배치로 묶어 제안하고, 묶은 STEP 목록 + 각 STEP 의 phases.md 명세 한 줄 요약을 적는다.
 크거나 위험하거나 중요한 STEP 이면 단독 진행을 권고한다.]
[중간 모드 → 진행 중 STEP 의 남은 작업 마무리]

### 참고 문서
- CLAUDE.md — 먼저 읽을 것 (문서 라우팅 진입점, Workflow Rules 의 '다중 Step 기본' 원칙 포함)
- docs/architecture.md — 설계 원칙·구조 (헌법)
- docs/phases.md — 다음 작업의 STEP 명세
- docs/mvp-checklist.md — 현재 진행 상태
- [관련 진행 기록 위치, 있으면]

### 주의사항
[CURRENT_BATCH 에서 발견한 함정 / 미해결 이슈 / 보류한 결정 / 관련 Immutable Rules]

### 지시
위 문서를 분석하고 다음 작업을 진행하라.
기본 실행 단위는 다중 Step(배치)다 — 연관된 작은 STEP 들은 묶어서 한 번에 구현하고,
크거나 위험하거나 중요한 STEP 만 단독으로 진행하라.
구현 전 반드시 phases.md 의 해당 STEP 명세와 mvp-checklist.md 상태를 먼저 확인하라.
[완료 모드 → 배치 완료 후 edgecase-review 스킬로 배치 전체를 검증하라.]
[중간 모드 → 먼저 진행 중 STEP 의 남은 작업을 끝내고 edgecase-review 로 검증한 뒤 다음 배치로 진행하라.]
```
~~~

---

## Execution Order

1. **Pre-flight** — read CLAUDE.md → extract context; parse `$ARGUMENTS`;
   read mvp-checklist.md + phases.md; resolve CURRENT_BATCH / NEXT_STEP / MODE.
2. **Part 1** — update mvp-checklist.md (always, for every STEP in the batch),
   phases.md (only the STEPs with noteworthy records), architecture.md (only
   if a design decision changed; otherwise FLAG any drift). Never touch
   for-claude-code.md.
3. Run the consistency check; output the `문서 갱신 요약`.
4. **Part 2** — output the copyable Korean handoff prompt.
5. All document edits stay in Korean; the handoff prompt is in Korean.

---
