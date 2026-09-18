# RoadQ — 한국도로공사 도로 시계열 데이터 AI 플랫폼

> **이 문서는 모든 AI 모델·모든 세션의 공통 진입점이다.**
> 작업 시작 전 끝까지 읽고, 규모 있는 작업 후에는 §7 "현재 상태"에 한 줄을 남겨라.
>
> ## 🔑 처음 이어받는다면 (승계 온보딩)
> **[docs/HANDOVER.md](docs/HANDOVER.md)**(온보딩 + 자격 게이트) →
> **[docs/DECISIONS.md](docs/DECISIONS.md)**(왜 지금 모습인가 — 불변식) →
> **[docs/WORLD-LEDGER.md](docs/WORLD-LEDGER.md)**(콘텐츠의 단일 진실 원천) → 이 문서 나머지.
> 이 저장소의 모든 변경 작업은 **`roadq-work` 스킬**이 진입점이다.

## 1. 정체

- **무엇**: 한국도로공사 데이터 부서를 대상으로, **도로에서 올라오는 시계열 데이터를 AI로 어떻게 쓰는지**를 보여주는 라이브 데모 플랫폼.
- **누구**: 공급사 OCUBE의 제품 **RoadQ**(멀티 도메인 플랫폼 AgentQ 계열의 도로 특화 에디션). 발주처는 한국도로공사 단일.
- **스택**: React 19 + Vite 7 + Tailwind CSS v4 + recharts. **백엔드 없음 — 모든 AI 응답·데이터는 시뮬레이션**이다(정직성 원칙: ADR-2).
- **구성**: 포털 선택(RootApp) → **사용자 포털**(UserApp: 일반 / 에이전트 / **데이터** / 보안 4탭, 에이전트 13종) + **관리자 시스템**(App: 61개 메뉴).

### 이 제품이 답하는 질문 4개 (데이터 탭 = 정체성)
| 축 | 화면 | 대표 사건 |
|---|---|---|
| 예측 | 데이터 탭 › 예측 | 경부선 하행 기흥~수원신갈 30분 후 속도 |
| 이상탐지 | 데이터 탭 › 이상탐지 | 386.8k 급감속 클러스터 → 2차사고 위험도 0.78 |
| 예지보전 | 데이터 탭 › 예지보전 | 남한강교 신축이음 변위 12.4/15.0mm, 잔존수명 14개월 |
| 데이터 품질 | 데이터 탭 › 데이터 품질 + 관리자 | VDS 결측률 4.8%(임계 3.0%), 모델 드리프트 +0.9 |

## 2. 배포

| 역할 | 주소 | 비고 |
|---|---|---|
| **개발·데모 라이브** | https://hyegeungim3-git.github.io/ex-road-ai/ | `origin` = `ex-road-ai`, `main` push 시 GitHub Actions 자동 배포 |
| 로컬 dev | `npm run dev` → http://localhost:5176/ex-road-ai/ | `.claude/launch.json`의 `roadq` 구성 |

- vite base는 `/ex-road-ai/` (`VITE_BASE=/ npm run build`로 루트 배포 가능).
- 배포 확인: `gh run watch <id> --exit-status` → 라이브 200 + **변경이 든 청크**에서 마커 확인.
- **Pages 배포 일시 오류(build success·deploy만 실패)가 상습 재발**한다. 실패 런 rerun 금지, `gh workflow run`으로 새 런을 띄울 것.

## 3. 아키텍처 — 2층 구조 (절대 무너뜨리지 말 것)

```
src/
├── domains/            ← 도메인 팩 (콘텐츠 계층)
│   ├── index.js        ← 레지스트리 + getDomain()/getDomainList() + 커스텀 팩 병합
│   ├── expressway.js   ← 한국도로공사 (창립 도메인, 유일한 정식 팩)
│   └── _template.js    ← 새 팩 작성용 템플릿 (레지스트리 미등록)
├── RootApp.jsx         ← 포털 선택 + 도메인 스위처(팩 1개면 자동 숨김)
├── UserApp.jsx         ← 사용자 포털 조립 (상태·핸들러)
├── App.jsx             ← 관리자 진입점 (페이지는 admin/pages/*)
├── user/
│   ├── timeseries/     ← ★ 시계열 인텔리전스 (engine.js + TimeSeriesPanel.jsx)
│   ├── data/           ← 코어 기본값 (창립 도메인이라 내용이 도로공사다)
│   └── components/     ← 레이아웃·모달·에이전트 13종
└── admin/              ← mocks.js(61 상수 + applyAdminDomain 리졸버) + pages/
```

- **새 도메인 추가 = 팩 파일 1개 + `domains/index.js` 등록.** 코어 수정이 필요하면 그건 "코어가 덜 일반화됨"이라는 신호다.
- 코어의 도메인·시나리오 조회는 반드시 **리졸버 경유**(`getDomain`/`getDomainList`/`allScenarios`). `DOMAINS`·`domain.orchestration` 직접 참조 시 커스텀 팩·커스텀 시나리오가 조용히 누락된다.
- 상세: **[docs/DOMAIN-PACK-GUIDE.md](docs/DOMAIN-PACK-GUIDE.md)** / 검수: **[docs/QUALITY-CHECKLIST.md](docs/QUALITY-CHECKLIST.md)**

### 콘텐츠 규율 — 세계관 단일 원장
모든 수치·식별자·인물은 **[docs/WORLD-LEDGER.md](docs/WORLD-LEDGER.md)** 에서 가져온다. 새 수치가 필요하면 **원장에 먼저 등재하고** 쓴다. 화면마다 수치가 다르면 데모는 그 순간 신뢰를 잃는다.

## 4. 작업 규칙 (위반 시 실제 사고 이력 있음)

1. **파일 수정은 Edit 도구만.** PowerShell `-replace`/`Set-Content`는 한글 UTF-8 파일을 파괴한다. 대량 치환은 Python(`io.open(..., encoding='utf-8')`)으로, 스크립트는 실행 후 삭제.
2. git 커밋 메시지에 쌍따옴표(`"`) 금지 — here-string `@'...'@` 사용(닫는 `'@`는 줄 시작).
3. Bash 도구의 상대경로는 매 호출 초기화 — `cd /c/한국부동산원/ex-road-ai && ...` 형태로.
4. **완료 = 빌드 통과 + 브라우저 DOM 검증 + 증거 제시.** "될 겁니다" 금지.
   - ⚠️ **이 머신에서 `npx vite build`는 한글 경로 때문에 "✓ N modules transformed" 직후 네이티브 크래시로 조용히 죽는다.** "transformed"만 보고 통과 판정 금지 — **종료 코드 0 + "✓ built in Xs"** 까지 확인.
   - 로컬 빌드 검증: ASCII 경로로 복사 후 빌드(절대경로로 `/XD` 지정 — 상대명 `dist`를 쓰면 `node_modules/vite/dist`까지 제외돼 깨진다). 또는 push 후 CI 빌드로 갈음.
5. **블록 주석 안에 `*/`를 포함하는 문자열 금지** — 주석이 조기 종결돼 빌드가 깨진 사고가 두 번 있었다.
6. `src/admin/mocks.js`에 새 상수를 추가하면 **`export let` · `__REB_DEFAULTS` · `applyAdminDomain` 3곳 등록** — 누락 시 조용히 무시된다. (변수명 `__REB_DEFAULTS`는 포크 유산이지만 리졸버 계약이라 유지한다)
7. **새 도메인 팩을 추가하면** `.claude/skills/roadq-verify/scripts/scan-config.mjs`의 `DOMAINS`에도 판정 기준을 함께 등록 — 안 하면 새 도메인이 자동 검증에서 빠진다.

## 5. 하네스 (자동화된 판단 보조)

| 자산 | 역할 |
|---|---|
| `.claude/skills/roadq-work` | 작업 오케스트레이터 — **모든 변경 작업의 진입점**. `references/pitfalls.md`는 실사고 전집 |
| `.claude/skills/roadq-pack` | 도메인 팩 콘텐츠 작성 방법론(세계관 구축) |
| `.claude/skills/roadq-verify` | 검증 스크립트 — `verify.mjs`(넓고 얕게) / `deepscan.mjs`(에이전트 실행) / `adminscan.mjs`(관리자 전수) |
| `.claude/agents/pack-author.md` | 팩 콘텐츠 작성 서브에이전트 |
| `.claude/agents/roadq-verifier.md` | 검수 서브에이전트 |

```bash
node .claude/skills/roadq-verify/scripts/verify.mjs http://localhost:5176/ex-road-ai/
```

CI(`.github/workflows/deploy.yml`)는 push마다 lint → `check:domains` → `check:ontology` → `check:storage` → build를 돌린다.

## 6. 포크 이력

이 저장소는 멀티 발주처 데모 플랫폼(AgentQ, 저장소 `reb-ai-platform-v3`)을 **2026-09-18에 포크**해 만들었다. 포크 시점에 타 발주처 팩 4종(부동산원·제조·행정·의료)을 삭제하고 코어 기본값을 도로공사로 전환했으며, git 이력은 **새로 시작**했다(타 발주처 콘텐츠가 공개 이력에 남지 않도록).

## 7. 현재 상태

- **2026-09-18 초기 구축 완료** (커밋 `39cf517` + `4d425af`): 포크 → 리브랜딩(RoadQ·EX 블루 `#00539F`·스토리지 `roadq.*`) → `expressway` 팩 신설(시나리오 2·지도 8본부·라이브 지표·지식그래프) → **데이터 탭(시계열 인텔리전스) 신규 개발** → 코어 기본값·에이전트 13종·관리자 61메뉴 도로공사 전환 → 문서·하네스 승계 체계 정비.
  - **검증 증거**: `verify.mjs` PASS(금칙어 0·마커 전부·시나리오 카드 2·에이전트 13종 내부·콘솔 0·모바일 375 회귀) / `adminscan` PASS(61메뉴 전수 누수 스캔 + 버튼 545개 클릭) / `check:domains`·`check:ontology`(16노드 16엣지 6근거)·`check:storage` 통과 / ASCII 경로 빌드 EXIT 0 + "✓ built in 3.59s" / CI 런 `35325494184` success / 라이브 200 + 청크 마커(TimeSeriesPanel·Orchestration·index) 확인, 금칙어 0.
  - **잡은 결함 5건**: 팩 `docs[]`의 `tags`·`secLevel` 누락 → 우측 패널 크래시(화이트 스크린) / 예측 곡선 급락 시점이 '현재'와 어긋나 관측값이 원장(38km/h)과 불일치 / 팩 스튜디오가 삭제된 팩 id를 참조해 크래시 / `knowledge.jsx`의 `SBadge` 미정의(5곳) / 라이브 엔진이 하강형 지표에서 매 틱 리셋(경보 영영 미발화).
  - **하네스 진화 2건**: `adminscan` 1단계를 6페이지 → 61메뉴 전수 누수 스캔으로 확장(크래시 2건을 이 확장이 잡았다), 클릭 스윕이 페이지 이동으로 죽던 문제 방어.
  - **첫 배포 함정**: Windows에서 `npm install --package-lock-only`로 재생성한 락파일은 리눅스 전용 선택적 의존성(@emnapi 등)이 빠져 CI의 `npm ci`가 실패한다. 의존성이 같다면 **검증된 락파일을 복사하고 name만 교체**할 것.
- 다음 후보: **[docs/ROADMAP.md](docs/ROADMAP.md)** 참조 (P1 시계열 실데이터 파이프라인이 최우선).
