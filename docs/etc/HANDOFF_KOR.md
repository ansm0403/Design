===========================================================================
  한국어 번역 (사람이 읽기 위한 참고용)
  ---------------------------------------------------------------------------
  아래는 위 영문 지시의 한국어 번역이다. 별도의 추가 지시가 아니라
  같은 내용의 번역이므로, 실행 시에는 위 영문 본문을 기준으로 동작한다.
  ===========================================================================

  # 컨텍스트 인계 커맨드

  ## 커맨드의 역할
  현재 컨텍스트를 다음 컨텍스트로 넘겨야 할 때 실행한다. 여러 STEP을 묶은
  배치가 막 끝난 경우든, 단일 STEP이 끝난 경우든, STEP 도중인 경우든 모두
  사용한다.
    1. 이 프로젝트의 진행/설계 문서를 현재 상태(완료 / 진행 중 / 남은 작업)
       에 맞게 갱신한다.
    2. 다음 컨텍스트에 바로 붙여넣을 인계 프롬프트를 생성한다.

  ## 실행 모델 — 기본은 다중 Step(배치)
  CLAUDE.md 워크플로 규칙에 따라 기본 실행 단위는 다중 STEP(배치)이다.
  따라서 인계는 대개 한 세션에서 함께 완료한 여러 STEP의 배치를 대상으로 한다.
  CURRENT_BATCH는 STEP 하나(단독 작업)일 수도, 여러 개일 수도 있으며
  어느 쪽이든 동일하게 처리한다.

  ## 언어 정책
  - 이 프로젝트 문서(architecture.md, phases.md, mvp-checklist.md,
    for-claude-code.md)는 한국어로 작성되어 있다.
  - 모든 문서 갱신은 한국어로, 각 문서의 기존 톤에 맞춰 작성한다.
  - 생성하는 인계 프롬프트도 한국어로 작성한다.

  ## 무엇이든 하기 전에
  1. 프로젝트 루트의 CLAUDE.md 를 읽는다.
  2. 다음을 추출한다: 프로젝트 이름; 4개 참고 문서 경로
     (architecture.md / phases.md / mvp-checklist.md / for-claude-code.md);
     Immutable Rules; Workflow Rules.
  CLAUDE.md 가 없거나 문서 경로를 찾을 수 없으면 다음을 출력한다:
  "⚠️ CLAUDE.md 또는 문서 경로를 찾을 수 없다. 경로를 추가하거나 직접
   지정해 달라." — 그 후 멈추고 사용자 입력을 기다린다.

  ## 인자 파싱 ($ARGUMENTS — 모든 토큰은 선택)
  - 인자 0개 → mvp-checklist.md 와 이번 대화 내용으로 CURRENT_BATCH 와
    NEXT_STEP 을 자동 감지한다.
  - 인자 1개 → 그 토큰이 CURRENT_BATCH. NEXT_STEP 은 배치의 마지막 STEP
    다음 STEP. (Phase 경계도 올바르게 넘어간다. 예: STEP 1-6 → STEP 2-1)
  - 인자 2개 → CURRENT_BATCH 와 NEXT_STEP 을 명시적으로 지정(자동 감지 덮어씀).
  STEP 표기는 이 프로젝트 형식 "STEP <phase>-<index>" 를 따른다 (예: STEP 1-3).
  CURRENT_BATCH 표기 방법:
    - 단일 STEP   → "STEP 1-3"
    - 연속 범위   → "STEP 1-3~1-6"
    - 명시적 목록 → "STEP 1-3, STEP 1-5, STEP 1-6"
  CURRENT_BATCH 는 항상 순서가 정렬된 STEP 목록으로 정규화한 뒤 사용한다.

  ## 모드 (STEP_COMPLETE / WIP)
  이 커맨드는 모드 플래그를 받지 않는다. Pre-flight 에서 판별한다:
  - STEP_COMPLETE : CURRENT_BATCH 의 모든 STEP 이 완료되었고 edgecase-review
    스킬이 해당 배치에 대해 실행된 상태.
  - WIP           : CURRENT_BATCH 의 마지막 STEP 이 아직 진행 중인 상태
    (배치 앞쪽의 STEP들은 이미 완료되었을 수 있다).
  모드가 모호하면 사용자에게 짧은 질문 하나로 확인한다. 판별한 모드는
  모든 출력에 명시한다.

  ## Pre-flight (Part 1 전에 모두 수행)
  1. CLAUDE.md 를 읽고 프로젝트 이름·4개 문서 경로·Immutable Rules·
     Workflow Rules 를 추출한다.
  2. mvp-checklist.md 를 읽고 인자 파싱 규칙대로 CURRENT_BATCH / NEXT_STEP
     을 결정한다. 자동 감지 시: CURRENT_BATCH 는 이번 세션에서 작업한 모든
     STEP (최신 `진행 로그` 항목과 이번 대화 내용을 대조해 판단),
     NEXT_STEP 은 배치의 마지막 STEP 다음 STEP. CURRENT_BATCH 를 정렬된
     STEP 목록으로 정규화한다.
  3. phases.md 에서 CURRENT_BATCH 의 모든 STEP 과 NEXT_STEP 을 읽는다.
  4. 모드(STEP_COMPLETE / WIP)를 판별한다. 불확실하면 사용자에게 묻는다.
  5. STEP_COMPLETE 인데 CURRENT_BATCH 에 edgecase-review 가 실행되지
     않았으면 먼저 실행을 권고한다 — 조용히 건너뛰지 않는다.
     edgecase-review 는 배치 전체를 한 번에 검증한다. WIP 면 이 검사는 생략.
  → 진행 전 결정값 보고: CURRENT_BATCH (STEP 목록) / NEXT_STEP / MODE.

  ## Part 1 — 문서 갱신
  CURRENT_BATCH 의 영향을 받은 내용만 갱신한다. 무관한 부분은 손대지 않는다.
  4개 문서는 서로 모순이 없어야 한다. for-claude-code.md 는 여기서 절대
  수정하지 않는다.

  1-1. 갱신 규칙
  - mvp-checklist.md (항상):
    · STEP_COMPLETE → CURRENT_BATCH 의 모든 STEP 이 산출한 모든 항목 [x] 체크.
    · WIP → 배치에서 이미 끝난 STEP 들의 항목만 체크. 진행 중인 마지막 STEP
      의 항목은 체크하지 않음. 체크리스트가 충분히 잘게 나뉘어 있으면 실제로
      끝난 하위 항목만 체크.
    · `진행 로그` 한 줄 추가(배치 전체 내용 포함):
      `날짜 | 완료한 것 (배치 전체) | 막힌 것 | 다음 할 것`.
      "완료한 것" 에는 완료된 모든 STEP 을 나열한다. WIP 모드에서는
      "다음 할 것" 에 끝내지 못한 잔여 작업을 명확히 적는다.
    · 상단 `최종 갱신` 줄을 오늘 날짜로 갱신.
    · CURRENT_BATCH 외의 STEP 상태는 절대 변경하지 않음.
  - phases.md (필요할 때만):
    · CURRENT_BATCH 의 각 STEP 에서 함정·노하우·결정이 나왔으면 해당 STEP 에
      `**진행 기록 (날짜, STEP X-Y ...)**` 블록을 기존 스타일로 추가.
    · 특이사항이 없는 STEP 은 손대지 않는다(빈 블록 추가 금지).
      배치 하나가 진행 기록 0개~여러 개를 만들 수 있다.
  - architecture.md (설계 결정이 바뀐 경우에만):
    · CLAUDE.md 규칙상 설계 변경은 코드보다 먼저 architecture.md 에 반영되어
      있어야 한다. 인계 시점엔 이미 최신이어야 한다.
    · 구현이 architecture.md 와 어긋났는데 문서가 갱신되지 않았다면 →
      조용히 다시 쓰지 말고 "직접 확인 필요" 에 FLAG 한다.
    · 수정했다면 `최종 갱신` 줄도 갱신.
  - for-claude-code.md: 수정 금지(거의 고정 문서, 역할 충돌 방지).

  1-2. 정합성 검사
  - mvp-checklist 체크 상태 ↔ phases.md 진행 기록 ↔ architecture.md 모순 없음.
  - CURRENT_BATCH 의 모든 STEP 이 mvp-checklist 에 빠짐없이 반영됨.
  - WIP 모드면 어떤 문서도 진행 중인 STEP 을 '완료'로 표시하지 않음.
  - architecture.md 의 설계 결정이 실제 구현과 일치(불일치 시 FLAG).
  - 이번 작업이 Immutable Rules 를 새로 위반하지 않음.
  - for-claude-code.md 를 건드리지 않음.

  1-3. 요약 형식 (컨텍스트에 출력)
  - "문서 갱신 요약 — CURRENT_BATCH (MODE)" 제목 아래, 갱신한 문서마다
    변경/이유를 적고, 정합성 검사 PASS/FAIL, 직접 확인 필요 항목을 적는다.

  ## Part 2 — 인계 프롬프트
  다음 컨텍스트용으로 복사 가능한 프롬프트 하나를 출력한다. CLAUDE.md 에서
  추출한 프로젝트 이름·문서 경로를 사용한다. 제목과 "지시" 섹션은 모드에
  따라 달라진다. 다음 컨텍스트도 다중 Step 기본 원칙으로 작업하므로,
  "다음 작업" 섹션은 이후 STEP들이 작고 연관되면 다음 배치로 묶어 제안한다.
  프롬프트는 다음 섹션을 포함한다:
    핸드오프 모드 / 현재 상태(완료·진행 중·남은 작업) / 다음 작업 /
    참고 문서 / 주의사항 / 지시.
  - 완료 모드: 제목 "다음 배치 시작 프롬프트". "다음 작업" 에서 NEXT_STEP
    부터 시작해 연관된 작은 STEP 들은 배치로 묶어 제안. 지시에 "배치 완료
    후 edgecase-review 로 배치 전체 검증" 포함.
  - 중간 모드: 제목 "진행 중 STEP 이어서 진행 프롬프트". 지시에 "남은 작업
    마무리 → edgecase-review 검증 → 다음 배치 진행" 포함.
  - 참고 문서 목록에 "CLAUDE.md 의 '다중 Step 기본' 워크플로 원칙" 명시.
  - 지시에 "기본 실행 단위는 다중 Step(배치). 연관된 작은 STEP 은 묶어 구현,
    크거나 위험하거나 중요한 STEP 만 단독 진행" 포함.

  ## 실행 순서
  1. Pre-flight — CLAUDE.md 읽고 컨텍스트 추출, $ARGUMENTS 파싱,
     mvp-checklist.md·phases.md 읽기, CURRENT_BATCH/NEXT_STEP/MODE 결정.
  2. Part 1 — mvp-checklist.md(항상, 배치 내 모든 STEP),
     phases.md(특이사항 있는 STEP만), architecture.md(설계 결정 변경 시에만,
     아니면 불일치 FLAG) 갱신. for-claude-code.md 는 절대 건드리지 않음.
  3. 정합성 검사 후 `문서 갱신 요약` 출력.
  4. Part 2 — 복사 가능한 한국어 인계 프롬프트 출력.
  5. 모든 문서 편집은 한국어로, 인계 프롬프트도 한국어로.
