/* ============================================================
 * CROOKED MOON — Firebase Configuration
 * ============================================================
 *
 * Per attivare il sistema Account + sincronizzazione cloud:
 *
 * 1. Vai su https://console.firebase.google.com/
 * 2. Crea un nuovo progetto (gratuito, piano "Spark")
 * 3. Aggiungi una "Web App" al progetto (icona </>)
 * 4. Copia l'oggetto `firebaseConfig` che ti mostra
 * 5. Incollalo qui sotto, sovrascrivendo l'oggetto vuoto
 * 6. Nella console Firebase abilita:
 *    - Authentication → Sign-in method → Email/Password
 *    - Firestore Database → Crea database (modalità produzione)
 *    - Firestore Database → Rules: vedi sotto
 *
 * REGOLE FIRESTORE consigliate (sicurezza minima — ogni utente
 * legge/scrive solo i propri dati):
 *
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     match /users/{userId} {
 *       allow read, write: if request.auth != null && request.auth.uid == userId;
 *     }
 *   }
 * }
 *
 * Senza questa configurazione l'app continua a funzionare ma
 * salva i dati solo localmente nel browser.
 * ============================================================ */

window.cmFirebaseConfig = {
  apiKey: "AIzaSyC1TwxZdH-3ybmdQ_thUG64S-HICwSqcsI",
  authDomain: "crooked-moon-606aa.firebaseapp.com",
  projectId: "crooked-moon-606aa",
  storageBucket: "crooked-moon-606aa.firebasestorage.app",
  messagingSenderId: "415070736662",
  appId: "1:415070736662:web:027deacf049b4f7dd2c037"
};
