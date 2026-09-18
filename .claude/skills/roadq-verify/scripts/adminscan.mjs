/**
 * adminscan.mjs — 관리자 화면 도메인 콘텐츠 스캐너
 *
 * 왜 필요한가:
 *   verify.mjs·deepscan.mjs는 둘 다 '사용자 포털'만 본다. 그런데 관리자 45+ 페이지는
 *   mocks.js 기본값 위에 팩 adminContent를 덮는 구조라, 팩이 키를 빠뜨려도 화면은
 *   멀쩡히 렌더된다 — 다른 도메인 콘텐츠나 도메인 중립 일반론이 대신 나올 뿐이다.
 *   실제로 나중에 추가된 관리자 6개 페이지(보안 아키텍처·예측 모델 운영·카탈로그·
 *   증강 전략·중대재해·재현성)가 공공·행정에서 오래 중립 기본값으로 남아 있었다.
 *
 * 무엇을 보는가:
 *   1단계(렌더) ① 누수 — 그 도메인에 나오면 안 되는 타 도메인 용어(ADMIN_BANNED)
 *              ② 누락 — 그 도메인이 공급했어야 할 마커(ADMIN_PAGES)
 *   2단계(클릭) ③ 크래시 — main 안의 버튼을 실제로 눌러 보고 페이지 에러·흰 화면을 잡는다
 *
 * 쓰는 법:
 *   node .claude/skills/roadq-verify/scripts/adminscan.mjs [baseUrl] [domainId] [--no-click]
 *   도메인 생략 시 1단계는 전 도메인, 2단계는 expressway 한 도메인(크래시는 코드 결함이라 충분).
 *   팩 adminContent를 크게 바꿨다면 그 도메인을 인자로 넘겨 2단계를 따로 돌릴 것.
 *   약 5~8분(버튼 약 580개). 급할 때만 --no-click.
 *
 * ⚠️ 마커는 반드시 '기본 탭에서 실제로 렌더되는' 문자열로 둘 것.
 *    탭·아코디언 안쪽 문자열을 넣으면 멀쩡한 화면이 FAIL로 잡힌다.
 */
import puppeteer from "puppeteer-core";
import { ADMIN_PAGES, ADMIN_BANNED, adminMenus, findChrome, sleep, RESET_STORAGE } from "./scan-config.mjs";
import { sweepScreen, preparePage } from "./sweep.mjs";

const ARGS = process.argv.slice(2).filter(a => !a.startsWith("--"));
const FLAGS = process.argv.slice(2).filter(a => a.startsWith("--"));
const BASE = ARGS[0] || "http://localhost:5173";
const ONLY = ARGS[1] || null;
const SKIP_CLICK = FLAGS.includes("--no-click");   // 2단계(클릭 스윕) 생략 — 빠른 확인용
const CLICK_DOMAIN = ONLY || "expressway";                // 클릭 크래시는 코드 결함이라 한 도메인이면 충분

const targets = Object.keys(ADMIN_PAGES).filter(d => !ONLY || d === ONLY);
if (!targets.length) {
  console.error(`[실행 불가] 알 수 없는 도메인: ${ONLY} (등록: ${Object.keys(ADMIN_PAGES).join(", ")})`);
  process.exit(2);
}

const chrome = findChrome();
if (!chrome) { console.error("[실행 불가] Chrome을 찾지 못함 — CHROME_PATH 환경변수 지정"); process.exit(2); }

const browser = await puppeteer.launch({
  executablePath: chrome, headless: "new", args: ["--no-sandbox", "--disable-gpu"],
});

let totalFail = 0;

for (const dom of targets) {
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on("pageerror", e => consoleErrors.push(String(e.message || e)));

  await page.goto(BASE, { waitUntil: "networkidle2" });
  await page.evaluate(RESET_STORAGE);

  const banned = ADMIN_BANNED[dom] || [];
  const results = [];

  /* 누수 스캔은 '전 메뉴'가 대상이다.
     예전에는 마커가 정의된 몇 페이지만 봤는데, 실제 누수는 아무도 안 보던 페이지에서 났다
     (타 발주처 API 주소가 MCP 서버 페이지에 남아 있던 사고). 마커 검사만 지정 페이지에 한다. */
  const markerMap = new Map(ADMIN_PAGES[dom]);
  const menus = [...new Set([...adminMenus(), ...markerMap.keys()])];

  for (const menu of menus) {
    await page.goto(`${BASE}/#/${dom}/admin/${menu}`, { waitUntil: "networkidle2" });
    await sleep(900);   // 마커 판정이 렌더 타이밍에 흔들리지 않게 — 700ms에서 간헐 오탐을 봤다
    const txt = await page.evaluate(() => (document.querySelector("main") || document.body).innerText);
    const missing = (markerMap.get(menu) || []).filter(m => !txt.includes(m));
    const leak = banned.filter(w => txt.includes(w));
    results.push({ menu, missing, leak });
  }

  await page.close();

  const fails = results.filter(r => r.missing.length || r.leak.length);
  totalFail += fails.length + consoleErrors.length;

  console.log(`\n[${fails.length || consoleErrors.length ? "FAIL" : "PASS"}] ${dom} — 관리자 ${ADMIN_PAGES[dom].length}페이지`);
  for (const r of results) {
    const bad = r.missing.length || r.leak.length;
    if (!bad) continue;
    const parts = [];
    if (r.leak.length) parts.push(`누수: ${r.leak.join(", ")}`);
    if (r.missing.length) parts.push(`누락: ${r.missing.join(", ")}`);
    console.log(`  ✗ ${r.menu} — ${parts.join(" · ")}`);
  }
  for (const e of consoleErrors) console.log(`  ✗ 페이지 에러: ${e.slice(0, 120)}`);
}

/* ══════════════════════════════════════════════════════════════════
 * 2단계 — 버튼 클릭 스윕
 *
 * 1단계는 '화면이 그려지는가'만 본다. 그런데 관리자에서 실제로 난 사고는
 * 렌더가 아니라 클릭이었다: useToast()는 함수를 반환하는데 9개 컴포넌트가
 * const { setToast } = useToast()로 구조분해해 undefined를 호출 —
 * 클릭하는 순간 TypeError로 41지점이 죽고 있었다.
 * 정적 스캔(onClick 유무)으로는 못 잡는다. 핸들러는 있고 내용이 죽은 유형이다.
 *
 * 그래서 main 안의 버튼을 실제로 눌러 보고 크래시·흰 화면을 잡는다.
 * 크래시는 코드 결함이라 한 도메인이면 충분하다(팩 adminContent를 크게
 * 바꿨다면 그 도메인을 인자로 넘겨 따로 돌릴 것).
 * ══════════════════════════════════════════════════════════════════ */
const clickFindings = [];
if (!SKIP_CLICK) {
  const menus = adminMenus();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const errs = await preparePage(page);

  await page.goto(BASE, { waitUntil: "networkidle2" });
  await page.evaluate(RESET_STORAGE);
  process.stdout.write(`\n[클릭 스윕] ${CLICK_DOMAIN} · ${menus.length}메뉴 `);

  let clicked = 0;
  for (const menu of menus) {
    const r = await sweepScreen(page, `${BASE}/#/${CLICK_DOMAIN}/admin/${menu}`, { label: menu, errs });
    clicked += r.clicked;
    clickFindings.push(...r.findings);
    process.stdout.write(".");
  }
  process.stdout.write("\n");
  await page.close();

  const uniq = [...new Set(clickFindings)];
  totalFail += uniq.length;
  console.log(`\n[${uniq.length ? "FAIL" : "PASS"}] 클릭 스윕 — 버튼 ${clicked}개 클릭`);
  for (const f of uniq.slice(0, 40)) console.log(`  ✗ ${f}`);
  if (uniq.length > 40) console.log(`  … 외 ${uniq.length - 40}건`);
}

await browser.close();

console.log(totalFail
  ? `\n결과: FAIL — 누락은 팩 adminContent에 키를 추가, 누수는 그 상수를 팩으로 이관,\n      클릭 크래시는 코드 결함이니 스택부터 볼 것.`
  : `\n결과: PASS (관리자 화면 도메인 콘텐츠 · 버튼 클릭 정상)`);
process.exit(totalFail ? 1 : 0);
