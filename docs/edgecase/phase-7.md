# Phase 7 — 엣지케이스 수정 기록

> vercel.json edgecase-review (2026-05-22) 결과. FAIL 0, WARN 1.
> Phase 7 은 phases.md 상세 STEP 이 없어, 검토 대상 산출물(vercel.json) 단위로 기록한다.

---

#### vercel.json — Vercel 배포 설정

##### Vercel 빌드 Node 버전이 CI·로컬(Node 20)과 어긋날 수 있음

**Problem**: 루트 `package.json` 의 `engines.node` 는 `">=20"` 이다. Vercel 은 이 범위
안에서 지원하는 **최신 메이저(현재 22.x)** 를 자동 선택한다. 그러나 이 프로젝트는
CI(`ci.yml` — Node 20)와 로컬(20.19.0)에서만 빌드·검증됐다. 게다가 `tokens` 의
tsdown 은 0.21.x 로 핀돼 있는데, 그 핀 자체가 "Node 버전에 민감하다"(0.22+ 는
Node 22+ 요구)는 신호다. 즉 배포 빌드가 한 번도 검증된 적 없는 Node 환경에서 돈다.

빌드 도구(tsdown 0.21.10·Storybook 10·Vite 8)는 모두 Node 22 를 지원하므로 실패
가능성 자체는 낮지만, "검증된 적 없는 환경" 이라는 점이 엣지케이스다. 그리고
`vercel.json` 에는 Node 버전 지정 필드가 없어 코드로 닫을 수 없다.

**Before** (Vercel 자동 선택에 위임 — 검증 환경과 불일치 가능):
```
engines.node: ">=20"   →  Vercel 빌드 Node = 22.x (자동 선택)
CI / 로컬               =  Node 20
```

**After** (권장 대응 — Vercel 대시보드 설정):
Vercel 프로젝트 Settings → Node.js Version 을 **20.x** 로 명시한다. CI·로컬과
동일한 환경에서 배포 빌드가 돌아 검증 범위가 일치한다.
(대안: `engines.node` 를 `"20.x"` 로 좁히면 프로젝트 전역에 강제되나,
architecture.md §3 의 "Node 20+" 선언 의도와 어긋나므로 대시보드 설정을 우선한다.)

**Why**: Node 버전은 `vercel.json` 으로 제어할 수 없는 배포 인프라 설정이라
코드 수정이 아닌 대시보드 액션으로 닫는다. 첫 배포 후 빌드 로그에서 실제 Node
버전을 확인하고, 22 로 잡혔다면 20.x 로 내려 CI 와 정합을 맞춘다.

---

##### 검토 중 확인했으나 문제 아님 (참고)

- **`NODE_ENV=production` 에서 devDependencies 누락 우려** — Vercel 빌드 환경은
  `NODE_ENV=production` 이다. npm 은 이 경우 devDependencies 를 건너뛰지만,
  로컬 재현 결과 **pnpm 은 `NODE_ENV` 와 무관하게 devDeps 를 설치**한다
  (`--prod` 플래그를 명시해야만 prod 전용이 됨). 따라서 `--prod=false` 같은
  방어 플래그는 불필요하며, `installCommand` 는 CI(`ci.yml`)와 동일한
  `pnpm install --frozen-lockfile` 을 그대로 유지한다.
- **`--frozen-lockfile` 의 lockfile 동기 요구** — `pnpm-lock.yaml` 이 어긋나면
  배포가 즉시 실패한다. 이는 의도된 fail-fast 동작이다. 현재 lockfile 은 동기
  상태로 확인됨(검토 시점).
