/* =====================================================================
 * capture.mjs — 매니페스트 기반 전 화면 자동 캡처 러너 (범용)
 * 사용: node capture.mjs [desktop|mobile|all]
 * 헤드리스 크롬(설치본)으로 manifest.mjs의 화면을 순회하며 PNG 저장.
 * 산출: captures/<viewport>/<번호-ID>.png + captures/manifest.json
 * ===================================================================== */
import puppeteer from 'puppeteer-core';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';

/* 사용: node capture.mjs [desktop|mobile|all] [매니페스트=./manifest.mjs] [출력폴더=captures] */
const mode = process.argv[2] || 'all';
const manifestPath = process.argv[3] || './manifest.mjs';
const OUTDIR = process.argv[4] || 'captures';
const { target, screens } = await import(manifestPath);

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function ensureAuth(page, auth) {
  await page.evaluate((auth, acc) => {
    if (auth === 'public') { if (window.Store && Store.logout) Store.logout(); return; }
    const a = acc[auth];
    Store.logout && Store.logout();
    Store.login(a.email, a.pw);
  }, auth, target.accounts);
}

async function captureViewport(browser, vpName) {
  const vp = target.viewports[vpName];
  const page = await browser.newPage();
  await page.setViewport(vp);
  // 캡처 전 상태 초기화 — 앱마다 키가 다르므로 대상 앱에 맞춰 교체할 것.
  // GenOS: 저장된 대화가 남아 있으면 '첫 화면(제안 카드·브리핑)'이 아니라
  // 복원된 대화가 찍혀 캡처가 비결정적이 된다. UI 설정(다크·영어)도 제거.
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem('scon_tour_seen', '1');
      Object.keys(localStorage)
        .filter(k => k.startsWith('roadq.convos') || k === 'roadq.uiPrefs')
        .forEach(k => localStorage.removeItem(k));
    } catch (e) {}
  });
  await page.goto(target.baseUrl, { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(600);

  const dir = `${OUTDIR}/${vpName}`;
  mkdirSync(dir, { recursive: true });
  const results = [];

  for (let i = 0; i < screens.length; i++) {
    const s = screens[i];
    const file = `${String(i + 1).padStart(2, '0')}-${s.id}.png`;
    try {
      /* 화면 높이 오버라이드(s.vh) — 앱이 100dvh 셸 + 내부 스크롤 구조라
         fullPage 캡처로는 접힌 내용이 안 나온다. 뷰포트를 키워 한 컷에 담는다.
         (데스크톱 문서용 컷에만 적용, 모바일은 기기 크기 유지) */
      const wantH = (vpName === 'desktop' && s.vh) ? s.vh : vp.height;
      if (page.viewport().height !== wantH) await page.setViewport({ ...vp, height: wantH });
      await ensureAuth(page, s.auth);
      // 해시 라우팅: 같은 해시로의 재진입도 강제 렌더
      await page.evaluate((route) => {
        if (location.hash === route) { if (window.App && App.refresh) App.refresh(); }
        else location.hash = route;
      }, s.route);
      await sleep(1200); // 지연 로딩(lazy) 청크 + 진입 애니메이션
      if (s.setup) { await page.evaluate(s.setup); await sleep(s.settle || 500); }
      // 기능 마커 좌표 측정 — feature.sel(CSS 또는 'text:문구')의 요소 위치를 기록
      let markers = [];
      if (Array.isArray(s.features)) {
        markers = await page.evaluate((feats, isModal) => {
          function find(sel) {
            if (sel.startsWith('text:')) {
              const t = sel.slice(5);
              // 패널 제목·배지는 span/td로도 그려진다 — 후보를 넓히되
              // 텍스트가 가장 짧은(=가장 깊은) 요소를 골라 컨테이너 오매칭을 피한다
              const els = [...document.querySelectorAll(
                'button, a, h1, h2, h3, h4, span, td, th, label, .card-head')];
              const hits = els.filter((e) => e.textContent.trim().includes(t) &&
                e.getBoundingClientRect().height > 0);
              return hits.sort((a, b) => a.textContent.length - b.textContent.length)[0];
            }
            return document.querySelector(sel);
          }
          const out = [];
          feats.forEach((f, i) => {
            if (!f || !f.sel) return;
            const el = find(f.sel);
            if (!el) return;
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return;
            // 모달=뷰포트 좌표(내부 스크롤로 화면 밖이면 제외), 페이지=문서 좌표
            if (isModal && (r.top < 0 || r.top > innerHeight)) return;
            out.push({ n: i + 1,
              x: r.left + (isModal ? 0 : scrollX),
              y: r.top + (isModal ? 0 : scrollY) });
          });
          return out;
        }, s.features, !!s.modal);
      }
      // 모달 화면은 뷰포트 캡처(모달이 화면 중앙에 크게), 페이지는 풀페이지 캡처
      // 풀페이지 캡처 시 fixed 하단탭이 스크롤 중간에 찍히는 퍼펫티어 특성 → 캡처 동안 static 전환
      if (!s.modal) {
        await page.evaluate(() => {
          const st = document.createElement('style'); st.id = '__cap_fix';
          st.textContent = '.bottom-nav{position:static !important}';
          document.head.appendChild(st);
        });
      }
      /* 뷰포트를 키운 뒤엔 차트(recharts 등)가 0 높이로 측정된 채 남거나
         패널의 opacity 트랜지션(200ms)이 진행 중일 수 있다 → resize 통지 후 한 박자 쉰다 */
      await page.evaluate(() => window.dispatchEvent(new Event('resize')));
      await sleep(1000);
      await page.screenshot({ path: `${dir}/${file}`, fullPage: !s.modal });
      await page.evaluate(() => { const st = document.getElementById('__cap_fix'); if (st) st.remove(); });
      if (s.cleanup) { await page.evaluate(s.cleanup); await sleep(200); }
      else {
        // 모달이 열려 있으면 닫아 다음 화면 오염 방지
        await page.evaluate(() => {
          const x = document.querySelector('#modal-host [data-mclose]');
          if (x) x.click();
        });
      }
      results.push({ ...pick(s), file, ok: true, markers, dsf: vp.deviceScaleFactor || 1 });
      console.log(`[${vpName}] ✔ ${file} ${s.title} (마커 ${markers.length}/${(s.features || []).filter(f => f && f.sel).length})`);
    } catch (e) {
      results.push({ ...pick(s), file, ok: false, error: String(e).slice(0, 200) });
      console.log(`[${vpName}] ✘ ${file} ${s.title} — ${e}`);
    }
  }
  await page.close();
  return results;
}

const pick = (s) => ({ id: s.id, cat: s.cat, title: s.title, route: s.route,
  nav: s.nav, desc: s.desc, features: s.features, crud: s.crud || null, auth: s.auth });

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-first-run', '--disable-features=TranslateUI'],
});

const { accounts, viewports, ...targetMeta } = target;
// 부분 실행(desktop만 등) 시 기존 manifest.json의 다른 뷰포트 결과를 보존(병합)
let prevViewports = {};
try {
  if (existsSync(OUTDIR + '/manifest.json')) {
    prevViewports = JSON.parse(readFileSync(OUTDIR + '/manifest.json', 'utf8')).viewports || {};
  }
} catch (e) { /* 손상 시 무시하고 새로 생성 */ }
const out = { target: targetMeta,
  capturedAt: new Date().toISOString(), viewports: prevViewports };
try {
  if (mode === 'all' || mode === 'desktop') out.viewports.desktop = await captureViewport(browser, 'desktop');
  if (mode === 'all' || mode === 'mobile') out.viewports.mobile = await captureViewport(browser, 'mobile');
} finally {
  await browser.close();
}
mkdirSync(OUTDIR, { recursive: true });
writeFileSync(OUTDIR + '/manifest.json', JSON.stringify(out, null, 2), 'utf8');
const flat = Object.values(out.viewports).flat();
console.log(`\n완료: ${flat.filter(r => r.ok).length}/${flat.length} 캡처 성공`);
if (flat.some(r => !r.ok)) process.exitCode = 1;
