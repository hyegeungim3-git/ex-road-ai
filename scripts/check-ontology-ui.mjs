/* global document */
import puppeteer from 'puppeteer-core';
import { findChrome, sleep } from '../.claude/skills/roadq-verify/scripts/scan-config.mjs';

const baseUrl = (process.argv[2] || 'http://localhost:5173').replace(/\/$/, '');
const chrome = findChrome();

if (!chrome) {
  console.error('Chrome not found. Set CHROME_PATH and retry.');
  process.exit(2);
}

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1366, height: 900 });
const errors = [];
page.on('console', message => {
  if (message.type() === 'error' && !message.text().includes('favicon')) errors.push(message.text());
});
page.on('pageerror', error => errors.push(String(error)));

try {
  await page.goto(`${baseUrl}/#/reb/user/agent/agent-knowledge`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('input[name="searchmode"][value="graph"]', { timeout: 10000 });
  await page.click('input[name="searchmode"][value="graph"]');

  const selectedQuery = await page.evaluate(() => {
    const button = [...document.querySelectorAll('button')].find(item => item.textContent.trim() === '이의신청 신청 기한과 제출 방식');
    button?.click();
    return Boolean(button);
  });
  if (!selectedQuery) throw new Error('Graph RAG quick query was not found');

  const started = await page.evaluate(() => {
    const button = [...document.querySelectorAll('button')].find(item => item.textContent.includes('Graph RAG 검색 시작'));
    button?.click();
    return Boolean(button);
  });
  if (!started) throw new Error('Graph RAG start button was not found');

  await page.waitForFunction(
    () => document.body.innerText.includes('근거가 연결된 관계 경로') && document.body.innerText.includes('이의신청_처리지침.pdf'),
    { timeout: 12000 },
  );
  const rebText = await page.evaluate(() => document.body.innerText);
  const required = [
    '공시가격 업무 온톨로지',
    '이의신청 신청 기한·제출 방식',
    '공시일부터 30일 이내',
    '서면 제출',
    '이의신청_처리지침.pdf',
    '처리 기한은 원문 조항 검증 전',
  ];
  for (const marker of required) {
    if (!rebText.includes(marker)) throw new Error(`REB Graph RAG result is missing marker: ${marker}`);
  }

  await page.goto(`${baseUrl}/#/manufacturing/user/agent/agent-knowledge`, { waitUntil: 'networkidle2' });
  await sleep(500);
  const manufacturingHasGraphMode = await page.evaluate(() => document.body.innerText.includes('온톨로지 Graph RAG'));
  if (manufacturingHasGraphMode) throw new Error('Graph RAG mode leaked into a domain without ontologyPack');
  if (errors.length) throw new Error(`Browser console errors: ${errors.join(' | ')}`);

  console.log('Ontology UI check passed: REB graph path/evidence rendered, non-REB mode unchanged');
} finally {
  await browser.close();
}
