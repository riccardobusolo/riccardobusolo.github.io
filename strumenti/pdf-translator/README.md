# DocuShift

## OpenAI

Selezionare OpenAI nel menu Provider AI, inserire la propria chiave API Platform, scegliere GPT-4.1 mini, GPT-4.1 nano, GPT-4o mini, GPT-5 mini o GPT-5 nano (ragionamento minimo) e premere Testa il modello OpenAI. Ogni test esegue una sola richiesta a consumo sul modello selezionato. Nessun ripiego automatico su altri modelli o provider a pagamento. Il credito API è separato dall'abbonamento ChatGPT. Il link Credito API apre la fatturazione personale; questa app non effettua acquisti e non imposta un limite di spesa di 20 euro.

La connessione usa POST https://api.openai.com/v1/responses con Authorization Bearer, store:false, timeout di 45 secondi e schema JSON rigoroso per le traduzioni. Le chiavi e i modelli verificati vengono mantenuti separatamente per provider, esclusivamente nella memoria della scheda. Il cambio provider non invia richieste. Una chiave modificata richiede una nuova verifica. Nei log non vengono incluse chiavi, testi dei documenti o messaggi grezzi del provider.

`node strumenti/pdf-translator/openai.test.cjs`

I test OpenAI usano risposte HTTP simulate; una verifica reale richiede la chiave del visitatore e credito disponibile.

App statica per GitHub Pages. Aprire tramite HTTP, non file://. Nessun build e nessun backend.

Ogni visitatore inserisce una chiave personale del provider scelto, mantenuta esclusivamente in memoria. Con Gemini i testi vengono inviati a generativelanguage.googleapis.com con header x-goog-api-key; con OpenAI a api.openai.com con Authorization Bearer. Il PDF non viene caricato a un server. Nessun analytics o storage delle chiavi. Google Fonts viene usato per la sola UI.

La diagnostica elenca tramite models.list i modelli Gemini di testo e prova fino a sei modelli con generateContent, privilegiando Flash e Flash Lite stabili. Ogni test esegue una vera richiesta. Una risposta positiva non certifica un piano gratuito: controllare quote e fatturazione in Google AI Studio. I limiti possono essere condivisi fra modelli. La traduzione ripiega esclusivamente sui modelli già verificati e interrompe l'esportazione se un blocco non viene tradotto. Nessuna promessa di disponibilità gratuita illimitata.

Modalità simulata: nessuna chiamata AI; sostituisce le righe con [TEST n]. Serve per verificare caricamento, rimozione del testo, rendering ed esportazione.

## Glossario e revisione

Con un provider configurato, prima della traduzione una richiesta crea il glossario del documento: nomi di prodotto e componenti, termini ricorrenti, titoli presenti anche nell'indice, intestazioni e parole di sicurezza secondo la convenzione della lingua di destinazione (per l'italiano PERICOLO, AVVERTENZA, ATTENZIONE, AVVISO). Il glossario viene allegato a ogni blocco di traduzione. Marchi, codici e slogan restano invariati; se il documento usa già un termine nella lingua di destinazione, viene riutilizzato.

Con OpenAI ogni testo tradotto riporta anche la lingua dell'originale: i passaggi in una lingua diversa da quella principale del documento (per esempio una dichiarazione ripetuta in più lingue) restano invariati, senza dipendere dal giudizio del modello.

Con "Revisione finale automatica" (attiva per default) il modello rilegge originale e traduzione in parti da circa 80 testi, fino a 4 in parallelo, e restituisce solo le correzioni: errori di senso, omissioni, incoerenze di terminologia (indice/titoli, intestazioni), parole di sicurezza, testo non tradotto, testo in altre lingue tradotto per errore, numeri o codici alterati. Le correzioni con id inesistente o con tag di stile diversi dall'originale vengono scartate; ogni correzione applicata compare nel registro. Glossario e revisione sono facoltativi: se una delle due richieste fallisce, la traduzione prosegue senza.

`node strumenti/pdf-translator/quality.test.cjs`

## Motore PDF beta

PDF.js legge testo e coordinate; pdf-lib modifica i content stream tramite un lexer che rimuove gli operatori di stampa del testo, anche nei Form XObject. La grafica resta vettoriale. Il risultato viene copiato in un documento nuovo per non conservare stream originali non referenziati. Nessun rettangolo bianco sovrapposto e nessuna rasterizzazione della pagina.

Le righe vengono raggruppate in paragrafi (stesso allineamento, interlinea e stile; le righe piene continuano nella successiva, gli elenchi numerati e puntati iniziano un nuovo blocco), così il modello traduce frasi intere. Il testo tradotto viene poi ridistribuito sulle stesse righe e posizioni originali, con giustificazione se l'originale era giustificato. Celle di tabella, intestazioni allineate a destra, testi centrati e voci di indice con puntini di guida (i puntini e il numero di pagina vengono ricostruiti) sono riconosciuti. Gli stili misti nello stesso paragrafo (grassetto, corsivo, colore) vengono inviati al modello come tag `<sN>` e ripristinati.

Se la traduzione è più lunga, il motore misura lo spazio davvero libero sulla pagina (rendering senza testo: grafica, riquadri e altri blocchi sono ostacoli): le etichette isolate si allargano a destra e i paragrafi possono usare righe in più. I blocchi consecutivi della stessa colonna formano un flusso: le righe aggiunte spostano in basso i blocchi successivi, fin dove c'è spazio libero, e un'eventuale riduzione è identica per tutta la colonna, così il corpo del testo resta uniforme. Solo dopo, il testo viene condensato leggermente in orizzontale (fino al 90%) e infine ridotto di corpo. Se una risposta del modello ha un numero di testi diverso da quello inviato, il blocco viene ritradotto in due metà. Il testo che nell'originale non è visibile (coperto da immagini, ritagliato o nello stesso colore dello sfondo) viene individuato confrontando il rendering della pagina con e senza testo, e non viene ridisegnato né tradotto.

Font: per i font originali più comuni vengono incorporati font metricamente compatibili, open source (SIL OFL), caricati solo se servono: Calibri → Carlito, Arial/Helvetica → Arimo, Times → Tinos, Cambria → Caladea, nei sottoinsiemi latin e latin-ext (cartella `fonts/`). I caratteri mancanti ricadono sui font PDF standard. fontkit (MIT) serve per l'incorporamento.

Limiti: 25 MB, 100 pagine, almeno una riga di testo per pagina; nessun OCR. I collegamenti PDF (`/Link`), compresi quelli di un sommario, vengono mantenuti. Non supportati: password, campi modulo, commenti, timbri e altre annotazioni con aspetto visivo, rotazioni, origini pagina personalizzate, testo verticale/RTL, font Type 3, inline images, testo come maschera/contorno/invisibile e alcuni effetti di trasparenza. La beta non traduce testi incorporati nelle immagini. Nessuna verifica automatica completa della fedeltà di qualunque PDF.

L'elaborazione di file grandi può usare molta RAM. Annullamento cooperativo fra le fasi PDF e immediato sulle richieste di rete. Le trasformazioni sincrone del PDF possono ritardare la risposta del pulsante Annulla.

## Verifica

`node strumenti/pdf-translator/pdf-translator.test.cjs`

`node strumenti/pdf-translator/progress.test.cjs`

Il pannello di elaborazione mostra fase, pagine/testi completati, percentuale per fasi, tempo trascorso e registro dei tentativi. Durante una richiesta AI la percentuale resta ferma finché non arriva un risultato validato, mentre spinner e timer continuano. Ogni tentativo API ha un timeout di 45 secondi; i ripieghi sui modelli verificati sono visibili nel registro. Errori e annullamenti restano visibili nel pannello. Il test di progressione simula una richiesta pendente, successo, errore di quota e annullamento.

I test usano un PDF sintetico con immagini, grafica, testo e Form XObject. Verificano rimozione del testo originale, estrazione del nuovo testo e diagnostica Gemini con risposte simulate. Il test reale richiede una chiave dell'utente.

Le richieste vengono inviate in blocchi di testi vicini (contesto per la terminologia), fino a 4 in parallelo con OpenAI e 2 con Gemini; se un blocco fallisce non viene esportato alcun PDF parziale. Le istruzioni di traduzione sono condivise in `prompt.js`.

Le tre librerie PDF sono distribuzioni di terze parti mantenute dal repository precedente (PDF.js Apache-2.0, pdf-lib MIT). Tutto il codice applicativo è stato riscritto.
