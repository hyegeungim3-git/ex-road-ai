import React, { useState } from 'react';
import { Workflow, Plus, Trash2, Save, FileJson, ChevronRight, GripVertical } from 'lucide-react';
import { PageShell, Modal, useToast } from '../common.jsx';
import { getDomainList, getDomain, getActiveDomainId } from '../../domains/index.js';
import { AGENT_TEAMS } from '../../user/data/constants.js';
import { loadCustomScenarios, saveCustomScenarios, SCENARIO_CAP } from '../../user/scenarios.js';

/* ================================================================== */
/* 시나리오 빌더 — 오케스트레이션 릴레이를 UI로 조립                    */
/* 저장: roadq.customScenarios.<도메인> → 허브에 '커스텀' 카드로 노출   */
/* agentId는 선택식(오타 방지), 스키마는 팩 orchestration과 동일        */
/* ================================================================== */

/* 에이전트 선택지는 '대상 도메인'의 허브 카탈로그 이름을 쓴다 —
   코어 기본 이름을 그대로 보여주면 발주처 관리자가 자기 에이전트를 못 알아본다
   (예: 한빛에서 '도면 설계 지원'이 '지식 검색 에이전트'로 보임). */
const agentOptsFor = (domain) => AGENT_TEAMS.map(a => {
  const c = domain?.agentCatalog?.[a.id];
  return { id: a.id, label: `${c?.shortName || a.shortName} — ${c?.name || a.name}` };
});
const agentShortName = (domain, id) =>
  domain?.agentCatalog?.[id]?.shortName || AGENT_TEAMS.find(a => a.id === id)?.shortName || id;

const AGENT_OPTS = agentOptsFor(null);

const newStage = () => ({ agentId: AGENT_OPTS[0].id, task: '', logsText: '', outputLabel: '', outputItems: '', handoff: '' });
const newDraft = () => ({
  title: '', brief: '', request: '',
  stages: [newStage(), newStage(), newStage()],
  docNo: '', docTitle: '', summaryText: '',
  metrics: [{ label: '처리 건수', value: '' }, { label: '릴레이 에이전트', value: '' }, { label: '총 소요', value: '약 8초' }, { label: '', value: '' }],
});

/* 폼 → 팩 orchestration 스키마 (빈 값은 무난한 기본값으로 정규화) */
const toScenario = (d) => {
  const stages = d.stages.map((s, i) => {
    const ag = AGENT_TEAMS.find(a => a.id === s.agentId);
    const logs = s.logsText.split('\n').map(x => x.trim()).filter(Boolean);
    const items = s.outputItems.split('\n').map(x => x.trim()).filter(Boolean);
    return {
      agentId: s.agentId, ms: 2400,
      task: s.task.trim() || `${ag?.name || s.agentId}가 담당 단계를 처리합니다.`,
      logs: logs.length ? logs : [`${ag?.shortName || '에이전트'} 작업 시작`, '중간 산출물 생성', '다음 단계 인계 준비 완료'],
      output: { label: s.outputLabel.trim() || `${ag?.shortName || '에이전트'} 처리 결과`, items: items.length ? items : ['처리 완료 — 산출물 생성'] },
      handoff: i === d.stages.length - 1 ? null : (s.handoff.trim() || `산출물을 다음 에이전트로 전달`),
    };
  });
  const summary = d.summaryText.split('\n').map(x => x.trim()).filter(Boolean);
  return {
    title: d.title.trim(), brief: d.brief.trim() || '요청 1건이 에이전트 릴레이로 자동 처리됩니다.',
    request: d.request.trim(),
    stages,
    result: {
      docNo: d.docNo.trim() || '문서번호 자동 채번', docTitle: d.docTitle.trim() || `${d.title.trim()} 결과 보고서`,
      summary: summary.length ? summary : ['전 단계 자동 처리 완료'],
      metrics: d.metrics.filter(m => m.label.trim()).map(m => ({ label: m.label.trim(), value: m.value.trim() || '-' })),
    },
  };
};

const Input = ({ label, value, onChange, placeholder, wide }) => (
  <label className={`block ${wide ? 'col-span-2' : ''}`}>
    <span className="text-xs text-gray-500 font-medium">{label}</span>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:border-blue-400 outline-none" />
  </label>
);

export const ScenarioBuilderPage = ({ domain }) => {
  const toast = useToast();
  const domains = getDomainList();
  /* 기본 대상 도메인 = 지금 관리 중인 도메인 (REB 고정이면 발주처 시연에서 매번 바꿔야 한다).
     주소로 바로 진입하면 localStorage에 활성 도메인이 없을 수 있어 prop을 먼저 본다. */
  const currentId = domain?.id || getActiveDomainId();
  const initialDomainId = domains.some(d => d.id === currentId) ? currentId : domains[0].id;
  const [domainId, setDomainId] = useState(initialDomainId);
  const [list, setList] = useState(() => loadCustomScenarios(initialDomainId));
  const [draft, setDraft] = useState(newDraft);
  const [jsonView, setJsonView] = useState(null);
  /* 선택된 대상 도메인 기준으로 에이전트 이름을 표시 */
  const targetDomain = getDomain(domainId);
  const agentOpts = agentOptsFor(targetDomain);
  const set = (patch) => setDraft(d => ({ ...d, ...patch }));
  const setStage = (i, patch) => set({ stages: draft.stages.map((s, j) => j === i ? { ...s, ...patch } : s) });

  const switchDomain = (id) => { setDomainId(id); setList(loadCustomScenarios(id)); };

  const handleSave = () => {
    if (!draft.title.trim() || !draft.request.trim()) { toast('시나리오 제목과 사용자 요청문은 필수입니다.', 'info'); return; }
    if (draft.stages.length < 2) { toast('스테이지는 2개 이상이어야 합니다.', 'info'); return; }
    if (list.length >= SCENARIO_CAP) { toast(`도메인당 커스텀 시나리오는 ${SCENARIO_CAP}개까지입니다 — 기존 항목을 삭제하세요.`, 'info'); return; }
    const next = [...list, toScenario(draft)];
    saveCustomScenarios(domainId, next); setList(next); setDraft(newDraft());
    toast('저장됨 — 사용자 포털 에이전트 허브에 커스텀 카드로 노출됩니다.', 'success');
  };
  const handleDelete = (idx) => {
    const next = list.filter((_, i) => i !== idx);
    saveCustomScenarios(domainId, next); setList(next);
    toast('커스텀 시나리오를 삭제했습니다.');
  };

  return (
    <PageShell breadcrumb={['도구 · 배포','시나리오 빌더']} title="오케스트레이션 시나리오 빌더"
      sub="에이전트 릴레이 시나리오를 코드 없이 조립합니다 — 저장 즉시 해당 도메인 허브에 카드로 노출 (도메인당 최대 3개)">
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          {/* 메타 */}
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Workflow size={15} className="text-indigo-600"/>시나리오 정보</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs text-gray-500 font-medium">대상 도메인</span>
                <select value={domainId} onChange={e => switchDomain(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-white">
                  {domains.map(d => <option key={d.id} value={d.id}>{d.orgName}</option>)}
                </select>
              </label>
              <Input label="시나리오 제목 *" value={draft.title} onChange={v => set({ title: v })} placeholder="예: 주간 시장동향 브리핑 자동 생성" />
              <Input label="카드 설명 (brief)" value={draft.brief} onChange={v => set({ brief: v })} placeholder="허브 카드·헤더에 표시될 1문장" wide />
              <label className="block col-span-2">
                <span className="text-xs text-gray-500 font-medium">사용자 요청문 *</span>
                <textarea value={draft.request} onChange={e => set({ request: e.target.value })} rows={2}
                  placeholder="사용자가 입력할 법한 자연어 요청 1~2문장"
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:border-blue-400 outline-none resize-none" />
              </label>
            </div>
          </div>

          {/* 스테이지 */}
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm">릴레이 스테이지 ({draft.stages.length}단계)</h3>
              <div className="flex gap-2">
                <button onClick={() => draft.stages.length < 6 && set({ stages: [...draft.stages, newStage()] })}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold text-gray-600 hover:bg-gray-50"><Plus size={13}/>단계 추가</button>
                <button onClick={() => draft.stages.length > 2 && set({ stages: draft.stages.slice(0, -1) })}
                  className="px-2.5 py-1.5 rounded-lg border text-xs font-semibold text-gray-600 hover:bg-gray-50">마지막 삭제</button>
              </div>
            </div>
            <div className="space-y-4">
              {draft.stages.map((s, i) => (
                <div key={i} className="border rounded-xl p-4 bg-gray-50/50">
                  <div className="flex items-center gap-2 mb-3">
                    <GripVertical size={14} className="text-gray-300"/>
                    <span className="text-xs font-black text-indigo-600">Relay {i + 1}/{draft.stages.length}</span>
                    {/* agentId 선택식 — 오타로 인한 조용한 미표시 방지 */}
                    <select value={s.agentId} onChange={e => setStage(i, { agentId: e.target.value })}
                      className="border rounded-lg px-2.5 py-1.5 text-sm bg-white flex-1">
                      {agentOpts.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="이 단계가 하는 일 (task)" value={s.task} onChange={v => setStage(i, { task: v })} placeholder="비우면 자동 문구" />
                    {i < draft.stages.length - 1
                      ? <Input label="핸드오프 (다음 단계로 무엇을 넘기나)" value={s.handoff} onChange={v => setStage(i, { handoff: v })} placeholder="비우면 자동 문구" />
                      : <div className="text-xs text-gray-400 self-end pb-2.5">마지막 단계 — 핸드오프 없음</div>}
                    <label className="block">
                      <span className="text-xs text-gray-500 font-medium">실행 로그 (줄당 1개, 비우면 자동)</span>
                      <textarea value={s.logsText} onChange={e => setStage(i, { logsText: e.target.value })} rows={3}
                        placeholder={'예:\nEXTIS 5분 집계 조회\n결측 구간 산출 완료'}
                        className="mt-1 w-full border rounded-lg px-3 py-2 text-xs font-mono focus:border-blue-400 outline-none resize-none" />
                    </label>
                    <label className="block">
                      <span className="text-xs text-gray-500 font-medium">산출물 (1줄=라벨, 이후 줄=항목)</span>
                      <textarea value={s.outputLabel + (s.outputItems ? '\n' + s.outputItems : '')}
                        onChange={e => { const [first, ...rest] = e.target.value.split('\n'); setStage(i, { outputLabel: first, outputItems: rest.join('\n') }); }}
                        rows={3} placeholder={'조회 결과\n급감속 클러스터 7건 탐지'}
                        className="mt-1 w-full border rounded-lg px-3 py-2 text-xs focus:border-blue-400 outline-none resize-none" />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 결과 */}
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <h3 className="font-bold text-sm mb-3">최종 결과</h3>
            <div className="grid grid-cols-2 gap-3">
              <Input label="문서번호" value={draft.docNo} onChange={v => set({ docNo: v })} placeholder="예: EX-데이터플랫폼부-2026-0142" />
              <Input label="산출 문서 제목" value={draft.docTitle} onChange={v => set({ docTitle: v })} placeholder="비우면 제목 기반 자동" />
              <label className="block col-span-2">
                <span className="text-xs text-gray-500 font-medium">결과 요약 (줄당 1개, 3줄 권장)</span>
                <textarea value={draft.summaryText} onChange={e => set({ summaryText: e.target.value })} rows={3}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:border-blue-400 outline-none resize-none" />
              </label>
              {draft.metrics.map((m, i) => (
                <div key={i} className="grid grid-cols-2 gap-2">
                  <Input label={`지표 ${i + 1} 라벨`} value={m.label} onChange={v => set({ metrics: draft.metrics.map((x, j) => j === i ? { ...x, label: v } : x) })} />
                  <Input label="값" value={m.value} onChange={v => set({ metrics: draft.metrics.map((x, j) => j === i ? { ...x, value: v } : x) })} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 목록 + 액션 */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border shadow-sm p-5 space-y-2">
            <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700">
              <Save size={15}/> 저장 — 허브에 카드로 노출
            </button>
            <button onClick={() => setJsonView(toScenario(draft))} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-bold text-gray-600 hover:bg-gray-50">
              <FileJson size={15}/> 현재 초안 JSON 보기 (팩 스키마)
            </button>
            <p className="text-xs text-gray-400 pt-1">JSON은 팩 orchestration 배열 항목과 동일 구조 — 정식 팩 승격 시 src/domains/*.js에 그대로 붙여넣을 수 있습니다.</p>
          </div>
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <h3 className="font-bold text-sm mb-3">이 도메인의 커스텀 시나리오 ({list.length}/{SCENARIO_CAP})</h3>
            {list.length === 0 ? <p className="text-sm text-gray-400">아직 없음 — 좌측에서 조립 후 저장하세요.</p> : (
              <div className="space-y-2">
                {list.map((s, i) => (
                  <div key={i} className="border rounded-lg p-3">
                    <div className="text-sm font-bold text-gray-800 truncate">{s.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 flex-wrap">
                      {s.stages.map((st, j) => (
                        <React.Fragment key={j}>
                          <span>{agentShortName(targetDomain, st.agentId)}</span>
                          {j < s.stages.length - 1 && <ChevronRight size={10}/>}
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => setJsonView(s)} className="text-xs font-semibold text-gray-500 hover:text-gray-700">JSON</button>
                      <button onClick={() => handleDelete(i)} className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-0.5"><Trash2 size={11}/>삭제</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={!!jsonView} onClose={() => setJsonView(null)} title="시나리오 JSON (팩 orchestration 스키마)" size="lg">
        <textarea readOnly value={jsonView ? JSON.stringify(jsonView, null, 2) : ''} data-testid="scenario-json"
          className="w-full h-96 border rounded-lg p-3 text-xs font-mono bg-gray-50" />
      </Modal>
    </PageShell>
  );
};
