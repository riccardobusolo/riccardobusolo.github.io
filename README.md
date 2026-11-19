# melonDS per Aero Arcade (due DS collegati)

Ramo di lavoro, separato dal sito. Contiene melonDS (licenza GPL-3.0, vedi `wasmelonDS/LICENSE`)
nella versione per browser del progetto [DS Anywhere](https://github.com/brxxn/ds-anywhere),
con un'aggiunta: `wasmelonDS/src/frontend/duo`, che fa girare **due Nintendo DS nella stessa pagina**
collegati con il wireless locale di melonDS (LocalMP), ognuno nel suo thread.

GitHub Actions compila a ogni modifica e salva `duo.js` e `duo.wasm` in `dist/`.
