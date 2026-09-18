/* ==================================================================
 * 교대 인수인계 (Shift Handover)
 *
 * 3교대 현장에서 사고·품질 이슈가 가장 많이 새는 지점이 교대 인수인계다.
 * 이 모듈은 '그 조가 실제로 겪은 일'을 재료로 인수인계 초안을 만든다.
 *   재료 ① 이번 세션의 감사 로그(roadq.audit.*) — 실제 질의·알람·시나리오 완주
 *   재료 ② 팩 notifications — 그 조에 걸린 미처리 건
 *   재료 ③ 팩 shiftHandover.draftSeed — 데모가 만들 수 없는 현장 사실(설비 조치 등)
 * ①이 비어 있어도 ②③으로 초안이 서고, ①이 쌓이면 실제 활동이 섞인다.
 *
 * 스키마(팩 shiftHandover) — 전부 선택. 팩이 생략하면 카드 자체가 비노출:
 *   shifts:    [{ id, label, time }]           교대조 정의(2교대·3교대 자유)
 *   currentId: string                          현재 조 id (데모 고정값)
 *   previous:  { shiftId, author, time, items:[{type,text}] }  직전 조가 넘긴 내용
 *   draftSeed: { alarms[], actions[], pending[], quality[] }   초안 재료(문자열 배열)
 *   note:      string                          하단 안내(실서비스 대체 지점)
 *
 * 저장: roadq.handover.<도메인> — 확정된 인수계 노트(최근 것이 앞)
 * ================================================================== */
import { getActiveDomainId } from "../domains/index.js";
import { readAudit } from "./auditLog.js";
import { demoStorage, makeDomainStorageKey } from "../core/demoStorage.js";

const keyOf = (d) => makeDomainStorageKey("handover", d);
export const HANDOVER_CAP = 20;

/* 항목 유형 — 인수인계 노트의 분류. 순서가 곧 표시 순서(중요도 순).
   type 4종은 구조라 고정이지만, 라벨은 업무 성격에 따라 달라진다
   (제조는 '설비 이상·알람'이 맞지만 행정 상황실은 '상황 발생'이 맞다).
   그래서 코어 기본값은 중립으로 두고 팩이 shiftHandover.itemLabels로 덮는다. */
export const ITEM_TYPES = [
  { type: "alarm",   label: "이상·경보",        tone: "rose" },
  { type: "action",  label: "조치 완료",        tone: "emerald" },
  { type: "pending", label: "인계 사항(미결)",  tone: "amber" },
  { type: "quality", label: "특이사항",         tone: "blue" },
];

/* 팩 라벨을 얹은 항목 유형 — 화면·텍스트 출력은 전부 이걸 쓴다.
   itemLabels 미제공 시 코어 중립 라벨 그대로(기존 동작 유지). */
export function itemTypes(domain) {
  const over = domain?.shiftHandover?.itemLabels;
  if (!over) return ITEM_TYPES;
  return ITEM_TYPES.map(t => (over[t.type] ? { ...t, label: over[t.type] } : t));
}

export function readHandovers(domainId = getActiveDomainId()) {
  const handovers = demoStorage.readJson(keyOf(domainId), []);
  return Array.isArray(handovers) ? handovers : [];
}

export function saveHandover(note, domainId = getActiveDomainId()) {
  const arr = readHandovers(domainId);
  arr.unshift({ id: `ho-${Date.now()}`, savedAt: new Date().toISOString().slice(0, 16).replace("T", " "), ...note });
  return demoStorage.writeJson(keyOf(domainId), arr.slice(0, HANDOVER_CAP));
}

export function clearHandovers(domainId = getActiveDomainId()) {
  return demoStorage.remove(keyOf(domainId));
}

/* 감사 로그를 인수인계 항목으로 옮긴다 — '이번 조에 이런 일이 있었다'의 실제 근거.
   SECURE 세션은 애초에 로그를 남기지 않으므로 여기서도 자연히 빠진다. */
function fromAudit(events) {
  // 필드명은 auditLog 호출부(UserApp·OrchestrationScenario)의 실제 형태를 따른다:
  //   { type, summary, confidence?, docNo?, hitl?: string[], ts }
  const out = { alarm: [], action: [], pending: [], quality: [] };
  for (const e of events) {
    const at = e.ts ? e.ts.slice(11, 16) : "";
    if (e.type === "live_alert" && e.summary) {
      out.alarm.push(`${e.summary}${at ? ` (감지 ${at})` : ""}`);
    } else if (e.type === "orch_complete") {
      const doc = e.docNo ? ` — ${e.docNo}` : "";
      out.action.push(`자동화 시나리오 완주: ${e.summary || "복합 업무"}${doc}`);
      (e.hitl || []).forEach(h => out.pending.push(`사람 확인 지점: ${h}`));
    } else if (e.type === "query" && typeof e.confidence === "number" && e.confidence < 75) {
      out.pending.push(`저신뢰 답변 재확인 필요: "${(e.summary || "").slice(0, 40)}" (신뢰도 ${e.confidence})`);
    }
  }
  return out;
}

/* 인수인계 초안 생성 — 실제 활동(감사 로그) + 팩이 준 현장 사실을 합친다.
   중복은 제거하고 유형별 상한을 둬 노트가 장황해지지 않게 한다. */
export function buildDraft(domain, { notifications = [], max = 4 } = {}) {
  const cfg = domain?.shiftHandover;
  if (!cfg) return null;

  const seed = cfg.draftSeed || {};
  const live = fromAudit(readAudit(domain.id));

  const merge = (a = [], b = []) => [...new Set([...a, ...b])].slice(0, max);
  const items = [];
  const push = (type, list) => list.forEach(text => items.push({ type, text }));

  push("alarm", merge(live.alarm, seed.alarms));
  push("action", merge(live.action, seed.actions));
  /* 알림 전부를 옮기면 '오늘의 업무 브리핑'을 그대로 복사한 꼴이 되어 노트가 장황해진다.
     교대로 넘길 가치가 있는 건 미해결 경보(alert)뿐이므로 그것만 2건까지 가져온다. */
  const notiPending = notifications
    .filter(n => n.severity === "alert")
    .slice(0, 2)
    .map(n => `미해결 경보: ${n.title} — ${n.body}`.slice(0, 100));
  push("pending", merge(live.pending, [...(seed.pending || []), ...notiPending]));
  push("quality", merge([], seed.quality));

  const shift = (cfg.shifts || []).find(s => s.id === cfg.currentId) || (cfg.shifts || [])[0] || null;
  return {
    shiftId: shift?.id || "",
    shiftLabel: shift?.label || "현재 조",
    shiftTime: shift?.time || "",
    items,
    fromAuditCount: live.alarm.length + live.action.length + live.pending.length,
  };
}

/* 직전 조가 넘긴 인수인계 — 저장된 것이 있으면 그걸, 없으면 팩 시드를 쓴다.
   (데모 첫 진입에도 '받은 인수인계'가 보이게 하려는 것) */
export function readIncoming(domain) {
  const cfg = domain?.shiftHandover;
  if (!cfg) return null;
  const saved = readHandovers(domain.id)[0];
  if (saved) return { ...saved, source: "saved" };
  if (cfg.previous) {
    const s = (cfg.shifts || []).find(x => x.id === cfg.previous.shiftId);
    return { ...cfg.previous, shiftLabel: s?.label || cfg.previous.shiftId, source: "seed" };
  }
  return null;
}

/* 인수인계 노트를 텍스트로 — 내려받기·복사·인쇄 공용 */
export function handoverToText(note, orgName = "", domain = null) {
  const TYPES = itemTypes(domain);
  const head = [
    `${orgName ? orgName + " " : ""}교대 인수인계`,
    `작성 조: ${note.shiftLabel}${note.shiftTime ? ` (${note.shiftTime})` : ""}`,
    note.author ? `작성자: ${note.author}` : "",
    note.savedAt ? `작성 시각: ${note.savedAt}` : "",
    "",
  ].filter(Boolean);
  const body = TYPES.flatMap(({ type, label }) => {
    const list = (note.items || []).filter(i => i.type === type);
    return list.length ? [`[${label}]`, ...list.map(i => `- ${i.text}`), ""] : [];
  });
  return [...head, ...body].join("\n");
}
