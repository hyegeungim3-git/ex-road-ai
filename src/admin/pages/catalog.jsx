import React, { useState } from 'react';
import { Database, GitBranch, ArrowRight, Search, ShieldAlert, CheckCircle2, AlertTriangle, Boxes, Cpu, FileText } from 'lucide-react';
import { MOCK_DATA_ASSETS, MOCK_DATA_LINEAGE } from '../mocks.js';
import { PageShell } from '../common.jsx';

/* ==================================================================
 * 데이터 카탈로그 · 리니지
 * 카탈로그 = 어떤 자산이 있는가 / 리니지 = 어디서 와서 어디로 가는가.
 * 답변 근거의 역추적, 표준화 진척, 모델 열화 원인 추적이 모두 여기에 걸린다.
 * ================================================================== */

const GRADE_CLS = { '기밀': 'bg-rose-600', '대외비': 'bg-amber-500', '내부': 'bg-blue-500', '공개': 'bg-slate-400' };
const NODE_ICON = { 'DB': Database, '파일': FileText, '문서': FileText, '이미지': Boxes, '센서': Cpu, '에이전트': Cpu, '모델': Cpu };

const bar = (v) => v >= 90 ? 'bg-emerald-500' : v >= 70 ? 'bg-amber-500' : 'bg-rose-500';
const txt = (v) => v >= 90 ? 'text-emerald-600' : v >= 70 ? 'text-amber-600' : 'text-rose-600';

export const DataCatalogPage = () => {
  const [tab, setTab] = useState('catalog');
  const [sel, setSel] = useState(MOCK_DATA_ASSETS[0]?.id || null);
  const [q, setQ] = useState('');

  const assets = MOCK_DATA_ASSETS.filter(a =>
    !q.trim() || (a.name + a.source + a.owner + (a.tags || []).join()).toLowerCase().includes(q.trim().toLowerCase()));
  const asset = MOCK_DATA_ASSETS.find(a => a.id === sel) || null;
  const lin = sel ? MOCK_DATA_LINEAGE[sel] : null;

  const lowStd = MOCK_DATA_ASSETS.filter(a => a.standardized < 70);
  const avgStd = Math.round(MOCK_DATA_ASSETS.reduce((s, a) => s + a.standardized, 0) / (MOCK_DATA_ASSETS.length || 1));

  const openLineage = (id) => { setSel(id); setTab('lineage'); };

  /* 클래스는 정적으로 — Tailwind JIT는 `bg-${x}-50` 같은 동적 조합을 생성하지 못한다 */
  const Node = ({ name, type }) => {
    const Icon = NODE_ICON[type] || Boxes;
    return (
      <div className="px-3 py-2 rounded-lg border bg-slate-50 border-slate-200 min-w-0">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3 h-3 text-gray-400 shrink-0" />
          <span className="text-[11px] font-bold text-gray-700 truncate">{name}</span>
        </div>
        {type && <div className="text-[9px] text-gray-400 mt-0.5">{type}</div>}
      </div>
    );
  };

  return (
    <PageShell title="데이터 카탈로그 · 리니지" desc="어떤 데이터 자산이 있고, 어디서 와서 어디로 흘러가는지 관리합니다">
      {/* 지표 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: '등록 자산', value: `${MOCK_DATA_ASSETS.length}건`, cls: 'text-gray-800' },
          { label: '평균 표준화율', value: `${avgStd}%`, cls: txt(avgStd) },
          { label: '표준화 미흡(70% 미만)', value: `${lowStd.length}건`, cls: lowStd.length ? 'text-rose-600' : 'text-emerald-600' },
          { label: '리니지 정의', value: `${Object.keys(MOCK_DATA_LINEAGE).length}건`, cls: 'text-gray-800' },
        ].map(s => (
          <div key={s.label} className="bg-white border rounded-xl px-4 py-3">
            <div className={`text-[18px] font-black ${s.cls}`}>{s.value}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 mb-4 border-b">
        {[{ id: 'catalog', label: '카탈로그' }, { id: 'lineage', label: '리니지' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-[13px] font-bold border-b-2 -mb-px transition-colors ${
              tab === t.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── 카탈로그 ── */}
      {tab === 'catalog' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="자산명·원천·소유부서·태그 검색"
                className="w-full border rounded-lg pl-8 pr-3 py-2 text-[12px] outline-none focus:ring-2 focus:ring-blue-100" />
            </div>
            <span className="text-[11px] text-gray-400">{assets.length}건 표시</span>
          </div>

          {lowStd.length > 0 && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[12px] text-amber-800">
                표준화율 70% 미만 자산 <b>{lowStd.length}건</b> — {lowStd.map(a => a.name).join(', ')}.
                표준화가 끝나지 않은 자산은 분석·예측에 그대로 쓸 수 없어 후속 과제의 선행 조건이 됩니다.
              </p>
            </div>
          )}

          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    {['자산명', '원천', '소유', '등급', '규모', '갱신', '신선도', '품질', '표준화', ''].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left font-black text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {assets.map(a => (
                    <tr key={a.id} className={`border-b last:border-0 hover:bg-gray-50 ${sel === a.id ? 'bg-blue-50/50' : ''}`}>
                      <td className="px-3 py-2.5">
                        <div className="font-bold text-gray-800">{a.name}</div>
                        <div className="flex gap-1 mt-0.5 flex-wrap">
                          {(a.tags || []).map(t => (
                            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{t}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{a.source}</td>
                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{a.owner}</td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${GRADE_CLS[a.grade] || 'bg-slate-400'}`}>{a.grade}</span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{a.volume}</td>
                      <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{a.cycle}</td>
                      <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{a.freshness}</td>
                      <td className="px-3 py-2.5">
                        <span className={`font-black tabular-nums ${txt(a.quality)}`}>{a.quality}</span>
                      </td>
                      <td className="px-3 py-2.5 min-w-[90px]">
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${bar(a.standardized)}`} style={{ width: `${a.standardized}%` }} />
                          </div>
                          <span className={`text-[10px] font-bold tabular-nums ${txt(a.standardized)}`}>{a.standardized}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <button onClick={() => openLineage(a.id)}
                          className="text-[11px] font-bold text-blue-600 hover:underline whitespace-nowrap flex items-center gap-1">
                          <GitBranch className="w-3 h-3" />리니지
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── 리니지 ── */}
      {tab === 'lineage' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[12px] font-bold text-gray-600">자산 선택</span>
            <select value={sel || ''} onChange={e => setSel(e.target.value)}
              aria-label="리니지 대상 자산"
              className="border rounded-lg px-3 py-2 text-[12px] bg-white">
              {MOCK_DATA_ASSETS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            {asset && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${GRADE_CLS[asset.grade] || 'bg-slate-400'}`}>
                {asset.grade}
              </span>
            )}
          </div>

          {!lin ? (
            <p className="text-[12px] text-gray-400 py-8 text-center bg-white border rounded-xl">
              이 자산의 리니지가 아직 정의되지 않았습니다.
            </p>
          ) : (
            <div className="bg-white border rounded-xl p-4 space-y-4">
              {/* 원천 */}
              <section>
                <div className="text-[11px] font-black text-gray-500 mb-2">원천 (Upstream)</div>
                <div className="flex flex-wrap gap-2">
                  {lin.upstream.map(n => <Node key={n.name} {...n} />)}
                </div>
              </section>

              {/* 처리 단계 */}
              <section>
                <div className="text-[11px] font-black text-gray-500 mb-2">처리 단계</div>
                <div className="flex items-stretch gap-2 flex-wrap">
                  {lin.stages.map((st, i) => (
                    <React.Fragment key={st.name}>
                      {i > 0 && <div className="flex items-center"><ArrowRight className="w-4 h-4 text-gray-300" /></div>}
                      <div className="px-3 py-2 rounded-lg border border-blue-200 bg-blue-50 min-w-0 max-w-[220px]">
                        <div className="text-[11px] font-black text-blue-800">{st.name}</div>
                        <div className="text-[10px] text-gray-600 mt-0.5">{st.desc}</div>
                        {st.tool && <div className="text-[9px] text-blue-500 mt-1">{st.tool}</div>}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </section>

              {/* 소비처 */}
              <section>
                <div className="text-[11px] font-black text-gray-500 mb-2">소비처 (Downstream)</div>
                <div className="flex flex-wrap gap-2">
                  {lin.downstream.map(n => (
                    <div key={n.name} className="px-3 py-2 rounded-lg border border-emerald-200 bg-emerald-50">
                      <div className="text-[11px] font-bold text-emerald-800">{n.name}</div>
                      <div className="text-[9px] text-emerald-600 mt-0.5">{n.type}</div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="pt-3 border-t flex items-start gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-gray-500">
                  이 경로가 답변 근거의 역추적 기준이 됩니다. 원천이 바뀌면 하류의 모델·에이전트가
                  함께 영향을 받으므로, 모델 성능이 떨어졌을 때 어느 원천이 변했는지 여기서 확인합니다.
                </p>
              </div>
            </div>
          )}

          {asset && (
            <div className="bg-white border rounded-xl p-4">
              <div className="text-[12px] font-black text-gray-800 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />자산 요약
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                {[['원천', asset.source], ['소유', asset.owner], ['형식', asset.format], ['규모', asset.volume],
                  ['갱신 주기', asset.cycle], ['신선도', asset.freshness], ['품질 점수', `${asset.quality}`], ['표준화율', `${asset.standardized}%`]].map(([k, v]) => (
                  <div key={k}>
                    <div className="text-gray-400">{k}</div>
                    <div className="font-bold text-gray-700">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
};

export default DataCatalogPage;
