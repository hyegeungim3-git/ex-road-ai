/**
 * sweep.mjs — 버튼 클릭 스윕 공용 로직 (adminscan·userclick가 함께 쓴다)
 *
 * 왜 이런 게 필요한가:
 *   렌더는 멀쩡한데 '누르는 순간' 죽는 결함이 이 저장소의 단골 사고다.
 *     const { setToast } = useToast();   // useToast()는 함수를 반환 → undefined
 *     onClick={() => setToast('저장')}    // 누르면 TypeError, 화면 전체 사망
 *   화면도 뜨고 버튼도 보이고 onClick도 붙어 있어서, 정적 스캔으로는 못 잡는다.
 *   실제로 관리자에서 41지점, 지식 관리에서 7곳이 이 유형으로 죽어 있었다.
 *
 * ⚠️ 만들면서 밟은 함정 (같은 실수 반복 금지):
 *   탭을 전환하면 이전 탭에만 있던 버튼이 DOM에서 사라진다. 그걸 '다 눌렀다'로
 *   읽고 종료하면, 545개를 눌러 놓고도 크래시를 못 잡는다(실제로 그랬다).
 *   → 소진되면 한 번 새로 적재해 기본 상태로 되돌린 뒤 마저 누른다.
 */
import { sleep } from "./scan-config.mjs";

/* 눌러선 안 되는 버튼 — 포털을 떠나면 그 화면의 나머지를 못 훑는다 */
const DEFAULT_SKIP = /포털 선택|사용자 포털|로그아웃|포털 선택 화면으로/;

/* 클릭 결과가 '핸들러가 죽었다'는 신호인지 판정 */
const CRASH_RE = /TypeError|is not a function|Cannot read|undefined is not/;

/**
 * 한 화면의 버튼을 전부 눌러 보고 크래시·흰 화면을 잡는다.
 * @returns {Promise<{clicked:number, findings:string[]}>}
 */
export async function sweepScreen(page, url, {
  label = url,
  skip = DEFAULT_SKIP,
  maxClicks = 120,
  settleMs = 230,
  blankBelow = 80,
  errs,                    // 호출부가 소유하는 에러 수집 배열(page 리스너가 채운다)
} = {}) {
  const findings = [];
  const expectHash = new URL(url).hash;
  await page.goto(url, { waitUntil: "networkidle2" });
  await sleep(450);

  const seen = [];
  let clicked = 0;
  let reloadedOnce = false;

  for (let i = 0; i < maxClicks; i++) {
    const before = errs.length;
    /* 클릭이 곧바로 페이지 이동을 일으키면 evaluate가 'Execution context was destroyed'로
       터진다. 스캐너가 죽으면 나머지 메뉴를 통째로 못 본다 — 이동으로 간주하고 복귀시킨다. */
    let btn;
    try {
      btn = await page.evaluate((seenArr, skipSrc) => {
        const skipRe = new RegExp(skipSrc);
        const btns = [...document.querySelectorAll("main button")]
          .filter(b => b.offsetParent !== null && !b.disabled);
        for (const b of btns) {
          const key = ((b.getAttribute("aria-label") || "") + "|" +
            b.innerText.replace(/\s+/g, " ").trim()).slice(0, 60);
          if (seenArr.includes(key)) continue;
          if (skipRe.test(key)) { seenArr.push(key); continue; }
          b.click();
          return key;
        }
        return null;
      }, seen, skip.source);
    } catch (e) {
      if (!/Execution context was destroyed|Target closed/.test(String(e))) throw e;
      await page.goto(url, { waitUntil: "networkidle2" });
      await sleep(400);
      continue;
    }

    // 현재 DOM에 남은 게 없다고 끝내면 안 된다 — 탭 뒤에 가려졌을 뿐일 수 있다
    if (!btn) {
      if (reloadedOnce) break;
      reloadedOnce = true;
      await page.goto(url, { waitUntil: "networkidle2" });
      await sleep(400);
      continue;
    }
    reloadedOnce = false;
    seen.push(btn);
    clicked++;
    await sleep(settleMs);

    const state = await page.evaluate(() => {
      const m = document.querySelector("main");
      return { len: m ? m.innerText.trim().length : 0, hash: location.hash };
    });
    const name = btn.replace(/^\|/, "") || "(아이콘 버튼)";
    for (const e of errs.slice(before)) findings.push(`${label} · "${name}" → ${e.slice(0, 110)}`);
    if (state.len < blankBelow) findings.push(`${label} · "${name}" → 화면이 비었음(본문 ${state.len}자)`);

    // 모달은 닫고, 다른 화면으로 갔거나 죽었으면 원래 화면으로 되돌린다
    await page.keyboard.press("Escape");
    if (state.hash !== expectHash || state.len < blankBelow) {
      await page.goto(url, { waitUntil: "networkidle2" });
      await sleep(350);
    }
  }
  return { clicked, findings };
}

/** 클릭 스윕용 페이지 준비 — 에러 수집 + 파일 선택창·다운로드가 스캔을 막지 않게 */
export async function preparePage(page) {
  const errs = [];
  page.on("pageerror", e => errs.push(String(e.message || e)));
  page.on("console", m => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (CRASH_RE.test(t)) errs.push("console: " + t.slice(0, 160));
  });
  // 첨부 버튼이 파일 선택창을 띄우면 헤드리스가 멈춘다 — 즉시 취소한다
  page.on("filechooser", async fc => { try { await fc.cancel(); } catch { /* 무시 */ } });
  // 다운로드 버튼이 파일을 쏟아내지 않도록 막는다
  try {
    const cdp = await page.createCDPSession();
    await cdp.send("Page.setDownloadBehavior", { behavior: "deny" });
  } catch { /* 지원 안 하면 무시 */ }
  return errs;
}
