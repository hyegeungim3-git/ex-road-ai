import React, { useState } from 'react';
import { Camera, RotateCcw, CheckCircle2, AlertTriangle, FileText, Archive, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { MOCK_REPRO_SNAPSHOTS, MOCK_REPRO_POLICY } from '../mocks.js';
import { PageShell, useToast } from '../common.jsx';

/* ==================================================================
 * 답변 재현성 스냅샷
 * 질의·답변만 남기면 5년 뒤에 "왜 그렇게 답했나"를 재현할 수 없다.
 * 모델·지식베이스·프롬프트·가드레일 버전이 함께 있어야 재현이 성립한다.
 * 그리고 재현이 안 되면 '안 된다'와 '무엇이 달라졌다'를 밝히는 게 핵심이다 —
 * 재현되는 척하는 것이 심사에서는 더 위험하다.
 * ================================================================== */

const STRAT = {
  RAG: 'bg-blue-100 text-blue-700 border-blue-200',
  CAG: 'bg-violet-100 text-violet-700 border-violet-200',
  TAG: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export const ReproPage = () => {
  const [open, setOpen] = useState(MOCK_REPRO_SNAPSHOTS[0]?.id || null);
  const [running, setRunning] = useState(null);
  const [result, setResult] = useState({});   // { [id]: 'same' | 'differs' }
  const toast = useToast();

  const ok = MOCK_REPRO_SNAPSHOTS.filter(s => s.reproducible);
  const ng = MOCK_REPRO_SNAPSHOTS.filter(s => !s.reproducible);

  const reproduce = (s) => {
    setRunning(s.id);
    setTimeout(() => {
      setRunning(null);
      setResult(p => ({ ...p, [s.id]: s.reproducible ? 'same' : 'differs' }));
      toast(s.reproducible
        ? '당시 구성으로 재현했고 결과가 일치합니다.'
        : '당시 구성 일부가 현재와 달라 동일 재현이 불가합니다.');
    }, 1800);
  };

  return (
    <PageShell title="답변 재현성 스냅샷" desc="과거 답변을 그때의 구성 그대로 재현할 수 있는지 관리합니다">
      {/* 지표 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: '보관 스냅샷', value: `${MOCK_REPRO_SNAPSHOTS.length}건`, cls: 'text-gray-800' },
          { label: '재현 가능', value: `${ok.length}건`, cls: 'text-emerald-600' },
          { label: '구성 변경으로 재현 불가', value: `${ng.length}건`, cls: ng.length ? 'text-amber-600' : 'text-emerald-600' },
          { label: '보존 기간', value: `${MOCK_REPRO_POLICY.retentionYears}년`, cls: 'text-gray-800' },
        ].map(s => (
          <div key={s.label} className="bg-white border rounded-xl px-4 py-3">
            <div className={`text-[18px] font-black ${s.cls}`}>{s.value}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 보존 정책 */}
      <div className="bg-white border rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Archive className="w-4 h-4 text-blue-600" />
          <span className="text-[13px] font-black text-gray-800">스냅샷 보존 정책</span>
          <span className="ml-auto text-[11px] text-gray-400">
            {MOCK_REPRO_POLICY.captured} 수집 · {MOCK_REPRO_POLICY.excluded} 제외
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {MOCK_REPRO_POLICY.items.map(i => (
            <span key={i} className="text-[10px] px-2 py-1 rounded bg-gray-50 border text-gray-600">{i}</span>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 mt-2">
          이 조합이 다 있어야 재현이 성립합니다. 질의·답변만 남기면 나중에 같은 답이 안 나오는 이유를 설명할 수 없습니다.
        </p>
      </div>

      {ng.length > 0 && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[12px] text-amber-800">
            재현 불가 <b>{ng.length}건</b> — 모델 교체·지식베이스 재색인·프롬프트 개정 이후의 스냅샷입니다.
            <b> 재현 불가 자체가 결함은 아니지만</b>, 심사에서는 무엇이 언제 바뀌었는지 설명할 수 있어야 합니다.
          </p>
        </div>
      )}

      {/* 스냅샷 목록 */}
      <div className="space-y-2">
        {MOCK_REPRO_SNAPSHOTS.map(s => {
          const expanded = open === s.id;
          const res = result[s.id];
          return (
            <div key={s.id} className="bg-white border rounded-xl overflow-hidden">
              <div className="px-4 py-3">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${STRAT[s.strategy] || STRAT.RAG}`}>{s.strategy}</span>
                  <span className="text-[13px] font-bold text-gray-800 min-w-0 truncate">{s.question}</span>
                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 flex items-center gap-1 ${
                    s.reproducible ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                    {s.reproducible ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {s.reproducible ? '재현 가능' : '재현 불가'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-500 flex-wrap">
                  <span>{s.at}</span>
                  <span>· {s.model} {s.modelVer}</span>
                  <span>· KB {s.kbRev}</span>
                  <span>· 신뢰도 {s.confidence}</span>
                  <button onClick={() => setOpen(expanded ? null : s.id)}
                    className="ml-auto flex items-center gap-0.5 font-bold text-gray-500 hover:text-gray-800">
                    구성 상세 {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {expanded && (
                  <div className="mt-3 pt-3 border-t space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                      {[['모델', `${s.model} ${s.modelVer}`], ['지식베이스', s.kbRev],
                        ['프롬프트', s.promptVer], ['가드레일', s.guardrailVer],
                        ['증강 전략', s.strategy], ['temperature', s.temp],
                        ['응답 신뢰도', s.confidence]].map(([k, v]) => (
                        <div key={k}>
                          <div className="text-gray-400">{k}</div>
                          <div className="font-bold text-gray-700">{v}</div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-[11px] font-black text-gray-500 mb-1.5">당시 근거 문서</div>
                      <div className="space-y-1">
                        {s.sources.map(src => (
                          <div key={src.name} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border">
                            <FileText className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="text-[11px] font-bold text-gray-700">{src.name}</span>
                            <span className="ml-auto text-[10px] text-gray-400">{src.rev}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {s.drift.length > 0 && (
                      <div>
                        <div className="text-[11px] font-black text-amber-600 mb-1.5">현재 구성과의 차이</div>
                        <ul className="space-y-1">
                          {s.drift.map((d, i) => (
                            <li key={i} className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">· {d}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <button onClick={() => reproduce(s)} disabled={running === s.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                    {running === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                    {running === s.id ? '재현 중…' : '재현 실행'}
                  </button>
                  {res === 'same' && (
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />당시 구성으로 재현 — 결과 일치
                    </span>
                  )}
                  {res === 'differs' && (
                    <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />동일 재현 불가 — 위 차이 항목이 원인
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-gray-400 mt-4">
        재현 결과가 다를 때 그것을 감추지 않는 것이 이 화면의 목적입니다. 모델·지식이 바뀌면 답이 달라지는 게 정상이고,
        심사에서 요구되는 것은 <b>무엇이 언제 왜 바뀌었는지 설명할 수 있는 기록</b>입니다.
      </p>
    </PageShell>
  );
};

export default ReproPage;
