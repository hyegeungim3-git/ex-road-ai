/**
 * 검증 공통 설정 — verify.mjs(넓고 얕게)와 deepscan.mjs(좁고 깊게)가 함께 쓴다.
 *
 * ⚠️ 새 도메인 팩을 추가하면 여기 DOMAINS에 항목을 추가할 것.
 *    (src/domains/index.js 등록과 나란히 — 빠뜨리면 새 도메인이 검증에서 조용히 빠진다)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/* 도메인별 판정 기준
 *  banned      : 얕은 스캔(verify)용 금칙어 — 타 도메인 조직명·문서번호 접두
 *  deepExtra   : 깊은 스캔(deepscan)에서만 추가로 보는 업무 용어.
 *                해당 도메인에서 '정상 업무 용어'인 것은 절대 넣지 말 것.
 *                (예: 행정·제조는 협력사·사업장 주소를 실제로 다루므로
 *                 도로명주소·법정동·지번을 넣으면 오탐이 된다)
 *  deepSkip    : 깊은 스캔 제외 — 그 용어들이 원래 자기 콘텐츠인 원본 도메인
 */
export const DOMAINS = [
  {
    id: "expressway", label: "한국도로공사",
    banned: ["KOGAS", "kogas", "한국부동산원", "공시지가", "표준지", "감정평가", "부동산평가처",
             "KREA-", "R-ONE", "reb.or.kr", "전월세", "한빛정밀", "HBP-", "한성시청", "HSC-",
             "새빛대학교병원", "SUH-"],
    generalMarkers: ["디지털계획처 데이터플랫폼부", "오늘의 업무 브리핑", "구간 속도 예측", "돌발상황 확인", "데이터 품질 점검"],
    hubMarkers: ["돌발상황 자동 대응", "데이터 품질 이상 대응"],
    orchCards: 2,
    // 시계열 인텔리전스(데이터 탭) 판정 — RoadQ 고유 기능
    dataMarkers: ["시계열 인텔리전스", "예측", "이상탐지", "예지보전", "데이터 품질"],
    deepExtra: ["부동산공시처", "필지", "지번", "408002", "이의신청 처리지침"],
  },
];

/* 관리자 화면 판정 — adminscan.mjs 전용.
 * verify·deepscan은 사용자 포털만 본다. 관리자 45+ 페이지는 mocks.js 기본값을
 * 팩 adminContent가 덮는 구조라, 팩이 키를 빠뜨리면 '중립 기본값' 또는 '타 도메인
 * 콘텐츠'가 조용히 노출된다 — 화면은 멀쩡해 보이므로 사람 눈으로는 잘 안 잡힌다.
 *
 * pages: [메뉴 id, 기본 탭에서 반드시 보여야 할 마커[]]
 *   ⚠️ 마커는 '첫 화면에 실제로 렌더되는 문자열'이어야 한다.
 *      탭·아코디언 안쪽 문자열을 넣으면 정상인데 FAIL이 난다(실제로 겪음).
 * adminBanned: 그 도메인 관리자에 나오면 안 되는 타 도메인 용어.
 */
export const ADMIN_PAGES = {
  expressway: [
    ["security.arch",  ["EXTIS 교통 시계열 수집·적재", "도로 지침·기준 RAG 검색"]],
    ["eval.predops",   ["통행속도 예측 모델", "노면결빙 예측 모델"]],
    ["data.catalog",   ["VDS 5분 집계 시계열", "도로 지침·기준 문서"]],
    ["admin.augment",  ["도로 지침·기준 문서"]],
    ["safetyact",      ["중대재해처벌법 대응", "위험성평가 이력"]],
    ["repro",          ["답변 재현성 스냅샷"]],
  ],
};

/* 관리자 누수 판정어 — 사용자 포털 banned와 달리 '중립 기본값'은 통과시킨다 */
export const ADMIN_BANNED = {
  expressway: ["한빛정밀", "침탄", "포스프레임", "한국부동산원", "공시지가", "표준지",
               "감정평가", "한성시", "새빛대학교", "RTMS"],
};

export const AGENT_IDS = [
  "agent-chatbot", "agent-report", "agent-meeting", "agent-knowledge", "agent-internalreg",
  "agent-ocr", "agent-dbquery", "agent-address", "agent-dataanalysis", "agent-summary",
  "agent-translate", "agent-review", "agent-safety",
];

/* 관리자 메뉴 전체 목록 — App.jsx의 라우팅 맵을 그대로 읽는다.
   여기에 목록을 하드코딩하면 메뉴가 늘어날 때 조용히 스캔에서 빠지므로
   소스를 정본으로 삼는다(등록 지점이 둘로 갈라지는 것을 막는다). */
export function adminMenus() {
  try {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const app = path.resolve(here, "../../../../src/App.jsx");
    const s = fs.readFileSync(app, "utf8");
    const m = s.match(/'([a-z0-9.]+)':\s*<[A-Za-z]/g) || [];
    return [...new Set(m.map(x => x.match(/'([^']+)'/)[1]))];
  } catch {
    return [];
  }
}

export function findChrome() {
  const cands = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    (process.env.LOCALAPPDATA || "") + "\\Google\\Chrome\\Application\\chrome.exe",
  ].filter(Boolean);
  return cands.find(p => { try { return fs.existsSync(p); } catch { return false; } });
}

export const sleep = ms => new Promise(r => setTimeout(r, ms));

/* 캡처·스캔 전 상태 초기화 — 저장된 대화나 UI 설정이 판정을 오염시키지 않게 */
export const RESET_STORAGE = `(() => { try {
  Object.keys(localStorage).filter(k => k.startsWith('roadq.convos')).forEach(k => localStorage.removeItem(k));
  localStorage.removeItem('roadq.uiPrefs');
} catch (e) {} })()`;
