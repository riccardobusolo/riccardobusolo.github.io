# DocuShift

App statica per GitHub Pages. Aprire tramite HTTP, non file://. Nessun build e nessun backend.

Ogni visitatore inserisce una chiave Gemini personale, mantenuta esclusivamente in memoria. Testi e richieste vengono inviati direttamente a generativelanguage.googleapis.com con header x-goog-api-key. Il PDF non viene caricato a un server. Nessun analytics o storage delle chiavi. Google Fonts viene usato per la sola UI.

La diagnostica elenca tramite models.list i modelli Gemini di testo e prova fino a sei modelli con generateContent, privilegiando Flash e Flash Lite stabili. Ogni test esegue una vera richiesta. Una risposta positiva non certifica un piano gratuito: controllare quote e fatturazione in Google AI Studio. I limiti possono essere condivisi fra modelli. La traduzione ripiega esclusivamente sui modelli già verificati e interrompe l'esportazione se un blocco non viene tradotto. Nessuna promessa di disponibilità gratuita illimitata.

Modalità simulata: nessuna chiamata Gemini; sostituisce le righe con [TEST n]. Serve per verificare caricamento, rimozione del testo, rendering ed esportazione.

## Motore PDF beta

PDF.js legge testo e coordinate; pdf-lib modifica i content stream tramite un lexer che rimuove gli operatori di stampa del testo, anche nei Form XObject. La grafica resta vettoriale. Il risultato viene copiato in un documento nuovo per non conservare stream originali non referenziati. Nessun rettangolo bianco sovrapposto e nessuna rasterizzazione della pagina.

La ricomposizione usa font PDF standard latini equivalenti (Helvetica, Times, Courier, varianti grassetto/corsivo), non i font originali incorporati. Le righe tradotte vengono ridotte per rientrare nella larghezza originale. Non viene garantita identità tipografica, conservazione di struttura semantica/tag di accessibilità, link, metadati o segnalibri. Traduzione per riga, contesto limitato. Colori a livello di riga, non singolo carattere.

Limiti: 25 MB, 100 pagine, almeno una riga di testo per pagina; nessun OCR. Non supportati: password, annotazioni/moduli, rotazioni, origini pagina personalizzate, testo verticale/RTL, font Type 3, inline images, testo come maschera/contorno/invisibile e alcuni effetti di trasparenza. I caratteri fuori WinAnsi producono un errore esplicito. La beta non traduce testi incorporati nelle immagini. Nessuna verifica automatica completa della fedeltà di qualunque PDF.

L'elaborazione di file grandi può usare molta RAM. Annullamento cooperativo fra le fasi PDF e immediato sulle richieste di rete. Le trasformazioni sincrone del PDF possono ritardare la risposta del pulsante Annulla.

## Verifica

`node strumenti/pdf-translator/pdf-translator.test.cjs`

I test usano un PDF sintetico con immagini, grafica, testo e Form XObject. Verificano rimozione del testo originale, estrazione del nuovo testo e diagnostica Gemini con risposte simulate. Il test reale richiede una chiave dell'utente.

Le tre librerie PDF sono distribuzioni di terze parti mantenute dal repository precedente (PDF.js Apache-2.0, pdf-lib MIT). Tutto il codice applicativo è stato riscritto.
