import React, { lazy, Suspense, useState } from "react";
import {
  ShieldCheck, ShieldAlert, EyeOff, Server, History, Bot, Workflow,
  FileCheck, Languages, FileText, Search, Sparkles, Clock, Star,
  Shield, User, CheckCircle2, AlertTriangle, Copy, ThumbsUp, ThumbsDown,
  BookOpen, ExternalLink, Paperclip, Eye, FileDown, Loader2, Briefcase,
  Bell, ChevronRight, ArrowRightLeft, ClipboardList,
} from "lucide-react";
import { cn, SecurityBadge } from "../../utils.jsx";
import { SECURE_SUGGESTIONS as BASE_SECURE_SUGGESTIONS } from "../../data/constants.js";

// 지도 인텔리전스 카드: recharts 포함 — 지역 질의 응답 시점에만 로드 (초기 번들 분리)
const MapIntelCard = lazy(() => import("../MapIntelCard.jsx"));
import XaiPanel from "../XaiPanel.jsx";
import LiveMetricCard from "../LiveMetricCard.jsx";
import { renderMdLite } from "../../mdLite.jsx";

/* ================================================================== */
/* 중앙 채팅 영역 — 빈 상태(탭별) · 메시지 목록 · 타이핑 인디케이터     */
/* ================================================================== */
const ChatMessages = ({
  th, isSecure, isAgent, mc, mode,
  messages, isTyping, messagesEndRef,
  USER_INFO, selectedAgent, activeWs, DOCS, HISTORY, onLoadHistory, SUGGESTIONS,
  SECURE_SUGGESTIONS = BASE_SECURE_SUGGESTIONS,
  translateLang, setTranslateLang, summaryLen, setSummaryLen,
  activeLLM,
  handleSend, handleCitationClick, handleDocDownload,
  setShowBuilderModal, setToast,
  onErrReport, onDocPreview, onFeedback,
  briefingItems = [], onNavigateAgent,
  liveCfg = null, liveState = null, liveSpeed = 1, setLiveSpeed,
  handover = null, onOpenHandover, domainColor = '#334155',
  workOrders = null, onOpenWorkOrders,
  L = { suggested: "추천 질문", recent: "최근 대화", briefing: "오늘의 업무 브리핑", pending: (n) => `처리 대기 ${n}건` },
}) => {
  const ModeIcon = mc.icon;
  // 답변 피드백 — 세션 내 표시 상태 (기록 저장은 UserApp onFeedback가 담당)
  const [fb, setFb] = useState({});          // { msgId: { rating, reason } }
  const [reasonFor, setReasonFor] = useState(null); // 👎 사유 선택 중인 msgId
  const FB_REASONS = ["부정확한 내용", "근거 문서 부족", "오래된 정보", "질문 의도 미반영"];
  const giveFeedback = (msg, rating, reason = null) => {
    setFb(prev => ({ ...prev, [msg.id]: { rating, reason } }));
    setReasonFor(null);
    onFeedback?.(msg, rating, reason);
  };
  return (
    <div className={cn("flex-1 overflow-y-auto px-4 sm:px-12 pt-12 pb-8 custom-scrollbar relative z-10", isSecure ? "" : "bg-white")}>
      <div className="max-w-3xl mx-auto min-h-full flex flex-col justify-end">

        {/* Empty State */}
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-start py-8 animate-in fade-in duration-500">
            {isSecure ? (
              /* ── 임시 채팅 빈 상태 (Claude/Gemini/GPT 스타일) ── */
              <div className="w-full max-w-xl mx-auto space-y-5 py-4">
                {/* 아이콘 + 제목 */}
                <div className="flex flex-col items-center text-center gap-3 pb-1">
                  <div className="w-14 h-14 rounded-2xl bg-[#0a1428] border border-blue-900/60 flex items-center justify-center shadow-xl relative">
                    <div className="absolute inset-0 rounded-2xl border border-blue-500/20 animate-pulse"/>
                    <ShieldCheck className="w-7 h-7 text-blue-400"/>
                  </div>
                  <div>
                    <h3 className="text-[22px] font-black text-slate-100 tracking-tight mb-1">보안 채팅</h3>
                    <p className="text-slate-500 text-[13px] font-medium leading-relaxed">
                      강화된 보안 환경에서 대화합니다.
                    </p>
                  </div>
                </div>
                {/* 보안 기능 안내 카드 */}
                <div className="bg-[#0a0f1c] border border-slate-800 rounded-2xl divide-y divide-slate-800/60">
                  {[
                    { Icon: EyeOff,    text: "대화 내용이 서버에 저장되지 않습니다",         badge: "무저장" },
                    { Icon: Server,    text: "모든 처리는 내부망 로컬 LLM에서만 이루어집니다", badge: "로컬 전용" },
                    { Icon: ShieldAlert, text: "외부 인터넷망 접근이 차단된 환경입니다",       badge: "망분리" },
                    { Icon: History,   text: "AI 학습 데이터로 활용되지 않습니다",            badge: "학습 미활용" },
                  ].map(({ Icon, text, badge }, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 text-[12px] text-slate-400 font-medium">
                      <Icon className="w-3.5 h-3.5 text-blue-600/60 shrink-0"/>
                      <span className="flex-1">{text}</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-blue-950/60 border border-blue-900/50 rounded text-blue-500/80 font-bold shrink-0 whitespace-nowrap">{badge}</span>
                    </div>
                  ))}
                </div>
                {/* 구분선 */}
                <div className="text-[10px] font-black text-slate-700 uppercase tracking-wider pt-1">시작해 보기</div>
                {/* 제안 카드 */}
                <div className="grid grid-cols-2 gap-3">
                  {SECURE_SUGGESTIONS.map((s, i) => {
                    const SIcon = s.icon;
                    return (
                      <button key={i} onClick={() => handleSend(s.query)}
                        className="group p-4 rounded-2xl border border-slate-800 bg-[#0a0f1c]/60 text-left hover:border-blue-900/60 hover:bg-[#0a1428] transition-all duration-200 shadow-sm">
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", s.iconBg)}>
                          <SIcon className={cn("w-4 h-4", s.iconColor)} />
                        </div>
                        <div className="text-[13px] font-bold text-slate-300 mb-1 leading-snug">{s.title}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-2 font-medium leading-relaxed">{s.query}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : isAgent ? (
              /* ── 에이전트 탭 빈 상태 ── */
              <>
                <div className="w-16 h-16 rounded-3xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center mb-5 shadow-md">
                  <Bot className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-[26px] font-black text-slate-900 mb-2 tracking-tight text-center">
                  안녕하세요, <span className="text-indigo-600">{USER_INFO.name}님!</span>
                </h3>
                <p className="text-slate-400 text-center max-w-sm mb-4 font-medium leading-relaxed text-[14px]">{selectedAgent?.desc}</p>
                <button onClick={() => setShowBuilderModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-[13px] font-bold mb-8 hover:bg-indigo-100 transition-all shadow-sm">
                  <Workflow className="w-4 h-4" /> AI 처리 파이프라인 보기
                </button>
                <div className="grid grid-cols-2 gap-3 w-full max-w-2xl">
                  {[{ icon: FileCheck, iconBg:"bg-indigo-50", iconColor:"text-indigo-600", title: "문서 사전 검토 (규정 대조)", query: "업로드된 출장 신청 기안문을 취업규칙(2025개정)에 비추어 위반 소지가 없는지 검토해줘" },
                    { icon: Languages, iconBg:"bg-violet-50", iconColor:"text-violet-600", title: "기술 지침 번역·요약",       query: "평택기지 안전 유의사항 부분을 영문으로 번역하고 200자로 요약해줘" },
                    { icon: FileText,  iconBg:"bg-emerald-50",iconColor:"text-emerald-600",title: "주간 실적 보고서 작성",      query: "이번 주 PSV 점검 5건 완료, 배관 누설 탐지 2건 처리 완료를 주간 실적 보고서로 작성해줘" },
                    { icon: Search,   iconBg:"bg-blue-50",   iconColor:"text-blue-600",   title: "사내 규정 검색",             query: "취업규칙 2025년 개정 내용 중 출장 및 출장비 관련 주요 변경 사항을 알려줘" },
                  ].map((s, i) => {
                    const SIcon = s.icon;
                    return (
                      <button key={i} onClick={() => handleSend(s.query)} className="group p-4 rounded-2xl border border-slate-200 text-left bg-white hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 shadow-sm">
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", s.iconBg)}>
                          <SIcon className={cn("w-4 h-4", s.iconColor)} />
                        </div>
                        <div className="text-[13px] font-bold text-slate-800 mb-1 leading-snug">{s.title}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-2 font-medium leading-relaxed">{s.query}</div>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              /* ── 일반 채팅 빈 상태 ── */
              <>
                {/* ── 인사 헤더 ── */}
                <div className="flex items-center gap-4 mb-5 w-full max-w-2xl">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00539F] to-blue-400 flex items-center justify-center shadow-lg shrink-0">
                    <span className="text-[22px] font-black text-white">K</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[20px] font-black text-slate-900 tracking-tight leading-tight">
                      안녕하세요, <span className={mc.colors.text}>{USER_INFO.name} {USER_INFO.title}</span>님!
                    </h3>
                    <p className="text-slate-400 font-medium text-[12px] mt-0.5">{USER_INFO.dept}</p>
                  </div>
                </div>
                {/* ── 워크스페이스 컨텍스트 카드 ── */}
                <div className="w-full max-w-2xl mb-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-100 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2 mb-2.5">
                      {React.createElement(activeWs?.icon || Briefcase, {className:"w-3.5 h-3.5 text-blue-600"})}
                      <span className="text-[12px] font-black text-blue-900">{activeWs?.name}</span>
                      <div className="ml-auto flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                        <span className="text-[10px] font-bold text-blue-600">문서 {DOCS.length}개 로드됨</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {DOCS.map(doc => (
                        <div key={doc.id} className="flex items-center gap-1.5 bg-white/90 border border-blue-100 rounded-lg px-2.5 py-1 text-[10px] font-medium text-slate-600 shadow-sm">
                          <FileText className="w-3 h-3 text-blue-400 shrink-0" />
                          <span className="max-w-[160px] truncate">{doc.name}</span>
                          <span className={cn("text-[9px] font-black shrink-0",
                            doc.secLevel === 'C' ? 'text-amber-600' :
                            doc.secLevel === 'S' ? 'text-rose-600' : 'text-slate-400'
                          )}>{doc.secLevel}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* ── 라이브 지표 (팩 liveMetric 공급 시) — 엔진은 UserApp에서 상시 틱 ── */}
                {mode === "GENERAL" && liveCfg && liveState && (
                  <LiveMetricCard cfg={liveCfg} state={liveState} speed={liveSpeed} setSpeed={setLiveSpeed} onAction={onNavigateAgent} />
                )}
                {/* ── 오늘의 업무 브리핑 — 팩 notifications 재사용, 클릭 시 에이전트/시나리오 딥링크 ── */}
                {mode === "GENERAL" && briefingItems.length > 0 && (
                  <div className="w-full max-w-2xl mb-4">
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                      <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center gap-2">
                        <Bell className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-[12px] font-black text-slate-800">{L.briefing}</span>
                        <span className="ml-auto text-[10px] font-bold text-slate-400">{L.pending(briefingItems.length)}</span>
                      </div>
                      {briefingItems.map(n => (
                        <button key={n.id} onClick={() => n.link?.agentId && onNavigateAgent?.(n.link.agentId)}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 border-b border-slate-50 last:border-b-0 text-left hover:bg-slate-50 transition-colors">
                          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0",
                            n.severity === "alert" ? "bg-rose-500" : n.severity === "warn" ? "bg-amber-500" : "bg-blue-500")} />
                          <span className="text-[12px] font-bold text-slate-700 shrink-0 max-w-[45%] truncate">{n.title}</span>
                          <span className="text-[11px] text-slate-400 font-medium truncate flex-1 min-w-0 hidden sm:block">{n.body}</span>
                          {n.link?.agentId && (
                            <span className="flex items-center gap-0.5 text-[10px] font-black text-indigo-600 shrink-0">
                              처리 <ChevronRight className="w-3 h-3" />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {/* ── 교대 인수인계 (팩 shiftHandover 공급 시) ── */}
                {mode === "GENERAL" && handover && (
                  <button onClick={onOpenHandover}
                    className="w-full max-w-2xl mb-4 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all text-left overflow-hidden group">
                    <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center gap-2">
                      <ArrowRightLeft className="w-3.5 h-3.5" style={{ color: domainColor }} />
                      <span className="text-[12px] font-black text-slate-800">{handover.title || "교대 인수인계"}</span>
                      <span className="ml-auto text-[10px] font-bold text-slate-400">
                        {handover.shiftLabel}{handover.shiftTime ? ` · ${handover.shiftTime}` : ""}
                      </span>
                    </div>
                    <div className="px-4 py-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        {handover.incomingCount > 0 ? (
                          <p className="text-[12px] text-slate-700 font-medium">
                            직전 조에서 <b>{handover.incomingCount}건</b>이 넘어왔습니다
                            {handover.draftCount > 0 && <> · 이번 조 초안 <b>{handover.draftCount}건</b> 준비됨</>}
                          </p>
                        ) : (
                          <p className="text-[12px] text-slate-700 font-medium">
                            이번 조 인수인계 초안 <b>{handover.draftCount}건</b>이 준비됐습니다
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {handover.hint || "이상·조치·미결을 자동으로 모아 다음 조에 넘깁니다"}
                        </p>
                      </div>
                      <span className="flex items-center gap-0.5 text-[11px] font-black shrink-0 group-hover:gap-1.5 transition-all"
                        style={{ color: domainColor }}>
                        열기 <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                )}
                {/* ── 작업지시 추적 (발행 → 조치 → 검증 닫힌 루프) ── */}
                {mode === "GENERAL" && workOrders && workOrders.total > 0 && (
                  <button onClick={onOpenWorkOrders}
                    className="w-full max-w-2xl mb-4 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all text-left overflow-hidden group">
                    <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center gap-2">
                      <ClipboardList className="w-3.5 h-3.5" style={{ color: domainColor }} />
                      <span className="text-[12px] font-black text-slate-800">작업지시 추적</span>
                      <span className="ml-auto text-[10px] font-bold text-slate-400">
                        진행 중 {workOrders.open}건 / 전체 {workOrders.total}건
                      </span>
                    </div>
                    <div className="px-4 py-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        {workOrders.head ? (
                          <p className="text-[12px] text-slate-700 font-medium truncate">
                            <b>{workOrders.head.status}</b> · {workOrders.head.title}
                            <span className="text-slate-400 font-mono ml-1.5">{workOrders.head.docNo}</span>
                          </p>
                        ) : (
                          <p className="text-[12px] text-slate-700 font-medium">발행된 작업지시가 모두 검증 완료됐습니다</p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          시나리오가 발행한 지시가 실제로 조치·검증됐는지 추적합니다
                        </p>
                      </div>
                      <span className="flex items-center gap-0.5 text-[11px] font-black shrink-0 group-hover:gap-1.5 transition-all"
                        style={{ color: domainColor }}>
                        열기 <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                )}
                {/* TRANSLATE 모드 전용: 언어 선택 + 요약 길이 */}
                {mode === "TRANSLATE" && (
                  <div className="flex flex-col items-center gap-3 mb-4 w-full max-w-2xl">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {["한→영","영→한","한→중","한→일"].map(lang => (
                        <button key={lang} onClick={() => setTranslateLang(lang)} className={cn("px-4 py-2 rounded-xl border text-sm font-bold transition-all", translateLang === lang ? "border-violet-400 bg-violet-50 text-violet-700 shadow-sm" : "border-slate-200 text-slate-500 hover:border-violet-300 bg-white")}>
                          {lang}
                        </button>
                      ))}
                    </div>
                    <div className="w-full bg-violet-50 rounded-xl p-4 border border-violet-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-violet-700">요약 길이</span>
                        <span className="text-sm font-black text-violet-600">{summaryLen.toLocaleString()}자 이내</span>
                      </div>
                      <input type="range" min={100} max={2000} step={100} value={summaryLen} onChange={e => setSummaryLen(+e.target.value)} className="w-full accent-violet-600"/>
                      <div className="flex justify-between text-[10px] text-violet-400 mt-1"><span>100자</span><span>2,000자</span></div>
                    </div>
                  </div>
                )}
                {/* ── 추천 질문 ── */}
                <div className="w-full max-w-2xl mb-3">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Sparkles className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{L.suggested}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {SUGGESTIONS[mode]?.map((s, i) => {
                      const SIcon = s.icon;
                      return (
                        <button key={i} onClick={() => handleSend(s.query)} className="group p-4 rounded-2xl border border-slate-200 text-left bg-white hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 shadow-sm">
                          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", s.iconBg)}>
                            <SIcon className={cn("w-4 h-4", s.iconColor)} />
                          </div>
                          <div className="text-[13px] font-bold text-slate-800 mb-1 leading-snug">{s.title}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-2 font-medium leading-relaxed">{s.query}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* ── 최근 대화 ── */}
                <div className="w-full max-w-2xl">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{L.recent}</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100">
                    {HISTORY.slice(0, 4).map((h) => {
                      const dotColor = ({
                        GENERAL:   'bg-blue-400',
                        TRANSLATE: 'bg-violet-400',
                        REPORT:    'bg-emerald-400',
                        REVIEW:    'bg-amber-400',
                      })[h.mode] || 'bg-slate-300';
                      return (
                        <button key={h.id} onClick={() => (onLoadHistory ? onLoadHistory(h) : handleSend(h.title))} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left">
                          <div className={cn("w-2 h-2 rounded-full shrink-0", dotColor)} />
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-bold text-slate-800 truncate">{h.title}</div>
                          </div>
                          {h.starred && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
                          <span className="text-[10px] text-slate-400 shrink-0">{h.isToday ? h.time : h.time}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 보안 채팅 진행 중 안내 배너 */}
        {isSecure && messages.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0a1428] border border-blue-900/50 rounded-xl text-[11px] text-blue-400/70 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-blue-600/60"/>
            <span>보안 채팅 — 이 대화는 저장되지 않으며 외부로 전송되지 않습니다</span>
          </div>
        )}

        {/* Messages */}
        {messages.map(msg => {
          /* ── 차단 메시지: 가드레일이 완전 차단한 요청 ── */
          if (msg.role === "blocked") return (
            <div key={msg.id} className="flex justify-center mb-5 animate-in slide-in-from-bottom-2 fade-in duration-300">
              <div className="w-full max-w-[88%]">
                <div className={cn("flex items-start gap-3 p-4 rounded-2xl border-2 shadow-sm",
                  isSecure ? "bg-red-950/40 border-red-800/60" : "bg-red-50 border-red-200")}>
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border-2",
                    isSecure ? "bg-red-900/30 border-red-800/60 text-red-400" : "bg-red-100 border-red-200 text-red-600")}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={cn("text-[13px] font-black", isSecure ? "text-red-300" : "text-red-700")}>보안 필터링 — 요청이 차단되었습니다</span>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-black border", isSecure ? "bg-red-900/40 text-red-400 border-red-800/60" : "bg-red-100 text-red-700 border-red-200")}>차단</span>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", isSecure ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500")}>{msg.ruleCategory}</span>
                    </div>
                    <div className={cn("text-[12px] font-medium", isSecure ? "text-red-400" : "text-red-600")}>
                      <span className="font-black">[{msg.ruleName}]</span> 규칙에 의해 이 요청이 차단되었습니다. 질문을 변경하거나 관리자에게 문의하세요.
                    </div>
                    <div className={cn("text-[11px] mt-0.5 font-mono", isSecure ? "text-slate-500" : "text-slate-400")}>감지 키워드: {msg.keywords}</div>
                  </div>
                  <span className={cn("text-[11px] shrink-0", isSecure ? "text-slate-500" : "text-red-400")}>{msg.time}</span>
                </div>
              </div>
            </div>
          );

          return (
          <div key={msg.id} className={cn("flex mb-5", msg.role === "user" ? "justify-end" : "justify-start animate-in slide-in-from-bottom-2 fade-in duration-300")}>
            {/* mapIntel 메시지는 w-full: flex-1 컬럼이 내재 폭에 0으로 기여해 차트 컬럼이 붕괴하는 것 방지 */}
            <div className={cn("flex max-w-[88%] gap-4", msg.role === "user" ? "flex-row-reverse" : "flex-row", msg.mapIntel && "w-full")}>
              <div className={cn("w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mt-1 border-2 shadow-sm",
                msg.role === "user" ? (isSecure ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-500")
                : isSecure ? "bg-[#0a0f1c] text-blue-400 border-slate-700" : isAgent ? "bg-indigo-600 text-white border-transparent" : cn(mc.colors.active, "border-transparent"))}>
                {msg.role === "user" ? <User className="w-5 h-5" /> : isSecure ? <ShieldCheck className="w-5 h-5" /> : isAgent ? <Bot className="w-5 h-5" /> : <ModeIcon className="w-5 h-5" />}
              </div>
              <div className="flex flex-col gap-2 min-w-0 flex-1 group">
                {/* 에이전트 처리 단계 (steps — GENERAL 탭 서브모드) */}
                {msg.role === "assistant" && msg.steps && (
                  <div className={cn("mb-2 p-4 rounded-2xl border-2 shadow-sm", isSecure ? "bg-[#0a0f1c]/80 border-slate-700" : "bg-slate-50/80 border-slate-100")}>
                    <div className={cn("flex items-center gap-2 mb-3 text-[12px] font-black uppercase tracking-wider", isSecure ? "text-blue-400" : mc.colors.text)}>
                      <Workflow className="w-4 h-4" /> 처리 단계 완료
                    </div>
                    <div className="space-y-3 relative pl-3">
                      <div className={cn("absolute left-[19px] top-3 bottom-3 w-0.5", isSecure ? "bg-slate-700" : "bg-slate-200")}></div>
                      {msg.steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-3 relative z-10">
                          <div className={cn("w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 shadow-sm", isSecure ? "bg-[#040814] border-slate-700" : "bg-white border-slate-200")}>
                            <CheckCircle2 className={cn("w-5 h-5", isSecure ? "text-blue-400" : mc.colors.text)} />
                          </div>
                          <div className="mt-1">
                            <div className={cn("text-[13px] font-bold", isSecure ? "text-slate-200" : "text-slate-700")}>{step.label}</div>
                            <div className={cn("text-[12px] font-medium", isSecure ? "text-slate-400" : "text-slate-500")}>{step.detail}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* 에이전트 처리 단계 (agentSteps — AGENT 탭) */}
                {msg.role === "assistant" && msg.agentSteps?.length > 0 && (
                  <div className="mb-2 p-4 rounded-2xl border-2 bg-indigo-50/60 border-indigo-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-[12px] font-black uppercase tracking-wider text-indigo-600">
                      <Workflow className="w-4 h-4" /> 에이전트 파이프라인 실행 완료
                    </div>
                    <div className="space-y-3 relative pl-3">
                      <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-indigo-200"></div>
                      {msg.agentSteps.map((step, idx) => {
                        const [role, detail] = step.label.split(": ");
                        return (
                          <div key={idx} className="flex items-start gap-3 relative z-10">
                            <div className="w-8 h-8 rounded-full border-2 border-indigo-200 bg-white flex items-center justify-center shrink-0 shadow-sm">
                              <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                            </div>
                            <div className="mt-1">
                              <div className="text-[13px] font-bold text-indigo-700">{role}</div>
                              <div className="text-[12px] font-medium text-slate-500">{detail}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* 경고 배너 (입력 필터링 경고 감지 시) */}
                {msg.role === "user" && msg.warningRule && (
                  <div className={cn("flex items-center gap-2 px-3 py-2 rounded-xl border text-[12px] font-bold self-end",
                    isSecure ? "bg-amber-900/30 border-amber-700/50 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-700")}>
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span><span className="font-black">[{msg.warningRule}]</span> 경고 규칙이 감지되었습니다. 내용을 확인하세요.</span>
                  </div>
                )}
                {/* 말풍선 */}
                <div className={cn("rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap font-medium shadow-sm",
                  msg.role === "user"
                    ? cn("px-5 py-3.5", isSecure ? "bg-slate-800 text-slate-100 rounded-tr-sm border border-slate-700" : "bg-slate-100 text-slate-900 rounded-tr-sm border border-slate-200")
                    : cn("px-5 py-4", th.chatBg))}>
                  {msg.role === "assistant" ? renderMdLite(msg.content, isSecure) : msg.content}
                </div>
                {/* ── XAI 푸터: 신뢰도·근거 구성·판단 근거 (answer 객체 confidence·citations·xai) ── */}
                {msg.role === "assistant" && <XaiPanel msg={msg} isSecure={isSecure} />}
                {/* ── 에이전트 핸드오프 카드 (팩 agentRouting 매칭 시 UserApp이 msg.handoff 부착) ── */}
                {msg.role === "assistant" && msg.handoff && (
                  <button onClick={() => onNavigateAgent?.(msg.handoff.agentId)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border-2 border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 hover:border-indigo-300 transition-colors text-left">
                    <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[12px] font-black text-indigo-800 truncate">다음 단계 — {msg.handoff.name}</span>
                      <span className="block text-[11px] font-medium text-indigo-600/80 leading-snug">{msg.handoff.reason}</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0" />
                  </button>
                )}
                {/* ── 지도 인텔리전스 카드 (히트맵 + 시계열, 시뮬레이션) ── */}
                {msg.role === "assistant" && msg.mapIntel && (
                  <Suspense fallback={
                    <div className="mt-2 p-6 rounded-2xl border-2 border-slate-100 bg-slate-50 flex items-center gap-2 text-[12px] font-bold text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin" /> 지도 시각화 로딩 중…
                    </div>
                  }>
                    <MapIntelCard data={msg.mapIntel} />
                  </Suspense>
                )}
                {/* 액션 버튼 — 피드백 상태가 있으면 상시 노출 (모바일 hover 의존 완화) */}
                {msg.role === "assistant" && (
                  <div className={cn("flex items-center gap-1.5 mt-0.5 px-1 transition-opacity",
                    fb[msg.id] || reasonFor === msg.id ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
                    <button aria-label="답변 복사" className={cn("p-1.5 max-md:p-2.5 rounded-lg transition-colors", isSecure ? "text-slate-500 hover:text-blue-400 hover:bg-slate-800" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100")} onClick={() => { navigator.clipboard.writeText(msg.content); setToast({ message: "클립보드에 복사되었습니다." }); }}><Copy className="w-4 h-4" /></button>
                    <button aria-label="도움됨" aria-pressed={fb[msg.id]?.rating === "good"} onClick={() => giveFeedback(msg, "good")}
                      className={cn("p-1.5 max-md:p-2.5 rounded-lg transition-colors",
                        fb[msg.id]?.rating === "good" ? "text-green-600 bg-green-50" :
                        isSecure ? "text-slate-500 hover:text-blue-400 hover:bg-slate-800" : "text-slate-400 hover:text-green-600 hover:bg-green-50")}>
                      <ThumbsUp className={cn("w-4 h-4", fb[msg.id]?.rating === "good" && "fill-green-200")} /></button>
                    <button aria-label="도움 안 됨" aria-pressed={fb[msg.id]?.rating === "bad"} onClick={() => setReasonFor(reasonFor === msg.id ? null : msg.id)}
                      className={cn("p-1.5 max-md:p-2.5 rounded-lg transition-colors",
                        fb[msg.id]?.rating === "bad" ? "text-red-500 bg-red-50" :
                        isSecure ? "text-slate-500 hover:text-blue-400 hover:bg-slate-800" : "text-slate-400 hover:text-red-500 hover:bg-red-50")}>
                      <ThumbsDown className={cn("w-4 h-4", fb[msg.id]?.rating === "bad" && "fill-red-200")} /></button>
                    <button onClick={() => onErrReport(msg)} title="오류 신고" className={cn("p-1.5 max-md:p-2.5 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold", isSecure ? "text-slate-500 hover:text-red-400 hover:bg-slate-800" : "text-slate-400 hover:text-red-500 hover:bg-red-50")}><AlertTriangle className="w-3.5 h-3.5" /><span className="hidden sm:inline">신고</span></button>
                    <span className={cn("text-[11px] ml-1", th.subtext)}>{msg.time}</span>
                    {fb[msg.id] && (
                      <span className={cn("text-[10px] font-bold ml-1", isSecure ? "text-slate-500" : "text-slate-400")}>
                        피드백 반영됨{fb[msg.id].reason ? ` · ${fb[msg.id].reason}` : ""}
                      </span>
                    )}
                  </div>
                )}
                {/* 👎 사유 선택 칩 — 선택 시 품질 리뷰(관리자)로 전달 */}
                {msg.role === "assistant" && reasonFor === msg.id && (
                  <div className={cn("flex items-center gap-1.5 flex-wrap px-1 py-1.5 rounded-xl border text-[11px] animate-in fade-in duration-150",
                    isSecure ? "bg-[#0a0f1c] border-slate-700" : "bg-slate-50 border-slate-200")}>
                    <span className={cn("font-bold px-1.5", isSecure ? "text-slate-400" : "text-slate-500")}>어떤 점이 아쉬웠나요?</span>
                    {FB_REASONS.map(r => (
                      <button key={r} onClick={() => giveFeedback(msg, "bad", r)}
                        className={cn("px-2.5 py-1 rounded-full border font-bold transition-colors",
                          isSecure ? "border-slate-600 text-slate-300 hover:bg-slate-800" : "border-slate-300 text-slate-600 bg-white hover:border-red-300 hover:text-red-600")}>
                        {r}
                      </button>
                    ))}
                  </div>
                )}
                {/* ── 출처 인용 카드 ── */}
                {msg.role === "assistant" && msg.citations?.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <div className={cn("flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider",
                      isSecure ? "text-slate-500" : "text-slate-400")}>
                      <BookOpen className="w-3 h-3"/>참조 출처 ({msg.citations.length}건)
                    </div>
                    {msg.citations.map((cite, idx) => (
                      <button key={idx} onClick={() => handleCitationClick(cite)}
                        className={cn("w-full flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left group/cite shadow-sm hover:shadow-md",
                          isSecure ? "bg-[#0a0f1c] border-slate-700 hover:border-blue-500" : "bg-white border-slate-200 hover:border-blue-300")}>
                        <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black border shrink-0 mt-0.5",
                          isSecure ? "bg-slate-800 border-slate-600 text-blue-400" : cn(mc.colors.light, "border"))}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <span className={cn("text-[12px] font-black truncate", isSecure ? "text-slate-200" : "text-slate-800")}>{cite.name}</span>
                            {cite.page && <span className={cn("text-[10px] font-mono shrink-0", isSecure ? "text-slate-500" : "text-slate-400")}>{cite.page}p</span>}
                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0", isSecure ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500")}>{cite.tag}</span>
                            {cite.secLevel && <SecurityBadge level={cite.secLevel} size="xs"/>}
                          </div>
                          {cite.excerpt && (
                            <div className={cn("text-[11px] leading-relaxed line-clamp-2 mb-1.5 italic",
                              isSecure ? "text-slate-500" : "text-slate-500")}>
                              &ldquo;{cite.excerpt}&rdquo;
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <div className={cn("flex-1 h-1 rounded-full", isSecure ? "bg-slate-700" : "bg-slate-200")}>
                              <div style={{width:`${cite.similarity}%`}}
                                className={cn("h-full rounded-full",
                                  cite.similarity >= 95 ? "bg-emerald-500" : cite.similarity >= 80 ? "bg-blue-400" : "bg-amber-400")}/>
                            </div>
                            <span className={cn("text-[10px] font-black font-mono shrink-0",
                              cite.similarity >= 95 ? (isSecure ? "text-emerald-400" : "text-emerald-600") : (isSecure ? "text-slate-400" : "text-slate-500"))}>
                              {cite.similarity}%
                            </span>
                          </div>
                        </div>
                        <ExternalLink className={cn("w-3.5 h-3.5 shrink-0 mt-1 opacity-0 group-hover/cite:opacity-100 transition-opacity", isSecure ? "text-blue-400" : "text-blue-400")}/>
                      </button>
                    ))}
                  </div>
                )}
                {/* ── 출력 가드레일 적용 배지 ── */}
                {msg.role === "assistant" && msg.guardrailsApplied?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {msg.guardrailsApplied.map((g, i) => (
                      <div key={i} className={cn("flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-bold",
                        isSecure ? "bg-orange-900/20 border-orange-800/40 text-orange-400" : "bg-orange-50 border-orange-200 text-orange-700")}>
                        <Shield className="w-3 h-3 shrink-0" />
                        <span>{g.rule}</span>
                        <span className={cn("font-medium", isSecure ? "text-orange-500" : "text-orange-500")}>· {g.action}</span>
                        {g.detail && <span className={cn("font-normal", isSecure ? "text-slate-500" : "text-slate-400")}>({g.detail})</span>}
                      </div>
                    ))}
                  </div>
                )}
                {/* ── 문서 생성 카드 ── */}
                {msg.role === "assistant" && msg.document && (
                  <div className="mt-2 animate-in fade-in slide-in-from-bottom-1 duration-300">
                    <div className={cn("p-4 rounded-2xl border-2 shadow-sm",
                      isAgent ? "border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-white" : "border-emerald-100 bg-gradient-to-br from-emerald-50/70 to-white")}>
                      {/* 카드 헤더 */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border-2 shrink-0",
                          isAgent ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-emerald-50 border-emerald-200 text-emerald-600")}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-black text-slate-800 leading-snug">{msg.document.title}</div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{msg.document.docNo}</span>
                            <span className="text-[10px] text-slate-400">{msg.document.issueDate}</span>
                            {msg.document.secLevel && <SecurityBadge level={msg.document.secLevel} size="xs" />}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            {[`수신: ${msg.document.to}`, `발신: ${msg.document.from.split(" ").slice(-2).join(" ")}`].map((t, i) => (
                              <span key={i} className={cn("text-[10px] px-1.5 py-0.5 rounded font-semibold",
                                isAgent ? "bg-indigo-100/70 text-indigo-700" : "bg-emerald-100/70 text-emerald-700")}>{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      {/* 첨부 목록 */}
                      <div className={cn("text-[11px] font-medium px-3 py-2 rounded-xl mb-3 flex items-center gap-1.5 min-w-0",
                        isAgent ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600")}>
                        <Paperclip className="w-3 h-3 shrink-0" />
                        <span className="truncate">{msg.document.attachments.join(" · ")}</span>
                      </div>
                      {/* 버튼 */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onDocPreview(msg.document)}
                          className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-[12px] font-bold transition-all hover:shadow-sm",
                            isAgent ? "border-indigo-200 text-indigo-700 hover:bg-indigo-50" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50")}>
                          <Eye className="w-3.5 h-3.5" /> 문서 미리보기
                        </button>
                        <button
                          onClick={() => handleDocDownload(msg.document)}
                          className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold text-white shadow-sm transition-all active:scale-95",
                            isAgent ? "bg-indigo-600 hover:bg-indigo-700" : "bg-emerald-600 hover:bg-emerald-700")}>
                          <FileDown className="w-3.5 h-3.5" /> 다운로드
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-3 ml-14 mb-6 animate-in fade-in duration-200">
            <Loader2 className={cn("w-5 h-5 animate-spin", isSecure ? "text-blue-500" : mc.colors.text)} />
            <span className={cn("text-[13px] font-medium", th.subtext)}>
              {isSecure ? "보안 환경에서 분석 중..." : mode === "GENERAL" ? `지식망 검색 및 ${activeLLM.shortName} 추론 중...` : `${mc.label} 에이전트 처리 중...`}
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatMessages;
