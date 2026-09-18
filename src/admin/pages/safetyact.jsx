import React, { useState } from 'react';
import { HardHat, ShieldCheck, AlertTriangle, CheckCircle2, Bot, GraduationCap, ClipboardCheck, Landmark } from 'lucide-react';
import { MOCK_SAFETY_DUTIES, MOCK_SAFETY_RISK_LOG, MOCK_SAFETY_TRAINING } from '../mocks.js';
import { PageShell } from '../common.jsx';

/* ==================================================================
 * 중대재해처벌법 대응
 * 시행령 제4조 안전보건 확보 의무 9개 호가 뼈대.
 * 이 플랫폼의 값어치는 문서를 새로 만드는 게 아니라, 위험성평가·교육·점검이
 * 돌아가면서 이행 증빙이 자동으로 쌓인다는 데 있다 — '자동 축적' 표시로 구분한다.
 * ================================================================== */

const STATUS = {
  '이행': { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
  '주의': { cls: 'bg-amber-100 text-amber-700 border-amber-200',       Icon: AlertTriangle },
  '미이행': { cls: 'bg-rose-100 text-rose-700 border-rose-200',        Icon: AlertTriangle },
};

const TABS = [
  { id: 'duty', label: '의무 이행 현황' },
  { id: 'risk', label: '위험성평가 이력' },
  { id: 'train', label: '교육·점검' },
];

export const SafetyActPage = () => {
  const [tab, setTab] = useState('duty');

  const warn = MOCK_SAFETY_DUTIES.filter(d => d.status !== '이행');
  const auto = MOCK_SAFETY_DUTIES.filter(d => d.auto);
  const rate = Math.round((MOCK_SAFETY_DUTIES.filter(d => d.status === '이행').length / (MOCK_SAFETY_DUTIES.length || 1)) * 100);

  return (
    <PageShell title="중대재해처벌법 대응" desc="안전보건 확보 의무 이행 상태와 그 증빙을 한 화면에서 관리합니다">
      {/* 법령 근거 */}
      <div className="bg-slate-800 text-white rounded-xl px-5 py-4 mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <Landmark className="w-4 h-4 shrink-0" />
          <span className="text-[13px] font-black">중대재해 처벌 등에 관한 법률 시행령 제4조</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          사업주·경영책임자는 재해예방에 필요한 안전보건관리체계의 구축 및 이행에 관한 조치를 하여야 합니다.
          시행령 제4조는 그 구체적 의무를 9개 호로 정하고 있으며, 아래는 각 호의 이행 상태와 증빙입니다.
        </p>
      </div>

      {/* 지표 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: '의무 이행률', value: `${rate}%`, cls: rate === 100 ? 'text-emerald-600' : 'text-amber-600' },
          { label: '조치 필요', value: `${warn.length}건`, cls: warn.length ? 'text-rose-600' : 'text-emerald-600' },
          { label: '플랫폼 자동 축적', value: `${auto.length}개 호`, cls: 'text-blue-600' },
          { label: '위험성평가 이력', value: `${MOCK_SAFETY_RISK_LOG.length}건`, cls: 'text-gray-800' },
        ].map(s => (
          <div key={s.label} className="bg-white border rounded-xl px-4 py-3">
            <div className={`text-[18px] font-black ${s.cls}`}>{s.value}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 mb-4 border-b">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-[13px] font-bold border-b-2 -mb-px transition-colors ${
              tab === t.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── 의무 이행 현황 ── */}
      {tab === 'duty' && (
        <div className="space-y-3">
          {warn.length > 0 && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[12px] text-amber-800">
                조치 필요 <b>{warn.length}건</b> — {warn.map(d => `${d.clause} ${d.name}`).join(', ')}.
                의무 이행은 결과가 아니라 <b>증빙</b>으로 판단되므로, 실시 여부와 함께 기록을 남겨야 합니다.
              </p>
            </div>
          )}
          <div className="space-y-2">
            {MOCK_SAFETY_DUTIES.map(d => {
              const st = STATUS[d.status] || STATUS['이행'];
              return (
                <div key={d.id} className="bg-white border rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">{d.clause}</span>
                    <span className="text-[13px] font-black text-gray-800">{d.name}</span>
                    {d.auto && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1">
                        <Bot className="w-2.5 h-2.5" />자동 축적
                      </span>
                    )}
                    <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0 ${st.cls}`}>
                      <st.Icon className="w-3 h-3" />{d.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500 flex-wrap">
                    <span className="text-gray-600">{d.evidence}</span>
                    <span className="ml-auto">최종 {d.last} · {d.owner}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-400">
            <b>자동 축적</b> 표시는 담당자가 따로 문서를 만들지 않아도 플랫폼 사용 과정에서 증빙이 남는 항목입니다.
            나머지는 사람이 실시하고 기록해야 하며, 플랫폼은 기한 도래를 알릴 뿐입니다.
          </p>
        </div>
      )}

      {/* ── 위험성평가 이력 ── */}
      {tab === 'risk' && (
        <div className="space-y-3">
          <p className="text-[12px] text-gray-500">
            위험성평가 에이전트로 생성된 평가가 이력으로 남습니다 — 시행령 제3호(유해·위험요인 확인·개선) 증빙입니다.
          </p>
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    {['작업', '문서번호', '평가일', '평가자', '위험요인', '개선조치', '상태'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left font-black text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_SAFETY_RISK_LOG.map(r => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="px-3 py-2.5 font-bold text-gray-800">{r.task}</td>
                      <td className="px-3 py-2.5 font-mono text-gray-500 whitespace-nowrap">{r.doc}</td>
                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{r.assessed}</td>
                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{r.by}</td>
                      <td className="px-3 py-2.5 text-gray-600 tabular-nums">{r.risks}건</td>
                      <td className="px-3 py-2.5 tabular-nums">
                        <span className={r.actions < r.risks ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                          {r.actions}/{r.risks}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.status === '조치 완료' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-[11px] text-gray-400">
            위험요인 대비 개선조치가 모자란 건은 <b>미완결 평가</b>로 남습니다. 평가만 하고 조치하지 않으면
            증빙으로서 효력이 약하므로 조치 완료까지 추적합니다.
          </p>
        </div>
      )}

      {/* ── 교육·점검 ── */}
      {tab === 'train' && (
        <div className="space-y-3">
          <div className="space-y-2">
            {MOCK_SAFETY_TRAINING.map(t => {
              const pct = Math.round((t.done / (t.total || 1)) * 100);
              return (
                <div key={t.id} className="bg-white border rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="text-[13px] font-black text-gray-800">{t.name}</span>
                    <span className="text-[11px] text-gray-400">· {t.target}</span>
                    <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      t.status === '완료' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{t.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${pct === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[11px] font-black text-gray-700 tabular-nums shrink-0">{t.done}/{t.total}</span>
                    <span className="text-[11px] text-gray-400 shrink-0">{t.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <ClipboardCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-800">
              교육은 실시 여부보다 <b>대상자 전원 이수</b>가 증빙의 핵심입니다. 미이수자가 남은 상태에서 재해가 발생하면
              교육 실시 기록만으로는 의무 이행을 인정받기 어렵습니다.
            </p>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default SafetyActPage;
