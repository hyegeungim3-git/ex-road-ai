import React from "react";
import { Network, Boxes, Wrench, Database, Server, X } from "lucide-react";
import { cn } from "../../utils.jsx";
import { MCP_TOOLS } from "../../data/constants.js";

/* 에이전트 빌더(내부 로직) 모달 — 파이프라인 노드 + 연동 도구 (읽기 전용)
   builderTab은 닫아도 유지되는 기존 동작을 보존하기 위해 부모 상태를 그대로 받음 */
const AgentBuilderModal = ({ selectedAgent, builderTab, setBuilderTab, selectedNode, setSelectedNode, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
    <div className="w-full max-w-6xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 bg-slate-50 border-slate-200">
      {/* Header */}
      <div className="h-20 border-b border-slate-200 flex items-center justify-between px-8 shrink-0 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-indigo-600">
            {React.createElement(selectedAgent.icon, { className: "w-6 h-6" })}
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">{selectedAgent.name} 내부 로직 (읽기 전용)</h3>
            <p className="text-[13px] font-medium text-slate-500 mt-0.5">관리자가 사전 구성한 에이전트 내부 동작 단계입니다.</p>
          </div>
        </div>
        <button onClick={onClose} aria-label="닫기" className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 border border-slate-200 transition-colors"><X className="w-6 h-6" /></button>
      </div>
      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left nav */}
        <div className="w-60 border-r border-slate-200 p-5 shrink-0 flex flex-col gap-2 bg-white">
          {[{id:"WORKFLOW",label:"에이전트 파이프라인",Icon:Network},{id:"TOOLS",label:"연동 가능 사내 도구",Icon:Boxes}].map(({id,label,Icon})=>(
            <button key={id} onClick={()=>setBuilderTab(id)} className={cn("w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[13px] font-bold transition-all text-left border-2",
              builderTab===id?"bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm":"border-transparent text-slate-500 hover:bg-slate-50")}>
              <Icon className="w-5 h-5"/>{label}
            </button>
          ))}
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-slate-50">
          {builderTab === "WORKFLOW" ? (
            <div className="max-w-5xl mx-auto animate-in fade-in">
              <h4 className="text-2xl font-black text-slate-800 mb-8">내부 처리 단계 (프롬프트 체인)</h4>
              <div className="flex gap-8">
                <div className="flex-1 rounded-3xl border-2 border-slate-200 p-10 shadow-sm bg-white">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {selectedAgent.workflow.map((node, i) => (
                      <div key={i} onClick={() => setSelectedNode(selectedNode === node ? null : node)}
                        className={cn("rounded-2xl border-2 shadow-md p-6 flex flex-col gap-4 relative cursor-pointer transition-all hover:-translate-y-1",
                          selectedNode === node ? "border-indigo-500 ring-4 ring-indigo-100 bg-white" : "border-slate-200 bg-white hover:border-indigo-300")}>
                        <span className="text-[11px] font-black px-3 py-1.5 rounded-lg w-fit bg-slate-100 text-indigo-600">{node.step}단계</span>
                        <div>
                          <div className="text-[13px] font-bold text-indigo-600 mb-1">{node.role}</div>
                          <div className="text-lg font-black text-slate-800">{node.name}</div>
                        </div>
                        <div className="text-[13px] p-3.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-600 leading-relaxed line-clamp-3 font-medium">{node.prompt}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {selectedNode && (
                  <div className="w-[340px] shrink-0 rounded-3xl border-2 border-slate-200 shadow-xl p-6 flex flex-col bg-white animate-in slide-in-from-right-8">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                      <h5 className="text-lg font-black text-slate-800">세부 단계 정보</h5>
                      <button onClick={() => setSelectedNode(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5 text-slate-400" /></button>
                    </div>
                    <div className="space-y-5">
                      {[["하위 에이전트 역할", selectedNode.name], ["사전 지시어 (시스템 프롬프트)", selectedNode.prompt], ["호출하는 사내 시스템 연동 (MCP)", selectedNode.tool]].map(([label, val], ii) => (
                        <div key={ii}>
                          <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400 block mb-2">{label}</span>
                          <div className={cn("w-full border-2 rounded-xl p-3.5 text-[13px] font-medium whitespace-pre-wrap leading-relaxed",
                            ii===2 ? "bg-indigo-50 border-indigo-100 text-indigo-700" : "bg-slate-50 border-slate-200 text-slate-700")}>
                            {ii===2 && <Wrench className="w-4 h-4 inline mr-2 mb-0.5"/>}{val}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto animate-in fade-in">
              <h4 className="text-2xl font-black text-slate-800 mb-2">연동 가능한 사내 보안 도구</h4>
              <p className="text-[15px] font-medium text-slate-500 mb-8">관리자가 인가한 사내 시스템 연동(MCP) 목록입니다.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MCP_TOOLS.map(tool => (
                  <div key={tool.id} className="p-6 rounded-3xl border-2 border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 border-2 border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        {tool.type === "벡터 DB" ? <Database className="w-6 h-6"/> : <Server className="w-6 h-6"/>}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1.5">
                          <h4 className="font-black text-lg text-slate-800">{tool.name}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-bold border bg-indigo-50 text-indigo-700 border-indigo-200">{tool.type}</span>
                        </div>
                        <p className="text-[14px] font-medium text-slate-500">{tool.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Footer */}
      <div className="h-14 border-t border-slate-200 flex items-center justify-between px-8 shrink-0 bg-white">
        <p className="text-[12px] text-slate-400 font-medium">관리자가 사전에 구성한 에이전트 파이프라인입니다 (읽기 전용)</p>
        <button onClick={onClose} className="px-5 py-2 rounded-xl font-bold text-[13px] text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md">확인</button>
      </div>
    </div>
  </div>
);

export default AgentBuilderModal;
