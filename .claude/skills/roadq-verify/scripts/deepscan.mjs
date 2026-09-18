/**
 * ex-road-ai 깊은 화면 스캔 — 에이전트 실행 후 화면·모달까지 들어가 타 도메인 잔재를 잡는다.
 *
 * verify.mjs는 '넓고 얕게'(전 도메인 × 초기 화면) 본다. 그래서 실행해야 나오는 화면의
 * 누수를 구조적으로 못 잡았다 — 실제로 이 스캐너가 다음 3건을 잡았다:
 *   · AgentWorkflowPanel의 공시지가_정형DB·도로명주소 하드코딩 (진행중 화면)
 *   · 문서 레터헤드의 REB 로고 (결과 화면)
 *   · AI 사전 검수 모달의 부동산 통계 점검 항목 (모달)
 *
 * 판정하는 것은 세 가지다:
 *   ① 타 도메인 잔재(금칙어)  ② 결과 화면이 실제로 그려졌는가  ③ 페이지 에러가 없는가
 *
 * ②③은 나중에 추가됐다. 문서 검토 에이전트의 결과 화면이 변수 섀도잉으로
 * 흰 화면이 되어 죽고 있었는데 이 스캐너가 통과시켰기 때문이다. 구멍이 둘이었다:
 *   · 업로드가 있어야 결과에 도달하는 에이전트를 업로드 없이 지나쳐 입력 화면만 봤다
 *   · 페이지 에러를 출력만 하고 종료 코드에 반영하지 않아, 크래시가 나도 PASS였다
 *
 * 사용법: node .claude/skills/roadq-verify/scripts/deepscan.mjs [baseUrl] [domainId]
 * 종료 코드: 0 = 이상 없음, 1 = 이상 있음, 2 = 실행 불가(서버/크롬)
 *
 * 느리다(도메인당 약 6~8분). 도메인 팩을 새로 쓰거나 코어 공용 화면을 건드린 뒤에 돌린다.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import puppeteer from "puppeteer-core";
import { DOMAINS, AGENT_IDS, findChrome, sleep, RESET_STORAGE } from "./scan-config.mjs";

const BASE = process.argv[2] || "http://localhost:5173";
const ONLY = process.argv[3] || null;

/* main 안의 '주 실행 버튼'을 찾아 누른다 — 에이전트마다 문구가 달라 패턴으로 잡는다.
   조회형(DBQuery)은 아이콘 버튼이라 aria-label로 먼저 시도. */
const CLICK_PRIMARY = `(() => {
  const main = document.querySelector('main'); if (!main) return null;
  const byAria = main.querySelector('button[aria-label="질의 실행"]');
  if (byAria) { byAria.click(); return '질의 실행'; }
  const cands = [...main.querySelectorAll('button')].filter(b =>
    /(시작|실행|생성|자동 작성)$/.test(b.innerText.trim()) && b.offsetParent !== null &&
    /bg-(indigo|blue|violet|orange|emerald|teal|rose|slate|amber|green)-[456]00/.test(b.className));
  const b = cands[cands.length - 1];
  if (b) { b.click(); return b.innerText.trim().slice(0, 24); }
  return null;
})()`;

const CLICK_APPROVAL = `(() => {
  const b = [...document.querySelectorAll('button')].find(x => x.innerText.includes('결재 상신'));
  if (b) { b.click(); return true; } return false;
})()`;

/* 주 실행 버튼이 disabled면 대개 '업로드가 먼저'라는 뜻이다.
   그 경우 임시 파일을 올려 결과 화면까지 들어간다 — 이걸 안 해서 문서 검토의
   화이트스크린을 오래 놓쳤다. */
const NEEDS_UPLOAD = `(() => {
  const main = document.querySelector('main'); if (!main) return false;
  if (!main.querySelector('input[type=file]')) return false;
  const cands = [...main.querySelectorAll('button')].filter(b =>
    /(시작|실행|생성|자동 작성)$/.test(b.innerText.trim()));
  return cands.length > 0 && cands.every(b => b.disabled);
})()`;

/* 결과 화면이 '그려졌는가' — 흰 화면·빈 패널을 잡는다.
   크래시가 에러 경계에 먹히면 에러 없이 본문만 사라지기도 한다. */
const MAIN_LEN = `(() => {
  const m = document.querySelector('main');
  return m ? m.innerText.trim().length : 0;
})()`;

// 업로드용 임시 파일 — 컴포넌트는 파일명·크기만 쓰므로 내용은 의미 없다
const TMP_UPLOAD = path.join(os.tmpdir(), "genos_deepscan_sample.pdf");
fs.writeFileSync(TMP_UPLOAD, "%PDF-1.4\n% deepscan sample\n");

const chrome = findChrome();
if (!chrome) { console.error("크롬을 찾지 못했습니다. CHROME_PATH를 지정하세요."); process.exit(2); }

const targets = DOMAINS.filter(d => !d.deepSkip && (!ONLY || d.id === ONLY));
if (!targets.length) { console.error("스캔 대상 도메인이 없습니다."); process.exit(2); }

const browser = await puppeteer.launch({ executablePath: chrome, headless: "new", args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1100 });
const pageErrors = [];
page.on("pageerror", e => pageErrors.push(String(e).slice(0, 140)));

const findings = new Map(); // "domain|where|word" → true

try {
  for (const d of targets) {
    const words = [...new Set([...d.banned, ...(d.deepExtra || [])])];
    const check = (where, text) => {
      for (const w of words) if (text.includes(w)) findings.set(`${d.id}|${where}|${w}`, true);
    };
    process.stdout.write(`[${d.label}] 스캔 중`);

    for (const id of AGENT_IDS) {
      try {
        const errBase = pageErrors.length;   // 이 에이전트에서 새로 난 에러만 귀속시킨다
        await page.goto(`${BASE}/#/${d.id}/user/agent/${id}`, { waitUntil: "networkidle2", timeout: 30000 });
        await page.evaluate(RESET_STORAGE);
        await sleep(1400);
        check(`${id}/입력`, await page.evaluate(() => document.body.innerText));

        // 업로드가 선행돼야 하는 에이전트는 임시 파일을 올린 뒤 진행한다
        if (await page.evaluate(NEEDS_UPLOAD)) {
          const input = await page.$("main input[type=file]");
          if (input) { await input.uploadFile(TMP_UPLOAD); await sleep(1000); }
        }

        const clicked = await page.evaluate(CLICK_PRIMARY);
        if (clicked) {
          await sleep(3200);
          check(`${id}/진행중`, await page.evaluate(() => document.body.innerText));
          await sleep(11000);
          check(`${id}/결과`, await page.evaluate(() => document.body.innerText));

          // 결과 화면이 비어 있으면 렌더가 죽은 것 — 금칙어 0건이라고 통과시키면 안 된다
          const len = await page.evaluate(MAIN_LEN);
          if (len < 200) findings.set(`${d.id}|${id}/결과|결과 화면이 비어 있음(본문 ${len}자 — 렌더 실패 의심)`, true);

          if (await page.evaluate(CLICK_APPROVAL)) {
            await sleep(9000);
            check(`${id}/사전검수`, await page.evaluate(() => document.body.innerText));
          }
        }
        for (const e of pageErrors.slice(errBase)) findings.set(`${d.id}|${id}/페이지에러|${e}`, true);
      } catch (e) {
        findings.set(`${d.id}|${id}/실행오류|${String(e).slice(0, 60)}`, true);
      }
      process.stdout.write(".");
    }
    process.stdout.write("\n");
  }
} finally {
  await browser.close();
  try { fs.unlinkSync(TMP_UPLOAD); } catch { /* 이미 없으면 무시 */ }
}

/* ── 보고 ── */
const grouped = {};
for (const key of findings.keys()) {
  const [dom, where, word] = key.split("|");
  ((grouped[dom] ||= {})[where] ||= []).push(word);
}
console.log("");
if (!Object.keys(grouped).length) {
  const n = targets.length * AGENT_IDS.length;
  console.log(`[PASS] 이상 0건 — ${targets.map(d => d.label).join("·")} 에이전트 ${n}종 × (입력·진행·결과·사전검수)`);
  console.log("        판정: 타 도메인 잔재 · 결과 화면 렌더 · 페이지 에러");
} else {
  console.log(`[FAIL] 이상 ${findings.size}건\n`);
  for (const [dom, wheres] of Object.entries(grouped)) {
    const label = DOMAINS.find(x => x.id === dom)?.label || dom;
    console.log(`[${label}]`);
    for (const [where, ws] of Object.entries(wheres)) console.log(`  ${where}: ${ws.join(", ")}`);
    console.log("");
  }
  console.log("→ 금칙어는 대개 팩의 agentContent 미공급이다(해당 키를 팩에 추가).");
  console.log("→ '결과 화면이 비어 있음'·'페이지에러'는 콘텐츠가 아니라 코드 결함이다. 스택부터 볼 것.");
}

process.exit(findings.size ? 1 : 0);
