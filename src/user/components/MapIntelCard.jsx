import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Map, TrendingUp, MousePointerClick } from "lucide-react";
import { cn } from "../utils.jsx";

/* ================================================================== */
/* 지도 인텔리전스 카드 — SVG 타일 히트맵 + 시계열 차트 (시뮬레이션)     */
/* recharts를 포함하므로 반드시 lazy import로만 사용한다 (번들 분리)     */
/* ================================================================== */

const hex2rgb = (h) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const lerpColor = (a, b, t) => {
  const A = hex2rgb(a), B = hex2rgb(b);
  const c = A.map((v, i) => Math.round(v + (B[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};

const TILE = 64, GAP = 6, R = 10;

const MapIntelCard = ({ data }) => {
  const { config } = data;
  const [focusId, setFocusId] = useState(data.focusId || config.regions[0].id);
  const focus = config.regions.find(r => r.id === focusId) || config.regions[0];

  const values = config.regions.map(r => r.value);
  const min = Math.min(...values), max = Math.max(...values);
  const norm = (v) => (max === min ? 0.5 : (v - min) / (max - min));

  const W = config.grid.cols * TILE + (config.grid.cols - 1) * GAP;
  const H = config.grid.rows * TILE + (config.grid.rows - 1) * GAP;

  const chartData = config.seriesLabels.map((label, i) => ({
    label,
    focus: focus.series[i],
    avg: config.avgSeries[i],
  }));

  const rank = [...config.regions].sort((a, b) => b.value - a.value).findIndex(r => r.id === focus.id) + 1;

  return (
    // w-[600px]: 부모 flex가 content 폭으로 수축하므로 명시 폭 없이는 1fr 차트 컬럼이 0으로 붕괴한다
    // @container: 카드 실폭 기준 반응형 — 좁은 중앙 영역(뷰포트 <~1000)에서 차트가 접히는 대신 세로 스택 (4단계)
    <div className="mt-2 w-[600px] max-w-full @container rounded-2xl border-2 border-slate-200 bg-white shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-1 duration-300">
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/70">
        <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
          <Map className="w-3.5 h-3.5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-black text-slate-800 truncate">{config.metricLabel}</div>
          <div className="text-[10px] font-medium text-slate-400">{config.periodLabel}</div>
        </div>
        <span className="text-[9px] px-1.5 py-0.5 rounded font-black bg-slate-100 border border-slate-200 text-slate-500 shrink-0">시뮬레이션</span>
      </div>

      <div className="grid @xl:grid-cols-[minmax(0,300px)_1fr] gap-4 p-4">
        {/* ── 타일 히트맵 ── */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
            {config.mapTitle}
            <span className="flex items-center gap-0.5 normal-case font-bold text-slate-300"><MousePointerClick className="w-3 h-3" />클릭 전환</span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[300px]" role="img" aria-label={config.mapTitle}>
            {config.regions.map(r => {
              const t = norm(r.value);
              const isFocus = r.id === focus.id;
              const dark = t > 0.55;
              return (
                <g key={r.id} onClick={() => setFocusId(r.id)} className="cursor-pointer" style={{ transition: "opacity .15s" }}>
                  <title>{`${r.name} ${r.value.toLocaleString()}${config.unit}`}</title>
                  <rect
                    x={r.x * (TILE + GAP)} y={r.y * (TILE + GAP)} width={TILE} height={TILE} rx={R}
                    fill={lerpColor(config.heatLow, config.heatHigh, t)}
                    stroke={isFocus ? "#0F172A" : "rgba(15,23,42,.08)"} strokeWidth={isFocus ? 2.5 : 1}
                  />
                  <text x={r.x * (TILE + GAP) + TILE / 2} y={r.y * (TILE + GAP) + 26} textAnchor="middle"
                    fontSize="10.5" fontWeight="700" fill={dark ? "rgba(255,255,255,.92)" : "#334155"}>{r.name}</text>
                  <text x={r.x * (TILE + GAP) + TILE / 2} y={r.y * (TILE + GAP) + 44} textAnchor="middle"
                    fontSize="12" fontWeight="900" fill={dark ? "#fff" : "#0F172A"}>{r.value.toLocaleString()}</text>
                </g>
              );
            })}
          </svg>
          {/* 범례 */}
          <div className="flex items-center gap-2 mt-2 max-w-[300px]">
            <span className="text-[10px] font-bold text-slate-400 shrink-0">{min.toLocaleString()}{config.unit}</span>
            <div className="flex-1 h-2 rounded-full" style={{ background: `linear-gradient(to right, ${config.heatLow}, ${config.heatHigh})` }} />
            <span className="text-[10px] font-bold text-slate-400 shrink-0">{max.toLocaleString()}{config.unit}</span>
          </div>
        </div>

        {/* ── 시계열 차트 + 인사이트 ── */}
        <div className="min-w-0 flex flex-col">
          <div className="flex items-center gap-1.5 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
            <TrendingUp className="w-3 h-3" />{config.chartTitle} — <span className="text-slate-700">{focus.name}</span>
          </div>
          <div className="h-[180px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 6, right: 8, left: -14, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94A3B8", fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={44} />
                <Tooltip
                  formatter={(v, name) => [`${Number(v).toLocaleString()}${config.unit}`, name === "focus" ? focus.name : config.avgLabel]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 11, fontWeight: 700 }}
                />
                <Line type="monotone" dataKey="avg" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                <Line type="monotone" dataKey="focus" stroke={config.heatHigh} strokeWidth={2.5}
                  dot={{ r: 3, fill: config.heatHigh, strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-3 mt-1 mb-2 text-[10px] font-bold text-slate-400">
            <span className="flex items-center gap-1"><span className="inline-block w-4 h-0.5 rounded" style={{ background: config.heatHigh }} />{focus.name}</span>
            <span className="flex items-center gap-1"><span className="inline-block w-4 border-t-2 border-dashed border-slate-400" />{config.avgLabel}</span>
          </div>
          {/* 인사이트 박스 */}
          <div className="mt-auto p-3 rounded-xl bg-blue-50/60 border border-blue-100">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[11px] font-black text-blue-900">{focus.name}</span>
              <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-black",
                rank <= Math.ceil(config.regions.length / 3) ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500")}>
                {focus.value.toLocaleString()}{config.unit} · {rank}위/{config.regions.length}
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-600 leading-relaxed">{focus.insight}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapIntelCard;
