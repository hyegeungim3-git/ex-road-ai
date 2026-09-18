import { Volume2, Search, ClipboardList, FileText, Database, CheckSquare } from "lucide-react";

/* ================================================================== */
/* 한국도로공사 표준 공문서 템플릿                                      */
/* ================================================================== */
export const REPORT_DOC = {
  docNo: "EX-데이터플랫폼부-2026-0148",
  issueDate: "2026. 09. 18.",
  retention: "5년",
  type: "주간업무보고",
  to: "디지털계획처장",
  cc: "데이터플랫폼부장",
  from: "디지털계획처 데이터플랫폼부 이도현 차장",
  title: "2026년 9월 3주차 주간 업무 실적 보고",
  body: [
    {
      num: "1", heading: "보고 개요",
      rows: [
        ["보고 기간", "2026. 09. 14.(월) ~ 09. 18.(금)"],
        ["작성 부서", "디지털계획처 데이터플랫폼부"],
        ["작성자", "이도현 차장"],
      ]
    },
    {
      num: "2", heading: "주요 실적",
      sub: [
        {
          label: "가. 교통정보 수집장비 정기점검",
          bullets: [
            "VDS 정기점검 <b>5개소</b> 완료",
            "대상: 경부선 하행 기흥IC~수원신갈IC 구간 3개소, 영동선 대관령 구간 2개소",
            "점검 결과: <b>VDS-0010-0247</b> 통신 불량 3일 누적 확인 — 결측률 4.8%로 관리 임계(3.0%) 초과",
          ],
        },
        {
          label: "나. 속도 예측 모델 성능 점검",
          bullets: [
            "예측 모델 성능 점검 <b>2건</b> 처리 완료",
            "ex-speed-lstm v2.3: 30분 예측 MAE 4.7 km/h — 목표(5.0 이하) 충족 (2026.09.16)",
            "드리프트 지수 +0.9로 임계(1.0) 근접 — 분기 재학습 조기 착수 검토 의견서 작성 (2026.09.17)",
          ],
        },
      ],
    },
    {
      num: "3", heading: "차주 계획",
      bullets: [
        "영동선 대관령 구간 RWIS 노면온도 센서 정합성 점검 실시 예정 (2026. 09. 21. ~ 09. 25.)",
        "EX-DataLake 5분 집계 적재 지연(최대 4분 12초) 원인 분석 및 차기 보고",
      ],
    },
  ],
  attachments: [
    "VDS 정기점검 결과서 5부",
    "속도 예측 모델 성능 점검 의견서 2부",
  ],
  secLevel: "S",
  approval: [
    { role: "기안자", name: "이도현", dept: "데이터플랫폼부", date: "2026.09.18", signed: true },
    { role: "검토자", name: "", dept: "", date: "", signed: false },
    { role: "결재자", name: "", dept: "", date: "", signed: false },
  ],
};

// org: 도메인 팩 주입용 — { name, short, color, en } (미전달 시 코어 기본값 = 한국도로공사)
export const generateDocHTML = (doc, org = {}) => {
  const orgName = org.name || "한국도로공사";
  const orgEn = doc.orgEn || org.en || (orgName === "한국도로공사" ? "KOREA EXPRESSWAY CORPORATION" : (org.short || ""));
  const logoLetter = (org.short || "EX").charAt(0);
  const sealText = doc.sealText || (orgName === "한국도로공사" ? `${orgName} 사장` : `${orgName}장`);
  const bc = org.color || "#00539F";
  const bodyHTML = doc.body.map(s => {
    const rowsHTML = s.rows
      ? `<table class="mt">${s.rows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("")}</table>`
      : "";
    const subHTML = s.sub
      ? s.sub.map(ss => `<div class="ssl">${ss.label}</div><ul class="bl">${ss.bullets.map(b => `<li>${b}</li>`).join("")}</ul>`).join("")
      : "";
    const bulletsHTML = s.bullets
      ? `<ul class="bl">${s.bullets.map(b => `<li>${b}</li>`).join("")}</ul>`
      : "";
    return `<div class="sec"><div class="sh">${s.num}. ${s.heading}</div>${rowsHTML}${subHTML}${bulletsHTML}</div>`;
  }).join("");
  const attHTML = doc.attachments.map((a, i) => `<li>${i + 1}. ${a}</li>`).join("");
  const apvHead = doc.approval.map(a => `<th>${a.role}</th>`).join("");
  const apvSig  = doc.approval.map(a => `<td><div class="sig">${a.signed ? "✓\u00a0" + a.name : "\u00a0"}</div></td>`).join("");
  const apvDate = doc.approval.map(a => `<td class="dt2">${a.date || "(미결재)"}</td>`).join("");
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${doc.title}</title><style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Malgun Gothic','맑은 고딕','Apple SD Gothic Neo',sans-serif;font-size:14px;color:#111;background:#ebebeb;padding:32px;line-height:1.85}
.page{background:#fff;max-width:794px;margin:0 auto;padding:56px 64px;box-shadow:0 4px 24px rgba(0,0,0,.13);border-top:6px solid ${bc}}
.lh{display:flex;align-items:center;gap:16px;padding-bottom:18px;border-bottom:2px solid ${bc};margin-bottom:22px}
.lb{width:48px;height:48px;background:${bc};border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px;font-weight:900}
.cn{font-size:20px;font-weight:900;color:${bc};line-height:1.2}
.ce{font-size:10.5px;color:#666;font-weight:500;letter-spacing:.07em;margin-top:3px}
.meta{display:grid;grid-template-columns:90px 1fr;gap:6px 12px;font-size:13px;padding:14px 18px;background:#f8fafc;border:1px solid #dde3ea;border-radius:8px;margin-bottom:22px}
.ml{font-weight:700;color:#444}
.doctitle{text-align:center;font-size:19px;font-weight:900;margin:22px 0 26px;padding:14px 0;border-top:2.5px solid ${bc};border-bottom:2.5px solid ${bc};color:#111;letter-spacing:-.02em}
.sec{margin-bottom:24px}
.sh{font-size:15px;font-weight:900;color:${bc};margin-bottom:10px;padding-left:9px;border-left:4px solid ${bc}}
.mt{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:10px}
.mt td{padding:7px 12px;border:1px solid #dde3ea}
.mt td:first-child{background:#f0f4f8;font-weight:700;width:110px;color:#444;white-space:nowrap}
.ssl{font-size:14px;font-weight:700;color:#333;margin:12px 0 6px 18px}
ul.bl{list-style:none;padding-left:28px;font-size:13.5px;line-height:1.95}
ul.bl li{position:relative;padding-left:14px;color:#333}
ul.bl li::before{content:"–";position:absolute;left:0;color:#888}
ol.att{padding-left:24px;font-size:13.5px;line-height:2}
ol.att li{color:#333}
.seal{text-align:right;margin:32px 0 10px;font-size:18px;font-weight:900;color:${bc};padding-top:22px;border-top:1px solid #e5e7eb}
.at{width:100%;border-collapse:collapse;margin-top:6px;font-size:13px}
.at th,.at td{border:1px solid #ccc;text-align:center;padding:10px}
.at th{background:#f0f4f8;font-weight:700;width:33.33%}
.sig{height:56px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:${bc}}
.dt2{font-size:11.5px;color:#888}
b{font-weight:900;color:${bc}}
.ai-note{margin-top:28px;padding:11px 16px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;font-size:12px;color:#92400e;line-height:1.7}
@media print{body{background:#fff;padding:0}.page{box-shadow:none}}
</style></head><body>
<div class="page">
  <div class="lh">
    <div class="lb">${logoLetter}</div>
    <div>
      <div class="cn">${orgName}</div>
      <div class="ce">${orgEn}</div>
    </div>
  </div>
  <div class="meta">
    <span class="ml">문\u00a0서\u00a0번\u00a0호</span><span>${doc.docNo}</span>
    <span class="ml">시\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0행</span><span>${doc.issueDate}</span>
    <span class="ml">보\u00a0존\u00a0기\u00a0간</span><span>${doc.retention}</span>
    <span class="ml">보\u00a0안\u00a0등\u00a0급</span><span><span style="background:${doc.secLevel==='C'?'#dc2626':doc.secLevel==='S'?'#f97316':'#16a34a'};color:#fff;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:900;letter-spacing:.04em">${doc.secLevel==='C'?'기밀(C)':doc.secLevel==='S'?'민감(S)':'공개(O)'}</span></span>
    <span class="ml">수\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0신</span><span>${doc.to}</span>
    <span class="ml">참\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0조</span><span>${doc.cc}</span>
    <span class="ml">발\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0신</span><span>${doc.from}</span>
  </div>
  <div class="doctitle">제\u00a0\u00a0목 \u00a0: \u00a0${doc.title}</div>
  ${bodyHTML}
  <div class="sec">
    <div class="sh">붙 임</div>
    <ol class="att">${attHTML}</ol>
  </div>
  <div class="seal">${sealText} (직인생략)</div>
  <table class="at">
    <tr>${apvHead}</tr>
    <tr>${apvSig}</tr>
    <tr>${apvDate}</tr>
  </table>
  <div class="ai-note">⚠️ 본 문서는 RoadQ AI 에이전트가 자동 생성한 초안입니다. 공식 문서로 활용 전 반드시 내용을 검토하고 담당자의 최종 승인을 받으시기 바랍니다.</div>
</div>
</body></html>`;
};

export const AI_RESPONSES = {
  GENERAL_PSV: { confidence: 94, content: `**[RAG 기반 답변]** — 출처: 고속도로_교통량조사_지침.pdf\n\n고속도로 교통량·속도 상시조사 업무 지침(제2장·제3장)에 따르면,\n\n- **상시 수집 주기**: 노선별 대표 관측지점(VDS)에서 **5분 단위**로 수집하여 EXTIS를 거쳐 EX-DataLake에 집계·적재\n- **결측 관리**: 결측률이 관리 임계 **3.0%** 를 초과한 지점은 익일까지 원인을 규명하고 보정 절차 적용\n\n⚠️ 현재 경부선 구간 결측률은 **4.8%** 로 임계를 초과한 상태입니다. 원인 지점은 \`VDS-0010-0247\`(통신 불량 3일 누적)입니다.`, citations: [{ id: "d1", name: "고속도로_교통량조사_지침.pdf", page: 4, similarity: 96, tag: "대외비", secLevel: "C", excerpt: "교통량·속도는 노선별 대표 관측지점(VDS)에서 5분 단위로 수집하며, 결측률이 관리 임계 3.0%를 초과한 지점은 익일까지 원인을 규명하고 보정 절차를 적용한다." }], steps: null },
  GENERAL_BUDGET: { confidence: 98, content: `**[RAG 기반 답변]** — 출처: 3. 과업지시서.pdf\n\n| 항목 | 내용 |\n|------|------|\n| **사업 기간** | 계약체결일 ~ 2026년 12월 31일 |\n| **사업 금액** | **1,280,000천원** (VAT 별도) |\n| **발주처** | 한국도로공사 디지털계획처 AI업무혁신 TF |`, citations: [{ id: "d2", name: "3. 과업지시서.pdf", page: 1, similarity: 99, tag: "문서", secLevel: "S", excerpt: "사업 기간은 계약체결일로부터 2026년 12월 31일까지이며, 총 사업 금액은 1,280,000천원(VAT 별도)이다. 발주처는 한국도로공사 디지털계획처 AI업무혁신 TF이다." }], steps: null },
  REVIEW_DEFAULT: { confidence: 91, content: `**[에이전트 문서 검토 결과]**\n\n교통정보 수집장비 유지관리 매뉴얼(2026 개정) 및 관련 지침 대조 결과입니다.\n\n**✅ 준수 사항**\n- 점검 작업 사전 승인 절차 준수\n- 결재 라인 설정이 사내 규정에 부합\n\n**⚠️ 보완 권고 사항**\n- 갓길 차단이 포함된 점검은 **관할 지역본부장 사전 승인** 필요 (유지관리 매뉴얼 제13조①)\n- **교통센터 상황관리부 통보** 누락 (작업 착수 24시간 전까지 통보 및 VMS 예고 요청 필요)`, citations: [{ id: "d3", name: "교통정보_수집장비_유지관리_매뉴얼.hwp", page: 8, similarity: 94, tag: "운영지침", secLevel: "O", excerpt: "갓길 또는 차로 차단이 필요한 점검은 관할 지역본부장의 사전 승인을 받아야 하며, 차단 작업 착수 24시간 전까지 교통센터 상황관리부에 통보하여 VMS 예고 송출을 요청하여야 한다. (제13조)" }], steps: [{ label: "DRM 해제 및 OCR 추출", detail: "업로드 문서 텍스트 완전 추출 완료" }, { label: "사내 지식망 검색", detail: "유지관리 매뉴얼 본선 차단 조항 검색 완료 (제13조)" }, { label: "기준 대조 및 검토", detail: "절차 누락 분석 및 보완 사항 발췌 완료" }] },
  TRANSLATE_DEFAULT: { content: `**[번역 완료]** — 영어 → 한국어\n\n---\n**[번역 결과]**\n\n**도로터널 방재시설 설치 기준 (Road Tunnel Disaster Prevention Facility Standards)**\n\n터널 방재등급은 터널 연장과 교통량을 기준으로 산정하며, 등급별로 제연설비·비상조명·피난연결통로의 설치 범위를 달리 적용한다. 설계자는 적용 등급의 산정 근거를 설계 보고서에 명시하여야 한다.\n\n---\n*번역 엔진: 로컬 LLM (Llama-3-Korean 70B) | 글자수: 약 130자*`, citations: [{ id: "d1", name: "고속도로_교통량조사_지침.pdf", page: 3, similarity: 98, tag: "대외비" }], steps: [{ label: "의미 단위 분할 (Semantic Chunking)", detail: "문서를 문맥 기준으로 분할 완료" }, { label: "한영 번역 (로컬 LLM 처리)", detail: "Llama-3-Korean 70B 모델 번역 완료" }, { label: "공기업 표준 문체 포맷팅", detail: "가독성 높은 형태로 최종 정제 완료" }] },
  REPORT_DEFAULT: { content: `**[주간 실적 보고서 초안 생성 완료]**\n\n---\n\n**데이터플랫폼부 주간 업무 실적 보고**\n\n| 구분 | 내용 |\n|------|------|\n| **보고 기간** | 2026. 09. 14.(월) ~ 09. 18.(금) |\n| **작성 부서** | 디지털계획처 데이터플랫폼부 |\n| **작성자** | 이도현 차장 |\n\n**가. 주요 실적**\n1. 교통정보 수집장비(VDS) 정기점검: **5개소 완료**\n2. 속도 예측 모델 성능 점검: **2건 완료**\n\n**나. 차주 계획**\n- 영동선 대관령 구간 RWIS 센서 정합성 점검 예정\n\n---\n⚠️ *AI 생성 초안입니다. 반드시 확인 후 사용하세요.*`, citations: [], steps: [{ label: "표준 양식 불러오기", detail: "주간실적 보고서 사내 표준 템플릿 로드 완료" }, { label: "정보 항목 매핑", detail: "입력 데이터를 목차별로 자동 분류 완료" }, { label: "공문서 개조식 포맷팅", detail: "보고서 양식에 맞게 최종 작성 완료" }], document: null },
  SECURE_DEFAULT: { confidence: 88, content: `**[보안 문서 스캔 완료]**\n\n업로드된 문서 전체를 대상으로 보안 취약점을 점검했습니다.\n\n**✅ 안전 항목**\n- 평문 노출 패스워드: 미발견\n- 사번·주민등록번호 등 식별정보: 미발견\n\n**🔐 자동 처리 내역**\n- 연락처(전화번호) 형식 데이터 2건 → 자동 마스킹(***)처리\n- 이메일 주소 1건 → 벡터 DB 적재 전 마스킹 완료\n\n본 세션의 모든 처리는 내부 로컬 서버에서만 이루어지며 외부 네트워크로 전송되지 않습니다.`, citations: [{ id: "d1", name: "고속도로_교통량조사_지침.pdf", page: 2, similarity: 91, tag: "대외비", excerpt: "보안등급 C(대외비) 문서는 외부 반출 시 반드시 DRM 암호화 처리 후 반출하여야 하며, 무단 복제를 금한다." }], steps: null },
  SECURE_AIRGAP: { confidence: 97, content: `**[보안 규정 검토 완료]**\n\n과업지시서 내 망분리 관련 핵심 요건입니다.\n\n- **내부 웹 UI**: 망분리, 인터넷 차단 환경 구축 필수\n- **LLM 서비스**: 외부 클라우드 API 연결 금지, 로컬 온프레미스만 허용\n- **벡터 DB**: 내부망 전용 구축, 외부 전송 금지\n\n✅ 현재 세션: 모든 처리가 내부망에서만 이루어지고 있습니다.`, citations: [{ id: "d2", name: "3. 과업지시서.pdf", page: 2, similarity: 98, tag: "문서", excerpt: "시스템은 인터넷과 완전 차단된 망분리 환경에서 운영되어야 하며, LLM 추론은 외부 클라우드 API 연결 없이 로컬 온프레미스 서버에서만 처리되어야 한다." }], steps: null },
  AGENT1: { content: `**[사내 기준 대조 문서 검토 결과]**\n\n교통정보 수집장비 유지관리 매뉴얼(2026 개정) 대조 결과입니다.\n\n**✅ 준수 사항**\n- 점검 작업 사전 승인 절차 준수\n- 결재 라인 설정이 사내 규정에 부합\n\n**⚠️ 보완 권고**\n- 갓길 차단 포함 시 **관할 지역본부장 사전 승인** 필요 (유지관리 매뉴얼 제13조①)\n- **교통센터 상황관리부 통보** 누락 (착수 24시간 전까지 통보 필요)`, citations: [{ id: "d3", name: "교통정보_수집장비_유지관리_매뉴얼.hwp", page: 8, similarity: 94, tag: "운영지침", secLevel: "O" }], agentSteps: [{ status: "완료", label: "문서 파싱: DRM_자동_복호화_모듈 — 문서 텍스트 완전 추출" }, { status: "완료", label: "규정 검색: 사내_지식_검색망 — 본선 차단 작업 관련 조항 검색" }, { status: "완료", label: "대조 검토: 절차 누락 분석 및 보완 사항 발췌 완료" }] },
  AGENT2: { content: `**[번역 완료]** — 영어 → 한국어\n\n**도로터널 방재시설 설치 기준 (Road Tunnel Disaster Prevention Facility Standards)**\n\n터널 방재등급은 터널 연장과 교통량을 기준으로 산정하고, 등급별로 제연설비·비상조명·피난연결통로의 설치 범위를 달리 적용하며, 그 산정 근거를 설계 보고서에 명시하여야 합니다.\n\n---\n*번역 엔진: Llama-3-Korean 70B | 글자수: 약 130자*`, citations: [{ id: "d1", name: "고속도로_교통량조사_지침.pdf", page: 3, similarity: 98, tag: "대외비", secLevel: "C" }], agentSteps: [{ status: "완료", label: "문맥 파악: Semantic Chunking — 의미 단위 분할 완료" }, { status: "완료", label: "번역·요약: Llama-3-Korean 70B — 한영 번역 및 요약 완료" }, { status: "완료", label: "포맷팅: 공기업 표준 문체 최종 정제 완료" }] },
  AGENT3: { content: `**[보고서 초안 생성 완료]**\n\n**데이터플랫폼부 주간 업무 실적 보고**\n\n| 구분 | 내용 |\n|------|------|\n| **보고 기간** | 2026. 09. 14.(월) ~ 09. 18.(금) |\n| **작성 부서** | 디지털계획처 데이터플랫폼부 |\n| **작성자** | 이도현 차장 |\n\n**가. 주요 실적**\n1. 교통정보 수집장비(VDS) 정기점검: **5개소 완료**\n2. 속도 예측 모델 성능 점검: **2건 완료**\n\n---\n⚠️ *AI 생성 초안입니다. 반드시 확인 후 사용하세요.*`, citations: [], agentSteps: [{ status: "완료", label: "양식 로드: 사내_지식_검색망 — 주간실적 표준 템플릿 로드" }, { status: "완료", label: "정보 매핑: 입력 데이터를 목차별로 자동 분류 완료" }, { status: "완료", label: "최종 생성: GPT-OSS 120B — 공문서 개조식 포맷팅 완료" }], document: null },
};
// REPORT_DEFAULT.document and AGENT3.document point to REPORT_DOC
AI_RESPONSES.REPORT_DEFAULT.document = REPORT_DOC;
AI_RESPONSES.AGENT3.document = REPORT_DOC;

/* 회의록 자동 작성 에이전트 데이터 */
export const MEET_AGENTS = [
  {icon:Volume2, label:'STT 에이전트', sub:'음성 → 텍스트 변환', color:'bg-violet-600', light:'bg-violet-50 border-violet-200 text-violet-700', ms:3200},
  {icon:Search, label:'분석 에이전트', sub:'화자 구분 · 의사결정 추출', color:'bg-blue-600', light:'bg-blue-50 border-blue-200 text-blue-700', ms:2600},
  {icon:ClipboardList, label:'회의록 작성 에이전트', sub:'표준 양식 회의록 생성', color:'bg-emerald-600', light:'bg-emerald-50 border-emerald-200 text-emerald-700', ms:2800},
];

export const MEET_RESULT = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                      회   의   록
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ 회  의  명 : 2026년 3분기 교통데이터 분석반 정례회의
□ 일      시 : 2026년 9월 18일 (목) 14:00 ~ 15:30
□ 장      소 : 본사 3층 대회의실 (304호)
□ 주      재 : 디지털계획처장 윤상헌
□ 참 석 자  : 데이터플랫폼부 차장 이도현, AI인프라부 팀장 한지훈,
               교통센터 상황관리부 과장 박선영, 수도권본부 도로교통부 대리 김태우

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 개회 (14:00)
   - 디지털계획처장 주재로 회의 개최
   - 참석 인원 확인 및 회의 목적 공유

2. 안건 토의

   [안건 1] VDS 결측률 관리 임계 운영 개선(안)
   ─────────────────────────────────────
   ▸ 이도현 차장 : 경부선 구간 결측률이 4.8%로 관리 임계(3.0%)를 상시
     초과하고 있어, 임계 조정보다 통신 회선 이중화가 선행되어야 함을 보고.
   ▸ 한지훈 팀장 : 회선 이중화 적용 시 연간 운영비 약 15% 증가 예상.
   ▸ 김태우 대리 : VDS-0010-0247 통신 불량 3일 누적 상태. 수도권본부
     자체 현장 점검을 9월 25일자로 편성 예정.
   ▸ 결 론 : 결측률 상위 10% 지점에 한해 회선 이중화 우선 적용.

   [안건 2] 돌발상황 이상탐지 모델 적용 확대 검토
   ─────────────────────────────────────
   ▸ 박선영 과장 : 당일 07:42 경부선 하행 386.8k 급감속 클러스터 7건/2분
     검지. 2차사고 위험도 0.78(경보 임계 0.70)로 VMS 3기 경보 송출함.
   ▸ 이도현 차장 : 이상탐지 모델 오탐률 2.1%, 평균 검지 지연 48초로
     목표(60초 이내) 충족.
   ▸ 윤상헌 처장 : 2개 지역본부 3개월 시범 운영 후 전국 확대 여부 결정.
   ▸ 결 론 : 2026년 4분기 시범 운영 착수.

3. 결정 사항
   ① 결측률 상위 지점 회선 이중화 : 2026. 10. 01. 시행
   ② 이상탐지 모델 시범 운영 : 2026. 10월 착수 (2개 본부)
   ③ 개정 지침 법무 검토 후 10월 내 확정

4. 조치 사항
   ┌──┬──────────────────────────────┬──────────┬───────────┐
   │번호│ 내              용           │ 담 당 자 │ 완료 기한 │
   ├──┼──────────────────────────────┼──────────┼───────────┤
   │ 1 │ 회선 이중화 대상 지점 선정     │ 김태우   │ 10. 15.  │
   │ 2 │ 이상탐지 임계 재산정 검토 보고 │ 박선영   │ 10. 10.  │
   │ 3 │ 운영비 절감 방안 검토 보고     │ 한지훈   │ 10. 22.  │
   │ 4 │ 시범 운영 대상 본부 선정       │ 이도현   │ 10. 30.  │
   └──┴──────────────────────────────┴──────────┴───────────┘

5. 특이사항
   - 차기 회의 : 2026년 10월 16일 (금) 14:00 예정
   - 법무 검토 의견 수렴 후 지침 개정안 공람 예정

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
작성자 : RoadQ AI 회의록 에이전트 v1.0
검토자 : ___________________  (서명)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

export const APV_LINE_MEET = [
  {name:'이도현',dept:'데이터플랫폼부',title:'차장',role:'작성자'},
  {name:'한지훈',dept:'AI인프라부',title:'팀장',role:'검토자'},
  {name:'윤상헌',dept:'디지털계획처',title:'처장',role:'승인자'},
];

export const APV_LINE_SAFE = [
  {name:'이도현',dept:'데이터플랫폼부',title:'차장',role:'작성자'},
  {name:'정민석',dept:'시설처 구조물관리부',title:'차장',role:'검토자'},
  {name:'윤상헌',dept:'디지털계획처',title:'처장',role:'승인자'},
];

/* 도로 공사구간 안전관리계획 수립 에이전트 데이터 */
export const SAFE_AGENTS = [
  {icon:FileText, label:'입력 분석 에이전트', sub:'작업 구간 특성 파악 및 위험 유형 분류', color:'bg-orange-600', ms:2400},
  {icon:Database, label:'RAG 검색 에이전트', sub:'관련 법령·규정·사례 벡터 검색', color:'bg-blue-600', ms:3500},
  {icon:CheckSquare, label:'법규 검토 에이전트', sub:'적용 법령 매핑 및 준수 체크리스트 생성', color:'bg-purple-600', ms:2800},
  {icon:ClipboardList, label:'계획서 작성 에이전트', sub:'도로 공사구간 안전관리계획서 초안 자동 생성', color:'bg-emerald-600', ms:3000},
];

export const SAFE_RISK_OPTIONS = ['주행 차량 충돌','추락·낙상','중장비 협착','폭염·한파 노출','낙석·비탈면 붕괴','우천 노면 미끄럼','터널 내 매연·시야 불량','전기설비 감전','교량 하부 고소작업','야간 작업'];

export const SAFE_RESULT = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      도 로 공 사 구 간 안 전 관 리 계 획 서
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 작업 개요
   ─────────────────────────────────────
   ▸ 작  업  명 : 교통정보 수집장비(VDS) 정기점검 및 통신 회선 정비
   ▸ 작업 기간 : 2026. 09. 21. ~ 2026. 09. 25. (5일)
   ▸ 작업 구간 : 경부선 하행 기흥IC~수원신갈IC (384.2k~389.6k)
   ▸ 발 주 처 : 한국도로공사 디지털계획처 데이터플랫폼부
   ▸ 작업 규모 : VDS 5개소 (작업원 4명, 갓길 차단 1개 차로)

2. 안전 관리 조직
   ─────────────────────────────────────
   [안전관리책임자] 윤상헌 처장 (디지털계획처)
       └─ [안전담당자] 한지훈 팀장 (AI인프라부)
              ├─ [현장 작업 A조] 김태우 대리 (수도권본부 도로교통부)
              └─ [현장 작업 B조] 정민석 차장 (시설처 구조물관리부)

3. 위험 요인 분석 (위험성 평가)
   ─────────────────────────────────────
   ┌────────────┬────────┬──────┬───────────────────────────────┐
   │ 위험 요인  │ 위험도 │ 빈도 │ 안전 대책                    │
   ├────────────┼────────┼──────┼───────────────────────────────┤
   │ 차량 충돌  │ 높음   │ 가능 │ 전방 800m 표지, 갓길 차단    │
   │ 추락·낙상  │ 높음   │ 보통 │ 안전대 착용, 비탈면 2인 1조  │
   │ 폭염 노출  │ 보통   │ 계절 │ 수분 보충, 그늘 휴식 의무화  │
   │ 감전       │ 보통   │ 낮음 │ 전원 차단 확인 후 함체 개방  │
   │ 야간 작업  │ 높음   │ 가능 │ 야간 본선 작업 금지 원칙     │
   └────────────┴────────┴──────┴───────────────────────────────┘

4. 안전관리 계획 (단계별)
   ─────────────────────────────────────
   4.1 작업 착수 전 안전 관리
   ▸ 작업 전일 기상 및 노면 상태 확인 (RWIS 노면온도 조회)
   ▸ 교통센터 상황관리부 작업 통보 및 VMS 예고 송출 요청
   ▸ 개인보호장비(안전모, 안전화, 야광 조끼) 지급 확인

   4.2 현장 작업 중 안전
   ▸ 2인 1조 원칙 (본선 방향을 등지고 작업 금지)
   ▸ 30분 간격 작업 책임자 연락 확인 (응답 없을 시 즉시 확인 출동)
   ▸ 차단 구간 전방 800m 안전표지·라바콘 설치 완료 후 진입

5. 비상 연락 체계
   ─────────────────────────────────────
   사고 발생 → 즉시 갓길 대피 및 119 신고
   ↓
   교통센터 상황관리부 연락 (박선영 010-XXXX-XXXX)
   ↓
   안전관리책임자 보고 → 원인 조사 및 재발 방지 조치

6. 관련 법령 및 규정
   ─────────────────────────────────────
   ① 산업안전보건법 제36조 (위험성평가)
   ② 한국도로공사 도로 공사구간 안전관리 지침
   ③ 도로법 제31조 (도로공사와 도로의 유지·관리 등)
   ④ 도로교통법 제68조 (도로에서의 금지행위 등)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
작성: RoadQ 안전관리 에이전트 v1.0 | 검토자: _______
참조 법령 수: 4건 | RAG 검색 문서 수: 8건
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
