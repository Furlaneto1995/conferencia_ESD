/* Service Worker — Conferência de Bobinas (PWA offline) */
const CACHE = "confere-v12";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-192.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png",
  "./favicon-32.png",
  "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"
];

/* instala: já deixa tudo em cache (funciona offline na 1ª abertura depois de instalado) */
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ativa: limpa caches antigos de versões anteriores */
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* fetch: cache primeiro; se não tiver, vai na rede e guarda cópia */
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  /* Firebase nunca passa pelo cache — a base ESD é sempre ao vivo */
  if (e.request.url.includes("firebaseio.com")) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit =>
      hit ||
      fetch(e.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return resp;
      }).catch(() => caches.match("./index.html"))
    )
  );
});
