import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle2, AlertTriangle, XCircle, Loader2, Send, Bot, ClipboardCheck, ChevronDown, ChevronUp, FileText } from "lucide-react";

/* ── 문서 유형별 자가점검 항목 ─────────────────────────────────── */
const CHECKS = {
  report: [
    {
      id:'docnum', label:'문서번호 형식', desc:'EX-부서-연도-일련번호 체계 검증', status:'pass',
      detail:'EX-데이터플랫폼부-2026-0148 — 형식 정상',
      basis:'문서 헤더 "문서번호" 필드 값 "EX-데이터플랫폼부-2026-0148"을 한국도로공사 문서관리규정 제12조 문서번호 부여 체계(기관코드-부서명-연도-일련번호)와 대조한 결과, 4개 구성요소 모두 형식에 부합합니다. 연도(2026), 일련번호(0148) 순번 중복 없음 확인.',
    },
    {
      id:'dept', label:'담당부서 기재', desc:'발신 부서 및 담당자 명시 여부', status:'pass',
      detail:'디지털계획처 데이터플랫폼부 / 이도현 차장 확인됨',
      basis:'문서 상단 메타 정보 및 서명란에 "디지털계획처 데이터플랫폼부 / 이도현 차장"이 명시되어 있습니다. 내부결재 업무처리규정 제7조에 따른 기안자 부서·직위·성명 기재 요건을 충족합니다.',
    },
    {
      id:'period', label:'보고 기간 명시', desc:'업무 기간 범위 적시 여부', status:'pass',
      detail:'2026.09.14 ~ 09.18 확인됨',
      basis:'본문 "보고 기간" 항목에 "2026. 09. 14. ~ 09. 18." 기간이 명확히 기재되어 있습니다. 주간실적보고 양식 작성 지침(디지털계획처-2025-지침-003) 상 요구되는 주 단위 기간 표기 형식을 준수합니다.',
    },
    {
      id:'content', label:'주요 실적 충실성', desc:'핵심 업무 항목 3건 이상 기재 여부', status:'pass',
      detail:'5개 항목 정상 기재됨',
      basis:'"주요 실적" 항목에 ① VDS 정기점검 5개소 완료 ② 속도 예측 모델 성능 점검 2건 ③ 결측 지점 보정 조치 의견서 작성 1건 등 총 5개 구체적 업무 항목이 기재되어 있습니다. 최소 기재 기준(3건)을 초과하였으며, 각 항목에 수량 및 대상 노선·구간이 명시되어 있습니다.',
    },
    {
      id:'plan', label:'차주 계획 작성', desc:'다음 주 업무 계획 기재 여부', status:'pass',
      detail:'4개 계획 항목 확인됨',
      basis:'"차주 계획" 항목에 ① RWIS 노면온도 센서 정합성 점검(영동선 대관령 구간) ② 분기 수집 품질 집계 ③ 적재 지연 원인 분석 보고 ④ 결측 지점 조치 결과 통보 3건 등 4개 계획이 기재되어 있습니다. 구체적 수량 및 일정 포함 여부 기준을 충족합니다.',
    },
    {
      id:'sig', label:'서명란 완성도', desc:'작성자·검토자·승인자 서명 체계 확인', status:'pass',
      detail:'3단 순차 서명 구조 확인됨',
      basis:'문서 하단 서명란에 작성자(이도현·데이터플랫폼부), 검토자(한지훈·AI인프라부), 승인자(윤상헌·디지털계획처) 3단 순차 결재 구조가 구성되어 있습니다. 전자결재 시스템 연동을 위한 결재선 설정 요건(그룹웨어 연동 가이드 v2.3)을 충족합니다.',
    },
    {
      id:'pii', label:'개인정보 포함 여부', desc:'주민번호·연락처 등 민감정보 노출 검토', status:'warn',
      detail:'외부 업체명 포함 — 배포 전 마스킹 검토 권고',
      basis:'본문 내 장비 유지보수 용역업체명 및 담당자 연락처(010-XXXX-XXXX 패턴 1건)가 포함되어 있습니다. 내부결재 문서로 처리되므로 현행 유통에는 문제없으나, 향후 정보공개 청구 대응을 위해 개인정보 보호법 제24조에 따른 사전 마스킹 검토를 권고합니다.',
    },
    {
      id:'classify', label:'보안등급 표시', desc:'문서 보안등급 분류 표기 여부', status:'warn',
      detail:'보안등급 미기재 — 일반문서로 처리 예정',
      basis:'문서 내 보안등급(일반·대외비·비밀) 표기가 확인되지 않습니다. 한국도로공사 정보보안 업무규정 제15조에 따르면 모든 공문서는 보안등급을 표기해야 하며, 미기재 시 "일반" 문서로 자동 분류됩니다. 내용상 대외비 해당 여부를 검토 후 등급 기재를 권고합니다.',
    },
  ],
  meeting: [
    {
      id:'docnum', label:'문서번호 형식', desc:'EX-부서-연도-일련번호 체계 검증', status:'pass',
      detail:'EX-데이터플랫폼부-2026-0151 — 형식 정상',
      basis:'"EX-데이터플랫폼부-2026-0151" 형식이 문서관리규정 제12조 체계에 부합합니다. 회의록 전용 일련번호 0151번 중복 없음 확인.',
    },
    {
      id:'datetime', label:'회의 일시 기재', desc:'회의 개최 일시 명시 여부', status:'pass',
      detail:'2026-09-18 14:00 확인됨',
      basis:'회의록 상단 기본 정보란에 "2026년 9월 18일 14:00" 일시가 명확히 기재되어 있습니다. 회의록 작성 기준(내규 제33조) 상 요구되는 연·월·일·시각 표기를 충족합니다.',
    },
    {
      id:'place', label:'회의 장소 명시', desc:'개최 장소 또는 비대면 여부 기재', status:'pass',
      detail:'본사 3층 대회의실 확인됨',
      basis:'"한국도로공사 본사 3층 대회의실"이 장소로 명기되어 있습니다. 비대면 개최의 경우 플랫폼명을 기재해야 하나, 대면 회의로 확인되어 장소 기재 요건을 충족합니다.',
    },
    {
      id:'members', label:'참석자 명단', desc:'소속·직책·성명 기재 여부', status:'pass',
      detail:'5명 참석자 명단 확인됨',
      basis:'참석자 5명 전원에 대해 소속 부서, 직위, 성명이 기재되어 있습니다. 외부 참석자(0명)는 없으며, 내부 참석자 명단이 인사 시스템 정보와 일치합니다.',
    },
    {
      id:'agenda', label:'회의 안건 목록', desc:'안건 번호 및 제목 기재 여부', status:'pass',
      detail:'2개 안건 항목 확인됨',
      basis:'안건 1~2번이 번호 순서대로 기재되어 있으며, 각 안건에 제목과 간략한 배경 설명이 포함되어 있습니다. 회의록 서식 기준(서식-MOM-001)의 안건 기재 형식을 준수합니다.',
    },
    {
      id:'decision', label:'결정 사항 명시', desc:'합의·결정 내용 명시적 기재 여부', status:'pass',
      detail:'3건 결정 사항 확인됨',
      basis:'각 안건별 "결정 사항" 항목에 ① ~ ③ 총 3건의 결정 내용이 명확한 동사형 문장으로 기재되어 있습니다. "검토한다", "추진한다" 등 모호한 표현 없이 주체·내용·기한이 명시되어 있습니다.',
    },
    {
      id:'followup', label:'후속 조치 항목', desc:'담당자·기한 지정 후속 조치 여부', status:'warn',
      detail:'담당자 미배정 항목 1건 — 후속 확인 권고',
      basis:'안건 2번 결정 사항 중 "시범 운영 결과 취합 후 전국 확대 재검토" 항목에 담당자 지정 없이 기한만 기재("2027년 1월 중")되어 있습니다. 회의록 작성 기준 제8조에 따르면 후속 조치 항목에는 담당자(부서 또는 성명)와 기한을 함께 기재해야 합니다. 담당자 확인 후 보완을 권고합니다.',
    },
    {
      id:'sig', label:'서명란 완성도', desc:'작성자·검토자 서명 체계 확인', status:'pass',
      detail:'2단 서명 구조 확인됨',
      basis:'작성자 및 검토자 2단 서명란이 구성되어 있습니다. 회의록의 경우 승인자 서명란은 선택 사항(내규 제34조)으로 현행 2단 구조는 기준을 충족합니다.',
    },
  ],
  safety: [
    {
      id:'docnum', label:'문서번호 형식', desc:'EX-부서-연도-일련번호 체계 검증', status:'pass',
      detail:'EX-데이터플랫폼부-2026-0153 — 형식 정상',
      basis:'"EX-데이터플랫폼부-2026-0153" 형식이 문서관리규정 제12조 체계에 부합합니다. 안전관리계획서 전용 일련번호 0153번 중복 없음 확인.',
    },
    {
      id:'site', label:'작업 구간 기재', desc:'작업 노선·구간 이정 명시 여부', status:'pass',
      detail:'노선·구간 이정 확인됨',
      basis:'노선명(경부선), 작업 구간(기흥IC~수원신갈IC), 이정(384.2k~389.6k) 등 작업 구간 기본 정보가 기재되어 있습니다. 도로 공사구간 안전관리 지침(도로처-2025-지침-007) 제4조 작업 구간 기재 요건을 충족합니다.',
    },
    {
      id:'risk', label:'위험 요소 식별', desc:'위험 유형·등급 분류 목록 확인', status:'pass',
      detail:'4개 위험 항목 식별됨',
      basis:'주행 차량 충돌, 추락·낙상, 감전, 기상 악화 등 4개 위험 유형이 식별되었으며, 각 항목에 위험 등급(상·중·하)이 분류되어 있습니다. 위험성 평가 기준(KOSHA GUIDE G-17-2023) 체계와 일치합니다.',
    },
    {
      id:'measure', label:'안전 조치 계획', desc:'위험별 대응 조치 계획 기재 여부', status:'pass',
      detail:'항목별 조치 계획 확인됨',
      basis:'식별된 4개 위험 항목 각각에 대한 예방 조치 및 발생 시 대응 절차가 기재되어 있습니다. 산업안전보건법 제38조 및 동법 시행규칙 별표 1에서 요구하는 안전 조치 항목을 포함합니다.',
    },
    {
      id:'law', label:'법령 준거 여부', desc:'산업안전보건법 제38조 준거 확인', status:'pass',
      detail:'관련 법령 준거 확인됨',
      basis:'산업안전보건법 제38조(안전조치), 제39조(보건조치), 시행규칙 별표 1 관련 항목이 계획서에 반영되어 있습니다. 공공기관 안전관리 지침(행안부 고시 제2024-14호)에서 요구하는 도로 본선 작업 안전계획 수립 요건을 충족합니다.',
    },
    {
      id:'contact', label:'비상 연락망', desc:'비상 시 연락 체계 기재 여부', status:'warn',
      detail:'비상 연락처 미기재 — 기재 후 상신 권고',
      basis:'안전관리계획서 내 비상 연락망(작업 책임자 연락처, 관할 교통센터·인근 병원·소방서 정보) 항목이 공란으로 확인됩니다. 도로 공사구간 안전관리 지침 제9조에 따르면 비상 연락처는 필수 기재 항목입니다. 상신 전 기재를 강력히 권고합니다.',
    },
    {
      id:'period', label:'계획서 유효기간', desc:'안전관리 계획 유효기간 명시 여부', status:'warn',
      detail:'유효기간 미기재 — 작업 기간에 준함으로 처리 예정',
      basis:'계획서의 유효 기간(적용 작업 일정) 항목이 기재되어 있지 않습니다. 안전관리 지침 제5조에 따라 계획서는 해당 작업 구간의 작업 기간에만 유효하므로, 작업 예정 기간을 명시할 것을 권고합니다. 미기재 시 해당 연도 동일 구간 작업 전체에 적용되는 것으로 간주합니다.',
    },
    {
      id:'sig', label:'서명란 완성도', desc:'작성자·안전담당자·승인자 서명 확인', status:'pass',
      detail:'3단 서명 구조 확인됨',
      basis:'작성자, 안전담당자, 승인자(부서장) 3단 서명란이 구성되어 있습니다. 산업안전보건법 시행규칙 제35조 및 한국도로공사 안전관리 내규 제12조에 따른 안전계획서 결재 체계를 충족합니다.',
    },
  ],
};

/* ── 분기 교통량 동향조사 전용 점검항목 ─────────────────────── */
CHECKS.officetel = [
  {
    id:'docnum',  label:'문서번호 형식',       desc:'EX-부서-연도-일련번호 체계 검증', status:'pass',
    detail:'EX-데이터플랫폼부-2026-0139 — 형식 정상',
    basis:'"EX-데이터플랫폼부-2026-0139" 형식이 문서관리규정 제12조 체계에 부합합니다. 데이터플랫폼부 일련번호 0139번 중복 없음 확인.',
  },
  {
    id:'period',  label:'조사 기간 명시',       desc:'분기 집계 기간 및 기준시점 기재 여부', status:'pass',
    detail:'2026. 04. ~ 06. (2분기) 확인됨',
    basis:'집계 기준 기간 "2026년 4~6월(2분기)"이 명확히 기재되어 있습니다. 지수 기준시점(2024.12=100.0)도 함께 표기되어 사내 교통통계 작성 기준에 부합합니다.',
  },
  {
    id:'coverage',label:'조사 범위·지점 기재', desc:'대상 지역본부 수 및 관측지점 규모 명시 여부', status:'pass',
    detail:'8개 지역본부, 상시 관측지점 2,340개소 확인됨',
    basis:'집계 범위 8개 지역본부(수도권·강원·충북·대전충남·전북·광주전남·부산경남·대구경북)와 상시 관측지점 2,340개소가 기재되어 있습니다. 2026.01 관측망 재설계 이후 기준을 준수합니다.',
  },
  {
    id:'indices', label:'교통 지표 변동률 기재', desc:'통행량·속도·혼잡 3개 지표 및 변동률 포함 여부', status:'pass',
    detail:'일평균 통행량 512만 대, 평균속도 -0.39%, 혼잡시간 +0.20% 확인됨',
    basis:'통행량·속도·혼잡 3개 부문 전국·수도권·지방 지표 변동률이 기재되어 있습니다. 전분기 대비 변동 방향 및 노선별 세부 동향 분석도 포함되어 있습니다.',
  },
  {
    id:'rate',    label:'본부별 혼잡지수',       desc:'지역본부별 혼잡지수 산출 결과 기재 여부', status:'pass',
    detail:'최고 수도권 78, 최저 강원 33 확인됨',
    basis:'지역본부별 혼잡지수(수도권 78 ~ 강원 33) 산출 결과가 기재되어 있습니다. 본부별 세부 수치도 포함되어 있어 도로 운영 계획 수립 참고 자료 요건을 충족합니다.',
  },
  {
    id:'sig',     label:'서명란 완성도',         desc:'작성자·검토자·승인자 서명 체계 확인', status:'pass',
    detail:'3단 순차 서명 구조 확인됨',
    basis:'작성자, 검토자(데이터플랫폼부장), 승인자(디지털계획처장) 3단 서명란이 구성되어 있습니다. 통계 보고서 결재 체계(내규 제34조)를 충족합니다.',
  },
  {
    id:'stat',    label:'데이터 검증 이력 기재', desc:'결측 보정·검증 이력 표기 여부', status:'warn',
    detail:'검증 이력 미표기 — 보고서 각주 기재 권고',
    basis:'집계 원자료의 결측 보정 범위와 검증 담당자·일자가 본문 또는 각주에 표기되지 않았습니다. 교통통계 작성 기준에 따라 보정을 거친 지표는 보정 구간과 검증 이력을 명시해야 합니다. 배포 전 각주 기재를 권고합니다.',
  },
  {
    id:'source',  label:'자료 출처 명시',        desc:'EXTIS·EX-DataLake 등 데이터 출처 기재 여부', status:'warn',
    detail:'출처(EXTIS) 미기재 — 문서 하단 출처 표기 권고',
    basis:'지표 산출 기반 데이터 출처(고속도로 교통정보시스템 EXTIS, 집계 저장소 EX-DataLake)가 명시되지 않았습니다. 통계 보도자료 작성 지침 제9조에 따라 데이터 출처를 문서 하단에 기재할 것을 권고합니다.',
  },
];

const DELAYS = [580, 500, 620, 750, 540, 500, 820, 560];

const STATUS_CFG = {
  pass:     { Icon: CheckCircle2, cls: 'text-emerald-500',           bg: 'bg-emerald-50',  border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', label: '통과' },
  warn:     { Icon: AlertTriangle,cls: 'text-amber-500',             bg: 'bg-amber-50',    border: 'border-amber-200',   badge: 'bg-amber-100  text-amber-700',   label: '권고' },
  fail:     { Icon: XCircle,      cls: 'text-rose-500',              bg: 'bg-rose-50',     border: 'border-rose-200',    badge: 'bg-rose-100   text-rose-700',    label: '오류' },
  checking: { Icon: Loader2,      cls: 'text-blue-500 animate-spin', bg: 'bg-blue-50',     border: 'border-blue-200',    badge: 'bg-blue-100   text-blue-700',    label: '검토 중' },
  pending:  { Icon: null,         cls: 'text-slate-300',             bg: 'bg-white',       border: 'border-slate-100',   badge: 'bg-slate-100  text-slate-400',   label: '대기' },
};

const SelfCheckModal = ({ docType = 'report', domain, onProceed, onClose }) => {
  /* 점검 항목은 도메인 팩이 우선 — 팩이 selfChecks를 주지 않으면 코어 기본값.
     (기본값이 특정 발주처 전용 항목이라 제조·의료 문서 상신에도 그게 뜨던 문제) */
  const items = domain?.selfChecks?.[docType] ?? CHECKS[docType] ?? CHECKS.report;

  const [states,   setStates]   = useState(items.map(() => 'pending'));
  const [checked,  setChecked]  = useState(items.map(() => false));   // 사용자 체크박스
  const [expanded, setExpanded] = useState(items.map(() => false));   // 근거 내용 펼침
  const [phase,    setPhase]    = useState('running');                 // 'running' | 'done'

  /* ── AI 자동 검토 애니메이션 ─────────────────────────────── */
  useEffect(() => {
    let t = 300;
    items.forEach((_, i) => {
      setTimeout(() => setStates(p => { const n=[...p]; n[i]='checking'; return n; }), t);
      t += 320;
      const delay = DELAYS[i % DELAYS.length] ?? 600; // 항목 수가 8을 넘어도 안전하게
      setTimeout(() => {
        setStates(p => { const n=[...p]; n[i]=items[i].status; return n; });
        // pass 항목은 자동으로 체크
        if (items[i].status === 'pass') {
          setChecked(p => { const n=[...p]; n[i]=true; return n; });
        }
        if (i === items.length - 1) setTimeout(() => setPhase('done'), 280);
      }, t + delay);
      t += delay + 120;
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleChecked  = i => setChecked(p  => { const n=[...p]; n[i]=!n[i]; return n; });
  const toggleExpanded = i => setExpanded(p => { const n=[...p]; n[i]=!n[i]; return n; });

  const doneCount    = states.filter(s => !['pending','checking'].includes(s)).length;
  const passCount    = states.filter(s => s==='pass').length;
  const warnCount    = states.filter(s => s==='warn').length;
  const failCount    = states.filter(s => s==='fail').length;
  const checkedCount = checked.filter(Boolean).length;
  const allChecked   = checkedCount === items.length;
  const progress     = Math.round((doneCount / items.length) * 100);

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[400] flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget && phase === 'done') onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[540px] overflow-hidden flex flex-col" style={{maxHeight:'90vh'}} onClick={e => e.stopPropagation()}>

        {/* ── 헤더 ──────────────────────────────────────────── */}
        <div className="bg-[#00539F] px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <ClipboardCheck className="w-5 h-5 text-white"/>
            </div>
            <div>
              <div className="text-white font-black text-[14px] flex items-center gap-2">
                AI 사전 검수
                {phase === 'running' && (
                  <span className="text-[10px] px-2 py-0.5 bg-white/20 rounded-full font-bold animate-pulse">검토 중…</span>
                )}
                {phase === 'done' && (
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-400/30 text-emerald-200 rounded-full font-bold">AI 검토 완료</span>
                )}
              </div>
              <div className="text-white/55 text-[10px] mt-0.5">
                {phase === 'done'
                  ? `항목을 확인하고 체크박스를 선택해 주세요 (${checkedCount}/${items.length})`
                  : '결재 상신 전 AI 자동 품질 검토 중'}
              </div>
            </div>
          </div>
          {phase === 'done' && (
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
              <X className="w-5 h-5"/>
            </button>
          )}
        </div>

        {/* ── 진행률 바 ──────────────────────────────────────── */}
        <div className="h-1 bg-slate-100 shrink-0">
          <div className="h-full bg-[#00539F] transition-all duration-500 ease-out" style={{width:`${progress}%`}}/>
        </div>

        {/* ── 체크리스트 ─────────────────────────────────────── */}
        <div className="px-4 py-3 space-y-1.5 overflow-y-auto flex-1">
          {items.map((item, i) => {
            const s      = states[i];
            const cfg    = STATUS_CFG[s] ?? STATUS_CFG.pending;
            const { Icon } = cfg;
            const isDone = !['pending','checking'].includes(s);
            const isExp  = expanded[i];
            const isChk  = checked[i];

            return (
              <div key={item.id}
                className={`rounded-xl border transition-all duration-300 overflow-hidden ${cfg.bg} ${cfg.border}`}>

                {/* 메인 행 */}
                <div className="flex items-center gap-3 px-3 py-2.5">
                  {/* AI 상태 아이콘 */}
                  <div className="shrink-0 w-5 h-5 flex items-center justify-center">
                    {s === 'pending'
                      ? <div className="w-4 h-4 rounded-full border-2 border-slate-200"/>
                      : <Icon className={`w-4 h-4 ${cfg.cls}`}/>
                    }
                  </div>

                  {/* 텍스트 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[13px] font-bold leading-snug ${s === 'pending' ? 'text-slate-400' : 'text-slate-800'}`}>
                        {item.label}
                      </span>
                      {s !== 'pending' && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                      )}
                    </div>
                    <div className={`text-[11px] ${s === 'pending' ? 'text-slate-300' : 'text-slate-500'}`}>
                      {item.desc}
                    </div>
                    {isDone && (
                      <div className={`text-[11px] mt-0.5 font-medium ${
                        s === 'warn' ? 'text-amber-600' : s === 'fail' ? 'text-rose-600' : 'text-emerald-600'
                      }`}>
                        → {item.detail}
                      </div>
                    )}
                  </div>

                  {/* 우측: 근거 버튼 + 체크박스 */}
                  {isDone && (
                    <div className="flex items-center gap-2 shrink-0">
                      {/* 근거 내용 토글 */}
                      <button
                        onClick={() => toggleExpanded(i)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                          isExp
                            ? 'bg-[#00539F] text-white'
                            : 'bg-white border border-slate-200 text-slate-500 hover:border-[#00539F] hover:text-[#00539F]'
                        }`}>
                        <FileText className="w-3 h-3"/>
                        근거
                        {isExp ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
                      </button>

                      {/* 사용자 체크박스 */}
                      <button
                        onClick={() => toggleChecked(i)}
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                          isChk
                            ? 'bg-[#00539F] border-[#00539F]'
                            : s === 'warn'
                              ? 'border-amber-400 bg-white hover:border-amber-500'
                              : s === 'fail'
                                ? 'border-rose-400 bg-white hover:border-rose-500'
                                : 'border-slate-300 bg-white hover:border-[#00539F]'
                        }`}
                        title={isChk ? '확인 취소' : '확인 완료로 표시'}>
                        {isChk && (
                          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* 근거 내용 패널 */}
                {isDone && isExp && (
                  <div className="mx-3 mb-3 px-3 py-2.5 bg-white/80 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <FileText className="w-3 h-3 text-[#00539F]"/>
                      <span className="text-[10px] font-black text-[#00539F] uppercase tracking-wider">검토 근거</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{item.basis}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── 완료 요약 + 버튼 ───────────────────────────────── */}
        {phase === 'done' && (
          <div className="px-4 pb-4 pt-3 space-y-2 border-t border-slate-100 shrink-0">
            {/* 요약 */}
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
              <Bot className="w-4 h-4 text-[#00539F] shrink-0"/>
              <span className="text-[11px] text-slate-600 flex-1">
                AI 검토 완료 —
                <span className="text-emerald-600 font-black"> {passCount} 통과</span>
                {warnCount > 0 && <span className="text-amber-600 font-black"> · {warnCount} 권고</span>}
                {failCount > 0 && <span className="text-rose-600 font-black"> · {failCount} 오류</span>}
              </span>
              <span className={`text-[11px] font-black ${allChecked ? 'text-emerald-600' : 'text-slate-400'}`}>
                확인 {checkedCount}/{items.length}
              </span>
            </div>

            {/* 권고/오류 안내 */}
            {warnCount > 0 && failCount === 0 && !allChecked && (
              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 leading-relaxed">
                ⚠ 권고 항목의 근거를 확인하고 체크박스를 선택해야 상신할 수 있습니다.
              </p>
            )}
            {failCount > 0 && (
              <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2 leading-relaxed">
                오류 항목 {failCount}건을 수정한 후 결재 상신을 진행하세요.
              </p>
            )}

            {/* 버튼 */}
            <div className="flex gap-2 pt-0.5">
              <button onClick={onClose}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-500 hover:bg-slate-50 transition-colors">
                닫기
              </button>
              <button
                onClick={onProceed}
                disabled={!allChecked || failCount > 0}
                className="flex-1 py-2.5 bg-[#00539F] hover:bg-[#002571] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-[13px] font-black transition-colors flex items-center justify-center gap-2 shadow-md">
                <Send className="w-4 h-4"/>
                {allChecked ? '결재 상신 진행' : `${items.length - checkedCount}개 항목 미확인`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default SelfCheckModal;
