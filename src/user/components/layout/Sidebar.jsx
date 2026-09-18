import React, { useState } from "react";
import {
  MessageSquare, Bot, Shield, Plus, PanelLeftClose, PanelLeftOpen, LineChart,
  EyeOff, Server, ShieldCheck, Lock, History, Star, Bell, HelpCircle,
  User, ChevronDown, Settings,
} from "lucide-react";
import { cn } from "../../utils.jsx";

/* OCUBE 심볼 — 브랜드 철학 'OPEN + CUBE'를 아이소메트릭 큐브로.
   윗면·왼면은 채우고 오른면만 선으로 비워 '열린 큐브'를 만든다.
   RoadQ의 Q는 우하단 점으로 암시. 색은 도메인 브랜드컬러를 따른다. */
const OcubeMark = ({ color }) => (
  <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-md"
    style={{ backgroundColor: color }}>
    <svg viewBox="0 0 32 32" fill="none" className="w-[26px] h-[26px]" aria-hidden="true">
      <path d="M16 4.2 L26.6 10.3 L16 16.4 L5.4 10.3 Z" fill="white" />
      <path d="M5.4 10.3 L16 16.4 L16 28.2 L5.4 22.1 Z" fill="white" opacity="0.62" />
      <path d="M26.6 10.3 L26.6 22.1 L16 28.2 L16 16.4 Z"
        stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none" opacity="0.85" />
      <circle cx="23.2" cy="21.4" r="2.1" fill="white" />
    </svg>
  </span>
);

/* ================================================================== */
/* 좌측 사이드바 — 로고·탭 스위처·워크스페이스·모드·대화 이력·프로필    */
/* ================================================================== */
const Sidebar = ({
  domain, th, isSecure, isAgent, chatTab,
  sidebarOpen, setSidebarOpen,
  onTabSwitch, onNewChat,
  WORKSPACES, activeWorkspace, onWorkspaceSwitch,
  MODES, mode, setMode,
  AGENT_TEAMS, activeAgentId, setActiveAgentId,
  HISTORY, onLoadHistory, USER_INFO,
  showUserMenu, setShowUserMenu, userMenuRef,
  setShowNoticeBanner, setShowQnaModal,
  onSwitchToAdmin, onOpenTutorial, onOpenSettings,
  L = { tabGeneral: "일반", tabAgent: "에이전트", tabSecure: "보안", newChat: "새 대화", recent: "최근 대화" },
}) => {
  // 최근 대화 목록 접기/펼치기 (헤더의 이력 아이콘)
  const [historyOpen, setHistoryOpen] = useState(true);
  return (
  <aside
    aria-label="사이드바 내비게이션"
    className={cn(
      "shrink-0 flex flex-col transition-all duration-300 z-30",
      th.sidebar,
      sidebarOpen ? "w-[272px]" : "w-[68px]",
      // 모바일(<768): 오버레이 — 열림 시 화면 위에 겹치고, 닫힘 시 완전히 숨김(헤더 햄버거로 열기)
      "max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:shadow-2xl md:relative",
      !sidebarOpen && "max-md:hidden"
    )}>
    {/* toggle (데스크톱 전용 — 모바일은 헤더 햄버거 사용) */}
    <button onClick={() => setSidebarOpen(!sidebarOpen)}
      aria-label={sidebarOpen ? "사이드바 접기" : "사이드바 펼치기"}
      className={cn("max-md:hidden absolute -right-3.5 top-[72px] w-7 h-7 rounded-full flex items-center justify-center shadow-md z-40 text-slate-400 hover:text-slate-700 transition-colors border", isSecure ? "bg-[#0a0f1c] border-slate-700 hover:text-blue-400" : "bg-white border-slate-200")}>
      {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
    </button>

    {/* Logo — OCUBE의 RoadQ. 클릭 시 홈(일반 질의)으로 */}
    <button onClick={() => onTabSwitch("GENERAL")} aria-label="RoadQ 홈으로"
      className={cn("h-16 w-full flex items-center px-4 border-b shrink-0 text-left transition-colors",
        th.sidebarSection, isSecure ? "hover:bg-white/5" : "hover:bg-slate-100/70")}>
      <OcubeMark color={domain.brandColor} />
      {sidebarOpen && (
        <div className="ml-2.5 animate-in fade-in duration-200 min-w-0">
          {/* 회사(OCUBE) 위, 제품(RoadQ) 아래 — 'OCUBE의 RoadQ' 위계.
              옆의 분야명이 지금 시연 중인 적용 영역을 가리킨다. */}
          <div className={cn("text-[9px] font-black tracking-[0.22em] leading-none mb-1",
            isSecure ? "text-slate-500" : "text-slate-400")}>OCUBE</div>
          <div className="flex items-baseline gap-1.5">
            <span className={cn("text-[19px] font-black tracking-[0.01em] leading-none", isSecure && "text-white")}
              style={isSecure ? undefined : { color: domain.brandColor }}>RoadQ</span>
            <span className={cn("text-[12px] font-bold tracking-tight leading-none truncate", th.subtext)}>
              {isSecure ? "보안" : isAgent ? "에이전트" : (domain.sectorLabel || domain.orgName)}
            </span>
          </div>
        </div>
      )}
    </button>

    {/* Tab Switcher */}
    <div className={cn("px-3 py-3 border-b shrink-0", th.sidebarSection)}>
      {sidebarOpen ? (
        <div className={cn("p-1 rounded-xl flex gap-1", isSecure ? "bg-[#040814] border border-slate-800" : "bg-slate-200/60 border border-slate-200/80")}>
          {[{id:"GENERAL",label:L.tabGeneral,Icon:MessageSquare},{id:"AGENT",label:L.tabAgent,Icon:Bot},...(domain.timeSeries?[{id:"DATA",label:L.tabData||"데이터",Icon:LineChart}]:[]),{id:"SECURE",label:L.tabSecure,Icon:Shield}].map(({id,label,Icon})=>(
            <button key={id} onClick={()=>onTabSwitch(id)} className={cn("flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-bold rounded-lg transition-all",
              chatTab===id?(id==="GENERAL"?"bg-white text-blue-700 shadow-sm":id==="AGENT"?"bg-indigo-600 text-white shadow-sm":id==="DATA"?"bg-white text-blue-700 shadow-sm":"bg-[#0a0f1c] text-blue-400 border border-blue-800/50"):(isSecure?"text-slate-500 hover:text-slate-300":"text-slate-500 hover:text-slate-700 hover:bg-white/50"))}>
              <Icon className="w-3.5 h-3.5"/>{label}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 items-center">
          {[{id:"GENERAL",Icon:MessageSquare},{id:"AGENT",Icon:Bot},...(domain.timeSeries?[{id:"DATA",Icon:LineChart}]:[]),{id:"SECURE",Icon:Shield}].map(({id,Icon})=>(
            <button key={id} onClick={()=>onTabSwitch(id)} title={id} className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all",
              chatTab===id?(id==="GENERAL"?"bg-white text-blue-600 shadow-sm border border-slate-200":id==="AGENT"?"bg-indigo-600 text-white shadow-sm":id==="DATA"?"bg-white text-blue-600 shadow-sm border border-slate-200":"bg-[#0a0f1c] text-blue-400 border border-blue-800/50"):(isSecure?"text-slate-500 hover:bg-slate-800":"text-slate-400 hover:bg-white/70"))}>
              <Icon className="w-5 h-5"/>
            </button>
          ))}
        </div>
      )}
    </div>
    {/* New Chat */}
    <div className={cn("px-3 pt-3 pb-2 shrink-0", !sidebarOpen && "flex justify-center px-0 py-3")}>
      {sidebarOpen ? (
        <button onClick={onNewChat} className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-[#00539F] text-white font-bold text-[13px] hover:bg-[#002571] transition-colors shadow-md tracking-tight">
          <Plus className="w-3.5 h-3.5" /> {L.newChat}
        </button>
      ) : (
        <button onClick={onNewChat} aria-label="새 대화 시작" className="w-10 h-10 rounded-xl bg-[#00539F] text-white flex items-center justify-center hover:bg-[#002571] transition-colors shadow-md">
          <Plus className="w-5 h-5" />
        </button>
      )}
    </div>

    {/* ── 작업공간 스위처 / 보안 세션 카드 ─── */}
    <div className={cn("px-3 pb-3 border-b shrink-0", th.sidebarSection)}>
      {isSecure ? (
        sidebarOpen ? (
          /* 보안 채팅 전용 — 독립 세션 안내 */
          <div className="space-y-2">
            <div className={cn("text-[10px] font-black uppercase tracking-wider mb-2 px-1", th.sidebarLabel)}>세션 정보</div>
            <div className="bg-[#040814] border border-slate-800 rounded-xl px-3 py-3 space-y-2">
              {[
                { Icon: EyeOff,     label: "대화 기록",   value: "저장 안 됨" },
                { Icon: Server,     label: "처리 환경",   value: "로컬 LLM" },
                { Icon: ShieldCheck,label: "작업공간",    value: "독립 세션" },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Icon className="w-3 h-3 shrink-0" />
                    <span>{label}</span>
                  </div>
                  <span className="font-bold text-blue-400/80">{value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* 접힌 상태 — 보안 아이콘만 */
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-xl bg-[#040814] border border-slate-800 flex items-center justify-center">
              <Lock className="w-4 h-4 text-blue-500/70" />
            </div>
          </div>
        )
      ) : (
        /* 일반/에이전트 탭 — 기존 워크스페이스 스위처 */
        <>
          {sidebarOpen && <div className={cn("text-[10px] font-black uppercase tracking-wider mb-2 px-1", th.sidebarLabel)}>지식 영역 · WorkSpace</div>}
          <div className={cn("space-y-0.5", !sidebarOpen && "flex flex-col items-center gap-1")}>
            {WORKSPACES.map(ws => {
              const WsIcon = ws.icon;
              const isActive = activeWorkspace === ws.id;
              return (
                <button
                  key={ws.id}
                  onClick={() => onWorkspaceSwitch(ws.id)}
                  title={!sidebarOpen ? ws.name : undefined}
                  className={cn(
                    "rounded-xl flex items-center gap-2.5 font-semibold text-[13px] transition-all",
                    sidebarOpen ? "w-full px-3 py-2" : "w-10 h-10 justify-center",
                    isActive
                      ? "bg-white text-blue-700 shadow-sm border border-slate-200/80"
                      : "text-slate-500 hover:bg-white/60"
                  )}
                >
                  <WsIcon className="w-4 h-4 shrink-0" />
                  {sidebarOpen && <span className="truncate">{ws.name}</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>

    {/* Mode Selector — GENERAL 탭만 표시 */}
    {chatTab === "GENERAL" && (
      <div className={cn("px-3 pt-3 pb-3 border-b shrink-0", th.sidebarSection, !sidebarOpen && "flex flex-col items-center gap-1.5 px-0 pb-3")}>
        {sidebarOpen && <div className={cn("text-[10px] font-black uppercase tracking-wider mb-2 px-1", th.sidebarLabel)}>업무 모드</div>}
        <div className={cn("space-y-0.5", !sidebarOpen && "space-y-1.5")}>
          {Object.values(MODES).map(m => {
            const Icon = m.icon;
            return (
              <button key={m.id} onClick={() => setMode(m.id)}
                title={!sidebarOpen ? m.label : undefined}
                className={cn("transition-all rounded-xl flex items-center gap-3 font-semibold text-[13px]",
                  sidebarOpen ? "w-full px-3 py-2.5" : "w-10 h-10 justify-center",
                  mode === m.id
                    ? (isSecure ? cn(m.colors.active, "shadow-sm") : "bg-white text-slate-900 shadow-sm border border-slate-200/80")
                    : (isSecure ? "text-slate-400 hover:bg-slate-800/50" : "text-slate-500 hover:bg-white/60"))}>
                <Icon className={cn("w-4 h-4 shrink-0", mode === m.id && !isSecure ? m.colors.text : "")} />
                {sidebarOpen && <span>{m.label}</span>}
              </button>
            );
          })}
        </div>
      </div>
    )}

    {/* Conversation History / Agent Info */}
    <div className="flex-1 overflow-y-auto py-3 custom-scrollbar">
      {isSecure ? (
        sidebarOpen ? (
          <div className="flex flex-col items-center text-center px-5 mt-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#040814] border-2 border-blue-900/60 flex items-center justify-center shadow-lg relative">
              <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-pulse"/>
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-[12px] font-black text-blue-400">보안 채팅 모드</div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">대화 내용 무저장<br />로컬 LLM 전용</p>
          </div>
        ) : <ShieldCheck className="w-5 h-5 text-blue-500 mt-4 mx-auto" />
      ) : isAgent ? (
        sidebarOpen ? (
          <div className="px-3 mt-2 space-y-0.5">
            <div className={cn("px-1 mb-2 text-[10px] font-black uppercase tracking-wider", th.sidebarLabel)}>AI 에이전트</div>
            <button onClick={() => setActiveAgentId(null)}
              className={cn("w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all",
                activeAgentId === null ? "bg-white text-indigo-700 shadow-sm border border-slate-200/80" : "text-slate-500 hover:bg-white/60")}>
              <Bot className="w-4 h-4 shrink-0" />
              <span className="truncate">전체 허브</span>
              {activeAgentId === null && <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse ml-auto" />}
            </button>
            {AGENT_TEAMS.map(ag => {
              const AgIcon = ag.icon;
              return (
                <button key={ag.id} onClick={() => setActiveAgentId(ag.id)} className={cn("w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all",
                  activeAgentId === ag.id ? "bg-white text-indigo-700 shadow-sm border border-slate-200/80" : "text-slate-500 hover:bg-white/60")}>
                  <AgIcon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{ag.shortName}</span>
                  {activeAgentId === ag.id && <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse ml-auto" />}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 items-center py-2">
            <button onClick={() => setActiveAgentId(null)} title="허브"
              className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                activeAgentId === null ? "bg-indigo-100 text-indigo-600 border border-indigo-200" : "text-slate-400 hover:bg-white/70")}>
              <Bot className="w-5 h-5" />
            </button>
            {AGENT_TEAMS.map(ag => {
              const AgIcon = ag.icon;
              return (
                <button key={ag.id} onClick={() => setActiveAgentId(ag.id)} title={ag.shortName}
                  className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    activeAgentId === ag.id ? "bg-indigo-100 text-indigo-600 border border-indigo-200" : "text-slate-400 hover:bg-white/70")}>
                  <AgIcon className="w-5 h-5" />
                </button>
              );
            })}
          </div>
        )
      ) : (
        sidebarOpen ? (
          <div className="px-2 space-y-0.5">
            <div className={cn("px-3 mb-2 flex items-center justify-between", th.sidebarLabel)}>
              <span className="text-[10px] font-black uppercase tracking-wider">{L.recent}</span>
              <button aria-label={historyOpen ? "최근 대화 접기" : "최근 대화 펼치기"} aria-expanded={historyOpen}
                onClick={() => setHistoryOpen(v => !v)}
                className={cn("p-1 rounded-lg hover:bg-white/70 transition-colors", !historyOpen && "opacity-50")}><History className="w-3.5 h-3.5" /></button>
            </div>
            {historyOpen && (<>
            <div className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">오늘</div>
            {HISTORY.filter(h => h.isToday).map(h => {
              const HIcon = MODES[h.mode]?.icon || MessageSquare;
              return (
                <button key={h.id} onClick={() => onLoadHistory && onLoadHistory(h)}
                  aria-label={`대화 불러오기: ${h.title}`}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-slate-600 hover:bg-white/70 transition-colors text-left group">
                  <HIcon className={cn("w-4 h-4 shrink-0", MODES[h.mode]?.colors?.text)} />
                  <span className="flex-1 truncate font-medium">{h.title}</span>
                  <span className="text-[10px] text-slate-400 shrink-0">{h.time}</span>
                  {h.starred && <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />}
                </button>
              );
            })}
            <div className="px-3 py-1 mt-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">이전 대화</div>
            {HISTORY.filter(h => !h.isToday).map(h => {
              const HIcon = MODES[h.mode]?.icon || MessageSquare;
              return (
                <button key={h.id} onClick={() => onLoadHistory && onLoadHistory(h)}
                  aria-label={`대화 불러오기: ${h.title}`}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-slate-500 hover:bg-white/70 transition-colors text-left group">
                  <HIcon className={cn("w-4 h-4 shrink-0 opacity-60", MODES[h.mode]?.colors?.text)} />
                  <span className="flex-1 truncate font-medium">{h.title}</span>
                  <span className="text-[10px] text-slate-400 shrink-0">{h.time}</span>
                  {h.starred && <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />}
                </button>
              );
            })}
            </>)}
          </div>
        ) : null
      )}
    </div>

    {/* Sidebar Bottom: 공지/FAQ + User Profile */}
    <div className={cn("border-t shrink-0", isSecure ? "border-slate-800/60 bg-[#0a0f1c]" : "border-slate-200/70 bg-[#F2F5FB]")} ref={userMenuRef}>
      {/* Quick Links */}
      {sidebarOpen && (
        <div className="flex gap-2 px-3 pt-3 pb-1">
          <button
            onClick={() => setShowNoticeBanner(true)}
            className={cn("flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors", isSecure ? "text-slate-400 hover:bg-[#1e293b] hover:text-slate-200" : "text-slate-500 bg-white/60 hover:bg-white hover:text-slate-700 border border-slate-200/80")}>
            <Bell className="w-3 h-3 shrink-0" />
            <span>공지사항</span>
          </button>
          <button
            onClick={() => setShowQnaModal(true)}
            className={cn("flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors", isSecure ? "text-slate-400 hover:bg-[#1e293b] hover:text-slate-200" : "text-slate-500 bg-white/60 hover:bg-white hover:text-slate-700 border border-slate-200/80")}>
            <HelpCircle className="w-3 h-3 shrink-0" />
            <span>FAQ</span>
          </button>
        </div>
      )}
      {/* User Profile */}
      <div className="p-3 relative">
        <button onClick={() => setShowUserMenu(!showUserMenu)} className={cn("w-full flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors border", isSecure ? "bg-[#040814] border-slate-800 hover:bg-[#1e293b]" : "bg-white border-slate-200/80 hover:border-slate-300 shadow-sm", !sidebarOpen && "justify-center")}>
          <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2", isSecure ? "bg-[#0a0f1c] border-slate-700 text-slate-400" : "bg-[#00539F] border-[#002571] text-white")}>
            <User className="w-4 h-4" />
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0 text-left animate-in fade-in">
              <div className={cn("text-[13px] font-bold truncate flex items-center gap-1.5", th.text)}>
                {USER_INFO.name} {USER_INFO.title}
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-black tracking-wide shrink-0">SSO</span>
              </div>
              <div className={cn("text-[11px] truncate", isSecure ? "text-blue-500/80" : "text-slate-500")}>{isSecure ? "보안 채팅 진행 중" : USER_INFO.dept}</div>
            </div>
          )}
          {sidebarOpen && <ChevronDown className={cn("w-4 h-4 shrink-0", th.subtext)} />}
        </button>
        {showUserMenu && sidebarOpen && (
          <div className={cn("absolute bottom-full left-0 right-0 mb-2 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 border", isSecure ? "bg-[#0a0f1c] border-slate-700" : "bg-white border-slate-200")}>
            <div className={cn("px-4 py-3 border-b", isSecure ? "border-slate-800" : "border-slate-100")}>
              <div className={cn("text-[13px] font-bold", th.text)}>{USER_INFO.name} {USER_INFO.title}</div>
              <div className={cn("text-[11px] mt-0.5", th.subtext)}>{USER_INFO.dept} · 일반 사용자</div>
            </div>
            <div className="py-1">
              {[
                { icon: Settings, label: "환경설정", onClick: onOpenSettings },
                { icon: HelpCircle, label: "도움말 & 사용 가이드", onClick: onOpenTutorial },
              ].map((item, i) => (
                <button key={i} onClick={() => { setShowUserMenu(false); item.onClick?.(); }}
                  className={cn("w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors", isSecure ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-50")}>
                  <item.icon className="w-4 h-4 text-slate-400" /> {item.label}
                </button>
              ))}
              {onSwitchToAdmin && (
                <button onClick={() => { setShowUserMenu(false); onSwitchToAdmin(); }} className={cn("w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium border-t transition-colors mt-1", isSecure ? "text-blue-400 hover:bg-slate-800 border-slate-700" : "text-indigo-700 hover:bg-indigo-50 border-slate-100")}>
                  <Shield className="w-4 h-4 text-indigo-500" /> 관리자 시스템 (RoadQ)
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  </aside>
  );
};

export default Sidebar;
