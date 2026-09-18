import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft, Workflow, Play, RotateCcw, CheckCircle2, Loader2,
  Paperclip, ChevronRight, ArrowDown, FileText, Sparkles, Download, UserCheck,
} from "lucide-react";
import { useAgentSimulation } from "../../hooks/useAgentSimulation.js";
import { cn, downloadTextFile, buildDocHtml } from "../../utils.jsx";
import { logAudit } from "../../auditLog.js";
import { registerOrder } from "../../workOrders.js";

/* 에이전트 강조색 — AgentHub COLOR_MAP과 동일 팔레트 (표시용 부분집합) */
const COLOR_MAP = {
  indigo: { bg: "bg-indigo-600",  light: "bg-indigo-50",  border: "border-indigo-200",  text: "text-indigo-700" },
  emerald:{ bg: "bg-emerald-600", light: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
  teal:   { bg: "bg-teal-600",    light: "bg-teal-50",    border: "border-teal-200",    text: "text-teal-700" },
  cyan:   { bg: "bg-cyan-600",    light: "bg-cyan-50",    border: "border-cyan-200",    text: "text-cyan-700" },
  rose:   { bg: "bg-rose-600",    light: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700" },
  violet: { bg: "bg-violet-600",  light: "bg-violet-50",  border: "border-violet-200",  text: "text-violet-700" },
  purple: { bg: "bg-purple-600",  light: "bg-purple-50",  border: "border-purple-200",  text: "text-purple-700" },
  blue:   { bg: "bg-blue-600",    light: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700" },
  orange: { bg: "bg-orange-500",  light: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-700" },
  amber:  { bg: "bg-amber-500",   light: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700" },
};

/* ================================================================== */
/* 복합 업무 오케스트레이션 시나리오 — 요청 1건이 에이전트 4개를 릴레이 */
/* 콘텐츠는 전부 도메인 팩 orchestration 필드에서 공급 (코어는 중립)    */
/* ================================================================== */
const OrchestrationScenario = ({ scenario, agents, user, onBack }) => {
  // 각 스테이지에 허브 카탈로그(도메인 오버라이드 반영)의 에이전트 정보를 결합
  const stages = scenario.stages.map(st => ({
    ...st,
    agent: agents.find(a => a.id === st.agentId),
  }));

  // 스테이지별 표시된 로그 줄 수 (실행 중 한 줄씩 나타남)
  const [logCount, setLogCount] = useState({});
  const [downloaded, setDownloaded] = useState(false);

  /* 완료 카드에 표시된 산출물을 워드 문서로 — 릴레이 경로와 지표를 함께 남긴다 */
  const handleDownloadReport = () => {
    const r = scenario.result;
    const body = [
      `문서번호: ${r.docNo}`,
      `요청: ${scenario.request}`,
      '',
      '[주요 내용]',
      ...r.summary.map(s => `· ${s}`),
      '',
      '[처리 지표]',
      ...r.metrics.map(m => `· ${m.label}: ${m.value}`),
      '',
      '[릴레이 경로]',
      ...stages.map((st, i) => `${i + 1}. ${st.agent?.name || st.agentId} — ${st.task}`),
      '',
      '※ 본 문서는 시뮬레이션 데모에서 생성된 예시입니다.',
    ].join('\n');
    downloadTextFile(`${r.docNo}.doc`, buildDocHtml(r.docTitle, body), 'application/msword;charset=utf-8');
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };
  const stageRefs = useRef([]);
  const bottomRef = useRef(null);

  const sim = useAgentSimulation(stages, {
    onStepStart: (i, prevDelay, st) => {
      const n = st.logs.length;
      st.logs.forEach((_, li) => {
        setTimeout(() => {
          setLogCount(p => ({ ...p, [i]: Math.max(p[i] || 0, li + 1) }));
        }, prevDelay + ((li + 1) / (n + 1)) * st.ms);
      });
    },
    completeDelay: 900,
  });
  const { step, agentIdx, doneIdx } = sim;
  const running = step === 2;
  const finished = step === 3;

  // 감사 추적 — 완주 1회당 1건 (스테이지·HITL 지점·산출 문서번호 포함)
  const auditRef = useRef(false);
  useEffect(() => {
    if (finished && !auditRef.current) {
      auditRef.current = true;
      logAudit({
        type: "orch_complete", summary: scenario.title,
        stages: stages.map(s => s.agent?.shortName || s.agentId),
        hitl: stages.filter(s => s.review).map(s => `${s.agent?.shortName || s.agentId}: ${s.review.slice(0, 40)}`),
        docNo: scenario.result?.docNo || null,
      });
      /* 문서를 발행했으면 작업지시로 등록해 조치·검증까지 추적한다.
         (문서 생성에서 끝나면 "그래서 처리됐나?"에 답할 수 없다)
         registerOrder는 같은 문서번호를 중복 등록하지 않는다. */
      if (scenario.result?.docNo) {
        registerOrder({
          docNo: scenario.result.docNo,
          title: scenario.title,
          source: "자동화 시나리오",
          owner: scenario.result?.owner || "",
          due: scenario.result?.due || "",
        });
      }
    }
  }, [finished]);

  const handleStart = () => { setLogCount({}); auditRef.current = false; sim.start(); };

  // 진행에 따라 활성 스테이지·결과로 자동 스크롤
  useEffect(() => {
    if (agentIdx >= 0) stageRefs.current[agentIdx]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [agentIdx]);
  useEffect(() => {
    if (finished) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 150);
  }, [finished]);

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-slate-100 custom-scrollbar">
      <div className="max-w-3xl mx-auto px-8 py-6">

        {/* ── 헤더 ─────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={onBack} aria-label="허브로 돌아가기"
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors shadow-sm shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm shrink-0">
            <Workflow className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] font-bold text-slate-900 tracking-tight truncate">{scenario.title}</h2>
              <span className="text-[9px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-semibold shrink-0">오케스트레이션</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate">요청 1건 → 에이전트 {stages.length}개 자동 릴레이</p>
          </div>
          <div className={cn("flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0",
            finished ? "bg-emerald-100 text-emerald-700" : running ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700")}>
            {running && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />}
            {finished && <CheckCircle2 className="w-3 h-3" />}
            {finished ? "완료" : running ? "실행 중" : "대기"}
          </div>
        </div>

        {/* ── 요청 카드 ────────────────────────────────────── */}
        <div className="rounded-2xl border-2 border-slate-200 bg-white shadow-sm overflow-hidden mb-4">
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">사용자 요청 1건</span>
            <span className="ml-auto text-[10px] font-bold text-slate-400">{user.name} {user.title} · {user.dept}</span>
          </div>
          <div className="px-4 py-3.5">
            <p className="text-[13px] text-slate-700 font-medium leading-relaxed">&ldquo;{scenario.request}&rdquo;</p>
            {/* attachment는 선택 필드 — 알람·이벤트 트리거형 시나리오는 첨부 없이 시작 */}
            {scenario.attachment && (
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                <Paperclip className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="text-[11px] font-bold text-slate-600">{scenario.attachment.name}</span>
                <span className="text-[10px] text-slate-400 font-medium">{scenario.attachment.pages}면 · {scenario.attachment.size}</span>
              </div>
            )}
          </div>

          {/* 릴레이 미리보기 + 실행 버튼 */}
          {step === 1 && (
            <div className="px-4 pb-4">
              <div className="flex items-center gap-1 flex-wrap mb-3.5 rounded-xl border border-indigo-100 bg-indigo-50/50 px-3 py-2.5">
                {stages.map((st, i) => {
                  const c = COLOR_MAP[st.agent?.color] || COLOR_MAP.indigo;
                  const AgIcon = st.agent?.icon;
                  return (
                    <React.Fragment key={st.agentId}>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className={cn("w-5 h-5 rounded-md flex items-center justify-center", c.bg)}>
                          {AgIcon && <AgIcon className="w-3 h-3 text-white" />}
                        </div>
                        <span className={cn("text-[10px] font-black", c.text)}>{st.agent?.shortName}</span>
                      </div>
                      {i < stages.length - 1 && <ChevronRight className="w-3 h-3 text-indigo-300 shrink-0" />}
                    </React.Fragment>
                  );
                })}
                <span className="ml-auto text-[9px] font-bold text-indigo-400 shrink-0">중간 산출물이 다음 에이전트로 자동 전달됩니다</span>
              </div>
              <button onClick={handleStart}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white text-[13px] font-semibold shadow-sm hover:bg-indigo-700 transition-colors">
                <Play className="w-4 h-4" />
                자동화 실행 — 에이전트 {stages.length}개 릴레이 시작
              </button>
            </div>
          )}
        </div>

        {/* ── 릴레이 타임라인 ──────────────────────────────── */}
        {step >= 2 && (
          <div className="flex flex-col">
            {stages.map((st, i) => {
              const c = COLOR_MAP[st.agent?.color] || COLOR_MAP.indigo;
              const AgIcon = st.agent?.icon;
              const isActive = agentIdx === i;
              const isDone = doneIdx.includes(i);
              const visibleLogs = st.logs.slice(0, logCount[i] || 0);
              return (
                <div key={st.agentId} ref={el => (stageRefs.current[i] = el)}>
                  {/* 스테이지 카드 */}
                  <div className={cn("rounded-2xl border-2 bg-white shadow-sm transition-all duration-300 overflow-hidden",
                    isActive ? cn(c.border, "shadow-lg") : isDone ? "border-emerald-200" : "border-slate-200 opacity-70")}>
                    <div className={cn("px-4 py-3 flex items-center gap-3", isActive && c.light, isDone && "bg-emerald-50/40")}>
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all",
                        isActive || isDone ? cn(c.bg, "text-white shadow-sm") : "bg-slate-100 text-slate-400")}>
                        {AgIcon && <AgIcon className="w-4.5 h-4.5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-[8px] font-black uppercase tracking-widest",
                            isActive ? c.text : isDone ? "text-emerald-500" : "text-slate-300")}>
                            Relay {i + 1}/{stages.length}
                          </span>
                          <span className="text-[13px] font-black text-slate-800 truncate">{st.agent?.shortName}</span>
                          <span className="text-[10px] text-slate-400 font-medium truncate">{st.agent?.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{st.task}</p>
                      </div>
                      {isActive && <Loader2 className={cn("w-4 h-4 animate-spin shrink-0", c.text)} />}
                      {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                    </div>

                    {/* 실행 로그 (한 줄씩 등장) */}
                    {visibleLogs.length > 0 && (
                      <div className="mx-4 mb-3 rounded-xl bg-slate-900 px-3 py-2 space-y-1">
                        {visibleLogs.map((line, li) => (
                          <div key={li} className="flex items-start gap-1.5 text-[9.5px] font-mono leading-relaxed">
                            <span className={cn("shrink-0 mt-px", isDone || li < visibleLogs.length - 1 || !isActive ? "text-emerald-400" : "text-indigo-400")}>
                              {isDone || li < visibleLogs.length - 1 || !isActive ? "✓" : "▸"}
                            </span>
                            <span className="text-slate-300">{line}</span>
                          </div>
                        ))}
                        {isActive && visibleLogs.length < st.logs.length && (
                          <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-slate-500">
                            <span className="animate-pulse">▸ 처리 중…</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 완료 산출물 */}
                    {isDone && (
                      <div className={cn("mx-4 mb-3.5 rounded-xl border px-3 py-2.5", c.border, c.light)}>
                        <div className={cn("text-[9px] font-black uppercase tracking-widest mb-1.5", c.text)}>{st.output.label}</div>
                        <div className="space-y-1">
                          {st.output.items.map((it, oi) => (
                            <div key={oi} className="flex items-start gap-1.5">
                              <CheckCircle2 className={cn("w-3 h-3 mt-0.5 shrink-0", c.text)} />
                              <span className="text-[11px] text-slate-600 font-medium leading-snug">{it}</span>
                            </div>
                          ))}
                        </div>
                        {/* XAI — 판정 기여도 (팩 output.factors 공급 시에만 노출) */}
                        {st.output.factors?.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-white/60">
                            <div className={cn("text-[9px] font-black uppercase tracking-widest mb-1.5", c.text)}>판정 기여도</div>
                            <div className="space-y-1">
                              {st.output.factors.map((f, fi) => (
                                <div key={fi} className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-slate-600 w-36 truncate shrink-0">{f.label}</span>
                                  <span className="flex-1 h-1.5 rounded-full bg-white/70 overflow-hidden">
                                    <span className={cn("block h-full rounded-full", c.bg)} style={{ width: `${f.pct}%` }} />
                                  </span>
                                  <span className="text-[10px] font-black font-mono tabular-nums text-slate-500 w-8 text-right shrink-0">{f.pct}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {/* XAI — 사람 확인 지점 (팩 stage.review 공급 시에만 노출) */}
                    {isDone && st.review && (
                      <div className="mx-4 mb-3.5 flex items-start gap-1.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200">
                        <UserCheck className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-px" />
                        <span className="text-[11px] font-bold text-amber-700 leading-snug">사람 확인 지점 — {st.review}</span>
                      </div>
                    )}
                  </div>

                  {/* 핸드오프 커넥터 */}
                  {i < stages.length - 1 && (
                    <div className="flex items-center gap-2 py-1.5 pl-8">
                      <ArrowDown className={cn("w-3.5 h-3.5 shrink-0 transition-colors", isDone ? "text-indigo-400" : "text-slate-200")} />
                      <span className={cn("text-[10px] font-bold transition-colors", isDone ? "text-indigo-500" : "text-slate-300")}>
                        {st.handoff}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── 최종 결과 ────────────────────────────────────── */}
        {finished && (
          <div className="mt-4">
            <div className="rounded-2xl overflow-hidden border border-emerald-200 shadow-sm bg-white">
              <div className="bg-emerald-600 px-4 py-3 flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-100 shrink-0" />
                <span className="text-[13px] font-bold text-white">오케스트레이션 완료 — 최종 산출물</span>
                <span className="ml-auto text-[9px] px-2 py-0.5 bg-white/15 text-emerald-50 rounded-full font-semibold">
                  에이전트 {stages.length}개 릴레이
                </span>
              </div>
              <div className="px-4 py-4">
                <div className="flex items-start gap-3 mb-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono font-bold text-slate-400">{scenario.result.docNo}</div>
                    <div className="text-[15px] font-black text-slate-800 leading-tight">{scenario.result.docTitle}</div>
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-3 space-y-1.5 mb-3.5">
                  {scenario.result.summary.map((line, si) => (
                    <div key={si} className="flex items-start gap-2">
                      <span className="text-[10px] font-black text-emerald-500 mt-0.5 shrink-0">{si + 1}.</span>
                      <span className="text-[12px] text-slate-700 font-medium leading-snug">{line}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {scenario.result.metrics.map(m => (
                    <div key={m.label} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-center">
                      <div className="text-[15px] font-black text-slate-800 leading-none">{m.value}</div>
                      <div className="text-[9px] text-slate-400 font-bold mt-1">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-4 py-3 border-t border-slate-100 flex items-center gap-2">
                <button onClick={handleDownloadReport}
                  className={cn('flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-[11px] font-black transition-colors',
                    downloaded ? 'bg-slate-700 hover:bg-slate-800' : 'bg-emerald-600 hover:bg-emerald-700')}>
                  <Download className="w-3.5 h-3.5" /> {downloaded ? '내려받음' : '보고서 내려받기'}
                </button>
                <button onClick={handleStart}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-[11px] font-black hover:bg-slate-50 transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" /> 다시 실행
                </button>
                <button onClick={onBack}
                  className="ml-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-[11px] font-black hover:bg-slate-50 transition-colors">
                  허브로 돌아가기
                </button>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default OrchestrationScenario;
