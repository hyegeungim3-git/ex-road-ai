# HANDOVER — 새 모델/세션 온보딩 프로토콜

> **누구를 위한 문서인가.** 어떤 모델(Opus·Sonnet·Haiku 등)이 RoadQ를 처음 이어받을 때,
> 코드를 건드리기 **전에** 밟는 절차. 목적은 하나 — **모델이 무엇이든 같은 결승선을 통과**시키는 것.
> 원리: *약한 모델일수록 지식이 아니라 **절차**를 줘라. 강한 모델일수록 절차가 아니라 **기준**을 줘라.*

---

## 0. 30초 요약 (급하면 이것만)

1. 이 저장소의 모든 변경 작업은 **`roadq-work` 스킬**이 진입점이다(표준 루프: 착수→구현→검증→배포→기록).
2. **완료 = 빌드(ASCII 경로 EXIT 0 + "✓ built in Xs") + 실행 증거 + `verify.mjs` PASS.** "될 겁니다" 금지.
3. **코어에 조직 콘텐츠 하드코딩 금지** — 팩 필드로. 단, 이 제품의 **코어 기본값은 이미 도로공사 콘텐츠**다(창립 도메인, [DECISIONS.md ADR-14](DECISIONS.md)).
4. 화면에 쓸 **모든 수치·이름·문서번호는 [WORLD-LEDGER.md](WORLD-LEDGER.md)에서 가져온다.** 없으면 원장에 먼저 등재하고 쓴다.
5. 함정을 밟기 쉬운 작업(빌드·자동화·배포·대량편집) 전 [pitfalls.md](../.claude/skills/roadq-work/references/pitfalls.md)를 읽어라 — 전부 실사고다.

---

## 1. 읽는 순서 (첫 세션, 20분)

| 순서 | 문서 | 무엇을 얻나 |
|---|---|---|
| 1 | [CLAUDE.md](../CLAUDE.md) | 제품 정체·배포 표·작업 규칙·현재 상태 |
| 2 | [DECISIONS.md](DECISIONS.md) | **왜 지금 모습인가**(불변식) — 이걸 모르면 조용히 깨뜨린다 |
| 3 | 이 문서(HANDOVER.md) | 자격 게이트 + 캘리브레이션 + 첫 세션 함정 |
| 4 | [DOMAIN-PACK-GUIDE.md](DOMAIN-PACK-GUIDE.md) | 팩 스키마 전체(`timeSeries` 포함) + 콘텐츠 품질 기준 |
| 5 | [WORLD-LEDGER.md](WORLD-LEDGER.md) | 콘텐츠의 단일 진실 원천 — 조직·인물·식별자·수치·금칙어 |
| 6 | [roadq-work 스킬](../.claude/skills/roadq-work/SKILL.md) + [pitfalls.md](../.claude/skills/roadq-work/references/pitfalls.md) | 표준 루프 + 실사고 전집 |
| 7 | 작업 종류별: [roadq-pack](../.claude/skills/roadq-pack/SKILL.md)(콘텐츠) / [roadq-verify](../.claude/skills/roadq-verify/SKILL.md)(검증) | 그 작업의 방법론 |
| 8 | [ROADMAP.md](ROADMAP.md) | 무엇을 이어서 하나 |

검수 절차는 작업 직전에 [QUALITY-CHECKLIST.md](QUALITY-CHECKLIST.md)를 연다(통독 대상이 아니라 실행 대상).

---

## 2. 자격 게이트 — 코드를 건드리기 전에 이 9개를 스스로 답할 수 있어야 한다

**문서만 읽고** 정확히 답할 수 있어야 한다. 못 답하면 아직 준비가 안 된 것이고, **그건 문서의 결함이니 무엇을 못 찾았는지 보고하라.**
각 문항에 **답의 핵심**과 **근거가 있는 위치**를 함께 적었다 — 자답할 때도 "어디서 읽었는지"를 같이 말해야 통과다.

1. **이 머신에서 "빌드 통과"를 어떻게 판정하나?**
   → 저장소가 **한글이 포함된 경로** 아래 있어서 `vite build`가 "✓ N modules transformed" 직후 조용히 죽는다. **"transformed"로 판정 금지** — ASCII 경로 복사 빌드의 **EXIT 0 + "✓ built in Xs" + dist 갱신**, 또는 CI 성공으로 갈음.
   *근거: [CLAUDE.md §4-4](../CLAUDE.md) · [DECISIONS.md ADR-3](DECISIONS.md) · [QUALITY-CHECKLIST.md §A](QUALITY-CHECKLIST.md) · [pitfalls §1](../.claude/skills/roadq-work/references/pitfalls.md)*

2. **파일 내용을 바꿀 때 절대 쓰면 안 되는 도구는? 대안은?**
   → PowerShell `-replace`/`Set-Content`(한글 UTF-8 파괴). **Edit 도구**만 쓰고, 대량 치환은 Python `io.open(..., encoding='utf-8')`으로 하되 임시 스크립트는 실행 후 삭제.
   *근거: [CLAUDE.md §4-1](../CLAUDE.md) · [pitfalls §2](../.claude/skills/roadq-work/references/pitfalls.md)*

3. **화면에 쓸 새 수치(예: 새 구간의 평균속도)가 필요하다. 절차는?**
   → 즉흥으로 만들지 않는다. **[WORLD-LEDGER.md](WORLD-LEDGER.md)에 먼저 등재**하고 그 값을 인용한다. 이미 있는 수치는 grep해서 승계한다 — 화면마다 숫자가 다르면 데모는 그 순간 신뢰를 잃는다.
   *근거: [WORLD-LEDGER.md](WORLD-LEDGER.md) 머리말·§4 · [DECISIONS.md ADR-4](DECISIONS.md)*

4. **데이터 탭 차트의 좌표는 어디서 오나? 팩은 무엇을 주나? '현재 관측'이 원장 수치와 어긋나면 무엇을 고치나?**
   → 좌표는 팩이 아니라 **`src/user/timeseries/engine.js`가 시드 기반으로 결정적으로 생성**한다. 팩(`domain.timeSeries`)은 '사건의 형태'(baseline·threshold·`dip:{atPct,to,width}`·seed·forecast 목표값)만 준다. 급락이 '지금'인 구간은 `dip.atPct: 1.0`으로 두면 엔진이 마지막 관측값을 잡음 없이 `dip.to`로 고정하므로, **`dip.to`에 원장 수치를 적는 것**이 정답이다(차트 코드가 아니라 팩을 고친다).
   *근거: [DECISIONS.md ADR-15](DECISIONS.md) · `src/user/timeseries/engine.js` 상단 주석·`buildSeries` 말미 · [DOMAIN-PACK-GUIDE.md §2-4](DOMAIN-PACK-GUIDE.md)*

5. **팩 필드 shape의 정본은 문서인가 코드인가? 시계열·라이브 지표·에이전트 콘텐츠 각각 어디를 보나?**
   → **코드.** 시계열은 `src/user/timeseries/engine.js` 상단 주석, 라이브 지표는 `src/user/liveEngine.js` 상단 주석, 에이전트 콘텐츠는 각 에이전트 파일 상단 `export const CONTENT_DEFAULTS`. 문서와 다르면 코드가 맞고 문서를 고친다.
   *근거: [DECISIONS.md ADR-7](DECISIONS.md) · [DOMAIN-PACK-GUIDE.md](DOMAIN-PACK-GUIDE.md) 머리말 · [AGENT-CONTENT-SCHEMA.md](AGENT-CONTENT-SCHEMA.md) 머리말*

6. **커스텀 팩/시나리오가 "에러 없이 안 보이는" 버그를 피하려면?**
   → 코어의 도메인 조회는 `getDomain()`/`getDomainList()`, 시나리오 조회는 `allScenarios(domain)` **리졸버 단일 경로**. `DOMAINS[...]`·`domain.orchestration` 직접 참조 금지(유일한 예외는 팩 스튜디오의 베이스 팩 선택). 관리자는 `src/admin/mocks.js`의 새 상수를 **`export let`·`__REB_DEFAULTS`·`applyAdminDomain` 3곳**에 등록해야 팩 오버라이드가 먹는다.
   *근거: [DECISIONS.md ADR-8](DECISIONS.md) · [CLAUDE.md §3·§4-6](../CLAUDE.md) · `src/domains/index.js`*

7. **데모 상태는 어디에 저장되나? 키를 새로 만들 때 규칙과 금지 사항은?**
   → localStorage 네임스페이스 **`roadq.*`**(전역 `roadq.<기능>`, 도메인별 `roadq.<기능>.<도메인>`). 키 문자열을 직접 조합하지 말고 `src/core/demoStorage.js`의 `makeGlobalStorageKey`/`makeDomainStorageKey`를 쓴다. `src/` 어디서도 `localStorage.*`를 직접 호출하지 않는다(어댑터 경유, `npm run check:storage`가 CI에서 판정). **SECURE 세션은 무저장**이며 `{ sensitive: true }` 계약이 쓰기·삭제를 거부한다.
   *근거: [DECISIONS.md ADR-6·ADR-12](DECISIONS.md) · `src/core/demoStorage.js`*

8. **새 도메인 팩을 추가하려면 어디를 고치나? 코어를 고쳐야 하면 그건 무슨 신호인가? 이 제품에서 "팩이 생략한 필드"는 무엇으로 채워지나?**
   → 팩 파일 1개 + `src/domains/index.js` 등록 + **`.claude/skills/roadq-verify/scripts/scan-config.mjs`의 `DOMAINS` 등록**(빠뜨리면 자동 검증에서 조용히 빠진다). 코어 수정이 필요하면 "코어가 덜 일반화됨" 신호이고 커밋을 분리한다. 그리고 **생략한 필드는 중립이 아니라 도로공사 콘텐츠로 채워진다**(창립 도메인) — 새 팩은 도메인 종속 필드를 전부 명시적으로 덮어야 한다.
   *근거: [DECISIONS.md ADR-1·ADR-5·ADR-14](DECISIONS.md) · [DOMAIN-PACK-GUIDE.md §0](DOMAIN-PACK-GUIDE.md) · [CLAUDE.md §4-7](../CLAUDE.md)*

9. **배포 후 라이브에서 새 기능 마커가 index 번들에 없다. 왜이고 어디를 보나? Pages가 deploy 단계에서만 실패하면?**
   → lazy 청크로 분리됐기 때문이다. `UserApp-*`·`App-*`·기능 청크에서 찾는다(`App-` 정규식은 `\b` 없으면 `UserApp`에 오매칭). Pages deploy 일시 오류는 상습 재발이며 **실패 런 rerun이 아니라 `gh workflow run`으로 새 런**을 띄운다.
   *근거: [CLAUDE.md §2](../CLAUDE.md) · [DECISIONS.md ADR-9·ADR-11](DECISIONS.md) · [pitfalls §4](../.claude/skills/roadq-work/references/pitfalls.md)*

> **보너스(자주 착각하는 것):** 포털에 '데모 도메인' 스위처가 안 보이는 것은 **버그가 아니다.** 정식 팩이 1개면 자동으로 숨긴다(`getDomainList().length < 2`). 팩 스튜디오로 커스텀 팩을 만들면 다시 나타난다. — [DECISIONS.md ADR-16](DECISIONS.md), `src/RootApp.jsx`

> **약한 모델(Haiku 등)이라면**: 위를 못 외워도 된다. 대신 **매 작업 전 pitfalls.md의 해당 절을 열어 참조**하고, 한 메시지=한 단계로 쪼개 작업하라.
>
> **하드 규칙 — 코어/공유 모듈은 게이트+캘리브레이션 통과 전 편집 금지.** 코어(`RootApp.jsx`/`UserApp.jsx`/`App.jsx`), 리졸버(`getDomain`·`allScenarios`), `src/admin/mocks.js`, `src/core/demoStorage.js`, 시계열 엔진, 검증 스크립트, 레지스트리(`src/domains/index.js`) 등 **여러 화면·기능이 공유하는 모듈**을 첫 작업으로 건드리면 조용한 누락(ADR-8)을 유발하기 쉽다. §3 캘리브레이션(단일 팩 필드)을 먼저 통과한 뒤 코어로 간다.

---

## 3. 캘리브레이션 과제 (조건부 필수)

새 모델의 "검증 생략 패턴"을 파악하는 작은 과제. 실제로 시켜보고 게이트를 통과하는지 본다.
- **코어·공유 모듈(리졸버·mocks.js·엔진·검증 스크립트·레지스트리·컴포넌트)을 건드리는 첫 작업 전에는 필수** — 통과 전엔 프로덕션 코어 편집 금지(§2 하드 규칙).
- **단일 팩 필드만 수정하는 첫 작업이면 권장**(리스크가 팩 안에 갇혀 있음).
아래 과제는 단일 팩 수정이라 캘리브레이션 자체로도 안전하다.

```
캘리브레이션 과제: src/domains/expressway.js 의 timeSeries.health.assets 에 자산 카드 1장을 추가하라.
소재는 새로 지어내지 말고 WORLD-LEDGER.md §4-3에 이미 등재된 '영동선 대관령 구간 노면온도 -1.2℃ /
결빙 확률 0.62(주의 임계 0.50)'을 쓴다. 필드 shape는 src/user/timeseries/engine.js 주석과
기존 assets 항목을 근거로 맞춘다(표시용 보조값 seed·trendUp 등만 팩에서 정할 것).

완료 기준:
  ① 데이터 탭 › 예지보전에서 카드가 4장 렌더되고, 새 카드의 값·임계가 원장 수치와 일치(DOM 텍스트로 확인)
  ② 브라우저 콘솔 에러 0건
  ③ node .claude/skills/roadq-verify/scripts/verify.mjs <baseUrl> → EXIT 0
  ④ ASCII 경로 복사 빌드 EXIT 0 + "✓ built in Xs"
  ⑤ 커밋(한국어, 무엇을·왜)
끝나면 '무엇을 검증했고 무엇은 안 했는지' 구분해서 보고.
```

**통과 기준**: ① `roadq-work` 루프를 따랐는가 ② 증거가 실행 결과인가 추정인가 ③ 세계관 수치를 새로 발명하지 않고 원장에서 승계했는가 ④ 스키마를 문서가 아니라 코드(engine.js·기존 항목)에서 확인했는가 ⑤ 완료 보고에 '검증한 것 vs 안 한 것'이 구분됐는가. 미달이면 더 작은 단위로 쪼개 지시하는 모드로 전환.

---

## 4. 첫 세션에서 흔히 저지르는 실수 (미리 경고)

- ❌ 한글 경로에서 `npx vite build` 돌리고 "transformed" 보고 통과 판정 → **7주짜리 오판의 재현.** ASCII 복사 빌드로.
- ❌ 팩 콘텐츠를 코어 컴포넌트에 문자열로 박기 → ADR-1 위반. 다음 확장 비용이 폭증하고 잔재 스캔의 기준점이 무너진다.
- ❌ 새 수치를 즉흥으로 만들어 세계관 모순 유발 → 원장 등재 후 사용(ADR-4).
- ❌ 시계열 차트가 이상하다고 `TimeSeriesPanel.jsx`·`engine.js`를 먼저 고치기 → 대부분 **팩의 `dip`/`baseline` 설정 문제**다(ADR-15).
- ❌ 팩 `docs[]`에 `tags`·`secLevel`을 빠뜨림 → 우측 패널 배지·태그가 깨진다(과거 크래시 이력). [DOMAIN-PACK-GUIDE.md §2-2](DOMAIN-PACK-GUIDE.md)
- ❌ 브라우저 자동화에서 setTimeout 체인으로 클릭 연결 → 타이밍 어긋나 중간 단계 조용히 누락. 단계별 호출 + **사이드바 접힘 먼저 확인**(`aria-label="사이드바 펼치기"`).
- ❌ 콘솔 에러 버퍼(세션 누적)의 스테일 HMR 오류를 회귀로 오판 → 풀 리로드 후 새 에러만 보고, 최종 판정은 ASCII 빌드로.
- ❌ `src/admin/mocks.js`에 상수만 추가하고 3곳 등록(`export let`·`__REB_DEFAULTS`·`applyAdminDomain`) 누락 → 팩 오버라이드가 조용히 무시.

---

## 5. 이어받기 표준 지시문 (사용자가 이 문구로 시작하면 그대로)

- **온보딩**: "ex-road-ai/docs/HANDOVER.md 읽고 자격 게이트 9문을 근거 위치까지 붙여 자답해서 보고해. 그다음 캘리브레이션 과제 1개 수행하고 통과 여부 스스로 판정해."
- **로드맵 실행**: "ex-road-ai/CLAUDE.md 읽고 docs/ROADMAP.md의 P\<N\> 실행해줘 — roadq-work 표준 루프, DoD 전 항목 실행 증거 포함."
- **팩 콘텐츠 작업**: "docs/WORLD-LEDGER.md와 docs/DOMAIN-PACK-GUIDE.md 기준으로 \<필드/화면\>을 보강해줘 — 원장에 없는 수치는 먼저 등재하고."

---

## 6. 인수인계를 남기는 쪽(떠나는 세션)의 의무

다음 모델이 이어받을 수 있게 **떠나기 전**:
- [ ] [CLAUDE.md](../CLAUDE.md) '현재 상태'에 한 줄 추가(커밋 해시 + 검증 증거)
- [ ] 새 수치·인물·식별자를 만들었으면 [WORLD-LEDGER.md](WORLD-LEDGER.md)에 등재
- [ ] 새 설계 결정을 했으면 [DECISIONS.md](DECISIONS.md)에 ADR 추가
- [ ] 새 함정을 밟았으면 [pitfalls.md](../.claude/skills/roadq-work/references/pitfalls.md)에 기록
- [ ] 하네스(에이전트/스킬/검증 스크립트)를 고쳤으면 [CLAUDE.md §5](../CLAUDE.md) 갱신
- [ ] 스키마를 바꿨으면 [DOMAIN-PACK-GUIDE.md](DOMAIN-PACK-GUIDE.md)·[AGENT-CONTENT-SCHEMA.md](AGENT-CONTENT-SCHEMA.md) 동기화(정본은 코드 — ADR-7)
- [ ] 로드맵 항목을 끝냈으면 [ROADMAP.md](ROADMAP.md)에 완료 표시와 잔여 한계 기록
