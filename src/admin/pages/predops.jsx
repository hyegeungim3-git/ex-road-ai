import React, { useState } from 'react';
import { Activity, TrendingDown, RefreshCw, CheckCircle2, AlertTriangle, ArrowUpRight, GitCompare, Play } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { MOCK_PRED_MODELS, MOCK_PRED_TREND, MOCK_PRED_DRIFT, MOCK_RETRAIN_RUNS } from '../mocks.js';
import { PageShell, useToast } from '../common.jsx';

/* ==================================================================
 * 예측 모델 운영 (MLOps)
 * LLM 파인튜닝 화면과 별개다. 업무 예측 모델(품질·이상탐지)은 입력 분포가
 * 변하면 반드시 열화하는데, 그걸 감시·재학습하는 화면이 없으면
 * 1년 뒤 현장은 그 예측을 믿지 않는다.
 * ================================================================== */

const STATUS = {
  '정상': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  '주의': 'bg-amber-100 text-amber-700 border-amber-200',
  '경고': 'bg-rose-100 text-rose-700 border-rose-200',
};
const DRIFT = {
  '정상': { cls: 'text-emerald-600', bar: 'bg-emerald-500' },
  '주의': { cls: 'text-amber-600',   bar: 'bg-amber-500' },
  '경고': { cls: 'text-rose-600',    bar: 'bg-rose-500' },
};
const SERIES = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6'];

/* 지표가 낮을수록 좋은 것(MAE 등)과 높을수록 좋은 것(F1·AUC)을 구분한다 —
   이걸 안 나누면 '개선'과 '악화'를 반대로 표시하게 된다. */
const lowerIsBetter = (metricName) => /MAE|RMSE|오차|불량/i.test(metricName);

export const PredictionOpsPage = () => {
  const [runs, setRuns] = useState(() => MOCK_RETRAIN_RUNS.map(r => ({ ...r })));
  const [training, setTraining] = useState(null);
  const toast = useToast();

  const warn = MOCK_PRED_MODELS.filter(m => m.status !== '정상');
  const trendKeys = MOCK_PRED_MODELS.map(m => m.name).filter(n => MOCK_PRED_TREND[0]?.[n] !== undefined);

  const startRetrain = (model) => {
    setTraining(model.id);
    toast(`${model.name} 재학습을 시작했습니다.`);
    setTimeout(() => {
      setTraining(null);
      setRuns(p => [{
        id: `rt-${Date.now()}`, model: model.name, trigger: '수동 실행',
        started: new Date().toISOString().slice(0, 16).replace('T', ' '),
        champion: model.current, challenger: model.baseline,
        verdict: '승격 대기', note: '검증 완료 — 담당자 승인 후 배포',
      }, ...p]);
      toast('재학습이 끝났습니다. 승격 대기 목록을 확인하세요.');
    }, 2600);
  };

  const promote = (id) => {
    setRuns(p => p.map(r => r.id === id ? { ...r, verdict: '승격 완료', note: '운영 모델로 배포됨' } : r));
    toast('챌린저 모델을 운영에 배포했습니다.');
  };

  return (
    <PageShell title="예측 모델 운영" desc="업무 예측 모델의 성능 열화를 감시하고 재학습·승격을 관리합니다">
      {/* 경고 배너 */}
      {warn.length > 0 && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
          <TrendingDown className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[12px] text-amber-800">
            성능 열화 감지 <b>{warn.length}건</b> — {warn.map(m => m.name).join(', ')}.
            입력 데이터 분포가 바뀌면 모델은 배포 시점 성능을 유지하지 못합니다. 드리프트 원인을 확인하고 재학습을 검토하세요.
          </p>
        </div>
      )}

      {/* 모델 카드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-5">
        {MOCK_PRED_MODELS.map(m => {
          const better = lowerIsBetter(m.metricName);
          const degraded = better ? m.current > m.baseline : m.current < m.baseline;
          const delta = (m.current - m.baseline).toFixed(2);
          return (
            <div key={m.id} className="bg-white border rounded-xl p-4">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className="text-[13px] font-black text-gray-800">{m.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">{m.task} · {m.version}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS[m.status] || STATUS['정상']}`}>{m.status}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { k: '배포 시점', v: m.baseline },
                  { k: '현재', v: m.current },
                  { k: '임계', v: m.threshold },
                ].map(x => (
                  <div key={x.k} className="bg-gray-50 rounded-lg px-3 py-2 text-center">
                    <div className="text-[15px] font-black text-gray-800 tabular-nums">{x.v}</div>
                    <div className="text-[10px] text-gray-500">{m.metricName} {x.k}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-[11px] flex-wrap">
                <span className={degraded ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                  배포 후 {degraded ? '악화' : '개선'} {delta > 0 ? `+${delta}` : delta}
                </span>
                <span className="text-gray-400">· 추론 {m.samples}</span>
                <span className="text-gray-400">· 담당 {m.owner}</span>
                <span className="ml-auto text-gray-500">차기 재학습 {m.nextRetrain}</span>
              </div>
              <button onClick={() => startRetrain(m)} disabled={training === m.id}
                className={`mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-bold transition-colors ${
                  training === m.id ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                {training === m.id
                  ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />재학습 중…</>
                  : <><Play className="w-3.5 h-3.5" />재학습 실행</>}
              </button>
            </div>
          );
        })}
      </div>

      {/* 성능 추이 */}
      <div className="bg-white border rounded-xl p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-blue-600" />
          <span className="text-[13px] font-black text-gray-800">배포 후 성능 추이</span>
          <span className="ml-auto text-[11px] text-gray-400">지표 특성이 달라 모델별 축 해석에 주의</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={MOCK_PRED_TREND} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {trendKeys.map((k, i) => (
              <Line key={k} type="monotone" dataKey={k} stroke={SERIES[i % SERIES.length]} strokeWidth={2} dot={{ r: 3 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* 입력 드리프트 */}
        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-[13px] font-black text-gray-800">입력 데이터 드리프트</span>
          </div>
          <p className="text-[11px] text-gray-400 mb-3">PSI 0.1 미만 정상 · 0.1~0.25 주의 · 0.25 이상 경고</p>
          <div className="space-y-2.5">
            {MOCK_PRED_DRIFT.map(d => {
              const tone = DRIFT[d.level] || DRIFT['정상'];
              return (
                <div key={d.feature}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[12px] font-bold text-gray-700 flex-1 min-w-0 truncate">{d.feature}</span>
                    <span className={`text-[11px] font-black tabular-nums ${tone.cls}`}>PSI {d.psi}</span>
                    <span className={`text-[10px] font-bold ${tone.cls}`}>{d.level}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${Math.min(100, d.psi * 250)}%` }} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">{d.note}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 재학습 이력 */}
        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <GitCompare className="w-4 h-4 text-indigo-600" />
            <span className="text-[13px] font-black text-gray-800">재학습·승격 이력</span>
            <span className="ml-auto text-[10px] text-gray-400">챔피언 vs 챌린저</span>
          </div>
          <div className="space-y-2">
            {runs.map(r => (
              <div key={r.id} className="border rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[12px] font-bold text-gray-800">{r.model}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{r.trigger}</span>
                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    r.verdict === '승격 완료' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{r.verdict}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-600 mb-1">
                  <span className="tabular-nums">챔피언 {r.champion}</span>
                  <ArrowUpRight className="w-3 h-3 text-indigo-500" />
                  <span className="tabular-nums font-bold text-indigo-700">챌린저 {r.challenger}</span>
                  <span className="text-gray-400">· {r.started}</span>
                </div>
                <p className="text-[10px] text-gray-400">{r.note}</p>
                {r.verdict === '승격 대기' && (
                  <button onClick={() => promote(r.id)}
                    className="mt-2 flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline">
                    <CheckCircle2 className="w-3 h-3" />운영 배포 승인
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-[11px] text-gray-400 mt-4">
        승격은 자동으로 처리하지 않습니다 — 챌린저가 검증셋에서 더 좋아도 현장 조건이 바뀐 것인지
        일시적 변동인지는 담당자가 판단해야 하므로, 배포 전 사람 확인 단계를 둡니다.
      </p>
    </PageShell>
  );
};

export default PredictionOpsPage;
