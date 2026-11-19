// Aggiunge le intestazioni che servono per la memoria condivisa (SharedArrayBuffer),
// che GitHub Pages non permette di impostare: così i due DS possono usare i thread.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.cache === "only-if-cached" && r.mode !== "same-origin") return;
  e.respondWith(
    (r.mode === "navigate" ? fetch(r.url, { cache: "no-cache", credentials: "same-origin" }) : fetch(r)).then((res) => {
      if (res.status === 0) return res;
      const h = new Headers(res.headers);
      h.set("Cross-Origin-Embedder-Policy", "require-corp");
      h.set("Cross-Origin-Opener-Policy", "same-origin");
      h.set("Cross-Origin-Resource-Policy", "same-origin");
      return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
    })
  );
});
