
## 한글 번역

# 엣지케이스 리뷰

`my-design-system` 전용 경량 엣지케이스 + 설계규칙 점검 커맨드.
**단일 Step 또는 여러 Step을 묶은 배치** 모두 지원 — CLAUDE.md 워크플로 규칙에
따라 기본 실행 단위가 배치이므로, 이 스킬은 보통 배치 전체를 한 번에 검증한다.
범용 검증을 먼저 돌리고, 배치 내 각 Step별 검증을 덧붙인다.

**실행 방법:** Step Context 작성(배치 내 모든 Step 명시) → 합산 변경사항에
범용 검증 한 번 실행 → 각 Step별 검증 도출 → 통합 리포트 출력(간결하게, 실제 문제만).

## Step Context
```
SCOPE  : [단일 Step 또는 배치 — 모든 Step 나열, 예: STEP 1-3, 1-4, 1-5]
PHASE  : [해당 Phase 번호들]
FILES  : [배치 전체의 변경 파일들]   SKIP : [무관한 영역]
```

## 범용 검증 (항상)

**배치 전체의 합산 변경사항**에 대해 한 번 실행한다.

**불변 규칙 (CLAUDE.md)**
- [ ] 의존성 단방향 — `tokens`가 `ui`를 import하지 않는가?
- [ ] 색·간격·폰트 하드코딩 없음 — 값은 토큰에서만 오는가?
- [ ] CSS 변수는 `generate-css`로만 생성되는가(손으로 안 적었는가)?
- [ ] `react`/`react-dom`이 `ui`의 dependencies가 아닌 peerDependencies인가?
- [ ] `tailwind.config.js`/PostCSS preset 없음 (Tailwind v4는 CSS-first)?
- [ ] semantic 토큰은 단일 키 — 컴포넌트가 light/dark를 모르는가?

**빌드 & 패키징**
- [ ] `package.json`의 exports 경로가 실제 `dist/` 산출물과 일치하는가?
- [ ] `sideEffects: ["*.css"]`가 있고 CSS가 `exports`로 노출되는가?
- [ ] 빌드 스크립트가 깨끗하게 실행되는가(`pnpm --filter <pkg> build`)?

**컴포넌트 견고성 (UI 전용 — tokens면 N/A)**
- [ ] 누락/잘못된 prop이 안전한 기본값으로 폴백 — 크래시 없는가?
- [ ] `forwardRef`가 ref를 전달하는가; polymorphic `as` prop 처리되는가?
- [ ] `className`이 올바르게 병합되는가(tailwind-merge 충돌 제거)?
- [ ] 키보드 조작 + ARIA 속성이 기본 제공되는가?
- [ ] 다크모드가 CSS 변수 교체만으로 동작하는가(컴포넌트 수정 없이)?

## Step별 추가 검증 (배치 내 Step마다 한 세트)

범용 검증 후, 배치 내 **모든 Step**을 `docs/phases.md`와
`docs/mvp-checklist.md`에서 열어 각 Step의 **핵심 포인트 / 주의 / 완료 기준**
에서 추가 검증 항목을 도출한다. Step별로 묶어 리포트에서 추적 가능하게 한다. 예:
- Phase 1(토큰): 모든 토큰이 `tokens.css`에 존재; light·dark 두 세트 모두 출력.
- Phase 2(UI 기반): `dist/styles.css`에 토큰 유틸리티(`bg-primary`) 포함.
- Phase 3(컴포넌트): 로딩 시 중복 클릭 차단; label↔input 연결; Toast 타이머 정리.
- Phase 4(테스트): jsdom 환경; 동작 기반 쿼리(`getByRole`/`getByLabelText`).

## 자유 점검

체크리스트 후, 변경 파일을 새로운 눈으로 다시 훑는다 — 취약한 가정,
입력/환경이 예상 밖으로 바뀌면 깨질 부분. 배치인 경우 **Step 간 상호작용**
(뒤 Step이 앞 Step의 동작을 조용히 깨는 경우)에도 주의한다.
WARN/FAIL로 보고하되 체크리스트 밖에서 발견했음을 명시한다.

## 리포트 형식
```
### Edge Case Review — [단일 Step / 배치 범위, 예: STEP 1-3~1-5]
✅ OK   : [목록]      ⏭️ N/A  : [목록]
⚠️ WARN : [STEP X-Y] [문제 + 한 줄 수정 방법]
❌ FAIL : [STEP X-Y] [문제 + file:line + 수정 방법]
Priority fixes: 1. [가장 중요]  2. [그 다음]
Outside checklist: - [체크리스트 밖에서 발견한 취약점]
```
WARN/FAIL 각 항목에 `[STEP X-Y]` 태그를 붙여 배치 리포트의 추적성을 확보한다.

## 엣지케이스 문서화

리포트에 ⚠️ WARN 또는 ❌ FAIL 항목이 있을 경우:
- `docs/edgecase/phase-{N}.md` 를 생성(없으면)하거나 업데이트한다.  
  N = Phase 번호. 같은 Phase의 여러 Step은 하나의 파일에 기록한다  
  (예: STEP 1-1, 1-2 → `phase-1.md`).
- 배치에서 WARN/FAIL 이 발생한 Step마다 `#### STEP {X-Y}` 블록을 하나씩 추가한다.
  같은 Phase 안의 배치 → 해당 `phase-{N}.md` 하나에 모두 작성.
  두 Phase에 걸친 배치 → 각 STEP을 해당 Phase 파일에 나눠 작성.
- 모두 ✅ OK / ⏭️ N/A 뿐이면 파일을 생성하거나 건드리지 않는다.

### 엔트리 포맷 (WARN/FAIL 항목마다 한 블록씩 추가)

#### STEP {X-Y} — {Step 이름}

##### {엣지케이스 제목}
**문제**: 이 엣지케이스가 어떤 오류/버그를 일으키는가?  
**수정 전 코드**: *(문제가 있던 코드 스니펫)*  
**수정 후 코드**: *(수정된 코드 스니펫)*  
**수정 이유**: 왜 이 방식을 선택했는가? 다른 방법 대비 트레이드오프.
