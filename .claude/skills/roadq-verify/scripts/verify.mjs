/**
 * RoadQ 도메인 자동 검증 — 금칙어·핵심 마커·시나리오 카드·콘솔 에러
 *
 * 사용법: node .claude/skills/roadq-verify/scripts/verify.mjs [baseUrl] [domainId]
 *   baseUrl  기본 http://localhost:5173 (dev 서버 시작 로그의 실제 포트 확인)
 *   domainId 지정 시 해당 도메인만 (현재 정식 팩은 expressway 하나)
 * 크롬 탐지 실패 시: CHROME_PATH 환경변수로 chrome.exe 경로 지정
 * 종료 코드: 0 = 전 항목 통과, 1 = 실패 있음, 2 = 실행 불가(서버/크롬)
 */
import fs from "node:fs";
import puppeteer from "puppeteer-core";
import { DOMAINS, AGENT_IDS, findChrome, sleep } from "./scan-config.mjs";

const BASE = process.argv[2] || "http://localhost:5173";
const ONLY = process.argv[3] || null;

// 도메인별 판정 기준·에이전트 목록은 scan-config.mjs가 정본 (deepscan.mjs와 공유)

/* 에이전트 13종 — 내부 화면(허브 안쪽)까지 자동 판정한다.
   해시 라우팅(#/<domain>/user/agent/<id>) 덕분에 클릭 없이 직접 진입 가능. */

/* 내부 화면에 다른 에이전트/타 도메인 기본값이 새는지 잡는 공통 금칙어
   (팩이 headerTitle을 생략하면 코어 REB 기본 문구가 노출되던 사고를 자동 판정) */
/* 코어 기본 에이전트 이름 — constants.js에서 직접 뽑아 쓴다(하드코딩 목록은 코어 개명 시 표류한다).
   여기에 더해 컴포넌트 CONTENT_DEFAULTS의 REB 전용 헤더 제목도 함께 본다. */
const CORE_AGENT_NAMES = (() => {
  const names = new Set(["EXTIS·DataLake 조회"]); // AGENT_TEAMS에 없는 DBQuery 화면 기본 제목
  try {
    const src = fs.readFileSync(new URL("../../../../src/user/data/constants.js", import.meta.url), "utf8");
    const block = src.slice(src.indexOf("AGENT_TEAMS"));
    for (const m of block.matchAll(/id:\s*"agent-[a-z]+",\s*name:\s*"([^"]+)"/g)) names.add(m[1]);
  } catch { /* 읽기 실패 시 최소 목록으로 동작 */ }
  return [...names];
})();



async function clickByText(page, text, { exact = false } = {}) {
  return page.evaluate(({ text, exact }) => {
    const btn = [...document.querySelectorAll("button")].find(b =>
      exact ? b.textContent.trim() === text : b.textContent.includes(text));
    if (btn) { btn.click(); return true; }
    return false;
  }, { text, exact });
}

async function scanDomain(browser, d) {
  const fails = [];
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  const consoleErrors = [];
  page.on("console", m => { if (m.type() === "error") consoleErrors.push(m.text().slice(0, 160)); });
  page.on("pageerror", e => consoleErrors.push(String(e).slice(0, 160)));

  try {
    await page.goto(BASE, { waitUntil: "networkidle2", timeout: 30000 });
  } catch (e) {
    await page.close();
    return { fails: [`서버 접속 실패: ${e.message}`], consoleErrors };
  }
  await page.evaluate(id => {
    localStorage.setItem("roadq.activeDomain", id);
    localStorage.removeItem("roadq.uiPrefs"); // 다크·영어 설정 잔재가 마커 판정을 오염하지 않도록
  }, d.id);
  await page.reload({ waitUntil: "networkidle2" });
  await sleep(600);

  // 포털 → 사용자 포털 진입
  if (!(await clickByText(page, "사용자 포털"))) fails.push("포털: '사용자 포털' 버튼 없음");
  await sleep(1200);

  // GENERAL 화면 스캔
  const generalText = await page.evaluate(() => document.body.innerText);
  for (const w of d.banned) if (generalText.includes(w)) fails.push(`GENERAL 금칙어: "${w}"`);
  for (const m of d.generalMarkers) if (!generalText.includes(m)) fails.push(`GENERAL 마커 누락: "${m}"`);

  // 사이드바 접힘이면 펼치기 (탭 버튼이 사이드바 안에 있음)
  await page.evaluate(() => {
    const ex = [...document.querySelectorAll("button")].find(b => b.getAttribute("aria-label") === "사이드바 펼치기");
    if (ex) ex.click();
  });
  await sleep(400);

  // 에이전트 허브 스캔
  if (!(await clickByText(page, "에이전트", { exact: true }))) fails.push("탭: '에이전트' 버튼 없음(사이드바 확인)");
  await sleep(1500); // lazy 청크 로딩 대기
  const hub = await page.evaluate(() => ({
    text: document.body.innerText,
    cards: [...document.querySelectorAll("button")].filter(b => b.textContent.includes("시나리오 실행")).length,
    // 이 도메인이 쓰는 에이전트 이름 집합 (허브 카드가 정본)
    // 이 도메인이 실제로 쓰는 이름 — 카드 제목(name)과 사이드바 짧은 이름(shortName) 둘 다.
    // shortName을 빼면 팩이 코어와 같은 짧은 이름을 쓸 때 13개 화면이 전부 오탐으로 잡힌다.
    names: [
      ...[...document.querySelectorAll("[data-agent-name]")].map(e => e.dataset.agentName),
      ...[...document.querySelectorAll("[data-agent-short]")].map(e => e.dataset.agentShort),
    ].filter(Boolean),
  }));
  if (!hub.names.length) fails.push("허브 카드에서 에이전트 이름을 읽지 못함(data-agent-name 누락)");
  /* 이 도메인에서 '코어 기본 이름 노출'로 볼 이름만 남긴다.
     팩 이름이 코어 이름을 포함하면(예: '공정 데이터 분석 에이전트' ⊃ '데이터 분석 에이전트',
     civic처럼 같은 이름을 그대로 쓰는 경우) 부분 일치로 오탐이 나므로 제외한다.
     대가로 그 이름에 한해 진짜 누수를 놓칠 수 있으나, 오탐으로 검증을 무력화하는 편이 더 나쁘다. */
  const leakNames = CORE_AGENT_NAMES.filter(n => !hub.names.some(own => own.includes(n)));
  for (const w of d.banned) if (hub.text.includes(w)) fails.push(`허브 금칙어: "${w}"`);
  for (const m of d.hubMarkers) if (!hub.text.includes(m)) fails.push(`허브 마커 누락: "${m}"`);
  if (hub.cards !== d.orchCards) fails.push(`시나리오 카드 ${hub.cards}장 (기대 ${d.orchCards})`);

  /* 에이전트 13종 내부 화면 — 주소로 직접 진입해 제목·금칙어 판정
     (허브 카탈로그 이름과 안쪽 제목이 일치해야 한다) */
  for (const id of AGENT_IDS) {
    await page.goto(`${BASE}/#/${d.id}/user/agent/${id}`, { waitUntil: "networkidle2", timeout: 30000 });
    await sleep(900); // lazy 청크 + 진입 애니메이션
    const info = await page.evaluate(() => {
      const main = document.querySelector("main") || document.body;
      const lines = main.innerText.split("\n").map(s => s.trim()).filter(Boolean);
      return { title: lines[0] || "", text: document.body.innerText };
    });
    if (!info.title) { fails.push(`${id}: 내부 화면이 열리지 않음`); continue; }
    for (const w of d.banned) if (info.text.includes(w)) fails.push(`${id} 내부 금칙어: "${w}"`);
    /* 이름 불일치 판정.
       예전 판정은 main.innerText의 첫 줄(=챗 헤더)을 봤는데, 챗 헤더는 늘 카탈로그 이름을
       쓰므로 '안쪽 화면이 코어 기본 이름을 그대로 노출'하는 실제 결함을 못 잡았다.
       지금은 화면 어디든 '코어 기본 에이전트 이름'이 보이면서 그 이름이 이 도메인의
       카탈로그 이름이 아닐 때 불일치로 본다(팩이 같은 이름을 의도적으로 쓰는 경우는 통과). */
    /* 판정은 줄 단위 '완전 일치' — 부분 일치는 버튼 문구까지 걸린다
       (예: 코어명 '안전관리계획 수립' ⊂ 버튼 '안전관리계획 수립 시작'). */
    {
      const lines = new Set(info.text.split("\n").map(t => t.trim()));
      for (const n of leakNames) {
        if (lines.has(n)) {
          fails.push(`${id} 내부에 코어 기본 이름 노출: "${n}" (이 도메인 카탈로그에 없는 이름)`);
        }
      }
    }
  }
  await page.setViewport({ width: 1366, height: 900 });

  // 모바일(375) 회귀 — 신규 로드 기준: 가로 스크롤 금지 + 포털 진입 가능
  await page.setViewport({ width: 375, height: 812 });
  await page.goto(BASE, { waitUntil: "networkidle2" });
  await sleep(500);
  if (!(await clickByText(page, "사용자 포털"))) fails.push("375: '사용자 포털' 버튼 없음");
  await sleep(1000);
  const mob = await page.evaluate(() => ({
    hScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  }));
  if (mob.hScroll) fails.push("375: 가로 스크롤 발생");

  await page.close();
  return { fails, consoleErrors };
}

const chrome = findChrome();
if (!chrome) { console.error("[실행 불가] Chrome을 찾지 못함 — CHROME_PATH 환경변수 지정"); process.exit(2); }

const browser = await puppeteer.launch({ executablePath: chrome, headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
let anyFail = false;
try {
  for (const d of DOMAINS) {
    if (ONLY && d.id !== ONLY) continue;
    const { fails, consoleErrors } = await scanDomain(browser, d);
    const errs = consoleErrors.filter(e => !e.includes("favicon")); // 파비콘 404는 무시
    const ok = fails.length === 0 && errs.length === 0;
    if (!ok) anyFail = true;
    console.log(`\n[${ok ? "PASS" : "FAIL"}] ${d.label} (${d.id})`);
    fails.forEach(f => console.log(`  ✗ ${f}`));
    errs.forEach(e => console.log(`  ✗ 콘솔: ${e}`));
    if (ok) console.log(`  ✓ 금칙어 0 · 마커 전부 존재 · 카드 수 일치 · 에이전트 내부 ${AGENT_IDS.length}종 정상 · 콘솔 에러 0`);
  }
} finally {
  await browser.close();
}
console.log(anyFail ? "\n결과: FAIL — 위 항목을 해소한 뒤 재실행" : "\n결과: PASS (전 도메인)");
process.exit(anyFail ? 1 : 0);
