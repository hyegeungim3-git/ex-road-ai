/* ================================================================== */
/* AgentQ 서비스 워커 — 앱 셸 오프라인 캐시 (PWA)                       */
/* 전략: 내비게이션은 네트워크 우선 + 오프라인 시 캐시된 index 폴백,     */
/*       해시된 정적 자산은 캐시 우선(불변) + 성공 응답을 런타임 적재     */
/* 경로는 전부 SW 스코프 상대('./') — GH Pages base 하위 배포 대응       */
/* ================================================================== */
const CACHE = "agentq-shell-v2";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  // SPA 내비게이션: 네트워크 우선, 실패(오프라인) 시 캐시된 셸
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => { caches.open(CACHE).then((c) => c.put("./index.html", res.clone())); return res; })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // 정적 자산: 캐시 우선 + 런타임 적재 (파일명 해시라 캐시 무효화 걱정 없음)
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const clone = res.clone(); caches.open(CACHE).then((c) => c.put(req, clone)); }
      return res;
    }))
  );
});
