# agentContent 스키마 수집 (팩 작성용)

> ⚠️ **정본은 코드다**([DECISIONS.md ADR-7](DECISIONS.md)). 이 문서는 각 에이전트 파일 상단 `export const CONTENT_DEFAULTS`의 스냅샷이다.
> 어긋나면 `CONTENT_DEFAULTS`(및 실제 소비 지점)를 신뢰하고 이 문서를 즉시 갱신하라. 추측으로 키를 쓰지 말고 해당 파일을 먼저 읽어라.
>
> **키 목록을 코드에서 직접 뽑는 법** (저장소 루트에서 — 이 문서보다 이 명령을 먼저 믿어라):
> ```bash
> for f in src/user/components/agents/*.jsx; do
>   echo "### $(basename $f)"
>   awk '/export const CONTENT_DEFAULTS/,/^};/' $f | grep -oE "^  [a-zA-Z_][a-zA-Z0-9_]*\s*:" | tr -d ' :'
> done
> ```

## 공통 규칙

- 팩 파일의 `agentContent: { "<agent-id>": { …키… } }`에 기입한다. **키 단위 병합** — 제공한 키만 교체되고 나머지는 코어 기본값이 쓰인다.
- 각 키는 **통째 교체 계약**: 배열 항목 수·필드 shape를 코어 기본값과 동일하게 유지한다(코어가 인덱스·키에 의존하는 곳이 있다).
- ⚠️ **이 제품의 코어 기본값은 한국도로공사 콘텐츠**다([ADR-14](DECISIONS.md)). 팩이 키를 생략하면 중립 더미가 아니라 **도로공사 콘텐츠**가 노출된다. 다른 조직 팩을 만들 때는 도메인 종속 키를 전부 덮어야 한다.
- 에이전트 ID 13종 고정: `agent-chatbot` `agent-report` `agent-meeting` `agent-knowledge` `agent-internalreg` `agent-ocr` `agent-dbquery` `agent-address` `agent-dataanalysis` `agent-summary` `agent-translate` `agent-review` `agent-safety`

## 모든 에이전트 공통 — 화면 헤더

- `headerTitle: string` — **생략 권장.** 생략하면 `agentCatalog[id].name`을 승계한다(`src/user/utils.jsx`의 `agentHeader()`; 우선순위: `agentContent.headerTitle` > 팩 `agentCatalog.name` > 코어 `AGENT_TEAMS.name` > 컴포넌트 기본값).
  이름을 카탈로그와 여기 두 곳에 쓰면 반드시 어긋난다(실제 사고 이력).
- `headerDesc: string` — 내부 화면 부제. **카탈로그 `desc`를 승계하지 않는다** — 카드 desc는 '무엇을 하는가'(홍보 문장), `headerDesc`는 '어떤 순서로 진행되는가'(작업 흐름)로 역할이 다르다.

---

## agent-translate (TranslateAgent.jsx)
- `sourceText: string` — 샘플 원문, `\n\n` 구분 문단 3개
- `translatedText: string` — 번역 결과, `\n\n` 구분 문단 3개 (원문과 문단 수 일치 권장)
- `chunks: {id:number,text:string}[5]` — 청킹 결과(원문 의미 단위 분할)
- `summaryKo` / `summaryEn: string` — 요약 패널 좌/우
- `backTranslated: string` — 역번역 검증 텍스트, 첫 문단만 노출
- `glossary: {ko,en,category}[8]` — 도메인 용어집

## agent-review (DocReviewAgent.jsx)
- `apvLine: {name,dept,title,role}[3]` — 결재선(작성자→검토자→승인자 순서 고정)
- `ragDocs: string[7]` — RAG 검색 티커에 흐르는 규정 조항명
- `violations: {clause,type,severity:'high'|'medium'|'low',content,action}[3]` — 심각도별 1건씩, `highlightSegs`와 대응(준수율 자동 산출)
- `regs: {id:'r1'~'r5',label}[5]` — 검토 대상 규정 선택지. **id는 r1~r5 고정**
- `highlightSegs: {text,type:null|'high'|'medium'|'low'}[7]` — 문서 본문 분절, type이 violations severity와 대응
- `highlightLegendLabels: {high,medium,low}` — 범례 문구 3종
- `highlightDocTitle` / `reviewNum` / `dept` / `docNum` / `apvDocNum: string`
- `logoSrc: string(data URI)` / `logoAlt: string`

## agent-safety (SafetyPlanAgent.jsx)
- `agents: {icon:LucideIcon,label,sub,color,ms}[4]` — 시뮬레이션 단계
- `riskOptions: string[10]` — 위험 요인 선택지 (**`riskData` 키와 일치 필수**)
- `riskData: {[riskOption]:{level,freq,sev:1~5,lkl:1~5,lvlColor,measure}}`
- `resultText: string` — 계획서 전문
- `apvLine: {name,dept,title,role}[3]`
- `defaultProjName` / `defaultProjType` / `defaultProjLoc` / `defaultDuration: string` — 폼 초기값 4종
- `defaultRisks: string[3]` — 초기 선택 (riskOptions 부분집합)
- `projTypePlaceholder` / `uploadHint: string`
- `ragDocs: {name,hits:number}[5]` / `ragTags: string[6]`
- `checklist: string[7]` / `laws: string[5]` — **실재하는 법령만**(법조문 창작 금지)
- `orgLeader` / `orgManager: string` / `orgMembers: string[2]`
- `emergencySteps: {label,sub,color:tailwind bg클래스}[4]`
- `planSections: {sub,items:string[3]}[3]`
- `dept` / `docNum` / `brandLine` / `logoSrc` / `logoAlt` / `apvRef` / `periodRange: string`

## agent-dataanalysis (DataAnalysisAgent.jsx)
- `sampleFiles: {id,name,rows,cols,size}[3]`
- `trendCaption: string` / `trendData: {month,...seriesKey}[9]` / `trendSeries: {key,color}[3]` / `trendDomain:[lo,hi]` / `trendRef:number|null` / `trendRefLabel`
- `barTabLabel` / `barCaption` / `barData` / `barXKey` / `barValueKey` / `barUnit`
- `stackTabLabel` / `stackCaption` / `stackData: {month,...}[3]` / `stackSeries: {key,color}[3]`
- `statsTable: {metric,value,change,status:'normal'|'high'|'warning'}[6]`
- `outlierSummary` / `docStandard` / `docStandardNote: string`

### agent-dataanalysis — 예측·최적화 확장 필드
전부 **선택**(미제공 시 해당 구획 비노출 → 다른 도메인 무영향).

- `analysisTypes: {id,label,desc,sections?}[]` — 분석 유형. **배열 첫 항목이 기본 선택값.**
  `sections`가 결과 화면 구성을 실제로 결정한다(생략 시 전 구획 노출 = 하위 호환).
  사용 가능 키: `stats` 기술통계표 · `charts` 시각화 · `predict` · `optim` · `rul` · `invest` · `report` 리포트 생성
- `predictPanel` — 조건에 따른 결과 사전 예측
  `{ title, modelName, metrics:{label,value}[], features:{name,weight(0~1)}[], matrix:{label,count,note}[], note }`
  ※ `weight` 합이 1.0이 되게, `matrix`는 metrics의 정밀도·재현율과 산술적으로 맞을 것
- `optimPanel` — 목표 달성을 위한 최적 변수·조건 도출
  `{ title, target, params:{name,current,recommended,delta}[], effects:{label,before,after}[], tradeoffs:string[], validation }`
  ※ `tradeoffs`(감수할 영향)와 `validation`(검증 절차·사람 승인 지점)은 생략하지 말 것 — 없으면 과장된 데모가 된다
- `rulPanel` — 설비·시설물 이상 및 유지보수 시점 예측
  `{ title, asOf, horizonDays, items:{equip,status:'danger'|'warn'|'normal',verdict,rulDays,basis,action}[], note }`
  ※ 잔여수명 막대는 `rulDays / horizonDays` 비율로 그려진다
- `investPanel` — 투자·설비 선정 적정성
  `{ title, options:{name,capex,quality,saving,payback,verdict:'추천'|'조건부'|'보류'}[], rationale, note }`
  ※ `payback`은 `capex / saving`과 맞아야 한다(검수자가 가장 먼저 검산하는 값)

## agent-dbquery (DBQueryAgent.jsx)
- `headerTitle` / `headerSubtitle` / `dbStatusLabel` / `emptyTitle: string`
- `dbSources: {key,label,desc}[3]` — **key는 `building`|`land`|`lup` 고정**(코드가 아이콘·결과 테이블 형태를 이 키로 고른다). 라벨·설명은 도메인 언어로 바꾸되 key는 건드리지 말 것
- `permissionLevels: {id,label,desc,badge}[3]` — **id는 `general`|`manager`|`evaluator` 고정**
- `permissionNotices: {general,manager,evaluator}`
- `queryHistory: {id,query,date,rows,ms}[4]` / `quickQueries: string[4]`
- `buildingRows[8]` / `landRows[5]` / `lupRows[5]` — 소스별 결과 행
- `buildingColumns: {key,label}[8]`(key=행 필드명, 정렬 연동) / `landColumns: string[7]` / `lupColumns: string[5]`
- `sqlMap: {building,land,lup}` — SQL 문자열
- `statsBySource: {building|land|lup: {label,value,icon:'table'|'filter'|'trend'|'clock'|'shield',color}[4]}`
- `restrictedNotice: string`

### agent-dbquery — 조회 근거 확장 필드
전부 **선택**(미제공 시 해당 패널 비노출). 소스 키는 `dbSources`와 동일.
- `interpretBySource: {…: {terms:[{phrase,column,op,value,note}], assumptions:[string], unmapped:[string]}}`
  — 자연어를 어떤 조건으로 옮겼는지. `assumptions`는 질의에 없어 AI가 채운 값, `unmapped`는 변환하지 못한 표현(정직 표기)
- `planBySource: {…: {steps:[{op,detail,rows,ms}], totalMs, note}}` — 실행 계획 아코디언
- `freshness: [{label,table,syncedAt,lag,rows,status:'ok'|'warn'|'bad'}]` — 소스별 최종 동기화
- `qualityFlags: [{level:'bad'|'warn'|'info',label,detail}]` — 결과 해석 시 주의(결측·NULL·기한 초과 등)
- `nextActions: [{label,agentId,reason}]` — 결과를 넘길 후속 에이전트(코어가 `onNavigate`로 이동)

## agent-address (AddressAgent.jsx)
- `headerTitle` / `headerDesc` / `headerStatus: string` — 화면 헤더·연결 표시
- `defaultAddress` / `addressPlaceholder` / `quickExamples: string[3]`
- `defaultAptQuery` / `aptPlaceholder` / `aptQuickExamples: string[3]`
- `aptLookupResult` — 단지/집합 시설 조회 결과 객체
- `singleResult` — 단건 변환 결과(도로명·지번·좌표·법정/행정 코드·매칭 상태 `'완전매칭'|'부분매칭'`)
- `sampleBatch: string`(개행 5줄) / `batchResults[5]`
- `modeTypes: {m,icon,label,desc,color}[4]` — **`m`은 `single`|`batch`|`ocr`|`reverse` 고정**이나 `{m:'master', color:'indigo'}` 확장 항목 추가 가능. **배열 첫 항목이 기본 선택 유형**이므로 도메인 대표 기능을 앞에 둘 것
- `ocrDocText: string` / `ocrAddrResults[5]` / `ocrFeatureLabel: string` — OCR 업로드 존 강조 문구(도메인 문서 유형)
- `codeLookup: {코드10자리:{type,dong,road,jibun,zip,legalCode,adminCode,…,region}}` / `codeQuickExamples: {code,label}[3]`

### agent-address — `masterMapping` (선택, 생략 시 master 카드 자동 비노출)
하위 절도 전부 선택:
- `subtitle`, `pipeline:[{label,sub,ms}]`(생략 시 코어 기본 4단계)
- `scopes:[{key,label,count,desc}]` — 대상 소스 선택 칩(선택 수가 시작 버튼에 표시)
- `summary:[{label,value,sub,tone:'base'|'warn'|'bad'}]` — 진단 지표 카드
- `readiness:{level,max,label,note,levels:[string]}` — 성숙도 게이지(levels 길이는 max와 맞출 것)
- `naming:{pattern,example,note,segments:[{seg,label,desc}]}` — 표준 명명규칙 분해
- `rows:[{src,srcSystem,suggest,name,unit,conf,status:'auto'|'review'|'none',basis:[{label,detail}],alts:[{code,name,conf,reason}],convert}]`
  (**status 3종 고정.** `suggest:''` + `status:'none'`이면 '후보 없음'으로 렌더)
- `reasons:[{label,count,action}]` — 사유 분포 바(합계를 summary의 미매칭 수와 일치시킬 것)
- `crossMatch:{systems:[string],cells:[[number|null]]}` — 정사각 매트릭스, 대각선은 null
- `apply:{label,before,after,autoCount,reviewCount,note}` — 반영 버튼(누르면 auto 행이 '반영됨')

## agent-knowledge (KnowledgeAgent.jsx)
- `defaultQuery: string`(`aiSummaries` 키와 일치 권장) / `quickQueries: string[4]`
- `knowledgeBases: {id,name,docs,updated,icon(lucide),color}[7]` / `defaultSelectedKbIds: string[]`
- `recentSearches: {id,query,date,results}[3]`
- `results: {id,title,source,page,score,secLevel,line,excerpt,keywords[]}[5]` — score 내림차순
  - `results[].attrs: {label,value,match:boolean}[]` — **선택**. 속성 매칭 배지. 생략 시 미노출
- `aiSummaries: {[질의문]:요약문, DEFAULT:폴백}` / `similarDocs: {title,source,relevance}[3]`
- `outline` — **선택**(생략 시 패널 비노출). 검색 결과로 초안을 산출하는 도메인용
  `{ title, badge, subtitle, shape:{viewBox, paths:[{d,stroke?,fill?,width?,dash?}], labels:[{x,y,text,size?,color?,anchor?}]}, specs:[{label,value,from}], checks:[{label,status:'ok'|'warn'|'fail',detail}], effect:{label,before,after,delta}, note }`

### agent-knowledge — `ontologyPack` (선택, Graph RAG)
`nodes`와 `edges`가 **모두** 있을 때만 검색 방식에 `온톨로지 Graph RAG`가 노출된다. 설계 근거: [ADR-13](DECISIONS.md)
- 메타: `{label, version, statusLabel, maxDepth, notice, defaultSummary}`
- `queryIntents: {id,label,keywords[],focusNodeIds[],evidenceRefs[],summary}[]`
- `nodes: {id,label,type,aliases?[],keywords?[],evidenceRefs?[]}[]`
- `edges: {id,from,to,label,inverseLabel?,evidenceRefs[]}[]` — `from`/`to`는 `nodes.id`, `evidenceRefs`는 `evidence.id`와 일치
- `evidence: {id,kbId,title,source,page,line,secLevel:'O'|'S'|'C',excerpt,keywords[]}[]` — `kbId`는 `knowledgeBases.id`와 일치
- 조회기는 도메인 중립 결정적 구현(`src/user/ontologyGraph.js`). 실서비스에서는 같은 결과 계약을 반환하는 온프레미스 Graph RAG/MCP 호출로 교체한다.
- 법률·기한·수치 관계는 **원문 청크가 검증된 것만** 넣는다. 상충하는 규칙을 하나로 합치지 않는다.
- 참조 무결성·대표 질의는 `npm run check:ontology`가 검사한다(CI 게이트).

## agent-summary (SummaryAgent.jsx)
- `docAName` / `docBName` / `resultDocLabel` / `resultCompareLabel: string`
- `structureHints: string[4]` / `summaryStats: {label,val}[4]` / `compareStats: {label,val}[4]`
- `compareRows: {category,docA,docB,diff}[8]` — `diff`가 `'동일'`이면 회색
- `docALabel` / `docBLabel` / `compareFootnote: string`
- `tableSummaryRows: {ch,content,key}[5]` / `keywords: {word,pct}[12]`
- `sections: {id,title,children:string[]}[5]`
- `summaryContent: string` — `**헤더**\n본문` 블록을 `\n\n`으로 구분

## agent-meeting (MeetingMinutesAgent.jsx)
- `defaultTitle` / `defaultDate`(YYYY-MM-DD) / `defaultPlace: string`
- `defaultAttendees: {name,dept,role}[4]` / `defaultAgenda: string[2]`
- `sttSampleText: string` — 공백 구분 STT 스트리밍
- `diarization: {time,speaker,color,bg,border,text,docKey,meetingText}[8]` — `docKey`는 `docSections.key`와 일치
- `docSections: {key,num,label,brief,color}[7]` / `speakerLegend: {name,color,bg,border}[4]`
- `actions: {label,person,dept,due}[4]` / `deptName` / `docNum: string`
- `openingLines: string[2]` / `agendaDiscussions: {lines:string[],conclusion}[2]` / `decisions: string[3]` / `specialNotes: string[2]`
- `footerText` / `logo`(data URI) / `logoAlt` / `resultText` / `apvLine[3]`

## agent-ocr (OCRAgent.jsx)
- `sampleFiles: {name,size,pages,type:'pdf'|'img'}[2]`
- `docModeOptions: {value:'standard'|'compensation'(고정),label,desc}[2]`
- `specialModeKeyword` / `specialModeDesc` / `specialModeBadge: string`
- `extractedText` / `maskedText: string`(멀티라인, 서로 대응)
- `maskLog: {type,original,masked,pos}[4]`
- `tableData: {headers:string[6], rows:string[6][5]}` / `tableCaption: string`
- `confidenceMap: {line,score,level:'high'|'med'|'low'}[10]`

## agent-internalreg (InternalRegAgent.jsx)
- `regCategories: string[8]` / `defaultCategories: string[2]` / `suggestions: string[5]`
- `ragDocs: {name,hits}[5]` / `apvLine: {role,name,dept,title}[3]`
- `answerText: string`(멀티라인) / `citations: {doc,title,excerpt}[3]` / `relatedRegs: {title,desc}[3]`
- `regHistory: {reg,changes:{ver,date,type,badge,content,reason}[]}[3]`
- `emptyDesc: string[2]` / `inputPlaceholder` / `regSystemFooter` / `apvDocTitle` / `apvDocNum: string`

## agent-chatbot (ChatbotAgent.jsx)
- `welcomeText: string`(마크다운) / `welcomeSources: string[]`(`sourcePreviews` 키와 일치 시 미리보기)
- `sourcePreviews: {[출처명]:{title,type:'PDF'|'LAW'|'HWP',pages?,page?,section?,article?,excerpt:{text,hl}[]}}`
- `faqItems: {id,q,category,a,sources[]}[6]` — `category`는 `faqCategories`와 일치
- `faqCategories: string[5]`('전체'는 코어 자동 추가) / `faqCategoryColors: {[category]:배지클래스}`
- `delegateRules: {keywords[],agentId,agentName,reason}[6]`
- `correctionExample: string` / `suggestQuestions: string[3]`(`faqItems.q`와 일치 시 FAQ 매칭)
- `fallbackAnswerBody: string` / `fallbackSources: string[2]`
- `headerSubtitle` / `inputPlaceholder: string` / `quickAgents: {label,id,color}[3]`

## agent-report (ReportAgent.jsx)
- `apvLine: {name,dept,title,role}[3]` — [0]이 작성자
- `reportTypes: {id,label,icon(이모지),desc}[5]` — 첫 항목 초기 선택
- `docNums: {[typeId]:문서번호}` / `docNumFallback: string`
- `reportDefaults: {[typeId]:{dept,period,mainWork,nextPlan,special}}`
- `reportDate` / `pressDate` / `pressDistDate` / `approvalSystem` / `apvRefNo: string`
- `logo: dataURI` / `logoAlt: string`
- `perfCharts: {[typeId]:{label,data[3]}}` / `perfDoneKey` / `perfGoalKey`
- `pressTypeId: string` — 보도자료 레이아웃을 쓰는 유형 id
- `pressKpiTitle` / `pressKpiCards[4]` / `pressKpiStats[3]`
- `pressTrendTitle` / `pressTrendData[3]` / `pressTrendSeries[3]` / `pressTrendDomain`
- `pressBarTitle` / `pressBarData[5]` / `pressBarSeries: {key,color,posColor}[3]`
- `pressSections: {num,title,regions[3],details[3]}[3]`
- `pressIndexTitle` / `pressIndexHead[5]` / `pressIndexGroups: {label,rows[3]}[3]` / `pressIndexNote`
- `pressRatioTitle` / `pressRatioData` / `pressRatioLeftKey` / `pressRatioLeftDomain` / `pressRatioThreshold` / `pressRatioRefLabel` / `pressRatioNote` / `pressContact`
- `buildPressHtml(args, C, org)` / `buildReportHtml(args, C, org)` — 인쇄용 HTML 생성 함수.
  본문은 `C`(= 병합된 콘텐츠)의 `press*`·`report*` 키에서 생성되고 조직 표기·색은 `org`에서 오므로 **팩은 보통 데이터만 공급하면 된다.** 레이아웃 자체를 바꾸려면 함수를 통째 교체할 수 있다.

---

## 코어 승격 필드 (agentContent 밖 — 팩 최상위)

- `secureSuggestions` — SECURE 탭 제안 4개 `(icon,iconBg,iconColor,title,query)` — 선택
- `modeAnswers: { REVIEW, TRANSLATE, REPORT, SECURE_DEFAULT, SECURE_AIRGAP }` — 각각 `{content,citations:[],steps}` answer 객체, REPORT는 `document` 필드 가능 — 선택
- `fileData: { d1:{title,date,secLevel,text,highlights[]}, … }` — 인용 뷰어 원문. **키는 `docs[].id`와 일치**해야 원문이 열린다 — 선택
- `selfChecks: { [docType]: [...] }` — 문서 상신 전 자가점검 항목(`SelfCheckModal.jsx`). 생략 시 코어 기본 항목
- `generateDocHTML(doc, org)` — `org = {name, short, color, en}`이 자동 주입된다(UserApp). 팩 작업 불필요. `doc.sealText`로 직인 문구 교체 가능
