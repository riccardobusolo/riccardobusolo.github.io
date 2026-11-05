# DocuShift

## OpenAI

Modelli disponibili (listino OpenAI del 1 novembre 2026, USD per milione di token input/output): GPT-6.1 Sol (consigliato, 2/10), GPT-6.1 Terra (1/5), GPT-6 Astra (massima qualità, 10/50) e GPT-5 mini (economico, 0,25/2, prezzo storico non più presente nel listino). I modelli meno affidabili nei test (GPT-5 nano, GPT-4.1 nano, GPT-4o mini, GPT-4.1 mini) sono stati rimossi. Ogni modello usa il livello di ragionamento più basso che accetta (Sol e Astra: low; Terra: none; GPT-5 mini: minimal).

La chiave viene verificata appena incollata con `GET /v1/models` (nessun token consumato): l'app mostra quali modelli sono disponibili sull'account e disattiva gli altri. Facoltativamente la chiave può essere ricordata in questo browser (localStorage, opzione "Ricorda su questo dispositivo"); in quel caso a ogni apertura dell'app la verifica parte da sola.

Accanto a ogni modello sono indicati il costo stimato per 10 pagine e per il PDF caricato, in euro (≈, arrotondati al centesimo). OpenAI fattura in dollari: il cambio BCE viene aggiornato a ogni apertura dall'API pubblica Frankfurter (api.frankfurter.dev, nessun dato inviato oltre la richiesta stessa) e memorizzato nel browser; senza rete si usa l'ultimo valore noto. La stima usa i token per carattere misurati per ciascun modello su una traduzione completa del manuale di prova (glossario, traduzione e revisione, ragionamento incluso; circa 1,4–2,3 token in ingresso e 0,4–0,6 in uscita per carattere) e i prezzi di listino; 10 pagine = circa 12.000 caratteri. Sul manuale di prova (18 pagine): GPT-6.1 Sol circa $0,15 in 36 s, GPT-6.1 Terra circa $0,08, GPT-6 Astra circa $0,90 addebitati con qualità analoga a Sol (stima corretta al rialzo del 17% rispetto ai token misurati), GPT-5 mini circa $0,04 ma con errori di terminologia. A fine traduzione l'app somma i token effettivamente riportati da OpenAI (input, input in cache, output) e mostra il costo del documento; con Gemini mostra i token usati.

Le richieste usano POST https://api.openai.com/v1/responses con store:false, timeout di 2 minuti e schema JSON rigoroso. Nei log non vengono inclusi chiavi, testi dei documenti o messaggi grezzi del provider.

`node strumenti/pdf-translator/openai.test.cjs`

I test OpenAI usano risposte HTTP simulate; una verifica reale richiede la chiave del visitatore e credito disponibile.

App statica per GitHub Pages. Aprire tramite HTTP, non file://. Nessun build e nessun backend.

Ogni visitatore inserisce una chiave personale del provider scelto, mantenuta in memoria oppure, solo se lo sceglie, in questo browser. Con Gemini i testi vengono inviati a generativelanguage.googleapis.com con header x-goog-api-key; con OpenAI a api.openai.com con Authorization Bearer. Il PDF non viene caricato a un server. Nessun analytics o storage delle chiavi. Google Fonts viene usato per la sola UI.

La diagnostica elenca tramite models.list i modelli Gemini di testo e prova fino a sei modelli con generateContent, privilegiando Flash e Flash Lite stabili. Ogni test esegue una vera richiesta. Una risposta positiva non certifica un piano gratuito: controllare quote e fatturazione in Google AI Studio. I limiti possono essere condivisi fra modelli. La traduzione ripiega esclusivamente sui modelli già verificati e interrompe l'esportazione se un blocco non viene tradotto. Nessuna promessa di disponibilità gratuita illimitata.

Indicazioni per l’AI (facoltative): testo libero, ad esempio termini da non tradurre o un cambio di tono, inviato con glossario, traduzione e revisione. Hanno la precedenza sulle regole predefinite di stile e su cosa tradurre, mai sul formato della risposta, sui tag e su numeri e codici. Senza indicazioni l’AI decide da sola cosa lasciare invariato, ma solo con quasi totale certezza: nel dubbio traduce. Ogni testo viene inviato con la pagina in cui compare e, per titoli e intestazioni, il ruolo (titolo di pagina = carattere più grande della pagina), così indicazioni come «cambia il titolo della prima pagina» trovano il testo giusto. I testi modificati su indicazione non vengono riportati all’originale dal controllo delle altre lingue né toccati dalla revisione; il registro li elenca. Le dichiarazioni ripetute in più lingue restano invariate, compresa la versione nella lingua del documento.

Le righe stampate una sopra l’altra già nell’originale (parole residue di una modifica, testo duplicato) mantengono solo la più lunga, così la traduzione non si sovrappone; il numero dei frammenti omessi compare a fine traduzione.

## Interfaccia

Tutto sta in una schermata senza scorrere (da 1366×768 in su): a sinistra provider, chiave, tabella dei modelli con i costi, lingua e opzioni; a destra il documento con anteprima originale/tradotto a tutta altezza, avanzamento compatto e download. Il PDF si può trascinare su tutta l'area di lavoro. Il pulsante «⛶ Schermo intero» nella barra in alto porta tutto lo strumento a schermo intero (Esc per uscire). Cliccando un’anteprima si apre il visore a schermo intero: originale e traduzione affiancati in un’unica area che scorre insieme, adattati alla larghezza, con zoom (75–300%), pagine con frecce o tastiera (← →, + −, Esc) e la scelta fra pagine affiancate, solo originale o solo tradotto. In modifica, sotto i 1700 px di larghezza, viene mostrata di default solo la pagina tradotta. Spiegazioni e limiti sono nel pannello "Come funziona" e nei suggerimenti "?". Sotto i 980 px di larghezza il layout si impila.

## Lingue

46 lingue e varianti di destinazione in alfabeto latino, greco e cirillico, fra cui inglese britannico e americano, olandese e fiammingo, danese, lettone, ungherese, slovacco, portoghese europeo e brasiliano, spagnolo di Spagna e dell'America Latina, serbo latino e cirillico, vietnamita. Al modello va il nome inglese esatto della variante, con ortografia, lessico e separatore decimale della variante (1,5 → 1.5 in inglese). Le parole di sicurezza hanno una convenzione fissa per italiano, inglese, francese, tedesco, spagnolo, portoghese, olandese e danese; per le altre lingue si segue ISO 3864 / ANSI Z535. L'ultima lingua scelta viene ricordata nel browser. Arabo, ebraico e lingue CJK non sono offerti: richiedono scrittura da destra a sinistra o font molto grandi.

## Dopo la traduzione: correzione e modifica

L'ultima traduzione resta in memoria, così il PDF si può ricomporre senza ritradurre:

- **Correzione per l'AI** (scheda "Rifinisci"): una richiesta in linguaggio naturale, per esempio «traduci "allarme" con "alarm" ovunque». Il modello rilegge originale, traduzione attuale, pagina e ruolo di ogni testo e restituisce solo i testi da cambiare; se una parte fallisce non viene applicato nulla e il PDF precedente resta valido. Costa circa quanto una revisione e il costo si somma a quello mostrato.
- **Modifica i testi** (pulsante sopra l’anteprima tradotta): si apre il visore a schermo intero con l’elenco dei testi della pagina, originale accanto alla traduzione modificabile. Passando su un testo la sua posizione si evidenzia sulle pagine (sulla traduzione nel punto in cui è stata davvero disegnata); cliccando la pagina si apre il testo corrispondente. Le parole in un altro stile (grassetto, colore) appaiono evidenziate invece che come tag. Le modifiche restano in bozza anche cambiando pagina e si applicano tutte insieme; un testo ripetuto (intestazioni, piè di pagina) cambia ovunque. Nessuna chiamata AI.

**Solo modifica** («✎ Modifica senza tradurre», sotto Traduci): per un PDF già tradotto. Il PDF caricato diventa subito il risultato e si apre l'editor, senza chiave AI né costi; la lingua scelta indica quella del documento, utile se si usa anche la correzione AI. Alla prima modifica applicata tutto il testo del PDF viene ricomposto con i font equivalenti; il file scaricato si chiama «…-modificato.pdf».

I testi corretti o modificati non vengono più toccati dai controlli automatici (lingua dell'originale, maiuscole).

## Glossario e revisione

Con un provider configurato, prima della traduzione una richiesta crea il glossario del documento: nomi di prodotto e componenti, termini ricorrenti, titoli presenti anche nell'indice, intestazioni e parole di sicurezza secondo la convenzione della lingua di destinazione (per l'italiano PERICOLO, AVVERTENZA, ATTENZIONE, AVVISO). Il glossario viene allegato a ogni blocco di traduzione. Marchi, codici e slogan restano invariati; se il documento usa già un termine nella lingua di destinazione, viene riutilizzato.

Con OpenAI ogni testo tradotto riporta anche la lingua dell'originale: i passaggi in una lingua diversa da quella principale del documento (per esempio una dichiarazione ripetuta in più lingue) restano invariati, senza dipendere dal giudizio del modello.

Con "Revisione finale automatica" (attiva per default) il modello rilegge originale e traduzione in parti da circa 80 testi, fino a 4 in parallelo, e restituisce solo le correzioni: errori di senso, omissioni, incoerenze di terminologia (indice/titoli, intestazioni), parole di sicurezza, testo non tradotto, testo in altre lingue tradotto per errore, numeri o codici alterati. Le correzioni con id inesistente o con tag di stile diversi dall'originale vengono scartate; ogni correzione applicata compare nel registro. Glossario e revisione sono facoltativi: se una delle due richieste fallisce, la traduzione prosegue senza.

`node strumenti/pdf-translator/quality.test.cjs`

## Motore PDF beta

PDF.js legge testo e coordinate; pdf-lib modifica i content stream tramite un lexer che rimuove gli operatori di stampa del testo, anche nei Form XObject. La grafica resta vettoriale. Il risultato viene copiato in un documento nuovo per non conservare stream originali non referenziati. Nessun rettangolo bianco sovrapposto e nessuna rasterizzazione della pagina.

Le righe vengono raggruppate in paragrafi (stesso allineamento, interlinea e stile; le righe piene continuano nella successiva, gli elenchi numerati e puntati iniziano un nuovo blocco), così il modello traduce frasi intere. Il testo tradotto viene poi ridistribuito sulle stesse righe e posizioni originali, con giustificazione se l'originale era giustificato. Celle di tabella, intestazioni allineate a destra, testi centrati e voci di indice con puntini di guida (i puntini e il numero di pagina vengono ricostruiti) sono riconosciuti. Gli stili misti nello stesso paragrafo (grassetto, corsivo, colore) vengono inviati al modello come tag `<sN>` e ripristinati.

Se la traduzione è più lunga, il motore misura lo spazio davvero libero sulla pagina (rendering senza testo: grafica, riquadri e altri blocchi sono ostacoli): le etichette isolate si allargano a destra e i paragrafi possono usare righe in più. I blocchi consecutivi della stessa colonna formano un flusso: le righe aggiunte spostano in basso i blocchi successivi, fin dove c'è spazio libero, e un'eventuale riduzione è identica per tutta la colonna, così il corpo del testo resta uniforme. Solo dopo, il testo viene condensato leggermente in orizzontale (fino al 90%) e infine ridotto di corpo. Se una risposta del modello ha un numero di testi diverso da quello inviato, il blocco viene ritradotto in due metà. Il testo che nell'originale non è visibile (coperto da immagini, ritagliato o nello stesso colore dello sfondo) viene individuato confrontando il rendering della pagina con e senza testo, e non viene ridisegnato né tradotto.

Font: per i font originali più comuni vengono incorporati font metricamente compatibili, open source (SIL OFL), caricati solo se servono: Calibri → Carlito, Arial/Helvetica → Arimo, Times → Tinos, Cambria → Caladea, nei sottoinsiemi latin e latin-ext, più greek, cyrillic e vietnamese caricati solo per i caratteri che li richiedono (cartella `fonts/`; Caladea usa quelli di Tinos, il testo monospaziato usa Arimo per le lettere che Courier non ha). Il maiuscoletto di Word (iniziale grande, resto in maiuscolo piccolo) viene riprodotto. Simboli dei font Symbol/Wingdings senza glifo (➢, ▪, ●, ✓, ☐) e le frecce ↑ ↓ ← → sono disegnati come piccole forme vettoriali. I testi non tradotti su una riga (display, codici) mantengono la spaziatura originale. I caratteri ancora mancanti ricadono sui font PDF standard. fontkit (MIT) serve per l'incorporamento.

Allineamento: un paragrafo con le righe che finiscono allo stesso bordo destro (o centrate) ma iniziano in punti diversi resta allineato a destra (o centrato); le righe singole allineate a destra si riconoscono da una riga vicina con lo stesso bordo destro (intestazioni). Le etichette brevi (fino a 4 parole) vengono rimpicciolite fino all'85% prima di andare a capo.

Limiti: 50 MB, 200 pagine, almeno una riga di testo per pagina; nessun OCR. I collegamenti PDF (`/Link`), compresi quelli di un sommario, vengono mantenuti. Non supportati: password, campi modulo, commenti, timbri e altre annotazioni con aspetto visivo, rotazioni, origini pagina personalizzate, testo verticale/RTL, font Type 3, inline images, testo come maschera/contorno/invisibile e alcuni effetti di trasparenza. La beta non traduce testi incorporati nelle immagini. Nessuna verifica automatica completa della fedeltà di qualunque PDF.

L'elaborazione di file grandi può usare molta RAM. Fra una pagina e l'altra il motore cede il controllo al browser con un `MessageChannel`, che a differenza di `setTimeout` non viene rallentato quando la scheda è in secondo piano. Annullamento cooperativo fra le fasi PDF e immediato sulle richieste di rete. Le trasformazioni sincrone del PDF possono ritardare la risposta del pulsante Annulla.

## Verifica

`node strumenti/pdf-translator/pdf-translator.test.cjs`

`node strumenti/pdf-translator/progress.test.cjs`

Il pannello di elaborazione mostra fase, pagine/testi completati, percentuale per fasi, tempo trascorso e registro dei tentativi. Durante una richiesta AI la percentuale resta ferma finché non arriva un risultato validato, mentre spinner e timer continuano. Ogni tentativo API ha un timeout di 45 secondi; i ripieghi sui modelli verificati sono visibili nel registro. Errori e annullamenti restano visibili nel pannello. Il test di progressione simula una richiesta pendente, successo, errore di quota e annullamento.

I test usano un PDF sintetico con immagini, grafica, testo e Form XObject. Verificano rimozione del testo originale, estrazione del nuovo testo e diagnostica Gemini con risposte simulate. Il test reale richiede una chiave dell'utente.

Le richieste vengono inviate in blocchi di testi vicini (contesto per la terminologia), fino a 4 in parallelo con OpenAI e 2 con Gemini; se un blocco fallisce non viene esportato alcun PDF parziale. Le istruzioni di traduzione sono condivise in `prompt.js`.

Le tre librerie PDF sono distribuzioni di terze parti mantenute dal repository precedente (PDF.js Apache-2.0, pdf-lib MIT). Tutto il codice applicativo è stato riscritto.
