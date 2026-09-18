import React, { useState, useRef, useEffect } from "react";
import { ShieldCheck, Bot, MessageCircle, HelpCircle, Bell, X, Menu, LayoutGrid, ChevronRight, AlertTriangle, Info, Siren } from "lucide-react";
import { cn } from "../../utils.jsx";
import { allScenarios } from "../../scenarios.js";
import { MOCK_NOTICES_USER } from "../../data/constants.js";

/* 알림 심각도별 아이콘·색 (팩 notifications[].severity: 'alert'|'warn'|'info') */
const NOTIF_TONE = {
  alert: { icon: Siren,         dot: "bg-rose-500",  chip: "bg-rose-50 text-rose-600 border-rose-200" },
  warn:  { icon: AlertTriangle, dot: "bg-amber-500", chip: "bg-amber-50 text-amber-600 border-amber-200" },
  info:  { icon: Info,          dot: "bg-blue-500",  chip: "bg-blue-50 text-blue-600 border-blue-200" },
};

/* ================================================================== */
/* 중앙 헤더 + 공지 배너 — 현재 탭/모드 타이틀·상태 배지·퀵 버튼        */
/* ================================================================== */
const ChatHeader = ({
  th, isSecure, isAgent, mc, domain,
  sidebarOpen, setSidebarOpen,
  activeAgentId, AGENT_TEAMS,
  setShowQnaModal, setShowTutorial,
  showNoticeBanner, setShowNoticeBanner,
  onExitPortal, notifications = [], onNotifNavigate,
  L = { networkPill: "내부망 전용" },
}) => {
  const ModeIcon = mc.icon;
  // 오케스트레이션 활성 시나리오 — activeAgentId "orchestration:<idx>" (구형 "orchestration"은 0번)
  const isOrch = typeof activeAgentId === "string" && activeAgentId.startsWith("orchestration");
  const orchActive = isOrch ? (allScenarios(domain)[Number(activeAgentId.split(":")[1]) || 0] ?? allScenarios(domain)[0]) : null;

  // 알림 센터 — 팩 notifications 공급 시에만 벨 노출, 읽음 상태는 세션 한정
  const [notifOpen, setNotifOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => new Set());
  const notifRef = useRef(null);
  const unread = notifications.filter(n => !readIds.has(n.id)).length;
  useEffect(() => {
    if (!notifOpen) return;
    const close = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    const esc = (e) => { if (e.key === "Escape") setNotifOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [notifOpen]);
  const handleNotifClick = (n) => {
    setReadIds(prev => new Set(prev).add(n.id));
    if (n.link?.agentId && onNotifNavigate) { onNotifNavigate(n.link.agentId); setNotifOpen(false); }
  };
  return (
    <>
      {/* Header */}
      <header className={cn("h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 z-20 shadow-sm transition-colors", th.header)}>
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {/* 모바일 햄버거 — 사이드바가 오버레이로 숨겨진 상태에서 여는 유일한 진입점 */}
          {setSidebarOpen && (
            <button onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="메뉴 열기"
              className={cn("md:hidden h-10 w-10 shrink-0 rounded-xl border-2 flex items-center justify-center transition-colors", isSecure ? "border-slate-700 bg-[#040814] text-slate-400" : "border-slate-200 bg-white text-slate-500 shadow-sm")}>
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border-2 shadow-sm transition-colors",
            isSecure ? "bg-blue-950/60 text-blue-400 border-blue-900/60" : isAgent ? "bg-indigo-50 text-indigo-600 border-indigo-100" : cn(mc.colors.light, "border-2"))}>
            {isSecure ? <ShieldCheck className="w-5 h-5" /> : isAgent ? <Bot className="w-5 h-5" /> : <ModeIcon className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <h2 className={cn("text-[15px] font-black flex items-center gap-2 leading-tight", th.text)}>
              <span className="truncate">{isSecure ? "보안 채팅" : isAgent ? (isOrch ? (orchActive?.title ?? "복합 업무 오케스트레이션") : activeAgentId ? (AGENT_TEAMS.find(a=>a.id===activeAgentId)?.name ?? "AI 에이전트") : "AI 에이전트 허브") : mc.label}</span>
              <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-black shrink-0",
                isSecure ? "bg-blue-900/60 text-blue-300 border border-blue-800/50" : isAgent ? "bg-indigo-600 text-white" : mc.colors.badge + " text-white")}>
                {isSecure ? "보안 강화" : isAgent ? "에이전트" : "활성"}
              </span>
            </h2>
            {/* 좁은 폭은 1줄 말줄임, 넓은 화면(제안서 캡처 대상)에서는 2줄까지 펼쳐
                에이전트 설명이 문장 중간에서 잘리지 않게 한다 */}
            <p className={cn("text-[12px] font-medium leading-tight truncate xl:whitespace-normal xl:line-clamp-2", th.subtext)}>
              {isSecure ? "무저장 · 로컬 LLM · 망분리 — 강화된 보안 환경에서 처리됩니다" : isAgent ? (isOrch ? (orchActive?.brief ?? "요청 1건이 여러 에이전트를 자동 릴레이합니다") : activeAgentId ? (AGENT_TEAMS.find(a=>a.id===activeAgentId)?.desc ?? "") : `${domain.orgName} 멀티 에이전트 허브`) : mc.desc}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn("hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold", isSecure ? "bg-[#040814] border-blue-900/50 text-blue-400" : "bg-white border-slate-200 text-slate-600 shadow-sm")}>
            <div className={cn("w-2 h-2 rounded-full animate-pulse", isSecure ? "bg-blue-500" : "bg-green-500")}></div>
            <span>{isSecure ? "보안 모드" : L.networkPill}</span>
          </div>
          {/* 알림 센터 — 팩 notifications 공급 시에만 노출 */}
          {notifications.length > 0 && (
            <div className="relative" ref={notifRef}>
              <button onClick={() => setNotifOpen(o => !o)} title="알림" aria-label={`알림 ${unread}건`} aria-expanded={notifOpen}
                className={cn("relative h-10 w-10 rounded-xl border-2 flex items-center justify-center transition-colors", isSecure ? "border-slate-700 bg-[#040814] text-slate-400 hover:bg-[#1e293b]" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-100 shadow-sm")}>
                <Bell className="w-5 h-5" />
                {unread > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white">
                    {unread}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className={cn("absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150",
                  isSecure ? "bg-[#0a0f1c] border-slate-700" : "bg-white border-slate-200")}>
                  <div className={cn("px-4 py-2.5 border-b flex items-center gap-2", isSecure ? "border-slate-800" : "border-slate-100")}>
                    <Bell className={cn("w-3.5 h-3.5", isSecure ? "text-blue-400" : "text-indigo-600")} />
                    <span className={cn("text-[12px] font-black", isSecure ? "text-slate-200" : "text-slate-800")}>알림 센터</span>
                    <span className={cn("ml-auto text-[10px] font-bold", isSecure ? "text-slate-500" : "text-slate-400")}>미확인 {unread}건</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {notifications.map(n => {
                      const tone = NOTIF_TONE[n.severity] || NOTIF_TONE.info;
                      const NIcon = tone.icon;
                      const isRead = readIds.has(n.id);
                      return (
                        <button key={n.id} onClick={() => handleNotifClick(n)}
                          className={cn("w-full flex items-start gap-2.5 px-4 py-3 text-left border-b last:border-b-0 transition-colors",
                            isSecure ? "border-slate-800 hover:bg-slate-800/60" : "border-slate-50 hover:bg-slate-50",
                            isRead && "opacity-55")}>
                          <span className={cn("w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5", tone.chip)}>
                            <NIcon className="w-3.5 h-3.5" />
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="flex items-center gap-1.5">
                              {!isRead && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", tone.dot)} />}
                              <span className={cn("text-[12px] font-black truncate", isSecure ? "text-slate-200" : "text-slate-800")}>{n.title}</span>
                              <span className={cn("ml-auto text-[10px] font-bold shrink-0", isSecure ? "text-slate-500" : "text-slate-400")}>{n.time}</span>
                            </span>
                            <span className={cn("block text-[11px] font-medium leading-snug mt-0.5", isSecure ? "text-slate-400" : "text-slate-500")}>{n.body}</span>
                            {n.link?.agentId && (
                              <span className={cn("inline-flex items-center gap-0.5 text-[10px] font-black mt-1", isSecure ? "text-blue-400" : "text-indigo-600")}>
                                바로 처리하기 <ChevronRight className="w-3 h-3" />
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          {onExitPortal && (
            <button onClick={onExitPortal} title="포털 선택 화면으로" aria-label="포털 선택 화면으로" className={cn("h-10 w-10 rounded-xl border-2 flex items-center justify-center transition-colors", isSecure ? "border-slate-700 bg-[#040814] text-slate-400 hover:bg-[#1e293b]" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-100 shadow-sm")}>
              <LayoutGrid className="w-5 h-5" />
            </button>
          )}
          <button onClick={() => setShowQnaModal(true)} title="자주 묻는 질문" aria-label="자주 묻는 질문" className={cn("h-10 w-10 rounded-xl border-2 flex items-center justify-center transition-colors", isSecure ? "border-slate-700 bg-[#040814] text-slate-400 hover:bg-[#1e293b]" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-100 shadow-sm")}>
            <MessageCircle className="w-5 h-5" />
          </button>
          <button onClick={() => setShowTutorial(true)} title="사용 가이드" aria-label="사용 가이드" className={cn("h-10 w-10 rounded-xl border-2 flex items-center justify-center transition-colors", isSecure ? "border-slate-700 bg-[#040814] text-slate-400 hover:bg-[#1e293b]" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-100 shadow-sm")}>
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Notice Banner */}
      {showNoticeBanner && !isSecure && (
        <div className="shrink-0 h-[44px] bg-gradient-to-r from-blue-50 to-indigo-50/40 border-b border-blue-100 border-l-4 border-l-blue-500 flex items-center gap-2.5 px-5 animate-in slide-in-from-top-1 duration-300">
          <Bell className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="text-[11px] font-black text-blue-700 shrink-0 bg-blue-100 px-1.5 py-0.5 rounded">공지</span>
          <span className="text-[12px] text-blue-700 flex-1 truncate font-medium">{MOCK_NOTICES_USER[0].title}</span>
          <span className="text-[10px] text-blue-400 font-mono shrink-0">{MOCK_NOTICES_USER[0].date}</span>
          <button onClick={() => setShowNoticeBanner(false)} className="shrink-0 w-7 h-7 max-md:w-9 max-md:h-9 flex items-center justify-center rounded-full text-blue-400 hover:text-blue-600 hover:bg-blue-100 transition-colors ml-1">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </>
  );
};

export default ChatHeader;
