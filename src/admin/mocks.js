// 관리자 mock 데이터 (App.jsx에서 분리)
// 관리자 데모 페르소나 — 사이드바·작성자·프로필 등 전역 사용 (팩 adminContent.ADMIN_PERSONA로 교체)
export let ADMIN_PERSONA = { name: '한지훈', role: '관리자', dept: '디지털계획처 AI인프라부', email: 'han@ex.co.kr' };

export let MOCK_GPU_NODES = [
  { id:'node-01',name:'roadq-ai-01',model:'NVIDIA H200 NVL',count:4,memory:'141GB',
    gpus:[{id:0,util:82,memUtil:65,temp:72,power:650},{id:1,util:78,memUtil:62,temp:70,power:640},{id:2,util:95,memUtil:88,temp:78,power:680},{id:3,util:45,memUtil:30,temp:55,power:320}]},
  { id:'node-02',name:'roadq-ai-02',model:'NVIDIA H200 NVL',count:4,memory:'141GB',
    gpus:[{id:0,util:12,memUtil:10,temp:45,power:210},{id:1,util:5,memUtil:8,temp:42,power:190},{id:2,util:0,memUtil:2,temp:38,power:150},{id:3,util:0,memUtil:2,temp:38,power:150}]},
  { id:'node-03',name:'roadq-db-01',model:'NVIDIA L40S',count:4,memory:'48GB',
    gpus:[{id:0,util:32,memUtil:45,temp:58,power:210},{id:1,util:28,memUtil:40,temp:56,power:190},{id:2,util:15,memUtil:20,temp:45,power:120},{id:3,util:10,memUtil:15,temp:42,power:110}]},
];

export let MOCK_EMBEDDING_JOBS = [
  {id:950,name:'도로설계기준 임베딩 v3',plan:'KoE5-base',creator:'한지훈',dept:'AI인프라부',date:'2026-09-03 14:51:32',gpu:'A100 x1',tbStatus:'실행 중',status:'학습 완료'},
  {id:910,name:'도로유지관리지침 임베딩 v2',plan:'KoE5-base',creator:'이도현',dept:'데이터플랫폼부',date:'2026-08-21 22:35:46',gpu:'A100 x1',tbStatus:'실행 중',status:'학습 완료'},
  {id:895,name:'내규·지침 통합 임베딩 v4',plan:'KoE5-large',creator:'임하늘',dept:'경영지원처',date:'2026-08-12 19:59:20',gpu:'A100 x2',tbStatus:'중지됨',status:'취소됨'},
  {id:874,name:'노선·구간 기준정보 임베딩 v1',plan:'KoE5-base',creator:'김태우',dept:'수도권본부 도로교통부',date:'2026-08-12 19:40:26',gpu:'A100 x1',tbStatus:'중지됨',status:'학습 완료'},
  {id:856,name:'교량 계측 리포트 임베딩 v2',plan:'BGE-m3-ko',creator:'정민석',dept:'시설처 구조물관리부',date:'2026-08-05 12:00:38',gpu:'A100 x1',tbStatus:'중지됨',status:'학습 완료'},
  {id:853,name:'도로이용 불편신고 사례 임베딩 v1',plan:'BGE-m3-ko',creator:'노유진',dept:'고객지원부',date:'2026-08-04 11:37:59',gpu:'A100 x1',tbStatus:'중지됨',status:'오류 발생'},
  {id:847,name:'법령·판례 임베딩 v2',plan:'KoE5-large',creator:'강민철',dept:'법무실',date:'2026-07-11 21:42:03',gpu:'A100 x2',tbStatus:'중지됨',status:'대기 중'},
  {id:844,name:'교통안전 매뉴얼 임베딩 v1',plan:'KoE5-base',creator:'박선영',dept:'교통센터 상황관리부',date:'2026-07-11 20:58:53',gpu:'A100 x1',tbStatus:'중지됨',status:'오류 발생'},
  {id:838,name:'노면기상(RWIS) 관측기준 임베딩 v1',plan:'KoE5-base',creator:'조한별',dept:'도로교통연구원',date:'2026-07-11 20:46:38',gpu:'A100 x1',tbStatus:'중지됨',status:'오류 발생'},
];

export let MOCK_MCP_TOOLS = [
  {id:162,name:'Search',desc:'사내 지식베이스 시맨틱 검색',creator:'한지훈',dept:'AI인프라부',date:'2026-08-22 22:06:28'},
  {id:159,name:'Web Search',desc:'검색 분야 설정 + 검색 분량 설정 추가',creator:'이도현',dept:'데이터플랫폼부',date:'2026-08-16 10:59:32'},
  {id:158,name:'Web Crawler',desc:'국토교통부 고시·기상청 특보 수집',creator:'강민철',dept:'법무실',date:'2026-08-14 18:36:52'},
  {id:155,name:'Dynamic SearchFilter',desc:'보안등급별 검색 결과 필터링',creator:'임하늘',dept:'경영지원처',date:'2026-08-13 15:27:50'},
  {id:153,name:'Dynamic Filter',desc:'부서 권한 기반 응답 필터링',creator:'김태우',dept:'수도권본부 도로교통부',date:'2026-08-10 18:01:51'},
  {id:151,name:'CodeDev',desc:'시계열 분석 코드 실행 샌드박스',creator:'윤서진',dept:'인재개발원',date:'2026-07-19 14:28:00'},
  {id:150,name:'DocConverter',desc:'HWP·PDF 문서 변환기',creator:'강민철',dept:'법무실',date:'2026-07-17 16:24:45'},
  {id:148,name:'SearchFilter',desc:'교통데이터 검색 범위 제한',creator:'이도현',dept:'데이터플랫폼부',date:'2026-07-11 17:56:05'},
  {id:146,name:'RouteGeocoder',desc:'노선·이정(k) 좌표 변환',creator:'조한별',dept:'도로교통연구원',date:'2026-07-05 16:17:30'},
  {id:145,name:'Outlier_Test',desc:'VDS 결측·이상치 검정',creator:'조한별',dept:'도로교통연구원',date:'2026-07-05 14:46:54'},
];

export let MOCK_MODELS = [
  {id:'gpt-oss',name:'GPT-OSS-120B',param:'120B',context:'128K',quant:'None (FP16)',status:'Running',loaded:'Node-01'},
  {id:'llama-3',name:'Llama-3-Kor-Instruct',param:'70B',context:'8K',quant:'AWQ-4bit',status:'Running',loaded:'Node-01'},
  {id:'exaone',name:'EXAONE-3.0-7.8B',param:'7.8B',context:'32K',quant:'FP16',status:'Running',loaded:'Node-02'},
  {id:'gemma',name:'Gemma-2-9B-It',param:'9B',context:'8K',quant:'GGUF-Q8',status:'Stopped',loaded:'-'},
  {id:'solar',name:'Solar-10.7B-v1.0',param:'10.7B',context:'4K',quant:'GGUF-Q5',status:'Running',loaded:'Node-02'},
];

export let MOCK_PROMPTS = [
  {id:385,name:'[전용] 돌발상황 대응 RAG',desc:'돌발상황 판단·대응 절차 질의 응답용 RAG 프롬프트',dept:'교통센터 상황관리부',date:'2026-08-22 10:41:12'},
  {id:384,name:'데이터 품질 점검 리포트 프롬프트',desc:'VDS 결측·적재 지연 점검 결과 보고 초안 생성',dept:'데이터플랫폼부',date:'2026-08-20 10:54:11'},
  {id:383,name:'[전용] 나만의 RAG',desc:'개인 지식영역 기반 전용 채팅',dept:'AI인프라부',date:'2026-08-15 14:10:12'},
  {id:382,name:'보도자료 요약 프롬프트',desc:'주간 보도자료 3줄 요약 생성',dept:'홍보실',date:'2026-08-15 04:30:28'},
  {id:381,name:'신입 교육용 프롬프트',desc:'도로관리 업무 입문 교육 질의응답 자료',dept:'인재개발원',date:'2026-08-15 04:27:45'},
  {id:380,name:'[전용] 지침 원문 뷰어',desc:'전용 채팅 기능(지침 원문 인용·페이지 이동)',dept:'경영지원처',date:'2026-08-13 18:30:11'},
  {id:378,name:'[전용] 보고서 자동 생성',desc:'전용 채팅 기능(주간 소통량 실적 보고 서식)',dept:'도로교통연구원',date:'2026-08-06 18:11:50'},
];

export let MOCK_CHAT_APPS = [
  {id:1663,name:'돌발상황 대응 챗봇',type:'전용 채팅',status:'Online',deploy:'배포',creator:'박선영',dept:'교통센터 상황관리부',addr:'/apps/incident-chat'},
  {id:1662,name:'결빙 예보 안내 봇',type:'전용 채팅',status:'Online',deploy:'배포',creator:'오재현',dept:'도로처',addr:'/apps/ice-forecast'},
  {id:1661,name:'내규 Q&A 봇',type:'전용 채팅',status:'Online',deploy:'배포',creator:'임하늘',dept:'경영지원처',addr:'/apps/reg-qa'},
  {id:1656,name:'데이터 품질 점검 도우미',type:'전용 채팅',status:'Online',deploy:'배포',creator:'이도현',dept:'데이터플랫폼부',addr:'/apps/dq-check'},
  {id:1655,name:'통행료 문의 봇 (시범)',type:'전용 채팅',status:'Offline',deploy:'배포중지',creator:'노유진',dept:'통행료사업처',addr:'/apps/toll-guide'},
  {id:1650,name:'정비 작업지시 초안 봇',type:'전용 채팅',status:'Online',deploy:'배포',creator:'정민석',dept:'시설처 구조물관리부',addr:'/apps/work-order'},
  {id:1649,name:'교통통계 조회 어시스턴트',type:'전용 채팅',status:'Online',deploy:'배포',creator:'조한별',dept:'도로교통연구원',addr:'/apps/traffic-stats'},
  {id:1645,name:'리모트 RAG 채팅',type:'전용 채팅',status:'Offline',deploy:'배포중지',creator:'한지훈',dept:'AI인프라부',addr:'/apps/remote-rag'},
  {id:1643,name:'불편신고 응대 지원 봇',type:'전용 채팅',status:'Online',deploy:'배포',creator:'노유진',dept:'고객지원부',addr:'/apps/complaint-support'},
  {id:1640,name:'공사구간 안전점검 챗봇',type:'전용 채팅',status:'Online',deploy:'배포',creator:'김태우',dept:'수도권본부 도로교통부',addr:'/apps/workzone-safety'},
];

export let MOCK_NODES = [
  {name:'roadq01',instance:'192.123.12.123:1234',os:'Linux',version:'X (Core)',release:'3.10.0-1234.12.1.el1.x86_64',cpu:0.28,mem:4.6},
  {name:'roadq02',instance:'192.123.12.123:1234',os:'Linux',version:'X (Core)',release:'3.10.0-1234.12.1.el1.x86_64',cpu:13.0,mem:43.2},
  {name:'roadq03',instance:'192.123.12.123:1234',os:'Linux',version:'X (Core)',release:'3.10.0-1234.12.1.el1.x86_64',cpu:4.69,mem:18.4},
];

export let MOCK_GUARDRAIL_LOGS = [
  {id:1,time:'2026-09-03 11:23:45',user:'김태우',query:'통행료 원가 산정 내부자료 알려줘',rule:'기밀정보 요청',action:'차단'},
  {id:2,time:'2026-09-03 10:15:22',user:'노유진',query:'민자고속도로 운영사 내부 수익자료 분석해줘',rule:'경쟁정보 수집',action:'차단'},
  {id:3,time:'2026-09-02 16:42:11',user:'박선영',query:'직원 급여 전체 목록',rule:'개인정보 접근',action:'차단'},
  {id:4,time:'2026-09-02 14:30:05',user:'윤서진',query:'보안 시스템 우회 방법',rule:'보안 우회 시도',action:'차단'},
  {id:5,time:'2026-09-01 09:12:33',user:'임하늘',query:'퇴직자 연락처 전체',rule:'개인정보 접근',action:'경고'},
];

/* ==================== 보안 아키텍처 (제어망/업무망 경계·외부 접근) ====================
   발주처가 AI 도입에서 가장 크게 우려하는 지점: 어떤 데이터가 어느 망에서
   어디까지 가는가. 교통 시계열은 제어망(EXTIS)에서 수집돼 업무망 분석계로
   내려오고, 외부 상용 LLM 질의는 보안 게이트웨이를 반드시 경유한다. */
export let MOCK_DATA_FLOWS = [
  {id:'df-1',name:'EXTIS 교통 시계열 수집·적재',source:'VDS·프로브 수집 서버',zone:'제어망(EXTIS)',processedAt:'EX-DataLake 적재 파이프라인',dest:'업무망 분석계',crossing:false,dataClass:'내부',volume:'일 2,840만 건(5분 집계)',encryption:'전송 TLS 1.3 · 저장 AES-256',status:'정상'},
  {id:'df-2',name:'도로 지침·기준 RAG 검색',source:'업무망 문서서버(EDMS)',zone:'업무망',processedAt:'내부 GPU 서버',dest:'업무망 사용자',crossing:false,dataClass:'내부',volume:'일 12,400건',encryption:'전송 TLS 1.3 · 저장 AES-256',status:'정상'},
  {id:'df-3',name:'플래그십 모델 질의(보안 게이트웨이 경유)',source:'사용자 질의',zone:'업무망',processedAt:'외부 상용 LLM',dest:'업무망 사용자',crossing:true,dataClass:'공개',volume:'일 840건',encryption:'전송 TLS 1.3 · 민감정보 마스킹 후 전송',status:'통제 중'},
  {id:'df-4',name:'기상청 노면기상 특보 수집(RWIS 연계)',source:'기상청 공개 API',zone:'외부망',processedAt:'DMZ 수집 서버',dest:'내부 지식베이스',crossing:true,dataClass:'공개',volume:'10분 주기 배치',encryption:'단방향 반입(내부→외부 요청 없음)',status:'정상'},
];
export let MOCK_BOUNDARY_POLICY = [
  {grade:'기밀',  label:'C', internal:'허용', gateway:'차단',   external:'차단', note:'내부 GPU에서만 처리. 외부 모델 경유 자체가 차단된다'},
  {grade:'대외비',label:'S', internal:'허용', gateway:'조건부', external:'차단', note:'마스킹 후에만 게이트웨이 경유 허용, 승인 이력 필수'},
  {grade:'내부',  label:'I', internal:'허용', gateway:'허용',   external:'차단', note:'외부 직접 전송은 불가'},
  {grade:'공개',  label:'O', internal:'허용', gateway:'허용',   external:'허용', note:'제한 없음'},
];
export let MOCK_EXTERNAL_ACCESS = [
  {id:'ex-1',org:'유지보수 협력사 A',user:'외부 담당자 1',scope:'작업지시 이력 조회',grade:'내부',expires:'2026-12-31',mfa:true,lastAccess:'2026-09-18 10:22',status:'활성'},
  {id:'ex-2',org:'교량 계측 위탁사 B',user:'외부 담당자 2',scope:'교량 계측 데이터 제출',grade:'내부',expires:'2026-11-30',mfa:true,lastAccess:'2026-09-17 16:40',status:'활성'},
  {id:'ex-3',org:'외부 연구기관',user:'연구원 1',scope:'집계 통계 열람(원본 불가)',grade:'공개',expires:'2026-10-31',mfa:true,lastAccess:'2026-09-15 09:12',status:'활성'},
  {id:'ex-4',org:'유지보수 협력사 C',user:'외부 담당자 3',scope:'작업지시 이력 조회',grade:'내부',expires:'2026-08-31',mfa:false,lastAccess:'2026-08-30 14:05',status:'만료'},
];

/* ==================== 예측 모델 운영(MLOps) ====================
   LLM과 별개로, 도로 예측 모델(통행속도·결빙·이상탐지)은 시간이 지나면 반드시
   열화한다. 계절·교통패턴 등 입력 분포가 변하기 때문이다. 그 감시·재학습을
   다루는 데이터. 코어 기본값이 곧 도로공사 기준이고 팩이 자기 모델을 공급한다. */
export let MOCK_PRED_MODELS = [
  {id:'pm-1',name:'통행속도 예측 모델',task:'시계열 회귀',version:'v2.3',deployed:'2026-07-02',
   metricName:'MAE(km/h)',baseline:4.2,current:4.7,threshold:5.0,status:'정상',
   samples:'일 2,840만 건',owner:'데이터플랫폼부',nextRetrain:'2026-10-02'},
  {id:'pm-2',name:'노면결빙 예측 모델',task:'이진분류',version:'v1.8',deployed:'2026-05-26',
   metricName:'F1',baseline:0.91,current:0.86,threshold:0.85,status:'주의',
   samples:'월 3,600건',owner:'도로교통연구원',nextRetrain:'재학습 검토 중'},
];
// 성능 추이 — 배포 후 월별 (드리프트를 눈으로 보여주는 재료)
export let MOCK_PRED_TREND = [
  {month:'2026.03','통행속도 예측 모델':4.2,'노면결빙 예측 모델':0.91},
  {month:'2026.05','통행속도 예측 모델':4.3,'노면결빙 예측 모델':0.90},
  {month:'2026.07','통행속도 예측 모델':4.5,'노면결빙 예측 모델':0.88},
  {month:'2026.09','통행속도 예측 모델':4.7,'노면결빙 예측 모델':0.86},
];
// 입력 데이터 드리프트 — 성능이 왜 떨어지는지의 원인 후보
export let MOCK_PRED_DRIFT = [
  {feature:'VDS 결측 구간 분포',psi:0.28,level:'주의',note:'VDS-0010-0247 통신 불량 3일 누적 — 드리프트 지수 +0.9 (임계 1.0)'},
  {feature:'차로별 점유율',psi:0.11,level:'정상',note:'유의미한 변화 없음'},
  {feature:'관측 시간대 분포',psi:0.07,level:'정상',note:'유의미한 변화 없음'},
];
// 재학습 이력 — 챔피언/챌린저 비교와 승격 여부
export let MOCK_RETRAIN_RUNS = [
  {id:'rt-1',model:'노면결빙 예측 모델',trigger:'성능 임계 근접',started:'2026-09-15 02:00',
   champion:0.86,challenger:0.90,verdict:'승격 대기',note:'검증셋 개선 확인, 담당자 승인 후 배포'},
  {id:'rt-2',model:'통행속도 예측 모델',trigger:'정기(분기)',started:'2026-07-02 02:00',
   champion:5.1,challenger:4.2,verdict:'승격 완료',note:'ex-speed-lstm v2.3으로 배포됨'},
];

/* ==================== 데이터 카탈로그 · 리니지 ====================
   "어떤 데이터 자산이 있고(카탈로그), 그게 어디서 와서 어디로 가는가(리니지)".
   답변 근거의 역추적·표준화 진척·망 경계 통과 여부가 전부 여기에 걸린다.
   코어 기본값이 곧 도로공사 기준이고 팩이 자기 자산을 공급한다. */
export let MOCK_DATA_ASSETS = [
  {id:'as-1',name:'VDS 5분 집계 시계열',source:'EXTIS 수집 서버',owner:'데이터플랫폼부',grade:'내부',
   format:'시계열 테이블',volume:'일 2,840만 행',cycle:'5분',freshness:'4분 12초 전',quality:95,standardized:100,
   tags:['TAG 대상','시계열'],consumers:['통행속도 예측','데이터 조회']},
  {id:'as-2',name:'도로 지침·기준 문서',source:'EDMS 문서관리시스템',owner:'도로처',grade:'내부',
   format:'PDF·HWP',volume:'문서 1,240건',cycle:'수시',freshness:'2일 전',quality:92,standardized:100,
   tags:['RAG 대상','지침'],consumers:['지식 검색','내규 조회']},
  {id:'as-3',name:'정비 작업지시서 스캔 이미지',source:'EXMMS 스캔·업로드',owner:'시설처 구조물관리부',grade:'내부',
   format:'이미지',volume:'월 286건',cycle:'수시',freshness:'1일 전',quality:71,standardized:45,
   tags:['OCR 대상'],consumers:['문서 인식(OCR)']},
];
export let MOCK_DATA_LINEAGE = {
  'as-1':{upstream:[{name:'VDS 검지기 원시 신호',type:'센서'},{name:'프로브 통행속도',type:'API'}],
    stages:[{name:'수집',desc:'EXTIS 5분 주기 수집',tool:'수집 커넥터'},
            {name:'정제',desc:'결측 보간·이상치 제거(현재 결측률 4.8%)',tool:'품질 규칙'},
            {name:'적재',desc:'EX-DataLake 시계열 테이블 적재',tool:'스트림 적재'}],
    downstream:[{name:'통행속도 예측 모델',type:'모델'},{name:'데이터 조회 에이전트',type:'에이전트'}]},
  'as-2':{upstream:[{name:'부서별 지침 원본',type:'파일'},{name:'개정 이력',type:'문서'}],
    stages:[{name:'수집',desc:'EDMS 연동 수집',tool:'커넥터'},
            {name:'청킹',desc:'조항 단위 분할(512토큰)',tool:'RAG 파이프라인'},
            {name:'임베딩',desc:'벡터 생성·색인',tool:'임베딩 엔진'}],
    downstream:[{name:'지식 검색 에이전트',type:'에이전트'},{name:'내규 조회 에이전트',type:'에이전트'}]},
  'as-3':{upstream:[{name:'스캔 원본',type:'이미지'}],
    stages:[{name:'전처리',desc:'기울기·노이즈 보정',tool:'이미지 전처리'},
            {name:'OCR',desc:'문자·표 인식',tool:'Vision OCR'}],
    downstream:[{name:'문서 인식 에이전트',type:'에이전트'}]},
};

/* ==================== 지식 증강 전략 (RAG · CAG · TAG) ====================
   셋은 경쟁 관계가 아니라 용도가 다른 도구다.
     RAG 검색 후 생성 — 크고 검색이 필요한 비정형 지식(도로 지침·기준)
     CAG 캐시에 미리 적재해 검색 없이 생성 — 작고 잘 안 바뀌고 자주 참조되는 지식
     TAG 자연어를 SQL로 바꿔 실행 — 교통량·속도는 검색이 아니라 계산해야 한다
   어떤 질의를 어느 전략으로 보낼지(라우팅)와 그 결과를 관리하는 데이터. */
export let MOCK_AUG_STRATEGIES = [
  {id:'rag',name:'RAG',full:'Retrieval-Augmented Generation',desc:'벡터 검색으로 근거 문서를 찾아 답변',
   targets:['도로 지침·기준 문서'],share:62,avgLatency:1180,hitRate:88,costPer1k:'₩24',
   strength:'문서가 많고 자주 갱신돼도 대응',caveat:'검색 지연이 있고 청킹 품질에 좌우된다'},
  {id:'cag',name:'CAG',full:'Cache-Augmented Generation',desc:'지식을 캐시에 미리 적재해 검색 없이 답변',
   targets:['자주 쓰는 표준 서식·기준'],share:23,avgLatency:340,hitRate:95,costPer1k:'₩11',
   strength:'검색 단계가 없어 빠르고 답변이 일관된다',caveat:'적재 용량 한계 — 원문이 바뀌면 재적재해야 한다'},
  {id:'tag',name:'TAG',full:'Table-Augmented Generation',desc:'자연어를 SQL로 변환해 정형 데이터를 집계',
   targets:['VDS 5분 집계 테이블'],share:15,avgLatency:860,hitRate:91,costPer1k:'₩18',
   strength:'수치를 계산해 답하므로 집계·비교에 정확',caveat:'노선·이정 기준정보가 표준화돼 있어야 한다'},
];
// 라우팅 규칙 — 위에서부터 먼저 맞는 규칙이 적용된다
export let MOCK_AUG_ROUTES = [
  {id:'rt-1',order:1,when:'수치·집계·비교를 묻는 질의',keywords:'속도, 교통량, 결측률, 추이, 대비',strategy:'TAG',hits:1240,enabled:true},
  {id:'rt-2',order:2,when:'표준 서식·지침 조회',keywords:'기준, 절차, 지침, 시방, 주기',strategy:'CAG',hits:1860,enabled:true},
  {id:'rt-3',order:3,when:'그 외 문서 근거가 필요한 질의',keywords:'(기본 경로)',strategy:'RAG',hits:4920,enabled:true},
];
// CAG 캐시 적재 현황 — 원문이 바뀌면 무효화·재적재가 필요하다
export let MOCK_CAG_CACHE = [
  {id:'cc-1',name:'도로유지관리지침 요약본',tokens:'42K',loaded:'2026-09-15 02:10',sourceRev:'v4 (2026-09-14)',status:'최신',hits:1420},
  {id:'cc-2',name:'돌발상황 대응 절차',tokens:'28K',loaded:'2026-09-02 02:10',sourceRev:'v2 (2026-09-01)',status:'최신',hits:640},
  {id:'cc-3',name:'자주 묻는 질문 모음',tokens:'16K',loaded:'2026-08-08 02:10',sourceRev:'v7 (2026-09-12)',status:'재적재 필요',hits:310},
];
/* ==================== 중대재해처벌법 대응 ====================
   시행령 제4조의 안전보건 확보 의무 9개 호가 뼈대다.
   이 플랫폼의 값어치는 '문서를 새로 만드는 것'이 아니라, 도로 공사구간
   위험성평가·작업지시·교육·점검이 돌아가면서 이행 증빙이 자동으로 쌓인다는 데 있다. */
export let MOCK_SAFETY_DUTIES = [
  {id:'sd-1',clause:'제1호',name:'안전보건 목표·경영방침 설정',status:'이행',
   evidence:'2026년 안전보건 경영방침 공표',last:'2026-06-23',owner:'경영지원처',auto:false},
  {id:'sd-2',clause:'제2호',name:'안전보건 전담 조직 구성',status:'이행',
   evidence:'안전보건 전담 조직 지정서',last:'2026-06-28',owner:'경영지원처',auto:false},
  {id:'sd-3',clause:'제3호',name:'유해·위험요인 확인·개선 절차',status:'이행',
   evidence:'공사구간 위험성평가 실시 이력 (플랫폼 자동 축적)',last:'2026-09-15',owner:'안전보건처',auto:true},
  {id:'sd-4',clause:'제4호',name:'안전보건 예산 편성·집행',status:'이행',
   evidence:'2026년 안전보건 예산 집행 내역',last:'2026-09-18',owner:'경영지원처',auto:false},
  {id:'sd-5',clause:'제5호',name:'안전보건관리책임자 권한·평가',status:'주의',
   evidence:'반기 평가 미실시 — 하반기 평가 예정',last:'2026-06-07',owner:'경영지원처',auto:false},
  {id:'sd-6',clause:'제6호',name:'안전보건 전문인력 배치',status:'이행',
   evidence:'전문인력 배치 현황',last:'2026-07-19',owner:'경영지원처',auto:false},
  {id:'sd-7',clause:'제7호',name:'종사자 의견 청취 절차',status:'이행',
   evidence:'의견 접수·처리 이력 (플랫폼 자동 축적)',last:'2026-09-17',owner:'안전보건처',auto:true},
  {id:'sd-8',clause:'제8호',name:'중대재해 대응 매뉴얼',status:'이행',
   evidence:'비상 대응 매뉴얼 및 훈련 기록',last:'2026-08-01',owner:'안전보건처',auto:false},
  {id:'sd-9',clause:'제9호',name:'도급·용역·위탁 안전 평가기준',status:'주의',
   evidence:'유지보수 협력사 평가 기준 있음 — 최근 평가 미실시 1개사',last:'2026-07-15',owner:'조달구매부',auto:false},
];
// 위험성평가 이행 이력 — 플랫폼이 자동으로 남기는 증빙
export let MOCK_SAFETY_RISK_LOG = [
  {id:'rl-1',task:'차로 차단 포장 보수 작업',doc:'EX-안전보건처-2026-0214',assessed:'2026-09-15',by:'안전보건처',risks:3,actions:3,status:'조치 완료'},
  {id:'rl-2',task:'남한강교 교량 점검 고소작업',doc:'EX-안전보건처-2026-0198',assessed:'2026-09-01',by:'안전보건처',risks:4,actions:3,status:'조치 중'},
];
// 교육·점검 이력
export let MOCK_SAFETY_TRAINING = [
  {id:'tr-1',name:'정기 안전보건교육 (3분기)',target:'전 종사자',done:142,total:150,date:'2026-09-07',status:'진행 중'},
  {id:'tr-2',name:'신규 채용자 안전교육',target:'신규 입사자',done:8,total:8,date:'2026-08-23',status:'완료'},
];
/* ==================== 답변 재현성 스냅샷 ====================
   도로 안전·품질 기록은 장기 보존이고 감사 대상이다. 그런데 "그때 그 답변이
   왜 그랬나"는 질의·답변만 남겨선 재현되지 않는다 — 모델 버전, 지식베이스
   리비전, 검색된 근거 문서, 프롬프트·파라미터, 가드레일 규칙이 함께 있어야 한다.
   재현을 시도했을 때 지금 구성과 무엇이 달라졌는지 정직하게 보여주는 게 핵심이다. */
export let MOCK_REPRO_SNAPSHOTS = [
  {id:'sn-1',at:'2026-09-18 14:22',question:'결빙 취약구간 사전 제설 기준이 어떻게 되나요?',
   strategy:'CAG',model:'Llama-3-Korean 70B',modelVer:'v1.4',kbRev:'kb-2026.09.14',
   promptVer:'p-2.1',temp:0.2,guardrailVer:'g-1.8',confidence:92,
   sources:[{name:'돌발상황 대응 절차',rev:'v2 (2026-09-01)'}],
   reproducible:true,drift:[]},
  {id:'sn-2',at:'2026-09-11 09:05',question:'최근 한 달 경부선 하행 평균속도 추이를 알려주세요',
   strategy:'TAG',model:'GPT-OSS 120B',modelVer:'v2.2',kbRev:'kb-2026.09.07',
   promptVer:'p-2.0',temp:0.1,guardrailVer:'g-1.7',confidence:88,
   sources:[{name:'VDS 5분 집계 시계열',rev:'2026-09-11 마감'}],
   reproducible:false,drift:['모델 v2.2 → v2.3 교체됨','프롬프트 p-2.0 → p-2.1 개정','원천 테이블이 이후 재마감됨']},
  {id:'sn-3',at:'2026-07-29 16:40',question:'교량 신축이음 점검 지침 문서를 찾아주세요',
   strategy:'RAG',model:'GPT-OSS 120B',modelVer:'v2.1',kbRev:'kb-2026.07.15',
   promptVer:'p-1.9',temp:0.3,guardrailVer:'g-1.6',confidence:76,
   sources:[{name:'도로 지침·기준 문서',rev:'v3 (2026-07-11)'}],
   reproducible:false,drift:['지식베이스 재색인(kb-2026.07.15 → kb-2026.09.14)','가드레일 규칙 g-1.6 → g-1.8']},
];
// 보존 정책 — 감사 대응 기준
export let MOCK_REPRO_POLICY = {
  retentionYears: 5, captured: '전체 질의', excluded: '보안(무저장) 세션',
  items: ['질의·답변 원문', '모델 식별자·버전', '지식베이스 리비전', '검색된 근거 문서와 그 개정 버전',
          '프롬프트 템플릿 버전', '생성 파라미터', '가드레일 규칙 버전', '응답 신뢰도'],
};
// ==================== LLM ADMIN MOCK DATA ====================
export let MOCK_LLM_ADMIN_MODELS = [
  {id:'m-001',name:'GPT-OSS-120B',baseModel:'Meta-Llama-3-405B-Instruct',version:'v2.4.1',
   desc:'한국도로공사 특화 파인튜닝 대용량 LLM — 도로 지침 검색, 시계열 데이터 해석, 에이전트 업무 자동화 최적화',
   status:'Active',temperature:0.3,maxTokens:4096,topP:0.9,contextWindow:'128K',
   systemPrompt:'당신은 한국도로공사(EX)의 전문 AI 어시스턴트입니다.\n\n규칙:\n1. 반드시 도로 설계기준·유지관리지침을 우선 참조합니다.\n2. 불확실한 내용은 "확인이 필요합니다"로 답변합니다.\n3. 개인정보 및 보안 정보는 절대 제공하지 않습니다.\n4. 모든 답변은 공문서 형식을 따릅니다.',
   promptHistory:[
    {ver:'v2.4.1',date:'2026-09-03 14:30',author:'한지훈',note:'보안 규정 4항 추가',
     content:'당신은 한국도로공사(EX)의 전문 AI 어시스턴트입니다.\n\n규칙:\n1. 반드시 도로 설계기준·유지관리지침을 우선 참조합니다.\n2. 불확실한 내용은 "확인이 필요합니다"로 답변합니다.\n3. 개인정보 및 보안 정보는 절대 제공하지 않습니다.\n4. 모든 답변은 공문서 형식을 따릅니다.'},
    {ver:'v2.3.0',date:'2026-08-08 09:00',author:'서지우',note:'돌발상황 질의 처리 규칙 개선',
     content:'당신은 한국도로공사의 AI 어시스턴트입니다.\n\n도로 지침을 참조하여 답변하고, 불확실한 내용은 확인 필요 안내를 제공하세요.'},
    {ver:'v2.0.0',date:'2026-06-24 10:00',author:'한지훈',note:'초기 배포 버전',
     content:'한국도로공사 AI 어시스턴트입니다. 전문적이고 정확한 정보를 제공합니다.'},
  ]},
  {id:'m-002',name:'Llama-3-Kor-Instruct',baseModel:'Meta-Llama-3-70B',version:'v1.8.0',
   desc:'70B 한국어 특화 경량 모델 — HR 질의, 교육 안내 등 빠른 응답 업무에 활용',
   status:'Active',temperature:0.5,maxTokens:2048,topP:0.95,contextWindow:'8K',
   systemPrompt:'한국도로공사 직원 지원 AI입니다. 인사 규정, 복리후생, 교육 안내를 친절하게 제공합니다.',
   promptHistory:[
    {ver:'v1.8.0',date:'2026-08-25 11:00',author:'임하늘',note:'인사 규정 2026 개정 반영',
     content:'한국도로공사 직원 지원 AI입니다. 인사 규정, 복리후생, 교육 안내를 친절하게 제공합니다.'},
    {ver:'v1.5.0',date:'2026-06-03 09:00',author:'윤서진',note:'교육 안내 기능 추가',content:'한국도로공사 HR 어시스턴트입니다.'},
  ]},
  {id:'m-003',name:'EXAONE-3.0-7.8B',baseModel:'LG-EXAONE-3.0-7.8B',version:'v1.3.2',
   desc:'LG AI Research 7.8B 경량 모델 — 저지연 실시간 응답, 단순 질의 최적',
   status:'Active',temperature:0.6,maxTokens:1024,topP:0.9,contextWindow:'32K',
   systemPrompt:'한국도로공사 정보 안내 AI입니다. 간결하고 정확하게 답변합니다.',
   promptHistory:[
    {ver:'v1.3.2',date:'2026-08-13 14:00',author:'한지훈',note:'응답 간결화 지시어 추가',content:'한국도로공사 정보 안내 AI입니다. 간결하고 정확하게 답변합니다.'},
  ]},
  {id:'m-004',name:'Solar-10.7B-v1.0',baseModel:'Upstage-Solar-Pro-10.7B',version:'v1.0.0',
   desc:'Upstage Solar 10.7B — 비활성화 (성능 평가 후 재도입 예정)',
   status:'Inactive',temperature:0.5,maxTokens:2048,topP:0.9,contextWindow:'4K',
   systemPrompt:'',promptHistory:[]},
];

export let MOCK_FILTER_RULES = [
  {id:1,n:'기밀정보 요청',p:'기밀, 보안등급, 내부전용, 사내비밀',category:'기밀',severity:'danger',a:'차단',active:true,hitCount:23},
  {id:2,n:'개인정보 접근',p:'급여, 주민번호, 연봉, 개인식별',category:'개인정보',severity:'danger',a:'차단',active:true,hitCount:41},
  {id:3,n:'경쟁정보 수집',p:'민자고속도로, 입찰가, 내부단가, 원가',category:'기밀',severity:'warning',a:'차단',active:true,hitCount:8},
  {id:4,n:'보안 우회 시도',p:'우회, 해킹, 탈옥, jailbreak, 프롬프트 무시',category:'보안',severity:'danger',a:'차단',active:true,hitCount:12},
  {id:5,n:'비윤리적 요청',p:'차별, 혐오, 폭력, 불법',category:'비윤리',severity:'warning',a:'차단',active:true,hitCount:6},
  {id:6,n:'외부 URL 삽입',p:'http://, https://, www.',category:'보안',severity:'caution',a:'경고',active:true,hitCount:34},
  {id:7,n:'과도한 반복 질의',p:'반복, 재실행, 계속, 루프',category:'시스템',severity:'caution',a:'로그만',active:false,hitCount:2},
];

// ==================== 신뢰성 관리 MOCK DATA ====================
export let MOCK_RERANK_PIPELINES = [
  {id:'rp-001',agent:'도로지침 검색 에이전트',model:'BGE-Reranker-v2',topK:5,threshold:0.70,enabled:true,improvement:18.4},
  {id:'rp-002',agent:'교통데이터 분석 어시스턴트',model:'Cross-Encoder-KoE5',topK:3,threshold:0.75,enabled:true,improvement:12.1},
  {id:'rp-003',agent:'HR 질의응답 봇',model:'BGE-Reranker-v2',topK:5,threshold:0.65,enabled:true,improvement:9.8},
  {id:'rp-004',agent:'계약서 검토 에이전트',model:'ColBERT-v2-Kor',topK:8,threshold:0.80,enabled:false,improvement:0},
  {id:'rp-005',agent:'돌발상황 대응 가이드',model:'BGE-Reranker-v2',topK:5,threshold:0.85,enabled:true,improvement:22.3},
  {id:'rp-006',agent:'직무 교육 튜터',model:'Cross-Encoder-KoE5',topK:4,threshold:0.68,enabled:true,improvement:7.5},
];

export let MOCK_RAG_GLOBAL = {
  chunkSize:512,chunkOverlap:64,topKRetrieve:10,topKAfterRerank:5,
  similarityThreshold:0.65,embeddingModel:'KoSimCSE-roberta-multitask',
  hybridSearch:true,bm25Weight:30,semanticWeight:70,
  citationRequired:true,minCitationSimilarity:75,
};

export let MOCK_RAG_AREAS = [
  {id:'KA-001',area:'도로설계기준',topK:8,threshold:0.70,chunkSize:256,override:true,updated:'2026-09-05'},
  {id:'KA-002',area:'도로유지관리지침',topK:10,threshold:0.65,chunkSize:512,override:true,updated:'2026-09-03'},
  {id:'KA-003',area:'인사규정',topK:5,threshold:0.60,chunkSize:512,override:false,updated:'2026-09-01'},
  {id:'KA-004',area:'법률/계약',topK:6,threshold:0.75,chunkSize:256,override:true,updated:'2026-08-29'},
  {id:'KA-005',area:'교육자료',topK:7,threshold:0.62,chunkSize:512,override:false,updated:'2026-09-04'},
  {id:'KA-006',area:'교통안전 매뉴얼',topK:5,threshold:0.80,chunkSize:256,override:true,updated:'2026-08-21'},
];

export let MOCK_OUTPUT_GUARDRAILS = [
  {id:'og-001',name:'인용 출처 필수',desc:'RAG 응답 시 반드시 참조 문서 출처를 포함해야 합니다.',category:'인용',action:'재생성 요청',enabled:true,hitCount:14},
  {id:'og-002',name:'숫자·날짜 팩트 검증',desc:'지침 조항 번호·이정(k)·날짜가 참조 문서와 일치하는지 검증합니다.',category:'팩트체크',action:'경고 표시',enabled:true,hitCount:8},
  {id:'og-003',name:'불확실 표현 감지',desc:'"아마도","추정","잘 모르겠" 등 불확실 표현 자동 감지합니다.',category:'팩트체크',action:'신뢰도 감점',enabled:true,hitCount:31},
  {id:'og-004',name:'응답 길이 제한',desc:'2,000자 초과 응답은 자동으로 요약본을 제공합니다.',category:'품질',action:'자동 요약',enabled:true,hitCount:22},
  {id:'og-005',name:'외부 URL 출력 차단',desc:'응답 본문에 외부 URL이 포함될 경우 제거합니다.',category:'보안',action:'자동 제거',enabled:true,hitCount:5},
  {id:'og-006',name:'PII 자동 마스킹',desc:'출력에 개인식별정보(이름·전화·주민번호) 포함 시 마스킹합니다.',category:'보안',action:'자동 마스킹',enabled:false,hitCount:0},
  {id:'og-007',name:'반복 루프 감지',desc:'동일한 문장이 3회 이상 반복될 경우 응답을 중단합니다.',category:'품질',action:'응답 중단',enabled:true,hitCount:3},
];

export let MOCK_CONFIDENCE_CONFIG = {
  autoAnswerThreshold:80,hitlThreshold:65,hallucinationWarnThreshold:55,
  factors:[
    {name:'RAG 유사도 점수',key:'rag',weight:40,desc:'벡터 검색 결과 상위 문서 평균 유사도'},
    {name:'LLM 자체 신뢰도',key:'llm',weight:35,desc:'모델 출력 토큰 확률 기반 자체 평가'},
    {name:'Re-ranker 점수',key:'rerank',weight:25,desc:'Cross-Encoder 최종 정렬 점수'},
  ],
  perModel:[
    {model:'GPT-OSS-120B',baseline:88,adj:0,avgScore:87.4},
    {model:'Llama-3-Kor-Instruct',baseline:82,adj:-3,avgScore:79.2},
    {model:'EXAONE-3.0-7.8B',baseline:76,adj:-5,avgScore:73.8},
    {model:'Solar-10.7B-v1.0',baseline:72,adj:-2,avgScore:70.1},
  ],
  trend:[
    {date:'09-11',avg:83.2},{date:'09-12',avg:84.5},{date:'09-13',avg:82.1},
    {date:'09-14',avg:85.8},{date:'09-15',avg:87.2},{date:'09-16',avg:86.1},{date:'09-17',avg:88.4},
  ],
};

export let MOCK_CODESPACES = [
  {id:1,name:'llm-finetune-env',image:'pytorch/pytorch:2.1-cuda12.1',status:'Running',gpu:'H200 x1',created:'2026-09-03'},
  {id:2,name:'rag-pipeline-dev',image:'python:3.11-slim',status:'Running',gpu:'-',created:'2026-09-01'},
  {id:3,name:'timeseries-research',image:'nvidia/cuda:12.2-devel',status:'Stopped',gpu:'L40S x1',created:'2026-08-29'},
  {id:4,name:'agent-builder-test',image:'node:20-alpine',status:'Running',gpu:'-',created:'2026-08-21'},
];

export let MOCK_VOLUMES = [
  {name:'shared-models',size:'2.4 TB',mount:'/mnt/models',usedBy:'llm-finetune-env, rag-pipeline-dev',status:'Healthy'},
  {name:'dataset-store',size:'800 GB',mount:'/mnt/datasets',usedBy:'timeseries-research',status:'Healthy'},
  {name:'vector-db-backup',size:'120 GB',mount:'/mnt/backup/vectordb',usedBy:'System',status:'Healthy'},
  {name:'logs-archive',size:'50 GB',mount:'/mnt/logs',usedBy:'All',status:'Warning'},
];

// ==================== ADMIN MOCK DATA ====================
export let MOCK_USERS = [
  {id:'USR-001',name:'한지훈',dept:'디지털계획처 AI인프라부',role:'시스템관리자',email:'han@ex.co.kr',status:'Running',lastLogin:'2026-09-07 09:10',loginCount:342,apiCalls:1580},
  {id:'USR-002',name:'이도현',dept:'디지털계획처 데이터플랫폼부',role:'부서관리자',email:'lee@ex.co.kr',status:'Running',lastLogin:'2026-09-07 08:45',loginCount:280,apiCalls:920},
  {id:'USR-003',name:'박선영',dept:'교통센터 상황관리부',role:'일반사용자',email:'park@ex.co.kr',status:'Running',lastLogin:'2026-09-06 17:30',loginCount:156,apiCalls:430},
  {id:'USR-004',name:'강민철',dept:'법무실',role:'일반사용자',email:'kang@ex.co.kr',status:'Running',lastLogin:'2026-09-07 07:20',loginCount:98,apiCalls:210},
  {id:'USR-005',name:'김태우',dept:'수도권본부 도로교통부',role:'부서관리자',email:'kim@ex.co.kr',status:'Stopped',lastLogin:'2026-09-03 14:00',loginCount:45,apiCalls:80},
  {id:'USR-006',name:'윤서진',dept:'인재개발원',role:'일반사용자',email:'yoon@ex.co.kr',status:'Running',lastLogin:'2026-09-06 16:55',loginCount:201,apiCalls:560},
  {id:'USR-007',name:'정민석',dept:'시설처 구조물관리부',role:'부서관리자',email:'jung@ex.co.kr',status:'Running',lastLogin:'2026-09-07 08:00',loginCount:310,apiCalls:1200},
  {id:'USR-008',name:'서지우',dept:'디지털계획처 정보보안부',role:'시스템관리자',email:'seo@ex.co.kr',status:'Running',lastLogin:'2026-09-07 09:05',loginCount:450,apiCalls:2100},
];

export let MOCK_PERMISSION_REQUESTS = [
  {id:'PRM-001',user:'박선영',dept:'교통센터 상황관리부',type:'지식영역 접근',target:'교통안전 매뉴얼 DB',status:'대기 중',date:'2026-09-06'},
  {id:'PRM-002',user:'강민철',dept:'법무실',type:'API 키 발급',target:'GPT-OSS-120B',status:'대기 중',date:'2026-09-05'},
  {id:'PRM-003',user:'김태우',dept:'수도권본부 도로교통부',type:'에이전트 배포',target:'점검 보고서 생성기',status:'완료',date:'2026-09-04'},
  {id:'PRM-004',user:'윤서진',dept:'인재개발원',type:'데이터셋 접근',target:'RoadSpec_Guidelines_QA_v1',status:'완료',date:'2026-09-03'},
];

export let MOCK_KNOWLEDGE_AREAS = [
  {id:'KA-001',name:'도로설계기준',desc:'도로 설계기준·시방서 및 구조 기준',docs:245,chunks:12400,size:'1.2 GB',owner:'도로처',access:['AI인프라부','데이터플랫폼부','도로처'],updated:'2026-09-05',status:'Running'},
  {id:'KA-002',name:'도로유지관리지침',desc:'포장·교량 유지관리 및 점검 실무 문서',docs:180,chunks:9200,size:'850 MB',owner:'시설처 구조물관리부',access:['시설처 구조물관리부','수도권본부 도로교통부'],updated:'2026-09-03',status:'Running'},
  {id:'KA-003',name:'인사규정',desc:'복리후생, 급여, 인사 관련 규정',docs:120,chunks:6100,size:'320 MB',owner:'경영지원처',access:['전체'],updated:'2026-09-01',status:'Running'},
  {id:'KA-004',name:'법률/계약',desc:'용역 계약서 템플릿 및 법률 자문 문서',docs:95,chunks:4800,size:'450 MB',owner:'법무실',access:['법무실','경영지원처'],updated:'2026-08-29',status:'Running'},
  {id:'KA-005',name:'교육자료',desc:'신입사원 교육 및 도로관리 기술 교육 자료',docs:310,chunks:15600,size:'2.1 GB',owner:'인재개발원',access:['전체'],updated:'2026-09-04',status:'Running'},
  {id:'KA-006',name:'교통안전 매뉴얼',desc:'돌발상황 대응 및 공사구간 안전관리 절차',docs:65,chunks:3200,size:'180 MB',owner:'교통센터 상황관리부',access:['전체'],updated:'2026-08-21',status:'Warning'},
];

export let MOCK_KB_FOLDERS = [
  {id:'f-001',name:'도로설계기준',parent:null,docs:245,perm:'all',owner:'도로처'},
  {id:'f-011',name:'포장·토공',parent:'f-001',docs:120,perm:'dept',owner:'도로처'},
  {id:'f-012',name:'교량·터널',parent:'f-001',docs:125,perm:'dept',owner:'시설처 구조물관리부'},
  {id:'f-002',name:'도로유지관리지침',parent:null,docs:180,perm:'dept',owner:'시설처 구조물관리부'},
  {id:'f-021',name:'점검 이력',parent:'f-002',docs:80,perm:'dept',owner:'시설처 구조물관리부'},
  {id:'f-003',name:'인사규정',parent:null,docs:120,perm:'all',owner:'경영지원처'},
  {id:'f-004',name:'법률/계약',parent:null,docs:95,perm:'specific',owner:'법무실'},
  {id:'f-005',name:'교육자료',parent:null,docs:310,perm:'all',owner:'인재개발원'},
];
export let MOCK_KB_DOCS = {
  'f-001':[
    {id:'d-001',name:'도로설계기준_2026.pdf',size:'4.2MB',pii:false,status:'완료',chunks:312,uploaded:'2026-09-05',uploader:'오재현'},
    {id:'d-002',name:'VDS_설치·운영기준.pdf',size:'8.1MB',pii:false,status:'완료',chunks:580,uploaded:'2026-09-03',uploader:'이도현'},
    {id:'d-003',name:'공사구간_안전점검체크리스트.xlsx',size:'1.2MB',pii:true,status:'완료',chunks:85,uploaded:'2026-09-01',uploader:'김태우'},
  ],
  'f-002':[
    {id:'d-011',name:'교량점검_실무매뉴얼.pdf',size:'12.3MB',pii:false,status:'완료',chunks:820,uploaded:'2026-09-03',uploader:'정민석'},
    {id:'d-012',name:'2026_유지보수이력.xlsx',size:'2.8MB',pii:true,status:'처리중',chunks:190,uploaded:'2026-09-04',uploader:'정민석'},
  ],
  'f-003':[
    {id:'d-021',name:'인사규정_2026_개정안.pdf',size:'2.4MB',pii:true,status:'완료',chunks:145,uploaded:'2026-09-07',uploader:'임하늘'},
    {id:'d-022',name:'복리후생제도안내.pdf',size:'1.8MB',pii:false,status:'완료',chunks:98,uploaded:'2026-08-13',uploader:'임하늘'},
  ],
  'f-004':[{id:'d-031',name:'유지보수_표준계약서_2026.docx',size:'580KB',pii:false,status:'완료',chunks:62,uploaded:'2026-08-29',uploader:'강민철'}],
  'f-005':[
    {id:'d-041',name:'신입교육과정.pptx',size:'22.5MB',pii:false,status:'완료',chunks:410,uploaded:'2026-08-25',uploader:'윤서진'},
    {id:'d-042',name:'도로안전교육_2026_3분기.pdf',size:'5.8MB',pii:false,status:'완료',chunks:270,uploaded:'2026-09-04',uploader:'윤서진'},
  ],
};
export let MOCK_BATCH_JOBS = [
  {id:'bj-001',src:'그룹웨어',target:'도로설계기준',schedule:'매일 02:00',lastRun:'2026-09-18 02:00',lastResult:'성공',addedDocs:3,updatedDocs:1,deletedDocs:0,enabled:true},
  {id:'bj-002',src:'ERP',target:'인사규정',schedule:'매주 월 03:00',lastRun:'2026-09-17 03:00',lastResult:'성공',addedDocs:0,updatedDocs:2,deletedDocs:0,enabled:true},
  {id:'bj-003',src:'EDMS',target:'법률/계약',schedule:'실시간 동기화',lastRun:'2026-09-18 09:15',lastResult:'성공',addedDocs:1,updatedDocs:0,deletedDocs:0,enabled:true},
  {id:'bj-004',src:'그룹웨어',target:'교육자료',schedule:'매일 04:00',lastRun:'2026-09-17 04:00',lastResult:'실패',addedDocs:0,updatedDocs:0,deletedDocs:0,enabled:false},
];
export let MOCK_SYNC_LOGS = [
  {id:1,time:'2026-09-18 09:15:22',src:'EDMS',folder:'법률/계약',file:'유지보수_용역계약서_수정본.docx',action:'추가',pii:false,status:'완료'},
  {id:2,time:'2026-09-18 02:00:45',src:'그룹웨어',folder:'도로설계기준',file:'도로안전시설_설치지침_9월.pdf',action:'추가',pii:false,status:'완료'},
  {id:3,time:'2026-09-18 02:00:43',src:'그룹웨어',folder:'도로설계기준',file:'공사구간_안전점검일지_9월.xlsx',action:'업데이트',pii:true,status:'완료(마스킹)'},
  {id:4,time:'2026-09-17 03:01:12',src:'ERP',folder:'인사규정',file:'급여기준표_개정.xlsx',action:'업데이트',pii:true,status:'완료(마스킹)'},
  {id:5,time:'2026-09-16 04:00:33',src:'그룹웨어',folder:'교육자료',file:'신입교육자료_9월.pptx',action:'추가',pii:false,status:'실패'},
];

export let MOCK_USAGE_STATS = {
  daily:[
    {date:'09-01',queries:1240,users:85},{date:'09-02',queries:980,users:72},{date:'09-03',queries:1560,users:102},
    {date:'09-04',queries:1890,users:115},{date:'09-05',queries:2100,users:128},{date:'09-06',queries:1780,users:110},{date:'09-07',queries:920,users:68}
  ],
  byDept:[{dept:'AI인프라부',queries:3200,pct:28},{dept:'데이터플랫폼부',queries:2400,pct:21},{dept:'교통센터 상황관리부',queries:1800,pct:16},{dept:'시설처 구조물관리부',queries:1500,pct:13},{dept:'인재개발원',queries:1200,pct:10},{dept:'기타',queries:1370,pct:12}],
  byModel:[{model:'GPT-OSS-120B',queries:5200,pct:45},{model:'Llama-3-Kor',queries:3100,pct:27},{model:'EXAONE-3.0',queries:2800,pct:24},{model:'기타',queries:370,pct:4}],
  topKeywords:['VDS 결측','돌발상황 대응','통행속도 예측','도로설계기준','유지관리지침','교량 계측','결빙 예보','작업지시서','인사규정','교육자료'],
};
export let MOCK_USAGE_HISTORY = [
  {id:'uh-001',user:'한지훈',dept:'디지털계획처 AI인프라부',mode:'GENERAL',query:'VDS 결측률이 관리 임계를 넘은 구간이 어디인가요?',answer:'교통데이터 품질관리규정(제3장)상 구간 결측률 관리 임계는 3.0%입니다. 현재 경부선 구간이 4.8%로 임계를 초과했으며, 원인 지점은 VDS-0010-0247 통신 불량 3일 누적...',time:'2026-09-18 14:30',tokens:284,rating:5,errReport:false},
  {id:'uh-002',user:'이도현',dept:'디지털계획처 데이터플랫폼부',mode:'REVIEW',query:'업로드한 정비 작업지시 기안문을 유지관리지침과 대조해서 위반 소지 검토해줘',answer:'유지관리지침 대조 결과: 차로 차단 작업 시 교통관리계획 사전 승인 필요(제42조②), 안전시설 배치도 누락...',time:'2026-09-18 13:20',tokens:412,rating:4,errReport:false},
  {id:'uh-003',user:'박선영',dept:'교통센터 상황관리부',mode:'TRANSLATE',query:'업로드한 영문 도로안전 기준서를 한국어로 번역해줘',answer:'설계속도의 정의 (AASHTO 기하구조 설계기준) — 설계속도란 도로의 기하구조를 결정하는 기준이 되는 속도로서, 해당 구간에서 안전하게 주행할 수 있는 최고 속도를 말한다...',time:'2026-09-18 11:05',tokens:556,rating:5,errReport:false},
  {id:'uh-004',user:'정민석',dept:'시설처 구조물관리부',mode:'GENERAL',query:'비상시 대피 경로',answer:'본사 건물의 비상 대피 경로는...',time:'2026-09-17 16:42',tokens:185,rating:2,errReport:true,errDetail:'층별 대피도 누락, 환각 의심'},
  {id:'uh-005',user:'강민철',dept:'법무실',mode:'REVIEW',query:'수의계약 한도액 기준 확인',answer:'수의계약은 추정가격이 2천만원 이하인 경우...',time:'2026-09-17 15:30',tokens:320,rating:3,errReport:false},
  {id:'uh-006',user:'윤서진',dept:'인재개발원',mode:'REPORT',query:'이번 주 VDS 품질 점검 12건 완료, 돌발상황 대응 보고 2건 처리 완료를 주간 실적 보고서로 작성해줘',answer:'디지털계획처 주간 업무 실적 보고 | 보고 기간: 2026.09.07~09.11...',time:'2026-09-17 14:15',tokens:680,rating:5,errReport:false},
];
export let MOCK_SATISFACTION_DATA = {
  avg:4.2, total:342,
  dist:[{stars:5,count:178,pct:52},{stars:4,count:95,pct:28},{stars:3,count:41,pct:12},{stars:2,count:18,pct:5},{stars:1,count:10,pct:3}],
  recent:[
    {id:1,user:'이도현',dept:'디지털계획처 데이터플랫폼부',stars:4,comment:'결측 구간 검토 결과가 매우 정확했습니다. 더 빠른 응답 속도가 필요합니다.',date:'2026-09-18'},
    {id:2,user:'박선영',dept:'교통센터 상황관리부',stars:5,comment:'번역 품질이 훌륭합니다. 공기업 문체도 잘 반영됩니다.',date:'2026-09-18'},
    {id:3,user:'정민석',dept:'시설처 구조물관리부',stars:2,comment:'비상 대피 경로 답변이 부정확했습니다. 개선 필요.',date:'2026-09-17'},
    {id:4,user:'윤서진',dept:'인재개발원',stars:5,comment:'보고서 자동 작성 기능이 업무 효율을 크게 높여주었습니다.',date:'2026-09-17'},
    {id:5,user:'강민철',dept:'법무실',stars:3,comment:'용역 계약 관련 법령 DB가 더 최신화되면 좋겠습니다.',date:'2026-09-16'},
  ]
};

// ==================== RAG PIPELINE MOCK DATA ====================
export let MOCK_DATA_SOURCES_INT = [
  {id:'ds-i01',name:'그룹웨어 (WorksOn)',protocol:'REST API',target:'도로설계기준/교육자료',schedule:'매일 02:00',lastSync:'2026-09-18 02:01',status:'정상',docCount:555,newToday:5},
  {id:'ds-i02',name:'ERP (SAP S/4HANA)',protocol:'DB Direct',target:'인사규정',schedule:'매주 월 03:00',lastSync:'2026-09-17 03:02',status:'정상',docCount:120,newToday:0},
  {id:'ds-i03',name:'EDMS (문서관리시스템)',protocol:'WebDAV',target:'법률/계약',schedule:'실시간 동기화',lastSync:'2026-09-18 09:15',status:'정상',docCount:95,newToday:1},
  {id:'ds-i04',name:'EXMMS (유지보수 작업관리)',protocol:'REST API',target:'도로유지관리지침',schedule:'매일 01:00',lastSync:'2026-09-18 01:03',status:'경고',docCount:280,newToday:0},
];
export let MOCK_DATA_SOURCES_EXT = [
  {id:'ds-e01',name:'법령정보센터 (법제처)',method:'Open API',url:'https://www.law.go.kr/DRF/lawService',target:'법률/계약',schedule:'매주 화 05:00',lastSync:'2026-09-18 05:00',status:'정상',docCount:1240,newToday:3},
  {id:'ds-e02',name:'나라장터 (조달청)',method:'Open API',url:'https://openapi.g2b.go.kr/',target:'법률/계약',schedule:'매일 06:00',lastSync:'2026-09-18 06:01',status:'정상',docCount:320,newToday:12},
  {id:'ds-e03',name:'기상청 방재기상정보',method:'Open API',url:'https://apihub.kma.go.kr/',target:'교통안전 매뉴얼',schedule:'매시 정각',lastSync:'2026-09-18 09:00',status:'정상',docCount:88,newToday:0},
  {id:'ds-e04',name:'국토교통부 도로업무편람',method:'크롤링',url:'https://www.molit.go.kr/',target:'도로설계기준',schedule:'매주 목 04:00',lastSync:'2026-09-13 04:00',status:'오류',docCount:42,newToday:0},
];
export let MOCK_DOC_PIPELINE = [
  {id:'dp-001',name:'도로설계기준_2026.pdf',folder:'도로설계기준',src:'그룹웨어',type:'PDF',size:'4.2MB',ingest:'2026-09-18 02:01',parseStatus:'완료',chunkStatus:'완료',embedStatus:'완료',chunks:312,tokens:48200,pii:false,version:3,changeType:'업데이트'},
  {id:'dp-002',name:'도로안전시설_설치지침_9월.pdf',folder:'도로설계기준',src:'그룹웨어',type:'PDF',size:'8.1MB',ingest:'2026-09-18 02:00',parseStatus:'완료',chunkStatus:'완료',embedStatus:'완료',chunks:580,tokens:91000,pii:false,version:1,changeType:'신규'},
  {id:'dp-003',name:'급여기준표_개정.xlsx',folder:'인사규정',src:'ERP',type:'XLSX',size:'1.8MB',ingest:'2026-09-17 03:01',parseStatus:'완료',chunkStatus:'완료',embedStatus:'완료',chunks:145,tokens:18500,pii:true,version:5,changeType:'업데이트'},
  {id:'dp-004',name:'유지보수_용역계약서_수정본.docx',folder:'법률/계약',src:'EDMS',type:'DOCX',size:'580KB',ingest:'2026-09-18 09:15',parseStatus:'완료',chunkStatus:'완료',embedStatus:'처리중',chunks:62,tokens:9800,pii:false,version:2,changeType:'업데이트'},
  {id:'dp-005',name:'신입교육자료_9월.pptx',folder:'교육자료',src:'그룹웨어',type:'PPTX',size:'22.5MB',ingest:'2026-09-16 04:00',parseStatus:'완료',chunkStatus:'실패',embedStatus:'대기',chunks:0,tokens:0,pii:false,version:1,changeType:'신규'},
  {id:'dp-006',name:'도로교통법_시행규칙_개정.pdf',folder:'법률/계약',src:'법령정보센터',type:'PDF',size:'3.2MB',ingest:'2026-09-18 05:00',parseStatus:'완료',chunkStatus:'완료',embedStatus:'완료',chunks:210,tokens:33500,pii:false,version:1,changeType:'신규'},
  {id:'dp-007',name:'나라장터_입찰공고_0918.json',folder:'법률/계약',src:'조달청',type:'JSON',size:'1.1MB',ingest:'2026-09-18 06:01',parseStatus:'완료',chunkStatus:'완료',embedStatus:'완료',chunks:28,tokens:4200,pii:false,version:1,changeType:'신규'},
];
export let MOCK_CHUNK_QUALITY = [
  {docId:'d-001',name:'도로설계기준_2026.pdf',folder:'도로설계기준',avgLen:154,specialCharPct:1.2,dupPct:0.8,semanticScore:94,status:'양호'},
  {docId:'d-002',name:'VDS_설치·운영기준.pdf',folder:'도로설계기준',avgLen:168,specialCharPct:2.1,dupPct:1.5,semanticScore:91,status:'양호'},
  {docId:'d-011',name:'교량점검_실무매뉴얼.pdf',folder:'도로유지관리지침',avgLen:142,specialCharPct:4.5,dupPct:3.2,semanticScore:78,status:'주의'},
  {docId:'d-021',name:'인사규정_2026_개정안.pdf',folder:'인사규정',avgLen:201,specialCharPct:0.8,dupPct:0.4,semanticScore:96,status:'양호'},
  {docId:'d-041',name:'신입교육과정.pptx',folder:'교육자료',avgLen:88,specialCharPct:8.2,dupPct:6.5,semanticScore:58,status:'경고'},
  {docId:'e-006',name:'도로교통법_시행규칙_개정.pdf',folder:'법률/계약',avgLen:178,specialCharPct:1.9,dupPct:0.9,semanticScore:92,status:'양호'},
];
export let MOCK_CHUNK_PREVIEW = [
  {idx:1,text:'제1장 총칙 제1조(목적) 이 지침은 고속도로 교통 시계열 데이터의 수집·정제·품질관리에 관한 세부 기준과 절차를 정하여 데이터의 정확성과 연속성을 확보함을 목적으로 한다.',len:142,score:96},
  {idx:2,text:'제2조(적용범위) 이 지침은 전국 VDS 관측지점과 프로브 통행속도 수집 데이터 및 이를 위탁 운영하는 수탁기관에 적용한다.',len:88,score:93},
  {idx:3,text:'제3조(정의) ① "대표 관측지점"이란 구간 교통 특성을 대표하도록 선정한 VDS 지점을 말한다. ② "결측"이란 5분 집계 주기에 유효 관측값이 수신되지 않은 상태를 말한다.',len:165,score:97},
];
export let MOCK_EMBED_STATUS = {
  today:{total:1420,success:1398,fail:8,pending:14,successRate:98.4},
  models:[
    {name:'KLUE-BERT-base',dim:768,docs:12400,lastUpdated:'2026-09-18 02:30',status:'정상',avgLatency:42},
    {name:'BGE-M3 (한국어 특화)',dim:1024,docs:5800,lastUpdated:'2026-09-18 06:10',status:'정상',avgLatency:67},
  ],
  vectorDb:{name:'Milvus 2.4',collections:6,totalVectors:1824560,diskUsage:'18.4 GB',indexType:'HNSW',status:'정상',queryLatency:8},
  anomalies:[
    {id:'an-001',doc:'신입교육과정.pptx',type:'낮은밀도',desc:'벡터 클러스터 밀도 임계값(0.45) 미만 — 이미지 슬라이드 과다 포함 의심',detected:'2026-09-16 04:12',status:'미처리'},
    {id:'an-002',doc:'2026_유지보수이력.xlsx',type:'이상치',desc:'유클리디안 거리 상위 1% 이상 이탈 벡터 12개 탐지 — 수식/특수문자 과다',detected:'2026-09-17 03:05',status:'검토중'},
  ],
  weeklyTrend:[
    {date:'09-12',success:1280,fail:22},{date:'09-13',success:1350,fail:15},{date:'09-14',success:1180,fail:31},
    {date:'09-15',success:890,fail:8},{date:'09-16',success:420,fail:12},{date:'09-17',success:1390,fail:6},{date:'09-18',success:1398,fail:8},
  ],
};
export let MOCK_REPROCESS_QUEUE = [
  {id:'rq-001',doc:'신입교육자료_9월.pptx',folder:'교육자료',src:'그룹웨어',stage:'청킹',error:'PPTX 이미지 슬라이드 파싱 오류 (PIL 디코딩 실패)',failedAt:'2026-09-16 04:00',retryCount:2,status:'대기중',priority:'높음'},
  {id:'rq-002',doc:'국토교통부_도로업무편람.pdf',folder:'도로설계기준',src:'크롤링',stage:'임베딩',error:'임베딩 서버 응답 타임아웃 (>30s)',failedAt:'2026-09-13 04:15',retryCount:1,status:'대기중',priority:'보통'},
  {id:'rq-003',doc:'교량점검일지_8월.xlsx',folder:'도로유지관리지침',src:'그룹웨어',stage:'파싱',error:'암호화된 XLSX 파일 — 비밀번호 해제 필요',failedAt:'2026-09-11 02:05',retryCount:3,status:'수동처리필요',priority:'높음'},
  {id:'rq-004',doc:'돌발상황대응매뉴얼_v3.pdf',folder:'교통안전 매뉴얼',src:'EDMS',stage:'임베딩',error:'토큰 수 초과 (한도 32,768 — 실제 41,200토큰)',failedAt:'2026-09-15 09:30',retryCount:0,status:'대기중',priority:'보통'},
];

// ==================== 정보서비스·모니터링·HR MOCK DATA ====================
export let MOCK_SERVICE_STATS = {
  summary:{users:842,newToday:12,conversations:15240,apiCalls:48920,linkCalls:3280,feedbacks:342},
  daily:[
    {date:'09-12',users:98,conv:1840,api:5820},{date:'09-13',users:115,conv:2100,api:6230},
    {date:'09-14',users:102,conv:1980,api:5940},{date:'09-15',users:45,conv:890,api:2810},
    {date:'09-16',users:32,conv:620,api:1980},{date:'09-17',users:128,conv:2380,api:7100},{date:'09-18',users:134,conv:2460,api:7280},
  ],
  keywords:[
    {word:'VDS 결측',cnt:1240},{word:'돌발상황 대응',cnt:980},{word:'통행속도 예측',cnt:820},{word:'인사규정',cnt:750},
    {word:'용역 계약검토',cnt:680},{word:'교육자료',cnt:540},{word:'교통안전 매뉴얼',cnt:490},{word:'교량 계측',cnt:420},
    {word:'결빙 예보',cnt:380},{word:'복리후생',cnt:320},{word:'출장규정',cnt:280},{word:'보고서 작성',cnt:240},
  ],
  topics:[
    {topic:'교통·돌발',pct:38,c:'bg-red-400'},{topic:'데이터 품질',pct:25,c:'bg-blue-400'},
    {topic:'인사·노무',pct:16,c:'bg-green-400'},{topic:'법무·계약',pct:11,c:'bg-purple-400'},{topic:'교육·훈련',pct:10,c:'bg-yellow-400'},
  ],
  apiByEndpoint:[
    {ep:'/api/v1/chat',calls:28420,pct:58},{ep:'/api/v1/rag/search',calls:12880,pct:26},
    {ep:'/api/v1/embed',calls:4820,pct:10},{ep:'/api/v1/agent/run',calls:1940,pct:4},{ep:'기타',calls:860,pct:2},
  ],
  peakHours:[0,0,0,0,0,2,8,42,112,168,145,98,120,145,160,182,195,188,142,95,68,42,18,5],
};
export let MOCK_NOTICES_MGMT = [
  {id:'N-001',title:'[필독] 2026년 3분기 보안 업데이트 공지',type:'공지',author:'서지우',date:'2026-09-18',views:248,pinned:true,active:true},
  {id:'N-002',title:'GPT-OSS-120B 모델 업그레이드 안내',type:'업데이트',author:'한지훈',date:'2026-09-15',views:182,pinned:false,active:true},
  {id:'N-003',title:'10월 정기 점검 (2026.10.04 02:00~06:00)',type:'점검',author:'서지우',date:'2026-09-13',views:124,pinned:false,active:true},
  {id:'N-004',title:'AI 플랫폼 사용 매뉴얼 v2.1 배포',type:'매뉴얼',author:'한지훈',date:'2026-09-08',views:340,pinned:false,active:true},
];
export let MOCK_QNA_MGMT = [
  {id:'Q-001',title:'번역 기능에서 한→중 번역이 안됩니다',user:'박선영',dept:'교통센터 상황관리부',date:'2026-09-18',status:'답변완료',answer:'현재 한→중 번역은 베타 기능으로 일부 문장 유형에서 오류가 발생할 수 있습니다. v2.1 패치에서 개선될 예정입니다.'},
  {id:'Q-002',title:'에이전트가 EXTIS 시계열 데이터에 접근하지 못하는 경우',user:'이도현',dept:'디지털계획처 데이터플랫폼부',date:'2026-09-17',status:'처리중',answer:''},
  {id:'Q-003',title:'RAG 검색 시 유사도 점수 기준이 어떻게 되나요?',user:'정민석',dept:'시설처 구조물관리부',date:'2026-09-16',status:'답변완료',answer:'현재 코사인 유사도 0.75 이상인 문서가 검색 결과에 포함됩니다. 관리자 설정에서 임계값 조정이 가능합니다.'},
  {id:'Q-004',title:'보고서 자동 생성 길이 제한 변경 가능한가요?',user:'윤서진',dept:'인재개발원',date:'2026-09-14',status:'대기',answer:''},
];
export let MOCK_SURVEYS_MGMT = [
  {id:'SV-001',title:'2026년 3분기 AI 플랫폼 만족도 조사',start:'2026-08-25',end:'2026-09-21',responses:248,target:450,status:'진행중'},
  {id:'SV-002',title:'신규 에이전트 기능 필요성 조사',start:'2026-08-08',end:'2026-08-24',responses:312,target:400,status:'완료'},
  {id:'SV-003',title:'사용자 온보딩 경험 개선 설문',start:'2026-09-22',end:'2026-10-22',responses:0,target:500,status:'예정'},
];
export let MOCK_IP_BLOCKS = [
  {id:'ib-001',target:'192.168.100.45',type:'IP',reason:'비정상 반복 접속 (10분간 500회)',action:'차단',appliedBy:'서지우',date:'2026-09-17',status:'활성'},
  {id:'ib-002',target:'10.20.30.99',type:'IP',reason:'권한 외 지식영역 접근 시도',action:'차단',appliedBy:'서지우',date:'2026-09-15',status:'활성'},
  {id:'ib-003',target:'USR-EXT-012',type:'ID',reason:'퇴직 처리 미완료 계정',action:'차단',appliedBy:'한지훈',date:'2026-09-13',status:'활성'},
  {id:'ib-004',target:'192.168.200.0/24',type:'대역',reason:'유지보수 협력사 외부망 허용 대역',action:'허용',appliedBy:'서지우',date:'2026-09-03',status:'활성'},
];
export let MOCK_WORK_LOG = [
  {id:1,time:'2026-09-18 14:35',user:'한지훈',dept:'AI인프라부',ip:'10.20.30.41',action:'문서 업로드',target:'도로설계기준_2026.pdf',detail:'도로설계기준 폴더 업로드 (4.2MB)'},
  {id:2,time:'2026-09-18 14:20',user:'서지우',dept:'정보보안부',ip:'10.20.30.10',action:'설정 변경',target:'GPT-OSS-120B',detail:'Temperature 0.3→0.2 변경'},
  {id:3,time:'2026-09-18 13:55',user:'이도현',dept:'데이터플랫폼부',ip:'10.20.30.55',action:'에이전트 호출',target:'교통데이터 분석 어시스턴트',detail:'VDS-0010-0247 결측 추이 질의 (응답 2.1s)'},
  {id:4,time:'2026-09-18 11:30',user:'임하늘',dept:'경영지원처',ip:'10.20.30.78',action:'데이터 추출',target:'이용통계_0918.xlsx',detail:'통계 엑셀 다운로드 (48KB)'},
  {id:5,time:'2026-09-18 10:12',user:'박선영',dept:'교통센터 상황관리부',ip:'10.20.30.62',action:'지식영역 접근',target:'교통안전 매뉴얼 DB',detail:'돌발상황 대응 관련 5건 검색'},
];
export let MOCK_EXTRACT_LOG = [
  {id:1,time:'2026-09-18 11:30',user:'임하늘',dept:'경영지원처',type:'통계 엑셀',file:'이용통계_0918.xlsx',size:'48KB',rows:340},
  {id:2,time:'2026-09-17 16:45',user:'한지훈',dept:'AI인프라부',type:'로그 CSV',file:'접속로그_0917.csv',size:'1.2MB',rows:5820},
  {id:3,time:'2026-09-16 14:20',user:'서지우',dept:'정보보안부',type:'보고서 PDF',file:'월간리포트_202608.pdf',size:'3.4MB',rows:null},
  {id:4,time:'2026-09-15 10:05',user:'이도현',dept:'데이터플랫폼부',type:'질의이력 CSV',file:'질의이력_이도현_0915.csv',size:'89KB',rows:248},
];
export let MOCK_USAGE_BY_DEPT = [
  {dept:'AI인프라부',users:8,queries:3240,avgLen:245,tokens:812000,peakHour:'14:00',abuseSuspect:false},
  {dept:'데이터플랫폼부',users:15,queries:2880,avgLen:198,tokens:621000,peakHour:'10:00',abuseSuspect:false},
  {dept:'교통센터 상황관리부',users:12,queries:2240,avgLen:185,tokens:452000,peakHour:'09:00',abuseSuspect:false},
  {dept:'경영지원처',users:10,queries:1820,avgLen:142,tokens:284000,peakHour:'14:00',abuseSuspect:false},
  {dept:'법무실',users:6,queries:1480,avgLen:312,tokens:502000,peakHour:'11:00',abuseSuspect:false},
  {dept:'인재개발원',users:11,queries:1240,avgLen:168,tokens:228000,peakHour:'15:00',abuseSuspect:false},
];
export let MOCK_ABUSE_ALERTS = [
  {id:'ab-001',user:'미확인',ip:'192.168.100.45',type:'반복 접속',detail:'10분간 500회 API 호출 (정상범위 100회/10분)',detected:'2026-09-18 11:18',status:'차단됨',severity:'위험'},
  {id:'ab-002',user:'USR-EXT-012',ip:'10.20.100.8',type:'권한 외 접근',detail:'법률/계약 지식영역 무단 접근 시도 12회',detected:'2026-09-17 15:30',status:'경고발송',severity:'주의'},
  {id:'ab-003',user:'김태우',ip:'10.20.30.75',type:'대량 추출',detail:'1시간 내 엑셀 추출 8회 (일 평균 0.3회)',detected:'2026-09-16 14:40',status:'모니터링',severity:'정보'},
];
export let MOCK_APIS = [
  {id:'api-001',name:'RoadQ Chat API',endpoint:'/api/v1/chat',version:'v1.2',auth:'Bearer Token',status:'활성',callsToday:28420,approvedDate:'2026-07-29'},
  {id:'api-002',name:'RAG 검색 API',endpoint:'/api/v1/rag/search',version:'v1.0',auth:'Bearer Token',status:'활성',callsToday:12880,approvedDate:'2026-07-29'},
  {id:'api-003',name:'임베딩 API',endpoint:'/api/v1/embed',version:'v1.1',auth:'API Key',status:'활성',callsToday:4820,approvedDate:'2026-08-05'},
  {id:'api-004',name:'에이전트 실행 API',endpoint:'/api/v1/agent/run',version:'v0.9',auth:'Bearer Token',status:'베타',callsToday:1940,approvedDate:'2026-08-25'},
  {id:'api-005',name:'교통통계 조회 API',endpoint:'/api/v1/stats',version:'v1.0',auth:'API Key',status:'활성',callsToday:320,approvedDate:'2026-08-13'},
];
export let MOCK_API_APPROVALS = [
  {id:'apr-001',requester:'이도현',dept:'디지털계획처 데이터플랫폼부',api:'에이전트 실행 API',purpose:'VDS 품질 점검 자동화 파이프라인 연동',requestDate:'2026-09-17',status:'대기'},
  {id:'apr-002',requester:'강민철',dept:'법무실',api:'RAG 검색 API',purpose:'용역 계약서 검토 자동화 연동',requestDate:'2026-09-15',status:'대기'},
  {id:'apr-003',requester:'윤서진',dept:'인재개발원',api:'임베딩 API',purpose:'교육자료 유사도 검색 시스템',requestDate:'2026-09-13',status:'승인'},
];
export let MOCK_PROMPTS_MGMT = [
  {id:'pt-001',name:'도로지침 Q&A 시스템 프롬프트',mode:'GENERAL',version:'v2.1',tokens:342,lastUpdated:'2026-09-13',active:true,desc:'도로 설계기준·유지관리지침 전문 답변 프롬프트. 출처 인용 필수, 환각 방지 지시 포함.'},
  {id:'pt-002',name:'문서 검토 평가 프롬프트',mode:'REVIEW',version:'v1.4',tokens:518,lastUpdated:'2026-09-11',active:true,desc:'사내 지침 대조 문서 검토용. 위반 소지 항목을 조항 단위로 발췌하도록 지시.'},
  {id:'pt-003',name:'번역·요약 지시 프롬프트',mode:'TRANSLATE',version:'v1.0',tokens:285,lastUpdated:'2026-09-03',active:true,desc:'한/영/중/일 다국어 번역 및 요약 길이 제어 지시.'},
  {id:'pt-004',name:'보고서 생성 프롬프트',mode:'REPORT',version:'v2.0',tokens:624,lastUpdated:'2026-09-08',active:true,desc:'공문서 형식 기반 주간/월간/상황 보고서 자동 생성.'},
];
export let MOCK_HR_SYNC = {
  lastSync:'2026-09-18 01:00:12',nextSync:'2026-09-19 01:00:00',status:'정상',
  summary:{total:842,new:3,retired:1,moved:5,concurrent:2,leave:4},
  recent:[
    {id:'hr-001',name:'신민철',type:'신규입사',dept:'AI인프라부',syncDate:'2026-09-18',action:'계정 생성'},
    {id:'hr-002',name:'유정민',type:'신규입사',dept:'데이터플랫폼부',syncDate:'2026-09-18',action:'계정 생성'},
    {id:'hr-003',name:'장태훈',type:'퇴직',dept:'정보보안부',syncDate:'2026-09-18',action:'계정 비활성화'},
    {id:'hr-004',name:'이민준',type:'부서이동',dept:'도로처 → 시설처 구조물관리부',syncDate:'2026-09-17',action:'부서 정보 업데이트'},
    {id:'hr-005',name:'박서연',type:'겸직',dept:'법무실 + 경영지원처',syncDate:'2026-09-17',action:'그룹 추가'},
    {id:'hr-006',name:'최재혁',type:'부재설정',dept:'수도권본부 도로교통부',syncDate:'2026-09-16',action:'임시 계정 잠금 (육아휴직)'},
  ],
};
export let MOCK_CONNECTED_SW = {
  rag:{status:'정상',qps:28.4,avgLatency:142,successRate:98.4,queueSize:14},
  ocr:{status:'정상',processed:342,avgLatency:890,successRate:99.2,queueSize:2},
  vectordb:{name:'Milvus 2.4',status:'정상',totalVectors:1824560,qps:45.2,avgQueryMs:8,diskUsage:'18.4GB'},
  agent:{status:'주의',activePipelines:3,completedToday:28,failedToday:2,avgExecSec:12.4},
  logs:[
    {time:'2026-09-18 14:30',sw:'RAG',level:'INFO',msg:'검색 쿼리 처리 완료 (28.4 QPS, p99=342ms)'},
    {time:'2026-09-18 13:20',sw:'Agent',level:'WARN',msg:'파이프라인 #P-042 실행 시간 초과 (30s 한도)'},
    {time:'2026-09-18 11:18',sw:'VectorDB',level:'INFO',msg:'인덱스 최적화 완료 (HNSW, 1,824,560 vectors)'},
    {time:'2026-09-18 09:42',sw:'Agent',level:'ERROR',msg:'파이프라인 #P-039 실패 (EXTIS 연계 API 연결 오류)'},
    {time:'2026-09-18 02:30',sw:'RAG',level:'INFO',msg:'임베딩 배치 처리 완료 (1,398 vectors, 98.4% 성공)'},
    {time:'2026-09-17 22:00',sw:'OCR',level:'INFO',msg:'야간 배치 OCR 처리 완료 (342건)'},
  ],
};

export let MOCK_ACCESS_LOGS = [
  {id:1,time:'2026-09-07 09:10:23',user:'한지훈',dept:'디지털계획처 AI인프라부',action:'로그인',ip:'10.20.30.41',detail:'SSO 인증 성공'},
  {id:2,time:'2026-09-07 09:08:15',user:'이도현',dept:'디지털계획처 데이터플랫폼부',action:'에이전트 호출',ip:'10.20.30.55',detail:'교통데이터 분석 어시스턴트 질의'},
  {id:3,time:'2026-09-07 08:55:02',user:'서지우',dept:'디지털계획처 정보보안부',action:'모델 설정 변경',ip:'10.20.30.10',detail:'GPT-OSS-120B Temperature 0.3→0.2'},
  {id:4,time:'2026-09-07 08:45:33',user:'임하늘',dept:'경영지원처',action:'문서 업로드',ip:'10.20.30.78',detail:'인사규정_2026_개정안.pdf (2.4MB)'},
  {id:5,time:'2026-09-07 08:30:11',user:'박선영',dept:'교통센터 상황관리부',action:'에이전트 호출',ip:'10.20.30.62',detail:'돌발상황 대응 가이드 질의'},
  {id:6,time:'2026-09-07 08:20:45',user:'강민철',dept:'법무실',action:'에이전트 호출',ip:'10.20.30.90',detail:'계약서 검토 에이전트 질의'},
  {id:7,time:'2026-09-06 17:55:10',user:'윤서진',dept:'인재개발원',action:'보고서 생성',ip:'10.20.30.44',detail:'기술교육 이수현황 리포트'},
  {id:8,time:'2026-09-06 17:30:22',user:'김태우',dept:'수도권본부 도로교통부',action:'로그아웃',ip:'10.20.30.33',detail:'세션 종료'},
];

export let MOCK_QUALITY_REVIEWS = [
  {id:'QR-001',query:'VDS 결측 판정 기준은?',answer:'5분 집계 주기에 유효 관측값이 수신되지 않으면 결측으로 판정하며, 구간 결측률 3.0% 초과 시 점검 대상입니다...',agent:'도로지침 검색 에이전트',reviewer:'이도현',rating:'good',confidence:0.92,date:'2026-09-06',feedback:'정확한 지침 인용'},
  {id:'QR-002',query:'연차 계산 방법 알려줘',answer:'근로기준법에 따라 1년 미만 근로자는...',agent:'HR 질의응답 봇',reviewer:'임하늘',rating:'edit',confidence:0.78,date:'2026-09-05',feedback:'공사 내규 추가 필요'},
  {id:'QR-003',query:'VDS-0010-0247 최근 3일 결측 추이',answer:'해당 지점은 통신 불량으로 3일 누적 결측이 발생했으며, 구간 결측률은 4.8%까지 상승했습니다...',agent:'교통데이터 분석 어시스턴트',reviewer:'이도현',rating:'good',confidence:0.95,date:'2026-09-04',feedback:''},
  {id:'QR-004',query:'비상시 대피 경로',answer:'본사 건물의 비상 대피 경로는...',agent:'돌발상황 대응 가이드',reviewer:'정민석',rating:'bad',confidence:0.55,date:'2026-09-03',feedback:'층별 대피도 누락, 할루시네이션 의심'},
  {id:'QR-005',query:'수의계약 한도액 기준',answer:'수의계약은 추정가격이 2천만원 이하인 경우...',agent:'계약서 검토 에이전트',reviewer:'강민철',rating:'edit',confidence:0.82,date:'2026-09-02',feedback:'공사 내규 한도액 기준 상이'},
];

export let MOCK_ANNOUNCEMENTS = [
  {id:1,title:'RoadQ AI 플랫폼 정식 오픈 안내',category:'공지',status:'Running',startDate:'2026-08-25',endDate:'2026-09-22',author:'서지우',views:452},
  {id:2,title:'시스템 정기 점검 안내 (9/8 02:00~06:00)',category:'점검',status:'Running',startDate:'2026-09-06',endDate:'2026-09-08',author:'서지우',views:128},
  {id:3,title:'신규 모델 Solar-10.7B 서비스 추가',category:'업데이트',status:'Running',startDate:'2026-09-03',endDate:'2026-09-21',author:'한지훈',views:89},
  {id:4,title:'개인 지식영역 기능 출시',category:'업데이트',status:'Stopped',startDate:'2026-08-08',endDate:'2026-08-25',author:'한지훈',views:310},
];

export let MOCK_LINKED_SW = [
  {name:'Milvus Vector DB',version:'2.4.1',status:'Running',endpoint:'milvus.ex.internal:19530',cpu:12.5,memory:28.4,uptime:'30d 4h'},
  {name:'OCR Engine (Tesseract)',version:'5.3.3',status:'Running',endpoint:'ocr.ex.internal:8090',cpu:5.2,memory:8.1,uptime:'30d 4h'},
  {name:'vLLM Serving',version:'0.4.2',status:'Running',endpoint:'vllm.ex.internal:8000',cpu:45.0,memory:62.3,uptime:'14d 2h'},
  {name:'Redis Cache',version:'7.2.4',status:'Running',endpoint:'redis.ex.internal:6379',cpu:2.1,memory:15.6,uptime:'30d 4h'},
  {name:'MinIO Object Storage',version:'2024.02',status:'Warning',endpoint:'minio.ex.internal:9000',cpu:8.3,memory:12.0,uptime:'30d 4h'},
  {name:'Agent Runtime',version:'1.2.0',status:'Running',endpoint:'agent.ex.internal:5000',cpu:18.7,memory:24.5,uptime:'7d 11h'},
];

// ==================== AGENT MOCK DATA ====================
export let MOCK_AGENTS = [
  {id:'AGT-001',name:'도로지침 검색 에이전트',desc:'도로 설계기준·유지관리지침을 기반으로 질의응답을 수행합니다.',model:'GPT-OSS-120B',tools:['도로 지침 벡터 DB','웹 검색'],mcpTools:['MCP-Search','MCP-WebCrawler'],ragEnabled:true,hitl:false,a2a:false,responseMode:'knowledge',actionable:false,status:'Running',version:'v2.1',creator:'한지훈',dept:'AI인프라부',created:'2026-08-08',updated:'2026-09-01',requests24h:342,avgLatency:'1.2s',successRate:98.5,confidence:0.92,systemPrompt:'당신은 한국도로공사의 도로 지침 전문가입니다. 설계기준·유지관리지침을 정확히 참조하여 답변하세요.',temperature:0.3,maxTokens:2048},
  {id:'AGT-002',name:'교통데이터 분석 어시스턴트',desc:'VDS·프로브 시계열의 결측·이상 징후를 분석하고 점검 절차를 안내합니다. EXTIS 연동으로 실시간 분석.',model:'Llama-3-Kor-Instruct',tools:['EX-DataLake 시계열 DB','EXTIS 조회 API'],mcpTools:['MCP-EXTIS','MCP-SearchFilter'],ragEnabled:true,hitl:true,a2a:true,responseMode:'knowledge',actionable:false,status:'Running',version:'v1.8',creator:'이도현',dept:'데이터플랫폼부',created:'2026-08-13',updated:'2026-09-03',requests24h:189,avgLatency:'0.8s',successRate:97.2,confidence:0.88,systemPrompt:'교통 시계열 데이터 분석 도우미입니다. VDS 결측·적재 지연 이력과 실시간 관측값을 참조하여 점검 절차를 안내하세요.',temperature:0.2,maxTokens:4096},
  {id:'AGT-003',name:'HR 질의응답 봇',desc:'인사/복리후생/규정 관련 직원 문의에 자동 응답합니다.',model:'EXAONE-3.0-7.8B',tools:['HR 규정 벡터 DB'],mcpTools:['MCP-Search'],ragEnabled:true,hitl:false,a2a:false,responseMode:'knowledge',actionable:false,status:'Running',version:'v1.3',creator:'임하늘',dept:'경영지원처',created:'2026-06-28',updated:'2026-08-27',requests24h:567,avgLatency:'0.5s',successRate:95.8,confidence:0.85,systemPrompt:'한국도로공사 인사 규정 전문 도우미입니다. 정확한 조항을 인용하여 답변하세요.',temperature:0.4,maxTokens:1024},
  {id:'AGT-004',name:'계약서 검토 에이전트',desc:'유지보수 용역 계약서 초안을 검토하고 리스크 조항을 식별합니다.',model:'GPT-OSS-120B',tools:['법률 규정 DB','계약 템플릿 DB'],mcpTools:['MCP-Search','MCP-DynamicFilter'],ragEnabled:true,hitl:true,a2a:false,responseMode:'knowledge',actionable:false,status:'Running',version:'v1.0',creator:'강민철',dept:'법무실',created:'2026-08-25',updated:'2026-09-02',requests24h:45,avgLatency:'2.1s',successRate:99.1,confidence:0.94,systemPrompt:'계약서 전문 검토 에이전트입니다. 불리한 조항이나 누락된 사항을 식별하세요.',temperature:0.1,maxTokens:4096},
  {id:'AGT-005',name:'점검 보고서 생성기',desc:'현장 점검 데이터를 기반으로 정형화된 보고서를 자동 생성합니다.',model:'Llama-3-Kor-Instruct',tools:['보고서 템플릿 DB','점검 이력 DB'],mcpTools:['MCP-CodeDev'],ragEnabled:false,hitl:false,a2a:true,responseMode:'direct',actionable:true,status:'Stopped',version:'v0.9',creator:'정민석',dept:'시설처 구조물관리부',created:'2026-08-18',updated:'2026-08-29',requests24h:0,avgLatency:'-',successRate:92.0,confidence:0.76,systemPrompt:'도로·시설물 점검 보고서를 작성하는 전문 에이전트입니다.',temperature:0.5,maxTokens:8192},
  {id:'AGT-006',name:'직무 교육 튜터',desc:'신입사원 및 현장 관리직 대상 직무 교육 질의응답을 제공합니다.',model:'EXAONE-3.0-7.8B',tools:['교육 자료 벡터 DB','웹 검색'],mcpTools:['MCP-Search','MCP-WebSearch'],ragEnabled:true,hitl:false,a2a:false,responseMode:'knowledge',actionable:false,status:'Running',version:'v1.5',creator:'윤서진',dept:'인재개발원',created:'2026-06-03',updated:'2026-08-21',requests24h:231,avgLatency:'0.6s',successRate:96.4,confidence:0.87,systemPrompt:'한국도로공사 직무 교육 튜터입니다. 쉽고 정확하게 설명하세요.',temperature:0.6,maxTokens:2048},
  {id:'AGT-007',name:'돌발상황 대응 가이드',desc:'2차사고 위험 등 긴급 상황 시 대응 절차를 실시간으로 안내합니다.',model:'GPT-OSS-120B',tools:['교통안전 매뉴얼 DB','VMS 경보 송출 API'],mcpTools:['MCP-Search','MCP-EXTIS'],ragEnabled:true,hitl:true,a2a:true,responseMode:'knowledge',actionable:true,status:'Running',version:'v3.0',creator:'박선영',dept:'교통센터 상황관리부',created:'2026-04-24',updated:'2026-09-04',requests24h:12,avgLatency:'0.9s',successRate:99.8,confidence:0.96,systemPrompt:'돌발상황 대응 전문 에이전트입니다. 신속하고 정확한 대응 절차를 안내하세요.',temperature:0.1,maxTokens:2048},
  {id:'AGT-008',name:'정비 작업지시서 자동 작성',desc:'업무 지시를 받아 EXMMS에서 정비 작업지시서를 자동으로 작성합니다.',model:'GPT-OSS-120B',tools:['EXMMS 연동 API','유지관리 지침 DB'],mcpTools:['MCP-EXMMSConnector','MCP-GWSync'],ragEnabled:false,hitl:true,a2a:true,responseMode:'direct',actionable:true,status:'Running',version:'v1.0',creator:'오재현',dept:'도로처',created:'2026-08-29',updated:'2026-09-06',requests24h:78,avgLatency:'3.2s',successRate:96.0,confidence:0.90,systemPrompt:'정비 작업지시서 작성 전문 에이전트입니다. EXMMS와 연동하여 작업지시서를 자동 생성합니다.',temperature:0.1,maxTokens:2048},
];

export let MOCK_AGENT_DEPLOYS = [
  {id:'DEP-001',agentId:'AGT-001',agentName:'도로지침 검색 에이전트',model:'GPT-OSS-120B',version:'v2.1',env:'Production',endpoint:'/api/agent/road-guideline',deployDate:'2026-09-01 14:30',deployer:'한지훈',status:'Running',replicas:3,cpu:'2 Core',memory:'8 GB',gpu:'H200 x1',uptime:'5d 12h',requests24h:342,errorRate:1.5},
  {id:'DEP-002',agentId:'AGT-002',agentName:'교통데이터 분석 어시스턴트',model:'Llama-3-Kor-Instruct',version:'v1.8',env:'Production',endpoint:'/api/agent/traffic-analysis',deployDate:'2026-09-03 09:15',deployer:'이도현',status:'Running',replicas:2,cpu:'4 Core',memory:'16 GB',gpu:'H200 x1',uptime:'3d 2h',requests24h:189,errorRate:2.8},
  {id:'DEP-003',agentId:'AGT-003',agentName:'HR 질의응답 봇',model:'EXAONE-3.0-7.8B',version:'v1.3',env:'Production',endpoint:'/api/agent/hr-qa',deployDate:'2026-08-27 11:00',deployer:'임하늘',status:'Running',replicas:2,cpu:'1 Core',memory:'4 GB',gpu:'-',uptime:'10d 1h',requests24h:567,errorRate:4.2},
  {id:'DEP-004',agentId:'AGT-004',agentName:'계약서 검토 에이전트',model:'GPT-OSS-120B',version:'v1.0',env:'Staging',endpoint:'/api/agent/contract-review',deployDate:'2026-09-02 16:45',deployer:'강민철',status:'Running',replicas:1,cpu:'2 Core',memory:'8 GB',gpu:'H200 x1',uptime:'4d 5h',requests24h:45,errorRate:0.9},
  {id:'DEP-005',agentId:'AGT-005',agentName:'점검 보고서 생성기',model:'Llama-3-Kor-Instruct',version:'v0.9',env:'Staging',endpoint:'/api/agent/inspect-report',deployDate:'2026-08-29 10:00',deployer:'정민석',status:'Stopped',replicas:0,cpu:'-',memory:'-',gpu:'-',uptime:'-',requests24h:0,errorRate:0},
  {id:'DEP-006',agentId:'AGT-006',agentName:'직무 교육 튜터',model:'EXAONE-3.0-7.8B',version:'v1.5',env:'Production',endpoint:'/api/agent/edu-tutor',deployDate:'2026-08-21 08:30',deployer:'윤서진',status:'Running',replicas:2,cpu:'1 Core',memory:'4 GB',gpu:'-',uptime:'16d 3h',requests24h:231,errorRate:3.6},
  {id:'DEP-007',agentId:'AGT-007',agentName:'돌발상황 대응 가이드',model:'GPT-OSS-120B',version:'v3.0',env:'Production',endpoint:'/api/agent/incident-guide',deployDate:'2026-09-04 00:00',deployer:'박선영',status:'Running',replicas:4,cpu:'4 Core',memory:'16 GB',gpu:'H200 x2',uptime:'2d 11h',requests24h:12,errorRate:0.2},
  {id:'DEP-008',agentId:'AGT-008',agentName:'정비 작업지시서 자동 작성',model:'GPT-OSS-120B',version:'v1.0',env:'Staging',endpoint:'/api/agent/work-order',deployDate:'2026-09-06 10:30',deployer:'오재현',status:'Running',replicas:2,cpu:'2 Core',memory:'8 GB',gpu:'H200 x1',uptime:'1d 0h',requests24h:78,errorRate:4.0},
];

export let MOCK_WORKFLOWS = [
  {id:'WF-001',name:'VDS 데이터 품질 이상 종합 대응',desc:'결측률 임계 초과 감지 → 원인 점검 → 리포트 생성 → 알림 발송 (A2A 멀티에이전트)',status:'Running',creator:'이도현',created:'2026-08-25',lastRun:'2026-09-06 09:30',runs24h:8,successRate:95.0,protocol:'A2A',hitl:true,
    steps:[{id:'s1',name:'결측률 임계 초과 감지',type:'trigger',agentId:null},{id:'s2',name:'교통데이터 분석 어시스턴트',type:'agent',agentId:'AGT-002'},{id:'s3',name:'HITL 담당자 검토',type:'hitl',agentId:null},{id:'s4',name:'심각도 ≥ 높음',type:'condition',agentId:null},{id:'s5',name:'점검 보고서 생성기',type:'agent',agentId:'AGT-005'},{id:'s6',name:'돌발상황 대응 가이드',type:'agent',agentId:'AGT-007'},{id:'s7',name:'MCP 알림 발송',type:'mcp',agentId:null}]},
  {id:'WF-002',name:'신입사원 온보딩 자동화',desc:'HR 질의 → 교육 콘텐츠 추천 → 지침 안내 (MCP 그룹웨어 연동)',status:'Running',creator:'임하늘',created:'2026-08-13',lastRun:'2026-09-05 15:00',runs24h:15,successRate:98.0,protocol:'MCP',hitl:false,
    steps:[{id:'s1',name:'신규 입사자 트리거',type:'trigger',agentId:null},{id:'s2',name:'MCP-GWSync',type:'mcp',agentId:null},{id:'s3',name:'HR 질의응답 봇',type:'agent',agentId:'AGT-003'},{id:'s4',name:'직무 교육 튜터',type:'agent',agentId:'AGT-006'},{id:'s5',name:'도로지침 검색 에이전트',type:'agent',agentId:'AGT-001'}]},
  {id:'WF-003',name:'용역 계약 검토 승인 프로세스',desc:'계약서 업로드 → AI 검토 → 리스크 분류 → HITL 승인',status:'Stopped',creator:'강민철',created:'2026-08-29',lastRun:'2026-09-03 11:20',runs24h:0,successRate:100.0,protocol:'A2A',hitl:true,
    steps:[{id:'s1',name:'계약서 업로드',type:'trigger',agentId:null},{id:'s2',name:'계약서 검토 에이전트',type:'agent',agentId:'AGT-004'},{id:'s3',name:'리스크 레벨 분기',type:'condition',agentId:null},{id:'s4',name:'HITL 법무실 검토',type:'hitl',agentId:null},{id:'s5',name:'승인 요청 발송',type:'action',agentId:null}]},
  {id:'WF-004',name:'정비 작업지시 자동화 파이프라인',desc:'정비 요청 → EXMMS 이력 조회 → 작업지시서 작성 → 승인 (Actionable AI)',status:'Running',creator:'오재현',created:'2026-09-03',lastRun:'2026-09-07 08:30',runs24h:23,successRate:96.5,protocol:'MCP+A2A',hitl:true,
    steps:[{id:'s1',name:'정비 요청 수신',type:'trigger',agentId:null},{id:'s2',name:'MCP-EXMMSConnector',type:'mcp',agentId:null},{id:'s3',name:'정비 작업지시서 자동 작성',type:'agent',agentId:'AGT-008'},{id:'s4',name:'작업 등급 ≥ 2등급',type:'condition',agentId:null},{id:'s5',name:'HITL 결재 요청',type:'hitl',agentId:null},{id:'s6',name:'EXMMS 작업지시 등록',type:'action',agentId:null}]},
];

// ==================== HELPER COMPONENTS ====================
export let UPSTAGE_OCR_MOCK = {
  totalPages:3, totalBlocks:16, elapsed:2.4,
  pages:[
    {page:1,
     text:"제1조 (목적)\n이 규정은 한국도로공사의 고속도로 교통 시계열 데이터 수집·품질관리에 관한 사항을 규정함을 목적으로 한다.\n\n제2조 (적용 범위)\n이 규정은 공사가 운영하는 모든 VDS 관측지점에 적용한다.\n\n제3조 (정의)\n이 규정에서 사용하는 용어의 정의는 다음과 같다.",
     blocks:[
       {text:"제1조 (목적)",bbox:{x:14,y:14,w:35,h:6}},
       {text:"이 규정은 한국도로공사의 고속도로 교통 시계열 데이터 수집·품질관리에 관한 사항을 규정함을 목적으로 한다.",bbox:{x:14,y:22,w:70,h:8}},
       {text:"제2조 (적용 범위)",bbox:{x:14,y:36,w:38,h:6}},
       {text:"이 규정은 공사가 운영하는 모든 VDS 관측지점에 적용한다.",bbox:{x:14,y:44,w:65,h:6}},
       {text:"제3조 (정의)",bbox:{x:14,y:56,w:28,h:6}},
       {text:"이 규정에서 사용하는 용어의 정의는 다음과 같다.",bbox:{x:14,y:64,w:60,h:6}},
     ]},
    {page:2,
     text:"제4조 (점검 주기)\n① VDS 관측지점: 정기 점검 분기 1회, 수시 점검 결측 발생 시\n② 프로브 통행속도: 정기 점검 반기 1회, 표본 검증 분기 1회\n③ 노면기상(RWIS): 정기 점검 분기 1회, 동절기 전 정밀 점검",
     blocks:[
       {text:"제4조 (점검 주기)",bbox:{x:14,y:10,w:36,h:6}},
       {text:"① VDS 관측지점: 정기 점검 분기 1회, 수시 점검 결측 발생 시",bbox:{x:18,y:20,w:66,h:6}},
       {text:"② 프로브 통행속도: 정기 점검 반기 1회, 표본 검증 분기 1회",bbox:{x:18,y:29,w:62,h:6}},
       {text:"③ 노면기상(RWIS): 정기 점검 분기 1회, 동절기 전 정밀 점검",bbox:{x:18,y:38,w:60,h:6}},
     ]},
    {page:3,
     text:"제5조 (점검 결과 보고)\n점검 완료 후 14일 이내에 점검 결과 보고서를 작성하여 디지털계획처장에게 제출하여야 한다.\n\n[별표 1] VDS 관측지점 점검 체크리스트",
     blocks:[
       {text:"제5조 (점검 결과 보고)",bbox:{x:14,y:10,w:44,h:6}},
       {text:"점검 완료 후 14일 이내에 결과보고서를 제출하여야 한다.",bbox:{x:14,y:20,w:70,h:8}},
       {text:"[별표 1] VDS 관측지점 점검 체크리스트",bbox:{x:14,y:36,w:52,h:6}},
       {text:"(개인 식별 정보 처리됨 — PII 마스킹 적용)",bbox:{x:14,y:46,w:65,h:6}},
       {text:"담당자 서명란",bbox:{x:14,y:58,w:28,h:6}},
       {text:"디지털계획처장 확인",bbox:{x:14,y:66,w:34,h:6}},
     ]},
  ]
};

// ── Document Parse 시뮬레이션 결과 ──
export let UPSTAGE_PARSE_MOCK = {
  statistics:{paragraphs:24,headings:8,tables:3,figures:2,total:37},
  elements:[
    {category:'heading1',content:'교통데이터 품질관리규정',page:1},
    {category:'heading2',content:'제1장 총칙',page:1},
    {category:'paragraph',content:'제1조 (목적) 이 규정은 한국도로공사의 고속도로 교통 시계열 데이터 수집·품질관리에 관한 사항을 규정함을 목적으로 한다.',page:1},
    {category:'paragraph',content:'제2조 (적용 범위) 이 규정은 공사가 운영하는 모든 VDS 관측지점에 적용한다.',page:1},
    {category:'heading2',content:'제2장 점검 기준',page:2},
    {category:'table',content:'| 점검 대상 | 점검 주기 | 담당부서 |\n|---------|---------|--------|\n| VDS 관측지점 | 분기 1회 | 데이터플랫폼부 |\n| 프로브 통행속도 | 반기 1회 | 도로교통연구원 |',page:2},
    {category:'paragraph',content:'제4조 (점검 방법) 점검은 관련 법령 및 내부 기준에 따라 실시한다.',page:2},
    {category:'figure',content:'[그림 1] VDS 품질 점검 업무 흐름도',page:2},
    {category:'heading2',content:'제3장 보고 의무',page:3},
    {category:'paragraph',content:'제5조 (보고 의무) 점검 완료 후 14일 이내에 결과보고서를 제출하여야 한다.',page:3},
    {category:'list',content:'• 정기점검 결과 보고서\n• 대표 관측지점 선정 조서\n• 이상 발견 시 즉시 보고',page:3},
    {category:'figure',content:'[그림 2] 보고 체계도',page:3},
  ],
  outputs:{
    markdown:`# 교통데이터 품질관리규정\n\n## 제1장 총칙\n\n**제1조 (목적)** 이 규정은 한국도로공사의 고속도로 교통 시계열 데이터 수집·품질관리에 관한 사항을 규정함을 목적으로 한다.\n\n**제2조 (적용 범위)** 이 규정은 공사가 운영하는 모든 VDS 관측지점에 적용한다.\n\n## 제2장 점검 기준\n\n| 점검 대상 | 점검 주기 | 담당부서 |\n|---------|---------|--------|\n| VDS 관측지점 | 분기 1회 | 데이터플랫폼부 |\n| 프로브 통행속도 | 반기 1회 | 도로교통연구원 |\n\n> [그림 1] VDS 품질 점검 업무 흐름도\n\n## 제3장 보고 의무\n\n**제5조 (보고 의무)** 점검 완료 후 14일 이내에 결과보고서를 제출하여야 한다.\n\n- 정기점검 결과 보고서\n- 대표 관측지점 선정 조서\n- 이상 발견 시 즉시 보고`,
    html:`<h1>교통데이터 품질관리규정</h1>\n<h2>제1장 총칙</h2>\n<p><strong>제1조 (목적)</strong> 이 규정은 한국도로공사의 고속도로 교통 시계열 데이터 수집·품질관리에 관한 사항을 규정함을 목적으로 한다.</p>\n<p><strong>제2조 (적용 범위)</strong> 이 규정은 공사가 운영하는 모든 VDS 관측지점에 적용한다.</p>\n<h2>제2장 점검 기준</h2>\n<table><tr><th>점검 대상</th><th>점검 주기</th><th>담당부서</th></tr><tr><td>VDS 관측지점</td><td>분기 1회</td><td>데이터플랫폼부</td></tr></table>`,
    text:`교통데이터 품질관리규정\n\n제1장 총칙\n\n제1조 (목적) 이 규정은 한국도로공사의 고속도로 교통 시계열 데이터 수집·품질관리에 관한 사항을 규정함을 목적으로 한다.\n\n제2조 (적용 범위) 이 규정은 공사가 운영하는 모든 VDS 관측지점에 적용한다.\n\n제2장 점검 기준\nVDS 관측지점 | 분기 1회 | 데이터플랫폼부\n프로브 통행속도 | 반기 1회 | 도로교통연구원`,
  }
};

// ── AI 기본법 대응 (「인공지능 발전과 신뢰 기반 조성 등에 관한 기본법」 2026-01-22 시행) ──
export let MOCK_AIACT_SYSTEMS = [
  {id:'hi-001',name:'통행속도 예측 AI',dept:'디지털계획처 데이터플랫폼부',status:'고영향 확인',confirmedAt:'2026-09-03',manager:'이도현 차장',
   purpose:'고속도로 구간 통행속도 예측 및 정체·지정체 사전 안내 지원',
   basis:'공공서비스 영역 — 실시간 교통정보는 국민의 이동 안전과 경로 선택에 직접 영향',
   measures:[
     {k:'위험관리 방안 수립·운영',done:true},
     {k:'AI 판단 기준·근거 설명 방안 마련',done:true},
     {k:'이용자 보호 방안 수립·운영',done:true},
     {k:'사람의 관리·감독 체계(최종 검증 인력 지정)',done:true},
     {k:'안전성·신뢰성 확보 조치 문서 작성·보관',done:false},
   ]},
  {id:'hi-002',name:'돌발상황 판단지원 AI',dept:'교통센터 상황관리부',status:'고영향 확인',confirmedAt:'2026-09-11',manager:'박선영 과장',
   purpose:'급감속 클러스터 분석을 통한 돌발상황 판단 및 2차사고 위험도 산출',
   basis:'국민의 생명·신체 안전에 중대한 영향 — VMS 경보 송출 판단에 직접 관여',
   measures:[
     {k:'위험관리 방안 수립·운영',done:true},
     {k:'AI 판단 기준·근거 설명 방안 마련',done:true},
     {k:'이용자 보호 방안 수립·운영',done:false},
     {k:'사람의 관리·감독 체계(최종 검증 인력 지정)',done:true},
     {k:'안전성·신뢰성 확보 조치 문서 작성·보관',done:false},
   ]},
  {id:'hi-003',name:'통행료 감면자격 확인 챗봇',dept:'통행료사업처',status:'검토 중',confirmedAt:'-',manager:'노유진 과장',
   purpose:'경차·장애인 등 통행료 감면 자격요건 사전 안내 및 감면액 계산 지원',
   basis:'공공서비스 제공에 필요한 자격 확인·판단 해당 여부 검토 중 (과기정통부 확인 요청 검토)',
   measures:[
     {k:'위험관리 방안 수립·운영',done:false},
     {k:'AI 판단 기준·근거 설명 방안 마련',done:true},
     {k:'이용자 보호 방안 수립·운영',done:true},
     {k:'사람의 관리·감독 체계(최종 검증 인력 지정)',done:false},
     {k:'안전성·신뢰성 확보 조치 문서 작성·보관',done:false},
   ]},
  {id:'hi-004',name:'교통량 전망 리포트 모델',dept:'도로교통연구원',status:'검토 중',confirmedAt:'-',manager:'조한별 차장',
   purpose:'주간·월간 고속도로 교통량 전망 리포트 초안 생성 및 통계 요약',
   basis:'통계 기반 교통 전망 제공 — 개인 권리·의무에 대한 직접 영향 여부 판단 진행 중',
   measures:[
     {k:'위험관리 방안 수립·운영',done:false},
     {k:'AI 판단 기준·근거 설명 방안 마련',done:true},
     {k:'이용자 보호 방안 수립·운영',done:false},
     {k:'사람의 관리·감독 체계(최종 검증 인력 지정)',done:true},
     {k:'안전성·신뢰성 확보 조치 문서 작성·보관',done:false},
   ]},
  {id:'hi-005',name:'RoadQ 업무지원 챗봇',dept:'디지털계획처 AI인프라부',status:'비해당',confirmedAt:'2026-08-21',manager:'한지훈 팀장',
   purpose:'임직원 내부 업무 질의응답·문서 초안 작성 보조',
   basis:'내부 업무 보조 목적 — 국민의 생명·신체·기본권에 미치는 영향 없음',
   measures:[
     {k:'위험관리 방안 수립·운영',done:true},
     {k:'AI 판단 기준·근거 설명 방안 마련',done:true},
     {k:'이용자 보호 방안 수립·운영',done:true},
     {k:'사람의 관리·감독 체계(최종 검증 인력 지정)',done:true},
     {k:'안전성·신뢰성 확보 조치 문서 작성·보관',done:true},
   ]},
  {id:'hi-006',name:'문서 OCR·마스킹 에이전트',dept:'경영지원처',status:'비해당',confirmedAt:'2026-08-21',manager:'임하늘 대리',
   purpose:'스캔 문서 텍스트 추출 및 개인정보 자동 마스킹',
   basis:'문서 전처리 도구 — 의사결정에 관여하지 않아 고영향 요건 미충족',
   measures:[
     {k:'위험관리 방안 수립·운영',done:true},
     {k:'AI 판단 기준·근거 설명 방안 마련',done:true},
     {k:'이용자 보호 방안 수립·운영',done:true},
     {k:'사람의 관리·감독 체계(최종 검증 인력 지정)',done:true},
     {k:'안전성·신뢰성 확보 조치 문서 작성·보관',done:true},
   ]},
];

export let MOCK_AIACT_LABELING = [
  {id:'lb-01',target:'RoadQ 채팅 응답',type:'텍스트',method:'응답 하단 고지문 자동 삽입',enabled:true,coverage:100,weekly:12840},
  {id:'lb-02',target:'보고서 생성 에이전트 산출물',type:'문서',method:'표지 고지문 + 문서 속성 메타데이터 기록',enabled:true,coverage:100,weekly:342},
  {id:'lb-03',target:'교통데이터 분석반 정례회의 회의록 초안',type:'문서',method:'머리말(헤더) 고지문 삽입',enabled:true,coverage:98.2,weekly:156},
  {id:'lb-04',target:'교통 시계열 분석 차트 이미지',type:'이미지',method:'비가시성 워터마크(C2PA 메타데이터)',enabled:true,coverage:94.6,weekly:88},
  {id:'lb-05',target:'번역·요약 결과물',type:'텍스트',method:'결과 상단 AI 생성 배지 표시',enabled:true,coverage:100,weekly:1204},
  {id:'lb-06',target:'대외 발송 공문 초안',type:'문서',method:'초안 단계 고지 → 담당자 검토 확인 시 최종본 전환',enabled:false,coverage:0,weekly:0,note:'법무실 표시 문구 검토 중 — 2026-10 적용 예정'},
];

export let MOCK_AIACT_ASSESSMENTS = [
  {id:'ia-001',system:'통행속도 예측 AI',round:'2026 하반기 정기 영향평가',status:'완료',date:'2026-09-07',assessor:'외부 전문기관 합동평가',grade:'적합',
   scores:[['기본권 영향 관리',88],['안전성',92],['편향성 관리',85],['투명성·설명가능성',90],['책무성',86]],
   findings:[
     {text:'예측 근거 설명문에 구간·시간대 선정 사유 보강 필요',status:'조치 완료'},
     {text:'연 1회 편향성 재검증 주기의 내부 규정 문서화',status:'조치 완료'},
   ]},
  {id:'ia-002',system:'돌발상황 판단지원 AI',round:'2026 하반기 정기 영향평가',status:'진행 중',progress:65,date:'2026-10-13 완료 예정',assessor:'AI인프라부 자체평가',grade:'-',
   scores:[['기본권 영향 관리',82],['안전성',88],['편향성 관리',null],['투명성·설명가능성',null],['책무성',null]],
   findings:[
     {text:'야간·악천후 시간대 표본의 편향성 검증 진행 중',status:'진행 중'},
   ]},
  {id:'ia-003',system:'통행료 감면자격 확인 챗봇',round:'고영향 해당 여부 사전검토',status:'예정',date:'2026-10-30 착수 예정',assessor:'AI인프라부',grade:'-',
   scores:[],
   findings:[]},
];


/* ── 페이지 인라인 이관 상수 (2026-07-06) — 관리자 페이지 파일에 하드코딩돼 있던 발주처 콘텐츠 ── */
// 채팅 앱 생성 모달 '관리 그룹' 선택지 — string[] (applications.jsx ChatAppPage)
export let ADMIN_MGMT_GROUPS = ['AI Engineer','QA','데이터플랫폼부','경영지원처'];
// 보고서 생성 목록 초기 rows — [{id,title,type,template,status,date,pages}] (applications.jsx ReportGenPage)
export let ADMIN_REPORT_ROWS = [
  {id:'RPT-001',title:'9월 교통데이터 품질 현황 보고서',type:'요약',template:'데이터품질',status:'완료',date:'2026-09-03',pages:12},
  {id:'RPT-002',title:'경부선 통행속도 변동 분석 리포트',type:'분석',template:'현장점검',status:'완료',date:'2026-09-02',pages:24},
  {id:'RPT-003',title:'3분기 AI 활용 성과보고',type:'보고서',template:'성과분석',status:'생성 중',date:'2026-09-04',pages:0},
  {id:'RPT-004',title:'교량 계측장비 유지보수 매뉴얼 번역',type:'번역',template:'기술문서',status:'완료',date:'2026-09-01',pages:45},
  {id:'RPT-005',title:'신입사원 교육자료 요약',type:'요약',template:'교육',status:'대기 중',date:'2026-09-04',pages:0},
];
// 보고서 템플릿 선택지 — string[] ([0]이 생성 폼 기본값) (applications.jsx ReportGenPage)
export let ADMIN_REPORT_TEMPLATES = ['데이터품질','현장점검','성과분석','기술문서','교육'];
// 프롬프트 편집 미리보기 도입부 문장 — string (content.jsx 프롬프트 탭)
export let ADMIN_PROMPT_PREVIEW_INTRO = '당신은 한국도로공사의 AI 어시스턴트입니다.';
// 에이전트 빌더 '내부 도구 연결' 목록 — [{name,desc}] 3건, [0]은 항상 활성 (deployment.jsx TaskflowBuilderPage)
export let ADMIN_INTERNAL_TOOLS = [
  {name:'도로 지침 벡터 DB',desc:'설계기준·유지관리지침 검색'},
  {name:'EX-DataLake 시계열 DB',desc:'VDS 5분 집계 이력 조회'},
  {name:'알림 서비스 API',desc:'Slack/Email 알림 발송'},
];
// 에이전트 이름 예시 — string, 생성 모달 placeholder + 새 배포 기본 agentName (deployment.jsx)
export let ADMIN_AGENT_NAME_EXAMPLE = '도로지침 검색 에이전트';
// 워크플로우 이름 예시 placeholder — string (deployment.jsx WorkflowPage)
export let ADMIN_WORKFLOW_NAME_EXAMPLE = '돌발상황 자동 분류';
// 데이터셋 목록 초기 rows — [{id,n:이름,d:설명,t:형식,s:크기,c:건수,date}] (infra.jsx DatasetPage)
export let ADMIN_DATASET_ROWS = [
  {id:1,n:'RoadSpec_Guidelines_QA_v1',d:'도로 지침 QA 데이터셋',t:'JSONL',s:'124MB',c:'15,000',date:'2026-09-03'},
  {id:2,n:'Bridge_Maintenance_Corpus',d:'교량 유지보수 매뉴얼',t:'TXT',s:'512MB',c:'N/A',date:'2026-09-02'},
  {id:3,n:'Employee_Inquiry_Logs',d:'임직원 질의 로그',t:'CSV',s:'45MB',c:'8,200',date:'2026-09-01'},
  {id:4,n:'Gemma_Instruction_Tuning',d:'Gemma 한국어 인스트럭션',t:'JSONL',s:'230MB',c:'25,000',date:'2026-08-31'},
  {id:5,n:'VDS_Timeseries_5min_2026',d:'VDS 5분 집계 학습셋',t:'Parquet',s:'1.2GB',c:'2,840만',date:'2026-08-30'},
];
// 벡터 검색 데모 결과 — [{id,score,content}] 3건 (infra.jsx VectorDbPage)
export let ADMIN_VECTOR_SEARCH_RESULTS = [
  {id:'vec_8a1',score:0.92,content:'...본 지침은 한국도로공사의 고속도로 유지관리 업무 수행에 필요한 사항을 규정함을 목적으로 한다...'},
  {id:'vec_3b2',score:0.88,content:'...제 2 조 (적용범위) 이 지침은 공사의 전 임직원 및 도로 현장 협력업체에 적용하며...'},
  {id:'vec_9c3',score:0.75,content:'...VDS 관측지점 정기 점검은 분기 1회 실시를 원칙으로 하며, 통신 불량은 3일 내 출동을 원칙으로 한다...'},
];
// 지식폴더-에이전트 연동 카드 — [{agent,folders:string[]}] 3건, 아이콘·색은 페이지 소유 (knowledge.jsx)
export let ADMIN_AGENT_FOLDER_LINKS = [
  {agent:'사규 기반 문서 사전 검토',folders:['도로설계기준','법률/계약']},
  {agent:'교통데이터 분석 어시스턴트',folders:['도로유지관리지침','도로설계기준']},
  {agent:'HR 질의응답 봇',folders:['인사규정','교육자료']},
];
// 관리자 개인 지식영역 문서 — [{name,size,date}] (system.jsx UserPage)
export let ADMIN_MY_DOCS = [
  {name:'도로유지관리지침_요약.pdf',size:'2.4MB',date:'2026-09-01'},
  {name:'교량점검_매뉴얼.docx',size:'5.1MB',date:'2026-08-29'},
  {name:'AI_활용_사례집.pptx',size:'12MB',date:'2026-08-21'},
];
// 승인 관리 초기 rows — [{id,type,user,dept,date,status,desc}] (users.jsx ApprovalPage)
export let ADMIN_APPROVAL_ROWS = [
  {id:'APR-101',type:'모델 배포',user:'서지우',dept:'AI인프라부',date:'2026-09-02',status:'대기 중',desc:'GPT-OSS-120B 모델 운영 환경 배포 요청'},
  {id:'APR-102',type:'GPU 할당',user:'조한별',dept:'도로교통연구원',date:'2026-09-03',status:'대기 중',desc:'VLM 학습을 위한 A100 x4 GPU 할당 요청'},
  {id:'APR-100',type:'GPU 할당',user:'조한별',dept:'도로교통연구원',date:'2026-09-01',status:'승인',desc:'임베딩 학습용 GPU 할당'},
  {id:'APR-099',type:'데이터 접근',user:'김태우',dept:'수도권본부 도로교통부',date:'2026-08-31',status:'승인',desc:'도로 지침 데이터셋 접근 권한 요청'},
  {id:'APR-098',type:'API 키 발급',user:'노유진',dept:'고객지원부',date:'2026-08-30',status:'거부',desc:'외부 API 키 발급 요청'},
];
// 부서별 리소스 할당량 rows — [{id,name,gpu:{used,total},mem:{used,total},storage:{used,total}}] (users.jsx QuotaPage)
export let ADMIN_QUOTA_DEPTS = [
  {id:1,name:'AI인프라부',gpu:{used:4,total:8},mem:{used:256,total:512},storage:{used:8,total:10}},
  {id:2,name:'데이터플랫폼부',gpu:{used:1,total:2},mem:{used:64,total:256},storage:{used:3,total:5}},
  {id:3,name:'도로교통연구원',gpu:{used:2,total:4},mem:{used:180,total:256},storage:{used:4.5,total:5}},
  {id:4,name:'교통센터 상황관리부',gpu:{used:0,total:1},mem:{used:32,total:128},storage:{used:1,total:5}},
  {id:5,name:'경영지원처',gpu:{used:0,total:1},mem:{used:16,total:64},storage:{used:0.5,total:2}},
  {id:6,name:'시설처 구조물관리부',gpu:{used:1,total:2},mem:{used:96,total:128},storage:{used:2,total:3}},
];
// 지식영역×부서 권한 매트릭스 — {headers:string[6], rows:[{dept,perm:boolean[6]}]} (users.jsx AccessSecurityPage)
export let ADMIN_PERM_MATRIX = {
  headers:['도로설계기준','도로유지관리지침','인사규정','법률/계약','교육자료','교통안전 매뉴얼'],
  rows:[
    {dept:'도로처',perm:[true,true,false,false,true,true]},
    {dept:'데이터플랫폼부',perm:[true,true,false,false,true,true]},
    {dept:'경영지원처',perm:[false,false,true,false,true,false]},
    {dept:'법무실',perm:[false,false,false,true,false,false]},
    {dept:'인재개발원',perm:[false,false,false,false,true,false]},
    {dept:'시설처 구조물관리부',perm:[false,true,false,false,false,true]},
  ],
};
// 사용량 모니터링 할당량 권장 문구 — string, '할당량 관리 권장:' 라벨 뒤 본문 (users.jsx UsageMonitorPage)
export let ADMIN_QUOTA_ADVICE = 'AI인프라부(3,240건/월)와 데이터플랫폼부(2,880건/월)가 전체 사용량의 45%를 차지합니다. 부서별 할당량 설정을 통해 리소스를 균형 있게 배분하세요.';
// 그룹 관리 카드 — [{name,type,members,areas:string[],perms}] 4건 (users.jsx HrSyncPage)
export let ADMIN_USER_GROUPS = [
  {name:'교통운영 그룹',type:'부서 그룹',members:27,areas:['도로설계기준','교통안전 매뉴얼','도로유지관리지침'],perms:'읽기+쓰기'},
  {name:'법무지원그룹',type:'기능 그룹',members:6,areas:['법률/계약'],perms:'읽기 전용'},
  {name:'관리자 그룹',type:'시스템 그룹',members:3,areas:['전체 영역'],perms:'전체 권한'},
  {name:'외부 협력업체',type:'외부 그룹',members:12,areas:['교육자료 (일부)'],perms:'제한적 읽기'},
];
// AI기본법 텍스트·문서 표준 고지문 — string, 'ⓘ ' 접두는 페이지 소유 (compliance.jsx)
export let AIACT_STD_PHRASE = '본 내용은 한국도로공사 생성형 AI 플랫폼(RoadQ)을 활용하여 작성되었습니다. 중요한 의사결정에는 담당자의 검토·확인이 필요합니다.';

// MCP 서버 목록 — {id,n:서버명,u:URL,t:연결 도구,s:상태}[3] (deployment MCPServerPage)
export let ADMIN_MCP_SERVERS = [
  {id:1,n:'Local MCP Server',u:'http://localhost:8080',t:'Search, Web Crawler',s:'Running'},
  {id:2,n:'External API Gateway',u:'https://api.ex.co.kr/mcp',t:'EXMMS Connector, GW Sync',s:'Running'},
  {id:3,n:'Test Server',u:'http://192.168.10.50:3000',t:'CodeDev',s:'Stopped'},
];

/* ════════════════════════════════════════════════════════════════
   도메인 리졸버 — 관리자 콘텐츠 이관 (2026-07-06)
   위 export let 상수들은 코어 기본값(한국도로공사). App.jsx가 렌더 시작 시
   applyAdminDomain(domain)을 호출하면 domain.adminContent의 동일
   키(상수명 그대로)로 오버라이드된다. 새 상수 추가 시 이 블록의
   __REB_DEFAULTS와 applyAdminDomain 두 곳에도 반드시 등록할 것.
   ════════════════════════════════════════════════════════════════ */
// __RESOLVER_START__
const __REB_DEFAULTS = {
  MOCK_REPRO_SNAPSHOTS, MOCK_REPRO_POLICY,
  MOCK_SAFETY_DUTIES, MOCK_SAFETY_RISK_LOG, MOCK_SAFETY_TRAINING,
  MOCK_AUG_STRATEGIES, MOCK_AUG_ROUTES, MOCK_CAG_CACHE,
  MOCK_DATA_ASSETS, MOCK_DATA_LINEAGE,
  MOCK_PRED_MODELS, MOCK_PRED_TREND, MOCK_PRED_DRIFT, MOCK_RETRAIN_RUNS,
  MOCK_DATA_FLOWS, MOCK_BOUNDARY_POLICY, MOCK_EXTERNAL_ACCESS,
  ADMIN_PERSONA,
  ADMIN_MCP_SERVERS,
  MOCK_GPU_NODES,
  MOCK_EMBEDDING_JOBS,
  MOCK_MCP_TOOLS,
  MOCK_MODELS,
  MOCK_PROMPTS,
  MOCK_CHAT_APPS,
  MOCK_NODES,
  MOCK_GUARDRAIL_LOGS,
  MOCK_LLM_ADMIN_MODELS,
  MOCK_FILTER_RULES,
  MOCK_RERANK_PIPELINES,
  MOCK_RAG_GLOBAL,
  MOCK_RAG_AREAS,
  MOCK_OUTPUT_GUARDRAILS,
  MOCK_CONFIDENCE_CONFIG,
  MOCK_CODESPACES,
  MOCK_VOLUMES,
  MOCK_USERS,
  MOCK_PERMISSION_REQUESTS,
  MOCK_KNOWLEDGE_AREAS,
  MOCK_KB_FOLDERS,
  MOCK_KB_DOCS,
  MOCK_BATCH_JOBS,
  MOCK_SYNC_LOGS,
  MOCK_USAGE_STATS,
  MOCK_USAGE_HISTORY,
  MOCK_SATISFACTION_DATA,
  MOCK_DATA_SOURCES_INT,
  MOCK_DATA_SOURCES_EXT,
  MOCK_DOC_PIPELINE,
  MOCK_CHUNK_QUALITY,
  MOCK_CHUNK_PREVIEW,
  MOCK_EMBED_STATUS,
  MOCK_REPROCESS_QUEUE,
  MOCK_SERVICE_STATS,
  MOCK_NOTICES_MGMT,
  MOCK_QNA_MGMT,
  MOCK_SURVEYS_MGMT,
  MOCK_IP_BLOCKS,
  MOCK_WORK_LOG,
  MOCK_EXTRACT_LOG,
  MOCK_USAGE_BY_DEPT,
  MOCK_ABUSE_ALERTS,
  MOCK_APIS,
  MOCK_API_APPROVALS,
  MOCK_PROMPTS_MGMT,
  MOCK_HR_SYNC,
  MOCK_CONNECTED_SW,
  MOCK_ACCESS_LOGS,
  MOCK_QUALITY_REVIEWS,
  MOCK_ANNOUNCEMENTS,
  MOCK_LINKED_SW,
  MOCK_AGENTS,
  MOCK_AGENT_DEPLOYS,
  MOCK_WORKFLOWS,
  UPSTAGE_OCR_MOCK,
  UPSTAGE_PARSE_MOCK,
  MOCK_AIACT_SYSTEMS,
  MOCK_AIACT_LABELING,
  MOCK_AIACT_ASSESSMENTS,
  ADMIN_MGMT_GROUPS,
  ADMIN_REPORT_ROWS,
  ADMIN_REPORT_TEMPLATES,
  ADMIN_PROMPT_PREVIEW_INTRO,
  ADMIN_INTERNAL_TOOLS,
  ADMIN_AGENT_NAME_EXAMPLE,
  ADMIN_WORKFLOW_NAME_EXAMPLE,
  ADMIN_DATASET_ROWS,
  ADMIN_VECTOR_SEARCH_RESULTS,
  ADMIN_AGENT_FOLDER_LINKS,
  ADMIN_MY_DOCS,
  ADMIN_APPROVAL_ROWS,
  ADMIN_QUOTA_DEPTS,
  ADMIN_PERM_MATRIX,
  ADMIN_QUOTA_ADVICE,
  ADMIN_USER_GROUPS,
  AIACT_STD_PHRASE,
};

export function applyAdminDomain(domain) {
  const o = (domain && domain.adminContent) || {};
  MOCK_REPRO_SNAPSHOTS = o.MOCK_REPRO_SNAPSHOTS !== undefined ? o.MOCK_REPRO_SNAPSHOTS : __REB_DEFAULTS.MOCK_REPRO_SNAPSHOTS;
  MOCK_REPRO_POLICY = o.MOCK_REPRO_POLICY !== undefined ? o.MOCK_REPRO_POLICY : __REB_DEFAULTS.MOCK_REPRO_POLICY;
  MOCK_SAFETY_DUTIES = o.MOCK_SAFETY_DUTIES !== undefined ? o.MOCK_SAFETY_DUTIES : __REB_DEFAULTS.MOCK_SAFETY_DUTIES;
  MOCK_SAFETY_RISK_LOG = o.MOCK_SAFETY_RISK_LOG !== undefined ? o.MOCK_SAFETY_RISK_LOG : __REB_DEFAULTS.MOCK_SAFETY_RISK_LOG;
  MOCK_SAFETY_TRAINING = o.MOCK_SAFETY_TRAINING !== undefined ? o.MOCK_SAFETY_TRAINING : __REB_DEFAULTS.MOCK_SAFETY_TRAINING;
  MOCK_AUG_STRATEGIES = o.MOCK_AUG_STRATEGIES !== undefined ? o.MOCK_AUG_STRATEGIES : __REB_DEFAULTS.MOCK_AUG_STRATEGIES;
  MOCK_AUG_ROUTES = o.MOCK_AUG_ROUTES !== undefined ? o.MOCK_AUG_ROUTES : __REB_DEFAULTS.MOCK_AUG_ROUTES;
  MOCK_CAG_CACHE = o.MOCK_CAG_CACHE !== undefined ? o.MOCK_CAG_CACHE : __REB_DEFAULTS.MOCK_CAG_CACHE;
  MOCK_DATA_ASSETS = o.MOCK_DATA_ASSETS !== undefined ? o.MOCK_DATA_ASSETS : __REB_DEFAULTS.MOCK_DATA_ASSETS;
  MOCK_DATA_LINEAGE = o.MOCK_DATA_LINEAGE !== undefined ? o.MOCK_DATA_LINEAGE : __REB_DEFAULTS.MOCK_DATA_LINEAGE;
  MOCK_PRED_MODELS = o.MOCK_PRED_MODELS !== undefined ? o.MOCK_PRED_MODELS : __REB_DEFAULTS.MOCK_PRED_MODELS;
  MOCK_PRED_TREND = o.MOCK_PRED_TREND !== undefined ? o.MOCK_PRED_TREND : __REB_DEFAULTS.MOCK_PRED_TREND;
  MOCK_PRED_DRIFT = o.MOCK_PRED_DRIFT !== undefined ? o.MOCK_PRED_DRIFT : __REB_DEFAULTS.MOCK_PRED_DRIFT;
  MOCK_RETRAIN_RUNS = o.MOCK_RETRAIN_RUNS !== undefined ? o.MOCK_RETRAIN_RUNS : __REB_DEFAULTS.MOCK_RETRAIN_RUNS;
  MOCK_DATA_FLOWS = o.MOCK_DATA_FLOWS !== undefined ? o.MOCK_DATA_FLOWS : __REB_DEFAULTS.MOCK_DATA_FLOWS;
  MOCK_BOUNDARY_POLICY = o.MOCK_BOUNDARY_POLICY !== undefined ? o.MOCK_BOUNDARY_POLICY : __REB_DEFAULTS.MOCK_BOUNDARY_POLICY;
  MOCK_EXTERNAL_ACCESS = o.MOCK_EXTERNAL_ACCESS !== undefined ? o.MOCK_EXTERNAL_ACCESS : __REB_DEFAULTS.MOCK_EXTERNAL_ACCESS;
  ADMIN_PERSONA = o.ADMIN_PERSONA !== undefined ? o.ADMIN_PERSONA : __REB_DEFAULTS.ADMIN_PERSONA;
  ADMIN_MCP_SERVERS = o.ADMIN_MCP_SERVERS !== undefined ? o.ADMIN_MCP_SERVERS : __REB_DEFAULTS.ADMIN_MCP_SERVERS;
  MOCK_GPU_NODES = o.MOCK_GPU_NODES !== undefined ? o.MOCK_GPU_NODES : __REB_DEFAULTS.MOCK_GPU_NODES;
  MOCK_EMBEDDING_JOBS = o.MOCK_EMBEDDING_JOBS !== undefined ? o.MOCK_EMBEDDING_JOBS : __REB_DEFAULTS.MOCK_EMBEDDING_JOBS;
  MOCK_MCP_TOOLS = o.MOCK_MCP_TOOLS !== undefined ? o.MOCK_MCP_TOOLS : __REB_DEFAULTS.MOCK_MCP_TOOLS;
  MOCK_MODELS = o.MOCK_MODELS !== undefined ? o.MOCK_MODELS : __REB_DEFAULTS.MOCK_MODELS;
  MOCK_PROMPTS = o.MOCK_PROMPTS !== undefined ? o.MOCK_PROMPTS : __REB_DEFAULTS.MOCK_PROMPTS;
  MOCK_CHAT_APPS = o.MOCK_CHAT_APPS !== undefined ? o.MOCK_CHAT_APPS : __REB_DEFAULTS.MOCK_CHAT_APPS;
  MOCK_NODES = o.MOCK_NODES !== undefined ? o.MOCK_NODES : __REB_DEFAULTS.MOCK_NODES;
  MOCK_GUARDRAIL_LOGS = o.MOCK_GUARDRAIL_LOGS !== undefined ? o.MOCK_GUARDRAIL_LOGS : __REB_DEFAULTS.MOCK_GUARDRAIL_LOGS;
  MOCK_LLM_ADMIN_MODELS = o.MOCK_LLM_ADMIN_MODELS !== undefined ? o.MOCK_LLM_ADMIN_MODELS : __REB_DEFAULTS.MOCK_LLM_ADMIN_MODELS;
  MOCK_FILTER_RULES = o.MOCK_FILTER_RULES !== undefined ? o.MOCK_FILTER_RULES : __REB_DEFAULTS.MOCK_FILTER_RULES;
  MOCK_RERANK_PIPELINES = o.MOCK_RERANK_PIPELINES !== undefined ? o.MOCK_RERANK_PIPELINES : __REB_DEFAULTS.MOCK_RERANK_PIPELINES;
  MOCK_RAG_GLOBAL = o.MOCK_RAG_GLOBAL !== undefined ? o.MOCK_RAG_GLOBAL : __REB_DEFAULTS.MOCK_RAG_GLOBAL;
  MOCK_RAG_AREAS = o.MOCK_RAG_AREAS !== undefined ? o.MOCK_RAG_AREAS : __REB_DEFAULTS.MOCK_RAG_AREAS;
  MOCK_OUTPUT_GUARDRAILS = o.MOCK_OUTPUT_GUARDRAILS !== undefined ? o.MOCK_OUTPUT_GUARDRAILS : __REB_DEFAULTS.MOCK_OUTPUT_GUARDRAILS;
  MOCK_CONFIDENCE_CONFIG = o.MOCK_CONFIDENCE_CONFIG !== undefined ? o.MOCK_CONFIDENCE_CONFIG : __REB_DEFAULTS.MOCK_CONFIDENCE_CONFIG;
  MOCK_CODESPACES = o.MOCK_CODESPACES !== undefined ? o.MOCK_CODESPACES : __REB_DEFAULTS.MOCK_CODESPACES;
  MOCK_VOLUMES = o.MOCK_VOLUMES !== undefined ? o.MOCK_VOLUMES : __REB_DEFAULTS.MOCK_VOLUMES;
  MOCK_USERS = o.MOCK_USERS !== undefined ? o.MOCK_USERS : __REB_DEFAULTS.MOCK_USERS;
  MOCK_PERMISSION_REQUESTS = o.MOCK_PERMISSION_REQUESTS !== undefined ? o.MOCK_PERMISSION_REQUESTS : __REB_DEFAULTS.MOCK_PERMISSION_REQUESTS;
  MOCK_KNOWLEDGE_AREAS = o.MOCK_KNOWLEDGE_AREAS !== undefined ? o.MOCK_KNOWLEDGE_AREAS : __REB_DEFAULTS.MOCK_KNOWLEDGE_AREAS;
  MOCK_KB_FOLDERS = o.MOCK_KB_FOLDERS !== undefined ? o.MOCK_KB_FOLDERS : __REB_DEFAULTS.MOCK_KB_FOLDERS;
  MOCK_KB_DOCS = o.MOCK_KB_DOCS !== undefined ? o.MOCK_KB_DOCS : __REB_DEFAULTS.MOCK_KB_DOCS;
  MOCK_BATCH_JOBS = o.MOCK_BATCH_JOBS !== undefined ? o.MOCK_BATCH_JOBS : __REB_DEFAULTS.MOCK_BATCH_JOBS;
  MOCK_SYNC_LOGS = o.MOCK_SYNC_LOGS !== undefined ? o.MOCK_SYNC_LOGS : __REB_DEFAULTS.MOCK_SYNC_LOGS;
  MOCK_USAGE_STATS = o.MOCK_USAGE_STATS !== undefined ? o.MOCK_USAGE_STATS : __REB_DEFAULTS.MOCK_USAGE_STATS;
  MOCK_USAGE_HISTORY = o.MOCK_USAGE_HISTORY !== undefined ? o.MOCK_USAGE_HISTORY : __REB_DEFAULTS.MOCK_USAGE_HISTORY;
  MOCK_SATISFACTION_DATA = o.MOCK_SATISFACTION_DATA !== undefined ? o.MOCK_SATISFACTION_DATA : __REB_DEFAULTS.MOCK_SATISFACTION_DATA;
  MOCK_DATA_SOURCES_INT = o.MOCK_DATA_SOURCES_INT !== undefined ? o.MOCK_DATA_SOURCES_INT : __REB_DEFAULTS.MOCK_DATA_SOURCES_INT;
  MOCK_DATA_SOURCES_EXT = o.MOCK_DATA_SOURCES_EXT !== undefined ? o.MOCK_DATA_SOURCES_EXT : __REB_DEFAULTS.MOCK_DATA_SOURCES_EXT;
  MOCK_DOC_PIPELINE = o.MOCK_DOC_PIPELINE !== undefined ? o.MOCK_DOC_PIPELINE : __REB_DEFAULTS.MOCK_DOC_PIPELINE;
  MOCK_CHUNK_QUALITY = o.MOCK_CHUNK_QUALITY !== undefined ? o.MOCK_CHUNK_QUALITY : __REB_DEFAULTS.MOCK_CHUNK_QUALITY;
  MOCK_CHUNK_PREVIEW = o.MOCK_CHUNK_PREVIEW !== undefined ? o.MOCK_CHUNK_PREVIEW : __REB_DEFAULTS.MOCK_CHUNK_PREVIEW;
  MOCK_EMBED_STATUS = o.MOCK_EMBED_STATUS !== undefined ? o.MOCK_EMBED_STATUS : __REB_DEFAULTS.MOCK_EMBED_STATUS;
  MOCK_REPROCESS_QUEUE = o.MOCK_REPROCESS_QUEUE !== undefined ? o.MOCK_REPROCESS_QUEUE : __REB_DEFAULTS.MOCK_REPROCESS_QUEUE;
  MOCK_SERVICE_STATS = o.MOCK_SERVICE_STATS !== undefined ? o.MOCK_SERVICE_STATS : __REB_DEFAULTS.MOCK_SERVICE_STATS;
  MOCK_NOTICES_MGMT = o.MOCK_NOTICES_MGMT !== undefined ? o.MOCK_NOTICES_MGMT : __REB_DEFAULTS.MOCK_NOTICES_MGMT;
  MOCK_QNA_MGMT = o.MOCK_QNA_MGMT !== undefined ? o.MOCK_QNA_MGMT : __REB_DEFAULTS.MOCK_QNA_MGMT;
  MOCK_SURVEYS_MGMT = o.MOCK_SURVEYS_MGMT !== undefined ? o.MOCK_SURVEYS_MGMT : __REB_DEFAULTS.MOCK_SURVEYS_MGMT;
  MOCK_IP_BLOCKS = o.MOCK_IP_BLOCKS !== undefined ? o.MOCK_IP_BLOCKS : __REB_DEFAULTS.MOCK_IP_BLOCKS;
  MOCK_WORK_LOG = o.MOCK_WORK_LOG !== undefined ? o.MOCK_WORK_LOG : __REB_DEFAULTS.MOCK_WORK_LOG;
  MOCK_EXTRACT_LOG = o.MOCK_EXTRACT_LOG !== undefined ? o.MOCK_EXTRACT_LOG : __REB_DEFAULTS.MOCK_EXTRACT_LOG;
  MOCK_USAGE_BY_DEPT = o.MOCK_USAGE_BY_DEPT !== undefined ? o.MOCK_USAGE_BY_DEPT : __REB_DEFAULTS.MOCK_USAGE_BY_DEPT;
  MOCK_ABUSE_ALERTS = o.MOCK_ABUSE_ALERTS !== undefined ? o.MOCK_ABUSE_ALERTS : __REB_DEFAULTS.MOCK_ABUSE_ALERTS;
  MOCK_APIS = o.MOCK_APIS !== undefined ? o.MOCK_APIS : __REB_DEFAULTS.MOCK_APIS;
  MOCK_API_APPROVALS = o.MOCK_API_APPROVALS !== undefined ? o.MOCK_API_APPROVALS : __REB_DEFAULTS.MOCK_API_APPROVALS;
  MOCK_PROMPTS_MGMT = o.MOCK_PROMPTS_MGMT !== undefined ? o.MOCK_PROMPTS_MGMT : __REB_DEFAULTS.MOCK_PROMPTS_MGMT;
  MOCK_HR_SYNC = o.MOCK_HR_SYNC !== undefined ? o.MOCK_HR_SYNC : __REB_DEFAULTS.MOCK_HR_SYNC;
  MOCK_CONNECTED_SW = o.MOCK_CONNECTED_SW !== undefined ? o.MOCK_CONNECTED_SW : __REB_DEFAULTS.MOCK_CONNECTED_SW;
  MOCK_ACCESS_LOGS = o.MOCK_ACCESS_LOGS !== undefined ? o.MOCK_ACCESS_LOGS : __REB_DEFAULTS.MOCK_ACCESS_LOGS;
  MOCK_QUALITY_REVIEWS = o.MOCK_QUALITY_REVIEWS !== undefined ? o.MOCK_QUALITY_REVIEWS : __REB_DEFAULTS.MOCK_QUALITY_REVIEWS;
  MOCK_ANNOUNCEMENTS = o.MOCK_ANNOUNCEMENTS !== undefined ? o.MOCK_ANNOUNCEMENTS : __REB_DEFAULTS.MOCK_ANNOUNCEMENTS;
  MOCK_LINKED_SW = o.MOCK_LINKED_SW !== undefined ? o.MOCK_LINKED_SW : __REB_DEFAULTS.MOCK_LINKED_SW;
  MOCK_AGENTS = o.MOCK_AGENTS !== undefined ? o.MOCK_AGENTS : __REB_DEFAULTS.MOCK_AGENTS;
  MOCK_AGENT_DEPLOYS = o.MOCK_AGENT_DEPLOYS !== undefined ? o.MOCK_AGENT_DEPLOYS : __REB_DEFAULTS.MOCK_AGENT_DEPLOYS;
  MOCK_WORKFLOWS = o.MOCK_WORKFLOWS !== undefined ? o.MOCK_WORKFLOWS : __REB_DEFAULTS.MOCK_WORKFLOWS;
  UPSTAGE_OCR_MOCK = o.UPSTAGE_OCR_MOCK !== undefined ? o.UPSTAGE_OCR_MOCK : __REB_DEFAULTS.UPSTAGE_OCR_MOCK;
  UPSTAGE_PARSE_MOCK = o.UPSTAGE_PARSE_MOCK !== undefined ? o.UPSTAGE_PARSE_MOCK : __REB_DEFAULTS.UPSTAGE_PARSE_MOCK;
  MOCK_AIACT_SYSTEMS = o.MOCK_AIACT_SYSTEMS !== undefined ? o.MOCK_AIACT_SYSTEMS : __REB_DEFAULTS.MOCK_AIACT_SYSTEMS;
  MOCK_AIACT_LABELING = o.MOCK_AIACT_LABELING !== undefined ? o.MOCK_AIACT_LABELING : __REB_DEFAULTS.MOCK_AIACT_LABELING;
  MOCK_AIACT_ASSESSMENTS = o.MOCK_AIACT_ASSESSMENTS !== undefined ? o.MOCK_AIACT_ASSESSMENTS : __REB_DEFAULTS.MOCK_AIACT_ASSESSMENTS;
  ADMIN_MGMT_GROUPS = o.ADMIN_MGMT_GROUPS !== undefined ? o.ADMIN_MGMT_GROUPS : __REB_DEFAULTS.ADMIN_MGMT_GROUPS;
  ADMIN_REPORT_ROWS = o.ADMIN_REPORT_ROWS !== undefined ? o.ADMIN_REPORT_ROWS : __REB_DEFAULTS.ADMIN_REPORT_ROWS;
  ADMIN_REPORT_TEMPLATES = o.ADMIN_REPORT_TEMPLATES !== undefined ? o.ADMIN_REPORT_TEMPLATES : __REB_DEFAULTS.ADMIN_REPORT_TEMPLATES;
  ADMIN_PROMPT_PREVIEW_INTRO = o.ADMIN_PROMPT_PREVIEW_INTRO !== undefined ? o.ADMIN_PROMPT_PREVIEW_INTRO : __REB_DEFAULTS.ADMIN_PROMPT_PREVIEW_INTRO;
  ADMIN_INTERNAL_TOOLS = o.ADMIN_INTERNAL_TOOLS !== undefined ? o.ADMIN_INTERNAL_TOOLS : __REB_DEFAULTS.ADMIN_INTERNAL_TOOLS;
  ADMIN_AGENT_NAME_EXAMPLE = o.ADMIN_AGENT_NAME_EXAMPLE !== undefined ? o.ADMIN_AGENT_NAME_EXAMPLE : __REB_DEFAULTS.ADMIN_AGENT_NAME_EXAMPLE;
  ADMIN_WORKFLOW_NAME_EXAMPLE = o.ADMIN_WORKFLOW_NAME_EXAMPLE !== undefined ? o.ADMIN_WORKFLOW_NAME_EXAMPLE : __REB_DEFAULTS.ADMIN_WORKFLOW_NAME_EXAMPLE;
  ADMIN_DATASET_ROWS = o.ADMIN_DATASET_ROWS !== undefined ? o.ADMIN_DATASET_ROWS : __REB_DEFAULTS.ADMIN_DATASET_ROWS;
  ADMIN_VECTOR_SEARCH_RESULTS = o.ADMIN_VECTOR_SEARCH_RESULTS !== undefined ? o.ADMIN_VECTOR_SEARCH_RESULTS : __REB_DEFAULTS.ADMIN_VECTOR_SEARCH_RESULTS;
  ADMIN_AGENT_FOLDER_LINKS = o.ADMIN_AGENT_FOLDER_LINKS !== undefined ? o.ADMIN_AGENT_FOLDER_LINKS : __REB_DEFAULTS.ADMIN_AGENT_FOLDER_LINKS;
  ADMIN_MY_DOCS = o.ADMIN_MY_DOCS !== undefined ? o.ADMIN_MY_DOCS : __REB_DEFAULTS.ADMIN_MY_DOCS;
  ADMIN_APPROVAL_ROWS = o.ADMIN_APPROVAL_ROWS !== undefined ? o.ADMIN_APPROVAL_ROWS : __REB_DEFAULTS.ADMIN_APPROVAL_ROWS;
  ADMIN_QUOTA_DEPTS = o.ADMIN_QUOTA_DEPTS !== undefined ? o.ADMIN_QUOTA_DEPTS : __REB_DEFAULTS.ADMIN_QUOTA_DEPTS;
  ADMIN_PERM_MATRIX = o.ADMIN_PERM_MATRIX !== undefined ? o.ADMIN_PERM_MATRIX : __REB_DEFAULTS.ADMIN_PERM_MATRIX;
  ADMIN_QUOTA_ADVICE = o.ADMIN_QUOTA_ADVICE !== undefined ? o.ADMIN_QUOTA_ADVICE : __REB_DEFAULTS.ADMIN_QUOTA_ADVICE;
  ADMIN_USER_GROUPS = o.ADMIN_USER_GROUPS !== undefined ? o.ADMIN_USER_GROUPS : __REB_DEFAULTS.ADMIN_USER_GROUPS;
  AIACT_STD_PHRASE = o.AIACT_STD_PHRASE !== undefined ? o.AIACT_STD_PHRASE : __REB_DEFAULTS.AIACT_STD_PHRASE;
}
// __RESOLVER_END__
