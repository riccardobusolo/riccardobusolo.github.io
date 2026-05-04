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
window.SPELLS_IT = {

  // ============================================================
  // PLAYER'S HANDBOOK 5e — CANTRIPS
  // ============================================================
  "Acid Splash": {
    name: "Fiotto Acido",
    description: "Lanci una bolla di acido. Scegli una creatura entro la gittata, o due entro la gittata e a 1,5 metri l'una dall'altra. Un bersaglio deve riuscire in un tiro salvezza Destrezza o subire 1d6 danni acidi.",
    higherLevels: "Il danno aumenta di 1d6 al 5° livello (2d6), all'11° livello (3d6) e al 17° livello (4d6)."
  },
  "Blade Ward": {
    name: "Protezione dalle Lame",
    description: "Tendi la mano e tracci nell'aria un sigillo di protezione. Fino alla fine del tuo prossimo turno, hai resistenza ai danni contundenti, perforanti e taglienti inflitti da attacchi con armi.",
    higherLevels: null
  },
  "Chill Touch": {
    name: "Tocco Gelido",
    description: "Crei una mano scheletrica spettrale nello spazio di una creatura entro la gittata. Esegui un attacco a distanza con incantesimo. Se colpisci, il bersaglio subisce 1d8 danni necrotici e non può recuperare punti ferita fino all'inizio del tuo prossimo turno. Se colpisci un non morto, esso ha anche svantaggio ai tiri per colpire contro di te fino alla fine del tuo prossimo turno.",
    higherLevels: "Il danno aumenta di 1d8 al 5° livello (2d8), all'11° livello (3d8) e al 17° livello (4d8)."
  },
  "Dancing Lights": {
    name: "Luci Danzanti",
    description: "Crei fino a quattro luci grandi quanto torce entro la gittata, facendole apparire come torce, lanterne o sfere luminose che fluttuano nell'aria. Puoi combinare le quattro luci in una forma luminosa vagamente umanoide di taglia Media. Ogni luce emette luce fioca in un raggio di 3 metri.",
    higherLevels: null,
    materialDesc: "un pochino di fosforo o di legno spettrale, oppure una lucciola luminosa"
  },
  "Druidcraft": {
    name: "Artificio Druidico",
    description: "Sussurrando agli spiriti della natura, crei uno tra diversi effetti minori: un piccolo predittore meteorologico sensoriale innocuo, fai sbocciare istantaneamente un fiore, crei un effetto sensoriale istantaneo innocuo, oppure accendi o spegni istantaneamente una candela, una torcia o un piccolo falò.",
    higherLevels: null
  },
  "Eldritch Blast": {
    name: "Deflagrazione Occulta",
    description: "Un raggio di energia crepitante sfreccia verso una creatura entro la gittata. Esegui un attacco a distanza con incantesimo. Se colpisci, il bersaglio subisce 1d10 danni da forza.",
    higherLevels: "L'incantesimo crea più raggi ai livelli superiori: due raggi al 5° livello, tre all'11° livello e quattro al 17° livello. Puoi dirigerli sullo stesso bersaglio o su bersagli diversi."
  },
  "Fire Bolt": {
    name: "Dardo di Fuoco",
    description: "Lanci un fiocco di fuoco contro una creatura o un oggetto entro la gittata. Esegui un attacco a distanza con incantesimo. Se colpisci, il bersaglio subisce 1d10 danni da fuoco. Un oggetto infiammabile colpito da questo incantesimo prende fuoco se non è indossato o trasportato.",
    higherLevels: "Il danno aumenta di 1d10 al 5° livello (2d10), all'11° livello (3d10) e al 17° livello (4d10)."
  },
  "Friends": {
    name: "Amicizia",
    description: "Per la durata, hai vantaggio a tutte le prove di Carisma rivolte a una creatura a tua scelta che non sia ostile nei tuoi confronti. Quando l'incantesimo termina, la creatura si rende conto che hai usato la magia per influenzare il suo umore e diventa ostile.",
    higherLevels: null,
    materialDesc: "una piccola quantità di trucco applicata sul viso"
  },
  "Guidance": {
    name: "Guida",
    description: "Tocchi una creatura consenziente. Una volta prima che l'incantesimo termini, il bersaglio può tirare 1d4 e aggiungere il numero ottenuto a una prova di caratteristica di sua scelta. Può tirare il dado prima o dopo aver effettuato la prova.",
    higherLevels: null
  },
  "Light": {
    name: "Luce",
    description: "Tocchi un oggetto non più grande di 3 metri in qualsiasi dimensione. Fino al termine dell'incantesimo, l'oggetto emette luce intensa in un raggio di 6 metri e luce fioca per ulteriori 6 metri.",
    higherLevels: null,
    materialDesc: "una lucciola o muschio fosforescente"
  },
  "Mage Hand": {
    name: "Mano Magica",
    description: "Una mano spettrale fluttuante appare in un punto a tua scelta entro la gittata. Puoi usare la mano per manipolare un oggetto, aprire una porta o un contenitore non chiusi a chiave, riporre o prendere un oggetto da un contenitore aperto, oppure versare il contenuto di una fiala. Puoi muovere la mano fino a 9 metri ogni volta che la usi. La mano non può attaccare, attivare oggetti magici o trasportare più di 4,5 kg.",
    higherLevels: null
  },
  "Mending": {
    name: "Riparare",
    description: "Questo incantesimo ripara una singola rottura o lacerazione di un oggetto che tocchi, come un anello di catena spezzato, due metà di una chiave, un mantello strappato o un otre che perde. Finché la rottura o la lacerazione non sia più grande di 30 centimetri in qualsiasi dimensione, la ripari senza lasciare traccia del danno precedente.",
    higherLevels: null,
    materialDesc: "due magneti (lodestone)"
  },
  "Message": {
    name: "Messaggio",
    description: "Punti il dito verso una creatura entro la gittata e sussurri un messaggio. Il bersaglio (e solo il bersaglio) sente il messaggio e può rispondere con un sussurro che solo tu puoi sentire.",
    higherLevels: null,
    materialDesc: "un pezzo corto di filo di rame"
  },
  "Minor Illusion": {
    name: "Illusione Minore",
    description: "Crei un suono o l'immagine di un oggetto entro la gittata che dura per la durata. Se crei un suono, il suo volume può variare da un sussurro a un urlo. Se crei l'immagine di un oggetto, non deve essere più grande di un cubo di 1,5 metri di lato. L'immagine non può creare suoni, luci, odori o altri effetti sensoriali. L'interazione fisica la rivela come un'illusione.",
    higherLevels: null,
    materialDesc: "un pochino di lana di pecora"
  },
  "Poison Spray": {
    name: "Spruzzo Velenoso",
    description: "Tendi la mano verso una creatura che puoi vedere entro la gittata e proietti uno sbuffo di gas nocivo. La creatura deve riuscire in un tiro salvezza Costituzione o subire 1d12 danni da veleno.",
    higherLevels: "Il danno aumenta di 1d12 al 5° livello (2d12), all'11° livello (3d12) e al 17° livello (4d12)."
  },
  "Prestidigitation": {
    name: "Prestidigitazione",
    description: "Questo incantesimo è un piccolo trucco magico che gli incantatori novizi usano per esercitarsi. Crei uno fra diversi effetti sensoriali minori: un effetto sensoriale innocuo, accendere/spegnere una piccola fiamma, pulire/sporcare un piccolo oggetto, raffreddare/riscaldare/insaporire materiale non vivo, creare un colore/segno/simbolo su una superficie, oppure creare un piccolo gingillo non magico o un'immagine illusoria che entri nella tua mano.",
    higherLevels: null
  },
  "Produce Flame": {
    name: "Produrre Fiamma",
    description: "Una fiamma tremolante appare nella tua mano. Emette luce intensa in un raggio di 3 metri e luce fioca per ulteriori 3 metri. Puoi anche scagliare la fiamma contro una creatura entro 9 metri, eseguendo un attacco a distanza con incantesimo. Se colpisci, il bersaglio subisce 1d8 danni da fuoco.",
    higherLevels: "Il danno aumenta di 1d8 al 5° livello (2d8), all'11° livello (3d8) e al 17° livello (4d8)."
  },
  "Ray of Frost": {
    name: "Raggio di Gelo",
    description: "Un raggio gelido di luce blu-bianca sfreccia verso una creatura entro la gittata. Esegui un attacco a distanza con incantesimo. Se colpisci, il bersaglio subisce 1d8 danni da freddo e la sua velocità è ridotta di 3 metri fino all'inizio del tuo prossimo turno.",
    higherLevels: "Il danno aumenta di 1d8 al 5° livello (2d8), all'11° livello (3d8) e al 17° livello (4d8)."
  },
  "Resistance": {
    name: "Resistenza",
    description: "Tocchi una creatura consenziente. Una volta prima che l'incantesimo termini, il bersaglio può tirare 1d4 e aggiungere il numero ottenuto a un tiro salvezza di sua scelta. Può tirare il dado prima o dopo aver effettuato il tiro salvezza.",
    higherLevels: null,
    materialDesc: "un mantello in miniatura"
  },
  "Sacred Flame": {
    name: "Fiamma Sacra",
    description: "Un bagliore simile a una fiamma scende su una creatura che puoi vedere entro la gittata. Il bersaglio deve riuscire in un tiro salvezza Destrezza o subire 1d8 danni radiosi. Il bersaglio non beneficia della copertura per questo tiro salvezza.",
    higherLevels: "Il danno aumenta di 1d8 al 5° livello (2d8), all'11° livello (3d8) e al 17° livello (4d8)."
  },
  "Shillelagh": {
    name: "Randello Incantato",
    description: "Il legno di un randello o di un bastone ferrato che impugni viene infuso del potere della natura. Per la durata, puoi usare la tua caratteristica da incantatore al posto della Forza per i tiri per colpire e i tiri per i danni in mischia con quell'arma, e il dado di danno dell'arma diventa un d8. L'arma diventa anche magica.",
    higherLevels: null,
    materialDesc: "vischio, una foglia di trifoglio e una clava o un bastone ferrato"
  },
  "Shocking Grasp": {
    name: "Stretta Folgorante",
    description: "Una scarica elettrica scaturisce dalla tua mano per colpire una creatura che cerchi di toccare. Esegui un attacco in mischia con incantesimo contro il bersaglio. Hai vantaggio se il bersaglio indossa un'armatura di metallo. Se colpisci, il bersaglio subisce 1d8 danni da fulmine e non può eseguire reazioni fino all'inizio del suo prossimo turno.",
    higherLevels: "Il danno aumenta di 1d8 al 5° livello (2d8), all'11° livello (3d8) e al 17° livello (4d8)."
  },
  "Spare the Dying": {
    name: "Salvare i Morenti",
    description: "Tocchi una creatura vivente che ha 0 punti ferita. La creatura diventa stabile. Questo incantesimo non ha effetto sui non morti o sui costrutti.",
    higherLevels: null
  },
  "Thaumaturgy": {
    name: "Taumaturgia",
    description: "Manifesti un piccolo prodigio, segno di un potere soprannaturale. Crei uno fra diversi effetti: la tua voce rimbomba, fai tremolare le fiamme, causi piccoli tremori innocui, crei un suono istantaneo, fai aprire o chiudere di colpo una porta o una finestra, oppure alteri l'aspetto dei tuoi occhi.",
    higherLevels: null
  },
  "Thorn Whip": {
    name: "Frusta di Spine",
    description: "Crei una lunga frusta simile a una liana coperta di spine che colpisce una creatura entro la gittata. Esegui un attacco in mischia con incantesimo. Se colpisci, la creatura subisce 1d6 danni perforanti, e se la creatura è di taglia Grande o inferiore, la attiri fino a 3 metri più vicino a te.",
    higherLevels: "Il danno aumenta di 1d6 al 5° livello (2d6), all'11° livello (3d6) e al 17° livello (4d6).",
    materialDesc: "lo stelo di una pianta con spine"
  },
  "True Strike": {
    name: "Colpo Accurato",
    description: "Punti un dito contro un bersaglio entro la gittata. La tua magia ti concede una breve intuizione delle difese del bersaglio. Nel tuo prossimo turno, ottieni vantaggio al tuo primo tiro per colpire contro il bersaglio, sempre che l'incantesimo non sia terminato.",
    higherLevels: null
  },
  "Vicious Mockery": {
    name: "Beffa Crudele",
    description: "Scagli una serie di insulti intessuti di sottili incantesimi contro una creatura che puoi vedere entro la gittata. Se il bersaglio può sentirti (anche se non deve necessariamente capirti), deve riuscire in un tiro salvezza Saggezza o subire 1d4 danni psichici e avere svantaggio al prossimo tiro per colpire che esegue prima della fine del suo prossimo turno.",
    higherLevels: "Il danno aumenta di 1d4 al 5° livello (2d4), all'11° livello (3d4) e al 17° livello (4d4)."
  },

  // ============================================================
  // PLAYER'S HANDBOOK 5e — LEVEL 1
  // ============================================================
  "Alarm": {
    name: "Allarme",
    description: "Imposti un allarme contro intrusioni indesiderate. Scegli una porta, una finestra o un'area entro la gittata che non sia più grande di un cubo di 6 metri di lato. Fino al termine dell'incantesimo, un allarme ti avvisa ogni volta che una creatura di taglia Minuscola o superiore tocca o entra nell'area protetta. Scegli un allarme mentale o uno udibile.",
    higherLevels: null,
    materialDesc: "una piccola campanella e un pezzo di sottile filo d'argento"
  },
  "Animal Friendship": {
    name: "Amicizia con gli Animali",
    description: "Questo incantesimo ti permette di convincere una bestia che non vuoi farle del male. Scegli una bestia entro la gittata che puoi vedere. Deve poterti vedere e sentire. Se l'Intelligenza della bestia è 4 o superiore, l'incantesimo fallisce. Altrimenti, deve riuscire in un tiro salvezza Saggezza o essere ammaliata da te per la durata dell'incantesimo.",
    higherLevels: "Puoi influenzare una bestia aggiuntiva per ogni livello di slot superiore al 1°.",
    materialDesc: "un boccone di cibo"
  },
  "Armor of Agathys": {
    name: "Armatura di Agathys",
    description: "Una forza magica protettiva ti circonda, manifestandosi come gelo spettrale. Ottieni 5 punti ferita temporanei per la durata. Se una creatura ti colpisce con un attacco in mischia mentre hai questi punti ferita, la creatura subisce 5 danni da freddo.",
    higherLevels: "Sia i punti ferita temporanei sia i danni da freddo aumentano di 5 per ogni livello di slot superiore al 1°.",
    materialDesc: "una tazza d'acqua"
  },
  "Arms of Hadar": {
    name: "Braccia di Hadar",
    description: "Invochi il potere di Hadar, la Fame Oscura. Tendini di energia oscura erompono da te e percuotono tutte le creature entro 3 metri. Ogni creatura deve effettuare un tiro salvezza Forza. Con un fallimento, il bersaglio subisce 2d6 danni necrotici e non può eseguire reazioni fino al suo prossimo turno. Con un successo, dimezza i danni e nessun altro effetto.",
    higherLevels: "Il danno aumenta di 1d6 per ogni livello di slot superiore al 1°."
  },
  "Bane": {
    name: "Anatema",
    description: "Fino a tre creature entro la gittata che puoi vedere devono effettuare tiri salvezza Carisma. Ogni volta che un bersaglio che fallisce questo tiro salvezza esegue un tiro per colpire o un tiro salvezza prima del termine dell'incantesimo, deve tirare 1d4 e sottrarre il numero ottenuto dal tiro per colpire o dal tiro salvezza.",
    higherLevels: "Puoi bersagliare una creatura aggiuntiva per ogni livello di slot superiore al 1°.",
    materialDesc: "una goccia di sangue"
  },
  "Bless": {
    name: "Benedizione",
    description: "Benedici fino a tre creature a tua scelta entro la gittata. Ogni volta che un bersaglio esegue un tiro per colpire o un tiro salvezza prima del termine dell'incantesimo, può tirare 1d4 e aggiungere il numero ottenuto al tiro per colpire o al tiro salvezza.",
    higherLevels: "Puoi bersagliare una creatura aggiuntiva per ogni livello di slot superiore al 1°.",
    materialDesc: "una spruzzata di acqua santa"
  },
  "Burning Hands": {
    name: "Mani Brucianti",
    description: "Una sottile lamina di fiamme erompe dalle punte delle tue dita tese. Ogni creatura in un cono di 4,5 metri deve effettuare un tiro salvezza Destrezza. Con un fallimento, subisce 3d6 danni da fuoco, o metà con un successo. Il fuoco accende oggetti infiammabili nell'area che non siano indossati o trasportati.",
    higherLevels: "Il danno aumenta di 1d6 per ogni livello di slot superiore al 1°."
  },
  "Charm Person": {
    name: "Charme su Persone",
    description: "Tenti di ammaliare un umanoide che puoi vedere entro la gittata. Deve effettuare un tiro salvezza Saggezza, con vantaggio se tu o i tuoi alleati lo state combattendo. Con un fallimento, è ammaliato da te fino al termine dell'incantesimo o finché tu o i tuoi alleati non gli farete qualcosa di dannoso. La creatura ammaliata ti considera un conoscente amichevole.",
    higherLevels: "Puoi bersagliare una creatura aggiuntiva per ogni livello di slot superiore al 1°."
  },
  "Chromatic Orb": {
    name: "Globo Cromatico",
    description: "Lanci una sfera di energia di 10 centimetri di diametro contro una creatura entro la gittata. Scegli acido, freddo, fuoco, fulmine, veleno o tuono per il tipo di sfera che crei, poi esegui un attacco a distanza con incantesimo. Se colpisci, la creatura subisce 3d8 danni del tipo scelto.",
    higherLevels: "Il danno aumenta di 1d8 per ogni livello di slot superiore al 1°.",
    materialDesc: "un diamante del valore di almeno 50 mo"
  },
  "Color Spray": {
    name: "Spruzzo Colorato",
    description: "Una serie abbagliante di luci colorate lampeggianti scaturisce dalla tua mano. Tira 6d10; il totale è il numero di punti ferita di creature che questo incantesimo può influenzare. Le creature in un cono di 4,5 metri vengono colpite in ordine ascendente dei loro punti ferita attuali. Ogni creatura colpita è accecata fino al termine dell'incantesimo.",
    higherLevels: "Tira 2d10 aggiuntivi per ogni livello di slot superiore al 1°.",
    materialDesc: "un pizzico di polvere o sabbia colorata di rosso, giallo e blu"
  },
  "Command": {
    name: "Comando",
    description: "Pronunci una singola parola di comando rivolta a una creatura entro la gittata che tu sia in grado di vedere. Il bersaglio deve riuscire in un tiro salvezza Saggezza o sarà costretto a obbedire al comando nel proprio turno successivo. L'incantesimo non ha alcun effetto se il bersaglio è non morto, non comprende la tua lingua, oppure se il comando impartito è dannoso in modo diretto.\n\nDi seguito alcuni comandi tipici e i relativi effetti. Puoi impartire anche comandi diversi: in quei casi il DM decide come si comporta il bersaglio. Se il bersaglio non è in grado di eseguire il comando, l'incantesimo termina.\n\nAvvicinati. Il bersaglio si sposta verso di te lungo il percorso più breve e diretto, terminando il proprio turno appena giunge entro 1,5 metri da te.\n\nFermo. Il bersaglio non si muove e non effettua alcuna azione. Una creatura volante resta sospesa in aria se ne è in grado; in caso contrario vola della distanza minima necessaria a restare in aria.\n\nFuggi. Il bersaglio impiega il proprio turno per allontanarsi da te il più rapidamente possibile.\n\nLascia. Il bersaglio lascia cadere ciò che ha in mano, poi termina il proprio turno.\n\nSupplica. Il bersaglio cade prono e termina il proprio turno.",
    higherLevels: "Quando lanci questo incantesimo usando uno slot incantesimo di 2° livello o superiore, puoi influenzare una creatura aggiuntiva per ogni slot di livello superiore al 1°. Quando le bersagli, le creature devono trovarsi a non più di 9 metri l'una dall'altra."
  },
  "Compelled Duel": {
    name: "Duello Obbligato",
    description: "Tenti di costringere una creatura in un duello. Una creatura entro la gittata che puoi vedere deve effettuare un tiro salvezza Saggezza. Con un fallimento, è attratta verso di te dalla tua intimazione divina. Il bersaglio ha svantaggio ai tiri per colpire contro creature diverse da te, e deve effettuare un tiro salvezza Saggezza ogni volta che cerca di muoversi a più di 9 metri da te.",
    higherLevels: null
  },
  "Comprehend Languages": {
    name: "Comprensione dei Linguaggi",
    description: "Per la durata, comprendi il significato letterale di qualsiasi linguaggio parlato che senti. Comprendi anche qualsiasi linguaggio scritto che vedi, ma devi toccare la superficie su cui sono scritte le parole. Ci vuole circa 1 minuto per leggere una pagina di testo. Questo incantesimo non decifra messaggi segreti o glifi.",
    higherLevels: null,
    materialDesc: "un pizzico di fuliggine e sale"
  },
  "Create or Destroy Water": {
    name: "Creare o Distruggere Acqua",
    description: "Al lancio scegli uno dei due effetti.\n\nCreare Acqua. Generi fino a 40 litri di acqua pulita all'interno di un contenitore aperto entro gittata, oppure fai cadere la stessa quantità sotto forma di pioggia in un cubo con spigolo di 9 metri entro gittata, estinguendo eventuali fiamme presenti nell'area.\n\nDistruggere Acqua. Annienti fino a 40 litri d'acqua presenti in un contenitore aperto entro gittata, oppure dissolvi la nebbia in un cubo con spigolo di 9 metri entro gittata.",
    higherLevels: "Per ogni slot incantesimo di livello superiore al 1° usato, la quantità d'acqua generata o distrutta aumenta di 40 litri, oppure lo spigolo del cubo aumenta di 1,5 metri.",
    higherLevels: "Crei o distruggi 38 litri d'acqua aggiuntivi, oppure il cubo aumenta di 1,5 metri, per ogni livello di slot superiore al 1°.",
    materialDesc: "una goccia d'acqua (creare) o alcuni granelli di sabbia (distruggere)"
  },
  "Cure Wounds": {
    name: "Cura Ferite",
    description: "Una creatura che tocchi recupera un numero di punti ferita pari a 1d8 + il tuo modificatore di caratteristica da incantatore. Questo incantesimo non ha effetto sui non morti o sui costrutti.",
    higherLevels: "La cura aumenta di 1d8 per ogni livello di slot superiore al 1°."
  },
  "Detect Evil and Good": {
    name: "Individuazione del Bene e del Male",
    description: "Per la durata, sai se c'è un'aberrazione, un celestiale, un elementale, un folletto, un immondo o un non morto entro 9 metri da te, e dove si trova. Allo stesso modo, sai se c'è un luogo o un oggetto entro 9 metri da te che è stato consacrato o profanato magicamente.",
    higherLevels: null
  },
  "Detect Magic": {
    name: "Individuazione del Magico",
    description: "Per la durata, percepisci la presenza di magia entro 9 metri da te. Se percepisci la magia in questo modo, puoi usare la tua azione per vedere una debole aura intorno a qualsiasi creatura o oggetto visibile nell'area che reca magia, e impari la sua scuola di magia, se ne ha una.",
    higherLevels: null
  },
  "Detect Poison and Disease": {
    name: "Individuazione delle Malattie e dei Veleni",
    description: "Per la durata, puoi percepire la presenza e la posizione di veleni, creature velenose e malattie entro 9 metri da te. Identifichi anche il tipo di veleno, di creatura velenosa o di malattia in ciascun caso.",
    higherLevels: null,
    materialDesc: "una foglia di tasso"
  },
  "Disguise Self": {
    name: "Camuffare Sé Stesso",
    description: "Fai in modo che tu, compresi vestiti, armatura, armi e altri averi, sembri diverso fino al termine dell'incantesimo o finché non lo annulli. Puoi sembrare 30 cm più basso o più alto e apparire magro, grasso o nella media. Non puoi cambiare il tuo tipo di corporatura. Una creatura può usare la sua azione per effettuare una prova di Indagare contro la CD del tuo tiro salvezza per scoprire il camuffamento.",
    higherLevels: null
  },
  "Dissonant Whispers": {
    name: "Sussurri Dissonanti",
    description: "Sussurri una melodia discordante che solo una creatura a tua scelta entro la gittata può sentire, tormentandola con un dolore terribile. Il bersaglio deve effettuare un tiro salvezza Saggezza. Con un fallimento, subisce 3d6 danni psichici e deve immediatamente usare la sua reazione per allontanarsi da te il più possibile. Con un successo, dimezza i danni e non deve allontanarsi. Una creatura assordata ha automaticamente successo.",
    higherLevels: "Il danno aumenta di 1d6 per ogni livello di slot superiore al 1°."
  },
  "Divine Favor": {
    name: "Favore Divino",
    description: "La tua preghiera ti rafforza con un bagliore divino. Fino al termine dell'incantesimo, i tuoi attacchi con armi infliggono 1d4 danni radiosi aggiuntivi quando colpiscono.",
    higherLevels: null
  },
  "Ensnaring Strike": {
    name: "Colpo Intrappolante",
    description: "La prossima volta che colpisci una creatura con un attacco con un'arma, una massa contorta di liane spinose appare nel punto d'impatto, e il bersaglio deve riuscire in un tiro salvezza Forza o essere afferrato. Un bersaglio afferrato subisce 1d6 danni perforanti all'inizio di ciascuno dei suoi turni. Una creatura afferrata dalle liane o che può toccarle può usare la sua azione per effettuare una prova di Forza contro la CD del tiro salvezza del tuo incantesimo per liberarla.",
    higherLevels: "Il danno aumenta di 1d6 per ogni livello di slot superiore al 1°."
  },
  "Entangle": {
    name: "Intralciare",
    description: "Erbacce e liane afferranti spuntano dal terreno in un'area quadrata di 6 metri di lato a partire da un punto entro la gittata. Per la durata, queste piante trasformano il terreno in terreno difficile. Una creatura nell'area quando lanci l'incantesimo deve riuscire in un tiro salvezza Forza o essere afferrata dalle piante intrappolanti fino al termine dell'incantesimo.",
    higherLevels: null
  },
  "Expeditious Retreat": {
    name: "Ritirata Rapida",
    description: "Questo incantesimo ti permette di muoverti a un ritmo incredibile. Quando lanci questo incantesimo, e poi come azione bonus in ciascuno dei tuoi turni fino al termine dell'incantesimo, puoi compiere l'azione di Scattare.",
    higherLevels: null
  },
  "Faerie Fire": {
    name: "Luminescenza",
    description: "Ogni oggetto in un cubo di 6 metri entro la gittata viene contornato da luce blu, verde o viola (a tua scelta). Qualsiasi creatura nell'area al momento del lancio dell'incantesimo è anche contornata di luce se fallisce un tiro salvezza Destrezza. Per la durata, gli oggetti e le creature colpite emettono luce fioca in un raggio di 3 metri. Qualsiasi tiro per colpire contro una creatura o un oggetto colpito ha vantaggio se l'attaccante può vederlo, e la creatura o oggetto colpito non può beneficiare dell'invisibilità.",
    higherLevels: null
  },
  "False Life": {
    name: "Vita Falsata",
    description: "Sostenendoti con un facsimile di vita, ottieni 1d4 + 4 punti ferita temporanei per la durata.",
    higherLevels: "Ottieni 5 punti ferita temporanei aggiuntivi per ogni livello di slot superiore al 1°.",
    materialDesc: "una piccola quantità di alcol o distillati"
  },
  "Feather Fall": {
    name: "Caduta Morbida",
    description: "Scegli fino a cinque creature in caduta entro la gittata. La velocità di discesa di una creatura in caduta rallenta a 18 metri per round fino al termine dell'incantesimo. Se la creatura atterra prima del termine dell'incantesimo, non subisce danni da caduta e può atterrare in piedi.",
    higherLevels: null,
    materialDesc: "una piccola piuma o un pezzo di piumino"
  },
  "Find Familiar": {
    name: "Trova Famiglio",
    description: "Ottieni il servizio di un famiglio, uno spirito che assume una forma animale a tua scelta: pipistrello, gatto, granchio, rana, falco, lucertola, polipo, gufo, serpente velenoso, pesce, ratto, corvo, cavalluccio marino, ragno o donnola. Il famiglio agisce in modo indipendente ma obbedisce ai tuoi comandi. Non può attaccare. Entro 30 metri, puoi comunicare con esso telepaticamente e vedere attraverso i suoi occhi. Quando scende a 0 punti ferita, scompare.",
    higherLevels: null,
    materialDesc: "10 mo di carbone, incenso ed erbe consumate in un braciere d'ottone"
  },
  "Fog Cloud": {
    name: "Nube di Nebbia",
    description: "Crei una sfera di nebbia di 6 metri di raggio centrata su un punto entro la gittata. La sfera si diffonde dietro gli angoli e la sua area è fortemente oscurata. Dura per la durata o finché un vento di velocità moderata o superiore (almeno 16 km/h) non la disperde.",
    higherLevels: "Il raggio della nebbia aumenta di 6 metri per ogni livello di slot superiore al 1°."
  },
  "Goodberry": {
    name: "Bacche Benefiche",
    description: "Fino a dieci bacche appaiono nella tua mano e vengono infuse di magia per la durata. Una creatura può usare la sua azione per mangiare una bacca. Mangiare una bacca ripristina 1 punto ferita, e la bacca fornisce abbastanza nutrimento per sostentare una creatura per un giorno. Le bacche perdono la loro potenza se non vengono consumate entro 24 ore.",
    higherLevels: null,
    materialDesc: "un rametto di vischio"
  },
  "Grease": {
    name: "Unto",
    description: "Del grasso scivoloso copre il terreno in un'area quadrata di 3 metri di lato centrata su un punto entro la gittata, trasformandola in terreno difficile. Quando il grasso appare, ogni creatura in piedi nella sua area deve riuscire in un tiro salvezza Destrezza o cadere prona. Una creatura che entra nell'area o vi termina il proprio turno deve anch'essa riuscire in un tiro salvezza Destrezza o cadere prona.",
    higherLevels: null,
    materialDesc: "un pochino di cotenna di maiale o burro"
  },
  "Guiding Bolt": {
    name: "Dardo Tracciante",
    description: "Un lampo di luce sfreccia verso una creatura a tua scelta entro la gittata. Esegui un attacco a distanza con incantesimo. Se colpisci, il bersaglio subisce 4d6 danni radiosi, e il prossimo tiro per colpire effettuato contro questo bersaglio prima della fine del tuo prossimo turno ha vantaggio.",
    higherLevels: "Il danno aumenta di 1d6 per ogni livello di slot superiore al 1°."
  },
  "Hail of Thorns": {
    name: "Raffica di Spine",
    description: "La prossima volta che colpisci una creatura con un attacco a distanza con un'arma, una grandine di spine si sprigiona dalla tua arma. Il bersaglio e ogni creatura entro 1,5 metri da esso devono effettuare un tiro salvezza Destrezza. Con un fallimento, una creatura subisce 1d10 danni perforanti. Con un successo, dimezza i danni.",
    higherLevels: "Il danno aumenta di 1d10 per ogni livello di slot superiore al 1° (massimo 6d10)."
  },
  "Healing Word": {
    name: "Parola Guaritrice",
    description: "Una creatura a tua scelta che puoi vedere entro la gittata recupera punti ferita pari a 1d4 + il tuo modificatore di caratteristica da incantatore. Questo incantesimo non ha effetto sui non morti o sui costrutti.",
    higherLevels: "La cura aumenta di 1d4 per ogni livello di slot superiore al 1°."
  },
  "Hellish Rebuke": {
    name: "Intimorire Infernale",
    description: "Punti il dito, e la creatura che ti ha danneggiato viene momentaneamente circondata da fiamme infernali. La creatura deve effettuare un tiro salvezza Destrezza. Subisce 2d10 danni da fuoco con un fallimento, o metà con un successo.",
    higherLevels: "Il danno aumenta di 1d10 per ogni livello di slot superiore al 1°."
  },
  "Heroism": {
    name: "Eroismo",
    description: "Una creatura consenziente che tocchi viene infusa di coraggio. Fino al termine dell'incantesimo, la creatura è immune all'essere spaventata e ottiene punti ferita temporanei pari al tuo modificatore di caratteristica da incantatore all'inizio di ciascuno dei suoi turni.",
    higherLevels: "Puoi bersagliare una creatura aggiuntiva per ogni livello di slot superiore al 1°."
  },
  "Hunter's Mark": {
    name: "Marchio del Cacciatore",
    description: "Scegli una creatura che puoi vedere entro la gittata e la marchi misticamente come tua preda. Fino al termine dell'incantesimo, infliggi 1d6 danni aggiuntivi al bersaglio ogni volta che lo colpisci con un attacco con un'arma, e hai vantaggio alle prove di Percezione e Sopravvivenza per trovarlo. Se il bersaglio scende a 0 punti ferita, puoi usare un'azione bonus in un turno successivo per marchiare una nuova creatura.",
    higherLevels: "Quando lanciato con uno slot di 3° o 4° livello, la concentrazione dura fino a 8 ore. Con uno slot di 5° livello o superiore, fino a 24 ore."
  },
  "Identify": {
    name: "Identificare",
    description: "Scegli un oggetto che devi toccare per tutta la durata del lancio. Se è un oggetto magico o altrimenti imbevuto di magia, scopri le sue proprietà e come usarle, se richiede sintonia e quante cariche ha. Scopri se è influenzato da incantesimi e quali sono. Se l'oggetto è stato creato da un incantesimo, scopri quale incantesimo lo ha creato.",
    higherLevels: null,
    materialDesc: "una perla del valore di almeno 100 mo e una piuma di gufo"
  },
  "Illusory Script": {
    name: "Scritto Illusorio",
    description: "Scrivi su pergamena, carta o altro materiale di scrittura adatto e lo imbevi di una potente illusione. Per te e per le creature che designi al lancio dell'incantesimo, la scritta appare normale. Per tutti gli altri, la scritta appare come se fosse scritta in una scrittura sconosciuta o magica, illeggibile. Una creatura con visione del vero può leggere il messaggio nascosto.",
    higherLevels: null,
    materialDesc: "un inchiostro a base di piombo del valore di almeno 10 mo, consumato"
  },
  "Inflict Wounds": {
    name: "Infliggi Ferite",
    description: "Esegui un attacco in mischia con incantesimo contro una creatura che puoi raggiungere. Se colpisci, il bersaglio subisce 3d10 danni necrotici.",
    higherLevels: "Il danno aumenta di 1d10 per ogni livello di slot superiore al 1°."
  },
  "Jump": {
    name: "Saltare",
    description: "Tocchi una creatura. La distanza di salto della creatura viene triplicata fino al termine dell'incantesimo.",
    higherLevels: null,
    materialDesc: "una zampa posteriore di cavalletta"
  },
  "Longstrider": {
    name: "Passo Veloce",
    description: "Tocchi una creatura. La velocità del bersaglio aumenta di 3 metri fino al termine dell'incantesimo.",
    higherLevels: "Puoi bersagliare una creatura aggiuntiva per ogni livello di slot superiore al 1°.",
    materialDesc: "un pizzico di terra"
  },
  "Mage Armor": {
    name: "Armatura Magica",
    description: "Tocchi una creatura consenziente che non indossa armatura, e una forza magica protettiva la circonda fino al termine dell'incantesimo. La CA base del bersaglio diventa 13 + il suo modificatore di Destrezza. L'incantesimo termina se il bersaglio indossa un'armatura o se annulli l'incantesimo come azione.",
    higherLevels: null,
    materialDesc: "un pezzo di cuoio conciato"
  },
  "Magic Missile": {
    name: "Dardo Incantato",
    description: "Crei tre dardi luminosi di forza magica. Ogni dardo colpisce una creatura a tua scelta che puoi vedere entro la gittata. Un dardo infligge 1d4 + 1 danni da forza al bersaglio. I dardi colpiscono tutti simultaneamente, e puoi dirigerli per colpire una creatura o più.",
    higherLevels: "L'incantesimo crea un dardo aggiuntivo per ogni livello di slot superiore al 1°."
  },
  "Protection from Evil and Good": {
    name: "Protezione dal Bene e dal Male",
    description: "Fino al termine dell'incantesimo, una creatura consenziente che tocchi è protetta da aberrazioni, celestiali, elementali, folletti, immondi e non morti. Quelle creature hanno svantaggio ai tiri per colpire contro il bersaglio. Il bersaglio inoltre non può essere ammaliato, spaventato o posseduto da loro.",
    higherLevels: null,
    materialDesc: "acqua santa o argento e ferro in polvere, consumati"
  },
  "Purify Food and Drink": {
    name: "Purificare Cibo e Bevande",
    description: "Tutto il cibo e le bevande non magici in una sfera di 1,5 metri di raggio centrata su un punto a tua scelta entro la gittata vengono purificati e resi liberi da veleno e malattie.",
    higherLevels: null
  },
  "Ray of Sickness": {
    name: "Raggio di Malattia",
    description: "Un raggio di nauseante energia verdastra colpisce una creatura entro la gittata. Esegui un attacco a distanza con incantesimo. Se colpisci, il bersaglio subisce 2d8 danni da veleno e deve effettuare un tiro salvezza Costituzione. Con un fallimento, è anche avvelenato fino alla fine del tuo prossimo turno.",
    higherLevels: "Il danno aumenta di 1d8 per ogni livello di slot superiore al 1°."
  },
  "Sanctuary": {
    name: "Santuario",
    description: "Proteggi una creatura entro la gittata da attacchi. Fino al termine dell'incantesimo, qualsiasi creatura che bersaglia la creatura protetta con un attacco o con un incantesimo dannoso deve prima effettuare un tiro salvezza Saggezza. Con un fallimento, la creatura deve scegliere un nuovo bersaglio o perdere l'attacco o l'incantesimo. Questo incantesimo non protegge la creatura protetta dagli effetti d'area. Se la creatura protetta esegue un attacco o lancia un incantesimo che colpisce una creatura nemica, l'incantesimo termina.",
    higherLevels: null,
    materialDesc: "un piccolo specchio d'argento"
  },
  "Searing Smite": {
    name: "Punizione Cocente",
    description: "La prossima volta che colpisci una creatura con un attacco in mischia con un'arma, la tua arma divampa con un'intensità incandescente, e l'attacco infligge 1d6 danni da fuoco aggiuntivi e dà fuoco al bersaglio. All'inizio di ciascuno dei suoi turni, il bersaglio deve effettuare un tiro salvezza Costituzione. Con un fallimento, subisce 1d6 danni da fuoco. Con un successo, l'incantesimo termina.",
    higherLevels: "Il danno extra iniziale aumenta di 1d6 per ogni livello di slot superiore al 1°."
  },
  "Shield": {
    name: "Scudo",
    description: "Una barriera invisibile di forza magica appare e ti protegge. Fino all'inizio del tuo prossimo turno, ottieni un bonus di +5 alla CA, anche contro l'attacco scatenante, e non subisci alcun danno da dardo incantato.",
    higherLevels: null
  },
  "Shield of Faith": {
    name: "Scudo della Fede",
    description: "Un campo scintillante appare e circonda una creatura a tua scelta entro la gittata, concedendole un bonus di +2 alla CA per la durata.",
    higherLevels: null,
    materialDesc: "una piccola pergamena con un brano di testo sacro scritto sopra"
  },
  "Silent Image": {
    name: "Immagine Silenziosa",
    description: "Crei l'immagine di un oggetto, una creatura o un altro fenomeno visibile non più grande di un cubo di 4,5 metri di lato. L'immagine appare in un punto entro la gittata e dura per la durata. L'immagine è puramente visiva; non è accompagnata da suoni, odori o altri effetti sensoriali.",
    higherLevels: null,
    materialDesc: "un pochino di lana di pecora"
  },
  "Sleep": {
    name: "Sonno",
    description: "Questo incantesimo manda le creature in un sonno magico. Tira 5d8; il totale è il numero di punti ferita di creature che questo incantesimo può influenzare. Le creature entro 6 metri da un punto a tua scelta entro la gittata vengono colpite in ordine ascendente dei loro punti ferita attuali. I non morti e le creature immuni all'essere ammaliate non sono colpiti.",
    higherLevels: "Tira 2d8 aggiuntivi per ogni livello di slot superiore al 1°.",
    materialDesc: "un pizzico di sabbia fine, petali di rosa o un grillo"
  },
  "Speak with Animals": {
    name: "Parlare con gli Animali",
    description: "Ottieni la capacità di comprendere e comunicare verbalmente con le bestie per la durata. La conoscenza e la consapevolezza di molte bestie sono limitate dalla loro intelligenza, ma come minimo, le bestie possono fornirti informazioni su luoghi e mostri vicini.",
    higherLevels: null
  },
  "Tasha's Hideous Laughter": {
    name: "Risata Incontenibile",
    description: "Una creatura a tua scelta che puoi vedere entro la gittata percepisce tutto come esilarante e cade in attacchi di risata. Il bersaglio deve riuscire in un tiro salvezza Saggezza o cadere prono, diventando incapacitato e incapace di alzarsi per la durata. Una creatura con Intelligenza 4 o inferiore non viene influenzata. Alla fine di ciascuno dei suoi turni, e ogni volta che subisce danni, il bersaglio può effettuare un altro tiro salvezza Saggezza.",
    higherLevels: null,
    materialDesc: "tartine in miniatura e una piuma agitata nell'aria"
  },
  "Thunderous Smite": {
    name: "Punizione Tonante",
    description: "La prima volta che colpisci con un attacco in mischia con un'arma durante la durata dell'incantesimo, la tua arma rimbomba di tuono udibile entro 90 metri, e l'attacco infligge 2d6 danni da tuono aggiuntivi. Inoltre, se il bersaglio è una creatura, deve riuscire in un tiro salvezza Forza o essere spinto a 3 metri di distanza da te e abbattuto prono.",
    higherLevels: null
  },
  "Thunderwave": {
    name: "Onda Tonante",
    description: "Un'onda di forza tonante si propaga da te. Ogni creatura in un cubo di 4,5 metri originato da te deve effettuare un tiro salvezza Costituzione. Con un fallimento, una creatura subisce 2d8 danni da tuono ed è spinta a 3 metri di distanza da te. Con un successo, dimezza i danni e non viene spinta. Gli oggetti non assicurati vengono automaticamente spinti di 3 metri. Il tuono è udibile fino a 90 metri.",
    higherLevels: "Il danno aumenta di 1d8 per ogni livello di slot superiore al 1°."
  },
  "Tenser's Floating Disk": {
    name: "Disco Fluttuante di Tenser",
    description: "Evochi un disco orizzontale di forza, dal diametro di 90 cm e spesso 2,5 cm, che fluttua a circa 90 cm da terra in uno spazio libero entro gittata. Il disco resta nella sua posizione finché ti trovi a meno di 6 metri da esso; se ti allontani oltre, il disco ti segue lungo il percorso più diretto possibile, mantenendosi entro 6 metri da te. Può sostenere fino a 250 kg di carico: se tale soglia viene superata, l'incantesimo termina e tutto ciò che era posato sul disco cade a terra. L'incantesimo termina anche se ti allontani di più di 30 metri dal disco o se il disco rimane fuori dalla tua linea di vista per più di un round, oltre che alla scadenza naturale della durata. Al termine dell'incantesimo il disco svanisce e ogni oggetto su di esso cade.",
    higherLevels: null,
    materialDesc: "una goccia di mercurio"
  },
  "Unseen Servant": {
    name: "Servitore Inosservato",
    description: "Questo incantesimo crea una forza invisibile, priva di mente e senza forma che esegue compiti semplici al tuo comando fino al termine dell'incantesimo. Ha CA 10, 1 punto ferita, Forza 2 e non può attaccare. Può eseguire compiti semplici come prendere oggetti, pulire, riparare, piegare vestiti, accendere fuochi, servire cibo e versare vino.",
    higherLevels: null,
    materialDesc: "un pezzo di spago e un pochino di legno"
  },
  "Witch Bolt": {
    name: "Dardo Stregato",
    description: "Un raggio di energia crepitante e blu colpisce una creatura entro la gittata, formando un arco sostenuto di fulmine tra te e il bersaglio. Esegui un attacco a distanza con incantesimo. Se colpisci, il bersaglio subisce 1d12 danni da fulmine, e in ciascuno dei tuoi turni per la durata, puoi usare la tua azione per infliggere 1d12 danni da fulmine al bersaglio automaticamente. L'incantesimo termina se usi la tua azione per fare qualcos'altro, o se il bersaglio si trova al di fuori della gittata dell'incantesimo o ha copertura totale rispetto a te.",
    higherLevels: "Il danno iniziale aumenta di 1d12 per ogni livello di slot superiore al 1°.",
    materialDesc: "un rametto di un albero colpito da un fulmine"
  },
  "Wrathful Smite": {
    name: "Punizione Iraconda",
    description: "La prossima volta che colpisci con un attacco in mischia con un'arma durante la durata dell'incantesimo, l'attacco infligge 1d6 danni psichici aggiuntivi. Inoltre, se il bersaglio è una creatura, deve effettuare un tiro salvezza Saggezza o essere spaventato da te fino al termine dell'incantesimo. Come azione, la creatura può effettuare una prova di Saggezza contro la CD del tiro salvezza del tuo incantesimo per ritrovare la determinazione e terminare l'incantesimo.",
    higherLevels: null
  },

  // ============================================================
  // PLAYER'S HANDBOOK 5e — LEVEL 2
  // ============================================================
  "Aid": {
    name: "Aiuto",
    description: "Scegli fino a tre creature entro la gittata. Il massimo di punti ferita e i punti ferita attuali di ogni bersaglio aumentano di 5 per la durata.",
    higherLevels: "L'aumento dei punti ferita sale di 5 per ogni livello di slot superiore al 2°.",
    materialDesc: "una sottile striscia di stoffa bianca"
  },
  "Alter Self": {
    name: "Alterare Sé Stesso",
    description: "Assumi una forma diversa, scegliendo un'opzione: Adattamento Acquatico (respirare sott'acqua, velocità di nuoto), Armi Naturali (arma naturale magica 1d6+1) o Cambiare Aspetto (alterare l'aspetto fisico). Puoi terminare un'opzione come azione per ottenere una diversa.",
    higherLevels: null
  },
  "Animal Messenger": {
    name: "Animale Messaggero",
    description: "Usi un animale per recapitare un messaggio. Scegli una bestia di taglia Minuscola che puoi vedere entro la gittata. Specifichi una posizione, una descrizione del destinatario e un messaggio di un massimo di venticinque parole. La bestia viaggia verso quella posizione per la durata dell'incantesimo (circa 80 km in 24 ore in volo, 40 km altrimenti).",
    higherLevels: "La durata aumenta di 48 ore per ogni livello di slot superiore al 2°.",
    materialDesc: "un boccone di cibo"
  },
  "Arcane Lock": {
    name: "Serratura Arcana",
    description: "Tocchi una porta, finestra, cancello, baule o altro varco chiuso, e questo viene bloccato. Tu e le creature che designi potete aprirlo normalmente. Puoi anche impostare una parola d'ordine che sospende l'incantesimo per 1 minuto. La CD per romperlo o per scassinare le serrature aumenta di 10.",
    higherLevels: null,
    materialDesc: "polvere d'oro del valore di almeno 25 mo, consumata"
  },
  "Augury": {
    name: "Presagio",
    description: "Ricevi un presagio da un'entità ultraterrena sui risultati di una specifica linea d'azione entro i prossimi 30 minuti. Il DM sceglie: prosperità (buoni risultati), avversità (cattivi risultati), prosperità e avversità, o nulla. I lanci ripetuti prima di un riposo lungo hanno una probabilità cumulativa del 25% di dare una lettura casuale.",
    higherLevels: null,
    materialDesc: "bastoncini, ossa o gettoni simili contrassegnati appositamente, del valore di almeno 25 mo"
  },
  "Barkskin": {
    name: "Pelle di Corteccia",
    description: "Tocchi una creatura consenziente. Fino al termine dell'incantesimo, la pelle del bersaglio assume un aspetto ruvido, simile a corteccia, e la CA del bersaglio non può essere inferiore a 16, indipendentemente dal tipo di armatura indossata.",
    higherLevels: null,
    materialDesc: "una manciata di corteccia di quercia"
  },
  "Beast Sense": {
    name: "Senso della Bestia",
    description: "Tocchi una bestia consenziente. Per la durata, puoi usare la tua azione per vedere attraverso gli occhi della bestia e sentire ciò che essa sente, e continui a farlo finché non usi la tua azione per tornare ai tuoi sensi normali. Mentre percepisci attraverso i sensi della bestia, ottieni i benefici di qualsiasi senso speciale posseduto da quella creatura, sebbene tu sia accecato e assordato rispetto al tuo ambiente circostante.",
    higherLevels: null
  },
  "Blindness/Deafness": {
    name: "Cecità/Sordità",
    description: "Puoi accecare o assordare un nemico. Scegli una creatura entro la gittata che effettui un tiro salvezza Costituzione. Se fallisce, il bersaglio è accecato o assordato (a tua scelta) per la durata. Alla fine di ciascuno dei suoi turni, il bersaglio può effettuare un tiro salvezza Costituzione, terminando l'effetto con un successo.",
    higherLevels: "Puoi bersagliare una creatura aggiuntiva per ogni livello di slot superiore al 2°."
  },
  "Blur": {
    name: "Sfocatura",
    description: "Il tuo corpo diventa sfocato, oscillando e tremolando per chiunque possa vederti. Per la durata, qualsiasi creatura ha svantaggio ai tiri per colpire contro di te. Un attaccante è immune a questo effetto se non si affida alla vista o se può vedere attraverso le illusioni.",
    higherLevels: null
  },
  "Branding Smite": {
    name: "Punizione Marchiante",
    description: "La prossima volta che colpisci una creatura con un attacco con un'arma, l'arma brilla di una radiosità astrale. L'attacco infligge 2d6 danni radiosi aggiuntivi. Il bersaglio diventa visibile se è invisibile, emette luce fioca in un raggio di 1,5 metri, e non può diventare invisibile fino al termine dell'incantesimo.",
    higherLevels: "Il danno extra aumenta di 1d6 per ogni livello di slot superiore al 2°."
  },
  "Calm Emotions": {
    name: "Calmare Emozioni",
    description: "Ogni umanoide in una sfera di 6 metri di raggio centrata su un punto a tua scelta entro la gittata deve effettuare un tiro salvezza Carisma (può scegliere di fallire). Con un fallimento, puoi sopprimere qualsiasi effetto che causa al bersaglio l'essere ammaliato o spaventato, oppure rendere indifferente un bersaglio nei confronti di creature a tua scelta verso le quali è ostile.",
    higherLevels: null
  },
  "Cloud of Daggers": {
    name: "Nube di Pugnali",
    description: "Riempi l'aria con pugnali rotanti in un cubo di 1,5 metri di lato, centrato su un punto a tua scelta entro la gittata. Una creatura subisce 4d4 danni taglienti quando entra nell'area dell'incantesimo per la prima volta in un turno o vi inizia il proprio turno.",
    higherLevels: "Il danno aumenta di 2d4 per ogni livello di slot superiore al 2°.",
    materialDesc: "una scheggia di vetro"
  },
  "Continual Flame": {
    name: "Fiamma Perenne",
    description: "Una fiamma, equivalente in luminosità a una torcia, sgorga da un oggetto che tocchi. L'effetto sembra una fiamma normale, ma non genera calore e non consuma ossigeno. Una fiamma perpetua può essere coperta o nascosta, ma non spenta o soffocata.",
    higherLevels: null,
    materialDesc: "polvere di rubino del valore di 50 mo, consumata"
  },
  "Cordon of Arrows": {
    name: "Cordone di Frecce",
    description: "Pianti quattro pezzi di munizioni non magiche nel terreno entro la gittata e li infondi di magia. Ogni volta che una creatura diversa da te giunge entro 9 metri dalle munizioni per la prima volta in un turno o vi termina il proprio turno, un pezzo di munizione vola contro di essa. La creatura deve riuscire in un tiro salvezza Destrezza o subire 1d6 danni perforanti.",
    higherLevels: "La quantità di munizioni che possono essere influenzate aumenta di due per ogni livello di slot superiore al 2°.",
    materialDesc: "quattro o più munizioni"
  },
  "Crown of Madness": {
    name: "Corona di Follia",
    description: "Un umanoide a tua scelta entro la gittata deve riuscire in un tiro salvezza Saggezza o essere ammaliato da te. Mentre è ammaliato, una corona contorta di ferro frastagliato appare sulla sua testa e la follia gli arde negli occhi. Il bersaglio ammaliato deve usare la sua azione prima di muoversi in ciascuno dei suoi turni per eseguire un attacco in mischia contro una creatura diversa da sé che scegli mentalmente. Devi usare la tua azione nei turni successivi per mantenere il controllo, altrimenti l'incantesimo termina.",
    higherLevels: null
  },
  "Darkness": {
    name: "Oscurità",
    description: "L'oscurità magica si diffonde da un punto a tua scelta entro la gittata per riempire una sfera di 4,5 metri di raggio. L'oscurità si diffonde dietro gli angoli. Una creatura con scurovisione non può vedere attraverso questa oscurità, e la luce non magica non può illuminarla. Se il punto è su un oggetto che tieni in mano o che non è indossato o trasportato, l'oscurità emana dall'oggetto e si muove con esso.",
    higherLevels: null,
    materialDesc: "pelo di pipistrello e una goccia di pece o un pezzo di carbone"
  },
  "Darkvision": {
    name: "Scurovisione",
    description: "Tocchi una creatura consenziente per concederle la capacità di vedere nel buio. Per la durata, quella creatura ha scurovisione fino a 18 metri.",
    higherLevels: null,
    materialDesc: "un pizzico di carota essiccata oppure un'agata"
  },
  "Detect Thoughts": {
    name: "Individuazione dei Pensieri",
    description: "Per la durata, puoi leggere i pensieri di certe creature. Puoi concentrarti su una creatura entro 9 metri. Se ha Intelligenza 3 o inferiore, o non parla alcun linguaggio, non viene influenzata. Inizialmente impari i pensieri superficiali. Come azione, puoi indagare più a fondo, richiedendo al bersaglio di effettuare un tiro salvezza Saggezza. Puoi anche cercare creature pensanti entro 9 metri che non puoi vedere.",
    higherLevels: null,
    materialDesc: "una moneta di rame"
  },
  "Enhance Ability": {
    name: "Caratteristica Potenziata",
    description: "Tocchi una creatura e le conferisci un potenziamento magico. Scegli un effetto: Resistenza dell'Orso (vantaggio alle prove di Costituzione, 2d6 PF temporanei), Forza del Toro (vantaggio alle prove di Forza, capacità di carico raddoppiata), Grazia del Gatto (vantaggio alle prove di Destrezza, nessun danno da caduta da 6 metri o meno), Splendore dell'Aquila (vantaggio alle prove di Carisma), Astuzia della Volpe (vantaggio alle prove di Intelligenza), o Saggezza del Gufo (vantaggio alle prove di Saggezza).",
    higherLevels: "Puoi bersagliare una creatura aggiuntiva per ogni livello di slot superiore al 2°.",
    materialDesc: "pelo o una piuma di una bestia"
  },
  "Enlarge/Reduce": {
    name: "Ingrandire/Ridurre",
    description: "Fai sì che una creatura o un oggetto entro la gittata cresca più grande o più piccolo. Una creatura non consenziente può effettuare un tiro salvezza Costituzione. Ingrandire: la taglia raddoppia, il peso x8, vantaggio alle prove e ai tiri salvezza Forza, +1d4 ai danni con armi. Ridurre: la taglia si dimezza, il peso /8, svantaggio alle prove e ai tiri salvezza Forza, -1d4 ai danni con armi (minimo 1).",
    higherLevels: null,
    materialDesc: "un pizzico di ferro in polvere"
  },
  "Enthrall": {
    name: "Estasiare",
    description: "Intessi una distraente serie di parole, costringendo le creature a tua scelta che puoi vedere entro la gittata a effettuare un tiro salvezza Saggezza. Qualsiasi creatura che non può essere ammaliata ha automaticamente successo. Con un fallimento, il bersaglio ha svantaggio alle prove di Percezione effettuate per percepire qualsiasi creatura diversa da te fino al termine dell'incantesimo.",
    higherLevels: null
  },
  "Find Steed": {
    name: "Trova Cavalcatura",
    description: "Evochi uno spirito che assume la forma di un destriero insolitamente intelligente, forte e leale: un cavallo da guerra, pony, cammello, alce o mastino. È un celestiale, un folletto o un immondo (a tua scelta). Se ha Intelligenza 5 o inferiore, la sua Intelligenza diventa 6. Ti serve in combattimento e fuori, e puoi comunicare con esso telepaticamente entro 1,5 km. Quando lanci un incantesimo che bersaglia solo te, puoi influenzare anche il destriero.",
    higherLevels: null
  },
  "Find Traps": {
    name: "Scopri Trappole",
    description: "Percepisci la presenza di qualsiasi trappola entro la gittata che si trovi nella linea di vista. Una trappola è qualsiasi cosa che infligga un effetto dannoso improvviso o inaspettato, specificamente intenzionato come tale dal suo creatore. Apprendi la natura generale del pericolo ma non la posizione esatta di ogni trappola.",
    higherLevels: null
  },
  "Flame Blade": {
    name: "Lama Infuocata",
    description: "Evochi una lama infuocata nella tua mano libera. La lama è simile per dimensioni e forma a una scimitarra e dura per la durata. Puoi usare la tua azione per eseguire un attacco in mischia con incantesimo con essa. Se colpisci, il bersaglio subisce 3d6 danni da fuoco. La lama emette luce intensa in un raggio di 3 metri e luce fioca per ulteriori 3 metri.",
    higherLevels: "Il danno aumenta di 1d6 per ogni due livelli di slot superiori al 2°.",
    materialDesc: "una foglia di sommacco"
  },
  "Flaming Sphere": {
    name: "Sfera Infuocata",
    description: "Una sfera di fuoco di 1,5 metri di diametro appare in uno spazio non occupato entro la gittata. Qualsiasi creatura che termina il proprio turno entro 1,5 metri dalla sfera deve effettuare un tiro salvezza Destrezza, subendo 2d6 danni da fuoco con un fallimento, o metà con un successo. Come azione bonus, puoi muovere la sfera fino a 9 metri.",
    higherLevels: "Il danno aumenta di 1d6 per ogni livello di slot superiore al 2°.",
    materialDesc: "un pochino di sego, un pizzico di zolfo e una spolverata di ferro in polvere"
  },
  "Gentle Repose": {
    name: "Riposo Inviolato",
    description: "Tocchi un cadavere o altri resti. Per la durata, il bersaglio è protetto dalla decomposizione e non può diventare un non morto. L'incantesimo estende anche il limite di tempo per resuscitare il bersaglio dalla morte, poiché i giorni trascorsi sotto l'influenza di questo incantesimo non contano nei limiti di tempo di incantesimi come Resuscitare i Morti.",
    higherLevels: null,
    materialDesc: "un pizzico di sale e una moneta di rame posta su ciascuno degli occhi del cadavere"
  },
  "Gust of Wind": {
    name: "Folata di Vento",
    description: "Una linea di vento forte lunga 18 metri e larga 3 metri scaturisce da te in una direzione a tua scelta. Ogni creatura che inizia il proprio turno nella linea deve riuscire in un tiro salvezza Forza o essere spinta a 4,5 metri di distanza da te. Qualsiasi creatura nella linea deve spendere 60 cm di movimento per ogni 30 cm percorsi avvicinandosi a te. La folata disperde gas o vapori e spegne fiamme non protette.",
    higherLevels: null,
    materialDesc: "un seme di legume"
  },
  "Heat Metal": {
    name: "Riscaldare il Metallo",
    description: "Scegli un oggetto di metallo lavorato entro la gittata. Lo fai brillare incandescente. Qualsiasi creatura a contatto fisico con l'oggetto subisce 2d8 danni da fuoco. Fino al termine dell'incantesimo, puoi usare un'azione bonus in ciascuno dei tuoi turni successivi per causare nuovamente questo danno. Se una creatura tiene o indossa l'oggetto e subisce il danno, deve riuscire in un tiro salvezza Costituzione o lasciarlo cadere.",
    higherLevels: "Il danno aumenta di 1d8 per ogni livello di slot superiore al 2°.",
    materialDesc: "un pezzo di ferro e una fiamma"
  },
  "Hold Person": {
    name: "Blocca Persone",
    description: "Scegli un umanoide entro la gittata che puoi vedere. Il bersaglio deve riuscire in un tiro salvezza Saggezza o essere paralizzato per la durata. Alla fine di ciascuno dei suoi turni, il bersaglio può effettuare un altro tiro salvezza Saggezza. Con un successo, l'incantesimo termina sul bersaglio.",
    higherLevels: "Puoi bersagliare un umanoide aggiuntivo per ogni livello di slot superiore al 2°. Devono trovarsi entro 9 metri l'uno dall'altro.",
    materialDesc: "un piccolo pezzo dritto di ferro"
  },
  "Invisibility": {
    name: "Invisibilità",
    description: "Una creatura che tocchi diventa invisibile fino al termine dell'incantesimo. Tutto ciò che il bersaglio indossa o trasporta è invisibile finché rimane sulla sua persona. L'incantesimo termina per un bersaglio che attacca o lancia un incantesimo.",
    higherLevels: "Puoi bersagliare una creatura aggiuntiva per ogni livello di slot superiore al 2°.",
    materialDesc: "un ciglio incastonato nella gomma arabica"
  },
  "Knock": {
    name: "Scassinare",
    description: "Scegli un oggetto entro la gittata. L'oggetto può essere una porta, una scatola, un baule, una serie di manette, un lucchetto o un altro oggetto che contiene un mezzo mondano o magico che impedisce l'accesso. Un bersaglio chiuso da una serratura mondana o che è bloccato o sbarrato viene sbloccato, sbloccato o sbarrato. Se l'oggetto ha più serrature, ne viene aperta solo una. Lanciandolo su una chiusura arcana la sopprime per 10 minuti. Quando lanci l'incantesimo, un forte rumore di battito udibile fino a 90 metri emana dall'oggetto.",
    higherLevels: null
  },
  "Lesser Restoration": {
    name: "Ristorare Inferiore",
    description: "Tocchi una creatura e puoi terminare una malattia o una condizione che la affligge. La condizione può essere accecato, assordato, paralizzato o avvelenato.",
    higherLevels: null
  },
  "Levitate": {
    name: "Levitazione",
    description: "Una creatura o un oggetto a tua scelta entro la gittata si solleva verticalmente, fino a 6 metri, e rimane sospeso lì per la durata. Una creatura può muoversi solo spingendosi o tirandosi contro un oggetto fisso o una superficie a portata di mano. Puoi cambiare l'altitudine fino a 6 metri in entrambe le direzioni nel tuo turno.",
    higherLevels: null,
    materialDesc: "un piccolo cappio di cuoio oppure un pezzo di filo d'oro piegato a coppa con un lungo gambo a un'estremità"
  },
  "Locate Animals or Plants": {
    name: "Localizza Animali o Vegetali",
    description: "Descrivi o nomina un tipo specifico di bestia o pianta. Concentrandoti sulla voce della natura nel tuo ambiente, apprendi la direzione e la distanza della creatura o pianta più vicina di quel tipo entro 8 km, se presente.",
    higherLevels: null,
    materialDesc: "un pochino di pelo di segugio"
  },
  "Locate Object": {
    name: "Localizza Oggetto",
    description: "Descrivi o nomina un oggetto familiare. Percepisci la direzione della posizione dell'oggetto, finché si trova entro 300 metri. Puoi cercare un oggetto specifico a te noto, o l'oggetto più vicino di un certo tipo. L'incantesimo non può individuare un oggetto se uno spessore di piombo blocca un percorso diretto tra te e l'oggetto.",
    higherLevels: null,
    materialDesc: "un rametto biforcuto"
  },
  "Magic Mouth": {
    name: "Bocca Magica",
    description: "Imprimi un messaggio in un oggetto entro la gittata, un messaggio che viene pronunciato quando si verifica una condizione di attivazione. Scegli un oggetto che puoi vedere e che non sia indossato o trasportato da un'altra creatura. Poi pronuncia il messaggio, che non deve superare le 25 parole, e determina la circostanza che attiverà l'incantesimo per consegnare il tuo messaggio.",
    higherLevels: null,
    materialDesc: "un pezzetto di favo e polvere di giada del valore di almeno 10 mo, consumati"
  },
  "Magic Weapon": {
    name: "Arma Magica",
    description: "Tocchi un'arma non magica. Fino al termine dell'incantesimo, quell'arma diventa un'arma magica con un bonus di +1 ai tiri per colpire e ai tiri per i danni.",
    higherLevels: "Il bonus aumenta a +2 quando usi uno slot di 4° livello, e a +3 quando usi uno slot di 6° livello o superiore."
  },
  "Melf's Acid Arrow": {
    name: "Freccia Acida di Melf",
    description: "Una scintillante freccia verde sfreccia verso un bersaglio entro la gittata ed esplode in uno spruzzo di acido. Esegui un attacco a distanza con incantesimo. Se colpisci, il bersaglio subisce immediatamente 4d4 danni acidi e 2d4 danni acidi alla fine del suo prossimo turno. Se manchi, la freccia spruzza il bersaglio con acido per metà del danno iniziale e nessun danno alla fine del suo prossimo turno.",
    higherLevels: "Sia il danno iniziale che quello successivo aumentano di 1d4 per ogni livello di slot superiore al 2°.",
    materialDesc: "foglia di rabarbaro in polvere e uno stomaco di vipera"
  },
  "Mirror Image": {
    name: "Immagine Speculare",
    description: "Tre duplicati illusori di te stesso appaiono nel tuo spazio. Ogni volta che una creatura ti bersaglia con un attacco durante la durata dell'incantesimo, tira 1d20 per determinare se l'attacco bersaglia invece uno dei tuoi duplicati (6+ con 3 duplicati, 8+ con 2, 11+ con 1). La CA di un duplicato è 10 + il tuo modificatore di Destrezza. Se un attacco colpisce un duplicato, il duplicato viene distrutto.",
    higherLevels: null
  },
  "Misty Step": {
    name: "Passo Velato",
    description: "Brevemente circondato da una nebbia argentea, ti teletrasporti fino a 9 metri in uno spazio non occupato che puoi vedere.",
    higherLevels: null
  },
  "Moonbeam": {
    name: "Bagliore Lunare",
    description: "Un raggio argenteo di luce pallida brilla in un cilindro di 1,5 metri di raggio e 12 metri di altezza centrato su un punto entro la gittata. Quando una creatura entra nell'area dell'incantesimo per la prima volta in un turno o vi inizia il proprio turno, deve effettuare un tiro salvezza Costituzione, subendo 2d10 danni radiosi con un fallimento, o metà con un successo. Un mutaforma effettua il tiro salvezza con svantaggio.",
    higherLevels: "Il danno aumenta di 1d10 per ogni livello di slot superiore al 2°.",
    materialDesc: "diversi semi di una qualsiasi pianta lunaria e un pezzo di feldspato opalescente"
  },
  "Nystul's Magic Aura": {
    name: "Aura Magica di Nystul",
    description: "Crei un'illusione su una creatura o un oggetto che tocchi in modo che gli incantesimi di divinazione rivelino informazioni false su di esso. Puoi cambiare come appare agli incantesimi e agli effetti magici che rilevano le aure magiche (come individuazione del magico), o cambiare come appare agli incantesimi che rilevano i tipi di creature. Se lanci questo incantesimo sullo stesso bersaglio ogni giorno per 30 giorni, l'illusione dura finché non viene dissolta.",
    higherLevels: null,
    materialDesc: "un piccolo quadrato di seta"
  },
  "Pass without Trace": {
    name: "Passare Senza Tracce",
    description: "Un velo di ombre e silenzio si irradia da te, mascherando te e i tuoi compagni dal rilevamento. Per la durata, ogni creatura a tua scelta entro 9 metri da te (incluso te stesso) ha un bonus di +10 alle prove di Destrezza (Furtività) e non può essere rintracciata se non con mezzi magici.",
    higherLevels: null,
    materialDesc: "ceneri di una foglia di vischio bruciata e un rametto di abete rosso"
  },
  "Phantasmal Force": {
    name: "Allucinazione di Forza",
    description: "Crei un'illusione che si radica nella mente di una creatura entro la gittata. Il bersaglio deve effettuare un tiro salvezza Intelligenza. Con un fallimento, crei un oggetto, una creatura o un fenomeno fantasmatico non più grande di un cubo di 3 metri di lato percepibile solo dal bersaglio. Il bersaglio razionalizza qualsiasi risultato illogico derivante dall'interazione con l'illusione. Il fantasma può infliggere 1d6 danni psichici per round se appare pericoloso.",
    higherLevels: null,
    materialDesc: "un pochino di lana di pecora"
  },
  "Prayer of Healing": {
    name: "Preghiera di Guarigione",
    description: "Fino a sei creature a tua scelta che puoi vedere entro la gittata recuperano ognuna punti ferita pari a 2d8 + il tuo modificatore di caratteristica da incantatore. Questo incantesimo non ha effetto sui non morti o sui costrutti.",
    higherLevels: "La cura aumenta di 1d8 per ogni livello di slot superiore al 2°."
  },
  "Protection from Poison": {
    name: "Protezione dai Veleni",
    description: "Tocchi una creatura. Se è avvelenata, neutralizzi il veleno. Per la durata, il bersaglio ha vantaggio ai tiri salvezza contro l'essere avvelenato e ha resistenza ai danni da veleno.",
    higherLevels: null
  },
  "Ray of Enfeeblement": {
    name: "Raggio di Affaticamento",
    description: "Un raggio nero di energia debilitante scaturisce dal tuo dito verso una creatura entro la gittata. Esegui un attacco a distanza con incantesimo. Se colpisci, il bersaglio infligge solo metà danno con gli attacchi con armi che usano Forza fino al termine dell'incantesimo. Alla fine di ciascuno dei suoi turni, può effettuare un tiro salvezza Costituzione, terminando l'incantesimo con un successo.",
    higherLevels: null
  },
  "Rope Trick": {
    name: "Trucco della Corda",
    description: "Tocchi un pezzo di corda lungo fino a 18 metri. Un'estremità della corda si solleva nell'aria finché tutta la corda pende perpendicolarmente al suolo. All'estremità superiore, un'entrata invisibile si apre verso uno spazio extradimensionale che dura fino al termine dell'incantesimo. Lo spazio può contenere fino a otto creature di taglia Media o inferiore.",
    higherLevels: null,
    materialDesc: "estratto di mais in polvere e un cappio attorcigliato di pergamena"
  },
  "Scorching Ray": {
    name: "Raggio Rovente",
    description: "Crei tre raggi di fuoco e li lanci contro bersagli entro la gittata. Puoi lanciarli contro un bersaglio o più. Esegui un attacco a distanza con incantesimo per ogni raggio. Se colpisci, il bersaglio subisce 2d6 danni da fuoco.",
    higherLevels: "Crei un raggio aggiuntivo per ogni livello di slot superiore al 2°."
  },
  "See Invisibility": {
    name: "Vedere Invisibilità",
    description: "Per la durata, vedi creature e oggetti invisibili come se fossero visibili, e puoi vedere nel Piano Etereo. Le creature e gli oggetti eterei appaiono spettrali e traslucidi.",
    higherLevels: null,
    materialDesc: "un pizzico di talco e una piccola spruzzata di argento in polvere"
  },
  "Shatter": {
    name: "Frantumare",
    description: "Un improvviso forte rumore squillante, dolorosamente intenso, erompe da un punto a tua scelta entro la gittata. Ogni creatura in una sfera di 3 metri di raggio deve effettuare un tiro salvezza Costituzione, subendo 3d8 danni da tuono con un fallimento, o metà con un successo. Una creatura fatta di materiale inorganico ha svantaggio a questo tiro salvezza. Un oggetto non magico non indossato o trasportato subisce anch'esso il danno.",
    higherLevels: "Il danno aumenta di 1d8 per ogni livello di slot superiore al 2°.",
    materialDesc: "una scheggia di mica"
  },
  "Silence": {
    name: "Silenzio",
    description: "Per la durata, nessun suono può essere creato all'interno o passare attraverso una sfera di 6 metri di raggio centrata su un punto a tua scelta entro la gittata. Qualsiasi creatura o oggetto interamente all'interno della sfera è immune ai danni da tuono, e le creature sono assordate finché si trovano interamente al suo interno. È impossibile lanciare un incantesimo che includa una componente verbale lì.",
    higherLevels: null
  },
  "Spider Climb": {
    name: "Movimenti del Ragno",
    description: "Fino al termine dell'incantesimo, una creatura consenziente che tocchi acquisisce la capacità di muoversi su, giù e attraverso superfici verticali e a testa in giù lungo i soffitti, mentre lascia le mani libere. Il bersaglio acquisisce anche una velocità di scalata pari alla sua velocità di camminata.",
    higherLevels: null,
    materialDesc: "una goccia di bitume e un ragno"
  },
  "Spike Growth": {
    name: "Crescita di Spine",
    description: "Il terreno in un raggio di 6 metri centrato su un punto entro la gittata si torce e fa spuntare aculei e spine duri. L'area diventa terreno difficile. Quando una creatura si muove dentro o attraverso l'area, subisce 2d4 danni perforanti per ogni 1,5 metri percorsi. La trasformazione del terreno è camuffata per sembrare naturale.",
    higherLevels: null,
    materialDesc: "sette spine affilate o sette piccoli rametti, ciascuno appuntito"
  },
  "Spiritual Weapon": {
    name: "Arma Spirituale",
    description: "Crei un'arma spettrale fluttuante entro la gittata che dura per la durata. Quando lanci l'incantesimo, puoi eseguire un attacco in mischia con incantesimo contro una creatura entro 1,5 metri dall'arma. Se colpisci, il bersaglio subisce danni da forza pari a 1d8 + il tuo modificatore di caratteristica da incantatore. Come azione bonus nel tuo turno, puoi muovere l'arma fino a 6 metri e ripetere l'attacco.",
    higherLevels: "Il danno aumenta di 1d8 per ogni due livelli di slot superiori al 2°."
  },
  "Suggestion": {
    name: "Suggestione",
    description: "Suggerisci una linea di attività (limitata a una frase o due) e influenzi magicamente una creatura che puoi vedere entro la gittata che può sentirti e capirti. La suggestione deve essere formulata in modo da sembrare ragionevole. Il bersaglio deve effettuare un tiro salvezza Saggezza. Con un fallimento, persegue la linea d'azione che hai descritto al meglio delle sue capacità. L'incantesimo termina quando il soggetto completa l'attività descritta.",
    higherLevels: null,
    materialDesc: "una lingua di serpente e un pezzetto di favo o una goccia di olio dolce"
  },
  "Warding Bond": {
    name: "Vincolo di Interdizione",
    description: "Questo incantesimo protegge una creatura consenziente che tocchi e crea un legame mistico tra te e il bersaglio fino al termine dell'incantesimo. Mentre il bersaglio si trova entro 18 metri da te, ottiene un bonus di +1 alla CA e ai tiri salvezza, e ha resistenza a tutti i danni. Inoltre, ogni volta che subisce danno, anche tu subisci la stessa quantità di danno.",
    higherLevels: null,
    materialDesc: "una coppia di anelli di platino del valore di almeno 50 mo ciascuno, che tu e il bersaglio dovete indossare per la durata"
  },
  "Web": {
    name: "Ragnatela",
    description: "Evochi una massa di ragnatele spesse e appiccicose in un punto a tua scelta entro la gittata. Le ragnatele riempiono un cubo di 6 metri e sono terreno difficile e oscurano leggermente l'area. Ogni creatura che inizia il proprio turno nelle ragnatele o che vi entra durante il proprio turno deve effettuare un tiro salvezza Destrezza o essere afferrata. Le ragnatele sono infiammabili; un cubo di 1,5 metri di ragnatele brucia in 1 round, infliggendo 2d4 danni da fuoco a qualsiasi creatura che inizi il proprio turno nel fuoco.",
    higherLevels: null,
    materialDesc: "un pochino di ragnatela"
  },
  "Zone of Truth": {
    name: "Zona di Verità",
    description: "Crei una zona magica che protegge dall'inganno in una sfera di 4,5 metri di raggio centrata su un punto a tua scelta entro la gittata. Una creatura che entra o inizia il proprio turno nell'area deve effettuare un tiro salvezza Carisma. Con un fallimento, una creatura non può pronunciare una bugia deliberata mentre si trova nell'area. Sai se ogni creatura ha avuto successo o ha fallito.",
    higherLevels: null
  },

  // ============================================================
  // PLAYER'S HANDBOOK 5e — LEVEL 3
  // ============================================================
  "Animate Dead": {
    name: "Animare Morti",
    description: "Questo incantesimo crea un servitore non morto. Scegli un mucchio di ossa o un cadavere di un umanoide di taglia Media o Piccola entro la gittata. Il tuo incantesimo infonde il bersaglio con un'oscena imitazione della vita, sollevandolo come scheletro o zombie. In ciascuno dei tuoi turni, puoi usare un'azione bonus per comandare mentalmente le creature che hai creato con questo incantesimo entro 18 metri. La creatura è sotto il tuo controllo per 24 ore, dopodiché smette di obbedire. Per mantenere il controllo, devi lanciarle nuovamente l'incantesimo.",
    higherLevels: "Animi o riasserisci il controllo su due creature non morte aggiuntive per ogni livello di slot superiore al 3°.",
    materialDesc: "una goccia di sangue, un pezzo di carne e un pizzico di polvere di ossa"
  },
  "Aura of Vitality": {
    name: "Aura di Vitalità",
    description: "L'energia curativa si irradia da te in un'aura di 9 metri di raggio. Fino al termine dell'incantesimo, l'aura si muove con te, centrata su di te. Puoi usare un'azione bonus per far recuperare 2d6 punti ferita a una creatura nell'aura (incluso te stesso).",
    higherLevels: null
  },
  "Aura of Life": {
    name: "Aura di Vita",
    description: "Un'aura protettiva con raggio di 9 metri si irradia da te e ti accompagna nei tuoi spostamenti. Fino al termine dell'incantesimo, ogni creatura non ostile entro l'aura (incluso te) ottiene resistenza ai danni necrotici e il suo massimo dei punti ferita non può essere abbassato. Inoltre, una creatura vivente non ostile entro l'aura recupera 1 punto ferita all'inizio del proprio turno se ha 0 punti ferita.",
    higherLevels: null
  },
  "Aura of Purity": {
    name: "Aura di Purezza",
    description: "Un'aura purificatrice con raggio di 9 metri emana da te e ti segue nei movimenti. Fino al termine dell'incantesimo, ogni creatura non ostile entro l'aura (incluso te) non può ammalarsi, ottiene resistenza ai danni da veleno e ha vantaggio ai tiri salvezza contro effetti che impongono una delle seguenti condizioni: accecato, ammaliato, assordato, avvelenato, paralizzato, spaventato o stordito.",
    higherLevels: null
  },
  "Beacon of Hope": {
    name: "Faro di Speranza",
    description: "Questo incantesimo conferisce speranza e vitalità. Scegli un numero qualsiasi di creature entro la gittata. Per la durata, ogni bersaglio ha vantaggio ai tiri salvezza Saggezza e ai tiri salvezza contro morte, e recupera il numero massimo possibile di punti ferita da qualsiasi cura.",
    higherLevels: null
  },
  "Bestow Curse": {
    name: "Scagliare Maledizione",
    description: "Tocchi una creatura, e quella creatura deve riuscire in un tiro salvezza Saggezza o diventare maledetta. Scegli uno di quattro effetti: svantaggio alle prove di caratteristica e ai tiri salvezza con un valore di caratteristica; svantaggio ai tiri per colpire contro di te; deve effettuare un tiro salvezza Saggezza ogni turno o sprecare la sua azione; oppure i tuoi attacchi e incantesimi infliggono 1d8 danni necrotici aggiuntivi.",
    higherLevels: "Al 4° livello, concentrazione fino a 10 minuti. Al 5°, 8 ore (senza concentrazione). Al 7°, 24 ore. Al 9°, finché non viene dissolta."
  },
  "Blink": {
    name: "Intermittenza",
    description: "Alla fine di ciascuno dei tuoi turni, tira 1d20. Con 11 o più, scompari dal tuo piano attuale e appari nel Piano Etereo. All'inizio del tuo prossimo turno, ritorni in uno spazio non occupato a tua scelta entro 3 metri da dove eri scomparso. Mentre sei sul Piano Etereo, puoi vedere e sentire il piano da cui sei venuto in tonalità di grigio, fino a 18 metri.",
    higherLevels: null
  },
  "Call Lightning": {
    name: "Invocare il Fulmine",
    description: "Una nuvola temporalesca appare in forma cilindrica (3 metri di altezza, 18 metri di raggio) in un punto 30 metri direttamente sopra di te. Scegli un punto che puoi vedere entro la gittata. Un fulmine cala, e ogni creatura entro 1,5 metri da quel punto deve effettuare un tiro salvezza Destrezza, subendo 3d10 danni da fulmine con un fallimento, o metà con un successo. In ogni turno successivo, puoi usare la tua azione per richiamare nuovamente il fulmine. Se sei all'aperto durante una tempesta, il danno aumenta di 1d10.",
    higherLevels: "Il danno aumenta di 1d10 per ogni livello di slot superiore al 3°."
  },
  "Clairvoyance": {
    name: "Chiaroveggenza",
    description: "Crei un sensore invisibile entro la gittata in una posizione a te familiare o in una posizione ovvia. Il sensore rimane per la durata e non può essere attaccato o interagito. Quando lanci l'incantesimo, scegli vista o udito. Puoi usare il senso scelto attraverso il sensore come se fossi nel suo spazio. Come azione, puoi cambiare tra vista e udito.",
    higherLevels: null,
    materialDesc: "un focus del valore di almeno 100 mo, un corno ingioiellato per udire o un occhio di vetro per vedere"
  },
  "Conjure Animals": {
    name: "Evoca Animali",
    description: "Evochi spiriti folletti che assumono la forma di bestie. Scegli un'opzione: una bestia di GS 2 o inferiore, due bestie di GS 1 o inferiore, quattro bestie di GS 1/2 o inferiore, oppure otto bestie di GS 1/4 o inferiore. Ogni bestia è considerata anche un folletto. Le creature evocate sono amichevoli verso di te e i tuoi compagni.",
    higherLevels: "Al 5° livello, il doppio. Al 7° livello, tre volte tanto. Al 9° livello, quattro volte tanto."
  },
  "Conjure Barrage": {
    name: "Evoca Pioggia di Armi",
    description: "Lanci un'arma non magica o un pezzo di munizione non magico nell'aria per creare un cono di armi identiche. Ogni creatura in un cono di 18 metri deve effettuare un tiro salvezza Destrezza, subendo 3d8 danni con un fallimento, o metà con un successo. Il tipo di danno è lo stesso dell'arma o della munizione.",
    higherLevels: null,
    materialDesc: "una munizione o un'arma da lancio"
  },
  "Counterspell": {
    name: "Controincantesimo",
    description: "Tenti di interrompere una creatura nel processo di lancio di un incantesimo. Se la creatura sta lanciando un incantesimo di 3° livello o inferiore, il suo incantesimo fallisce e non ha effetto. Se sta lanciando un incantesimo di 4° livello o superiore, effettua una prova di caratteristica usando la tua caratteristica da incantatore (CD 10 + livello dell'incantesimo). Con un successo, l'incantesimo della creatura fallisce.",
    higherLevels: "L'incantesimo interrotto non ha effetto se il suo livello è uguale o inferiore al livello dello slot di incantesimo che hai usato."
  },
  "Create Food and Water": {
    name: "Creare Cibo e Acqua",
    description: "Crei 20 kg di cibo e 113 litri di acqua sul terreno o in contenitori entro la gittata, abbastanza per sostentare fino a quindici umanoidi o cinque destrieri per 24 ore. Il cibo è insipido ma nutriente e si guasta se non consumato dopo 24 ore. L'acqua è pulita e non si deteriora.",
    higherLevels: null
  },
  "Crusader's Mantle": {
    name: "Manto del Crociato",
    description: "Il potere divino si irradia da te in un'aura di 9 metri di raggio, risvegliando audacia nelle creature amichevoli. Fino al termine dell'incantesimo, l'aura si muove con te, centrata su di te. Mentre si trova nell'aura, ogni creatura non ostile (incluso te stesso) infligge 1d4 danni radiosi aggiuntivi quando colpisce con un attacco con un'arma.",
    higherLevels: null
  },
  "Daylight": {
    name: "Luce Diurna",
    description: "Una sfera di luce di 18 metri di raggio si diffonde da un punto a tua scelta entro la gittata. La sfera è di luce intensa ed emette luce fioca per ulteriori 18 metri. Se il punto è su un oggetto che tieni o che non è indossato o trasportato, la luce risplende dall'oggetto e si muove con esso. Se l'area di questo incantesimo si sovrappone a un'area di oscurità creata da un incantesimo di 3° livello o inferiore, l'incantesimo che ha creato l'oscurità viene dissolto.",
    higherLevels: null
  },
  "Dispel Magic": {
    name: "Dissolvi Magie",
    description: "Scegli una creatura, oggetto o effetto magico entro la gittata. Qualsiasi incantesimo di 3° livello o inferiore sul bersaglio termina. Per ogni incantesimo di 4° livello o superiore sul bersaglio, effettua una prova di caratteristica usando la tua caratteristica da incantatore (CD 10 + livello dell'incantesimo). Con un successo, l'incantesimo termina.",
    higherLevels: "Termini automaticamente gli effetti di un incantesimo sul bersaglio se il livello dell'incantesimo è uguale o inferiore al livello dello slot che hai usato."
  },
  "Elemental Weapon": {
    name: "Arma Elementale",
    description: "Un'arma non magica che tocchi diventa un'arma magica. Scegli acido, freddo, fuoco, fulmine o tuono. Per la durata, l'arma ha un bonus di +1 ai tiri per colpire e infligge 1d4 danni aggiuntivi del tipo scelto quando colpisce.",
    higherLevels: "Con uno slot di 5°-6° livello, il bonus aumenta a +2 e il danno extra a 2d4. Con uno slot di 7° livello o superiore, +3 e 3d4."
  },
  "Fear": {
    name: "Paura",
    description: "Proietti un'immagine fantasmatica delle peggiori paure di una creatura. Ogni creatura in un cono di 9 metri deve riuscire in un tiro salvezza Saggezza o lasciar cadere quel che sta tenendo e diventare spaventata. Mentre è spaventata, una creatura deve compiere l'azione di Scattare e allontanarsi da te per la rotta più sicura disponibile in ciascuno dei suoi turni. Se termina il proprio turno senza linea di vista verso di te, può effettuare un tiro salvezza Saggezza, terminando l'effetto su di sé con un successo.",
    higherLevels: null,
    materialDesc: "una piuma bianca o il cuore di una gallina"
  },
  "Feign Death": {
    name: "Simulare Morte",
    description: "Tocchi una creatura consenziente e la metti in uno stato catalettico indistinguibile dalla morte. Per la durata, il bersaglio appare morto a ogni ispezione esterna e agli incantesimi usati per determinarne lo stato. Il bersaglio è accecato e incapacitato, la sua velocità scende a 0, e ha resistenza a tutti i danni eccetto quelli psichici. Se il bersaglio è malato o avvelenato, quegli effetti sono sospesi per la durata.",
    higherLevels: null,
    materialDesc: "un pizzico di terra di cimitero"
  },
  "Fireball": {
    name: "Palla di Fuoco",
    description: "Una striscia luminosa balena dal tuo dito puntato verso un punto a tua scelta entro la gittata e poi sboccia con un basso ruggito in un'esplosione di fiamme. Ogni creatura in una sfera di 6 metri di raggio centrata su quel punto deve effettuare un tiro salvezza Destrezza, subendo 8d6 danni da fuoco con un fallimento, o metà con un successo. Il fuoco si diffonde dietro gli angoli e accende oggetti infiammabili non indossati o trasportati.",
    higherLevels: "Il danno aumenta di 1d6 per ogni livello di slot superiore al 3°.",
    materialDesc: "una pallina di guano di pipistrello e zolfo"
  },
  "Fly": {
    name: "Volare",
    description: "Tocchi una creatura consenziente. Il bersaglio acquisisce una velocità di volo di 18 metri per la durata. Quando l'incantesimo termina, il bersaglio cade se è ancora in volo, a meno che non possa fermare la caduta.",
    higherLevels: "Puoi bersagliare una creatura aggiuntiva per ogni livello di slot superiore al 3°.",
    materialDesc: "una penna remigante di un qualsiasi uccello"
  },
  "Gaseous Form": {
    name: "Forma Gassosa",
    description: "Trasformi una creatura consenziente che tocchi, insieme a tutto ciò che indossa e trasporta, in una nube nebbiosa per la durata. Il suo unico metodo di movimento è una velocità di volo di 3 metri. Il bersaglio ha resistenza ai danni non magici e vantaggio ai tiri salvezza Forza, Destrezza e Costituzione. Può passare attraverso piccoli buchi e fessure ma tratta i liquidi come se fossero superfici solide. Il bersaglio non può attaccare o lanciare incantesimi.",
    higherLevels: null,
    materialDesc: "un pochino di garza e un filo di fumo"
  },
  "Glyph of Warding": {
    name: "Glifo di Interdizione",
    description: "Incidi un glifo che danneggia altre creature, su una superficie o all'interno di un oggetto che può essere chiuso per nasconderlo. Il glifo copre un'area fino a 3 metri di diametro. Tu decidi cosa attiva il glifo. Scegli rune esplosive (5d8 danni acidi, freddo, fuoco, fulmine o tuono in una sfera di 6 metri di raggio, tiro salvezza Destrezza per metà) o glifo di incantesimo (memorizza un incantesimo di 3° livello o inferiore).",
    higherLevels: "Il danno delle rune esplosive aumenta di 1d8 per ogni livello di slot superiore al 3°. Un glifo di incantesimo può memorizzare un incantesimo fino al livello dello slot usato.",
    materialDesc: "incenso e diamante in polvere del valore di almeno 200 mo, consumati"
  },
  "Haste": {
    name: "Velocità",
    description: "Scegli una creatura consenziente che puoi vedere entro la gittata. Fino al termine dell'incantesimo, la velocità del bersaglio è raddoppiata, ottiene un bonus di +2 alla CA, ha vantaggio ai tiri salvezza Destrezza e ottiene un'azione aggiuntiva in ciascuno dei suoi turni (Attaccare con un solo attacco con un'arma, Scattare, Disimpegnarsi, Nascondersi o Usare un Oggetto). Quando l'incantesimo termina, il bersaglio non può muoversi né compiere azioni fino dopo il suo prossimo turno, mentre un'ondata di letargia lo travolge.",
    higherLevels: null,
    materialDesc: "una scaglia di radice di liquirizia"
  },
  "Hunger of Hadar": {
    name: "Fame di Hadar",
    description: "Apri un varco verso l'oscurità tra le stelle, una regione infestata da orrori sconosciuti. Una sfera di nera oscurità e freddo pungente di 6 metri di raggio appare centrata su un punto entro la gittata. Nessuna luce può illuminare l'area, e le creature interamente al suo interno sono accecate. Qualsiasi creatura che inizia il proprio turno nell'area subisce 2d6 danni da freddo. Qualsiasi creatura che termina il proprio turno nell'area deve effettuare un tiro salvezza Destrezza o subire 2d6 danni acidi.",
    higherLevels: null,
    materialDesc: "un tentacolo di polpo sotto aceto"
  },
  "Hypnotic Pattern": {
    name: "Trama Ipnotica",
    description: "Crei una trama contorta di colori che si intreccia nell'aria all'interno di un cubo di 9 metri entro la gittata. Ogni creatura nell'area che vede la trama deve effettuare un tiro salvezza Saggezza. Con un fallimento, la creatura diventa ammaliata per la durata. Mentre è ammaliata, la creatura è incapacitata e ha velocità 0. L'incantesimo termina per una creatura colpita se subisce qualsiasi danno o se qualcun altro usa un'azione per scuoterla dal suo torpore.",
    higherLevels: null,
    materialDesc: "un bastoncino di incenso luminoso o una fiala di cristallo riempita con materiale fosforescente"
  },
  "Leomund's Tiny Hut": {
    name: "Capanna di Leomund",
    description: "Una cupola di forza immobile di 3 metri di raggio appare attorno e sopra di te e rimane stazionaria per la durata. L'incantesimo termina se lasci la sua area. Nove creature di taglia Media o inferiore possono entrarvi con te. Le creature e gli oggetti all'interno della cupola al momento del lancio dell'incantesimo possono muoversi liberamente attraverso di essa. Tutte le altre creature e oggetti non possono attraversarla. Gli incantesimi e gli altri effetti magici non possono estendersi attraverso la cupola o essere lanciati attraverso di essa.",
    higherLevels: null,
    materialDesc: "una piccola perlina di cristallo"
  },
  "Lightning Arrow": {
    name: "Freccia Folgorante",
    description: "La prossima volta che esegui un attacco a distanza con un'arma durante la durata dell'incantesimo, le munizioni dell'arma, o l'arma stessa se lanciata, si trasformano in un fulmine. Esegui il tiro per colpire normalmente. Il bersaglio subisce 4d8 danni da fulmine con un colpo, o la metà con un fallimento, invece dei danni normali dell'arma. Sia che colpisci o manchi, ogni creatura entro 3 metri dal bersaglio deve effettuare un tiro salvezza Destrezza, subendo 2d8 danni da fulmine con un fallimento, o metà con un successo.",
    higherLevels: "Il danno per entrambi gli effetti dell'incantesimo aumenta di 1d8 per ogni livello di slot superiore al 3°."
  },
  "Lightning Bolt": {
    name: "Fulmine",
    description: "Una scarica di fulmine che forma una linea lunga 30 metri e larga 1,5 metri scaturisce da te in una direzione a tua scelta. Ogni creatura nella linea deve effettuare un tiro salvezza Destrezza, subendo 8d6 danni da fulmine con un fallimento, o metà con un successo. Il fulmine accende oggetti infiammabili nell'area che non siano indossati o trasportati.",
    higherLevels: "Il danno aumenta di 1d6 per ogni livello di slot superiore al 3°.",
    materialDesc: "un pochino di pelliccia e una verga di ambra, cristallo o vetro"
  },
  "Magic Circle": {
    name: "Cerchio Magico",
    description: "Crei un cilindro di energia magica di 3 metri di raggio e 6 metri di altezza centrato su un punto sul terreno entro la gittata. Scegli uno o più tra: celestiali, elementali, folletti, immondi o non morti. Il cerchio influenza una creatura del tipo scelto: non può entrare volontariamente nel cilindro con mezzi non magici, ha svantaggio ai tiri per colpire contro bersagli all'interno del cilindro, e i bersagli all'interno del cilindro non possono essere ammaliati, spaventati o posseduti dalla creatura.",
    higherLevels: "La durata aumenta di 1 ora per ogni livello di slot superiore al 3°.",
    materialDesc: "acqua santa o argento e ferro in polvere del valore di almeno 100 mo, consumati"
  },
  "Major Image": {
    name: "Immagine Maggiore",
    description: "Crei l'immagine di un oggetto, una creatura o un altro fenomeno visibile non più grande di un cubo di 6 metri di lato. L'immagine appare in un punto entro la gittata e dura per la durata. Sembra completamente reale, inclusi suoni, odori e temperatura. Puoi usare la tua azione per far muovere l'immagine e cambiarne l'aspetto.",
    higherLevels: "Quando lanci questo incantesimo usando uno slot di 6° livello o superiore, l'incantesimo dura finché non viene dissolto, senza richiedere la tua concentrazione.",
    materialDesc: "un pochino di lana di pecora"
  },
  "Mass Healing Word": {
    name: "Parola Guaritrice di Massa",
    description: "Mentre pronunci parole di ristoro, fino a sei creature a tua scelta che puoi vedere entro la gittata recuperano punti ferita pari a 1d4 + il tuo modificatore di caratteristica da incantatore. Questo incantesimo non ha effetto sui non morti o sui costrutti.",
    higherLevels: "La cura aumenta di 1d4 per ogni livello di slot superiore al 3°."
  },
  "Meld into Stone": {
    name: "Fondersi nella Pietra",
    description: "Entri in un oggetto o superficie di pietra abbastanza grande da contenere completamente il tuo corpo, fondendoti tu stesso e tutto l'equipaggiamento che porti con la pietra per la durata. Non puoi vedere ciò che accade all'esterno e hai svantaggio alle prove di Saggezza (Percezione) per sentire suoni esterni. Rimani consapevole del passare del tempo e puoi lanciare incantesimi su te stesso mentre sei fuso. Danni minori alla pietra non ti danneggiano, ma la sua distruzione parziale o un cambiamento di forma ti espelle e infligge 6d6 danni contundenti.",
    higherLevels: null
  },
  "Nondetection": {
    name: "Anti-Individuazione",
    description: "Per la durata, nascondi un bersaglio che tocchi dalla magia di divinazione. Il bersaglio può essere una creatura consenziente o un luogo o un oggetto non più grande di 3 metri in qualsiasi dimensione. Il bersaglio non può essere bersagliato da alcuna magia di divinazione o percepito attraverso sensori magici di scrutamento.",
    higherLevels: null,
    materialDesc: "un pizzico di polvere di diamante del valore di 25 mo cosparsa sul bersaglio, consumata"
  },
  "Phantom Steed": {
    name: "Destriero Fantomatico",
    description: "Una creatura quasi reale di taglia Grande, simile a un cavallo, appare sul terreno in uno spazio non occupato a tua scelta entro la gittata. Ha le statistiche di un cavallo da sella ma ha velocità 30 metri e può percorrere 20 km in un'ora, o 16 km a passo veloce. Quando l'incantesimo termina, il destriero svanisce gradualmente, dando al cavaliere 1 minuto per smontare.",
    higherLevels: null
  },
  "Plant Growth": {
    name: "Crescita Vegetale",
    description: "Se lanciato come azione: tutte le piante normali in un raggio di 30 metri centrato su un punto entro la gittata diventano spesse e troppo cresciute. Una creatura che si muove attraverso l'area deve spendere 1,2 metri di movimento per ogni 30 cm. Se lanciato in 8 ore: tutte le piante in un raggio di 800 metri centrato su un punto entro la gittata diventano arricchite, producendo il doppio del normale quantitativo di cibo quando raccolte per 1 anno.",
    higherLevels: null
  },
  "Protection from Energy": {
    name: "Protezione dall’Energia",
    description: "Per la durata, la creatura consenziente che tocchi ha resistenza a un tipo di danno a tua scelta: acido, freddo, fuoco, fulmine o tuono.",
    higherLevels: null
  },
  "Remove Curse": {
    name: "Rimuovi Maledizione",
    description: "Al tuo tocco, tutte le maledizioni che colpiscono una creatura o un oggetto terminano. Se l'oggetto è un oggetto magico maledetto, la sua maledizione rimane, ma l'incantesimo spezza la sintonia del proprietario con l'oggetto cosicché possa essere rimosso o scartato.",
    higherLevels: null
  },
  "Revivify": {
    name: "Rinascita",
    description: "Tocchi una creatura morta nell'ultimo minuto. Quella creatura ritorna in vita con 1 punto ferita. Questo incantesimo non può riportare in vita una creatura morta di vecchiaia, né può ripristinare parti del corpo mancanti.",
    higherLevels: null,
    materialDesc: "diamanti del valore di 300 mo, consumati"
  },
  "Sending": {
    name: "Inviare",
    description: "Invii un breve messaggio di venticinque parole o meno a una creatura con cui hai familiarità. La creatura sente il messaggio nella sua mente, ti riconosce come mittente e può rispondere allo stesso modo immediatamente. C'è una probabilità del 5% che il messaggio non arrivi se il bersaglio si trova su un piano di esistenza diverso.",
    higherLevels: null,
    materialDesc: "un pezzo corto di sottile filo di rame"
  },
  "Sleet Storm": {
    name: "Tempesta di Nevischio",
    description: "Fino al termine dell'incantesimo, pioggia gelata e nevischio cadono in un cilindro di 12 metri di altezza e 12 metri di raggio centrato su un punto a tua scelta entro la gittata. L'area è fortemente oscurata, e le fiamme esposte vi vengono spente. Il terreno nell'area è coperto di ghiaccio scivoloso, rendendolo terreno difficile. Quando una creatura entra nell'area per la prima volta in un turno o vi inizia il proprio turno, deve effettuare un tiro salvezza Destrezza. Con un fallimento, cade prona.",
    higherLevels: null,
    materialDesc: "un pizzico di polvere e alcune gocce d'acqua"
  },
  "Slow": {
    name: "Lentezza",
    description: "Alteri il tempo attorno a un massimo di sei creature a tua scelta in un cubo di 12 metri entro la gittata. Ogni bersaglio deve riuscire in un tiro salvezza Saggezza o esserne colpito. La velocità di un bersaglio colpito è dimezzata, subisce una penalità di -2 alla CA e ai tiri salvezza Destrezza, e non può usare reazioni. Nel suo turno, può usare un'azione o un'azione bonus, non entrambe, e può effettuare solo un attacco in mischia o a distanza. Se cerca di lanciare un incantesimo con tempo di lancio di 1 azione, tira 1d20; con 11+, l'incantesimo non ha effetto fino al prossimo turno della creatura.",
    higherLevels: null,
    materialDesc: "una goccia di melassa"
  },
  "Speak with Dead": {
    name: "Parlare con i Morti",
    description: "Conferisci la sembianza di vita e di intelligenza a un cadavere a tua scelta entro la gittata, permettendogli di rispondere a un massimo di cinque domande. Il cadavere conosce solo ciò che sapeva in vita, inclusi i linguaggi che conosceva. Le risposte sono di solito brevi, criptiche o ripetitive, e il cadavere non è soggetto ad alcuna costrizione di offrire una risposta veritiera se sei ostile nei suoi confronti. Questo incantesimo non riporta l'anima della creatura nel suo corpo.",
    higherLevels: null,
    materialDesc: "incenso che brucia"
  },
  "Speak with Plants": {
    name: "Parlare con le Piante",
    description: "Imbevi le piante entro 9 metri da te di senzienza e animazione limitate, dando loro la capacità di comunicare con te e seguire i tuoi semplici comandi. Puoi interrogare le piante riguardo a eventi nell'area dell'incantesimo nell'ultimo giorno, oppure trasformare il terreno difficile causato dalla crescita di piante in terreno ordinario, o trasformare il terreno ordinario in terreno difficile.",
    higherLevels: null
  },
  "Spirit Guardians": {
    name: "Guardiani Spirituali",
    description: "Richiami spiriti per proteggerti. Si muovono attorno a te a una distanza di 4,5 metri per la durata. La velocità di una creatura colpita viene dimezzata nell'area, e quando la creatura entra nell'area per la prima volta in un turno o vi inizia il proprio turno, deve effettuare un tiro salvezza Saggezza, subendo 3d8 danni radiosi (incantatore buono/neutrale) o necrotici (incantatore malvagio) con un fallimento, o metà con un successo.",
    higherLevels: "Il danno aumenta di 1d8 per ogni livello di slot superiore al 3°.",
    materialDesc: "un simbolo sacro"
  },
  "Stinking Cloud": {
    name: "Nube Maleodorante",
    description: "Crei una sfera di gas giallo nauseabondo di 6 metri di raggio centrata su un punto entro la gittata. La nube si diffonde dietro gli angoli, e la sua area è fortemente oscurata. Ogni creatura interamente all'interno della nube all'inizio del proprio turno deve effettuare un tiro salvezza Costituzione contro veleno. Con un fallimento, la creatura spende la sua azione di quel turno conati di vomito e barcollando.",
    higherLevels: null,
    materialDesc: "un uovo marcio o diverse foglie di lisichite"
  },
  "Tongues": {
    name: "Lingue",
    description: "Questo incantesimo concede alla creatura che tocchi la capacità di comprendere qualsiasi linguaggio parlato che sente. Inoltre, quando il bersaglio parla, qualsiasi creatura che conosce almeno un linguaggio e può sentire il bersaglio comprende ciò che dice.",
    higherLevels: null,
    materialDesc: "un piccolo modello di argilla di una ziggurat"
  },
  "Vampiric Touch": {
    name: "Tocco Vampirico",
    description: "Il tocco della tua mano avvolta dalle ombre può sottrarre forza vitale dagli altri per curare le tue ferite. Esegui un attacco in mischia con incantesimo contro una creatura a portata di mano. Se colpisci, il bersaglio subisce 3d6 danni necrotici, e tu recuperi punti ferita pari a metà del danno necrotico inflitto. Fino al termine dell'incantesimo, puoi rieseguire l'attacco in ciascuno dei tuoi turni come azione.",
    higherLevels: "Il danno aumenta di 1d6 per ogni livello di slot superiore al 3°."
  },
  "Water Breathing": {
    name: "Respirare Sott’Acqua",
    description: "Questo incantesimo concede fino a dieci creature consenzienti che puoi vedere entro la gittata la capacità di respirare sott'acqua fino al termine dell'incantesimo. Le creature colpite mantengono anche il loro normale modo di respirazione.",
    higherLevels: null,
    materialDesc: "una canna corta o un pezzo di paglia"
  },
  "Water Walk": {
    name: "Camminare sull’Acqua",
    description: "Questo incantesimo concede la capacità di muoversi su qualsiasi superficie liquida come se fosse terra solida innocua. Fino a dieci creature consenzienti che puoi vedere entro la gittata acquisiscono questa capacità per la durata.",
    higherLevels: null,
    materialDesc: "un pezzo di sughero"
  },
  "Wind Wall": {
    name: "Muro di Vento",
    description: "Un muro di vento forte si erge dal terreno in un punto a tua scelta entro la gittata. Il muro può essere lungo fino a 15 metri, alto 4,5 metri e spesso 30 cm. Quando il muro appare, ogni creatura nella sua area deve effettuare un tiro salvezza Forza, subendo 3d8 danni contundenti con un fallimento, o metà con un successo. Il vento forte tiene a bada nebbia, fumo e altri gas. Le creature volanti o gli oggetti di taglia Piccola o inferiore non possono attraversare il muro. Frecce, dardi e altri proiettili ordinari lanciati contro bersagli dietro il muro vengono deviati verso l'alto e mancano automaticamente.",
    higherLevels: null,
    materialDesc: "un piccolo ventaglio e una piuma di origine esotica"
  },

  // ============================================================
  // PLAYER'S HANDBOOK 5e — LEVEL 4
  // ============================================================
  "Arcane Eye": {
    name: "Occhio Arcano",
    description: "Crei un occhio invisibile e magico entro la gittata che fluttua nell'aria per la durata. Ricevi mentalmente le informazioni visive dall'occhio, che ha vista normale e scurovisione fino a 9 metri. L'occhio può guardare in ogni direzione. Come azione, puoi muovere l'occhio fino a 9 metri in qualsiasi direzione. Non c'è limite a quanto lontano da te l'occhio possa muoversi, ma non può entrare in un altro piano di esistenza.",
    higherLevels: null,
    materialDesc: "un pochino di pelo di pipistrello"
  },
  "Banishment": {
    name: "Esilio",
    description: "Tenti di mandare una creatura che puoi vedere entro la gittata in un altro piano di esistenza. Il bersaglio deve riuscire in un tiro salvezza Carisma o essere bandito. Se il bersaglio è nativo del piano in cui ti trovi, viene bandito in un semipiano innocuo ed è incapacitato lì. Se il bersaglio è nativo di un piano diverso, viene bandito con un debole rumore di scoppio, ritornando al suo piano d'origine. Se mantieni la concentrazione per l'intera durata, il bersaglio rimane nell'altro piano.",
    higherLevels: "Puoi bersagliare una creatura aggiuntiva per ogni livello di slot superiore al 4°.",
    materialDesc: "un oggetto sgradito al bersaglio"
  },
  "Blight": {
    name: "Inaridire",
    description: "L'energia necromantica investe una creatura a tua scelta entro la gittata, prosciugandone l'umidità e la vitalità. Il bersaglio deve effettuare un tiro salvezza Costituzione, subendo 8d8 danni necrotici con un fallimento, o metà con un successo. Questo incantesimo non ha effetto sui non morti o sui costrutti. Se bersagli una creatura vegetale o una pianta magica, effettua il tiro salvezza con svantaggio, e l'incantesimo le infligge danno massimo.",
    higherLevels: "Il danno aumenta di 1d8 per ogni livello di slot superiore al 4°."
  },
  "Compulsion": {
    name: "Compulsione",
    description: "Le creature a tua scelta che puoi vedere entro la gittata e che possono sentirti devono effettuare un tiro salvezza Saggezza. Un bersaglio che non può essere ammaliato ha automaticamente successo. Con un fallimento, un bersaglio è influenzato. Fino al termine dell'incantesimo, puoi usare un'azione bonus per designare una direzione. Ogni bersaglio colpito deve usare il maggior movimento possibile per muoversi in quella direzione nel suo prossimo turno.",
    higherLevels: null
  },
  "Confusion": {
    name: "Confusione",
    description: "L'incantesimo aggredisce e sconvolge la mente delle creature, inducendole al delirio e a comportamenti incontrollati. Al momento del lancio, ogni creatura in una sfera con raggio di 3 metri centrata su un punto a scelta entro la gittata deve superare un tiro salvezza Saggezza, altrimenti ne è influenzata.\n\nUn bersaglio influenzato non può effettuare reazioni e all'inizio di ogni proprio turno deve tirare 1d10 per determinare il proprio comportamento per quel turno:\n\n1 — Usa tutto il movimento per spostarsi in una direzione casuale (tira un d8 e assegna una direzione a ciascuna faccia). Non effettua azioni in quel turno.\n\n2-6 — Non si muove e non effettua azioni in quel turno.\n\n7-8 — Usa la sua azione per effettuare un attacco in mischia contro una creatura scelta a caso entro la sua portata. Se nessuna creatura è a portata, non fa nulla.\n\n9-10 — Agisce e si muove normalmente.\n\nAlla fine di ogni proprio turno, un bersaglio influenzato può ripetere il tiro salvezza Saggezza: se lo supera, l'effetto per lui termina.",
    higherLevels: "Quando lanci questo incantesimo usando uno slot incantesimo di 5° livello o superiore, il raggio della sfera aumenta di 1,5 metri per ogni slot di livello superiore al 4°.",
    materialDesc: "tre gusci di noce"
  },
  "Conjure Minor Elementals": {
    name: "Evoca Elementali Minori",
    description: "Evochi elementali che appaiono in spazi non occupati che puoi vedere entro la gittata. Scegli un'opzione: un elementale di GS 2 o inferiore, due di GS 1 o inferiore, quattro di GS 1/2 o inferiore, oppure otto di GS 1/4 o inferiore. Le creature evocate sono amichevoli verso di te e i tuoi compagni e obbediscono ai tuoi comandi verbali.",
    higherLevels: "Il doppio delle creature con uno slot di 6° livello, il triplo con uno slot di 8° livello."
  },
  "Conjure Woodland Beings": {
    name: "Evoca Creature Boschive",
    description: "Evochi creature folletti che appaiono in spazi non occupati che puoi vedere entro la gittata. Scegli un'opzione: una creatura folletto di GS 2 o inferiore, due di GS 1 o inferiore, quattro di GS 1/2 o inferiore, oppure otto di GS 1/4 o inferiore. Una creatura evocata scompare quando scende a 0 punti ferita o quando l'incantesimo termina. Le creature evocate sono amichevoli verso di te e i tuoi compagni.",
    higherLevels: "Il doppio con uno slot di 6° livello, il triplo con uno slot di 8° livello.",
    materialDesc: "una bacca di agrifoglio per ogni creatura evocata"
  },
  "Control Water": {
    name: "Controllare Acqua",
    description: "Per la durata dell'incantesimo, l'incantatore manipola una massa d'acqua libera in un'area a sua scelta, fino al volume di un cubo con lato di 30 metri. Al lancio sceglie uno fra gli effetti elencati sotto; come azione nei propri turni successivi può ripetere lo stesso effetto o passare a uno diverso.\n\nDeviare la Corrente. L'acqua corrente nell'area scorre nella direzione indicata dall'incantatore, anche se ciò significa risalire pareti, superare ostacoli o seguire percorsi insoliti. Una volta uscita dall'area, l'acqua riprende il flusso naturale dettato dal terreno. La direzione imposta resta valida finché l'incantesimo non termina o non viene scelto un altro effetto.\n\nGorgo. Richiede una massa d'acqua di base almeno 15 m × 15 m e profonda almeno 7,5 m. Si forma un vortice imbutiforme largo 1,5 m alla base, 15 m in cima e alto 7,5 m. Ogni creatura o oggetto in acqua entro 7,5 m dal centro viene risucchiato di 3 m verso il vortice. Una creatura può tentare di nuotare via con una prova di Forza (Atletica) contro la CD del TS dell'incantesimo. Quando una creatura entra per la prima volta nel vortice in un turno o vi inizia il proprio turno, deve effettuare un TS Forza: in caso di fallimento subisce 2d8 danni contundenti e resta intrappolata fino al termine dell'incantesimo; con successo subisce metà danni e si libera. Una creatura intrappolata può usare la propria azione per ripetere il tentativo di fuga, ma con svantaggio alla prova. Ogni oggetto che entra per la prima volta nel vortice in un turno subisce 2d8 danni contundenti, e altrettanti per ogni round in cui rimane al suo interno.\n\nInondazione. Il livello di tutta l'acqua ferma nell'area sale fino a 6 metri. Se l'area tocca una riva, l'acqua tracima sulla terraferma. Se invece l'area è interamente in una vasta massa d'acqua, si genera un'onda alta 6 metri che attraversa l'area da un lato all'altro: ogni imbarcazione di taglia Enorme o inferiore sulla traiettoria viene trasportata dall'onda fino al lato opposto, e ha il 25% di probabilità di rovesciarsi. Il livello rialzato resta tale finché l'incantesimo non termina o non viene scelto un altro effetto. Se è stata creata l'onda, essa si ripete all'inizio di ogni turno successivo dell'incantatore mentre l'effetto è attivo.\n\nSeparare le Acque. L'acqua nell'area si divide aprendo un varco percorribile, con muri d'acqua su entrambi i lati. Il varco copre l'intera area di effetto e permane finché l'incantesimo non termina o non viene scelto un altro effetto; al termine, l'acqua riempie lentamente il varco nel corso del round successivo fino a ripristinare il livello originale.",
    higherLevels: null,
    materialDesc: "una goccia d'acqua e un pizzico di polvere"
  },
  "Death Ward": {
    name: "Interdizione alla Morte",
    description: "Tocchi una creatura e le concedi una misura di protezione dalla morte. La prima volta che il bersaglio scenderebbe a 0 punti ferita a causa dei danni subiti, scende invece a 1 punto ferita, e l'incantesimo termina. Se l'incantesimo è ancora in effetto quando il bersaglio è soggetto a un effetto che lo ucciderebbe istantaneamente senza infliggere danni, quell'effetto viene negato contro il bersaglio, e l'incantesimo termina.",
    higherLevels: null
  },
  "Dimension Door": {
    name: "Porta Dimensionale",
    description: "Ti teletrasporti dalla tua posizione attuale a qualsiasi altro punto entro la gittata. Arrivi esattamente nel punto desiderato, che può essere un luogo che puoi vedere, uno che puoi visualizzare, o uno che puoi descrivere indicando distanza e direzione. Puoi portare con te oggetti il cui peso non superi quello che puoi trasportare. Puoi anche portare con te una creatura consenziente della tua taglia o inferiore. Se arrivassi in uno spazio occupato, sia tu che il tuo compagno subite 4d6 danni da forza e il teletrasporto fallisce.",
    higherLevels: null
  },
  "Divination": {
    name: "Divinazione",
    description: "La tua magia e un'offerta ti mettono in contatto con un dio o i suoi servitori. Poni una singola domanda riguardo a un obiettivo, evento o attività specifica che si verificherà entro 7 giorni. Il DM offre una risposta veritiera, che potrebbe essere una breve frase, una rima criptica o un presagio. I lanci ripetuti prima di un riposo lungo hanno una probabilità cumulativa del 25% di non dare risposta.",
    higherLevels: null,
    materialDesc: "incenso e un'offerta sacrificale appropriata alla tua religione, complessivamente del valore di almeno 25 mo, consumati"
  },
  "Dominate Beast": {
    name: "Dominare Bestie",
    description: "Tenti di affascinare una bestia entro la gittata. Deve riuscire in un tiro salvezza Saggezza o essere ammaliata da te per la durata. Hai un legame telepatico con essa mentre vi trovate sullo stesso piano. Puoi usare questo legame telepatico per impartire comandi (nessuna azione richiesta). Puoi usare la tua azione per assumere il controllo totale e preciso del bersaglio fino alla fine del tuo prossimo turno. Ogni volta che il bersaglio subisce danno, effettua un nuovo tiro salvezza Saggezza.",
    higherLevels: "Al 5° livello, concentrazione fino a 10 minuti. Al 6°, fino a 1 ora. Al 7° o superiore, fino a 8 ore."
  },
  "Evard's Black Tentacles": {
    name: "Tentacoli Neri",
    description: "Tentacoli ebano contorti riempiono un'area quadrata di 6 metri di lato sul terreno che puoi vedere entro la gittata. Per la durata, questi tentacoli trasformano il terreno nell'area in terreno difficile. Quando una creatura entra nell'area per la prima volta in un turno o vi inizia il proprio turno, deve riuscire in un tiro salvezza Destrezza o subire 3d6 danni contundenti ed essere afferrata dai tentacoli. Una creatura che inizia il proprio turno nell'area ed è già afferrata subisce 3d6 danni contundenti. Una creatura afferrata può usare la sua azione per effettuare una prova di Forza o Destrezza contro la CD del tiro salvezza del tuo incantesimo per liberarsi.",
    higherLevels: null,
    materialDesc: "un pezzo di tentacolo di un polpo gigante o di un calamaro gigante"
  },
  "Fabricate": {
    name: "Fabbricare",
    description: "Converti materie prime in prodotti dello stesso materiale. Puoi fabbricare un oggetto di taglia Grande o inferiore (fino a un cubo di 3 metri di lato, o otto cubi di 1,5 metri di lato collegati), data una sufficiente quantità di materia prima. Se lavori con metallo, pietra o altra sostanza minerale, l'oggetto fabbricato non può essere più grande di Medio (un singolo cubo di 1,5 metri di lato). Non puoi creare creature o oggetti magici con questo incantesimo.",
    higherLevels: null
  },
  "Fire Shield": {
    name: "Scudo di Fuoco",
    description: "Fiamme sottili e tenui avvolgono il tuo corpo per la durata, emettendo luce intensa in un raggio di 3 metri e luce fioca per ulteriori 3 metri. Scegli scudo caldo (resistenza ai danni da freddo) o scudo gelido (resistenza ai danni da fuoco). Inoltre, ogni volta che una creatura entro 1,5 metri da te ti colpisce con un attacco in mischia, lo scudo erompe in fiamme. L'attaccante subisce 2d8 danni da fuoco da uno scudo caldo, o 2d8 danni da freddo da uno scudo gelido.",
    higherLevels: null,
    materialDesc: "un pochino di fosforo o una lucciola"
  },
  "Freedom of Movement": {
    name: "Libertà di Movimento",
    description: "Tocchi una creatura consenziente. Per la durata, il movimento del bersaglio non è influenzato dal terreno difficile, e gli incantesimi e altri effetti magici non possono né ridurne la velocità né causarne la paralisi o l'afferramento. Il bersaglio può anche spendere 1,5 metri di movimento per liberarsi automaticamente da costrizioni non magiche. Trovarsi sott'acqua non impone alcuna penalità al movimento o agli attacchi del bersaglio.",
    higherLevels: null,
    materialDesc: "una cinghia di cuoio, legata attorno al braccio o a un'appendice simile"
  },
  "Giant Insect": {
    name: "Insetto Gigante",
    description: "Trasformi fino a dieci centopiedi, tre ragni, cinque vespe, o uno scorpione entro la gittata in versioni giganti delle loro forme naturali per la durata. Ogni creatura obbedisce ai tuoi comandi verbali e agisce nel tuo turno in combattimento.",
    higherLevels: null
  },
  "Grasping Vine": {
    name: "Liana Afferrante",
    description: "Evochi una liana che spunta dal terreno in uno spazio non occupato a tua scelta che puoi vedere entro la gittata. Quando lanci questo incantesimo, puoi dirigere la liana a colpire una creatura entro 9 metri da essa che puoi vedere. Quella creatura deve riuscire in un tiro salvezza Destrezza o essere tirata di 6 metri direttamente verso la liana. Fino al termine dell'incantesimo, puoi dirigere la liana a colpire la stessa creatura o un'altra come azione bonus in ciascuno dei tuoi turni.",
    higherLevels: null
  },
  "Greater Invisibility": {
    name: "Invisibilità Superiore",
    description: "Tu o una creatura che tocchi diventate invisibili fino al termine dell'incantesimo. Tutto ciò che il bersaglio indossa o trasporta è invisibile finché rimane sulla sua persona.",
    higherLevels: null
  },
  "Guardian of Faith": {
    name: "Guardiano della Fede",
    description: "Un grande guardiano spettrale appare e fluttua per la durata in uno spazio non occupato a tua scelta che puoi vedere entro la gittata. Qualsiasi creatura ostile nei tuoi confronti che si muove in uno spazio entro 3 metri dal guardiano per la prima volta in un turno deve riuscire in un tiro salvezza Destrezza, subendo 20 danni radiosi con un fallimento, o metà con un successo. Il guardiano svanisce quando ha inflitto un totale di 60 danni.",
    higherLevels: null
  },
  "Hallucinatory Terrain": {
    name: "Terreno Illusorio",
    description: "Fai sì che un terreno naturale in un cubo di 45 metri di lato entro la gittata sembri, suoni e abbia l'odore di un altro tipo di terreno naturale. Le strutture costruite, l'equipaggiamento e le creature all'interno dell'area non vengono modificati nell'aspetto. Le caratteristiche tattili del terreno sono invariate, quindi le creature che entrano nell'area probabilmente vedranno attraverso l'illusione.",
    higherLevels: null,
    materialDesc: "una pietra, un rametto e un pochino di pianta verde"
  },
  "Ice Storm": {
    name: "Tempesta di Ghiaccio",
    description: "Una grandine di ghiaccio duro come pietra martella il terreno in un cilindro di 6 metri di raggio e 12 metri di altezza centrato su un punto entro la gittata. Ogni creatura nel cilindro deve effettuare un tiro salvezza Destrezza, subendo 2d8 danni contundenti e 4d6 danni da freddo con un fallimento, o metà con un successo. I chicchi di grandine trasformano l'area in terreno difficile fino alla fine del tuo prossimo turno.",
    higherLevels: "Il danno contundente aumenta di 1d8 per ogni livello di slot superiore al 4°.",
    materialDesc: "un pizzico di polvere e alcune gocce d'acqua"
  },
  "Leomund's Secret Chest": {
    name: "Scrigno Segreto",
    description: "Nascondi un baule e tutto il suo contenuto sul Piano Etereo. Devi toccare il baule e la replica in miniatura che funge da componente materiale. Il baule può contenere fino a circa 0,3 metri cubi di materiale non vivente. Mentre il baule rimane sul Piano Etereo, puoi usare un'azione e toccare la replica per richiamare il baule. Dopo 60 giorni, c'è una probabilità cumulativa del 5% al giorno che l'effetto dell'incantesimo termini.",
    higherLevels: null,
    materialDesc: "uno scrigno raffinato di 90x60x60 cm, fatto di materiali rari del valore di almeno 5.000 mo, e una replica Minuscola fatta degli stessi materiali del valore di almeno 50 mo"
  },
  "Locate Creature": {
    name: "Localizza Creatura",
    description: "Descrivi o nomina una creatura a te familiare. Percepisci la direzione della posizione della creatura, finché si trova entro 300 metri da te. Se la creatura si sta muovendo, conosci la direzione del suo movimento. L'incantesimo può individuare una creatura specifica nota a te, o la creatura più vicina di un certo tipo. Acqua corrente larga almeno 3 metri blocca un percorso diretto tra te e la creatura.",
    higherLevels: null,
    materialDesc: "un pochino di pelo di segugio"
  },
  "Mordenkainen's Faithful Hound": {
    name: "Segugio Fedele",
    description: "Evochi un mastino fantasma in uno spazio non occupato che puoi vedere entro la gittata. Il mastino è invisibile a tutte le creature eccetto te e non può essere danneggiato. Quando una creatura di taglia Piccola o superiore giunge entro 9 metri da esso senza prima pronunciare la parola d'ordine che specifichi, il mastino inizia ad abbaiare forte. Il mastino vede creature invisibili e può vedere nel Piano Etereo. Ignora le illusioni. All'inizio di ciascuno dei tuoi turni, il mastino tenta di mordere una creatura entro 1,5 metri da esso che è ostile nei tuoi confronti. Il suo bonus di attacco è pari al tuo modificatore da incantatore + il tuo bonus di competenza. Se colpisce, infligge 4d8 danni perforanti.",
    higherLevels: null,
    materialDesc: "un piccolo fischietto d'argento, un pezzo di osso e un filo"
  },
  "Mordenkainen's Private Sanctum": {
    name: "Santuario Privato",
    description: "Rendi un'area entro la gittata magicamente sicura. L'area è un cubo di lato variabile da 1,5 a 30 metri. Scegli una o più di queste proprietà: il suono non può attraversare la barriera, la barriera appare scura e nebbiosa impedendo la vista, i sensori di divinazione non possono apparire nell'area, le creature nell'area non possono essere bersagliate da incantesimi di divinazione, nulla può teletrasportarsi dentro o fuori dall'area, il viaggio planare è bloccato all'interno dell'area. Lanciando questo incantesimo nello stesso punto ogni giorno per un anno, l'effetto diventa permanente.",
    higherLevels: "Puoi aumentare la dimensione del cubo di 30 metri per ogni livello di slot superiore al 4°.",
    materialDesc: "un sottile foglio di piombo, un pezzo di vetro opaco, un batuffolo di cotone o stoffa e crisolito in polvere"
  },
  "Otiluke's Resilient Sphere": {
    name: "Sfera Elastica",
    description: "Una sfera di forza scintillante racchiude una creatura o un oggetto di taglia Grande o inferiore entro la gittata. Una creatura non consenziente deve effettuare un tiro salvezza Destrezza o essere racchiusa per la durata. Nulla può attraversare la barriera. La sfera è immune a tutti i danni. Una creatura all'interno può usare la sua azione per spingere contro le pareti della sfera e farla rotolare fino a metà della velocità della creatura. Un incantesimo Disintegrazione che bersaglia la sfera la distrugge senza danneggiare nulla all'interno.",
    higherLevels: null,
    materialDesc: "un pezzo emisferico di cristallo trasparente e un corrispondente pezzo emisferico di gomma arabica"
  },
  "Phantasmal Killer": {
    name: "Allucinazione Mortale",
    description: "Attingi agli incubi di una creatura che puoi vedere entro la gittata e crei una manifestazione illusoria delle sue paure più profonde, visibile solo a quella creatura. Il bersaglio deve effettuare un tiro salvezza Saggezza. Con un fallimento, il bersaglio diventa spaventato per la durata. Alla fine di ciascuno dei turni del bersaglio prima del termine dell'incantesimo, il bersaglio deve riuscire in un tiro salvezza Saggezza o subire 4d10 danni psichici. Con un tiro salvezza riuscito, l'incantesimo termina.",
    higherLevels: "Il danno aumenta di 1d10 per ogni livello di slot superiore al 4°."
  },
  "Polymorph": {
    name: "Metamorfosi",
    description: "Questo incantesimo trasforma una creatura che puoi vedere entro la gittata in una nuova forma. Una creatura non consenziente deve effettuare un tiro salvezza Saggezza per evitare l'effetto. La nuova forma può essere qualsiasi bestia il cui grado di sfida sia uguale o inferiore a quello del bersaglio (o al suo livello). Le statistiche di gioco del bersaglio, inclusi i punteggi di caratteristiche mentali, sono sostituiti dalle statistiche della bestia scelta. Mantiene il suo allineamento e la sua personalità. Il bersaglio assume i punti ferita della sua nuova forma.",
    higherLevels: null,
    materialDesc: "un bozzolo di bruco"
  },
  "Staggering Smite": {
    name: "Punizione Stordente",
    description: "La prossima volta che colpisci una creatura con un attacco in mischia con un'arma durante la durata dell'incantesimo, la tua arma trafigge sia il corpo che la mente, e l'attacco infligge 4d6 danni psichici aggiuntivi al bersaglio. Il bersaglio deve effettuare un tiro salvezza Saggezza. Con un fallimento, ha svantaggio ai tiri per colpire e alle prove di caratteristica, e non può eseguire reazioni, fino alla fine del suo prossimo turno.",
    higherLevels: null
  },
  "Stone Shape": {
    name: "Scolpire Pietra",
    description: "Tocchi un oggetto di pietra di taglia Media o inferiore o una sezione di pietra non più di 1,5 metri in qualsiasi dimensione e la modelli in qualsiasi forma adatta al tuo scopo. Potresti modellare una grande roccia in un'arma, un idolo o uno scrigno, oppure aprire un piccolo passaggio attraverso un muro. Puoi anche modellare una porta di pietra o il suo telaio per sigillare la porta.",
    higherLevels: null,
    materialDesc: "argilla morbida, che deve essere modellata grossolanamente nella forma desiderata dell'oggetto di pietra"
  },
  "Stoneskin": {
    name: "Pelle di Pietra",
    description: "Questo incantesimo trasforma la carne di una creatura consenziente che tocchi dura come pietra. Fino al termine dell'incantesimo, il bersaglio ha resistenza ai danni contundenti, perforanti e taglienti non magici.",
    higherLevels: null,
    materialDesc: "polvere di diamante del valore di 100 mo, consumata"
  },
  "Wall of Fire": {
    name: "Muro di Fuoco",
    description: "Crei un muro di fuoco su una superficie solida entro la gittata. Il muro può essere lungo fino a 18 metri, alto 6 metri e spesso 30 cm, oppure un muro circolare fino a 6 metri di diametro, alto 6 metri e spesso 30 cm. Quando il muro appare, ogni creatura nella sua area deve effettuare un tiro salvezza Destrezza, subendo 5d8 danni da fuoco con un fallimento, o metà con un successo. Un lato del muro (a tua scelta) infligge 5d8 danni da fuoco a ogni creatura che termina il proprio turno entro 3 metri da quel lato o all'interno del muro. L'altro lato non infligge danni.",
    higherLevels: "Il danno aumenta di 1d8 per ogni livello di slot superiore al 4°.",
    materialDesc: "un pezzetto di fosforo"
  },

  // ============================================================
  // PLAYER'S HANDBOOK 5e — LEVEL 5
  // ============================================================
  "Animate Objects": {
    name: "Animare Oggetti",
    description: "Gli oggetti prendono vita al tuo comando. Scegli fino a dieci oggetti non magici entro la gittata che non siano indossati o trasportati. I bersagli di taglia Media contano come due oggetti, quelli di taglia Grande come quattro, quelli di taglia Enorme come otto. Ogni bersaglio si anima e diventa una creatura sotto il tuo controllo fino al termine dell'incantesimo o finché non viene ridotto a 0 punti ferita. Come azione bonus, puoi comandare mentalmente qualsiasi creatura tu abbia creato con questo incantesimo entro 150 metri.",
    higherLevels: "Puoi animare due oggetti aggiuntivi per ogni livello di slot superiore al 5°."
  },
  "Antilife Shell": {
    name: "Guscio Anti-Vita",
    description: "Una barriera scintillante si estende da te in un raggio di 3 metri e si muove con te, rimanendo centrata su di te e bloccando le creature diverse da non morti e costrutti. La barriera dura per la durata. La barriera impedisce a una creatura colpita di passare o protendersi attraverso. Una creatura colpita può lanciare incantesimi o eseguire attacchi con armi a distanza o con portata attraverso la barriera. Se ti muovi in modo tale che una creatura colpita sia costretta a passare attraverso la barriera, l'incantesimo termina.",
    higherLevels: null
  },
  "Awaken": {
    name: "Risveglio",
    description: "Dopo aver speso il tempo di lancio tracciando percorsi magici all'interno di una pietra preziosa, tocchi una bestia o pianta di taglia Enorme o inferiore. Il bersaglio deve avere o nessun punteggio di Intelligenza o un'Intelligenza di 3 o inferiore. Il bersaglio acquisisce un'Intelligenza di 10 e la capacità di parlare un linguaggio che conosci. Se il bersaglio è una pianta, acquisisce la capacità di muovere arti, radici, viticci, rampicanti e così via, e ottiene sensi simili a quelli di un umano. La creatura risvegliata è ammaliata da te per 30 giorni.",
    higherLevels: null,
    materialDesc: "un'agata del valore di almeno 1.000 mo, consumata"
  },
  "Banishing Smite": {
    name: "Punizione Bandente",
    description: "La prossima volta che colpisci una creatura con un attacco con un'arma, la tua arma scintilla di forza, e l'attacco infligge 5d10 danni da forza aggiuntivi al bersaglio. Inoltre, se questo attacco riduce il bersaglio a 50 punti ferita o meno, lo bandisci. Se il bersaglio è nativo di un piano di esistenza diverso, scompare e ritorna al suo piano d'origine. Se è nativo del tuo piano, svanisce in un semipiano innocuo ed è incapacitato lì. Quando l'incantesimo termina, il bersaglio riappare nello spazio che ha lasciato.",
    higherLevels: null
  },
  "Bigby's Hand": {
    name: "Mano di Bigby",
    description: "Crei una grande mano di forza scintillante e traslucida in uno spazio non occupato entro la gittata. La mano ha CA 20 e punti ferita pari al tuo massimo di punti ferita. Ha Forza 26 (+8) e Destrezza 10 (+0). Puoi muoverla fino a 18 metri e causare uno di questi effetti come azione bonus: Pugno Chiuso (attacco in mischia con incantesimo, 4d8 danni da forza), Mano Possente (spingere una creatura, prova di Forza contestata), Mano Afferrante (afferrare una creatura, 2d6+mod danni da schiacciamento) o Mano Interposta (copertura parziale, blocca il movimento di creature con Forza inferiore).",
    higherLevels: "Il danno del Pugno Chiuso aumenta di 2d8 e il danno della Mano Afferrante di 2d6 per ogni livello di slot superiore al 5°.",
    materialDesc: "un guscio d'uovo e un guanto di pelle di serpente"
  },
  "Circle of Power": {
    name: "Cerchio di Potere",
    description: "L'energia divina si irradia da te, distorcendo e diffondendo l'energia magica entro un raggio di 9 metri. Fino al termine dell'incantesimo, la sfera si muove con te. Per la durata, ogni creatura amichevole nell'area (incluso te stesso) ha vantaggio ai tiri salvezza contro incantesimi e altri effetti magici. Inoltre, quando una creatura colpita riesce in un tiro salvezza contro un incantesimo o effetto magico che permette un tiro salvezza per subire metà danno, non subisce alcun danno.",
    higherLevels: null
  },
  "Cloudkill": {
    name: "Nube Mortale",
    description: "Crei una sfera di nebbia velenosa giallo-verde di 6 metri di raggio centrata su un punto a tua scelta entro la gittata. La nebbia si diffonde dietro gli angoli. Dura per la durata o finché un vento forte non la disperde. La sua area è fortemente oscurata. Quando una creatura entra nell'area per la prima volta in un turno o vi inizia il proprio turno, deve effettuare un tiro salvezza Costituzione, subendo 5d8 danni da veleno con un fallimento, o metà con un successo. La nebbia si muove di 3 metri lontano da te all'inizio di ciascuno dei tuoi turni.",
    higherLevels: "Il danno aumenta di 1d8 per ogni livello di slot superiore al 5°."
  },
  "Commune": {
    name: "Comunione",
    description: "Contatti la tua divinità o un proxy divino e poni fino a tre domande a cui si può rispondere con sì o no. Devi porre le tue domande prima del termine dell'incantesimo. Ricevi una risposta corretta per ogni domanda. Le entità divine non sono necessariamente onniscienti, quindi potresti ricevere 'incerto' come risposta. I lanci ripetuti prima di un riposo lungo hanno una probabilità cumulativa del 25% di non dare risposta.",
    higherLevels: null,
    materialDesc: "incenso e una fiala di acqua santa o profana"
  },
  "Commune with Nature": {
    name: "Comunione con la Natura",
    description: "Ti fondi brevemente con la natura e acquisisci conoscenza del territorio circostante. All'aperto, l'incantesimo ti dà conoscenza della terra entro 5 km. In caverne e altri ambienti sotterranei, il raggio è limitato a 90 metri. Acquisisci istantaneamente conoscenza di un massimo di tre fatti a tua scelta sull'area circostante relativi al terreno, corpi d'acqua, piante/animali/minerali/popoli prevalenti, entità potenti o edifici.",
    higherLevels: null
  },
  "Cone of Cold": {
    name: "Cono di Freddo",
    description: "Un'esplosione di aria fredda erompe dalle tue mani. Ogni creatura in un cono di 18 metri deve effettuare un tiro salvezza Costituzione, subendo 8d8 danni da freddo con un fallimento, o metà con un successo. Una creatura uccisa da questo incantesimo diventa una statua congelata finché non si scongela.",
    higherLevels: "Il danno aumenta di 1d8 per ogni livello di slot superiore al 5°.",
    materialDesc: "un piccolo cono di cristallo o vetro"
  },
  "Conjure Elemental": {
    name: "Evoca Elementale",
    description: "Richiami un servitore elementale. Scegli un'area di aria, terra, fuoco o acqua che riempia un cubo di 3 metri entro la gittata. Un elementale di grado di sfida 5 o inferiore appropriato all'area appare in uno spazio non occupato entro 3 metri da essa. È amichevole e obbedisce ai tuoi comandi verbali. Se la tua concentrazione viene interrotta, l'elementale non scompare ma diventa ostile verso di te e i tuoi compagni.",
    higherLevels: "Il grado di sfida aumenta di 1 per ogni livello di slot superiore al 5°.",
    materialDesc: "incenso che brucia per l'aria, argilla morbida per la terra, zolfo e fosforo per il fuoco, oppure acqua e sabbia per l'acqua"
  },
  "Conjure Volley": {
    name: "Evocare Raffica",
    description: "Lanci un pezzo di munizione non magica o un'arma non magica nell'aria e scegli un punto entro la gittata. Centinaia di duplicati piovono in un cilindro di 12 metri di raggio e 6 metri di altezza centrato su quel punto e poi scompaiono. Ogni creatura nel cilindro deve effettuare un tiro salvezza Destrezza, subendo 8d8 danni con un fallimento, o metà con un successo. Il tipo di danno è lo stesso della munizione o dell'arma.",
    higherLevels: null,
    materialDesc: "una munizione o un'arma da lancio"
  },
  "Contact Other Plane": {
    name: "Contattare Altri Piani",
    description: "Contatti mentalmente un semidio, lo spirito di un saggio morto da tempo, o qualche altra entità misteriosa di un altro piano. Contattare questa intelligenza extraplanare può sforzare o persino spezzare la tua mente. Quando lanci questo incantesimo, effettua un tiro salvezza Intelligenza CD 15. Con un fallimento, subisci 6d6 danni psichici e sei pazzo finché non termini un riposo lungo. Con un successo, puoi porre all'entità fino a cinque domande, ricevendo risposte brevi.",
    higherLevels: null
  },
  "Contagion": {
    name: "Contagio",
    description: "Il tocco dell'incantatore può trasmettere una malattia debilitante. Effettua un attacco con incantesimo in mischia contro una creatura entro portata; se va a segno, infetti il bersaglio con una delle malattie elencate sotto, a tua scelta.\n\nMeccanica della malattia. Al termine di ogni proprio turno, il bersaglio tenta un tiro salvezza Costituzione. Tre fallimenti rendono la malattia conclamata: i suoi effetti durano per tutta la durata dell'incantesimo e il bersaglio non tira più. Tre successi cancellano la malattia e l'incantesimo termina. Trattandosi di una malattia naturale, qualsiasi effetto che rimuove o cura le malattie funziona normalmente.\n\nMalattie:\n\n• Carne Putrefatta — la pelle e i muscoli del bersaglio si disgregano: svantaggio alle prove di Carisma e vulnerabilità a ogni tipo di danno.\n\n• Devastazione Vischiosa — un'emorragia continua spossa il bersaglio: svantaggio alle prove di Costituzione e ai TS Costituzione; inoltre, ogni volta che subisce danni resta stordito fino al termine del proprio turno successivo.\n\n• Febbre Lurida — il corpo brucia di febbre: svantaggio alle prove di Forza, ai TS Forza e ai tiri per colpire basati sulla Forza.\n\n• Fuoco Mentale — la mente entra in delirio: svantaggio alle prove di Intelligenza e ai TS Intelligenza; in combattimento il bersaglio agisce come se fosse sotto l'incantesimo confusione.\n\n• Infermità Accecante — gli occhi si fanno lattiginosi e una fitta dolorosa annebbia la mente: svantaggio alle prove di Saggezza, ai TS Saggezza, e il bersaglio è accecato.\n\n• Tremarella — convulsioni e brividi attraversano il corpo: svantaggio alle prove di Destrezza, ai TS Destrezza e ai tiri per colpire basati sulla Destrezza.",
    higherLevels: null
  },
  "Creation": {
    name: "Creazione",
    description: "Estrai filamenti di materia ombra dal Reame delle Ombre per creare un oggetto non vivente di materia vegetale entro la gittata: tessuti, corda, legno o simili. Puoi anche usare questo incantesimo per creare oggetti minerali come pietra, cristallo o metallo. L'oggetto non deve essere più grande di un cubo di 1,5 metri di lato. La durata dipende dal materiale: materia vegetale 1 giorno, pietra/cristallo 12 ore, metalli preziosi 1 ora, gemme 10 minuti, adamantio/mithral 1 minuto.",
    higherLevels: "Il cubo aumenta di 1,5 metri per ogni livello di slot superiore al 5°.",
    materialDesc: "una scheggia di materia dello stesso tipo dell'oggetto che intendi creare"
  },
  "Destructive Wave": {
    name: "Onda Distruttiva",
    description: "Colpisci il terreno, creando una scarica di energia divina che si propaga verso l'esterno da te. Ogni creatura a tua scelta entro 9 metri da te deve riuscire in un tiro salvezza Costituzione o subire 5d6 danni da tuono, oltre a 5d6 danni radiosi o necrotici (a tua scelta), ed essere abbattuta prona. Con un successo, una creatura subisce metà danno e non viene abbattuta prona.",
    higherLevels: null
  },
  "Dispel Evil and Good": {
    name: "Dissolvi il Bene e il Male",
    description: "Energia scintillante ti circonda e ti protegge da folletti, non morti e creature originarie di oltre il Piano Materiale. Celestiali, elementali, folletti, immondi e non morti hanno svantaggio ai tiri per colpire contro di te. Puoi terminare l'incantesimo in anticipo usando una di due funzioni speciali: Spezzare Incantesimo (toccare per terminare le condizioni di ammaliato/spaventato/posseduto causate da quei tipi di creature) o Congedo (attacco in mischia con incantesimo per cercare di rispedire la creatura al suo piano d'origine, tiro salvezza Carisma per evitare).",
    higherLevels: null,
    materialDesc: "acqua santa o argento e ferro in polvere"
  },
  "Dominate Person": {
    name: "Dominare Persone",
    description: "Tenti di affascinare un umanoide entro la gittata. Deve riuscire in un tiro salvezza Saggezza o essere ammaliato da te per la durata. Hai un legame telepatico con esso e puoi impartire comandi (nessuna azione richiesta). Puoi usare la tua azione per assumere il controllo totale e preciso fino alla fine del tuo prossimo turno. Ogni volta che il bersaglio subisce danno, effettua un nuovo tiro salvezza Saggezza.",
    higherLevels: "Al 6° livello, concentrazione fino a 10 minuti. Al 7°, fino a 1 ora. All'8° o superiore, fino a 8 ore."
  },
  "Dream": {
    name: "Sogno",
    description: "Questo incantesimo plasma i sogni di una creatura. Tu o una creatura consenziente che tocchi entrate in uno stato di trance, agendo come messaggero. Il messaggero appare nei sogni di una creatura addormentata che conosci sullo stesso piano e può conversare con il sognatore. Il messaggero può anche trasformare il sogno in un incubo, costringendo a un tiro salvezza Saggezza. Con un fallimento, il bersaglio non ottiene alcun beneficio dal suo riposo e subisce 3d6 danni psichici al risveglio.",
    higherLevels: null,
    materialDesc: "una manciata di sabbia, una macchia d'inchiostro e una penna d'oca strappata da un uccello addormentato"
  },
  "Flame Strike": {
    name: "Colpo Infuocato",
    description: "Una colonna verticale di fuoco divino discende dai cieli in una posizione che specifichi. Ogni creatura in un cilindro di 3 metri di raggio e 12 metri di altezza centrato su un punto entro la gittata deve effettuare un tiro salvezza Destrezza, subendo 4d6 danni da fuoco e 4d6 danni radiosi con un fallimento, o metà con un successo.",
    higherLevels: "Il danno da fuoco o quello radioso (a tua scelta) aumenta di 1d6 per ogni livello di slot superiore al 5°.",
    materialDesc: "un pizzico di zolfo"
  },
  "Geas": {
    name: "Costrizione",
    description: "L'incantatore impone un ordine magico a una creatura entro gittata che riesce a vedere, vincolandola a svolgere un determinato servizio oppure ad astenersi da un'azione o da una linea di condotta da lui stabilita. La creatura subisce l'effetto solo se comprende il linguaggio dell'incantatore: in tal caso deve effettuare un TS Saggezza, e in caso di fallimento è ammaliata per la durata.\n\nMentre è ammaliata, ogni volta che agisce in modo manifestamente contrario all'istruzione ricevuta subisce 5d10 danni psichici, ma non più di una volta al giorno. Un comando che condurrebbe alla morte certa non viene eseguito e l'incantesimo termina.\n\nL'incantatore può terminare l'incantesimo prematuramente come azione. Anche desiderio, rimuovi maledizione o ristorare superiore lanciati sul bersaglio sono in grado di porvi fine.",
    higherLevels: "Lanciato con uno slot incantesimo di 7° o 8° livello, la durata sale a 1 anno. Lanciato con uno slot di 9° livello, l'effetto persiste finché uno degli incantesimi sopra elencati non lo dissolve.",
    higherLevels: "Al 7° o 8° livello, la durata è 1 anno. Al 9° livello, finché non viene dissolta."
  },
  "Greater Restoration": {
    name: "Ristorare Superiore",
    description: "Imbevi una creatura che tocchi di energia positiva per annullare un effetto debilitante. Puoi ridurre il livello di sfinimento del bersaglio di uno, oppure terminare uno dei seguenti effetti sul bersaglio: un effetto che ha ammaliato o pietrificato il bersaglio, una maledizione (incluso la sintonia con un oggetto magico maledetto), qualsiasi riduzione a uno dei punteggi di caratteristica del bersaglio, o un effetto che riduce il massimo di punti ferita del bersaglio.",
    higherLevels: null,
    materialDesc: "polvere di diamante del valore di almeno 100 mo, consumata"
  },
  "Hallow": {
    name: "Santificare",
    description: "Tocchi un punto e infondi un'area attorno ad esso con potere sacro (o profano), fino a un raggio di 18 metri. Celestiali, elementali, folletti, immondi e non morti non possono entrare nell'area e non possono ammaliare, spaventare o possedere creature al suo interno. Puoi vincolare un effetto extra all'area: Coraggio, Oscurità, Luce del Giorno, Protezione dall'Energia, Vulnerabilità all'Energia, Riposo Eterno, Interferenza Extradimensionale, Paura, Silenzio o Linguaggi.",
    higherLevels: null,
    materialDesc: "erbe, oli e incenso del valore di almeno 1.000 mo, consumati"
  },
  "Hold Monster": {
    name: "Blocca Mostri",
    description: "Scegli una creatura che puoi vedere entro la gittata. Il bersaglio deve riuscire in un tiro salvezza Saggezza o essere paralizzato per la durata. Questo incantesimo non ha effetto sui non morti. Alla fine di ciascuno dei suoi turni, il bersaglio può effettuare un altro tiro salvezza Saggezza. Con un successo, l'incantesimo termina sul bersaglio.",
    higherLevels: "Puoi bersagliare una creatura aggiuntiva per ogni livello di slot superiore al 5°. Le creature devono trovarsi entro 9 metri l'una dall'altra.",
    materialDesc: "un piccolo pezzo dritto di ferro"
  },
  "Insect Plague": {
    name: "Piaga degli Insetti",
    description: "Locuste mordaci e brulicanti riempiono una sfera di 6 metri di raggio centrata su un punto a tua scelta entro la gittata. La sfera si diffonde dietro gli angoli. La sfera rimane per la durata, e la sua area è leggermente oscurata e terreno difficile. Quando l'area appare, ogni creatura al suo interno deve effettuare un tiro salvezza Costituzione, subendo 4d10 danni perforanti con un fallimento, o metà con un successo. Una creatura deve effettuare anche questo tiro salvezza quando entra nell'area per la prima volta in un turno o vi termina il proprio turno.",
    higherLevels: "Il danno aumenta di 1d10 per ogni livello di slot superiore al 5°.",
    materialDesc: "alcuni granelli di zucchero, alcuni chicchi di grano e una macchia di grasso"
  },
  "Legend Lore": {
    name: "Conoscenza delle Leggende",
    description: "Nomina o descrivi una persona, un luogo o un oggetto. L'incantesimo ti porta alla mente un breve riassunto della tradizione significativa riguardo alla cosa che hai nominato. La tradizione potrebbe consistere in racconti attuali, storie dimenticate o persino conoscenze segrete mai ampiamente note. Più informazioni hai già, più precise e dettagliate sono le informazioni che ricevi.",
    higherLevels: null,
    materialDesc: "incenso del valore di almeno 250 mo consumato, e quattro strisce d'avorio del valore di almeno 50 mo ciascuna"
  },
  "Mass Cure Wounds": {
    name: "Cura Ferite di Massa",
    description: "Un'ondata di energia curativa erompe da un punto a tua scelta entro la gittata. Scegli fino a sei creature in una sfera di 9 metri di raggio centrata su quel punto. Ogni bersaglio recupera punti ferita pari a 3d8 + il tuo modificatore di caratteristica da incantatore. Questo incantesimo non ha effetto sui non morti o sui costrutti.",
    higherLevels: "La cura aumenta di 1d8 per ogni livello di slot superiore al 5°."
  },
  "Mislead": {
    name: "Fuorviare",
    description: "Diventi invisibile nello stesso momento in cui un duplicato illusorio di te appare dove ti trovavi. Il duplicato dura per la durata, ma l'invisibilità termina se attacchi o lanci un incantesimo. Puoi usare la tua azione per muovere il tuo duplicato illusorio fino al doppio della tua velocità e farlo gesticolare, parlare e comportarsi nel modo che scegli. Puoi vedere attraverso i suoi occhi e sentire attraverso le sue orecchie come se fossi situato dove si trova.",
    higherLevels: null
  },
  "Modify Memory": {
    name: "Modificare Memoria",
    description: "Tenti di rimodellare i ricordi di un'altra creatura. Il bersaglio deve effettuare un tiro salvezza Saggezza. Con un fallimento, il bersaglio diventa ammaliato e incapacitato. Mentre è ammaliato, puoi alterare il ricordo del bersaglio di un evento avvenuto nelle ultime 24 ore e che è durato non più di 10 minuti. Puoi eliminare permanentemente tutti i ricordi dell'evento, consentire un richiamo perfetto, cambiare i dettagli o creare un ricordo di un evento totalmente diverso.",
    higherLevels: "Al 6° livello, ricordi fino a 7 giorni fa. Al 7°, 30 giorni. All'8°, 1 anno. Al 9°, qualsiasi momento del passato della creatura."
  },
  "Passwall": {
    name: "Passapareti",
    description: "Un passaggio appare in un punto a tua scelta che puoi vedere su una superficie di legno, intonaco o pietra (come un muro, un soffitto o un pavimento) entro la gittata, e dura per la durata. Tu scegli le dimensioni del varco: fino a 1,5 metri di larghezza, 2,4 metri di altezza e 6 metri di profondità. Il passaggio non crea instabilità nella struttura. Quando il varco scompare, qualsiasi creatura o oggetto ancora nel passaggio viene espulso in sicurezza nello spazio non occupato più vicino al punto in cui hai lanciato l'incantesimo.",
    higherLevels: null,
    materialDesc: "un pizzico di semi di sesamo"
  },
  "Planar Binding": {
    name: "Legame Planare",
    description: "Tenti di vincolare un celestiale, un elementale, un folletto o un immondo al tuo servizio. La creatura deve trovarsi entro la gittata per l'intera durata del lancio. Alla fine del lancio, il bersaglio deve effettuare un tiro salvezza Carisma. Con un fallimento, è vincolato a servirti per la durata. Una creatura vincolata deve seguire le tue istruzioni al meglio delle sue capacità.",
    higherLevels: "La durata aumenta a 10 giorni al 6° livello, 30 giorni al 7°, 180 giorni all'8°, e un anno e un giorno al 9° livello.",
    materialDesc: "un gioiello del valore di almeno 1.000 mo, consumato"
  },
  "Raise Dead": {
    name: "Rianimare Morti",
    description: "Riporti in vita una creatura morta che tocchi, purché sia morta da non più di 10 giorni. Se l'anima della creatura è sia volontaria che libera di ricongiungersi al corpo, la creatura ritorna in vita con 1 punto ferita. Questo incantesimo neutralizza qualsiasi veleno e cura le malattie non magiche. Non rimuove malattie magiche, maledizioni o effetti simili. Questo incantesimo chiude tutte le ferite mortali ma non ripristina le parti del corpo mancanti. La creatura subisce una penalità di -4 a tutti i tiri di d20, ridotta di 1 dopo ogni riposo lungo.",
    higherLevels: null,
    materialDesc: "un diamante del valore di almeno 500 mo, consumato"
  },
  "Rary's Telepathic Bond": {
    name: "Legame Telepatico",
    description: "Forgi un legame telepatico tra un massimo di otto creature consenzienti a tua scelta entro la gittata, collegando psichicamente ogni creatura a tutte le altre per la durata. Le creature con punteggi di Intelligenza pari o inferiori a 2 non vengono influenzate. Fino al termine dell'incantesimo, i bersagli possono comunicare telepaticamente attraverso il legame indipendentemente dalla lingua. La comunicazione è possibile a qualsiasi distanza, anche se non può estendersi ad altri piani di esistenza.",
    higherLevels: null,
    materialDesc: "pezzi di guscio d'uovo provenienti da due creature di tipi diversi"
  },
  "Reincarnate": {
    name: "Reincarnazione",
    description: "Tocchi un umanoide morto o un pezzo di un umanoide morto. Purché la creatura sia morta da non più di 10 giorni, l'incantesimo forma per essa un nuovo corpo adulto e poi richiama l'anima a entrare in quel corpo. Il DM tira su una tabella o sceglie una forma per determinare la nuova razza della creatura. La creatura reincarnata ricorda la sua vita precedente e le sue esperienze.",
    higherLevels: null,
    materialDesc: "oli e unguenti rari del valore di almeno 1.000 mo, consumati"
  },
  "Scrying": {
    name: "Scrutare",
    description: "Puoi vedere e sentire una particolare creatura a tua scelta che si trova sullo stesso piano di esistenza in cui sei tu. Il bersaglio deve effettuare un tiro salvezza Saggezza, modificato in base a quanto bene conosci il bersaglio e a qualsiasi connessione fisica che hai con esso. Con un fallimento, l'incantesimo crea un sensore invisibile entro 3 metri dal bersaglio. Puoi vedere e sentire attraverso il sensore come se fossi lì.",
    higherLevels: null,
    materialDesc: "un focus del valore di almeno 1.000 mo, come una sfera di cristallo, uno specchio d'argento o un fonte riempito di acqua santa"
  },
  "Seeming": {
    name: "Sembrare",
    description: "Questo incantesimo ti permette di cambiare l'aspetto di un numero qualsiasi di creature che puoi vedere entro la gittata. Conferisci a ciascun bersaglio a tua scelta un nuovo aspetto illusorio. Un bersaglio non consenziente può effettuare un tiro salvezza Carisma e, se ha successo, non viene influenzato. L'incantesimo camuffa l'aspetto fisico oltre a vestiti, armatura, armi ed equipaggiamento.",
    higherLevels: null
  },
  "Swift Quiver": {
    name: "Faretra Rapida",
    description: "Trasmuti la tua faretra in modo che produca una scorta infinita di munizioni non magiche. In ciascuno dei tuoi turni fino al termine dell'incantesimo, puoi usare un'azione bonus per eseguire due attacchi con un'arma che usa munizioni dalla faretra. Ogni volta che esegui un attacco a distanza, la faretra sostituisce magicamente il pezzo di munizione che hai usato.",
    higherLevels: null,
    materialDesc: "una faretra contenente almeno una munizione"
  },
  "Telekinesis": {
    name: "Telecinesi",
    description: "Acquisisci la capacità di muovere o manipolare creature o oggetti col pensiero. Quando lanci l'incantesimo, e come azione in ogni round per la durata, puoi esercitare la tua volontà su una creatura o un oggetto entro la gittata. Creatura: effettua una prova contestata (la tua caratteristica da incantatore vs. la sua Forza), spostandola fino a 9 metri con un successo e afferrandola. Oggetto: muovi automaticamente un oggetto fino a 450 kg fino a 9 metri in qualsiasi direzione, oppure esercita un controllo fine (manipola uno strumento semplice, apri una porta, ecc.).",
    higherLevels: null
  },
  "Teleportation Circle": {
    name: "Cerchio di Teletrasporto",
    description: "Mentre lanci l'incantesimo, disegni sul terreno un cerchio di 3 metri di diametro inscritto con sigilli che collegano la tua posizione a un cerchio di teletrasporto permanente a tua scelta di cui conosci la sequenza di sigilli e che si trova sullo stesso piano di esistenza. Un portale scintillante si apre nel cerchio che hai disegnato e rimane aperto fino alla fine del tuo prossimo turno. Qualsiasi creatura che entra nel portale appare istantaneamente entro 1,5 metri dal cerchio di destinazione. Lanciare questo incantesimo nello stesso luogo ogni giorno per un anno crea un cerchio di teletrasporto permanente.",
    higherLevels: null,
    materialDesc: "gessi e inchiostri rari intrisi di gemme preziose del valore di 50 mo, consumati"
  },
  "Tree Stride": {
    name: "Traslazione Arborea",
    description: "Acquisisci la capacità di entrare in un albero e muoverti dal suo interno verso l'interno di un altro albero dello stesso tipo entro 150 metri. Entrambi gli alberi devono essere vivi e almeno della tua taglia. Devi usare 1,5 metri di movimento per entrare in un albero. Conosci istantaneamente la posizione di tutti gli altri alberi dello stesso tipo entro 150 metri e puoi entrare in uno di quegli alberi o uscire dall'albero in cui ti trovi. Puoi usare questa capacità di trasporto una volta per round.",
    higherLevels: null
  },
  "Wall of Force": {
    name: "Muro di Forza",
    description: "Un muro invisibile di forza appare in un punto a tua scelta entro la gittata. Il muro appare in qualsiasi orientamento tu scelga: orizzontale, verticale o diagonale. Puoi formarlo in una cupola emisferica o una sfera con un raggio fino a 3 metri, oppure in una superficie piatta composta da dieci pannelli di 3 metri per 3 metri. Nulla può attraversare fisicamente il muro. È immune a tutti i danni e non può essere dissolto da Dissolvi Magie. Un incantesimo Disintegrazione distrugge il muro istantaneamente. Il muro si estende anche nel Piano Etereo, bloccando il viaggio etereo.",
    higherLevels: null,
    materialDesc: "un pizzico di polvere ottenuta frantumando una gemma trasparente"
  },
  "Wall of Stone": {
    name: "Muro di Pietra",
    description: "Un muro non magico di pietra solida appare in un punto a tua scelta entro la gittata. Il muro è spesso 15 cm ed è composto da dieci pannelli di 3 metri per 3 metri. Ogni pannello deve essere contiguo ad almeno un altro pannello. Se mantieni la concentrazione su questo incantesimo per tutta la sua durata, il muro diventa permanente e non può essere dissolto.",
    higherLevels: null,
    materialDesc: "un piccolo blocco di granito"
  },

  // ============================================================
  // PLAYER'S HANDBOOK 5e — LEVEL 6
  // ============================================================
  "Blade Barrier": {
    name: "Barriera di Lame",
    description: "Crei un muro verticale di lame vorticose e affilatissime fatte di energia magica. Il muro appare entro la gittata e dura per la durata. Puoi creare un muro dritto lungo fino a 30 metri, alto 6 metri e spesso 1,5 metri, oppure un muro circolare fino a 18 metri di diametro, alto 6 metri e spesso 1,5 metri. Il muro è opaco e fornisce tre quarti di copertura. Quando una creatura entra nell'area del muro per la prima volta in un turno o vi inizia il proprio turno, deve effettuare un tiro salvezza Destrezza, subendo 6d10 danni taglienti con un fallimento, o metà con un successo.",
    higherLevels: null
  },
  "Chain Lightning": {
    name: "Catena di Fulmini",
    description: "Crei una scarica di fulmine che si dirige verso un bersaglio a tua scelta entro la gittata. Tre scariche poi balzano da quel bersaglio fino a tre altri bersagli, ognuno dei quali deve trovarsi entro 9 metri dal primo bersaglio. Un bersaglio può essere una creatura o un oggetto e può essere bersagliato da una sola delle scariche. Un bersaglio deve effettuare un tiro salvezza Destrezza, subendo 10d8 danni da fulmine con un fallimento, o metà con un successo.",
    higherLevels: "Una scarica aggiuntiva balza dal primo bersaglio a un altro bersaglio per ogni livello di slot superiore al 6°.",
    materialDesc: "un pochino di pelliccia; un pezzo di ambra, vetro o una verga di cristallo; e tre spilli d'argento"
  },
  "Circle of Death": {
    name: "Cerchio di Morte",
    description: "Una sfera di energia negativa si propaga in una sfera di 18 metri di raggio da un punto entro la gittata. Ogni creatura in quell'area deve effettuare un tiro salvezza Costituzione, subendo 8d6 danni necrotici con un fallimento, o metà con un successo.",
    higherLevels: "Il danno aumenta di 2d6 per ogni livello di slot superiore al 6°.",
    materialDesc: "la polvere di una perla nera frantumata del valore di almeno 500 mo"
  },
  "Conjure Fey": {
    name: "Evoca Folletto",
    description: "Evochi una creatura folletto di grado di sfida 6 o inferiore, o uno spirito folletto che assume la forma di una bestia di grado di sfida 6 o inferiore. Appare in uno spazio non occupato che puoi vedere entro la gittata. La creatura è amichevole e obbedisce ai tuoi comandi verbali. Se la tua concentrazione viene interrotta, la creatura non scompare ma diventa ostile verso di te e i tuoi compagni.",
    higherLevels: "Il grado di sfida aumenta di 1 per ogni livello di slot superiore al 6°."
  },
  "Contingency": {
    name: "Contingenza",
    description: "Scegli un incantesimo di 5° livello o inferiore che puoi lanciare, che ha tempo di lancio di 1 azione e che può bersagliare te. Lanci quell'incantesimo (chiamato incantesimo contingente) come parte del lancio di Contingenza, spendendo gli slot incantesimo per entrambi. L'incantesimo contingente non entra in effetto immediatamente. Invece, ha effetto quando si verifica una certa circostanza. Descrivi quella circostanza quando lanci i due incantesimi.",
    higherLevels: null,
    materialDesc: "una statuetta di te stesso scolpita in avorio e decorata con gemme del valore di almeno 1.500 mo"
  },
  "Create Undead": {
    name: "Creare Non Morti",
    description: "Questo incantesimo può essere lanciato solo di notte. Scegli fino a tre cadaveri di umanoidi di taglia Media o Piccola entro gittata: ogni cadavere si rianima come ghoul sotto il tuo controllo (le statistiche di gioco sono in possesso del DM).\n\nNei tuoi turni, come azione bonus, puoi comandare mentalmente qualsiasi creatura animata da questo incantesimo che si trovi entro 36 metri da te. Se ne controlli più di una, ogni comando si applica simultaneamente a tutte in modo identico (puoi anche non impartirne nessuno). Stabilisci quale azione la creatura compie e dove si muove al suo turno successivo, oppure le dai una direttiva generale (per esempio sorvegliare una stanza o un corridoio). In assenza di ordini, la creatura si limita a difendersi dalle minacce ostili. Una direttiva ricevuta resta valida finché non viene completata.\n\nIl controllo dura 24 ore: trascorso questo tempo, la creatura non risponde più ai comandi. Per estendere il controllo, l'incantesimo deve essere rilanciato sulla stessa creatura prima della scadenza. In quest'uso l'incantesimo non anima nuovi cadaveri ma ristabilisce il controllo su un massimo di tre creature da te già animate.",
    higherLevels: "Slot di 7° livello: animi (o ristabilisci il controllo su) 4 ghoul. Slot di 8° livello: 5 ghoul, oppure 2 ghast o wight. Slot di 9° livello: 6 ghoul, oppure 3 ghast o wight, oppure 2 mummie.",
    higherLevels: "Al 7° livello, puoi creare o riasserire il controllo su quattro ghoul, oppure creare un ghast o wight. All'8°, cinque ghoul, due ghast o wight. Al 9°, sei ghoul, tre ghast o wight, oppure due mummie.",
    materialDesc: "un vaso di argilla riempito di terra di tomba, un vaso di argilla riempito di acqua salmastra e una pietra di onice nera da 150 mo per ogni cadavere"
  },
  "Disintegrate": {
    name: "Disintegrazione",
    description: "Un sottile raggio verde scaturisce dal tuo dito puntato verso un bersaglio entro la gittata. Il bersaglio può essere una creatura, un oggetto o una creazione di forza magica. Una creatura bersagliata da questo incantesimo deve effettuare un tiro salvezza Destrezza, subendo 10d6+40 danni da forza con un fallimento, o nulla con un successo. Se questo danno riduce il bersaglio a 0 punti ferita, viene disintegrato, lasciando solo un cumulo di polvere grigia. Una creatura disintegrata può essere riportata in vita solo per mezzo di un incantesimo Resurrezione Pura o Desiderio.",
    higherLevels: "Il danno aumenta di 3d6 per ogni livello di slot superiore al 6°.",
    materialDesc: "un magnete (lodestone) e un pizzico di polvere"
  },
  "Drawmij's Instant Summons": {
    name: "Evocazioni Istantanee di Drawmij",
    description: "Tocchi un oggetto del peso di 4,5 kg o meno la cui dimensione più lunga è di 1,8 metri o meno. L'incantesimo lascia un marchio invisibile sulla sua superficie e iscrive invisibilmente il nome dell'oggetto sullo zaffiro che usi come componente materiale. Ogni volta che lanci questo incantesimo, devi usare uno zaffiro diverso. In qualsiasi momento successivo, puoi usare la tua azione per pronunciare il nome dell'oggetto e schiacciare lo zaffiro. L'oggetto appare istantaneamente nella tua mano.",
    higherLevels: null,
    materialDesc: "uno zaffiro del valore di 1.000 mo"
  },
  "Eyebite": {
    name: "Sguardo Penetrante",
    description: "Per la durata dell'incantesimo, i tuoi occhi diventano un vuoto inchiostro imbevuto di un potere terribile. Una creatura a tua scelta entro 18 metri deve riuscire in un tiro salvezza Saggezza o essere influenzata da uno dei seguenti effetti a tua scelta: Addormentato (cade incosciente), Panicato (spaventato, deve scattare via), o Nauseato (svantaggio ai tiri per colpire e alle prove di caratteristica). In ogni turno successivo, puoi usare la tua azione per bersagliare un'altra creatura (ma non puoi bersagliarne una già colpita).",
    higherLevels: null
  },
  "Find the Path": {
    name: "Scopri il Percorso",
    description: "Questo incantesimo ti permette di trovare la rotta fisica più breve e diretta verso una specifica posizione fissa con cui hai familiarità sullo stesso piano di esistenza. L'incantesimo fallisce se scegli una destinazione su un altro piano, una destinazione in movimento o una destinazione non specifica. Per la durata, finché ti trovi sullo stesso piano della destinazione, sai quanto è distante e in quale direzione si trova.",
    higherLevels: null,
    materialDesc: "un set di strumenti divinatori come ossa, bastoncini d'avorio, carte, denti o rune intagliate del valore di 100 mo e un oggetto proveniente dal luogo che vuoi trovare"
  },
  "Flesh to Stone": {
    name: "Carne in Pietra",
    description: "Tenti di trasformare una creatura che puoi vedere entro la gittata in pietra. Se il corpo del bersaglio è fatto di carne, la creatura deve effettuare un tiro salvezza Costituzione. Con un fallimento, viene afferrata mentre la sua carne inizia a indurirsi. Con un successo, la creatura non viene influenzata. Una creatura afferrata da questo incantesimo deve effettuare un altro tiro salvezza Costituzione alla fine di ciascuno dei suoi turni. Se ha successo nei tiri salvezza tre volte, l'incantesimo termina. Se fallisce tre volte, viene trasformata in pietra permanentemente e soggetta alla condizione pietrificato.",
    higherLevels: null,
    materialDesc: "un pizzico di calce, acqua e terra"
  },
  "Forbiddance": {
    name: "Proibizione",
    description: "Crei una protezione contro il viaggio magico che protegge fino a 3.700 metri quadri di superficie del pavimento fino a un'altezza di 9 metri. Le creature non possono teletrasportarsi nell'area o usare portali per entrare. L'incantesimo danneggia tipi di creature che scegli al lancio. Scegli uno o più tra: celestiali, elementali, folletti, immondi e non morti. Quando una creatura scelta entra o inizia il proprio turno nell'area, subisce 5d10 danni radiosi o necrotici (a tua scelta). Lanciando questo incantesimo nello stesso luogo ogni giorno per 30 giorni, l'effetto diventa permanente.",
    higherLevels: null,
    materialDesc: "una spruzzata di acqua santa, incenso raro e rubino in polvere del valore di almeno 1.000 mo"
  },
  "Globe of Invulnerability": {
    name: "Globo di Invulnerabilità",
    description: "Una barriera immobile, debolmente scintillante, appare in un raggio di 3 metri attorno a te e rimane per la durata. Qualsiasi incantesimo di 5° livello o inferiore lanciato dall'esterno della barriera non può colpire creature o oggetti al suo interno, anche se l'incantesimo è lanciato usando uno slot di livello superiore. Tale incantesimo può bersagliare creature e oggetti all'interno della barriera, ma l'incantesimo non ha effetto su di essi. Allo stesso modo, l'area all'interno della barriera è esclusa dalle aree influenzate da tali incantesimi.",
    higherLevels: "La barriera blocca incantesimi di un livello superiore per ogni livello di slot superiore al 6°.",
    materialDesc: "una perlina di vetro o cristallo che si frantuma quando l'incantesimo termina"
  },
  "Guards and Wards": {
    name: "Vigilanza e Interdizione",
    description: "Crei una protezione che protegge fino a 230 metri quadrati di superficie del pavimento. L'area protetta può essere alta fino a 6 metri e modellata come desideri. Puoi posizionare i seguenti effetti: corridoi pieni di nebbia (fortemente oscurati), porte chiuse a chiave (chiusura arcana), scale piene di ragnatele, un effetto di luci danzanti in quattro corridoi, una bocca magica in due posizioni, una nube maleodorante in due posizioni (posizionate da te) e una suggestione in una posizione. Lanciare questo incantesimo ogni giorno per un anno lo rende permanente.",
    higherLevels: null,
    materialDesc: "incenso che brucia, una piccola misura di zolfo e olio, uno spago annodato, una piccola quantità di sangue di umber hulk e una piccola verga d'argento del valore di almeno 10 mo"
  },
  "Harm": {
    name: "Ferire",
    description: "Scateni una malattia virulenta su una creatura entro la gittata. Il bersaglio deve effettuare un tiro salvezza Costituzione, subendo 14d6 danni necrotici con un fallimento, o metà con un successo. Il danno non può ridurre i punti ferita del bersaglio sotto 1. Se il bersaglio fallisce il tiro salvezza, il suo massimo di punti ferita è ridotto per 1 ora di una quantità pari al danno necrotico ricevuto. Qualsiasi effetto che rimuove una malattia permette al massimo di punti ferita del bersaglio di tornare normale.",
    higherLevels: null
  },
  "Heal": {
    name: "Guarigione",
    description: "Scegli una creatura entro la gittata. Un'ondata di energia positiva attraversa la creatura, facendole recuperare 70 punti ferita. Questo incantesimo termina anche cecità, sordità e qualsiasi malattia che colpisca il bersaglio. Questo incantesimo non ha effetto sui non morti o sui costrutti.",
    higherLevels: "La quantità di cura aumenta di 10 per ogni livello di slot superiore al 6°."
  },
  "Heroes' Feast": {
    name: "Banchetto degli Eroi",
    description: "Fai apparire un grande banchetto, comprensivo di magnifici cibi e bevande. Il banchetto richiede 1 ora per essere consumato e scompare al termine di quel tempo. Fino a dodici creature possono parteciparvi. Una creatura che vi partecipa ottiene diversi benefici: cura da tutte le malattie e veleni, diventa immune al veleno e all'essere spaventata, e effettua tutti i tiri salvezza Saggezza con vantaggio. Il suo massimo di punti ferita aumenta anche di 2d10, e ottiene lo stesso numero di punti ferita. Questi benefici durano 24 ore.",
    higherLevels: null,
    materialDesc: "una ciotola incastonata di gemme del valore di almeno 1.000 mo, consumata"
  },
  "Magic Jar": {
    name: "Giara Magica",
    description: "Il tuo corpo cade in uno stato catatonico mentre la tua anima lo lascia ed entra nel contenitore. Mentre la tua anima abita il contenitore, sei consapevole dell'ambiente circostante come se fossi nello spazio del contenitore. Non puoi muoverti o usare reazioni. Puoi cercare di possedere qualsiasi umanoide entro 30 metri. Deve effettuare un tiro salvezza Carisma. Con un fallimento, la tua anima si trasferisce nel corpo del bersaglio, e l'anima del bersaglio resta intrappolata nel contenitore. Controlli il corpo ma non hai accesso ai suoi ricordi. Se il corpo ospite muore, ritorni al contenitore.",
    higherLevels: null,
    materialDesc: "una gemma, un cristallo, un reliquiario o qualche altro contenitore ornamentale del valore di almeno 500 mo"
  },
  "Mass Suggestion": {
    name: "Suggestione di Massa",
    description: "Suggerisci una linea di attività (limitata a una frase o due) e influenzi magicamente fino a dodici creature a tua scelta entro la gittata che possono sentirti e capirti. La suggestione deve essere formulata in modo da sembrare ragionevole. Ogni bersaglio deve effettuare un tiro salvezza Saggezza. Con un fallimento, persegue la linea d'azione che hai descritto al meglio delle sue capacità.",
    higherLevels: "Al 7° livello, la durata è 10 giorni. All'8°, 30 giorni. Al 9°, un anno e un giorno.",
    materialDesc: "una lingua di serpente e un pezzetto di favo o una goccia di olio dolce"
  },
  "Move Earth": {
    name: "Muovere il Terreno",
    description: "Scegli un'area di terreno non più grande di 12 metri di lato entro la gittata. Puoi rimodellare terra, sabbia o argilla nell'area in qualsiasi modo tu scelga per la durata. Puoi sollevare o abbassare l'elevazione dell'area, creare o riempire un fossato, erigere o appiattire un muro, o formare un pilastro. L'entità di tali cambiamenti non può eccedere metà della dimensione maggiore dell'area. Questi cambiamenti non causano il crollo delle strutture.",
    higherLevels: null,
    materialDesc: "una lama di ferro e un piccolo sacchetto contenente una miscela di terreni: argilla, terriccio e sabbia"
  },
  "Otiluke's Freezing Sphere": {
    name: "Sfera Congelante",
    description: "Un globo gelido di energia fredda parte dalle tue dita verso un punto a tua scelta entro la gittata, dove esplode in una sfera di 18 metri di raggio. Ogni creatura nell'area deve effettuare un tiro salvezza Costituzione, subendo 10d6 danni da freddo con un fallimento, o metà con un successo. Se il globo colpisce uno specchio d'acqua o un liquido principalmente acquoso, congela il liquido a una profondità di 15 centimetri su un'area di 9 metri quadrati.",
    higherLevels: "Il danno aumenta di 1d6 per ogni livello di slot superiore al 6°.",
    materialDesc: "una piccola sfera di cristallo"
  },
  "Otto's Irresistible Dance": {
    name: "Danza Irresistibile di Otto",
    description: "Scegli una creatura entro la gittata. Il bersaglio inizia una comica danza sul posto: trascinando i piedi, picchiettando e saltellando. Le creature che non possono essere ammaliate sono immuni. Una creatura danzante deve usare tutto il suo movimento per danzare senza lasciare il proprio spazio e ha svantaggio ai tiri salvezza Destrezza e ai tiri per colpire. Le altre creature hanno vantaggio ai tiri per colpire contro di essa. Come azione, la creatura danzante effettua un tiro salvezza Saggezza per terminare l'effetto.",
    higherLevels: null
  },
  "Planar Ally": {
    name: "Alleato Planare",
    description: "Implori un'entità ultraterrena per ricevere aiuto. L'essere invia un celestiale, un elementale o un immondo leale a esso per aiutarti, facendo apparire la creatura in uno spazio non occupato entro la gittata. Se conosci il nome specifico di una creatura, puoi pronunciare quel nome quando lanci questo incantesimo per richiedere quella creatura. Altrimenti, ottieni una creatura scelta dal DM. La creatura non è soggetta ad alcuna costrizione di comportarsi in alcun modo particolare. Puoi chiedere alla creatura di eseguire un servizio in cambio di un pagamento.",
    higherLevels: null
  },
  "Programmed Illusion": {
    name: "Illusione Programmata",
    description: "Crei un'illusione di un oggetto, una creatura o un altro fenomeno visibile entro la gittata che si attiva quando si verifica una condizione specifica. L'illusione è impercettibile fino ad allora. Non deve essere più grande di un cubo di 9 metri di lato, e tu decidi al lancio dell'incantesimo come l'illusione si comporta e quali suoni emette. Questa rappresentazione scriptata può durare fino a 5 minuti. Quando si verifica la condizione di attivazione, l'illusione appare e si esibisce nel modo che hai descritto.",
    higherLevels: null,
    materialDesc: "un pochino di lana di pecora e polvere di giada del valore di almeno 25 mo"
  },
  "Sunbeam": {
    name: "Bagliore Solare",
    description: "Un raggio di luce brillante balena dalla tua mano in una linea larga 1,5 metri e lunga 18 metri. Ogni creatura nella linea deve effettuare un tiro salvezza Costituzione, subendo 6d8 danni radiosi con un fallimento, o metà con un successo. Se una creatura fallisce il tiro salvezza, è anche accecata fino al tuo prossimo turno. I non morti e le melme hanno svantaggio a questo tiro salvezza. Puoi creare una nuova linea di luce come azione in qualsiasi turno fino al termine dell'incantesimo. Per la durata, una luce brillante risplende nella tua mano, emettendo luce intensa in un raggio di 9 metri e luce fioca per ulteriori 9 metri.",
    higherLevels: null,
    materialDesc: "una lente d'ingrandimento"
  },
  "Transport via Plants": {
    name: "Trasporto Vegetale",
    description: "Questo incantesimo crea un legame magico tra una pianta inanimata di taglia Grande o superiore entro la gittata e un'altra pianta, a qualsiasi distanza, sullo stesso piano di esistenza. Devi aver visto o toccato la pianta di destinazione almeno una volta in precedenza. Per la durata, qualsiasi creatura può entrare nella pianta bersaglio e uscire dalla pianta di destinazione usando 1,5 metri di movimento.",
    higherLevels: null
  },
  "True Seeing": {
    name: "Visione del Vero",
    description: "Questo incantesimo conferisce alla creatura consenziente che tocchi la capacità di vedere le cose come realmente sono. Per la durata, la creatura ha visione del vero, nota le porte segrete nascoste dalla magia e può vedere nel Piano Etereo, tutto fino a una distanza di 36 metri.",
    higherLevels: null,
    materialDesc: "un unguento per gli occhi del costo di 25 mo, fatto con polvere di funghi, zafferano e grasso, consumato"
  },
  "Wall of Ice": {
    name: "Muro di Ghiaccio",
    description: "Crei un muro di ghiaccio su una superficie solida entro la gittata. Puoi formarlo in una cupola emisferica o una sfera con un raggio fino a 3 metri, oppure una superficie piatta composta da dieci pannelli quadrati di 3 metri, ciascuno spesso almeno 30 cm. Quando il muro appare, ogni creatura nella sua area viene spinta da un lato e deve effettuare un tiro salvezza Destrezza, subendo 10d6 danni da freddo con un fallimento, o metà con un successo. Ogni sezione di 3 metri ha CA 12 e 30 punti ferita, ed è vulnerabile ai danni da fuoco. Riducendo una sezione a 0 PF lascia dietro una lamina di aria gelida; le creature che la attraversano subiscono 5d6 danni da freddo.",
    higherLevels: "Il danno aumenta di 2d6 per ogni livello di slot superiore al 6°.",
    materialDesc: "un pezzetto di quarzo"
  },
  "Wall of Thorns": {
    name: "Muro di Spine",
    description: "Crei un muro di rovi resistenti, flessibili e aggrovigliati irti di spine acuminate. Il muro appare entro la gittata su una superficie solida. Può essere lungo fino a 18 metri, alto 3 metri e spesso 1,5 metri, oppure un cerchio di 6 metri di diametro. Il muro blocca la linea di vista. Quando una creatura entra nell'area del muro per la prima volta in un turno o vi inizia il proprio turno, deve effettuare un tiro salvezza Destrezza, subendo 7d8 danni perforanti con un fallimento, o metà con un successo.",
    higherLevels: "Entrambe le dimensioni del muro aumentano di 3 metri per ogni livello di slot superiore al 6°.",
    materialDesc: "una manciata di spine"
  },
  "Wind Walk": {
    name: "Camminare nel Vento",
    description: "Tu e fino a dieci creature consenzienti che puoi vedere entro la gittata assumete una forma gassosa per la durata, apparendo come filamenti di nuvola. In questa forma di nuvola, una creatura ha una velocità di volo di 90 metri e ha resistenza ai danni da armi non magiche. Una creatura in questa forma può solo compiere l'azione di Scattare o ritornare alla sua forma normale. Tornare richiede 1 minuto, durante il quale la creatura è incapacitata.",
    higherLevels: null,
    materialDesc: "fuoco e acqua santa"
  },
  "Word of Recall": {
    name: "Parola del Ritiro",
    description: "Tu e fino a cinque creature consenzienti entro 1,5 metri da te vi teletrasportate istantaneamente in un santuario precedentemente designato. Tu e qualsiasi creatura che si teletrasporta con te apparite nello spazio non occupato più vicino al punto che hai designato quando hai preparato il tuo santuario. Se lanci questo incantesimo senza prima aver preparato un santuario, l'incantesimo non ha effetto.",
    higherLevels: null
  },

  // ============================================================
  // PLAYER'S HANDBOOK 5e — LEVEL 7
  // ============================================================
  "Conjure Celestial": {
    name: "Evoca Celestiale",
    description: "Evochi un celestiale di grado di sfida 4 o inferiore, che appare in uno spazio non occupato che puoi vedere entro la gittata. Il celestiale scompare quando scende a 0 punti ferita o quando l'incantesimo termina. È amichevole verso di te e i tuoi compagni per la durata e obbedisce a qualsiasi comando verbale che impartisci. Se non impartisci comandi, la creatura si difende dalle creature ostili ma altrimenti non compie alcuna azione.",
    higherLevels: "Il grado di sfida aumenta di 1 per ogni livello di slot superiore al 7°."
  },
  "Delayed Blast Fireball": {
    name: "Palla di Fuoco Ritardata",
    description: "Un raggio di luce gialla balena dal tuo dito puntato, poi si condensa in un punto a tua scelta entro la gittata come una sfera incandescente per la durata. Quando l'incantesimo termina, o se una creatura tocca la sfera, la sfera detona in una sfera di 6 metri di raggio. Ogni creatura in quell'area deve effettuare un tiro salvezza Destrezza, subendo danni da fuoco con un fallimento, o metà con un successo. Il danno base è 12d6. Se alla fine del tuo turno la sfera non è ancora detonata, il danno aumenta di 1d6 (massimo 15d6).",
    higherLevels: "Il danno base aumenta di 1d6 per ogni livello di slot superiore al 7°.",
    materialDesc: "una pallina di guano di pipistrello e zolfo"
  },
  "Divine Word": {
    name: "Parola Divina",
    description: "Pronunci una parola divina, imbevuta del potere che plasmò il mondo all'alba della creazione. Scegli un numero qualsiasi di creature che puoi vedere entro la gittata. Ogni creatura che può sentirti deve effettuare un tiro salvezza Carisma. Con un fallimento, una creatura subisce un effetto basato sui suoi punti ferita attuali: 50 PF o meno è assordata per 1 minuto; 40 PF o meno è assordata e accecata per 10 minuti; 30 PF o meno è accecata, assordata e stordita per 1 ora; 20 PF o meno viene uccisa istantaneamente. Inoltre, qualsiasi celestiale, elementale, folletto o immondo che fallisce viene rispedito al suo piano d'origine.",
    higherLevels: null
  },
  "Etherealness": {
    name: "Forma Eterea",
    description: "Entri nelle regioni di confine del Piano Etereo, nell'area dove si sovrappone con il tuo piano attuale. Rimani nell'Etereo di Confine per la durata o finché non usi la tua azione per dissolvere l'incantesimo. Puoi vedere e sentire il piano da cui sei venuto in tonalità di grigio, e non puoi vedere nulla a più di 18 metri di distanza. Puoi influenzare ed essere influenzato solo da altre creature sul Piano Etereo. Puoi muoverti in qualsiasi direzione.",
    higherLevels: "Puoi bersagliare fino a tre creature consenzienti aggiuntive per ogni livello di slot superiore al 7°."
  },
  "Finger of Death": {
    name: "Dito della Morte",
    description: "Scagli energia negativa attraverso una creatura entro la gittata, causandole un dolore atroce. Il bersaglio deve effettuare un tiro salvezza Costituzione, subendo 7d8+30 danni necrotici con un fallimento, o metà con un successo. Un umanoide ucciso da questo incantesimo si rialza all'inizio del tuo prossimo turno come uno zombie permanentemente sotto il tuo comando, seguendo i tuoi ordini verbali al meglio delle sue capacità.",
    higherLevels: null
  },
  "Fire Storm": {
    name: "Tempesta di Fuoco",
    description: "Una tempesta composta da fogli di fiamme ruggenti appare in un luogo a tua scelta entro la gittata. L'area della tempesta consiste in fino a dieci cubi di 3 metri, che puoi disporre come desideri. Ogni cubo deve avere almeno una faccia adiacente a un altro cubo. Ogni creatura nell'area deve effettuare un tiro salvezza Destrezza, subendo 7d10 danni da fuoco con un fallimento, o metà con un successo. Il fuoco danneggia gli oggetti nell'area e accende oggetti infiammabili non indossati o trasportati. Se desideri, la vita vegetale nell'area non è influenzata.",
    higherLevels: null
  },
  "Forcecage": {
    name: "Gabbia di Forza",
    description: "Una prigione cubica immobile e invisibile composta di forza magica appare attorno a un'area a tua scelta entro la gittata. La prigione può essere una gabbia o una scatola solida. Una versione gabbia ha lato fino a 6 metri con sbarre distanti 1,2 cm. Una versione scatola può avere lato fino a 3 metri. Una creatura all'interno della gabbia troppo grande per passare attraverso le fessure non può uscire. Nulla può attraversare le pareti di una versione scatola. Gli incantesimi non possono attraversare le pareti della gabbia. La gabbia si estende anche nel Piano Etereo. Una creatura all'interno può cercare di fuggire usando il teletrasporto o il viaggio interplanare, effettuando un tiro salvezza Carisma. Con un fallimento, la creatura non può fuggire in quel modo.",
    higherLevels: null,
    materialDesc: "polvere di rubino del valore di 1.500 mo"
  },
  "Mirage Arcane": {
    name: "Miraggio Arcano",
    description: "Fai sì che il terreno in un'area fino a 1 km² sembri, suoni, abbia odore e persino dia la sensazione tattile di un altro tipo di terreno. La forma generale del terreno rimane la stessa. Le strutture possono essere aggiunte o rimosse. L'illusione include elementi sonori, visivi, tattili e olfattivi, quindi può trasformare un terreno libero in terreno difficile (o viceversa). Le creature con visione del vero possono vedere attraverso l'illusione ma tutto il resto appare comunque cambiato.",
    higherLevels: null
  },
  "Mordenkainen's Magnificent Mansion": {
    name: "Reggia Meravigliosa",
    description: "Evochi una dimora extradimensionale entro la gittata che dura per la durata. Scegli dove si trova la sua unica entrata. L'ingresso scintilla debolmente, è largo 1,5 metri e alto 3 metri. Solo le creature che designi possono entrare. L'interno può contenere un numero qualsiasi di stanze. L'atmosfera è pulita, fresca e calda. Puoi creare qualsiasi planimetria desideri. Il luogo è arredato e decorato come scegli. La magione contiene cibo sufficiente a servire un banchetto di nove portate per fino a 100 persone. Uno staff di 100 servitori quasi trasparenti assiste chiunque sia all'interno.",
    higherLevels: null,
    materialDesc: "un portale in miniatura intagliato nell'avorio, un piccolo pezzo di marmo levigato e un cucchiaino d'argento, ciascuno del valore di almeno 5 mo"
  },
  "Mordenkainen's Sword": {
    name: "Spada Arcana",
    description: "Crei un piano di forza a forma di spada che fluttua entro la gittata. Quando la spada appare, esegui un attacco in mischia con incantesimo contro un bersaglio a tua scelta entro 1,5 metri dalla spada. Se colpisci, il bersaglio subisce 3d10 danni da forza. Fino al termine dell'incantesimo, puoi usare un'azione bonus in ciascuno dei tuoi turni per muovere la spada fino a 6 metri e ripetere l'attacco contro un bersaglio entro 1,5 metri da essa.",
    higherLevels: null,
    materialDesc: "una spada di platino in miniatura con impugnatura e pomolo di rame e zinco, del valore di 250 mo"
  },
  "Plane Shift": {
    name: "Spostamento Planare",
    description: "Tu e fino a otto creature consenzienti che si tengono per mano in cerchio venite trasportati in un piano di esistenza diverso. Puoi specificare una destinazione bersaglio in termini generali, e appari in o vicino a quella destinazione. In alternativa, puoi usare questo incantesimo come attacco. Esegui un attacco in mischia con incantesimo contro una creatura. Se colpisci, la creatura deve effettuare un tiro salvezza Carisma. Con un fallimento, la creatura viene trasportata in una posizione casuale sul piano di esistenza che specifichi.",
    higherLevels: null,
    materialDesc: "una verga metallica biforcuta del valore di almeno 250 mo, sintonizzata su un particolare piano d'esistenza"
  },
  "Prismatic Spray": {
    name: "Spruzzo Prismatico",
    description: "Otto raggi di luce multicolori balenano dalla tua mano. Ogni raggio è di un colore diverso e ha un potere e uno scopo diversi. Ogni creatura in un cono di 18 metri deve effettuare un tiro salvezza Destrezza. Per ogni bersaglio, tira 1d8 per determinare quale raggio colorato lo colpisce: 1-Rosso (10d6 fuoco), 2-Arancione (10d6 acido), 3-Giallo (10d6 fulmine), 4-Verde (10d6 veleno), 5-Blu (10d6 freddo), 6-Indaco (afferrato, poi pietrificato con tiri salvezza Costituzione falliti), 7-Viola (accecato, poi bandito con un tiro salvezza Saggezza fallito), 8-speciale (colpito da due raggi, tira due volte).",
    higherLevels: null
  },
  "Project Image": {
    name: "Immagine Proiettata",
    description: "Crei una copia illusoria di te stesso che dura per la durata. La copia può apparire in qualsiasi posizione entro la gittata che hai visto in precedenza. L'illusione sembra e suona come te ma è intangibile. Se l'illusione subisce qualsiasi danno, scompare e l'incantesimo termina. Puoi usare la tua azione per muovere questa illusione fino al doppio della tua velocità. Può gesticolare, parlare e comportarsi nel modo che scegli. Imita perfettamente i tuoi modi. Puoi vedere attraverso i suoi occhi e sentire attraverso le sue orecchie come se fossi nel suo spazio.",
    higherLevels: null,
    materialDesc: "una piccola replica di te stesso fatta di materiali del valore di almeno 5 mo"
  },
  "Regenerate": {
    name: "Rigenerazione",
    description: "Tocchi una creatura e stimoli la sua naturale capacità di guarigione. Il bersaglio recupera 4d8+15 punti ferita. Per la durata dell'incantesimo, il bersaglio recupera 1 punto ferita all'inizio di ciascuno dei suoi turni (10 punti ferita ogni minuto). Le parti del corpo recise del bersaglio (dita, gambe, code e così via), se ce ne sono, vengono ripristinate dopo 2 minuti.",
    higherLevels: null,
    materialDesc: "una ruota di preghiera e acqua santa"
  },
  "Resurrection": {
    name: "Resurrezione",
    description: "Tocchi una creatura morta che è morta da non più di un secolo, che non è morta di vecchiaia e che non è non morta. Se la sua anima è libera e disponibile, la creatura ritorna in vita con tutti i suoi punti ferita. Questo incantesimo neutralizza qualsiasi veleno e cura le malattie normali. Non rimuove malattie magiche, maledizioni e simili. Questo incantesimo chiude tutte le ferite mortali e ripristina qualsiasi parte del corpo mancante. Ritornare dalla morte è un calvario, e il bersaglio subisce una penalità di -4 a tutti i tiri di d20, ridotta di 1 dopo ogni riposo lungo.",
    higherLevels: null,
    materialDesc: "un diamante del valore di almeno 1.000 mo, consumato"
  },
  "Reverse Gravity": {
    name: "Inversione della Gravità",
    description: "Questo incantesimo inverte la gravità in un cilindro di 15 metri di raggio e 30 metri di altezza centrato su un punto entro la gittata. Tutte le creature e gli oggetti che non sono ancorati al terreno nell'area cadono verso l'alto e raggiungono la sommità dell'area. Una creatura può effettuare un tiro salvezza Destrezza per aggrapparsi a un oggetto fisso a portata di mano. Se viene incontrato un oggetto solido sopra, gli oggetti e le creature in caduta lo colpiscono proprio come durante una normale caduta verso il basso. Quando l'incantesimo termina, gli oggetti e le creature colpiti ricadono.",
    higherLevels: null,
    materialDesc: "un magnete (lodestone) e limatura di ferro"
  },
  "Sequester": {
    name: "Celare",
    description: "Tramite questo incantesimo, una creatura consenziente o un oggetto possono essere nascosti, al sicuro dal rilevamento per la durata. Quando lanci l'incantesimo e tocchi il bersaglio, diventa invisibile e non può essere bersagliato da incantesimi di divinazione né percepito attraverso sensori di scrutamento. Se il bersaglio è una creatura, cade in uno stato di animazione sospesa. Il tempo cessa di scorrere per essa, e non invecchia. Puoi impostare una condizione affinché l'incantesimo termini in anticipo.",
    higherLevels: null,
    materialDesc: "una polvere composta da polvere di diamante, smeraldo, rubino e zaffiro del valore di almeno 5.000 mo, consumata"
  },
  "Simulacrum": {
    name: "Simulacro",
    description: "Modelli un duplicato illusorio di una bestia o umanoide che si trova entro la gittata per l'intero tempo di lancio. Il duplicato è una creatura, parzialmente reale, formata da ghiaccio o neve. Sembra essere uguale all'originale ma ha la metà del massimo di punti ferita della creatura ed è formato senza alcun equipaggiamento. Il simulacro è amichevole verso di te e le creature che designi. Obbedisce ai tuoi comandi verbali. Il simulacro non ha la capacità di imparare o diventare più potente, quindi non aumenta mai il suo livello o altre abilità. Se il simulacro viene danneggiato, puoi ripararlo in un laboratorio alchemico usando erbe e minerali rari del valore di 100 mo per punto ferita recuperato.",
    higherLevels: null,
    materialDesc: "neve o ghiaccio in quantità sufficiente per fare una copia a grandezza naturale della creatura duplicata; alcuni capelli, ritagli di unghie o altri pezzi del corpo della creatura; e polvere di rubino del valore di 1.500 mo, cosparsa sul duplicato"
  },
  "Symbol": {
    name: "Simbolo",
    description: "Quando lo iscrivi, scegli uno dei seguenti effetti che si verifichi quando attivato: Morte (10d10 danni necrotici, tiro salvezza Costituzione per metà), Discordia (i bersagli litigano per 1 minuto), Paura (i bersagli sono spaventati per 1 minuto), Disperazione (i bersagli sono sopraffatti dalla disperazione per 1 minuto), Follia (i bersagli sono resi pazzi per 1 minuto), Dolore (i bersagli sono incapacitati per 1 minuto), Sonno (i bersagli cadono incoscienti per 10 minuti), o Stordimento (i bersagli sono storditi per 1 minuto). Il glifo copre una sfera di 3 metri di raggio quando attivato.",
    higherLevels: null,
    materialDesc: "mercurio, fosforo e diamante e opale in polvere del valore complessivo di almeno 1.000 mo, consumati"
  },
  "Teleport": {
    name: "Teletrasporto",
    description: "Questo incantesimo trasporta istantaneamente te e fino a otto creature consenzienti a tua scelta entro la gittata, o un singolo oggetto entro la gittata, in una destinazione che selezioni. Se bersagli un oggetto, deve essere in grado di entrare interamente in un cubo di 3 metri di lato. La destinazione deve essere a te nota e sullo stesso piano di esistenza. La tua familiarità con la destinazione determina l'accuratezza del tuo arrivo. Oggetto associato: automatico. Molto familiare: a bersaglio (d100 01-97). Vista occasionalmente: a bersaglio (01-43). Vista una volta: a bersaglio (01-33). Solo descrizione: a bersaglio (01-24). Falsa destinazione: si verifica sempre un incidente.",
    higherLevels: null
  },

  // ============================================================
  // PLAYER'S HANDBOOK 5e — LEVEL 8
  // ============================================================
  "Animal Shapes": {
    name: "Forme Animali",
    description: "La tua magia trasforma altri in bestie. Scegli un numero qualsiasi di creature consenzienti che puoi vedere entro la gittata. Trasformi ciascun bersaglio nella forma di una bestia di taglia Grande o inferiore con un grado di sfida 4 o inferiore. Nei turni successivi, puoi usare la tua azione per trasformare le creature colpite in nuove forme. La trasformazione dura per la durata per ogni bersaglio, o finché il bersaglio non scende a 0 punti ferita o muore. Puoi scegliere una forma diversa per ciascun bersaglio.",
    higherLevels: null
  },
  "Antimagic Field": {
    name: "Campo Anti-Magia",
    description: "Una sfera invisibile di antimagia con raggio di 3 metri ti circonda, isolandoti dall'energia magica che permea il multiverso. Dentro la sfera non puoi lanciare incantesimi, le creature evocate svaniscono e gli oggetti magici si comportano come oggetti ordinari. La sfera si muove con te, centrata su di te, fino al termine dell'incantesimo.\n\nIncantesimi e altri effetti magici — tranne quelli creati da un artefatto o da una divinità — sono soppressi all'interno della sfera e non possono spingersi al suo interno. Uno slot incantesimo speso per lanciare un incantesimo soppresso viene comunque consumato. Mentre un effetto è soppresso non produce alcun risultato, ma la sua durata continua a scorrere normalmente.\n\nEffetti a bersaglio. Incantesimi ed effetti magici (per esempio dardo incantato o charme su persone) che bersagliano una creatura o un oggetto all'interno della sfera non hanno alcun effetto su di esso.\n\nAree di magia. L'area di un altro incantesimo o effetto magico, come palla di fuoco, non può estendersi dentro la sfera. Se la sfera si sovrappone a un'area magica, la porzione coperta viene soppressa: per esempio, le fiamme di muro di fuoco si interrompono nella sfera e creano un varco se la sovrapposizione è sufficientemente larga.\n\nIncantesimi attivi. Ogni incantesimo o effetto magico applicato a una creatura o a un oggetto all'interno della sfera resta soppresso finché la creatura o l'oggetto si trova al suo interno.\n\nOggetti magici. Proprietà e poteri degli oggetti magici sono soppressi nella sfera: una spada lunga +1 entro la sfera funziona come una spada lunga ordinaria. Anche i poteri di un'arma magica sono soppressi se usata contro un bersaglio dentro la sfera o impugnata da un attaccante dentro la sfera. Se un'arma o una munizione magica esce completamente dalla sfera (per esempio, scagli una freccia magica verso un bersaglio esterno), la sua magia cessa di essere soppressa nel momento stesso in cui lascia la sfera.\n\nViaggio magico. Teletrasporto e viaggi planari non funzionano all'interno della sfera, né come origine né come destinazione. Un portale verso un altro luogo, mondo o piano di esistenza — e qualsiasi varco extradimensionale, come quello aperto da trucco della corda — si chiude temporaneamente finché la sfera lo copre.\n\nCreature e oggetti evocati. Una creatura o un oggetto evocato o creato dalla magia svanisce temporaneamente dall'esistenza all'interno della sfera. La creatura riappare istantaneamente non appena lo spazio che occupa non rientra più nella sfera.\n\nDissolvi magie. Effetti come dissolvi magie non hanno alcun effetto sulla sfera. Analogamente, sfere create da più incantesimi campo anti-magia non si annullano a vicenda.",
    higherLevels: null,
    materialDesc: "un pizzico di ferro in polvere o limatura di ferro"
  },
  "Antipathy/Sympathy": {
    name: "Antipatia/Simpatia",
    description: "Questo incantesimo attrae o respinge le creature a tua scelta. Bersagli qualcosa entro la gittata, sia un oggetto o creatura di taglia Enorme o inferiore o un'area non più grande di un cubo di 60 metri di lato. Poi specifichi un tipo di creatura intelligente. Imbevi il bersaglio di un'aura che attrae o respinge le creature specificate per la durata. Antipatia: le creature devono riuscire in un tiro salvezza Saggezza o diventare spaventate e fuggire. Simpatia: le creature devono riuscire in un tiro salvezza Saggezza o usare il loro movimento per avvicinarsi al bersaglio.",
    higherLevels: null,
    materialDesc: "un grumo di allume immerso nell'aceto per antipatia, oppure una goccia di miele per simpatia"
  },
  "Clone": {
    name: "Clone",
    description: "Questo incantesimo fa crescere un duplicato inerte di una creatura vivente come salvaguardia contro la morte. Questo clone si forma all'interno di un contenitore sigillato e cresce fino alla piena dimensione e maturità dopo 120 giorni. In qualsiasi momento dopo che il clone matura, se la creatura originale muore, la sua anima si trasferisce nel clone, purché l'anima sia libera e disposta a tornare. Il clone è fisicamente identico all'originale e ha la stessa personalità, ricordi e abilità.",
    higherLevels: null,
    materialDesc: "un diamante del valore di almeno 1.000 mo e almeno 1 pollice cubo di carne della creatura da clonare, più un recipiente del valore di almeno 2.000 mo con un coperchio sigillabile abbastanza grande da contenere una creatura Media"
  },
  "Control Weather": {
    name: "Controllare Tempo Atmosferico",
    description: "Per la durata, l'incantatore prende il controllo del tempo atmosferico in un raggio di 7,5 km. Il lancio richiede di trovarsi all'aperto: se in seguito ci si sposta in un luogo privo di linea diretta verso il cielo, l'incantesimo termina prematuramente.\n\nAl momento del lancio, l'incantatore modifica le condizioni meteorologiche correnti — stabilite dal DM in base a clima e stagione — agendo su tre categorie indipendenti: precipitazioni, temperatura e vento. Le nuove condizioni richiedono 1d4 × 10 minuti per manifestarsi; quando sono entrate in vigore, l'incantatore può applicare ulteriori modifiche. Al termine dell'incantesimo il tempo torna gradualmente alla normalità.\n\nPer ogni cambio, individua la condizione corrente nelle tabelle e spostala di un grado verso l'alto o verso il basso. Quando modifica il vento può anche cambiarne la direzione.\n\nPrecipitazioni (1-5): Sereno, Poco nuvoloso, Nuvoloso o nebbia, Pioggia/grandine/neve, Pioggia torrenziale/grandine fitta/tormenta.\n\nTemperatura (1-6): Caldo insopportabile, Caldo, Mite, Fresco, Freddo, Freddo artico.\n\nVento (1-5): Calmo, Vento moderato, Vento forte, Burrasca, Tempesta.",
    higherLevels: null,
    materialDesc: "incenso che brucia e pezzi di terra e legno mescolati nell'acqua"
  },
  "Demiplane": {
    name: "Semipiano",
    description: "Crei una porta ombrosa su una superficie solida piatta che puoi vedere entro la gittata. La porta è abbastanza grande da consentire alle creature di taglia Media di passare senza ostacoli. Quando viene aperta, conduce a un semipiano che appare come una stanza vuota di 9 metri per ogni dimensione, fatta di legno o pietra. Quando l'incantesimo termina, la porta scompare, e qualsiasi creatura o oggetto all'interno del semipiano rimane intrappolato lì. Ogni volta che lanci questo incantesimo, puoi creare un nuovo semipiano o connetterti a uno che hai creato in precedenza.",
    higherLevels: null
  },
  "Dominate Monster": {
    name: "Dominare Mostri",
    description: "Tenti di affascinare una creatura entro la gittata. Deve riuscire in un tiro salvezza Saggezza o essere ammaliata da te per la durata. Hai un legame telepatico con essa e puoi impartire comandi (nessuna azione richiesta). Puoi usare la tua azione per assumere il controllo totale e preciso fino alla fine del tuo prossimo turno. Ogni volta che il bersaglio subisce danno, effettua un nuovo tiro salvezza Saggezza. Con un successo, l'incantesimo termina.",
    higherLevels: "Al 9° livello, la durata è concentrazione, fino a 8 ore."
  },
  "Earthquake": {
    name: "Terremoto",
    description: "Crei un disturbo sismico in un punto sul terreno entro la gittata. Per la durata, un intenso tremore squassa il terreno in un cerchio di 30 metri di raggio centrato su quel punto. Ogni creatura sul terreno nell'area deve effettuare un tiro salvezza Destrezza. Con un fallimento, la creatura viene abbattuta prona e la concentrazione viene interrotta. Il terremoto può creare crepe, far crollare strutture e danneggiare le fondamenta. Le crepe sono profonde 1d10 x 3 metri.",
    higherLevels: null,
    materialDesc: "un pizzico di terra, un pezzo di roccia e un grumo di argilla"
  },
  "Feeblemind": {
    name: "Regressione Mentale",
    description: "Devasti la mente di una creatura entro la gittata, tentando di frantumarne l'intelletto e la personalità. Il bersaglio subisce 4d6 danni psichici e deve effettuare un tiro salvezza Intelligenza. Con un fallimento, i punteggi di Intelligenza e Carisma della creatura diventano 1. La creatura non può lanciare incantesimi, attivare oggetti magici, comprendere il linguaggio o comunicare in modo intelligibile. La creatura può, tuttavia, identificare i suoi amici, seguirli e persino proteggerli. Alla fine di ogni 30 giorni, la creatura può ripetere il suo tiro salvezza. Può anche essere curata da Ristorare Superiore, Guarigione o Desiderio.",
    higherLevels: null,
    materialDesc: "una manciata di sfere di argilla, cristallo, vetro o minerale"
  },
  "Glibness": {
    name: "Loquacità",
    description: "Fino al termine dell'incantesimo, quando esegui una prova di Carisma, puoi sostituire il numero che tiri con un 15. Inoltre, indipendentemente da ciò che dici, la magia che determinerebbe se stai dicendo la verità indica che stai dicendo il vero.",
    higherLevels: null
  },
  "Holy Aura": {
    name: "Aura Sacra",
    description: "La luce divina si irradia da te e si raccoglie in un dolce splendore in un raggio di 9 metri attorno a te. Le creature a tua scelta in quel raggio quando lanci l'incantesimo emettono luce fioca in un raggio di 1,5 metri e hanno vantaggio a tutti i tiri salvezza. Le altre creature hanno svantaggio ai tiri per colpire contro di esse. Inoltre, quando un immondo o un non morto colpisce una creatura colpita con un attacco in mischia, l'aura lampeggia con luce brillante. L'attaccante deve riuscire in un tiro salvezza Costituzione o essere accecato fino al termine dell'incantesimo.",
    higherLevels: null,
    materialDesc: "un piccolo reliquiario del valore di almeno 1.000 mo contenente una reliquia sacra, come un brandello di stoffa dalla veste di un santo o un pezzo di pergamena di un testo religioso"
  },
  "Incendiary Cloud": {
    name: "Nube Incendiaria",
    description: "Una nube vorticosa di fumo intervallata da braci incandescenti appare in una sfera di 6 metri di raggio centrata su un punto entro la gittata. La nube si diffonde dietro gli angoli ed è fortemente oscurata. Dura per la durata o finché un vento di velocità moderata o superiore non la disperde. Quando la nube appare, ogni creatura al suo interno deve effettuare un tiro salvezza Destrezza, subendo 10d8 danni da fuoco con un fallimento, o metà con un successo. Una creatura deve effettuare anche questo tiro salvezza quando entra nell'area per la prima volta in un turno o vi termina il proprio turno. La nube si muove di 3 metri direttamente lontano da te all'inizio di ciascuno dei tuoi turni.",
    higherLevels: null
  },
  "Maze": {
    name: "Labirinto",
    description: "Esili una creatura entro la gittata in un semipiano labirintico. Il bersaglio rimane lì per la durata o finché non sfugge dal labirinto. Il bersaglio può usare la sua azione per tentare di fuggire effettuando una prova di Intelligenza CD 20. Quando ha successo, l'incantesimo termina e il bersaglio riappare nello spazio che occupava in precedenza o nel più vicino spazio non occupato. Quando l'incantesimo termina, il bersaglio riappare comunque.",
    higherLevels: null
  },
  "Mind Blank": {
    name: "Vuoto Mentale",
    description: "Fino al termine dell'incantesimo, una creatura consenziente che tocchi è immune ai danni psichici, a qualsiasi effetto che percepirebbe le sue emozioni o leggerebbe i suoi pensieri, agli incantesimi di divinazione e alla condizione ammaliato. L'incantesimo sventa anche gli incantesimi Desiderio e gli incantesimi o effetti di potere simile usati per influenzare la mente del bersaglio o per ottenere informazioni sul bersaglio.",
    higherLevels: null
  },
  "Power Word Stun": {
    name: "Parola del Potere Stordire",
    description: "Pronunci una parola di potere che può sopraffare la mente di una creatura che puoi vedere entro la gittata, lasciandola sbigottita. Se il bersaglio ha 150 punti ferita o meno, è stordito. Altrimenti, l'incantesimo non ha effetto. Il bersaglio stordito deve effettuare un tiro salvezza Costituzione alla fine di ciascuno dei suoi turni. Con un tiro salvezza riuscito, questo effetto stordente termina.",
    higherLevels: null
  },
  "Sunburst": {
    name: "Esplosione Solare",
    description: "Brillante luce solare lampeggia in un raggio di 18 metri centrato su un punto a tua scelta entro la gittata. Ogni creatura in quella luce deve effettuare un tiro salvezza Costituzione, subendo 12d6 danni radiosi con un fallimento, o metà con un successo. Una creatura che fallisce questo tiro salvezza è anche accecata per 1 minuto. La creatura può effettuare un altro tiro salvezza Costituzione alla fine di ciascuno dei suoi turni, terminando la cecità su di sé con un successo. Questo incantesimo dissolve qualsiasi oscurità nella sua area che sia stata creata da un incantesimo.",
    higherLevels: null,
    materialDesc: "fuoco e un pezzo di pietra solare"
  },
  "Telepathy": {
    name: "Telepatia",
    description: "Crei un legame telepatico tra te e una creatura consenziente con cui hai familiarità. La creatura può trovarsi ovunque sullo stesso piano di esistenza in cui sei tu. L'incantesimo termina se tu o il bersaglio non vi trovate più sullo stesso piano. Fino al termine dell'incantesimo, tu e il bersaglio potete istantaneamente condividere parole, immagini, suoni e altri messaggi sensoriali tra di voi attraverso il legame, e il bersaglio ti riconosce come la creatura con cui sta comunicando.",
    higherLevels: null,
    materialDesc: "una coppia di anelli d'argento collegati"
  },
  "Tsunami": {
    name: "Tsunami",
    description: "Un muro d'acqua appare in un punto a tua scelta entro la gittata. Puoi rendere il muro lungo fino a 90 metri, alto 90 metri e spesso 15 metri. Il muro dura per la durata. Quando il muro appare, ogni creatura nella sua area deve effettuare un tiro salvezza Forza, subendo 6d10 danni contundenti con un fallimento, o metà con un successo. All'inizio di ciascuno dei tuoi turni dopo la comparsa del muro, il muro si muove di 15 metri lontano da te. Ogni creatura all'interno del muro o nel cui spazio entra deve effettuare il tiro salvezza. L'altezza del muro si riduce di 15 metri ogni round.",
    higherLevels: null
  },

  // ============================================================
  // PLAYER'S HANDBOOK 5e — LEVEL 9
  // ============================================================
  "Astral Projection": {
    name: "Proiezione Astrale",
    description: "Tu e fino a otto creature consenzienti entro la gittata proiettate i vostri corpi astrali nel Piano Astrale. Il corpo materiale che lasci dietro di te è incosciente e in uno stato di animazione sospesa; non ha bisogno di cibo o aria e non invecchia. Il tuo corpo astrale assomiglia alla tua forma mortale in quasi ogni modo, replicando le tue statistiche di gioco e i tuoi possedimenti. La principale differenza è l'aggiunta di un cordone argenteo che si estende tra le tue scapole e si trascina dietro di te, scomparendo all'invisibilità dopo 30 cm. Se il cordone viene tagliato, la tua anima e il tuo corpo si separano, uccidendoti istantaneamente.",
    higherLevels: null,
    materialDesc: "per ciascuna creatura coinvolta, un giacinto del valore di almeno 1.000 mo e una barra d'argento finemente intagliata del valore di almeno 100 mo"
  },
  "Foresight": {
    name: "Previsione",
    description: "Tocchi una creatura consenziente e le concedi una capacità limitata di vedere nel futuro immediato. Per la durata, il bersaglio non può essere sorpreso e ha vantaggio ai tiri per colpire, alle prove di caratteristica e ai tiri salvezza. Inoltre, le altre creature hanno svantaggio ai tiri per colpire contro il bersaglio per la durata.",
    higherLevels: null,
    materialDesc: "una piuma di colibrì"
  },
  "Gate": {
    name: "Portale",
    description: "Evochi un portale che collega uno spazio non occupato che puoi vedere entro la gittata a una posizione precisa su un piano di esistenza diverso. Il portale è un'apertura circolare, che puoi rendere di 1,5-6 metri di diametro. Puoi orientare il portale in qualsiasi direzione tu scelga. Qualsiasi creatura che entra nel portale esce dal portale sull'altro piano. Se conosci il vero nome di una creatura su un altro piano, puoi forzarla attraverso il portale per farla apparire in uno spazio non occupato entro la gittata (nessun tiro salvezza se nominata).",
    higherLevels: null,
    materialDesc: "un diamante del valore di almeno 5.000 mo"
  },
  "Imprisonment": {
    name: "Imprigionare",
    description: "L'incantatore crea una costrizione magica per imprigionare una creatura entro gittata che riesce a vedere. Il bersaglio effettua un TS Saggezza: con un fallimento è vincolato dall'incantesimo; con un successo diventa permanentemente immune ai futuri lanci di questo incantesimo da parte dello stesso incantatore.\n\nUn bersaglio vincolato non ha bisogno di respirare, mangiare né bere e non invecchia. Inoltre, gli incantesimi di divinazione non possono né localizzarlo né percepirlo.\n\nAl lancio l'incantatore sceglie una delle seguenti modalità di prigionia.\n\nCeppi. Il bersaglio è bloccato sul posto da catene pesanti saldamente ancorate al suolo. Non può muoversi né essere spostato fino al termine dell'incantesimo. Componente speciale: una catenella di metallo prezioso.\n\nPrigione Delimitata. Il bersaglio è trasportato in un piccolo semipiano protetto contro teletrasporto e viaggi planari. La forma — labirinto, gabbia, torre o altra struttura confinata — è a scelta dell'incantatore. Componente speciale: una riproduzione in giada in miniatura della prigione desiderata.\n\nPrigionia Ridotta. Il bersaglio viene rimpicciolito fino a 2,5 cm e rinchiuso dentro una gemma o un oggetto simile. La gemma lascia passare normalmente la luce (il bersaglio vede fuori e gli altri vedono dentro), ma blocca qualunque altra cosa, incluso teletrasporto e viaggi planari. Mentre l'incantesimo è attivo, la gemma non può essere intagliata né distrutta. Componente speciale: una grossa gemma trasparente, come un corindone, un diamante o un rubino.\n\nSepoltura. Il bersaglio è inumato nelle profondità della terra entro una sfera di forza magica delle dimensioni giuste per contenerlo. Nulla può attraversare la sfera; nessuna creatura può entrarvi o uscirne tramite teletrasporto o viaggi planari. Componente speciale: un piccolo globo di mithral.\n\nSonno. Il bersaglio si addormenta e non può essere svegliato. Componente speciale: una raccolta di erbe soporifere rare.\n\nTermine dell'incantesimo. Al lancio, in qualunque modalità, l'incantatore può specificare una condizione che, una volta verificatasi, libera il bersaglio. La condizione può essere quanto complessa l'incantatore desideri, purché il DM la consideri ragionevole e con una certa possibilità di realizzarsi. Può riferirsi al nome, all'identità o alla divinità di una creatura, ma deve fondarsi su azioni o qualità osservabili — mai su concetti intangibili come livello, classe o punti ferita.\n\nUn dissolvi magie pone termine a questo incantesimo soltanto se lanciato a 9° livello prendendo come bersaglio la prigione o la componente speciale usata per crearla. Una stessa componente speciale può sostenere una sola prigione per volta: rilanciando l'incantesimo con la medesima componente, il bersaglio originario viene liberato all'istante.",
    higherLevels: null,
    materialDesc: "una raffigurazione su pergamena o una statuetta intagliata a somiglianza del bersaglio, e una componente speciale che varia a seconda della prigione, del valore di almeno 500 mo per Dado Vita del bersaglio"
  },
  "Mass Heal": {
    name: "Guarigione di Massa",
    description: "Un'inondazione di energia curativa fluisce da te nelle creature ferite attorno a te. Ripristini fino a 700 punti ferita, divisi come scegli tra un numero qualsiasi di creature che puoi vedere entro la gittata. Le creature curate da questo incantesimo sono anche curate da tutte le malattie e da qualsiasi effetto che le rende accecate o assordate. Questo incantesimo non ha effetto sui non morti o sui costrutti.",
    higherLevels: null
  },
  "Meteor Swarm": {
    name: "Sciame di Meteore",
    description: "Sfere ardenti di fuoco precipitano sul terreno in quattro punti diversi che puoi vedere entro la gittata. Ogni creatura in una sfera di 12 metri di raggio centrata su ciascun punto deve effettuare un tiro salvezza Destrezza. Una creatura subisce 20d6 danni da fuoco e 20d6 danni contundenti con un fallimento, o metà con un successo. Una creatura nell'area di più di un'esplosione di fuoco viene colpita solo una volta. L'incantesimo danneggia gli oggetti nell'area e accende oggetti infiammabili non indossati o trasportati.",
    higherLevels: null
  },
  "Power Word Kill": {
    name: "Parola del Potere Uccidere",
    description: "Pronunci una parola di potere che può costringere una creatura che puoi vedere entro la gittata a morire istantaneamente. Se la creatura che scegli ha 100 punti ferita o meno, muore. Altrimenti, l'incantesimo non ha effetto.",
    higherLevels: null
  },
  "Prismatic Wall": {
    name: "Muro Prismatico",
    description: "Un piano scintillante e multicolore di luce forma un muro opaco verticale, lungo fino a 27 metri, alto 9 metri e spesso 2,5 cm, oppure una sfera fino a 9 metri di diametro, centrato su un punto a tua scelta entro la gittata. Il muro emette luce intensa fino a 30 metri e luce fioca per ulteriori 30 metri. Il muro consiste di sette strati, ognuno di un colore diverso: rosso (10d6 fuoco, blocca attacchi a distanza non magici), arancione (10d6 acido, blocca attacchi a distanza magici), giallo (10d6 fulmine, blocca incantesimi a bersaglio), verde (10d6 veleno, blocca viaggio/comune), blu (10d6 freddo, blocca divinazione), indaco (afferrato poi pietrificato), viola (accecato poi bandito).",
    higherLevels: null
  },
  "Shapechange": {
    name: "Trasformazione",
    description: "Assumi la forma di una creatura diversa per la durata. La nuova forma può essere di qualsiasi creatura con un grado di sfida pari o inferiore al tuo livello. Mantieni il tuo allineamento, personalità, punteggi di Intelligenza, Saggezza e Carisma, oltre ai tuoi punti ferita. Altrimenti acquisisci tutte le statistiche e capacità della nuova forma, eccetto le capacità di classe, le azioni leggendarie e le azioni di tana. Puoi usare la tua azione per cambiare in un'altra forma durante la durata.",
    higherLevels: null,
    materialDesc: "un cerchietto di giada del valore di almeno 1.500 mo, che devi indossare in testa prima di lanciare l'incantesimo"
  },
  "Storm of Vengeance": {
    name: "Tempesta di Vendetta",
    description: "Una nube temporalesca turbinante si forma centrata su un punto che puoi vedere, diffondendosi a un raggio di 110 metri. Ogni round produce un effetto diverso: Round 1 (2d6 tuono, assordato con tiro salvezza Costituzione fallito), Round 2 (pioggia acida, 1d6 acido), Round 3 (6 fulmini, tiro salvezza Destrezza o 10d6 fulmine ciascuno), Round 4 (chicchi di grandine, 2d6 contundenti), Round 5-10 (raffiche e pioggia gelata, terreno difficile, oscuramento pesante, attacchi a distanza impossibili, concentrazione richiede tiro salvezza Costituzione, 1d6 freddo).",
    higherLevels: null
  },
  "Time Stop": {
    name: "Fermare il Tempo",
    description: "Fermi brevemente il flusso del tempo per tutti tranne te. Per le altre creature non passa tempo, mentre tu effettui 1d4+1 turni di fila, durante i quali puoi usare azioni e muoverti normalmente. Questo incantesimo termina se una delle azioni che usi durante questo periodo, o qualsiasi effetto che crei durante questo periodo, colpisce una creatura diversa da te o un oggetto indossato o trasportato da qualcuno diverso da te.",
    higherLevels: null
  },
  "True Polymorph": {
    name: "Metamorfosi Pura",
    description: "Scegli una creatura o un oggetto non magico entro la gittata. Lo trasformi in una creatura o oggetto diverso. La trasformazione dura per la durata, o finché il bersaglio scende a 0 punti ferita o muore. Se mantieni la concentrazione per tutta la durata, la trasformazione diventa permanente. Creatura in creatura: la nuova forma può avere GS pari o inferiore al GS o livello del bersaglio. Oggetto in creatura: GS pari o inferiore a 9. Creatura in oggetto: la creatura e il suo equipaggiamento diventano l'oggetto. Un bersaglio non consenziente può effettuare un tiro salvezza Saggezza per resistere.",
    higherLevels: null,
    materialDesc: "una goccia di mercurio, un cucchiaio di gomma arabica e un filo di fumo"
  },
  "True Resurrection": {
    name: "Resurrezione Pura",
    description: "Tocchi una creatura morta da non più di 200 anni e che è morta per qualsiasi ragione tranne la vecchiaia. Se l'anima della creatura è libera e disponibile, la creatura viene riportata in vita con tutti i suoi punti ferita. Questo incantesimo chiude tutte le ferite, neutralizza qualsiasi veleno, cura tutte le malattie e solleva qualsiasi maledizione che colpiva la creatura quando è morta. L'incantesimo sostituisce organi e arti danneggiati o mancanti. L'incantesimo può anche fornire un nuovo corpo se l'originale non esiste più.",
    higherLevels: null,
    materialDesc: "una spruzzata di acqua santa e diamanti del valore di almeno 25.000 mo, consumati"
  },
  "Weird": {
    name: "Fatale",
    description: "Attingendo alle paure più profonde di un gruppo di creature, crei creature illusorie nelle loro menti, visibili solo a loro. Ogni creatura in una sfera di 9 metri di raggio centrata su un punto a tua scelta entro la gittata deve effettuare un tiro salvezza Saggezza. Con un tiro salvezza fallito, una creatura diventa spaventata per la durata. Alla fine di ciascuno dei turni della creatura spaventata, la creatura deve riuscire in un tiro salvezza Saggezza o subire 4d10 danni psichici. Con un tiro salvezza riuscito, l'incantesimo termina per quella creatura.",
    higherLevels: null
  },
  "Wish": {
    name: "Desiderio",
    description: "Desiderio è il più potente incantesimo che una creatura mortale può lanciare. Pronunciando semplicemente parole ad alta voce, puoi alterare le fondamenta stesse della realtà secondo i tuoi desideri. L'uso base di questo incantesimo è duplicare qualsiasi altro incantesimo di 8° livello o inferiore senza dover soddisfare alcun requisito. In alternativa, puoi creare uno di questi effetti: creare un oggetto non magico del valore di fino a 25.000 mo, fino a 90 metri in qualsiasi dimensione; fino a venti creature recuperano tutti i punti ferita e terminano tutti gli effetti su di esse; fino a dieci creature ottengono resistenza a un tipo di danno a tua scelta; fino a dieci creature ottengono immunità a un singolo incantesimo o effetto magico per 8 ore; oppure puoi annullare un singolo evento recente forzando un nuovo tiro. Usare l'incantesimo per qualcosa di diverso dalla duplicazione di un altro incantesimo di 8° livello o inferiore causa stress, inclusi 1d10 danni necrotici per livello di incantesimo per ogni incantesimo che lanci dopo, e una probabilità del 33 percento di non poter mai più lanciare Desiderio.",
    higherLevels: null
  },

  // ============================================================
  // THE CROOKED MOON (manuale non tradotto in italiano: nomi in inglese)
  // ============================================================

  // --- CANTRIPS ---
  "Blood Bolt": {
    description: "Scagli un dardo contorto di sangue contro una creatura entro la gittata. Esegui un attacco a distanza con incantesimo contro il bersaglio. Se colpisci, il bersaglio subisce 1d6 danni necrotici, e tu ottieni un numero di punti ferita temporanei pari al tuo Bonus di Competenza.",
    higherLevels: "Potenziamento Trucchetto. Il danno aumenta di 1d6 al raggiungimento dei livelli 5 (2d6), 11 (3d6) e 17 (4d6)."
  },
  "Dissolution": {
    description: "Tocchi una creatura o un oggetto non magico e scomponi la sostanza del bersaglio nei suoi componenti più fondamentali. Esegui un attacco in mischia con incantesimo. Se colpisci, il bersaglio subisce 1d8 danni da forza, e la sua CA è ridotta di 1 contro il prossimo tiro per colpire effettuato contro di esso prima della fine del tuo prossimo turno.",
    higherLevels: "Potenziamento Trucchetto. Il danno aumenta di 1d8 al raggiungimento dei livelli 5 (2d8), 11 (3d8) e 17 (4d8)."
  },
  "Eye Burn": {
    description: "Pungi gli occhi di una creatura che ti sta attaccando. Il bersaglio deve effettuare un tiro salvezza Costituzione (una creatura con Vista Cieca o Immunità alla condizione accecato ha automaticamente successo). Con un tiro salvezza fallito, il bersaglio ha la condizione accecato fino alla fine del turno. Con un tiro salvezza riuscito, deve sottrarre 1d4 dal tiro per colpire scatenante. Il bersaglio ha automaticamente successo nei tiri salvezza contro i tuoi successivi lanci di questo incantesimo per 24 ore.",
    higherLevels: null,
    materialDesc: "una macchia di canfora"
  },
  "Mysterious Presence": {
    description: "Tocchi una creatura consenziente e ne avvolgi la presenza. Fino al termine dell'incantesimo, le altre creature devono sottrarre 1d4 da qualsiasi prova di Saggezza (Intuizione o Percezione) effettuata contro il bersaglio.",
    higherLevels: null
  },

  // --- LEVEL 1 ---
  "Ancestral Communion": {
    description: "Invochi la saggezza dei tuoi antenati per ottenere intuizione nelle tue prove. Quando lanci l'incantesimo, e all'inizio di ciascuno dei tuoi turni per la durata, ottieni Ispirazione Eroica se non ce l'hai già.",
    higherLevels: null
  },
  "Captivate Undead": {
    description: "Usurpi l'energia negativa che anima una creatura non morta che puoi vedere entro la gittata, tentando di prenderne il controllo. Il bersaglio deve effettuare un tiro salvezza Carisma. Con un tiro salvezza fallito, per la durata, il bersaglio ha la condizione ammaliato (ignorando qualsiasi Immunità a tale condizione), ed è amichevole nei tuoi confronti. Con un tiro salvezza riuscito, il bersaglio ha svantaggio al prossimo tiro per colpire effettuato contro di te prima dell'inizio del tuo prossimo turno. Se tu o uno dei tuoi alleati danneggia il bersaglio o lo costringe a effettuare un tiro salvezza, l'incantesimo termina.",
    higherLevels: "Puoi bersagliare una creatura aggiuntiva per ogni livello di slot superiore al 1°.",
    materialDesc: "un pizzico di polvere di ossa"
  },
  "Devil's Due": {
    description: "Assorbi una misura della sofferenza di una creatura e della sua essenza vitale che si sta dissipando. Spendi e tira un Dado dei Punti Ferita. Recuperi un numero di punti ferita pari al numero ottenuto più il tuo modificatore di caratteristica da incantatore. Se la creatura ha subito danni da un colpo critico, raddoppia il numero di punti ferita che recuperi.",
    higherLevels: "Puoi spendere un Dado dei Punti Ferita aggiuntivo per ogni livello di slot superiore al 1°.",
    materialDesc: "un grumo di pece"
  },
  "Hungering Blade": {
    description: "Imbevi un'arma che impugni, o i tuoi attacchi senz'armi, di voracissima energia negativa. Per la durata, quando colpisci una creatura con un attacco usando l'arma potenziata o un attacco senz'armi per la prima volta in un turno, il bersaglio subisce danni necrotici pari al tuo modificatore di caratteristica da incantatore, e tu ottieni un numero di punti ferita temporanei pari ai danni necrotici inflitti.",
    higherLevels: null
  },

  // --- LEVEL 2 ---
  "Blood Sacrifice": {
    description: "Sacrifichi una porzione della tua forza vitale per migliorare il tuo potere magico. Quando lanci questo incantesimo, subisci 1d6 danni necrotici, che non possono essere ridotti o prevenuti in alcun modo. Per la durata, quando lanci un incantesimo che infligge danni, un bersaglio dell'incantesimo (a tua scelta) subisce 1d6 danni aggiuntivi dello stesso tipo di quello normale dell'incantesimo (a tua scelta se ce ne sono più di uno).",
    higherLevels: "Sia i danni che subisci sia i danni extra inflitti dai tuoi incantesimi aumentano di 1d6 per ogni livello di slot superiore al 2°.",
    materialDesc: "una goccia del tuo stesso sangue"
  },
  "Chain of Conviction": {
    description: "Scagli una catena spettrale e seghettata contro una creatura che puoi vedere entro la gittata. Il bersaglio effettua un tiro salvezza Forza. Con un tiro salvezza fallito, il bersaglio subisce 2d6 danni da forza, viene tirato fino a 9 metri verso di te ed è vincolato dalla catena. Mentre è vincolato dalla catena, la creatura è legata a te e non può muoversi né teletrasportarsi in uno spazio a più di 9 metri da te, e tu hai vantaggio ai tiri per colpire effettuati contro la creatura. Con un tiro salvezza riuscito, il bersaglio subisce solo metà danno. Il bersaglio vincolato ripete il tiro salvezza alla fine di ciascuno dei suoi turni, terminando l'incantesimo su di sé con un successo. Se sei più di 9 metri lontano dal bersaglio, l'incantesimo termina.",
    higherLevels: "Il danno aumenta di 1d6 per ogni livello di slot superiore al 2°."
  },
  "Chorus of the Lost": {
    description: "Evochi il canto sinistro e i lamenti delle anime perdute da un punto che puoi vedere entro la gittata. Ogni creatura in una sfera di 4,5 metri di raggio centrata lì deve effettuare un tiro salvezza Saggezza. Con un tiro salvezza fallito, il bersaglio subisce 2d6 danni psichici e ha la condizione spaventato per la durata. Con un tiro salvezza riuscito, subisce metà danno e ha la condizione spaventato fino alla fine del suo prossimo turno. Un bersaglio spaventato ripete il tiro salvezza alla fine di ciascuno dei suoi turni, terminando l'incantesimo su di sé con un successo.",
    higherLevels: "Il danno aumenta di 1d6 per ogni livello di slot superiore al 2°.",
    materialDesc: "una campanella d'argento del valore di almeno 10 mo"
  },
  "Harrowing Ballad": {
    description: "Infliggi un canto che erode la mente a una creatura che puoi vedere entro la gittata. Se la creatura ha Intelligenza 4 o superiore, deve riuscire in un tiro salvezza Intelligenza o avere la condizione ammaliato per la durata. Mentre è ammaliata in questo modo, il bersaglio è colpito da una ballata che si ripete rapidamente che solo lui può sentire; subisce 1d6 danni psichici all'inizio di ciascuno dei suoi turni e ha svantaggio alle prove di Saggezza (Percezione) e ai tiri salvezza Costituzione effettuati per mantenere la concentrazione. Il bersaglio ripete il tiro salvezza alla fine di ciascuno dei suoi turni, terminando l'incantesimo con un successo.",
    higherLevels: "Il danno aumenta di 1d6 per ogni livello di slot superiore al 2°."
  },
  "Sanguine Secrets": {
    description: "Attingi conoscenza tramite il potere del sangue su una creatura che puoi vedere entro la gittata. Apprendi specie e tipo di creatura del bersaglio, i suoi punti ferita attuali e qualsiasi condizione che lo affligge. Apprendi anche se ha qualcuna delle seguenti caratteristiche e, in tal caso, quali sono: Vulnerabilità, Resistenza o Immunità a danni o condizioni. Inoltre, la prossima prova di caratteristica o tiro per colpire che effettui contro il bersaglio prima della fine del tuo prossimo turno ha vantaggio.",
    higherLevels: null,
    materialDesc: "una goccia di sangue, che l'incantesimo consuma"
  },
  "Summer Winds": {
    description: "Scateni un'esplosione di luce e vento in un cono di 4,5 metri. I tuoi alleati nel cono recuperano 2d6 punti ferita. I non morti nel cono che sono ostili nei tuoi confronti devono effettuare un tiro salvezza Costituzione, subendo 2d6 danni radiosi con un fallimento, o metà con un successo.",
    higherLevels: "Il danno e la cura aumentano di 2d6 per ogni livello di slot superiore al 2°."
  },
  "Unraveling Whisper": {
    description: "Scegli una creatura che puoi vedere entro la gittata e sussurri una frase spaventosa che solo il bersaglio può sentire. Il bersaglio deve effettuare un tiro salvezza Saggezza. Con un tiro salvezza fallito, il bersaglio subisce 2d6 danni psichici e ha la condizione spaventato fino all'inizio del tuo prossimo turno. Con un tiro salvezza riuscito, il bersaglio subisce solo metà danno. Mentre è spaventato in questo modo, la creatura ha Vulnerabilità a tua scelta tra danni contundenti, perforanti o taglienti.",
    higherLevels: "Puoi bersagliare una creatura aggiuntiva per ogni livello di slot superiore al 2°."
  },
  "Veil of the Reaper": {
    description: "Ti avvolgi in ombre che ti velano tra un colpo e l'altro. Alla fine di qualsiasi turno in cui colpisci una creatura con un tiro per colpire, ottieni la condizione invisibile fino all'inizio del tuo prossimo turno.",
    higherLevels: null,
    materialDesc: "un cartoccio di mais essiccato o paglia di grano"
  },

  // --- LEVEL 3 ---
  "Creeping Rot": {
    description: "Invii viticci di putrefazione nera e grigia contro un bersaglio che puoi vedere entro la gittata. Tre viticci poi balzano da quel bersaglio fino a tre altri bersagli a tua scelta, ognuno dei quali deve trovarsi entro 9 metri dal primo bersaglio. Un bersaglio può essere una creatura o una pianta non magica che non sia una creatura, come un albero o un arbusto. In ogni caso, ognuno può essere bersagliato da un solo viticcio. Un bersaglio che è una creatura deve effettuare un tiro salvezza Costituzione. Con un tiro salvezza fallito, subisce 3d8 danni necrotici e ha la condizione avvelenato per la durata. Con un tiro salvezza riuscito, subisce solo metà danno. Una creatura avvelenata in questo modo subisce 1d8 danni necrotici all'inizio di ciascuno dei suoi turni. Una creatura avvelenata ripete il tiro salvezza alla fine di ciascuno dei suoi turni, terminando l'incantesimo su di sé con un successo. Una creatura Pianta fallisce automaticamente il tiro salvezza iniziale, e una pianta non magica che non sia una creatura semplicemente appassisce e muore.",
    higherLevels: "Un viticcio aggiuntivo balza dal primo bersaglio a un altro bersaglio per ogni livello di slot superiore al 3°."
  },
  "Crimson Harvest": {
    description: "Un'onda di sangue si propaga da te in un'emanazione di 4,5 metri. Ogni creatura a tua scelta nell'onda deve effettuare un tiro salvezza Destrezza, subendo 3d10 danni necrotici con un fallimento, o metà con un successo. Se danneggi almeno una creatura di taglia Piccola o superiore, una creatura a tua scelta che puoi vedere all'interno dell'emanazione recupera punti ferita pari a metà del tiro per i danni.",
    higherLevels: "Il danno aumenta di 1d10 per ogni livello di slot superiore al 3°.",
    materialDesc: "una fiala di sangue"
  },
  "Crooked Ward": {
    description: "Tocchi una superficie immobile e marchi un simbolo che causa agonia nelle creature contorte. Una sfera invisibile di 9 metri di raggio si espande dal punto che hai toccato. Ogni aberrazione, folletto, immondo, mostruosità o non morto nella sfera ha svantaggio alle prove di caratteristica e ai tiri per colpire. Quando una creatura colpita entra nella sfera per la prima volta in un turno o vi inizia il proprio turno, deve riuscire in un tiro salvezza Saggezza o avere la condizione spaventato fino all'inizio del suo prossimo turno.",
    higherLevels: "Puoi mantenere la concentrazione su questo incantesimo più a lungo se lo lanci usando uno slot di livello 4 (fino a 1 ora) o 5 (fino a 8 ore). Se usi uno slot di livello 6+, l'incantesimo non richiede concentrazione e la durata diventa di 24 ore.",
    materialDesc: "una stella di vimini a cinque punte"
  },
  "Culling Sickle": {
    description: "Crei una falce spettrale che dura per la durata e può colpire i tuoi nemici. La falce appare fluttuando nel tuo spazio e si muove con te. Quando lanci questo incantesimo e come azione bonus in ciascuno dei tuoi turni, puoi dirigerla a volare e colpire una creatura entro 9 metri da te. Esegui un attacco a distanza con incantesimo. Se colpisci, il bersaglio subisce 2d8 danni necrotici, e tu ottieni punti ferita temporanei pari a metà del danno inflitto. Dopo che la falce ha colpito o mancato, ritorna a fluttuare nel tuo spazio.",
    higherLevels: "Il danno aumenta di 1d8 per ogni livello di slot superiore al 3°."
  },
  "Cursed Cacophony": {
    description: "Ti concentri su una creatura familiare che si trova sul tuo stesso piano di esistenza. Il bersaglio deve riuscire in un tiro salvezza Saggezza o essere maledetto per la durata. Una volta che un bersaglio fallisce il proprio tiro salvezza contro questo incantesimo, non puoi bersagliarlo con un lancio rituale dell'incantesimo per 24 ore. Mentre è maledetto, il bersaglio sente una musica inquietante e discordante e ha svantaggio ai Test del D20. La prima volta che il bersaglio fallisce un Test del D20 durante un turno, ripete il tiro salvezza contro questo incantesimo senza vantaggio o svantaggio, terminando anticipatamente l'incantesimo con un successo.",
    higherLevels: null,
    materialDesc: "uno spartito musicale"
  },
  "Harvest Moonglow": {
    description: "Richiami la luce della luna del raccolto per illuminare una sfera di 6 metri di raggio centrata su un punto entro la gittata. L'area è bagnata in una luce fioca argentea. Le creature e gli oggetti con la condizione invisibile nella luce diventano visibili come immagini traslucide e scintillanti. Quando uno dei tuoi alleati si trova nella luce, può usare un'azione bonus per assorbire parte della luce e ottenere 2d6 punti ferita temporanei.",
    higherLevels: "I punti ferita temporanei aumentano di 1d6 per ogni livello di slot superiore al 3°.",
    materialDesc: "un pezzo di pietra di luna"
  },
  "Isolation": {
    description: "Una creatura che puoi vedere entro la gittata deve riuscire in un tiro salvezza Saggezza o avere la mente avvolta nel terrore di un isolamento totale. Per la durata, tutte le altre creature hanno la condizione invisibile rispetto al bersaglio, attraverso cui il bersaglio non può vedere—neppure con Vista Cieca, Visione del Vero o magia come Vedere Invisibile—e il bersaglio non può percepire altre creature con nessuno dei suoi altri sensi. Il bersaglio si muove attorno alle altre creature, o altrimenti razionalizza il non muoversi attraverso spazi occupati da loro (come percependo una porta come chiusa o come muro se un'altra creatura sta in mezzo). Il bersaglio sente ancora dolore ma non può identificare la fonte di alcuna ferita causata da un'altra creatura. Il bersaglio ripete il tiro salvezza alla fine di ciascuno dei suoi turni, terminando l'incantesimo su di sé con un successo.",
    higherLevels: null,
    materialDesc: "un piccolo cubo di metallo"
  },
  "Martyr": {
    description: "Tocchi una creatura morta che è morta nell'ultimo minuto e trasferisci la tua essenza vitale in essa. Il bersaglio ritorna in vita con punti ferita pari al tuo totale di punti ferita attuale. Tu scendi immediatamente a 0 punti ferita (cosa che nulla può prevenire) con due tiri salvezza contro morte falliti, e devi immediatamente effettuare un tiro salvezza contro morte. Non puoi recuperare punti ferita o diventare stabile finché non hai effettuato questo tiro salvezza.",
    higherLevels: null,
    materialDesc: "un pugnale del valore di almeno 1 mr"
  },
  "Mist of Mourning": {
    description: "Evochi una sottile nebbia che prosciuga gioia e vigore in una sfera di 6 metri di raggio centrata su un punto entro la gittata. Ogni creatura nella nebbia quando appare, o quando si muove nella nebbia per la prima volta in un turno o vi termina il proprio turno, deve riuscire in un tiro salvezza Carisma o essere riempita di profonda malinconia fino alla fine del suo prossimo turno. La velocità di una creatura colpita è dimezzata, ha svantaggio ai tiri per colpire e sottrae 1d8 da tutti i suoi tiri per i danni.",
    higherLevels: null,
    materialDesc: "una fiala di lacrime"
  },
  "Sanctum of the Flock": {
    description: "Crei una sfera di luce debole e scintillante di 6 metri di raggio centrata su un punto entro la gittata. Tu e un numero di creature a tua scelta fino al tuo modificatore di caratteristica da incantatore (minimo 1 altra creatura) potete assorbire magia rinvigorente dalla sfera. Quando una qualsiasi delle creature scelte termina un riposo lungo nell'area, la sfera svanisce, e quelle creature ottengono 2d10 punti ferita temporanei, e per il resto della durata, hanno vantaggio alle prove di Carisma che usano una delle loro competenze in abilità. Le creature scelte che non terminano un riposo lungo nella sfera non ottengono alcun beneficio.",
    higherLevels: null,
    materialDesc: "argento in polvere del valore di almeno 25 mo, che l'incantesimo consuma"
  },
  "Scarlet Dawn": {
    description: "Una luce cremisi splende in un cilindro di 6 metri di raggio e 18 metri di altezza centrato su un punto entro la gittata. Ogni creatura in quell'area che non sia un costrutto o un non morto deve effettuare un tiro salvezza Costituzione, subendo 4d10 danni necrotici con un fallimento o metà con un successo. I costrutti e i non morti nell'area recuperano 4d10 punti ferita. Se l'area di questo incantesimo si sovrappone con un'area di oscurità creata da un incantesimo di livello 3 o inferiore, quell'altro incantesimo viene dissolto.",
    higherLevels: "Il danno aumenta di 1d10 e il livello di incantesimo che può essere dissolto aumenta di 1 per ogni livello di slot superiore al 3°."
  },
  "Shadow Drain": {
    description: "Sottrai vitalità e senso del sé attraverso le ombre delle creature vicine in un'emanazione di 4,5 metri originata da te. Quando lanci questo incantesimo, puoi designare creature affinché non vengano colpite. Ogni volta che un'altra creatura entra nell'emanazione o vi inizia il proprio turno, o quando l'emanazione entra nello spazio di una creatura, la creatura deve effettuare un tiro salvezza Carisma. Con un tiro salvezza fallito, la creatura subisce 2d6 danni necrotici e ha svantaggio ai tiri per colpire e alle prove di caratteristica fino alla fine del suo prossimo turno. Con un tiro salvezza riuscito, la creatura subisce solo metà danno. Una creatura effettua questo tiro salvezza solo una volta per turno.",
    higherLevels: "Il danno aumenta di 1d6 per ogni livello di slot superiore al 3°."
  },

  // --- LEVEL 4 ---
  "Buried Alive": {
    description: "Mandi i tuoi nemici nella tomba anche se non sono ancora morti. Una creatura che puoi vedere entro la gittata che si trova in piedi sul terreno deve effettuare un tiro salvezza Forza. Con un tiro salvezza fallito, il terreno si apre e inghiotte il bersaglio, seppellendolo fino a 3 metri di profondità. Mentre è sepolto, il bersaglio ha copertura totale, ha le condizioni afferrato e accecato, e non può respirare. Con un tiro salvezza riuscito, il bersaglio ha la condizione prono, e la sua velocità è 0 fino alla fine del suo prossimo turno. Una creatura sepolta può scavare per uscire dalla tomba usando la sua azione per effettuare una prova di Forza (Atletica) CD 15. Con un successo, scava 1,5 metri più vicino alla superficie. Se ha successo per 5 o più, raggiunge la superficie. Quando la creatura raggiunge la superficie, esce dal terreno con la condizione prono. Il bersaglio riesce automaticamente nel suo tiro salvezza se si trova su qualsiasi spessore di pietra o metallo, o almeno 5 cm di legno.",
    higherLevels: null,
    materialDesc: "un pizzico di terra di tomba"
  },
  "Call of the Wild": {
    description: "Scateni un ululato primordiale che richiama creature minori al tuo comando. Ogni bestia in un'emanazione di 30 metri originata da te quando lanci l'incantesimo deve effettuare un tiro salvezza Saggezza. Con un tiro salvezza fallito, un bersaglio ha la condizione ammaliato, può comprendere i tuoi comandi e li segue nel suo prossimo turno al meglio delle sue capacità. Nei tuoi turni successivi, puoi compiere un'azione magica per impartire un nuovo comando. Con un tiro salvezza riuscito, un bersaglio ha la condizione ammaliato fino all'inizio del tuo prossimo turno, ma non hai alcuna ulteriore capacità di comandarlo. L'ululato è udibile entro 90 metri.",
    higherLevels: null,
    materialDesc: "un pochino di pelo o pelle di animale"
  },
  "Consuming Pyre": {
    description: "Fai sì che una creatura che puoi vedere entro la gittata erompa in fiamme consumanti e implacabili. Il bersaglio deve effettuare un tiro salvezza Destrezza. Con un tiro salvezza fallito, il bersaglio subisce 2d8 danni da fuoco e 2d8 danni necrotici o radiosi (scelta al lancio dell'incantesimo), e le fiamme radiose persistono. Con un tiro salvezza riuscito, subisce solo metà danno. Mentre le fiamme persistono, la creatura subisce nuovamente il danno all'inizio di ciascuno dei suoi turni. Il bersaglio, o un'altra creatura a portata di mano del bersaglio, può compiere un'azione per consentire al bersaglio di ripetere il tiro salvezza, terminando l'incantesimo con un successo. Una creatura uccisa dai danni di questo incantesimo viene ridotta in cenere, insieme a qualsiasi equipaggiamento non magico che indossa o trasporta.",
    higherLevels: null
  },
  "Intrusive Despair": {
    description: "Maledici una creatura entro la gittata, riempiendole la mente di paranoia e disperazione striscianti. Quando il bersaglio compie un'azione di Attaccare o un'azione magica, deve riuscire in un tiro salvezza Saggezza o sprecare la sua azione. Una volta che il bersaglio riesce in tre tiri salvezza contro questo incantesimo, l'incantesimo termina.",
    higherLevels: null,
    materialDesc: "un fiore di tromba del diavolo"
  },
  "Murder of Crows": {
    description: "Evochi e scateni uno stormo di corvi mortali. Ogni creatura a tua scelta in un cono di 9 metri originato da te effettua un tiro salvezza Destrezza. Con un tiro salvezza fallito, il bersaglio subisce 5d6 danni da forza e ha la condizione accecato. Con un tiro salvezza riuscito, subisce solo metà danno. Una creatura accecata ripete il tiro salvezza alla fine di ciascuno dei suoi turni, terminando l'effetto su di sé con un successo. L'effetto termina anche se la creatura recupera punti ferita. I corvi si disperdono e svaniscono dopo aver colpito.",
    higherLevels: "Il danno aumenta di 1d6 per ogni livello di slot superiore al 4°.",
    materialDesc: "una piuma di corvo"
  },
  "Puppet Master": {
    description: "Una creatura che puoi vedere entro la gittata deve riuscire in un tiro salvezza Saggezza o avere la condizione ammaliato per la durata. Fili magici di marionetta si attaccano agli arti o al corpo della creatura ammaliata, e deve usare la sua azione nel suo turno per eseguire un attacco in mischia contro una creatura diversa da sé che scegli mentalmente, muovendosi per raggiungere il bersaglio se necessario. Il bersaglio può agire normalmente nel suo turno se non scegli un'altra creatura, o se la creatura non si trova a portata del bersaglio dopo che si è mosso. Il bersaglio ripete il tiro salvezza alla fine di ciascuno dei suoi turni, terminando l'incantesimo su di sé con un successo. Nei tuoi turni successivi, devi compiere un'azione bonus per mantenere il controllo del bersaglio, altrimenti l'incantesimo termina.",
    higherLevels: null,
    materialDesc: "un filo di marionetta"
  },
  "Sacrificial Siphon": {
    description: "Tocchi un'altra creatura e imponi una maledizione che drena la vitalità del bersaglio e la trasferisce a te. Il bersaglio deve effettuare un tiro salvezza Carisma. Con un tiro salvezza fallito, il bersaglio è maledetto per la durata. Mentre è maledetto, il bersaglio deve sottrarre 1d4 dai suoi tiri per colpire e dalle prove di caratteristica, e quando il bersaglio subisce danno, puoi compiere una reazione per ottenere 10 punti ferita temporanei. Con un tiro salvezza riuscito, ottieni 5 punti ferita temporanei, e il bersaglio deve sottrarre 1d4 dalle sue prove di caratteristica fino all'inizio del tuo prossimo turno.",
    higherLevels: null
  },
  "Sanctum of the Shepherd": {
    description: "Crei una sfera di luce debole e scintillante di 6 metri di raggio centrata su un punto entro la gittata. Tu e un numero di creature a tua scelta fino al tuo modificatore di caratteristica da incantatore (minimo 1 altra creatura) potete assorbire magia protettiva dalla sfera. Quando una qualsiasi delle creature scelte termina un riposo lungo nell'area, la sfera svanisce, e quelle creature ottengono un bonus di +1 alla CA per il resto della durata. Le creature scelte che non terminano un riposo lungo nella sfera non ottengono alcun beneficio.",
    higherLevels: null,
    materialDesc: "polvere di adamantio o di diamante del valore di almeno 200 mo, che l'incantesimo consuma"
  },

  // --- LEVEL 5 ---
  "Field of Reaping": {
    description: "Crei un campo ombroso che miete la forza vitale che si dissipa in un cubo di 9 metri originato da un punto entro la gittata. Una creatura ostile nei tuoi confronti nel campo quando appare, o quando entra nel campo per la prima volta in un turno o vi termina il proprio turno, è maledetta fino alla fine del suo prossimo turno. Mentre è maledetta, la prima volta che la creatura subisce danno durante un turno, subisce 1d6 danni necrotici aggiuntivi, e una creatura a tua scelta all'interno del campo che non sia maledetta da esso recupera punti ferita pari ai danni necrotici subiti.",
    higherLevels: "Il danno aumenta di 1d6 per ogni livello di slot superiore al 5°.",
    materialDesc: "un cartoccio di mais essiccato o pula di grano"
  },
  "Lucky Charm": {
    description: "Tocchi un oggetto non magico di taglia Minuscola, infondendolo con una porzione della tua fortuna per la durata. Mentre un'altra creatura trasporta l'oggetto, quella creatura ha vantaggio ai Test del D20, e tu hai svantaggio ai Test del D20.",
    higherLevels: null,
    materialDesc: "un quadrifoglio e una scheggia di specchio rotto"
  },
  "Mirrored Agony": {
    description: "La creatura scatenante effettua un tiro salvezza Saggezza. Con un tiro salvezza fallito, subisce una quantità di danni psichici pari ai danni inflitti al tuo alleato. Con un tiro salvezza riuscito, subisce metà danno.",
    higherLevels: null,
    materialDesc: "uno spillo o un ago"
  },

  // --- LEVEL 6 ---
  "Ghastly Charge": {
    description: "Richiami gli spiriti di cavalieri morti da tempo, che caricano in avanti da te in una linea lunga 27 metri e larga 6 metri, poi svaniscono. Ogni creatura a tua scelta nella linea deve effettuare un tiro salvezza Saggezza. Con un tiro salvezza fallito, un bersaglio subisce 5d12 danni necrotici, ha la condizione spaventato fino all'inizio del tuo prossimo turno, e deve immediatamente usare la sua reazione, se disponibile, per allontanarsi da te il più possibile, usando la rotta più sicura. Con un tiro salvezza riuscito, la creatura subisce solo metà danno.",
    higherLevels: "Il danno aumenta di 1d12 per ogni livello di slot superiore al 6°.",
    materialDesc: "un brandello di stendardo"
  },

  // ============================================================
  // TASHA'S CAULDRON OF EVERYTHING
  // ============================================================

  // --- CANTRIPS ---
  "Booming Blade": {
    name: "Lama Roboante",
    description: "Brandisci l'arma usata per il lancio dell'incantesimo ed esegui un attacco in mischia con essa contro una creatura entro 1,5 metri da te. Se colpisci, il bersaglio subisce gli effetti normali dell'attacco con l'arma e poi viene avvolto da energia tonante fino all'inizio del tuo prossimo turno. Se il bersaglio si muove volontariamente di 1,5 metri o più prima di allora, subisce 1d8 danni da tuono, e l'incantesimo termina.",
    higherLevels: "Al 5° livello, l'attacco in mischia infligge 1d8 danni da tuono aggiuntivi al bersaglio se colpisce, e il danno che il bersaglio subisce per essersi mosso aumenta a 2d8. Entrambi i tiri per i danni aumentano di 1d8 all'11° livello (2d8 e 3d8) e al 17° livello (3d8 e 4d8).",
    materialDesc: "un'arma da mischia del valore di almeno 1 ma"
  },
  "Green-Flame Blade": {
    name: "Lama Verdefiamma",
    description: "Brandisci l'arma usata per il lancio dell'incantesimo ed esegui un attacco in mischia con essa contro una creatura entro 1,5 metri da te. Se colpisci, il bersaglio subisce gli effetti normali dell'attacco con l'arma, e puoi far balzare fuoco verde dal bersaglio a un'altra creatura a tua scelta che puoi vedere entro 1,5 metri da essa. La seconda creatura subisce danni da fuoco pari al tuo modificatore di caratteristica da incantatore.",
    higherLevels: "Al 5° livello, l'attacco in mischia infligge 1d8 danni da fuoco aggiuntivi al bersaglio se colpisce, e i danni da fuoco alla seconda creatura aumentano a 1d8 + il tuo modificatore di caratteristica da incantatore. Entrambi i tiri per i danni aumentano di 1d8 all'11° livello (2d8 e 2d8) e al 17° livello (3d8 e 3d8).",
    materialDesc: "un'arma da mischia del valore di almeno 1 ma"
  },
  "Lightning Lure": {
    name: "Lenza Elettrizzante",
    description: "Crei una scarica di energia elettrica che colpisce una creatura a tua scelta che puoi vedere entro 4,5 metri da te. Il bersaglio deve riuscire in un tiro salvezza Forza o essere tirato fino a 3 metri in linea retta verso di te e poi subire 1d8 danni da fulmine se si trova entro 1,5 metri da te.",
    higherLevels: "Il danno aumenta di 1d8 al raggiungimento del 5° livello (2d8), 11° livello (3d8) e 17° livello (4d8)."
  },
  "Mind Sliver": {
    name: "Scheggia della Mente",
    description: "Conficchi una scheggia disorientante di energia psichica nella mente di una creatura che puoi vedere entro la gittata. Il bersaglio deve riuscire in un tiro salvezza Intelligenza o subire 1d6 danni psichici e sottrarre 1d4 dal prossimo tiro salvezza che effettua prima della fine del tuo prossimo turno.",
    higherLevels: "Il danno aumenta di 1d6 al raggiungimento del 5° livello (2d6), 11° livello (3d6) e 17° livello (4d6)."
  },
  "Sword Burst": {
    name: "Turbine di Spade",
    description: "Crei un cerchio momentaneo di lame spettrali che ti circondano. Ogni altra creatura entro 1,5 metri da te deve riuscire in un tiro salvezza Destrezza o subire 1d6 danni da forza.",
    higherLevels: "Il danno aumenta di 1d6 al raggiungimento del 5° livello (2d6), 11° livello (3d6) e 17° livello (4d6)."
  },

  // --- LEVEL 1 ---
  "Tasha's Caustic Brew": {
    name: "Miscela Caustica di Tasha",
    description: "Un getto di acido emana da te in una linea lunga 9 metri e larga 1,5 metri in una direzione a tua scelta. Ogni creatura nella linea deve riuscire in un tiro salvezza Destrezza o essere ricoperta di acido per la durata dell'incantesimo o finché una creatura non usa la sua azione per raschiare o lavare via l'acido da sé o da un'altra creatura. Una creatura ricoperta di acido subisce 2d4 danni acidi all'inizio di ciascuno dei suoi turni.",
    higherLevels: "Il danno aumenta di 2d4 per ogni livello di slot superiore al 1°.",
    materialDesc: "un pochino di cibo marcio"
  },

  // --- LEVEL 2 ---
  "Summon Beast": {
    name: "Evocare Bestia",
    description: "Richiami uno spirito ferino. Si manifesta in uno spazio non occupato che puoi vedere entro la gittata. Questa forma corporea usa lo statblock dello Spirito Ferino. Quando lanci l'incantesimo, scegli un ambiente: aria, terra o acqua. La creatura assomiglia a un animale a tua scelta nativo dell'ambiente scelto, che determina certi tratti nel suo statblock. La creatura scompare quando scende a 0 punti ferita o quando l'incantesimo termina. La creatura è alleata di te e dei tuoi compagni. In combattimento, la creatura condivide il tuo conteggio di iniziativa, ma compie il proprio turno immediatamente dopo il tuo. Obbedisce ai tuoi comandi verbali (nessuna azione richiesta da parte tua). Se non ne impartisci, compie l'azione di Schivare e usa il suo movimento per evitare il pericolo.",
    higherLevels: "Quando lanci questo incantesimo usando uno slot di 3° livello o superiore, usa il livello superiore ovunque appaia il livello dell'incantesimo nello statblock.",
    materialDesc: "una piuma, un ciuffo di pelliccia e una coda di pesce dentro una ghianda dorata del valore di almeno 200 mo"
  },
  "Tasha's Mind Whip": {
    name: "Scudiscio Mentale di Tasha",
    description: "Colpisci psichicamente una creatura che puoi vedere entro la gittata. Il bersaglio deve effettuare un tiro salvezza Intelligenza. Con un tiro salvezza fallito, il bersaglio subisce 3d6 danni psichici e non può eseguire una reazione fino alla fine del suo prossimo turno. Inoltre, nel suo prossimo turno, deve scegliere se ottenere un movimento, un'azione o un'azione bonus; ne ottiene solo uno dei tre. Con un tiro salvezza riuscito, il bersaglio subisce metà danno e non subisce nessun altro effetto dell'incantesimo.",
    higherLevels: "Puoi bersagliare una creatura aggiuntiva per ogni livello di slot superiore al 2°. Le creature devono trovarsi entro 9 metri l'una dall'altra quando le bersagli."
  },

  // --- LEVEL 3 ---
  "Intellect Fortress": {
    name: "Fortezza della Mente",
    description: "Per la durata, tu o una creatura consenziente che puoi vedere entro la gittata avete resistenza ai danni psichici e vantaggio ai tiri salvezza Intelligenza, Saggezza e Carisma.",
    higherLevels: "Puoi bersagliare una creatura aggiuntiva per ogni livello di slot superiore al 3°. Le creature devono trovarsi entro 9 metri l'una dall'altra quando le bersagli."
  },
  "Spirit Shroud": {
    name: "Sudario Spirituale",
    description: "Richiami spiriti dei morti, che ti svolazzano attorno per la durata dell'incantesimo. Gli spiriti sono intangibili e invulnerabili. Fino al termine dell'incantesimo, qualsiasi attacco che esegui infligge 1d8 danni aggiuntivi quando colpisce una creatura entro 3 metri da te. Questo danno è radioso, necrotico o da freddo (a tua scelta al lancio dell'incantesimo). Qualsiasi creatura che subisce questo danno non può recuperare punti ferita fino all'inizio del tuo prossimo turno. Inoltre, qualsiasi creatura a tua scelta che puoi vedere che inizia il proprio turno entro 3 metri da te ha la velocità ridotta di 3 metri fino all'inizio del tuo prossimo turno.",
    higherLevels: "Il danno aumenta di 1d8 per ogni due livelli di slot superiori al 3°."
  },
  "Summon Fey": {
    name: "Evoca Folletto",
    description: "Richiami uno spirito folletto. Si manifesta in uno spazio non occupato che puoi vedere entro la gittata. Questa forma corporea usa lo statblock dello Spirito Folletto. Quando lanci l'incantesimo, scegli un umore: Furioso, Allegro o Burlone. La creatura assomiglia a una creatura folletto a tua scelta segnata dall'umore scelto, che determina uno dei tratti nel suo statblock. La creatura scompare quando scende a 0 punti ferita o quando l'incantesimo termina. La creatura è alleata di te e dei tuoi compagni. In combattimento, la creatura condivide il tuo conteggio di iniziativa, ma compie il proprio turno immediatamente dopo il tuo. Obbedisce ai tuoi comandi verbali (nessuna azione richiesta da parte tua). Se non ne impartisci, compie l'azione di Schivare e usa il suo movimento per evitare il pericolo.",
    higherLevels: "Quando lanci questo incantesimo usando uno slot di 4° livello o superiore, usa il livello superiore ovunque appaia il livello dell'incantesimo nello statblock.",
    materialDesc: "un fiore dorato del valore di almeno 300 mo"
  },
  "Summon Shadowspawn": {
    name: "Evoca Bestia d'Ombra",
    description: "Richiami uno spirito ombroso. Si manifesta in uno spazio non occupato che puoi vedere entro la gittata. Questa forma corporea usa lo statblock dello Spirito d'Ombra. Quando lanci l'incantesimo, scegli un'emozione: Furia, Disperazione o Paura. La creatura assomiglia a un bipede deforme segnato dall'emozione scelta, che determina certi tratti nel suo statblock. La creatura scompare quando scende a 0 punti ferita o quando l'incantesimo termina. La creatura è alleata di te e dei tuoi compagni. In combattimento, la creatura condivide il tuo conteggio di iniziativa, ma compie il proprio turno immediatamente dopo il tuo. Obbedisce ai tuoi comandi verbali (nessuna azione richiesta da parte tua). Se non ne impartisci, compie l'azione di Schivare e usa il suo movimento per evitare il pericolo.",
    higherLevels: "Quando lanci questo incantesimo usando uno slot di 4° livello o superiore, usa il livello superiore ovunque appaia il livello dell'incantesimo nello statblock.",
    materialDesc: "lacrime dentro una gemma del valore di almeno 300 mo"
  },
  "Summon Undead": {
    name: "Evoca Non Morto",
    description: "Richiami uno spirito non morto. Si manifesta in uno spazio non occupato che puoi vedere entro la gittata. Questa forma corporea usa lo statblock dello Spirito Non Morto. Quando lanci l'incantesimo, scegli la forma della creatura: Spettrale, Putrida o Scheletrica. Lo spirito assomiglia a una creatura non morta con la forma scelta, che determina certi tratti nel suo statblock. La creatura scompare quando scende a 0 punti ferita o quando l'incantesimo termina. La creatura è alleata di te e dei tuoi compagni. In combattimento, la creatura condivide il tuo conteggio di iniziativa, ma compie il proprio turno immediatamente dopo il tuo. Obbedisce ai tuoi comandi verbali (nessuna azione richiesta da parte tua). Se non ne impartisci, compie l'azione di Schivare e usa il suo movimento per evitare il pericolo.",
    higherLevels: "Quando lanci questo incantesimo usando uno slot di 4° livello o superiore, usa il livello superiore ovunque appaia il livello dell'incantesimo nello statblock.",
    materialDesc: "un teschio dorato del valore di almeno 300 mo"
  },

  // --- LEVEL 4 ---
  "Summon Aberration": {
    name: "Evoca Aberrazione",
    description: "Richiami uno spirito aberrante. Si manifesta in uno spazio non occupato che puoi vedere entro la gittata. Questa forma corporea usa lo statblock dello Spirito Aberrante. Quando lanci l'incantesimo, scegli Beholderkin, Slaad o Star Spawn. La creatura assomiglia a un'aberrazione di quel tipo, che determina certi tratti nel suo statblock. La creatura scompare quando scende a 0 punti ferita o quando l'incantesimo termina. La creatura è alleata di te e dei tuoi compagni. In combattimento, la creatura condivide il tuo conteggio di iniziativa, ma compie il proprio turno immediatamente dopo il tuo. Obbedisce ai tuoi comandi verbali (nessuna azione richiesta da parte tua). Se non ne impartisci, compie l'azione di Schivare e usa il suo movimento per evitare il pericolo.",
    higherLevels: "Quando lanci questo incantesimo usando uno slot di 5° livello o superiore, usa il livello superiore ovunque appaia il livello dell'incantesimo nello statblock.",
    materialDesc: "un tentacolo sotto aceto e un bulbo oculare in una fiala intarsiata di platino del valore di almeno 400 mo"
  },
  "Summon Construct": {
    name: "Evoca Costrutto",
    description: "Richiami lo spirito di un costrutto. Si manifesta in uno spazio non occupato che puoi vedere entro la gittata. Questa forma corporea usa lo statblock dello Spirito Costrutto. Quando lanci l'incantesimo, scegli un materiale: Argilla, Metallo o Pietra. La creatura assomiglia a un golem o a un modron (a tua scelta) fatto del materiale scelto, che determina certi tratti nel suo statblock. La creatura scompare quando scende a 0 punti ferita o quando l'incantesimo termina. La creatura è alleata di te e dei tuoi compagni. In combattimento, la creatura condivide il tuo conteggio di iniziativa, ma compie il proprio turno immediatamente dopo il tuo. Obbedisce ai tuoi comandi verbali (nessuna azione richiesta da parte tua). Se non ne impartisci, compie l'azione di Schivare e usa il suo movimento per evitare il pericolo.",
    higherLevels: "Quando lanci questo incantesimo usando uno slot di 5° livello o superiore, usa il livello superiore ovunque appaia il livello dell'incantesimo nello statblock.",
    materialDesc: "uno scrigno di pietra e metallo decorato del valore di almeno 400 mo"
  },
  "Summon Elemental": {
    name: "Evoca Elementale",
    description: "Richiami uno spirito elementale. Si manifesta in uno spazio non occupato che puoi vedere entro la gittata. Questa forma corporea usa lo statblock dello Spirito Elementale. Quando lanci l'incantesimo, scegli un elemento: Aria, Terra, Fuoco o Acqua. La creatura assomiglia a una forma bipede avvolta dall'elemento scelto, che determina certi tratti nel suo statblock. La creatura scompare quando scende a 0 punti ferita o quando l'incantesimo termina. La creatura è alleata di te e dei tuoi compagni. In combattimento, la creatura condivide il tuo conteggio di iniziativa, ma compie il proprio turno immediatamente dopo il tuo. Obbedisce ai tuoi comandi verbali (nessuna azione richiesta da parte tua). Se non ne impartisci, compie l'azione di Schivare e usa il suo movimento per evitare il pericolo.",
    higherLevels: "Quando lanci questo incantesimo usando uno slot di 5° livello o superiore, usa il livello superiore ovunque appaia il livello dell'incantesimo nello statblock.",
    materialDesc: "aria, un sassolino, cenere e acqua dentro una fiala intarsiata d'oro del valore di almeno 400 mo"
  },

  // --- LEVEL 5 ---
  "Summon Celestial": {
    name: "Evoca Celestiale",
    description: "Richiami uno spirito celestiale. Si manifesta in una forma angelica in uno spazio non occupato che puoi vedere entro la gittata. Questa forma corporea usa lo statblock dello Spirito Celestiale. Quando lanci l'incantesimo, scegli Vendicatore o Difensore. La tua scelta determina l'attacco della creatura nel suo statblock. La creatura scompare quando scende a 0 punti ferita o quando l'incantesimo termina. La creatura è alleata di te e dei tuoi compagni. In combattimento, la creatura condivide il tuo conteggio di iniziativa, ma compie il proprio turno immediatamente dopo il tuo. Obbedisce ai tuoi comandi verbali (nessuna azione richiesta da parte tua). Se non ne impartisci, compie l'azione di Schivare e usa il suo movimento per evitare il pericolo.",
    higherLevels: "Quando lanci questo incantesimo usando uno slot di 6° livello o superiore, usa il livello superiore ovunque appaia il livello dell'incantesimo nello statblock.",
    materialDesc: "un reliquiario dorato del valore di almeno 500 mo"
  },

  // --- LEVEL 6 ---
  "Summon Fiend": {
    name: "Evoca Immondo",
    description: "Richiami uno spirito immondo. Si manifesta in uno spazio non occupato che puoi vedere entro la gittata. Questa forma corporea usa lo statblock dello Spirito Immondo. Quando lanci l'incantesimo, scegli Demone, Diavolo o Yugoloth. La creatura assomiglia a un immondo del tipo scelto, che determina certi tratti nel suo statblock. La creatura scompare quando scende a 0 punti ferita o quando l'incantesimo termina. La creatura è alleata di te e dei tuoi compagni. In combattimento, la creatura condivide il tuo conteggio di iniziativa, ma compie il proprio turno immediatamente dopo il tuo. Obbedisce ai tuoi comandi verbali (nessuna azione richiesta da parte tua). Se non ne impartisci, compie l'azione di Schivare e usa il suo movimento per evitare il pericolo.",
    higherLevels: "Quando lanci questo incantesimo usando uno slot di 7° livello o superiore, usa il livello superiore ovunque appaia il livello dell'incantesimo nello statblock.",
    materialDesc: "sangue umanoide dentro una fiala di rubino del valore di almeno 600 mo"
  },
  "Tasha's Otherworldly Guise": {
    name: "Abito Ultraterreno di Tasha",
    description: "Pronunciando un incantesimo, attingi alla magia dei Piani Inferiori o dei Piani Superiori (a tua scelta) per trasformarti. Ottieni i seguenti benefici fino al termine dell'incantesimo: sei immune ai danni da fuoco e da veleno (Piani Inferiori) o ai danni radiosi e necrotici (Piani Superiori). Sei immune alla condizione avvelenato (Piani Inferiori) o alla condizione ammaliato (Piani Superiori). Ali spettrali appaiono sulla tua schiena, dandoti una velocità di volo di 12 metri. Hai un bonus di +2 alla CA. Tutti i tuoi attacchi con armi sono magici, e quando esegui un attacco con un'arma, puoi usare il tuo modificatore di caratteristica da incantatore al posto della Forza o della Destrezza per i tiri per colpire e i tiri per i danni. Puoi attaccare due volte, invece di una, quando compi l'azione di Attaccare nel tuo turno (ignorato se hai già Attacco Extra o simile).",
    higherLevels: null,
    materialDesc: "un oggetto inciso con un simbolo dei Piani Esterni, del valore di almeno 500 mo"
  },

  // --- LEVEL 7 ---
  "Dream of the Blue Veil": {
    name: "Sogno del Velo Celeste",
    description: "Tu e fino a otto creature consenzienti entro la gittata cadete incoscienti per la durata dell'incantesimo e sperimentate visioni di un altro mondo sul Piano Materiale, come Oerth, Toril, Krynn o Eberron. Se l'incantesimo raggiunge la sua piena durata, le visioni si concludono con ognuno di voi che incontra e tira indietro un misterioso velo blu. L'incantesimo termina quindi con voi mentalmente e fisicamente trasportati nel mondo che era nelle visioni. Per lanciare questo incantesimo, devi avere un oggetto magico originato sul mondo che desideri raggiungere, e devi essere consapevole dell'esistenza del mondo. La tua destinazione nell'altro mondo è una posizione sicura entro 1,5 km dal luogo in cui l'oggetto magico è stato creato. In alternativa, puoi lanciare l'incantesimo se una delle creature colpite è nata nell'altro mondo. L'incantesimo termina anticipatamente per una creatura se quella creatura subisce qualsiasi danno, e la creatura non viene trasportata. Se tu subisci qualsiasi danno, l'incantesimo termina per te e per tutte le altre creature, senza che nessuno di voi venga trasportato.",
    higherLevels: null,
    materialDesc: "un oggetto magico o una creatura consenziente proveniente dal mondo di destinazione"
  },

  // --- LEVEL 9 ---
  "Blade of Disaster": {
    name: "Lama del Disastro",
    description: "Crei una fenditura planare a forma di lama lunga circa 90 cm in uno spazio non occupato che puoi vedere entro la gittata. La lama dura per la durata. Quando lanci questo incantesimo, puoi eseguire fino a due attacchi in mischia con incantesimo con la lama, ognuno contro una creatura, un oggetto sciolto o una struttura entro 1,5 metri dalla lama. Se colpisci, il bersaglio subisce 4d12 danni da forza. Questo attacco mette a segno un colpo critico se il numero sul d20 è 18 o superiore. Con un colpo critico, la lama infligge 8d12 danni da forza aggiuntivi (per un totale di 12d12 danni da forza). Come azione bonus nel tuo turno, puoi muovere la lama fino a 9 metri verso uno spazio non occupato che puoi vedere e poi eseguire fino a due attacchi in mischia con incantesimo con essa nuovamente. La lama può attraversare innocuamente qualsiasi barriera, incluso un Muro di Forza.",
    higherLevels: null
  }
};
