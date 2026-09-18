# RoadQ — 한국도로공사 도로 시계열 데이터 AI 플랫폼 (데모)

**RoadQ**는 도로에서 올라오는 **시계열 데이터를 AI로 어떻게 쓰는지**를 화면으로 보여주는 라이브 데모다.
공급사 OCUBE의 제품이며, 발주처는 한국도로공사다.

> **라이브**: https://hyegeungim3-git.github.io/ex-road-ai/

## 이 데모가 답하는 질문 4가지

| 축 | 화면 | 보여주는 것 |
|---|---|---|
| 예측 | 데이터 탭 › 예측 | 구간 평균속도의 단기 예측과 신뢰구간, 모델 오차·드리프트 |
| 이상탐지 | 데이터 탭 › 이상탐지 | 급감속 클러스터 검지와 "왜 이상으로 판정했나" 기여도 |
| 예지보전 | 데이터 탭 › 예지보전 | 교량·터널·장비 계측 추세와 잔존수명 추정, 조치 권고 |
| 데이터 품질 | 데이터 탭 › 데이터 품질 | 수집 파이프라인 결측·지연, 품질 규칙 위반, 모델 드리프트 |

여기에 업무용 AI 포털이 함께 붙는다 — 근거를 제시하는 **업무 Q&A**, 요청 1건이 여러 에이전트를 릴레이하는 **복합 업무 오케스트레이션**, **에이전트 13종**, 그리고 모델·지식·보안·규제 대응을 다루는 **관리자 콘솔**.

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5174/ex-road-ai/` (포트가 점유되면 Vite가 다른 포트를 쓰므로 **시작 로그의 주소**를 따를 것. 경로 `/ex-road-ai/`는 vite `base` 설정이다.)

빌드·품질 검사:

```bash
npm run lint          # ESLint
npm run check:domains # 도메인 팩 레지스트리·필수 필드·에이전트 ID 계약
npm run check:ontology# 지식그래프 참조 무결성
npm run check:storage # 데모 저장소 어댑터·민감 모드 계약
npm run build         # 프로덕션 빌드
```

> Windows에서 저장소가 **한글이 포함된 경로** 아래 있으면 Tailwind/Vite 네이티브 모듈이 빌드 도중 비정상 종료할 수 있다.
> 최종 빌드 판정은 ASCII 경로에 복사해 **종료 코드 `0` + `built in` 메시지**를 함께 확인하거나, CI 빌드 성공으로 갈음한다.
> 자세한 절차는 [docs/QUALITY-CHECKLIST.md](docs/QUALITY-CHECKLIST.md) §A.

## 구조 (2층 구조)

```
src/
├── domains/          도메인 팩 — 콘텐츠 계층 (expressway.js = 유일한 정식 팩)
├── RootApp.jsx       포털 선택 (정식 팩이 1개면 도메인 스위처는 자동 숨김)
├── UserApp.jsx       사용자 포털 — 일반 / 에이전트 / 데이터 / 보안 4탭
├── App.jsx           관리자 콘솔 (61개 메뉴)
├── user/
│   ├── timeseries/   시계열 인텔리전스 — engine.js(결정적 생성) + TimeSeriesPanel.jsx
│   ├── data/         코어 기본값 (콘텐츠)
│   └── components/   레이아웃·모달·에이전트 13종
├── admin/            관리자 목업 데이터 + 페이지
└── core/             demoStorage.js (localStorage 어댑터, 네임스페이스 roadq.*)
```

코어는 조직 콘텐츠를 모르고, 콘텐츠는 팩이 공급한다. **새 도메인 추가 = 팩 파일 1개 + 레지스트리 등록.**
기술 스택: React 19 · Vite 7 · Tailwind CSS 4 · lucide-react · recharts · GitHub Actions/Pages.

## 문서

| 문서 | 용도 |
|---|---|
| [CLAUDE.md](CLAUDE.md) | 모든 작업 세션의 공통 진입점 (정체·배포·규칙·현재 상태) |
| [docs/DECISIONS.md](docs/DECISIONS.md) | 설계 결정 기록(ADR) — 왜 지금 모습인가, 깨면 안 되는 불변식 |
| [docs/HANDOVER.md](docs/HANDOVER.md) | 승계 온보딩 — 읽는 순서·자격 게이트·캘리브레이션 |
| [docs/DOMAIN-PACK-GUIDE.md](docs/DOMAIN-PACK-GUIDE.md) | 도메인 팩 스키마 정본 안내(`timeSeries` 포함) |
| [docs/WORLD-LEDGER.md](docs/WORLD-LEDGER.md) | 콘텐츠의 단일 진실 원천 — 조직·인물·식별자·수치 |
| [docs/AGENT-CONTENT-SCHEMA.md](docs/AGENT-CONTENT-SCHEMA.md) | 에이전트 13종 내부 콘텐츠 스키마 |
| [docs/QUALITY-CHECKLIST.md](docs/QUALITY-CHECKLIST.md) | 완료 보고 전 검수 절차 |
| [docs/ROADMAP.md](docs/ROADMAP.md) | 다음 단계와 완료 기준 |
| [AGENTS.md](AGENTS.md) | 이 저장소에서 작업하는 에이전트/기여자 규칙 |

## 고지

**이 저장소에는 실제 백엔드도, 실제 AI 호출도, 실제 도로 데이터도 없다.**
화면의 모든 수치·시계열·문서·조회 결과는 **시뮬레이션**이며, 등장하는 인물과 문서번호는 가상이다.
시계열 곡선은 시드 기반으로 결정적으로 생성되므로 같은 조건에서 항상 같은 그림이 나온다(재현 가능한 데모).
업무 자동화 가능성을 설명하기 위한 시연용 자료이며, 실제 판단·공식 자료로 사용해서는 안 된다.
