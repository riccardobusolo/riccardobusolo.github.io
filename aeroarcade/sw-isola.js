// Aero Arcade — isolamento delle pagine (solo Chrome/Edge 137 o più recenti).
// Aggiunge a ogni pagina del sito "Document-Isolation-Policy": così la pagina del gioco
// può far girare due DS collegati in wireless (thread e memoria condivisa) proprio
// dentro le console della Home, senza finestre a parte. GitHub Pages non permette di
// impostare questa intestazione, quindi la aggiunge il service worker.
// Tocca solo le pagine (non immagini, giochi o altri file) e non salva niente in cache.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.mode !== "navigate" || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(r).then((res) => {
      // redirect o risposte strane: passano come sono
      if (res.type !== "basic" || res.redirected || res.status === 0) return res;
      const h = new Headers(res.headers);
      h.set("Document-Isolation-Policy", "isolate-and-credentialless");
      return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
    })
  );
});
