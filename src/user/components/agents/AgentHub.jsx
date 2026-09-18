import React, { useState } from "react";
import {
  MessageCircle, FileText, ClipboardList,
  BookOpen, ScanLine, Database, MapPin, AlignLeft, Search, BarChart2,
  Bot, Zap, ChevronRight, CheckCircle2, Network, Cpu,
  Star, Clock, TrendingUp, Workflow, Play
} from "lucide-react";
import { AGENT_TEAMS, MCP_TOOLS } from "../../data/constants.js";
import { cn, orchList } from "../../utils.jsx";


const COLOR_MAP = {
  indigo: { bg: "bg-indigo-600",   light: "bg-indigo-50",  border: "border-indigo-200",  text: "text-indigo-700",  hover: "hover:border-indigo-400 hover:bg-indigo-50/60",  bar: "bg-indigo-600", tag: "bg-indigo-100 text-indigo-700" },
  violet: { bg: "bg-violet-600",   light: "bg-violet-50",  border: "border-violet-200",  text: "text-violet-700",  hover: "hover:border-violet-400 hover:bg-violet-50/60",  bar: "bg-violet-600", tag: "bg-violet-100 text-violet-700" },
  emerald:{ bg: "bg-emerald-600",  light: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", hover: "hover:border-emerald-400 hover:bg-emerald-50/60", bar: "bg-emerald-600",tag: "bg-emerald-100 text-emerald-700"},
  purple: { bg: "bg-purple-600",   light: "bg-purple-50",  border: "border-purple-200",  text: "text-purple-700",  hover: "hover:border-purple-400 hover:bg-purple-50/60",  bar: "bg-purple-600", tag: "bg-purple-100 text-purple-700" },
  orange: { bg: "bg-orange-500",   light: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-700",  hover: "hover:border-orange-400 hover:bg-orange-50/60",  bar: "bg-orange-500", tag: "bg-orange-100 text-orange-700" },
  blue:   { bg: "bg-blue-600",     light: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700",    hover: "hover:border-blue-400 hover:bg-blue-50/60",        bar: "bg-blue-600",   tag: "bg-blue-100 text-blue-700"   },
  teal:   { bg: "bg-teal-600",     light: "bg-teal-50",    border: "border-teal-200",    text: "text-teal-700",    hover: "hover:border-teal-400 hover:bg-teal-50/60",        bar: "bg-teal-600",   tag: "bg-teal-100 text-teal-700"   },
  cyan:   { bg: "bg-cyan-600",     light: "bg-cyan-50",    border: "border-cyan-200",    text: "text-cyan-700",    hover: "hover:border-cyan-400 hover:bg-cyan-50/60",        bar: "bg-cyan-600",   tag: "bg-cyan-100 text-cyan-700"   },
  rose:   { bg: "bg-rose-600",     light: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    hover: "hover:border-rose-400 hover:bg-rose-50/60",        bar: "bg-rose-600",   tag: "bg-rose-100 text-rose-700"   },
  amber:  { bg: "bg-amber-500",    light: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   hover: "hover:border-amber-400 hover:bg-amber-50/60",      bar: "bg-amber-500",  tag: "bg-amber-100 text-amber-700" },
};

const USAGE_COUNTS = {
  'agent-chatbot':21,'agent-report':7,'agent-meeting':6,
  'agent-internalreg':8,'agent-ocr':11,'agent-knowledge':5,
  'agent-dbquery':12,'agent-address':4,'agent-dataanalysis':3,'agent-summary':9,
  'agent-translate':5,'agent-review':7,'agent-safety':4,
};

const AgentHub = ({ onLaunch, agents = AGENT_TEAMS, orgName = "한국도로공사", orchestration = null }) => {
  const orchScenarios = orchList(orchestration);
  const [search, setSearch] = useState("");
  const [hovered, setHovered] = useState(null);
  const [recentIds, setRecentIds] = useState(['agent-dbquery','agent-chatbot','agent-ocr']);
  const [favorites, setFavorites] = useState(new Set(['agent-dbquery','agent-chatbot']));
  const [favFilter, setFavFilter] = useState(false);

  const toggleFavorite = (id) => setFavorites(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const handleLaunch = (id) => {
    setRecentIds(prev => [id, ...prev.filter(x => x !== id)].slice(0, 5));
    onLaunch(id);
  };

  const filtered = agents.filter(ag => {
    if (favFilter && !favorites.has(ag.id)) return false;
    return !search || ag.name.includes(search) || ag.shortName.includes(search) ||
      (ag.tech || []).some(t => t.includes(search));
  });

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-100 px-8 py-8 custom-scrollbar">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-start justify-between gap-y-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-[22px] font-black text-slate-900 tracking-tight">AI 에이전트 허브</h2>
                <p className="text-[12px] text-slate-500 font-medium">{orgName} 생성형 AI 플랫폼 — 멀티 에이전트 서비스</p>
              </div>
            </div>
          </div>
          {/* Stats */}
          <div className="flex items-center gap-5 shrink-0">
            {[
              { label: "에이전트", value: String(agents.length), color: "text-indigo-600", icon: Cpu },
              { label: "가동 중", value: String(agents.length), color: "text-emerald-600", icon: CheckCircle2 },
              { label: "MCP 도구", value: String(MCP_TOOLS.length), color: "text-blue-600", icon: Network },
            ].map(s => {
              const SIcon = s.icon;
              return (
                <div key={s.label} className="flex flex-col items-center gap-0.5">
                  <div className={cn("text-[24px] font-black leading-none", s.color)}>{s.value}</div>
                  <div className="flex items-center gap-1">
                    <SIcon className={cn("w-2.5 h-2.5", s.color)} />
                    <div className="text-[10px] text-slate-400 font-bold">{s.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 상태 바 + 즐겨찾기·검색 */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-[12px] font-bold text-slate-600">시스템 정상 · 내부망 전용 · 로컬 LLM 가동 중</span>
            <span className="ml-auto flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-black">v3.0</span>
            </span>
          </div>
          {/* Favorites toggle */}
          <button onClick={() => setFavFilter(p => !p)}
            className={cn('px-3 py-2.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-sm',
              favFilter ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50')}>
            <Star className={cn('w-3.5 h-3.5', favFilter && 'fill-amber-400 text-amber-400')} />
            즐겨찾기
          </button>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="에이전트 검색..."
              className="w-52 max-w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-[12px] font-medium text-slate-700 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 shadow-sm"
            />
          </div>
        </div>

        {/* 복합 업무 오케스트레이션 시나리오 카드 — 도메인 팩 orchestration 필드 공급 시에만 노출 (객체 1개 또는 배열) */}
        {orchScenarios.length > 0 && !favFilter && !search && (
          <div className="mb-5 space-y-3">
            {orchScenarios.map((orch, oi) => (
              <div key={oi} className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="px-5 py-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                      <Workflow className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-semibold tracking-wide">복합 업무 오케스트레이션</span>
                        {orch._custom && <span className="text-[9px] px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-semibold">커스텀</span>}
                        <span className="text-[10px] text-slate-400 font-medium">요청 1건 → 에이전트 {orch.stages.length}개 자동 릴레이</span>
                      </div>
                      <div className="text-[15px] font-bold text-slate-900 leading-tight truncate">{orch.title}</div>
                      {/* 넓은 화면(제안서 캡처)에서는 2줄까지 — 시나리오 설명이 중간에서 잘리지 않게 */}
                      <div className="text-[11px] text-slate-500 font-medium truncate xl:whitespace-normal xl:line-clamp-2 mt-0.5">{orch.brief}</div>
                    </div>
                    <button onClick={() => onLaunch(`orchestration:${oi}`)}
                      className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-[12px] font-semibold shadow-sm hover:bg-indigo-700 transition-colors">
                      <Play className="w-3.5 h-3.5" /> 시나리오 실행
                    </button>
                  </div>
                </div>
                {/* 릴레이 체인 미리보기 */}
                <div className="bg-slate-50/70 border-t border-slate-100 px-5 py-2.5 flex items-center gap-1.5 flex-wrap">
                  {orch.stages.map((st, i) => {
                    const ag = agents.find(a => a.id === st.agentId);
                    if (!ag) return null;
                    const c = COLOR_MAP[ag.color] || COLOR_MAP.indigo;
                    const AgIcon = ag.icon;
                    return (
                      <React.Fragment key={st.agentId}>
                        <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg border", c.border, c.light)}>
                          <div className={cn("w-4 h-4 rounded flex items-center justify-center shrink-0", c.bg)}>
                            <AgIcon className="w-2.5 h-2.5 text-white" />
                          </div>
                          <span className={cn("text-[10px] font-bold whitespace-nowrap", c.text)}>{ag.shortName}</span>
                        </div>
                        {i < orch.stages.length - 1 && <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />}
                      </React.Fragment>
                    );
                  })}
                  <span className="ml-auto text-[9px] text-slate-400 font-bold whitespace-nowrap">중간 산출물 자동 인계 · 무개입 완주</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recently Used strip */}
        {recentIds.length > 0 && !favFilter && !search && (
          <div className="mb-5 bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5">
              <Clock className="w-3 h-3"/>최근 사용
            </div>
            <div className="flex gap-2 flex-wrap">
              {recentIds.slice(0,5).map(id => {
                const ag = agents.find(a => a.id === id);
                if (!ag) return null;
                const c = COLOR_MAP[ag.color] || COLOR_MAP.indigo;
                const AgIcon = ag.icon;
                return (
                  <button key={id} onClick={() => handleLaunch(id)}
                    className={cn('flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-all hover:shadow-sm', c.border, c.light, 'hover:opacity-90')}>
                    <div className={cn('w-5 h-5 rounded-md flex items-center justify-center shrink-0', c.bg)}>
                      <AgIcon className="w-2.5 h-2.5 text-white"/>
                    </div>
                    <span className={cn('text-[11px] font-black', c.text)}>{ag.shortName}</span>
                    <span className="text-[9px] text-slate-400 font-bold">{USAGE_COUNTS[id] || 0}회</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Agent Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ag, idx) => {
            const c = COLOR_MAP[ag.color] || COLOR_MAP.indigo;
            const AgIcon = ag.icon;
            const isHov = hovered === ag.id;
            return (
              <button
                key={ag.id}
                /* 검증용 훅 — 허브 카드 이름과 에이전트 내부 화면 제목이 일치하는지
                   verify.mjs가 기계적으로 대조한다(이름 불일치는 실제 사고 이력) */
                data-agent-id={ag.id}
                data-agent-name={ag.name}
                data-agent-short={ag.shortName}   /* 검증 훅: 이 도메인이 실제로 쓰는 짧은 이름 */
                onClick={() => handleLaunch(ag.id)}
                onMouseEnter={() => setHovered(ag.id)}
                onMouseLeave={() => setHovered(null)}
                className={cn(
                  "group relative p-5 rounded-2xl border-2 bg-white text-left transition-all duration-200 shadow-sm",
                  isHov ? cn(c.border, "shadow-xl -translate-y-0.5") : "border-slate-200 hover:shadow-md"
                )}
              >
                {/* Top accent bar */}
                <div className={cn("absolute top-0 left-0 right-0 rounded-t-2xl transition-all duration-200", isHov ? cn(c.bar, "h-1.5") : "h-1 bg-slate-200")} />

                {/* Number badge + star + usage */}
                <div className="absolute top-3.5 right-4 flex items-center gap-2">
                  <span className="text-[9px] text-slate-400 font-bold flex items-center gap-0.5"><TrendingUp className="w-2.5 h-2.5"/>{USAGE_COUNTS[ag.id]||0}회</span>
                  <div role="button" tabIndex={0} aria-label="즐겨찾기 추가/해제"
                    onClick={e=>{e.stopPropagation();toggleFavorite(ag.id);}}
                    onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.stopPropagation();toggleFavorite(ag.id);}}}
                    className={cn('transition-colors cursor-pointer',favorites.has(ag.id)?'text-amber-400':'text-slate-200 hover:text-amber-300')}>
                    <Star className={cn('w-3.5 h-3.5',favorites.has(ag.id)&&'fill-amber-400')}/>
                  </div>
                  <span className="text-[10px] font-black text-slate-200">#{String(idx+1).padStart(2,'0')}</span>
                </div>

                {/* Icon + name */}
                <div className="flex items-center gap-3 mb-3 mt-1">
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center border-2 transition-all duration-200 shadow-sm shrink-0",
                    isHov ? cn(c.bg, "border-transparent text-white") : cn(c.light, c.border, c.text))}>
                    <AgIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[14px] font-black text-slate-800 leading-tight">{ag.shortName}</div>
                    <div className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">{ag.name}</div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[12px] text-slate-500 leading-relaxed mb-3 line-clamp-2 font-medium">
                  {ag.desc}
                </p>

                {/* Tech tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {(ag.tech || []).map(t => (
                    <span key={t} className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold", c.tag)}>{t}</span>
                  ))}
                </div>

                {/* Mini pipeline + MCP badge */}
                <div className={cn("rounded-xl border px-3 py-2.5 mb-3 transition-all duration-200",
                  isHov ? cn(c.border, c.light) : "border-slate-100 bg-slate-50")}>
                  {/* Step flow */}
                  <div className="flex items-center gap-1 flex-wrap mb-2">
                    {(ag.workflow || []).map((s, i, arr) => (
                      <React.Fragment key={i}>
                        <div className="flex items-center gap-1 shrink-0">
                          <div className={cn(
                            "w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black shrink-0 transition-colors",
                            isHov ? cn(c.bg, "text-white") : "bg-slate-200 text-slate-500"
                          )}>
                            {i + 1}
                          </div>
                          <span className={cn(
                            "text-[9px] font-bold whitespace-nowrap transition-colors",
                            isHov ? c.text : "text-slate-500",
                          )}>
                            {s.role}
                          </span>
                        </div>
                        {i < arr.length - 1 && (
                          <ChevronRight className={cn("w-2.5 h-2.5 shrink-0 transition-colors", isHov ? c.text : "text-slate-300")} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  {/* MCP tools row — deduplicated by tool name */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[...new Map(
                      (ag.workflow || [])
                        .filter(s => s.tool && !["해당 없음","내장 알고리즘","내장 DB 엔진"].includes(s.tool))
                        .map(s => [s.tool, s])
                    ).values()].map(s => (
                        <span key={s.tool} className={cn(
                          "flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-lg font-bold border transition-colors",
                          isHov
                            ? "bg-blue-50 border-blue-200 text-blue-700"
                            : "bg-white border-slate-200 text-slate-400",
                        )}>
                          <Zap className="w-2.5 h-2.5 shrink-0" />
                          {s.tool.replace(/_/g," ").slice(0,16)}
                        </span>
                      ))
                    }
                  </div>
                </div>

                {/* Footer */}
                <div className={cn("flex items-center justify-between pt-3 border-t transition-colors",
                  isHov ? c.border : "border-slate-100")}>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[11px] font-bold text-emerald-600">준비 완료</span>
                  </div>
                  <div className={cn("flex items-center gap-1 text-[12px] font-black transition-colors",
                    isHov ? c.text : "text-slate-400")}>
                    <span>시작하기</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Architecture overview footer */}
        <div className="mt-8 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-3 flex items-center gap-2">
            <Network className="w-4 h-4 text-indigo-200" />
            <span className="text-[13px] font-black text-white">멀티 에이전트 아키텍처</span>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 bg-indigo-500/60 text-indigo-100 rounded-full font-black border border-indigo-400/40">RAG + sLLM</span>
              <span className="text-[10px] px-2 py-0.5 bg-indigo-500/60 text-indigo-100 rounded-full font-black border border-indigo-400/40">MCP {MCP_TOOLS.length}개 연결</span>
            </div>
          </div>
          <div className="bg-white px-5 py-4">
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { step: "01", label: "입력 수신", sub: "텍스트·음성·파일" },
                { step: "02", label: "DRM·OCR 전처리", sub: "문서 복호화·텍스트화" },
                { step: "03", label: "RAG 지식 검색", sub: "벡터 시맨틱 매칭" },
                { step: "04", label: "sLLM 추론·생성", sub: "로컬 LLM 처리" },
                { step: "05", label: "결과 검수", sub: "신뢰도·보안 검증" },
                { step: "06", label: "공문서 출력", sub: "결재·내보내기" },
              ].map((s, i, arr) => (
                <React.Fragment key={s.step}>
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-[8px] font-black flex items-center justify-center">{s.step}</div>
                      <span className="text-[11px] font-black text-slate-700">{s.label}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium">{s.sub}</span>
                  </div>
                  {i < arr.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0 mb-2" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentHub;
