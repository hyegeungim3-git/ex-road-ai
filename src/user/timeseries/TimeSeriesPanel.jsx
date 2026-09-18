/**
 * TimeSeriesPanel — 시계열 인텔리전스 (사용자 포털 '데이터' 탭)
 *
 * 도로에서 올라오는 시계열을 4개 축으로 본다.
 *   예측(forecast) · 이상탐지(anomaly) · 예지보전(health) · 데이터 품질(quality)
 * 데이터는 팩의 domain.timeSeries가 주고, 곡선은 engine.js가 결정적으로 생성한다.
 * 팩에 timeSeries가 없으면 UserApp이 탭 자체를 노출하지 않는다.
 */
import React, { useMemo, useState } from "react";
import {
  ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, CartesianGrid,
} from "recharts";
import { TrendingUp, AlertTriangle, Activity, Database, Info } from "lucide-react";
import { cn } from "../utils.jsx";
import { buildSeries, buildForecast, buildTrend, gradeOf, GRADE_STYLE } from "./engine.js";

const VIEWS = [
  { id: "forecast", label: "예측",       Icon: TrendingUp,    desc: "구간 속도·교통량 단기 예측" },
  { id: "anomaly",  label: "이상탐지",   Icon: AlertTriangle, desc: "돌발·이상 패턴 검지와 근거" },
  { id: "health",   label: "예지보전",   Icon: Activity,      desc: "시설물 계측 추세와 잔존수명" },
  { id: "quality",  label: "데이터 품질", Icon: Database,      desc: "수집 파이프라인·규칙·모델 상태" },
];

const Card = ({ className, children }) => (
  <div className={cn("rounded-2xl border border-slate-200 bg-white shadow-sm", className)}>{children}</div>
);

const Stat = ({ label, value, note, tone = "slate" }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 min-w-0">
    <div className="text-[11px] font-bold text-slate-500 truncate">{label}</div>
    <div className={cn("text-[18px] font-black tabular-nums leading-tight mt-0.5",
      tone === "rose" ? "text-rose-600" : tone === "amber" ? "text-amber-600" : tone === "emerald" ? "text-emerald-600" : "text-slate-900")}>{value}</div>
    {note && <div className="text-[11px] text-slate-400 font-medium truncate">{note}</div>}
  </div>
);

const FactorBars = ({ items, color }) => (
  <div className="space-y-1.5">
    {items.map((f) => (
      <div key={f.label} className="flex items-center gap-2">
        <div className="text-[11px] font-semibold text-slate-600 w-[130px] sm:w-[160px] shrink-0 truncate">{f.label}</div>
        <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${f.pct}%`, backgroundColor: color }} />
        </div>
        <div className="text-[11px] font-black text-slate-500 tabular-nums w-8 text-right">{f.pct}%</div>
      </div>
    ))}
  </div>
);

/* ── 1. 예측 ───────────────────────────────────────────── */
const ForecastView = ({ cfg, color }) => {
  const segments = cfg?.segments || [];
  // 판정 기준은 팩이 준다 — 코어에 도메인 수치를 박으면 다음 발주처에서 거짓말이 된다
  const { maeTarget = null, driftThreshold = null } = cfg || {};
  const [activeId, setActiveId] = useState(segments[0]?.id);
  const seg = segments.find((s) => s.id === activeId) || segments[0];

  const data = useMemo(() => {
    if (!seg) return [];
    const observed = buildSeries({ points: 24, base: seg.baseline, dip: seg.dip, seed: seg.seed, noise: 2.2 });
    const forecast = buildForecast(observed, seg.forecast, { steps: 6 });
    return [...observed.slice(0, -1), ...forecast];
  }, [seg]);

  if (!seg) return null;
  const current = data.filter((d) => d.v != null).at(-1)?.v ?? seg.baseline;
  const tone = current <= seg.threshold ? "rose" : current <= seg.warn ? "amber" : "emerald";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="구간 선택">
        {segments.map((s) => (
          <button key={s.id} role="tab" aria-selected={s.id === seg.id} onClick={() => setActiveId(s.id)}
            className={cn("px-3 py-1.5 rounded-xl text-[12px] font-bold border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
              s.id === seg.id ? "text-white border-transparent shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}
            style={s.id === seg.id ? { backgroundColor: color } : undefined}>
            {s.name}
          </button>
        ))}
      </div>

      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
          <div className="min-w-0">
            <div className="text-[15px] font-black text-slate-900 truncate">{seg.name}</div>
            <div className="text-[12px] font-semibold text-slate-500">{seg.route} · {seg.mileage}</div>
          </div>
          <div className="text-[11px] font-bold text-slate-400">{cfg.modelName} · {cfg.horizonLabel} 예측</div>
        </div>

        <div className="h-[220px] sm:h-[260px] mt-3 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 10, fill: "#94A3B8" }} interval="preserveStartEnd" minTickGap={24} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} width={36} domain={[0, "dataMax + 10"]} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: "1px solid #E2E8F0" }}
                formatter={(v, n) => [v == null ? "-" : `${v} ${seg.unit}`, n === "v" ? "관측" : n === "p" ? "예측" : n === "hi" ? "신뢰구간 상단" : "신뢰구간 하단"]} />
              <ReferenceLine y={seg.threshold} stroke="#F43F5E" strokeDasharray="4 4"
                label={{ value: seg.thresholdLabel || `임계 ${seg.threshold}`, position: "insideTopRight", fontSize: 10, fill: "#F43F5E" }} />
              <Area type="monotone" dataKey="hi" stroke="none" fill={color} fillOpacity={0.12} isAnimationActive={false} />
              <Area type="monotone" dataKey="lo" stroke="none" fill="#FFFFFF" fillOpacity={1} isAnimationActive={false} />
              <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2.4} dot={false} isAnimationActive={false} name="관측" />
              <Line type="monotone" dataKey="p" stroke={color} strokeWidth={2} strokeDasharray="5 4" dot={false} isAnimationActive={false} name="예측" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-3">
          <Stat label="현재 관측" value={`${current} ${seg.unit}`} tone={tone} note={`평시 ${seg.baseline} ${seg.unit}`} />
          <Stat label={`${cfg.horizonLabel} 예측`} value={`${seg.forecast.value} ${seg.unit}`} note={`95% ${seg.forecast.lo}~${seg.forecast.hi}`} />
          <Stat label="예측 오차(MAE)" value={`${seg.mae} ${seg.unit}`}
            note={maeTarget != null ? `목표 ${maeTarget} 이하` : undefined}
            tone={maeTarget != null && seg.mae > maeTarget ? "amber" : "emerald"} />
          <Stat label="드리프트 지수" value={`+${seg.drift}`}
            note={driftThreshold != null ? `임계 ${driftThreshold}` : undefined}
            tone={driftThreshold == null ? "slate" : seg.drift >= driftThreshold ? "rose" : seg.drift >= driftThreshold * 0.8 ? "amber" : "emerald"} />
        </div>

        <div className="flex gap-2 mt-3 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-[12px] text-slate-600 font-medium leading-relaxed">{seg.insight}</p>
        </div>
      </Card>
    </div>
  );
};

/* ── 2. 이상탐지 ───────────────────────────────────────── */
const AnomalyView = ({ cfg, color }) => {
  const data = useMemo(() => buildSeries({
    points: 36, base: cfg.streamBase, dip: cfg.streamDip, seed: cfg.streamSeed, noise: 2.8, stepMin: 2,
  }), [cfg]);
  const dipIdx = Math.round((cfg.streamDip?.atPct ?? 0.7) * (data.length - 1));

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="text-[15px] font-black text-slate-900">{cfg.streamLabel}</div>
          <div className="text-[11px] font-bold text-slate-400">검지 모델 {cfg.detector}</div>
        </div>
        <div className="h-[190px] sm:h-[220px] mt-3 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 10, fill: "#94A3B8" }} interval="preserveStartEnd" minTickGap={24} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} width={36} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: "1px solid #E2E8F0" }}
                formatter={(v) => [`${v} ${cfg.streamUnit}`, "관측"]} />
              <ReferenceLine x={data[dipIdx]?.t} stroke="#F43F5E" strokeWidth={1.5}
                label={{ value: "이상 검지", position: "top", fontSize: 10, fill: "#F43F5E" }} />
              <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2.2} fill={color} fillOpacity={0.1} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
          {cfg.stats.map((s) => <Stat key={s.label} label={s.label} value={s.value} note={s.note} />)}
        </div>
      </Card>

      <div className="space-y-3">
        {cfg.events.map((ev) => (
          <Card key={ev.id} className="p-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={cn("px-2 py-0.5 rounded-lg text-[11px] font-black",
                ev.status === "확정" ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-amber-50 text-amber-700 border border-amber-200")}>
                {ev.status}
              </span>
              <span className="text-[13px] font-black text-slate-900">{ev.type}</span>
              <span className="text-[12px] font-semibold text-slate-500">{ev.time} · {ev.spot}</span>
              <span className="ml-auto text-[12px] font-black text-slate-700 tabular-nums">이상 점수 {ev.score}</span>
            </div>
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">왜 이상으로 판정했나</div>
            <FactorBars items={ev.why} color={color} />
            <div className="mt-2.5 text-[12px] font-semibold text-slate-600">
              <span className="text-slate-400">조치 </span>{ev.action}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

/* ── 3. 예지보전 ───────────────────────────────────────── */
const HealthView = ({ cfg, color }) => (
  <div className="space-y-3">
    {cfg.assets.map((a) => {
      // 낮을수록 나쁜 지표(가용률·잔여 두께 등)는 팩이 lowerIsBad로 알린다
      const below = Boolean(a.lowerIsBad);
      const grade = gradeOf(a.value, a.threshold, { below });
      const st = GRADE_STYLE[grade];
      const pct = Math.min(100, Math.round((below ? (a.value / a.threshold) : (a.value / a.threshold)) * 100));
      const trend = buildTrend({ value: a.value, threshold: a.threshold, seed: a.seed, trendUp: a.trendUp });
      return (
        <Card key={a.id} className="p-4">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={cn("px-2 py-0.5 rounded-lg text-[11px] font-black border", st.bg, st.text, st.border)}>{a.grade}</span>
            <span className="text-[14px] font-black text-slate-900">{a.name}</span>
            <span className="text-[12px] font-semibold text-slate-500">{a.route} {a.mileage}</span>
            <span className="ml-auto text-[12px] font-bold text-slate-500">잔존수명 추정 <span className="text-slate-900 font-black tabular-nums">{a.rulMonths}개월</span></span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_240px] gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-[12px] font-bold text-slate-500">{a.metric}</span>
                <span className="text-[20px] font-black text-slate-900 tabular-nums">{a.value}<span className="text-[12px] ml-0.5">{a.unit}</span></span>
                <span className="text-[11px] font-semibold text-slate-400">관리 임계 {a.threshold}{a.unit}</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden mt-2" role="img" aria-label={`${a.metric} 임계 대비 ${pct}%`}>
                <div className={cn("h-full rounded-full", st.dot)} style={{ width: `${pct}%` }} />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5">
                {a.sub.map((s) => (
                  <div key={s.label} className="text-[12px] font-semibold text-slate-600">
                    <span className="text-slate-400">{s.label} </span>{s.value}
                    {s.note && <span className="text-slate-400 font-medium"> ({s.note})</span>}
                  </div>
                ))}
              </div>
              <div className="mt-2.5 text-[12px] font-semibold text-slate-700">
                <span className="text-slate-400">조치 </span>{a.action}
              </div>
            </div>
            <div className="h-[110px] -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trend} margin={{ top: 6, right: 6, bottom: 0, left: 0 }}>
                  <XAxis dataKey="t" hide />
                  <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: "1px solid #E2E8F0" }}
                    formatter={(v) => [`${v} ${a.unit}`, a.metric]} />
                  <ReferenceLine y={a.threshold} stroke="#F43F5E" strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={color} fillOpacity={0.12} isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
              <div className="text-[10px] text-slate-400 font-semibold text-center -mt-1">최근 30일 추세</div>
            </div>
          </div>
        </Card>
      );
    })}
    <p className="text-[11px] text-slate-400 font-medium px-1">{cfg.note}</p>
  </div>
);

/* ── 4. 데이터 품질 ────────────────────────────────────── */
const QualityView = ({ cfg }) => (
  <div className="space-y-4">
    <Card className="p-4 sm:p-5">
      <div className="text-[14px] font-black text-slate-900 mb-3">수집 파이프라인</div>
      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full min-w-[620px] text-left">
          <thead>
            <tr className="text-[11px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-200">
              <th className="py-2 pr-3">파이프라인</th><th className="py-2 pr-3">경로</th>
              <th className="py-2 pr-3 text-right">수집량</th><th className="py-2 pr-3 text-right">적재 지연</th>
              <th className="py-2 pr-3 text-right">결측률</th><th className="py-2 text-right">상태</th>
            </tr>
          </thead>
          <tbody>
            {cfg.pipelines.map((p) => {
              const bad = p.missing > p.missingThreshold || p.status !== "정상";
              return (
                <tr key={p.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-2.5 pr-3 text-[13px] font-bold text-slate-800">{p.name}</td>
                  <td className="py-2.5 pr-3 text-[12px] font-medium text-slate-500">{p.source}</td>
                  <td className="py-2.5 pr-3 text-[12px] font-semibold text-slate-700 text-right tabular-nums">{p.rows}</td>
                  <td className="py-2.5 pr-3 text-[12px] font-semibold text-right tabular-nums text-slate-700">{p.latency}<span className="text-slate-400 font-medium"> / {p.latencyThreshold}</span></td>
                  <td className={cn("py-2.5 pr-3 text-[12px] font-black text-right tabular-nums", p.missing > p.missingThreshold ? "text-rose-600" : "text-slate-700")}>
                    {p.missing}%<span className="text-slate-400 font-medium"> / {p.missingThreshold}%</span>
                  </td>
                  <td className="py-2.5 text-right">
                    <span className={cn("px-2 py-0.5 rounded-lg text-[11px] font-black border",
                      bad ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200")}>{p.status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-4 sm:p-5">
        <div className="text-[14px] font-black text-slate-900 mb-3">품질 규칙 검증</div>
        <div className="space-y-2">
          {cfg.rules.map((r) => (
            <div key={r.id} className="rounded-xl border border-slate-200 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className={cn("px-2 py-0.5 rounded-lg text-[11px] font-black border",
                  r.result === "위반" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200")}>{r.result}</span>
                <span className="text-[13px] font-bold text-slate-800">{r.name}</span>
                <span className="text-[11px] font-semibold text-slate-400 ml-auto truncate">{r.target}</span>
              </div>
              <div className="text-[12px] font-medium text-slate-500 mt-1">{r.rule} — {r.detail}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 sm:p-5">
        <div className="text-[14px] font-black text-slate-900 mb-3">모델 성능·드리프트</div>
        <div className="space-y-2">
          {cfg.models.map((m) => {
            const drifting = m.drift >= m.driftThreshold * 0.8;
            return (
              <div key={m.id} className="rounded-xl border border-slate-200 px-3 py-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-bold text-slate-800">{m.name}</span>
                  <span className="text-[11px] font-semibold text-slate-400">{m.version}</span>
                  <span className={cn("ml-auto text-[12px] font-black tabular-nums", drifting ? "text-amber-600" : "text-emerald-600")}>
                    드리프트 +{m.drift}<span className="text-slate-400 font-medium"> / {m.driftThreshold}</span>
                  </span>
                </div>
                <div className="text-[12px] font-medium text-slate-500 mt-1">
                  {m.metric} {m.value} (목표 {m.target}) · 학습 {m.trained} · 재학습 {m.retrain}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  </div>
);

/* ── 패널 ─────────────────────────────────────────────── */
const TimeSeriesPanel = ({ domain, onNavigateAgent }) => {
  const cfg = domain?.timeSeries;
  const [view, setView] = useState("forecast");
  const color = domain?.brandColor || "#00539F";
  if (!cfg) return null;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/60">
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-5">
        <header className="mb-4">
          <h2 className="text-[20px] sm:text-[22px] font-black text-slate-900 tracking-tight">시계열 인텔리전스</h2>
          <p className="text-[13px] text-slate-500 font-medium mt-1">{cfg.intro}</p>
        </header>

        <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1" role="tablist" aria-label="시계열 분석 축">
          {VIEWS.map(({ id, label, Icon, desc }) => (
            <button key={id} role="tab" aria-selected={view === id} title={desc} onClick={() => setView(id)}
              className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold border whitespace-nowrap transition-all min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
                view === id ? "text-white border-transparent shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}
              style={view === id ? { backgroundColor: color } : undefined}>
              <Icon className="w-4 h-4" aria-hidden="true" />{label}
            </button>
          ))}
        </div>

        <div className="mt-3">
          {view === "forecast" && <ForecastView cfg={cfg.forecast} color={color} />}
          {view === "anomaly"  && <AnomalyView  cfg={cfg.anomaly}  color={color} />}
          {view === "health"   && <HealthView   cfg={cfg.health}   color={color} />}
          {view === "quality"  && <QualityView  cfg={cfg.quality} />}
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-200">
          <p className="text-[11px] text-slate-400 font-medium flex-1 min-w-[240px]">{cfg.sourceNote}</p>
          {onNavigateAgent && (
            <button onClick={() => onNavigateAgent("agent-dataanalysis")}
              className="px-3 py-2 rounded-xl text-[12px] font-bold text-white shadow-sm min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
              style={{ backgroundColor: color }}>
              시계열 분석 에이전트로 이어가기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeSeriesPanel;
