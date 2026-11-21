// Solo per la pagina della modalità wireless DS (wireless.html).
// Aggiunge le intestazioni per la memoria condivisa (SharedArrayBuffer), che GitHub Pages
// non permette di impostare: così i due DS collegati possono usare i thread.
// Tocca solo la pagina wireless e i file dell'emulatore a due console; il resto passa com'è.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
const isolate = (url) => /\/wireless\.html$/.test(url.pathname) || /\/ds-lab\/duo\.(js|wasm)$/.test(url.pathname);
self.addEventListener("fetch", (e) => {
  const r = e.request, url = new URL(r.url);
  if (url.origin !== location.origin || !isolate(url)) return;
  e.respondWith(
    fetch(r.mode === "navigate" ? new Request(r.url, { cache: "no-cache", credentials: "same-origin" }) : r).then((res) => {
      if (res.status === 0) return res;
      const h = new Headers(res.headers);
      h.set("Cross-Origin-Embedder-Policy", "require-corp");
      h.set("Cross-Origin-Opener-Policy", "same-origin");
      h.set("Cross-Origin-Resource-Policy", "same-origin");
      return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
    })
  );
});
