/**
 * userclick.mjs — 사용자 포털 버튼 클릭 스윕
 *
 * adminscan의 클릭 스윕이 관리자만 보고 있어서, 발주처가 실제로 보는 화면인
 * 사용자 포털은 그대로 사각지대였다. 같은 유형(핸들러는 있는데 내용이 죽은 버튼,
 * 누르면 화면이 통째로 사라지는 크래시)을 사용자 포털에서도 잡는다.
 *
 * 훑는 화면: 3탭(일반·에이전트 허브·보안) + 에이전트 13종 + 오케스트레이션 시나리오
 *
 * 쓰는 법:
 *   node .claude/skills/roadq-verify/scripts/userclick.mjs [baseUrl] [domainId]
 *   도메인 생략 시 expressway. 크래시는 대개 코드 결함이라 한 도메인이면 충분하지만,
 *   팩 콘텐츠를 크게 바꿨다면 그 도메인을 넘겨 따로 돌릴 것.
 *
 * 종료 코드: 0 = 이상 없음, 1 = 이상 있음, 2 = 실행 불가
 *
 * ⚠️ 스윕은 버튼을 '눌러도 터지지 않는가'만 본다. 눌렀는데 아무 일도 안 하는
 *    조용한 무동작 버튼은 통과한다 — 그건 사람이 봐야 한다.
 */
import puppeteer from "puppeteer-core";
import { DOMAINS, AGENT_IDS, findChrome, sleep, RESET_STORAGE } from "./scan-config.mjs";
import { sweepScreen, preparePage } from "./sweep.mjs";

const BASE = process.argv[2] || "http://localhost:5173";
const DOM = process.argv[3] || "expressway";

const dom = DOMAINS.find(d => d.id === DOM);
if (!dom) {
  console.error(`[실행 불가] 알 수 없는 도메인: ${DOM} (등록: ${DOMAINS.map(d => d.id).join(", ")})`);
  process.exit(2);
}

const chrome = findChrome();
if (!chrome) { console.error("[실행 불가] Chrome을 찾지 못함 — CHROME_PATH 환경변수 지정"); process.exit(2); }

const browser = await puppeteer.launch({
  executablePath: chrome, headless: "new", args: ["--no-sandbox", "--disable-gpu"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const errs = await preparePage(page);

await page.goto(BASE, { waitUntil: "networkidle2" });
await page.evaluate(RESET_STORAGE);

/* 훑을 화면 목록 — 시나리오 수는 팩마다 다르므로 scan-config의 orchCards를 따른다 */
const screens = [
  ["user/general", "일반 탭"],
  ["user/agent", "에이전트 허브"],
  ["user/secure", "보안 탭"],
  ...AGENT_IDS.map(id => [`user/agent/${id}`, id]),
  ...Array.from({ length: dom.orchCards || 0 }, (_, i) => [`user/agent/orchestration:${i}`, `시나리오 ${i}`]),
];

process.stdout.write(`[클릭 스윕] ${dom.label} · ${screens.length}화면 `);
const findings = [];
let clicked = 0;

for (const [path, label] of screens) {
  // 화면마다 저장 상태를 지운다 — 앞 화면에서 만든 대화·작업지시가 다음 판정을 흐리지 않게
  await page.goto(`${BASE}/#/${DOM}/${path}`, { waitUntil: "networkidle2" });
  await page.evaluate(RESET_STORAGE);
  const r = await sweepScreen(page, `${BASE}/#/${DOM}/${path}`, { label, errs, settleMs: 300 });
  clicked += r.clicked;
  findings.push(...r.findings);
  process.stdout.write(".");
}
process.stdout.write("\n");
await browser.close();

const uniq = [...new Set(findings)];
console.log(`\n[${uniq.length ? "FAIL" : "PASS"}] ${dom.label} 사용자 포털 — 화면 ${screens.length}개 · 버튼 ${clicked}개 클릭`);
for (const f of uniq.slice(0, 40)) console.log(`  ✗ ${f}`);
if (uniq.length > 40) console.log(`  … 외 ${uniq.length - 40}건`);
if (!uniq.length) console.log("        판정: 클릭 시 페이지 에러 · 화면 사라짐");
console.log(uniq.length
  ? "\n결과: FAIL — 누르면 죽는 버튼이다. 콘텐츠가 아니라 코드 결함이니 스택부터 볼 것."
  : "\n결과: PASS");
process.exit(uniq.length ? 1 : 0);
