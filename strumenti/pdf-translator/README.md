# DocuShift 4

Strumento statico per PDF con testo selezionabile. Non richiede backend o build.

## Flusso

1. Scegli OpenAI o Gemini, inserisci la chiave e premi **Connetti e verifica**. La verifica esegue una breve generazione reale: controlla sia la chiave sia l'accesso al modello. Le API hanno la propria fatturazione.
2. Carica il PDF. Dal primo testo disponibile parte il rilevamento della lingua, mentre il browser continua a estrarre le pagine. Prima del rilevamento il testo viene già inviato al provider scelto.
3. Scegli la destinazione e avvia la traduzione. Nessun passaggio automatico a un altro provider.
4. Il browser controlla tutti gli ID della risposta e cerca i font su Fontsource usando i nomi effettivi dei metadati PDF. Per i font proprietari cerca equivalenti gratuiti. Scarica solo i sottoinsiemi Unicode necessari, in memoria per la singola composizione.
5. Un algoritmo misura avanzamenti, contorni e ingombro dei glifi, mantiene le coordinate e le trasformazioni originali e riduce la dimensione finché il testo entra nel riquadro. L'AI non controlla il layout e non deve abbreviare il contenuto.
6. Anteprima affiancata, avvisi su sostituzioni e leggibilità, download PDF.

## Implementazione

- `ai-service.js`: Responses API OpenAI con Structured Outputs, Gemini con ricerca dei modelli disponibili e output JSON Schema. Timeout 60 secondi, massimo quattro tentativi per errori temporanei, annullamento tramite AbortSignal. Errori permanenti e quota di fatturazione interrompono la richiesta.
- `pdf-engine.js`: PDF.js per estrazione e anteprima; pdf-lib e fontkit per compilazione vettoriale. Un lexer distingue gli operatori PDF da stringhe, array e commenti. Rimuove solo gli operatori di visualizzazione del testo, mantenendo gli altri comandi; attraversa anche i Form XObject. Immagini e grafica non sono rasterizzate. Le librerie locali non sono state sostituite.
- `app.js`: una sola operazione attiva, chiusura delle anteprime, revoca dei Blob URL, blocco dei controlli durante le operazioni, annullamento e recupero del rilevamento lingua.
- `glossary.js`: corrispondenza esplicita nomi lingua/ISO; validazione dei dati e rigenerazione degli ID importati.

Le chiavi restano nella sessione della scheda, salvo selezione esplicita di **Ricorda**. Non sono inserite in URL, link condivisibili o file del repository. I vecchi magic link vengono ancora consumati per compatibilità; non vengono più generati. Il file locale `config.local.js` non viene caricato.

## Font e limiti

Endpoint gratuito: `https://api.fontsource.org/v1/fonts/{id}`; download TTF indicato dai metadati su `cdn.jsdelivr.net/fontsource/fonts/`. Richieste con timeout, cache della sola operazione e verifica della copertura dei caratteri. Se un carattere non è disponibile, l'esportazione si interrompe senza sostituirlo con spazi o quadrati.

Non è possibile garantire l'identità tipografica usando un equivalente di un font proprietario. Gli ingombri restano vincolati ai riquadri originali; testi molto più lunghi possono diventare piccoli, e vengono segnalati. Non viene imposta una dimensione minima che causerebbe sbordature.

Non sono supportati OCR, scrittura verticale, font Type 3, testo invisibile/contornato/usato come maschera e stream con immagini inline binarie. I casi riconosciuti vengono rifiutati esplicitamente anziché riscritti con una regex. Le annotazioni e i campi modulo vengono conservati, ma il loro testo non viene tradotto. L'ordine dei livelli grafici particolari e i documenti complessi richiedono un controllo visivo del risultato; una sostituzione universale e identica di qualsiasi PDF non è garantita.

## Verifica

Eseguire dalla radice del repository:

```sh
node --test strumenti/pdf-translator/pdf-translator.test.cjs
```

La suite usa API simulate, senza chiavi reali e senza spese. Verifica payload OpenAI, selezione Gemini, risposte incomplete/riordinate/duplicate, errori permanenti, annullamento, glossario, lexer PDF, Form XObject e fitting. Il test di compilazione reale usa un TTF locale tramite `DOCUSHIFT_TEST_FONT` (su Windows usa Arial se disponibile); sugli altri sistemi quel test viene saltato se non si indica un font.

Durante questo aggiornamento è stato verificato anche il download pubblico di Arimo da Fontsource. Collaudo browser isolato con API simulate: connessione, rilevamento, traduzione, download, desktop/mobile e annullamento. Confronto pixel del documento campione: immagini e sfondo fuori dalle aree di testo identici. Le chiamate con una chiave personale devono essere verificate dall'interfaccia; non sono state eseguite generazioni con credenziali reali durante lo sviluppo.

Documentazione: [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [Gemini Models API](https://ai.google.dev/api/models), [Fontsource Font ID](https://fontsource.org/docs/api/font-id).
