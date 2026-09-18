/* ==================================================================
 * 작업지시 닫힌 루프
 *
 * 지금까지 오케스트레이션은 정비지시서·보고서를 '생성'하고 끝났다.
 * 현장 관점에서 그건 절반이다 — 발행한 지시가 실제로 조치됐는지 돌아오지 않으면
 * "그래서 처리됐나?"에 답할 수 없고, 그 순간 시스템은 문서 생성기로 전락한다.
 *
 * 여기서는 발행 → 작업 착수 → 완료 → 검증까지를 상태로 추적한다.
 * 시나리오가 완주하면(docNo가 있으면) 자동으로 발행 상태의 지시가 등록된다.
 *
 * 저장: roadq.workorders.<도메인>
 * ================================================================== */
import { getActiveDomainId } from "../domains/index.js";
import { demoStorage, makeDomainStorageKey } from "../core/demoStorage.js";

const keyOf = (d) => makeDomainStorageKey("workorders", d);
export const WO_CAP = 30;

/* 상태 흐름은 되돌리지 않는다 — 현장 기록은 정정이 아니라 추가로 남겨야 추적이 된다 */
export const WO_FLOW = ["발행", "작업중", "완료", "검증완료"];
export const WO_STYLE = {
  "발행":     { chip: "bg-amber-100 text-amber-700 border-amber-200",     next: "작업 착수" },
  "작업중":   { chip: "bg-blue-100 text-blue-700 border-blue-200",        next: "작업 완료" },
  "완료":     { chip: "bg-violet-100 text-violet-700 border-violet-200",  next: "검증 확인" },
  "검증완료": { chip: "bg-emerald-100 text-emerald-700 border-emerald-200", next: null },
};

export function readOrders(domainId = getActiveDomainId()) {
  const orders = demoStorage.readJson(keyOf(domainId), []);
  return Array.isArray(orders) ? orders : [];
}

function write(list, domainId) {
  return demoStorage.writeJson(keyOf(domainId), list.slice(0, WO_CAP));
}

/* 시나리오 완주 시 호출 — 같은 문서번호가 이미 있으면 중복 등록하지 않는다
   (StrictMode 이중 호출·재실행으로 지시가 불어나는 걸 막는다) */
export function registerOrder({ docNo, title, source, owner, due }, domainId = getActiveDomainId()) {
  if (!docNo) return null;
  const list = readOrders(domainId);
  if (list.some(o => o.docNo === docNo)) return null;
  const order = {
    id: `wo-${Date.now()}`,
    docNo, title: title || "자동 발행 작업지시",
    source: source || "자동화 시나리오",
    owner: owner || "", due: due || "",
    status: "발행",
    history: [{ status: "발행", at: nowStamp(), by: "AI 자동 발행" }],
  };
  write([order, ...list], domainId);
  return order;
}

/* 팩이 준 시드로 초기 목록을 채운다 — 데모 첫 진입에도 진행 중 지시가 보이게.
   이미 저장된 게 있으면 건드리지 않는다. */
export function seedOrders(domain) {
  const seed = domain?.workOrderSeed;
  if (!seed?.length) return readOrders(domain.id);
  const list = readOrders(domain.id);
  if (list.length) return list;
  const seeded = seed.map((o, i) => ({
    id: `wo-seed-${i}`,
    ...o,
    history: o.history || [{ status: o.status, at: o.updatedAt || "", by: o.owner || "" }],
  }));
  write(seeded, domain.id);
  return seeded;
}

export function advanceOrder(id, by = "", domainId = getActiveDomainId()) {
  const list = readOrders(domainId);
  const next = list.map(o => {
    if (o.id !== id) return o;
    const i = WO_FLOW.indexOf(o.status);
    if (i < 0 || i >= WO_FLOW.length - 1) return o;
    const status = WO_FLOW[i + 1];
    return { ...o, status, history: [...(o.history || []), { status, at: nowStamp(), by: by || "담당자" }] };
  });
  write(next, domainId);
  return next;
}

export function clearOrders(domainId = getActiveDomainId()) {
  return demoStorage.remove(keyOf(domainId));
}

function nowStamp() {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}

/* 카드 요약 — 미완료(검증완료 아님) 건수와 가장 급한 건 */
export function summarize(list) {
  const open = list.filter(o => o.status !== "검증완료");
  return { total: list.length, open: open.length, head: open[0] || null };
}
