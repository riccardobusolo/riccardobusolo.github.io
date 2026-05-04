/* ============================================================
 * Crooked Moon — Traduzioni italiane degli incantesimi
 * ============================================================
 *
 * Mappa: nome inglese (chiave SPELLS) → {name, description, higherLevels}
 *
 * - `name` (opzionale): nome italiano ufficiale (Manuale del Giocatore
 *   5e Asmodee/WotC, Tasha's, ecc.). Lascia null/undefined per le spell
 *   il cui manuale non è stato tradotto in italiano (verrà mostrato il
 *   nome inglese).
 * - `description` (richiesto): traduzione fedele della descrizione.
 * - `higherLevels` (opzionale): traduzione del paragrafo "Ai livelli
 *   superiori" se presente.
 *
 * Caricato da index.html DOPO spells.js. Se l'utente seleziona italiano
 * (Impostazioni → Lingua incantesimi), il rendering pesca da qui via
 * lookup per nome inglese; fallback all'inglese se la traduzione manca.
 * ============================================================ */
window.SPELLS_IT = window.SPELLS_IT || {};
