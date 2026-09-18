import { demoStorage, makeGlobalStorageKey } from "../core/demoStorage.js";

/* ================================================================== */
/* UI 크롬 다국어 (환경설정 > 언어) — 내비게이션·섹션 라벨만 전환한다.  */
/* 답변·팩 콘텐츠는 도메인 데모 특성상 한국어 유지 (V4 로드맵 W3에서    */
/* 팩 콘텐츠 병기형 진짜 다국어로 승격 예정)                            */
/* ================================================================== */
export const UI_LANGS = [
  { id: "ko", label: "한국어" },
  { id: "en", label: "English" },
];

const STRINGS = {
  ko: {
    tabGeneral: "일반", tabAgent: "에이전트", tabData: "데이터", tabSecure: "보안",
    newChat: "새 대화",
    suggested: "추천 질문", recent: "최근 대화",
    briefing: "오늘의 업무 브리핑", pending: (n) => `처리 대기 ${n}건`,
    networkPill: "내부망 전용",
    settings: "환경설정", theme: "테마", themeLight: "라이트", themeDark: "다크",
    language: "언어 (UI 라벨)",
    langNote: "답변·업무 콘텐츠는 데모 특성상 한국어로 유지됩니다.",
    themeNote: "다크 테마는 사용자 포털에 적용됩니다 (관리자 시스템은 라이트 고정).",
  },
  en: {
    tabGeneral: "General", tabAgent: "Agents", tabData: "Data", tabSecure: "Secure",
    newChat: "New chat",
    suggested: "Suggested questions", recent: "Recent conversations",
    briefing: "Today's briefing", pending: (n) => `${n} pending`,
    networkPill: "Internal network",
    settings: "Preferences", theme: "Theme", themeLight: "Light", themeDark: "Dark",
    language: "Language (UI labels)",
    langNote: "Answers and domain content remain in Korean for this demo.",
    themeNote: "Dark theme applies to the user portal (admin stays light).",
  },
};

export const uiStrings = (lang) => STRINGS[lang] || STRINGS.ko;

const PREFS_KEY = makeGlobalStorageKey("uiPrefs");
export function loadUiPrefs() {
  const stored = demoStorage.readJson(PREFS_KEY, {});
  const prefs = stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {};
  return { theme: "light", lang: "ko", ...prefs };
}
export function saveUiPrefs(prefs) {
  return demoStorage.writeJson(PREFS_KEY, prefs);
}
