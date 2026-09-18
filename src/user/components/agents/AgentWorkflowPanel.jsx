import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  GitBranch, Database, Shield, ScanLine, MapPin,
  Mic, Brain, Network, CheckCircle2, Zap,
  Globe, Server, Box, Loader2, Activity, Wifi,
} from "lucide-react";
import { AGENT_TEAMS, MCP_TOOLS } from "../../data/constants.js";
import { cn } from "../../utils.jsx";


const TYPE_STYLE = {
  "벡터 DB":   { icon: Database, color: "text-indigo-600", bg: "bg-indigo-100", border: "border-indigo-200", dot: "bg-indigo-400" },
  "보안 모듈": { icon: Shield,   color: "text-red-600",    bg: "bg-red-100",    border: "border-red-200",    dot: "bg-red-400" },
  "OCR 모듈":  { icon: ScanLine, color: "text-teal-600",   bg: "bg-teal-100",   border: "border-teal-200",   dot: "bg-teal-400" },
  "기준정보 DB": { icon: MapPin, color: "text-rose-600",   bg: "bg-rose-100",   border: "border-rose-200",   dot: "bg-rose-400" },
  "관계형 DB": { icon: Database, color: "text-cyan-600",   bg: "bg-cyan-100",   border: "border-cyan-200",   dot: "bg-cyan-400" },
  "STT 모듈":  { icon: Mic,      color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-200", dot: "bg-purple-400" },
  "sLLM 엔진": { icon: Brain,    color: "text-blue-600",   bg: "bg-blue-100",   border: "border-blue-200",   dot: "bg-blue-400" },
  "지도 API":  { icon: Globe,    color: "text-emerald-600",bg: "bg-emerald-100",border: "border-emerald-200",dot: "bg-emerald-400" },
};

const TOOL_ALIAS = {
  "Whisper-v3":         "Whisper_STT_엔진",
  "GPT-OSS 120B":       "GPT-OSS_120B_sLLM",
  "Llama-3-Korean 70B": "Llama-3-Korean_70B",
  "EXAONE 3.0 78B":     "EXAONE-3_78B_sLLM",
  "기준정보_엔진":       "기준정보_매칭_엔진",
  "내장 DB 엔진":        "업무_정형DB",
};

const NO_MCP = new Set(["해당 없음", "내장 알고리즘"]);
const EMPTY_WORKFLOW = [];

function findMcp(toolName) {
  if (!toolName || NO_MCP.has(toolName)) return null;
  const key = TOOL_ALIAS[toolName] || toolName;
  return MCP_TOOLS.find(t => t.name === key) || null;
}

function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function rndF(min, max, d = 2) { return (Math.random() * (max - min) + min).toFixed(d); }
function nowStr() { return new Date().toLocaleTimeString("ko-KR", { hour12: false }); }

/** MCP 타입별 실감 있는 요청/응답 로그 생성 */
function buildMcpCallLogs(mcp, step) {
  const ep = mcp.endpoint || "grpc://10.10.1.x:7000";
  const lat = mcp.latency || 50;
  const actualLat = rnd(Math.floor(lat * 0.85), Math.floor(lat * 1.2));

  switch (mcp.type) {
    case "벡터 DB": {
      const chunks = rnd(4, 9);
      const score  = rndF(0.847, 0.962, 3);
      const qLen   = rnd(1400, 3200);
      return [
        { msg: `→ POST ${ep}/vectors/search`, detail: `query: ${qLen} chars | top_k: 10 | threshold: 0.80`, type: "mcp-req" },
        { msg: `← 200 OK  ${actualLat}ms`, detail: `chunks: ${chunks}개 반환 | 최고유사도 ${score} | 컬렉션: krea_regulations_v3`, type: "mcp-res" },
      ];
    }
    case "sLLM 엔진": {
      const inTok  = rnd(1800, 4200);
      const outTok = rnd(380, 820);
      const secs   = rndF(lat / 1000 * 0.85, lat / 1000 * 1.25, 2);
      const tps    = (outTok / parseFloat(secs)).toFixed(0);
      return [
        { msg: `→ POST ${ep}/v1/generate`, detail: `model: ${mcp.name.replace(/_/g," ")} | input: ${inTok.toLocaleString()} tok | temperature: 0.3 | stream: true`, type: "mcp-req" },
        { msg: `← stream_done  ${secs}s`, detail: `output: ${outTok} tok | ${tps} tok/s | finish_reason: stop | ctx_used: ${(inTok+outTok).toLocaleString()} tok`, type: "mcp-res" },
      ];
    }
    case "STT 모듈": {
      const wer      = rndF(2.8, 6.4, 1);
      const speakers = rnd(3, 5);
      const mins     = rnd(8, 18);
      const secs2    = rnd(10, 59).toString().padStart(2, "0");
      return [
        { msg: `→ POST ${ep}/v1/transcribe`, detail: `format: wav | sample_rate: 16000 | diarize: true | lang: ko`, type: "mcp-req" },
        { msg: `← 200 OK  ${actualLat}ms`, detail: `duration: 00:${mins}:${secs2} | WER: ${wer}% | 화자: ${speakers}명 감지 | 신뢰도: ${rndF(91,98,1)}%`, type: "mcp-res" },
      ];
    }
    case "OCR 모듈": {
      const chars = rnd(800, 2400);
      const pages = rnd(1, 4);
      const tables = rnd(0, 3);
      return [
        { msg: `→ POST ${ep}/v1/ocr`, detail: `pages: ${pages} | dpi: 300 | table_extract: true | lang: kor`, type: "mcp-req" },
        { msg: `← 200 OK  ${actualLat}ms`, detail: `chars: ${chars.toLocaleString()} | tables: ${tables}개 | conf_avg: ${rndF(93,98,1)}% | engine: Vision-OCR-v2`, type: "mcp-res" },
      ];
    }
    case "보안 모듈": {
      const fileKb = rnd(420, 3800);
      return [
        { msg: `→ POST ${ep}/v1/drm/decrypt`, detail: `policy: SSO-EAM | user: kim.minjun | file_size: ${fileKb}KB`, type: "mcp-req" },
        { msg: `← 200 OK  ${actualLat}ms`, detail: `status: DECRYPTED | drm_type: CreativeUC | audit_id: DRM-${rnd(10000,99999)}`, type: "mcp-res" },
      ];
    }
    case "기준정보 DB": {
      const matchScore = rndF(0.94, 1.0, 2);
      return [
        { msg: `→ POST ${ep}/v1/master/search`, detail: `query: "${step.prompt.slice(0,20)}..." | limit: 5 | fuzzy: true`, type: "mcp-req" },
        { msg: `← 200 OK  ${actualLat}ms`, detail: `matches: 1건 | score: ${matchScore} | 표준코드: STD-${rnd(10000,99999)} | 출처: 표준_기준정보_사전`, type: "mcp-res" },
      ];
    }
    case "관계형 DB": {
      const rows = rnd(12, 280);
      return [
        { msg: `→ QUERY ${ep}/업무_정형DB`, detail: `SELECT * FROM std_master WHERE ... | params: 2 | pool: primary`, type: "mcp-req" },
        { msg: `← OK  ${actualLat}ms`, detail: `rows: ${rows}건 | scan: index | cache: HIT | query_id: Q-${rnd(1000,9999)}`, type: "mcp-res" },
      ];
    }
    case "지도 API": {
      const lat2 = rndF(36.2, 37.9, 4);
      const lng  = rndF(126.6, 129.1, 4);
      return [
        { msg: `→ GET ${ep}/geocode`, detail: `addr=표준화주소&format=json&crs=EPSG:4326`, type: "mcp-req" },
        { msg: `← 200 OK  ${actualLat}ms`, detail: `lat: ${lat2} | lng: ${lng} | adm_code: ${rnd(1100000000,4600000000)} | precision: rooftop`, type: "mcp-res" },
      ];
    }
    default:
      return [{ msg: `→ CALL ${ep}`, detail: mcp.name.replace(/_/g," "), type: "mcp-req" }];
  }
}

const AgentWorkflowPanel = ({ agentId, activeStep = -1, doneSteps = [], title = "멀티 에이전트 파이프라인" }) => {
  const agent = useMemo(() => AGENT_TEAMS.find(a => a.id === agentId) || null, [agentId]);
  const [logs, setLogs] = useState([]);
  const [ping, setPing]  = useState({});   // tool.id → latency
  const logRef = useRef(null);
  const wf = agent?.workflow || EMPTY_WORKFLOW;
  const doneStepKey = doneSteps.join(",");
  const usedMcp = useMemo(() => [...new Map(
    wf.map(s => findMcp(s.tool)).filter(Boolean).map(t => [t.id, t])
  ).values()], [wf]);

  /* ── 로그 생성: 스텝 변경 시 ──────────────────── */
  useEffect(() => {
    if (activeStep < 0 || activeStep >= wf.length) return undefined;
    const step = wf[activeStep];
    const t = nowStr();
    const timers = [];

    // 1) AGENT 시작 로그
    const startTimer = setTimeout(() => {
      setLogs(prev => [...prev.slice(-49),
        { time: t, src: "AGENT", msg: `[${step.role}] ${step.name}`, detail: step.prompt.slice(0, 60) + "…", type: "agent" },
      ]);
    }, 0);
    timers.push(startTimer);

    // 2) MCP 요청/응답 로그 (딜레이)
    const mcp = findMcp(step.tool);
    if (mcp) {
      const callLogs = buildMcpCallLogs(mcp, step);
      callLogs.forEach((entry, idx) => {
        const timer = setTimeout(() => {
          setLogs(prev => [...prev.slice(-49),
            { time: nowStr(), src: mcp.type, msg: entry.msg, detail: entry.detail, type: entry.type },
          ]);
        }, 420 + idx * 380);
        timers.push(timer);
      });
    }
    return () => timers.forEach(clearTimeout);
  }, [activeStep, wf]);

  /* ── 완료 시 DONE 로그 ────────────────────────── */
  useEffect(() => {
    if (!doneStepKey) return undefined;
    const lastDone = Number(doneStepKey.split(",").at(-1));
    if (lastDone < 0 || lastDone >= wf.length) return undefined;
    const step = wf[lastDone];
    const timer = setTimeout(() => {
      setLogs(prev => [...prev.slice(-49),
        { time: nowStr(), src: "DONE", msg: `✓ ${step.name} 완료`, detail: `step ${lastDone + 1}/${wf.length}`, type: "done" },
      ]);
    }, 900);
    return () => clearTimeout(timer);
  }, [doneStepKey, wf]);

  /* ── MCP 헬스 ping 시뮬레이션 ─────────────────── */
  useEffect(() => {
    if (usedMcp.length === 0) return undefined;
    const refresh = () => {
      const next = {};
      usedMcp.forEach(t => {
        next[t.id] = rnd(Math.floor((t.latency||30)*0.8), Math.floor((t.latency||30)*1.3));
      });
      setPing(next);
    };
    const startupId = setTimeout(refresh, 0);
    const id = setInterval(refresh, 4000);
    return () => {
      clearTimeout(startupId);
      clearInterval(id);
    };
  }, [usedMcp]);

  /* ── 스크롤 ──────────────────────────────────── */
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [logs]);

  if (!agent) return null;

  const isDoneAll = doneSteps.length >= wf.length && wf.length > 0;
  const isRunning = activeStep >= 0 && activeStep < wf.length;
  const statusLabel = isDoneAll ? "완료" : isRunning ? "실행 중" : "대기";
  const statusCls = isDoneAll
    ? "bg-slate-100 text-slate-500"
    : isRunning
    ? "bg-emerald-100 text-emerald-700"
    : "bg-amber-100 text-amber-700";

  return (
    <div className="flex flex-col gap-3 h-full">

      {/* ── Header ─────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
          <Network className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-[12px] font-black text-slate-700 tracking-tight">{title}</span>
        <div className={cn("ml-auto flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0", statusCls)}>
          {isRunning && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
          {statusLabel}
        </div>
      </div>

      {/* ── Orchestrator card ──────────────────────── */}
      <div className="rounded-xl overflow-hidden border border-indigo-200 shadow-sm shrink-0">
        <div className="bg-indigo-600 px-3 py-1 flex items-center gap-1.5">
          <GitBranch className="w-2.5 h-2.5 text-indigo-300" />
          <span className="text-[8px] font-black uppercase tracking-widest text-indigo-200">오케스트레이터</span>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-slate-50 px-3 py-2.5 flex items-center gap-2.5">
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-black text-indigo-900 truncate">{agent.shortName}</div>
            <div className="text-[9px] text-indigo-400 font-medium truncate mt-0.5">{agent.name}</div>
          </div>
          <div className="flex flex-wrap gap-1 justify-end shrink-0">
            {(agent.tech || []).slice(0, 2).map(t => (
              <span key={t} className="text-[8px] px-1.5 py-0.5 bg-indigo-100 border border-indigo-200 text-indigo-700 rounded font-black">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sub-agent pipeline ─────────────────────── */}
      <div className="flex flex-col shrink-0">
        {wf.map((step, i) => {
          const isActive = activeStep === i;
          const isDone   = doneSteps.includes(i);
          const mcp      = findMcp(step.tool);
          const mStyle   = mcp ? (TYPE_STYLE[mcp.type] || {}) : null;
          const McpIcon  = mStyle?.icon || Server;

          return (
            <div key={i}>
              {/* Connector */}
              <div className="pl-[14px]">
                <div className={cn(
                  "w-px h-3 transition-colors duration-500",
                  isDone || isActive ? "bg-indigo-300" : "bg-slate-200"
                )} />
              </div>

              <div className="flex items-stretch gap-2">
                {/* Step node */}
                <div className={cn(
                  "flex-1 min-w-0 rounded-xl border-2 transition-all duration-300",
                  isActive
                    ? "border-indigo-300 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-lg shadow-indigo-100/60"
                    : isDone
                    ? "border-emerald-200 bg-emerald-50/40"
                    : "border-slate-200 bg-white/60"
                )}>
                  <div className="px-2.5 py-2">
                    <div className="flex items-center gap-1.5">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-black transition-all duration-300",
                        isActive
                          ? "bg-indigo-500 text-white shadow-md shadow-indigo-300"
                          : isDone
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-200 text-slate-400"
                      )}>
                        {isDone && !isActive ? "✓" : i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={cn(
                          "text-[8px] font-black uppercase tracking-widest",
                          isActive ? "text-indigo-400" : isDone ? "text-emerald-400" : "text-slate-300"
                        )}>
                          Step {i + 1} · {step.role}
                        </div>
                        <div className="text-[11px] font-black text-slate-700 truncate leading-tight">
                          {step.name}
                        </div>
                      </div>
                      {isActive && <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin shrink-0" />}
                      {isDone && !isActive && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </div>

                    {isActive && (
                      <p className="mt-2 ml-6 text-[9px] text-slate-400 leading-relaxed line-clamp-2 border-l-2 border-indigo-200 pl-2">
                        {step.prompt}
                      </p>
                    )}
                  </div>
                </div>

                {/* MCP call badge */}
                {mcp && (
                  <div className="flex flex-col items-center gap-0.5 pt-1.5 shrink-0 w-[72px]">
                    <div className="text-[7px] text-slate-300 font-black tracking-widest">MCP CALL</div>
                    <div className={cn(
                      "w-full flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-lg border text-[8px] font-bold transition-all duration-300 text-center",
                      isActive
                        ? cn(mStyle?.bg || "bg-blue-50", mStyle?.border || "border-blue-200", mStyle?.color || "text-blue-600", "shadow-md")
                        : isDone
                        ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                        : "bg-slate-50 border-slate-200 text-slate-300"
                    )}>
                      <McpIcon className="w-3 h-3 shrink-0 mb-0.5" />
                      <span className="leading-snug break-words text-[7px]">{mcp.name.replace(/_/g," ").slice(0,14)}</span>
                      {/* latency badge */}
                      {(isActive || isDone) && (
                        <span className={cn(
                          "text-[7px] font-black mt-0.5 px-1 rounded",
                          isActive ? "bg-white/60 text-slate-500" : "bg-emerald-100 text-emerald-600"
                        )}>
                          {ping[mcp.id] ?? mcp.latency}ms
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Connected MCP tools ─────────────────────── */}
      {usedMcp.length > 0 && (
        <div className="border-t border-slate-100 pt-3 shrink-0">
          <div className="flex items-center gap-1.5 mb-2">
            <Wifi className="w-3 h-3 text-slate-400" />
            <span className="text-[11px] font-black text-slate-600">MCP 연결 현황</span>
            <span className="ml-auto text-[9px] font-black text-white bg-emerald-400 px-1.5 py-0.5 rounded-full">
              {usedMcp.length} connected
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {usedMcp.map(tool => {
              const style   = TYPE_STYLE[tool.type] || {};
              const TIcon   = style.icon || Box;
              const curPing = ping[tool.id] ?? tool.latency ?? "–";
              const ep      = tool.endpoint || "–";
              return (
                <div key={tool.id} className={cn(
                  "flex items-center gap-2 px-2.5 py-1.5 rounded-xl border",
                  style.bg || "bg-white",
                  style.border || "border-slate-200"
                )}>
                  <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center shrink-0", style.bg || "bg-slate-100")}>
                    <TIcon className={cn("w-3 h-3", style.color || "text-slate-500")} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={cn("text-[9px] font-black truncate", style.color || "text-slate-700")}>
                      {tool.name.replace(/_/g," ")}
                    </div>
                    <div className="text-[8px] text-slate-400 font-mono truncate">{ep}</div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <div className="flex items-center gap-1">
                      <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", style.dot || "bg-emerald-400")} />
                      <span className={cn("text-[8px] font-black", style.color || "text-emerald-600")}>{curPing}ms</span>
                    </div>
                    <span className="text-[7px] text-slate-300 font-mono">ping</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Live execution log ──────────────────────── */}
      <div className="flex-1 border-t border-slate-100 pt-3 flex flex-col min-h-0">
        <div className="flex items-center gap-1.5 mb-2 shrink-0">
          <Activity className="w-3 h-3 text-slate-400" />
          <span className="text-[11px] font-black text-slate-600">실행 로그</span>
          {logs.length > 0 && (
            <span className="ml-auto text-[9px] text-slate-400 font-mono">{logs.length} entries</span>
          )}
        </div>
        <div
          ref={logRef}
          className="flex-1 overflow-y-auto custom-scrollbar max-h-48 rounded-xl bg-slate-900 px-3 py-2.5 space-y-1"
        >
          {logs.length === 0 ? (
            <div className="text-[9px] text-slate-600 italic font-mono py-0.5">대기 중… 에이전트 실행을 시작하세요.</div>
          ) : logs.map((log, i) => (
            <div key={i} className={cn(
              "rounded px-1.5 py-0.5",
              log.type === "mcp-req"  ? "bg-blue-900/30" :
              log.type === "mcp-res"  ? "bg-blue-900/20" :
              log.type === "done"     ? "bg-emerald-900/30" :
              log.type === "agent"    ? "bg-indigo-900/30" : ""
            )}>
              <div className="flex items-center gap-1.5 text-[8.5px] font-mono">
                <span className="text-slate-600 shrink-0 tabular-nums">{log.time}</span>
                <span className={cn(
                  "font-black shrink-0 px-1 py-px rounded text-[7.5px] leading-none uppercase tracking-wide",
                  log.type === "mcp-req"  ? "bg-blue-700/60 text-blue-300" :
                  log.type === "mcp-res"  ? "bg-cyan-800/60 text-cyan-300" :
                  log.type === "done"     ? "bg-emerald-800/60 text-emerald-300" :
                  log.type === "agent"    ? "bg-indigo-800/60 text-indigo-300" :
                                            "bg-slate-700 text-slate-400"
                )}>
                  {log.type === "mcp-req" ? "REQ" : log.type === "mcp-res" ? "RES" : log.type === "done" ? "✓" : "AGENT"}
                </span>
                <span className={cn(
                  "truncate",
                  log.type === "mcp-req" ? "text-blue-300" :
                  log.type === "mcp-res" ? "text-cyan-300" :
                  log.type === "done"    ? "text-emerald-300" :
                  "text-indigo-300"
                )}>{log.msg}</span>
              </div>
              {log.detail && (
                <div className="ml-[4.5rem] text-[8px] text-slate-500 font-mono mt-0.5 truncate">{log.detail}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentWorkflowPanel;
