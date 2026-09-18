import React from "react";
import { Radio, ChevronRight } from "lucide-react";
import { cn } from "../utils.jsx";

/* ================================================================== */
/* 라이브 지표 카드 — 팩 liveMetric + 엔진 상태를 SVG 스파크라인으로    */
/* recharts 미사용 (메인 청크 경량 유지). GENERAL 빈 화면에 표시        */
/* ================================================================== */
const W = 240, H = 48, PAD = 3;

const LiveMetricCard = ({ cfg, state, speed, setSpeed, onAction }) => {
  if (!cfg || !state) return null;
  const lo = cfg.min, hi = cfg.max;
  const y = v => H - PAD - ((v - lo) / (hi - lo)) * (H - PAD * 2);
  const pts = state.series.map((v, i) => `${(i / (state.series.length - 1)) * W},${y(v).toFixed(1)}`).join(" ");
  const above = state.above;
  const tone = above ? "text-rose-600" : "text-emerald-600";

  return (
    <div className="w-full max-w-2xl mb-4">
      <div className={cn("rounded-2xl border bg-white shadow-sm overflow-hidden transition-colors",
        above ? "border-rose-200" : "border-slate-200")}>
        <div className="px-4 py-2.5 flex items-center gap-2 flex-wrap">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-60", above ? "bg-rose-400" : "bg-emerald-400")} />
            <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", above ? "bg-rose-500" : "bg-emerald-500")} />
          </span>
          <span className="text-[12px] font-black text-slate-800 truncate">{cfg.label}</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-900 text-white font-black tracking-wider shrink-0">LIVE</span>
          <span className={cn("ml-auto text-[16px] font-black font-mono tabular-nums shrink-0", tone)}>
            {state.value.toFixed(cfg.decimals ?? 1)}<span className="text-[10px] font-bold text-slate-400 ml-0.5">{cfg.unit}</span>
          </span>
          {/* 배속 컨트롤 */}
          <span className="flex items-center gap-1 shrink-0" role="group" aria-label="시뮬레이션 배속">
            {[1, 10, 60].map(s => (
              <button key={s} onClick={() => setSpeed(s)} aria-pressed={speed === s}
                className={cn("px-2 py-0.5 min-h-[28px] max-md:min-h-[36px] max-md:px-2.5 rounded-md text-[10px] font-black border transition-colors",
                  speed === s ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300")}>
                {s}×
              </button>
            ))}
          </span>
        </div>
        <div className="px-4 pb-2.5">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-12 block" preserveAspectRatio="none" aria-hidden="true">
            {/* 임계선 */}
            <line x1="0" x2={W} y1={y(cfg.threshold)} y2={y(cfg.threshold)} stroke="#f43f5e" strokeWidth="1" strokeDasharray="4 3" opacity="0.55" />
            <polyline points={pts} fill="none" stroke={above ? "#e11d48" : "#059669"} strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400">{cfg.thresholdLabel} · 돌파 {state.crossings}회 · 경과 {Math.floor(state.simSeconds / 60)}분(시뮬레이션)</span>
            <span className="text-[10px] text-slate-300 font-medium truncate">{cfg.source}</span>
            {above && cfg.alert?.link?.agentId && (
              <button onClick={() => onAction?.(cfg.alert.link.agentId)}
                className="ml-auto flex items-center gap-0.5 text-[10px] font-black text-rose-600 hover:text-rose-700 shrink-0">
                <Radio className="w-3 h-3" /> 지금 대응하기 <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMetricCard;
