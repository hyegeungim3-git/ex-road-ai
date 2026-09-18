import React, { useState } from 'react';
import { Layers, Route, Database, Zap, RefreshCw, AlertTriangle, CheckCircle2, ArrowDown, GripVertical } from 'lucide-react';
import { MOCK_AUG_STRATEGIES, MOCK_AUG_ROUTES, MOCK_CAG_CACHE } from '../mocks.js';
import { PageShell, useToast, ToggleSwitch } from '../common.jsx';

/* ==================================================================
 * 지식 증강 전략 (RAG · CAG · TAG)
 * "RAG 하나로 다 한다"가 아니라 업무 성격에 맞는 도구를 골라 쓴다는 것을
 * 관리 가능한 형태로 만든 화면. 규정 조회에 매번 벡터 검색을 도는 건 낭비고,
 * 집계 수치를 RAG로 답하면 틀린다.
 * ================================================================== */

const TONE = {
  RAG: { chip: 'bg-blue-100 text-blue-700 border-blue-200',       bar: 'bg-blue-500',    Icon: Database },
  CAG: { chip: 'bg-violet-100 text-violet-700 border-violet-200', bar: 'bg-violet-500',  Icon: Zap },
  TAG: { chip: 'bg-emerald-100 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500', Icon: Layers },
};

export const AugmentStrategyPage = () => {
  const [tab, setTab] = useState('strategy');
  const [routes, setRoutes] = useState(() => MOCK_AUG_ROUTES.map(r => ({ ...r })));
  const [cache, setCache] = useState(() => MOCK_CAG_CACHE.map(c => ({ ...c })));
  const [reloading, setReloading] = useState(null);
  const toast = useToast();

  const stale = cache.filter(c => c.status !== '최신');
  const totalHits = routes.reduce((s, r) => s + r.hits, 0);

  const toggleRoute = (id) => {
    setRoutes(p => p.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    toast('라우팅 규칙을 변경했습니다.');
  };

  const move = (idx, dir) => {
    const next = [...routes];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    setRoutes(next.map((r, i) => ({ ...r, order: i + 1 })));
    toast('규칙 우선순위를 변경했습니다. 위에서부터 먼저 적용됩니다.');
  };

  const reload = (id) => {
    setReloading(id);
    setTimeout(() => {
      setCache(p => p.map(c => c.id === id
        ? { ...c, status: '최신', loaded: new Date().toISOString().slice(0, 16).replace('T', ' ') } : c));
      setReloading(null);
      toast('캐시를 재적재했습니다.');
    }, 1800);
  };

  return (
    <PageShell title="지식 증강 전략" desc="질의 성격에 따라 RAG·CAG·TAG 중 어느 방식으로 처리할지 관리합니다">
      <div className="flex gap-1 mb-4 border-b">
        {[{ id: 'strategy', label: '전략 비교' }, { id: 'route', label: '라우팅 규칙' }, { id: 'cache', label: 'CAG 캐시' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-[13px] font-bold border-b-2 -mb-px transition-colors ${
              tab === t.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── 전략 비교 ── */}
      {tab === 'strategy' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {MOCK_AUG_STRATEGIES.map(s => {
              const tone = TONE[s.name] || TONE.RAG;
              return (
                <div key={s.id} className="bg-white border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <tone.Icon className="w-4 h-4 text-gray-400" />
                    <span className={`text-[12px] font-black px-2 py-0.5 rounded-full border ${tone.chip}`}>{s.name}</span>
                    <span className="ml-auto text-[11px] font-black text-gray-700 tabular-nums">{s.share}%</span>
                  </div>
                  <div className="text-[10px] text-gray-400 mb-2">{s.full}</div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${s.share}%` }} />
                  </div>
                  <p className="text-[12px] text-gray-700 mb-3">{s.desc}</p>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[['평균 지연', `${s.avgLatency}ms`], ['적중률', `${s.hitRate}%`], ['1k당 비용', s.costPer1k]].map(([k, v]) => (
                      <div key={k} className="bg-gray-50 rounded-lg px-2 py-1.5 text-center">
                        <div className="text-[12px] font-black text-gray-800 tabular-nums">{v}</div>
                        <div className="text-[9px] text-gray-500">{k}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-gray-600">{s.strength}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-gray-600">{s.caveat}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-[10px] text-gray-400 mb-1">적용 대상</div>
                    <div className="flex flex-wrap gap-1">
                      {(s.targets || []).map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-400">
            세 방식은 대체재가 아니라 용도가 다른 도구입니다. 규정 조회처럼 잘 바뀌지 않고 자주 참조되는 지식에
            매번 벡터 검색을 도는 것은 낭비이고, 집계 수치를 문서 검색으로 답하면 틀립니다.
          </p>
        </div>
      )}

      {/* ── 라우팅 규칙 ── */}
      {tab === 'route' && (
        <div className="space-y-3">
          <p className="text-[12px] text-gray-500">
            질의가 들어오면 <b>위에서부터</b> 먼저 맞는 규칙의 전략으로 보냅니다. 최근 처리 {totalHits.toLocaleString()}건 기준.
          </p>
          <div className="space-y-2">
            {routes.map((r, i) => {
              const tone = TONE[r.strategy] || TONE.RAG;
              return (
                <div key={r.id} className={`bg-white border rounded-xl p-3 flex items-center gap-3 ${!r.enabled ? 'opacity-50' : ''}`}>
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="우선순위 올리기"
                      className="text-gray-300 hover:text-gray-600 disabled:opacity-30 text-[10px] leading-none">▲</button>
                    <GripVertical className="w-3 h-3 text-gray-300" />
                    <button onClick={() => move(i, 1)} disabled={i === routes.length - 1} aria-label="우선순위 내리기"
                      className="text-gray-300 hover:text-gray-600 disabled:opacity-30 text-[10px] leading-none">▼</button>
                  </div>
                  <span className="text-[11px] font-black text-gray-400 w-5 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-gray-800">{r.when}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">키워드: {r.keywords}</div>
                  </div>
                  <span className="text-[11px] text-gray-500 tabular-nums shrink-0 hidden sm:block">{r.hits.toLocaleString()}건</span>
                  <span className={`text-[11px] font-black px-2 py-1 rounded-full border shrink-0 ${tone.chip}`}>{r.strategy}</span>
                  <ToggleSwitch on={r.enabled} onClick={() => toggleRoute(r.id)} />
                </div>
              );
            })}
          </div>
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <Route className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-800">
              마지막 규칙은 기본 경로입니다 — 앞의 규칙에 걸리지 않은 질의가 모두 여기로 옵니다.
              기본 경로를 끄면 분류되지 않은 질의가 답변을 받지 못하므로 항상 하나는 열어 두십시오.
            </p>
          </div>
        </div>
      )}

      {/* ── CAG 캐시 ── */}
      {tab === 'cache' && (
        <div className="space-y-3">
          {stale.length > 0 && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[12px] text-amber-800">
                재적재 필요 <b>{stale.length}건</b> — 원문이 개정됐는데 캐시가 이전 버전입니다.
                CAG는 검색을 하지 않으므로 <b>재적재 전까지 옛 내용으로 답변</b>합니다. 규정·표준 문서에서는 특히 위험합니다.
              </p>
            </div>
          )}
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    {['캐시 세트', '토큰', '적재 시각', '원문 버전', '상태', '적중', ''].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left font-black text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cache.map(c => (
                    <tr key={c.id} className="border-b last:border-0">
                      <td className="px-3 py-2.5 font-bold text-gray-800">{c.name}</td>
                      <td className="px-3 py-2.5 text-gray-600 tabular-nums whitespace-nowrap">{c.tokens}</td>
                      <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{c.loaded}</td>
                      <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{c.sourceRev}</td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.status === '최신' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{c.status}</span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-600 tabular-nums whitespace-nowrap">{c.hits.toLocaleString()}</td>
                      <td className="px-3 py-2.5">
                        <button onClick={() => reload(c.id)} disabled={reloading === c.id}
                          className="text-[11px] font-bold text-blue-600 hover:underline whitespace-nowrap flex items-center gap-1 disabled:opacity-50">
                          <RefreshCw className={`w-3 h-3 ${reloading === c.id ? 'animate-spin' : ''}`} />
                          {reloading === c.id ? '재적재 중' : '재적재'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-[11px] text-gray-400">
            CAG는 검색 단계가 없어 빠르지만, 그 대가로 <b>원문 변경이 자동 반영되지 않습니다</b>.
            문서 개정 시 재적재가 운영 절차에 포함돼야 합니다.
          </p>
        </div>
      )}
    </PageShell>
  );
};

export default AugmentStrategyPage;
