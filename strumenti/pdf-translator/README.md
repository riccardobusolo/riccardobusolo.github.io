# DocuShift

## OpenAI

Selezionare OpenAI nel menu Provider AI, inserire la propria chiave API Platform, scegliere GPT-4.1 mini, GPT-4.1 nano o GPT-4o mini e premere Testa il modello OpenAI. Ogni test esegue una sola richiesta a consumo sul modello selezionato. Nessun ripiego automatico su altri modelli o provider a pagamento. Il credito API è separato dall'abbonamento ChatGPT. Il link Credito API apre la fatturazione personale; questa app non effettua acquisti e non imposta un limite di spesa di 20 euro.

La connessione usa POST https://api.openai.com/v1/responses con Authorization Bearer, store:false, timeout di 45 secondi e schema JSON rigoroso per le traduzioni. Le chiavi e i modelli verificati vengono mantenuti separatamente per provider, esclusivamente nella memoria della scheda. Il cambio provider non invia richieste. Una chiave modificata richiede una nuova verifica. Nei log non vengono incluse chiavi, testi dei documenti o messaggi grezzi del provider.

`node strumenti/pdf-translator/openai.test.cjs`

I test OpenAI usano risposte HTTP simulate; una verifica reale richiede la chiave del visitatore e credito disponibile.

App statica per GitHub Pages. Aprire tramite HTTP, non file://. Nessun build e nessun backend.

Ogni visitatore inserisce una chiave personale del provider scelto, mantenuta esclusivamente in memoria. Con Gemini i testi vengono inviati a generativelanguage.googleapis.com con header x-goog-api-key; con OpenAI a api.openai.com con Authorization Bearer. Il PDF non viene caricato a un server. Nessun analytics o storage delle chiavi. Google Fonts viene usato per la sola UI.

La diagnostica elenca tramite models.list i modelli Gemini di testo e prova fino a sei modelli con generateContent, privilegiando Flash e Flash Lite stabili. Ogni test esegue una vera richiesta. Una risposta positiva non certifica un piano gratuito: controllare quote e fatturazione in Google AI Studio. I limiti possono essere condivisi fra modelli. La traduzione ripiega esclusivamente sui modelli già verificati e interrompe l'esportazione se un blocco non viene tradotto. Nessuna promessa di disponibilità gratuita illimitata.

Modalità simulata: nessuna chiamata AI; sostituisce le righe con [TEST n]. Serve per verificare caricamento, rimozione del testo, rendering ed esportazione.

## Motore PDF beta

PDF.js legge testo e coordinate; pdf-lib modifica i content stream tramite un lexer che rimuove gli operatori di stampa del testo, anche nei Form XObject. La grafica resta vettoriale. Il risultato viene copiato in un documento nuovo per non conservare stream originali non referenziati. Nessun rettangolo bianco sovrapposto e nessuna rasterizzazione della pagina.

La ricomposizione usa font PDF standard latini equivalenti (Helvetica, Times, Courier, varianti grassetto/corsivo), non i font originali incorporati. Le righe tradotte vengono ridotte per rientrare nella larghezza originale. Non viene garantita identità tipografica, conservazione di struttura semantica/tag di accessibilità, link, metadati o segnalibri. Traduzione per riga, contesto limitato. Colori a livello di riga, non singolo carattere.

Limiti: 25 MB, 100 pagine, almeno una riga di testo per pagina; nessun OCR. Non supportati: password, annotazioni/moduli, rotazioni, origini pagina personalizzate, testo verticale/RTL, font Type 3, inline images, testo come maschera/contorno/invisibile e alcuni effetti di trasparenza. I caratteri fuori WinAnsi producono un errore esplicito. La beta non traduce testi incorporati nelle immagini. Nessuna verifica automatica completa della fedeltà di qualunque PDF.

L'elaborazione di file grandi può usare molta RAM. Annullamento cooperativo fra le fasi PDF e immediato sulle richieste di rete. Le trasformazioni sincrone del PDF possono ritardare la risposta del pulsante Annulla.

## Verifica

`node strumenti/pdf-translator/pdf-translator.test.cjs`

`node strumenti/pdf-translator/progress.test.cjs`

Il pannello di elaborazione mostra fase, pagine/testi completati, percentuale per fasi, tempo trascorso e registro dei tentativi. Durante una richiesta AI la percentuale resta ferma finché non arriva un risultato validato, mentre spinner e timer continuano. Ogni tentativo API ha un timeout di 45 secondi; i ripieghi sui modelli verificati sono visibili nel registro. Errori e annullamenti restano visibili nel pannello. Il test di progressione simula una richiesta pendente, successo, errore di quota e annullamento.

I test usano un PDF sintetico con immagini, grafica, testo e Form XObject. Verificano rimozione del testo originale, estrazione del nuovo testo e diagnostica Gemini con risposte simulate. Il test reale richiede una chiave dell'utente.

Le tre librerie PDF sono distribuzioni di terze parti mantenute dal repository precedente (PDF.js Apache-2.0, pdf-lib MIT). Tutto il codice applicativo è stato riscritto.
