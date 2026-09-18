import React, { useState } from 'react';
import { Scale, ShieldAlert, Stamp, ClipboardCheck, CheckCircle2, XCircle, Clock, Eye, AlertTriangle, FileText, Landmark, History, RefreshCw, Trash2 } from 'lucide-react';
import { MOCK_AIACT_SYSTEMS, MOCK_AIACT_LABELING, MOCK_AIACT_ASSESSMENTS, AIACT_STD_PHRASE } from '../mocks.js';
import { Modal, PageShell, useToast, ToggleSwitch } from '../common.jsx';
import { readAudit, clearAudit, AUDIT_CAP } from '../../user/auditLog.js';
import { getActiveDomainId } from '../../domains/index.js';

/* 감사 이벤트 유형 표시 (auditLog.js 이벤트 스키마와 짝) */
const AUDIT_TYPE = {
  query:         { label:'질의응답',     cls:'bg-blue-100 text-blue-700' },
  xai_open:      { label:'XAI 열람',     cls:'bg-violet-100 text-violet-700' },
  orch_complete: { label:'시나리오 완주', cls:'bg-indigo-100 text-indigo-700' },
  live_alert:    { label:'실시간 알람',   cls:'bg-rose-100 text-rose-700' },
  feedback:      { label:'답변 피드백',   cls:'bg-emerald-100 text-emerald-700' },
};

const STATUS_MAP = {
  '고영향 확인':'bg-red-100 text-red-700',
  '검토 중':'bg-yellow-100 text-yellow-700',
  '비해당':'bg-gray-100 text-gray-600',
};
const ASSESS_MAP = {
  '완료':'bg-green-100 text-green-700',
  '진행 중':'bg-blue-100 text-blue-700',
  '예정':'bg-gray-100 text-gray-600',
};

export const AiActCompliancePage = () => {
  const toast = useToast();
  const [tab, setTab] = useState('systems');
  const [systems] = useState(MOCK_AIACT_SYSTEMS);
  const [statusFilter, setStatusFilter] = useState('전체');
  const [detail, setDetail] = useState(null);
  const [labeling, setLabeling] = useState(MOCK_AIACT_LABELING.map(r=>({...r})));
  const assessments = MOCK_AIACT_ASSESSMENTS;

  const highCount = systems.filter(s=>s.status==='고영향 확인').length;
  const reviewCount = systems.filter(s=>s.status==='검토 중').length;
  const enabledRules = labeling.filter(r=>r.enabled);
  const avgCoverage = enabledRules.length ? enabledRules.reduce((a,r)=>a+r.coverage,0)/enabledRules.length : 0;
  const doneAssess = assessments.filter(a=>a.status==='완료').length;
  const nextAssess = assessments.find(a=>a.status!=='완료');

  const filteredSystems = statusFilter==='전체' ? systems : systems.filter(s=>s.status===statusFilter);

  const TABS = [
    {id:'systems', label:'고영향 AI 관리', icon:ShieldAlert},
    {id:'labeling', label:'생성물 표시', icon:Stamp},
    {id:'assessment', label:'영향평가 현황', icon:ClipboardCheck},
    {id:'audit', label:'감사 추적(실데이터)', icon:History},
  ];

  // 감사 추적 — 사용자 포털 실사용 로그 (활성 도메인 기준, SECURE 세션 제외 수집)
  const [auditEvents, setAuditEvents] = useState(() => readAudit());
  const refreshAudit = () => setAuditEvents(readAudit());
  const auQueries = auditEvents.filter(e=>e.type==='query');
  const auXai = auditEvents.filter(e=>e.type==='xai_open').length;
  const auOrch = auditEvents.filter(e=>e.type==='orch_complete');
  const auHitl = auOrch.reduce((s,e)=>s+(e.hitl?.length||0),0);
  const xaiRate = auQueries.length ? Math.round(auXai/auQueries.length*100) : null;
  const lowConf = auQueries.filter(e=>typeof e.confidence==='number'&&e.confidence<75).length + auQueries.filter(e=>e.confidence===null&&!e.grounded).length;

  return (
    <PageShell breadcrumb={['관리자 전용','AI 기본법 대응']} title="AI 기본법 대응 현황"
      sub="「인공지능 발전과 신뢰 기반 조성 등에 관한 기본법」 (2026-01-22 시행) 이행 관리">
      {/* 법령 근거 배너 */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5 flex items-start gap-3">
        <Landmark size={18} className="text-blue-600 mt-0.5 shrink-0"/>
        <div className="flex-1">
          <div className="text-sm font-bold text-blue-800 mb-1.5">기관 이행 의무 근거 조문</div>
          <div className="flex items-center gap-2 flex-wrap">
            {[['제31조','투명성 확보 — AI 생성물 고지·표시'],['제33조','고영향 AI 해당 여부 확인'],['제34조','고영향 AI 사업자 책무'],['제35조','고영향 AI 영향평가']].map(([art,desc])=>(
              <span key={art} className="text-xs bg-white border border-blue-200 rounded-lg px-2.5 py-1">
                <span className="font-bold text-blue-700">{art}</span>
                <span className="text-gray-500 ml-1.5">{desc}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          ['등록 AI 시스템', systems.length+'개', 'text-blue-600', '전 부서 운영 시스템 기준'],
          ['고영향 AI 확인', highCount+'건', 'text-red-600', `해당 여부 검토 중 ${reviewCount}건`],
          ['생성물 표시 적용률', avgCoverage.toFixed(1)+'%', avgCoverage>=95?'text-green-600':'text-yellow-600', `표시 규칙 활성 ${enabledRules.length}/${labeling.length}개`],
          ['영향평가 완료', `${doneAssess}/${assessments.length}건`, 'text-purple-600', nextAssess?`다음: ${nextAssess.date}`:'전체 완료'],
        ].map(([label,val,cls,sub])=>(
          <div key={label} className="bg-white rounded-xl border p-4">
            <div className="text-xs text-gray-400 mb-1">{label}</div>
            <div className={`text-2xl font-extrabold ${cls}`}>{val}</div>
            <div className="text-xs text-gray-400 mt-1">{sub}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex border-b mb-5">
        {TABS.map(({id,label,icon:Icon})=>(
          <button key={id} onClick={()=>setTab(id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${tab===id?'border-blue-600 text-blue-700':'border-transparent text-gray-500 hover:text-gray-800'}`}>
            <Icon size={15}/>{label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: 고영향 AI 관리 ── */}
      {tab==='systems'&&(
        <div>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {['전체','고영향 확인','검토 중','비해당'].map(c=>(
              <button key={c} onClick={()=>setStatusFilter(c)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${statusFilter===c?'bg-blue-600 text-white border-blue-600':'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>{c}</button>
            ))}
            <span className="ml-auto text-xs text-gray-400">{filteredSystems.length}개 시스템</span>
          </div>
          <div className="bg-white rounded-xl border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase whitespace-nowrap">
                <tr>
                  <th className="px-4 py-3 text-left">AI 시스템</th>
                  <th className="px-4 py-3 text-left">운영 부서</th>
                  <th className="px-4 py-3 text-left">판정</th>
                  <th className="px-4 py-3 text-left">판정 근거</th>
                  <th className="px-4 py-3 text-center">책무 이행</th>
                  <th className="px-4 py-3 text-left">책임자</th>
                  <th className="px-4 py-3 text-center">상세</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredSystems.map(s=>{
                  const done = s.measures.filter(m=>m.done).length;
                  return (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">{s.name}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{s.dept}</td>
                      <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${STATUS_MAP[s.status]}`}>{s.status}</span></td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{s.basis}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-mono font-bold ${done===s.measures.length?'text-green-700':done>=3?'text-yellow-600':'text-red-600'}`}>{done}/{s.measures.length}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{s.manager}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={()=>setDetail(s)} className="text-xs text-blue-600 hover:underline font-medium inline-flex items-center gap-1"><Eye size={12}/>보기</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2">
            <AlertTriangle size={13} className="shrink-0"/>
            고영향 AI로 확인된 시스템은 제34조에 따른 5개 책무(위험관리·설명·이용자 보호·사람의 관리감독·문서 보관)를 모두 이행해야 합니다. 미이행 항목은 상세 화면에서 확인하세요.
          </div>
        </div>
      )}

      {/* ── Tab 2: 생성물 표시 ── */}
      {tab==='labeling'&&(
        <div className="space-y-5">
          <div className="text-sm text-gray-500">
            제31조에 따라 생성형 AI 산출물에는 <strong>AI로 생성되었음을 이용자가 알 수 있도록 고지·표시</strong>해야 합니다. 채널별 표시 규칙과 적용률을 관리합니다.
          </div>
          <div className="bg-white rounded-xl border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase whitespace-nowrap">
                <tr>
                  <th className="px-4 py-3 text-left">대상 채널</th>
                  <th className="px-4 py-3 text-left">유형</th>
                  <th className="px-4 py-3 text-left">표시 방식</th>
                  <th className="px-4 py-3 text-left">적용률</th>
                  <th className="px-4 py-3 text-right">주간 표시 건수</th>
                  <th className="px-4 py-3 text-center">활성</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {labeling.map(r=>(
                  <tr key={r.id} className={`hover:bg-gray-50 transition-colors ${!r.enabled?'opacity-50':''}`}>
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {r.target}
                      {r.note&&<div className="text-[11px] text-amber-600 font-normal mt-0.5">{r.note}</div>}
                    </td>
                    <td className="px-4 py-3"><span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">{r.type}</span></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{r.method}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${r.coverage>=95?'bg-green-500':r.coverage>0?'bg-yellow-500':'bg-gray-300'}`} style={{width:`${r.coverage}%`}}/>
                        </div>
                        <span className="text-xs font-bold text-gray-600 w-12">{r.coverage}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-blue-700">{r.weekly.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <ToggleSwitch on={r.enabled} onClick={()=>{
                        setLabeling(p=>p.map(x=>x.id===r.id?{...x,enabled:!x.enabled}:x));
                        toast(`'${r.target}' 표시 규칙 ${r.enabled?'비활성화':'활성화'}됨`, r.enabled?'info':'success');
                      }}/>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* 고지문 미리보기 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border p-5">
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5"><FileText size={13}/>텍스트·문서 고지문 (표준 문구)</div>
              <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600 border border-dashed">
                ⓘ {AIACT_STD_PHRASE}
              </div>
            </div>
            <div className="bg-white rounded-xl border p-5">
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5"><Stamp size={13}/>이미지 워터마크 정책</div>
              <ul className="text-sm text-slate-600 space-y-2">
                <li className="flex items-start gap-2"><CheckCircle2 size={15} className="text-green-500 mt-0.5 shrink-0"/>차트·시각 자료에 C2PA 표준 비가시성 메타데이터 삽입</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={15} className="text-green-500 mt-0.5 shrink-0"/>대외 공개 자료는 우측 하단 가시성 표시 병행</li>
                <li className="flex items-start gap-2"><Clock size={15} className="text-yellow-500 mt-0.5 shrink-0"/>공문 초안 표시 규칙은 법무팀 문구 검토 후 적용 예정</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 3: 영향평가 현황 ── */}
      {tab==='assessment'&&(
        <div className="space-y-4">
          <div className="text-sm text-gray-500">
            제35조에 따라 고영향 AI는 <strong>기본권 영향평가</strong>를 실시하고 결과를 기록·보관합니다. 평가 회차별 진행 상태와 지적사항 조치 현황입니다.
          </div>
          {assessments.map(a=>(
            <div key={a.id} className="bg-white rounded-xl border p-5">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ASSESS_MAP[a.status]}`}>{a.status}</span>
                  <div>
                    <div className="font-bold text-gray-800">{a.system}</div>
                    <div className="text-xs text-gray-400">{a.round} · {a.assessor}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">{a.status==='완료'?'평가일':'일정'}</div>
                  <div className="text-sm font-semibold text-gray-700">{a.date}</div>
                </div>
              </div>
              {a.status==='진행 중'&&(
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1"><span>평가 진행률</span><span className="font-bold text-blue-700">{a.progress}%</span></div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full transition-all" style={{width:`${a.progress}%`}}/></div>
                </div>
              )}
              {a.scores.length>0&&(
                <div className="grid grid-cols-5 gap-3 mb-4">
                  {a.scores.map(([k,v])=>(
                    <div key={k} className="bg-slate-50 rounded-lg p-3">
                      <div className="text-[11px] text-gray-400 mb-1.5 leading-tight">{k}</div>
                      {v===null
                        ? <div className="text-sm font-bold text-gray-300">평가 전</div>
                        : <>
                            <div className={`text-lg font-extrabold ${v>=85?'text-green-600':v>=70?'text-yellow-600':'text-red-600'}`}>{v}<span className="text-xs font-normal text-gray-400">점</span></div>
                            <div className="h-1 bg-gray-200 rounded-full mt-1.5 overflow-hidden"><div className={`h-full rounded-full ${v>=85?'bg-green-500':v>=70?'bg-yellow-500':'bg-red-500'}`} style={{width:`${v}%`}}/></div>
                          </>}
                    </div>
                  ))}
                </div>
              )}
              {a.grade!=='-'&&(
                <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg mb-3">
                  <CheckCircle2 size={13}/>종합 판정: {a.grade}
                </div>
              )}
              {a.findings.length>0&&(
                <div className="border-t pt-3 mt-1">
                  <div className="text-xs font-semibold text-gray-500 mb-2">지적사항 및 조치</div>
                  <div className="space-y-1.5">
                    {a.findings.map((f,i)=>(
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 flex items-center gap-2">
                          {f.status==='조치 완료'?<CheckCircle2 size={14} className="text-green-500 shrink-0"/>:<Clock size={14} className="text-blue-500 shrink-0"/>}
                          {f.text}
                        </span>
                        <span className={`text-xs font-semibold shrink-0 ml-3 ${f.status==='조치 완료'?'text-green-600':'text-blue-600'}`}>{f.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {a.status==='예정'&&(
                <div className="text-sm text-gray-400 flex items-center gap-2"><Clock size={14}/>고영향 해당 여부 확인 결과에 따라 평가 범위를 확정합니다.</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Tab 4: 감사 추적 (사용자 포털 실사용 로그) ── */}
      {tab==='audit'&&(
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-gray-400">활성 도메인 <span className="font-bold text-gray-600">{getActiveDomainId()}</span> · 보관 상한 {AUDIT_CAP}건(초과 시 오래된 순 삭제) · 보안(SECURE) 세션은 무저장 원칙에 따라 수집 제외</span>
            <button onClick={refreshAudit} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold text-gray-600 hover:bg-gray-50"><RefreshCw size={13}/>새로고침</button>
            <button onClick={()=>{clearAudit();refreshAudit();toast('감사 로그를 초기화했습니다.');}} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50"><Trash2 size={13}/>초기화</button>
          </div>
          <div className="grid grid-cols-5 gap-4 mb-5">
            {[
              ['총 상호작용', auditEvents.length+'건', 'text-blue-600', '전 유형 합계'],
              ['질의응답', auQueries.length+'건', 'text-gray-700', '일반·검토·번역·보고서'],
              ['XAI 열람율', xaiRate===null?'—':xaiRate+'%', 'text-violet-600', `판단 근거 열람 ${auXai}건 / 질의 ${auQueries.length}건`],
              ['시나리오 완주', auOrch.length+'건', 'text-indigo-600', `인적 확인 지점 통과 ${auHitl}회`],
              ['저신뢰·비근거 질의', lowConf+'건', lowConf>0?'text-amber-600':'text-green-600', '신뢰도 75% 미만 또는 근거 없음'],
            ].map(([label,val,cls,sub])=>(
              <div key={label} className="bg-white rounded-xl border p-4">
                <div className="text-xs text-gray-400 mb-1">{label}</div>
                <div className={`text-2xl font-extrabold ${cls}`}>{val}</div>
                <div className="text-xs text-gray-400 mt-1">{sub}</div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-gray-50/80 border-b flex items-center justify-between">
              <h3 className="font-bold text-sm">최근 이벤트 (최신 30건)</h3>
              <span className="text-xs text-gray-400">제34조 기록·감독 책무 — 사용자 포털에서 실시간 수집</span>
            </div>
            {auditEvents.length===0 ? (
              <div className="px-5 py-10 text-center text-sm text-gray-400">수집된 이벤트가 없습니다 — 사용자 포털에서 질의·시나리오를 실행하면 여기에 축적됩니다.</div>
            ) : (
              <div className="divide-y">
                {auditEvents.slice(0,30).map(e=>{
                  const tmeta = AUDIT_TYPE[e.type] || { label:e.type, cls:'bg-gray-100 text-gray-600' };
                  return (
                    <div key={e.id} className="px-5 py-3 flex items-start gap-3 text-sm">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold shrink-0 ${tmeta.cls}`}>{tmeta.label}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-gray-700 truncate">{e.summary}</div>
                        {e.type==='orch_complete'&&(
                          <div className="text-xs text-gray-400 mt-0.5 truncate">
                            릴레이: {(e.stages||[]).join(' → ')}{e.docNo?` · ${e.docNo}`:''}
                            {e.hitl?.length>0&&<span className="text-amber-600 font-semibold"> · 인적 확인 {e.hitl.length}지점</span>}
                          </div>
                        )}
                        {e.type==='query'&&(
                          <div className="text-xs text-gray-400 mt-0.5">
                            {e.mode} · {typeof e.confidence==='number'?`신뢰도 ${e.confidence}%`:'신뢰도 미산출'} · {e.grounded?'근거 기반':'모델 지식'}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 font-mono shrink-0">{e.ts}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 시스템 상세 Modal */}
      <Modal isOpen={!!detail} onClose={()=>setDetail(null)} title="고영향 AI 시스템 상세" size="md">
        {detail&&(
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-lg text-gray-800">{detail.name}</div>
                <div className="text-xs text-gray-400">{detail.dept} · 책임자 {detail.manager}</div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_MAP[detail.status]}`}>{detail.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-0.5">활용 목적</div>
                <div className="text-sm text-slate-700">{detail.purpose}</div>
              </div>
              <div className="col-span-2 bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-0.5">판정 근거 (제2조제4호·제33조)</div>
                <div className="text-sm text-slate-700">{detail.basis}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-0.5">판정 확정일</div>
                <div className="text-sm font-semibold text-slate-800 font-mono">{detail.confirmedAt}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-0.5">책무 이행률</div>
                <div className="text-sm font-semibold text-slate-800 font-mono">{detail.measures.filter(m=>m.done).length}/{detail.measures.length}</div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5"><Scale size={13}/>제34조 사업자 책무 이행 체크리스트</div>
              <div className="space-y-2">
                {detail.measures.map((m,i)=>(
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 flex items-center gap-2">
                      {m.done?<CheckCircle2 size={15} className="text-green-500 shrink-0"/>:<XCircle size={15} className="text-red-400 shrink-0"/>}
                      {m.k}
                    </span>
                    <span className={`text-xs font-semibold ${m.done?'text-green-600':'text-red-500'}`}>{m.done?'이행':'미이행'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </PageShell>
  );
};
