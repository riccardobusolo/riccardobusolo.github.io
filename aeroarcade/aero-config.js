/*
 * ============================================================
 *  AERO ARCADE — configurazione (si modifica con il Blocco note)
 * ============================================================
 * Incolla qui i valori del tuo progetto Supabase (vedi GUIDA-SETUP.md,
 * punto 1.6), salva e pubblica con GitHub Desktop (Commit + Push).
 * Non serve ricompilare nulla.
 *
 * Qui NON vanno segreti: la chiave "anon"/"publishable" è pubblica per
 * natura, la sicurezza sta nelle regole RLS del database.
 * MAI incollare qui la chiave "secret" / "service_role".
 */
window.AERO_CONFIG = {
  // Supabase → pulsante "Connect" → Project URL (es. "https://abcdefghijk.supabase.co")
  SUPABASE_URL: "",

  // Supabase → Project Settings → API Keys → chiave "publishable" (sb_publishable_…) o "anon"
  SUPABASE_ANON_KEY: "",

  // Email dell'utente condiviso creato in Supabase → Authentication → Users
  SHARED_EMAIL: "giocatori@aero-arcade.example",

  // Indirizzo del server netplay (Render o Tailscale). Vuoto = quello predefinito.
  NETPLAY_SERVER_URL: ""
};
