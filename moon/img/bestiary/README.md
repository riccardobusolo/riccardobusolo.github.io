# Immagini bestiario

Foto dei mostri del bestiario: **una foto per creatura**.

## Nome del file = nome della creatura
Il nome del file deve corrispondere al nome della creatura, "slugificato":
minuscolo, accenti rimossi, spazi e simboli → trattini, estensione `.webp`.

Esempi (preset attuali):

| Creatura                     | File                              |
|------------------------------|-----------------------------------|
| Aarakocra Aeromante          | `aarakocra-aeromante.webp`        |
| Aarakocra Schermagliatore    | `aarakocra-schermagliatore.webp`  |

L'app cerca automaticamente `img/bestiary/<slug>.webp` in base al nome del mostro.
Se il file manca, mostra un placeholder (nessun errore). Una foto caricata a mano
dall'anteprima (base64) ha la precedenza su quella del repo.

## Formato richiesto
- Ritaglio **quadrato 1:1** (centrato)
- **200×200 px**
- **WebP qualità ~82**

Comando di riferimento (ImageMagick) — riproduce la stessa pipeline dell'app:

```
magick input.jpg -resize 200x200^ -gravity center -extent 200x200 -quality 82 output.webp
```
