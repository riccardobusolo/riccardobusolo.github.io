/* ============================================================================
   BESTIARIO — strumento libreria di mostri (Crooked Moon)
   ----------------------------------------------------------------------------
   I mostri sono oggetti "enemy-shaped" (stessi campi dei Nemici / scheda nemico)
   con in più un `id`. Sono salvati in localStorage sotto 'cm_bestiary'.
   La libreria parte vuota ed è interamente gestita dall'utente.

   Integrazione con l'app principale (index.html) tramite questi ponti:
     - window.cmOpenMonsterEditor(obj, saveCb)  → apre la scheda nemico puntata
       sul mostro; ogni modifica viene auto-salvata chiamando saveCb.
     - window.cmAddEnemyFromMonster(monster)    → copia il mostro tra i Nemici.
     - window.cmBestiaryUpsertFromEnemy(enemy)  → (lato index) salva un Nemico
       nella libreria; chiama cmBestiary.upsert.

   API pubblica esposta: window.cmBestiary
   UI renderizzata dentro #bestiaryBody (corpo della finestra winBestiary).
   ========================================================================== */
(function () {
  var KEY = 'cm_bestiary';

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { return []; } }
  function persist() { localStorage.setItem(KEY, JSON.stringify(data)); }

  /* ----------------------------------------------------------------------------
     PRESET — mostri di partenza. Tutti i campi sono mappati 1:1 sullo schema
     della scheda nemico (enemy-shaped) così il trasferimento "Aggiungi ai
     Nemici" non perde nulla. I tiri salvezza/abilità sono override solo dove il
     valore differisce dal modificatore di caratteristica; gli XP derivano dalla
     CR. La lore va in `notes`, il tesoro in `drop`.
     ------------------------------------------------------------------------- */
  var AARAKOCRA_LORE = 'Gli aarakocra sono esseri simili ad uccelli che solcano i cieli di innumerevoli mondi e le infinite distese del Piano Elementale dell\'Aria. Spesso ricordano gli uccelli comuni delle regioni in cui vivono: alcuni assomigliano a falchi o condor, mentre altri ricordano colibrì o archeotteri.\n\nIn molte terre, gli aarakocra narrano le gesta dei loro antichi eroi che combatterono la malvagia Regina del Caos Alato insieme ai misteriosi Duchi del Vento di Aaqa.';
  var ANIMATI_LORE = 'La magia può manipolare oggetti ordinari, costringendoli a svolgere semplici compiti. Questi oggetti animati possono apparire come innocui utensili o decorazioni capaci però di difendere il loro creatore.\n\nEssi seguono semplici istruzioni impartite dalla forza o dall\'incantatore che li ha creati. Se lasciati senza supervisione, possono continuare a proteggere una zona per anni oppure ripetere lo stesso compito fino a consumarsi.\n\n— Catalizzatori degli Oggetti Animati (d10) —\n1. Un Celestiale o un Immondo che usa l\'oggetto per proteggere o tormentare un mortale.\n2. Una combinazione di magia e tecnologia, come alchimia o scienza aliena.\n3. L\'essenza di qualcuno trasformata da un ingannatore soprannaturale.\n4. Fate impegnate nei loro giochi o intrighi.\n5. Il caso, dopo che l\'oggetto ha acquisito una parvenza di vita dopo un secolo di utilizzo.\n6. Un incantatore che necessita di una guardia o di un servitore.\n7. Il canto di uno strumento magico.\n8. Uno spirito che possiede l\'oggetto.\n9. Magia selvaggia, un incantesimo fallito o un artefatto caotico.\n10. La volontà di una potente entità psionica.';
  var PIANTE_LORE = 'La magia può infondere nelle piante mobilità, intelligenza e perfino una voce. Incantesimi come Risveglio (Awaken) o l\'influenza di altri piani di esistenza possono dare vita alla vegetazione comune, mentre alcune piante straordinarie possiedono naturalmente tali caratteristiche.';
  var BECCO_LORE = 'I becchi d\'ascia sono creature simili a grandi uccelli incapaci di volare, riconoscibili per il caratteristico becco a forma di lama d\'ascia.\n\nPredatori rapidi e aggressivi, inseguono le proprie prede e usano i becchi per squarciare il fogliame che protegge le vittime. Vivono in ambienti molto diversi: esemplari dal piumaggio variopinto percorrono le pianure tropicali, mentre quelli ricoperti di piume chiare e folte cacciano nelle gelide tundre.\n\nI becchi d\'ascia sono difficili da addestrare, ma gli esemplari nati e cresciuti in cattività possono diventare cavalcature affidabili.';
  var AZER_LORE = 'Gli azer sono esseri di bronzo vivente che lavorano gli elementi primordiali della creazione per forgiare armi e meraviglie magiche nelle più grandi fornaci del multiverso.';
  var BANDITI_LORE = 'I banditi utilizzano la minaccia della violenza per ottenere ciò che desiderano.\n\nTra questi criminali si trovano membri di bande, desperados e mercenari senza legge. Tuttavia, non tutti i banditi sono mossi dall\'avidità: alcuni vengono spinti verso una vita criminale da leggi ingiuste, dalla disperazione o dalle minacce di capi spietati.';
  var BANDITI_MOTIV = 'Motivazioni dei Banditi (tira 1d6 o scegli):\n1) Combatte soltanto contro gli oppressori.\n2) È un ex soldato abbandonato dalla propria nazione e ora si prende ciò che ritiene gli fosse stato promesso.\n3) Fa parte di una banda che considera nemici tutti coloro che non ne fanno parte.\n4) Serve controvoglia un leader malvagio.\n5) Lavora segretamente per un governo o un governante regionale allo scopo di diffondere il caos.\n6) Prende ciò che gli serve per sopravvivere.';
  var BANDITI_TAIL = BANDITI_LORE + '\n\n' + BANDITI_MOTIV;
  var BERSERKER_LORE = 'Consumati dall\'adrenalina della battaglia, i berserker sono invasori spericolati, combattenti da arena e guerrieri feroci che vivono per il conflitto. La loro furia li rende avversari temibili, capaci di ignorare il dolore e combattere fino all\'ultimo respiro.';
  var DRAGHI_NERI_LORE = 'I draghi neri traggono piacere dalla sofferenza e dalla rovina. A differenza di altri draghi cromatici, che tramano per ottenere potere e ricchezze, essi desiderano distruggere tutto ciò che vedono e dominare le macerie che restano.\n\nSono creature terrificanti, caratterizzate da corna ricurve e da visi scheletrici che ricordano teschi demoniaci. Prediligono paludi stagnanti, rovine in rovina e luoghi corrotti dalla magia o dal degrado ambientale. Il loro soffio acido deturpa il territorio, consumando antiche statue e lasciando nella natura ferite permanenti.\n\nI draghi neri accumulano simboli di speranza infranta e reliquie di imperi caduti. Più un tesoro è desiderato o prezioso, maggiore è il piacere che provano nel possederlo, soprattutto se sono stati loro a causarne la perdita.';
  var BLIGHTS_LORE = 'I blights sono piante maligne nate da un male profondamente radicato. Le loro forme nodose e deformi presentano tratti inquietanti che ricordano arti umani e fauci fameliche. Si nascondono tra la vegetazione comune e tendono imboscate a tutte le creature che non appartengono al regno vegetale.\n\nSebbene alcuni blights agiscano autonomamente, la maggior parte serve le forze oscure che li hanno generati oppure creature malvagie capaci di dominare la natura. La magia che li crea spesso contamina anche la flora circostante, facendo proliferare rovi, liane e alberi contorti che invadono sentieri e campi, soffocano pozzi e ruscelli e costringono gli animali ad abbandonare il proprio habitat naturale.\n\nPer questo motivo, la comparsa dei blights è spesso il primo segnale di una corruzione più grande che si sta diffondendo.';
  var DRAGHI_BLU_LORE = 'Arroganti e imperiosi, i draghi blu sono draghi cromatici che bramano il controllo e raccolgono seguaci proprio come altri draghi accumulano tesori. Cercano di trasformare i propri territori in imperi, domini che intere nazioni temano.\n\nI draghi blu possiedono tratti affilati, corna perforanti e scaglie che variano dal colore dello zaffiro alle tonalità dei cieli tempestosi. Vivono nei deserti e nelle terre aride, in particolare nelle regioni caratterizzate da spettacolari pinnacoli rocciosi dai quali possono osservare per chilometri.\n\nScelgono di costruire le loro tane vicino a luoghi dal forte valore simbolico, come fortezze giganti abbandonate, colossi di imperi caduti o monumenti eretti dai loro seguaci.\n\nLe insegne del potere sovrano e i capolavori artistici riempiono i tesori dei draghi blu. Questi draghi non mostrano interesse per tesori comuni o imperfetti: preferiscono gemme uniche nel loro genere, corone appartenute a sovrani decaduti e oggetti magici capaci di diffondere la loro influenza.';
  var DRAGHI_BLU_TANA = '— Tane dei Draghi Blu —\nI draghi blu vivono in terre aride. Le loro tane possono essere trappole mortali progettate per intrappolare gli invasori oppure ostentate fortezze da cui pianificano la propria dominazione. La regione entro 1 miglio dalla tana di un drago blu adulto o antico viene alterata dalla sua presenza, producendo i seguenti effetti regionali.\n\nVoragini: ogni volta che una creatura nell\'area (diversa dal drago e dai suoi alleati) completa un Riposo Lungo, tira 1d20; con un 1 una voragine si apre sotto di essa, che deve superare un Tiro Salvezza su Destrezza CD 15 oppure precipitare per 2d4 × 10 piedi.\n\nTempeste Malevole: tempeste di sabbia e temporali infuriano entro 1 miglio dalla tana e l\'area è Leggermente Oscurata.\n\nSe il drago muore o sposta la propria tana altrove, questi effetti terminano immediatamente.';
  var DRAGHI_OTTONE_LORE = 'Socievoli ed estroversi, i draghi d\'ottone adorano condividere conoscenze e storie. Sebbene questi draghi metallici prediligano le terre aride, percorrono volentieri grandi distanze per visitare creature amichevoli, trasmettere ciò che hanno imparato e raccogliere notizie.\n\nPur essendo di buon cuore, i draghi d\'ottone non evitano il combattimento quando necessario, ostacolando i nemici con sonno magico e bruciandoli con fiamme roventi.\n\nPrediligono i climi caldi, in particolare steppe e deserti rocciosi o sabbiosi, e di solito dimorano vicino a importanti crocevia o oasi frequentate da viaggiatori. Amano assumere forme umanoidi, travestendosi da mercanti itineranti, studiosi, narratori o chiunque altro sia interessato alle storie altrui.\n\nI draghi d\'ottone collezionano oggetti eclettici. Sebbene possano sembrare semplici cianfrusaglie, ciascuno di essi fa parte di una storia: un ricordo nostalgico o la prova di una leggenda ormai divenuta mito. Il cappello di un vecchio amico e la corona dell\'ultimo sovrano di una dinastia dimenticata potrebbero occupare lo stesso scaffale nel tesoro di un drago d\'ottone.';
  var DRAGHI_OTTONE_TANA = '— Tane dei Draghi d\'Ottone —\nI draghi d\'ottone vivono normalmente in caverne segrete e canyon vicini a rotte molto frequentate. La regione entro 1 miglio dalla tana di un drago d\'ottone adulto o antico viene alterata dalla sua presenza, creando i seguenti effetti regionali.\n\nMiraggi: nella sua tana il drago può lanciare Immagine Maggiore (senza componenti materiali, con la stessa caratteristica da incantatore della sua capacità Incantesimi); la gittata diventa 1 miglio e il drago non ha bisogno di vedere il punto in cui compare l\'illusione.\n\nAcqua Ristoratrice: l\'acqua entro 1 miglio dalla tana è magicamente rinvigorente; una creatura che la beve ottiene 2d4 Punti Ferita Temporanei e il drago viene immediatamente a conoscenza della sua presenza.\n\nSe il drago muore o sposta la propria tana altrove, questi effetti terminano immediatamente.';
  var DRAGHI_BRONZO_LORE = 'Dove dimorano i draghi di bronzo, le meraviglie prosperano. Immaginativi ma riflessivi, questi draghi metallici lavorano per raggiungere la grandezza e aiutano gli altri a realizzare tutto il proprio potenziale.\n\nEssi si sforzano di preservare le innovazioni, dalle opere delle civiltà passate alle nuove scoperte, e condividono ampiamente tali conoscenze. Quando hanno a che fare con creature dalla vita più breve, i draghi di bronzo preferiscono conquistarle attraverso il dialogo e la formazione, ma non esitano a combattere quando i malvagi impediscono agli altri di raggiungere il proprio potenziale.\n\nI draghi di bronzo amano il potere e le infinite possibilità offerte dal mare e spesso stabiliscono le proprie tane in luoghi di bellezza naturale o presso comunità che desiderano proteggere. Nelle loro dimore accumulano oggetti che ritengono potranno essere utili un giorno. Recuperano inoltre tesori perduti in mare, riportando alla luce ricchezze e navi affondate.';
  var DRAGHI_BRONZO_TANA = '— Tane dei Draghi di Bronzo —\nI draghi di bronzo costruiscono normalmente le proprie dimore vicino al mare o sotto di esso. La regione entro 1 miglio dalla tana di un drago di bronzo adulto o antico è alterata dalla sua presenza, producendo i seguenti effetti regionali.\n\nCorrenti Galleggianti: le creature entro 1 miglio dalla tana che non possiedono una velocità di nuotare ignorano il costo aggiuntivo di movimento mentre nuotano.\n\nSole e Tempeste: nella sua tana il drago può lanciare Controllare Tempo Atmosferico (senza componenti materiali, con la stessa caratteristica da incantatore della sua azione Incantesimi) e può controllare il tempo atmosferico entro 1 miglio dalla tana, dentro o fuori di essa.\n\nSe il drago muore o trasferisce la propria tana altrove, questi effetti terminano immediatamente.';
  var BUGBEAR_LORE = 'I bugbear incarnano la paura delle terre selvagge e la minaccia dei luoghi naturali. Sono notoriamente furtivi e i nemici che si avventurano nei loro territori spesso scompaiono senza lasciare traccia.';
  var BULETTE_LORE = 'Conosciute anche come "squali di terra", le bulette sono predatori ossessivi che scavano sottoterra, balzano sopra gli ostacoli e irrompono attraverso di essi all\'inseguimento delle loro prede. Scavano rapidamente appena sotto la superficie del terreno. Quando percepiscono un movimento, erompono dal sottosuolo tentando di catturare le prede nelle loro enormi fauci.';
  var BULLYWUG_LORE = 'I bullywug, incarnazioni fatate delle terre paludose, proteggono le selvagge distese fangose e si considerano favoriti dal cosmo per tale ruolo. Queste creature delle dimensioni di un umano, simili a rospi o rane, intrattengono stretti rapporti con le altre creature della palude.';
  var CENTAURI_LORE = 'I centauri sono difensori delle foreste, delle pianure e dei luoghi intrisi di potere primordiale. Con la parte superiore del corpo simile a quella degli umani e la parte inferiore simile a quella dei cavalli, i centauri si lanciano in battaglia contro chiunque minacci i loro alleati.';
  var COCKATRICE_LORE = 'Le cockatrici combinano le caratteristiche di galli iracondi e rettili affamati. Pietrificano coloro che mordono: il più lieve dei loro colpi di becco può trasformare la preda in pietra.';
  var DRAGHI_RAME_LORE = 'Instancabilmente amichevoli e curiosi, la maggior parte dei draghi di rame vede il mondo come un luogo di meraviglie e possibilità infinite. Questi draghi socievoli sono fonti di pazienza, ospitalità e umorismo e cercano di migliorare la vita — o almeno l\'umore — di coloro con cui interagiscono. Se costretti a combattere per difendere sé stessi o i loro amici, preferiscono usare il soffio rallentante e gli attacchi fisici per sottomettere gli avversari; solo in casi di estremo pericolo o forte emozione ricorrono al loro mortale soffio acido.\n\nI draghi di rame vivono tipicamente in caverne tra colline pittoresche e formazioni rocciose, soprattutto quelle che costituiscono punti di riferimento importanti. Collezionano doni, ma hanno poco interesse per tesori privi di significato, indipendentemente dal loro valore: per loro i regali fatti con attenzione e i sentimenti o i ricordi che rappresentano valgono più di capolavori o reliquie magiche.';
  var DRAGHI_RAME_TANA = '— Tane dei Draghi di Rame —\nI draghi di rame abitano tipicamente caverne a più camere e rovine restaurate. La regione attorno alla tana di un drago di rame adulto o antico viene alterata dalla sua presenza, producendo i seguenti effetti regionali.\n\nAnimaletti Chiacchieroni: le Bestie Minuscole entro 10 km dalla tana ottengono magicamente la capacità di parlare e comprendere il Draconico.\n\nAttacchi di Risate: quando una creatura diversa dal drago e dai suoi alleati, entro 1,5 km dalla tana, ottiene un 1 naturale in un Test d20, deve superare un Tiro Salvezza su Saggezza CD 15 oppure ottenere la condizione Incapacitato fino alla fine del suo turno successivo, sopraffatta dalle risate.\n\nSe il drago muore o trasferisce la propria tana altrove, questi effetti terminano immediatamente.';
  var MANI_STRISCIANTI_LORE = 'Le mani striscianti sono mani mozzate che si muovono e agiscono secondo la propria volontà omicida. Queste appendici senza vita possono animarsi a partire dagli arti recisi di assassini e criminali, e sinistri utilizzatori di magia potrebbero animarle come ripugnanti servitori.\n\nAssumono molte forme diverse, dalle mani umane in decomposizione alle appendici appena recise di animali o mostri.\n\n— Ansolm Haas, "L\'Isolamento del Male" —\n«È possibile che una creatura, qualsiasi essere vivente, sia intrinsecamente malvagia? Una simile affermazione potrebbe di per sé facilitare il compimento di atti malvagi: definendo una persona come malvagia, le concediamo la libertà di comportarsi come tale, assolvendo la malvagità delle sue parole e delle sue azioni.»';
  var CICLOPI_LORE = 'I ciclopi sono giganteschi discendenti degli dèi dotati di un solo occhio. Grazie alla loro visione mistica, possono osservare come gli eventi futuri probabilmente si svolgeranno.';
  var CULTISTI_LORE = 'I cultisti utilizzano la magia e misure estreme per diffondere credenze radicali. Alcuni perseguono in segreto misteri esoterici, mentre altri formano oscure congreghe che cercano di provocare fini terribili. Seguono spesso tradizioni mistiche oscure o si ossessionano con interpretazioni di antiche profezie, e possono venerare patroni soprannaturali: divinità, creature ultraterrene, menti aliene manipolatrici o forze enigmatiche.\n\n— Obiettivi del Culto (1d6) —\n1. Provocare la fine di un ordine dominante, di un\'epoca o del mondo.\n2. Bruciare le rassicuranti menzogne della realtà, rivelando verità dimenticate o terribili.\n3. Espandere la propria fede tramite controllo mentale o coercizione soprannaturale.\n4. Apportare cambiamenti globali, come sprofondare terre o risvegliare vulcani.\n5. Rifare la vita su vasta scala, alterando i corpi di altre creature o esseri spirituali.\n6. Evocare nel proprio mondo la propria divinità, il suo araldo, la sua arma o il suo reame.\n\n— Riti del Culto del Male Elementale —\n«Temi Tharizdun, potere dell\'Occhio Elementale Anziano e signore di tutte le forze distruttive. Io sono il Campione del Male Elementale e sono pronto a eseguire i tuoi desideri.»';
  var PRESETS = [
    {
      id: 'preset_aarakocra_aeromante', name: 'Aarakocra Aeromante', emoji: '🦅', rarity: 'uncommon',
      type: 'Elementale', size: 'Media', alignment: 'Neutrale',
      ac: 16, hp: 66, hpCur: 66, hpTemp: 0, hpDice: '12d8+12', init: 3,
      speed: '6 m, Volare 15 m', cr: '4', xp: '',
      str: 10, dex: 16, con: 12, intl: 13, wis: 17, cha: 12,
      savesOverride: { str: '', dex: '5', con: '', intl: '', wis: '5', cha: '' },
      skillOverrides: { arcano: '3', natura: '5', percezione: '7' },
      passivePerception: 17, senses: [],
      languages: ['Aarakocra', 'Primordiale (Auran)'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Multiattacco', desc: 'L\'aarakocra effettua due attacchi con il Bastone del Vento e può utilizzare Incantare per lanciare Folata di Vento.' },
        { name: 'Bastone del Vento', desc: 'Attacco con arma da mischia o a distanza: +5 a colpire.\nPortata 1,5 m oppure gittata 36/72 m.\nColpito: 7 (1d8 + 3) danni contundenti più 11 (2d10) danni da fulmine.', atkHit: '+5', atkDmgs: [{ f: '1d8+3', t: 'contundenti' }, { f: '2d10', t: 'fulmine' }] },
        { name: 'Incantare', desc: 'L\'aarakocra lancia uno dei seguenti incantesimi senza componenti materiali, usando la Saggezza come caratteristica da incantatore (CD 13 per i tiri salvezza).\n\nA volontà: Elementalismo (Elementalism), Folata di Vento (Gust of Wind), Mano Magica (Mage Hand), Messaggio (Message).\n\n1 volta al giorno: Fulmine (Lightning Bolt).' }
      ],
      bonusActions: [],
      reactions: [
        { name: 'Caduta Piumata (1/Giorno)', desc: 'In risposta al normale innesco dell\'incantesimo, l\'aarakocra lancia Caduta Morbida (Feather Fall) usando la stessa caratteristica da incantatore di Incantare.' }
      ],
      legendaryActions: [],
      drop: [{ name: 'Tesoro', desc: 'Oggetti personali, equipaggiamento individuale.' }],
      notes: 'Guardiani Alati del Cielo\n\nHabitat: Montagne, Piani (Piano Elementale dell\'Aria)\n\nGli aeromanti aarakocra controllano venti magici provenienti dalle tempeste infinite del Piano Elementale dell\'Aria.\n\n' + AARAKOCRA_LORE
    },
    {
      id: 'preset_aarakocra_schermagliatore', name: 'Aarakocra Schermagliatore', emoji: '🪶', rarity: 'common',
      type: 'Elementale', size: 'Media', alignment: 'Neutrale',
      ac: 12, hp: 11, hpCur: 11, hpTemp: 0, hpDice: '2d8+2', init: 2,
      speed: '6 m, Volare 15 m', cr: '1/4', xp: '',
      str: 10, dex: 14, con: 12, intl: 11, wis: 12, cha: 11,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { percezione: '5' },
      passivePerception: 15, senses: [],
      languages: ['Aarakocra', 'Primordiale (Auran)'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Artigli', desc: 'Attacco in mischia: +4 a colpire, portata 1,5 m.\nColpito: 4 (1d4 + 2) danni taglienti.\nSe l\'aarakocra ha volato per almeno 9 metri in linea retta verso il bersaglio immediatamente prima dell\'attacco, infligge invece 9 (3d4 + 2) danni taglienti.', atkHit: '+4', atkDmgs: [{ f: '1d4+2', t: 'taglienti' }] },
        { name: 'Giavellotto del Vento', desc: 'Attacco in mischia o a distanza: +4 a colpire.\nPortata 1,5 m oppure gittata 9/36 m.\nColpito: 5 (1d6 + 2) danni perforanti più 2 (1d4) danni da tuono.\nColpisca o manchi il bersaglio, dopo un attacco a distanza il giavellotto ritorna magicamente nella mano dell\'aarakocra immediatamente dopo il lancio.', atkHit: '+4', atkDmgs: [{ f: '1d6+2', t: 'perforanti' }, { f: '1d4', t: 'tuono' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [{ name: 'Tesoro', desc: 'Oggetti personali, equipaggiamento individuale.' }],
      notes: 'Guardiani Alati del Cielo\n\nHabitat: Montagne, Piani (Piano Elementale dell\'Aria)\n\nGli schermagliatori aarakocra sono esperti nel combattere i nemici in volo tra le nuvole. Spesso attaccano le minacce terrestri con rapide picchiate provenienti dall\'alto.\n\n' + AARAKOCRA_LORE
    },
    {
      id: 'preset_aboleth', name: 'Aboleth', emoji: '🐙', rarity: 'epic',
      type: 'Aberrazione', size: 'Grande', alignment: 'Legale Malvagio',
      ac: 17, hp: 150, hpCur: 150, hpTemp: 0, hpDice: '20d10+40', init: 7,
      speed: '3 m, Nuotare 12 m', cr: '10', xp: '',
      str: 21, dex: 9, con: 15, intl: 18, wis: 15, cha: 18,
      savesOverride: { str: '', dex: '3', con: '6', intl: '8', wis: '6', cha: '' },
      skillOverrides: { storia: '12', percezione: '10' },
      passivePerception: 20, senses: [{ type: 'Scurovisione', value: 36, unit: 'm' }],
      languages: ['Linguaggio degli Abissi Profondi (Deep Speech)', 'Telepatia 36 m'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [
        { name: 'Anfibio', desc: 'L\'aboleth può respirare sia aria sia acqua.' },
        { name: 'Rigenerazione Eldritch', desc: 'Se viene distrutto, l\'aboleth ottiene un nuovo corpo entro 5d10 giorni, tornando in vita con tutti i suoi punti ferita nel Reame Remoto o in un altro luogo scelto dal DM.' },
        { name: 'Resistenza Leggendaria', desc: '(3/Giorno, oppure 4/Giorno nella Tana)\nSe l\'aboleth fallisce un tiro salvezza, può scegliere di superarlo invece.' },
        { name: 'Nube di Muco', desc: 'Quando è sott\'acqua, l\'aboleth è circondato da una nube di muco.\nTiro Salvezza su Costituzione: CD 14. Alla fine del turno dell\'aboleth, ogni creatura entro 1,5 metri deve effettuare il tiro salvezza.\nFallimento: il bersaglio viene maledetto. Finché la maledizione permane la pelle diventa viscida, il bersaglio può respirare aria e acqua e non può recuperare punti ferita se non è sott\'acqua. Inoltre, fuori dall\'acqua subisce 6 (1d12) danni da acido ogni 10 minuti, a meno che la pelle non venga mantenuta umida.' },
        { name: 'Telepatia Investigativa', desc: 'Quando una creatura visibile all\'aboleth comunica telepaticamente con esso, l\'aboleth apprende il desiderio più profondo della creatura.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'L\'aboleth effettua due attacchi con Tentacolo e utilizza Consumare Ricordi oppure Dominare Mente, se disponibile.' },
        { name: 'Tentacolo', desc: 'Attacco in mischia: +9 a colpire, portata 4,5 m.\nColpito: 12 (2d6 + 5) danni contundenti.\nSe il bersaglio è di taglia Grande o inferiore, ottiene la condizione Afferrato (CD 14 per liberarsi) da uno dei quattro tentacoli dell\'aboleth.', atkHit: '+9', atkDmgs: [{ f: '2d6+5', t: 'contundenti' }] },
        { name: 'Consumare Ricordi', desc: 'Tiro Salvezza su Intelligenza: CD 16. Un bersaglio entro 9 metri Ammaliato o Afferrato dall\'aboleth.\nFallimento: 10 (3d6) danni psichici. Successo: metà danni.\nSe il bersaglio è un Umanoide e l\'azione lo riduce a 0 punti ferita, l\'aboleth acquisisce tutti i suoi ricordi.', atkDmgs: [{ f: '3d6', t: 'psichici' }] },
        { name: 'Dominare Mente (2/Giorno)', desc: 'Tiro Salvezza su Saggezza: CD 16. Una creatura entro 9 metri visibile all\'aboleth.\nFallimento: il bersaglio ottiene la condizione Ammaliato finché l\'aboleth non muore o finché i due non si trovano su piani di esistenza differenti.\nMentre è ammaliato considera l\'aboleth un alleato, è sotto il suo controllo entro 18 metri e i due possono comunicare telepaticamente a qualsiasi distanza.\nIl bersaglio ripete il tiro salvezza ogni volta che subisce danni e ogni 24 ore trascorse ad almeno 1,6 km dall\'aboleth; con un successo l\'effetto termina.' }
      ],
      bonusActions: [],
      reactions: [],
      legendaryActions: [
        { name: 'Usi (3 per round, 4 nella Tana)', desc: 'L\'aboleth può usare una sola azione leggendaria alla volta, immediatamente dopo il turno di un\'altra creatura. Recupera tutti gli usi spesi all\'inizio del proprio turno.' },
        { name: 'Frustata', desc: 'L\'aboleth effettua un attacco con Tentacolo.', atkHit: '+9', atkDmgs: [{ f: '2d6+5', t: 'contundenti' }] },
        { name: 'Drenaggio Psichico', desc: 'Se almeno una creatura è Ammaliata o Afferrata dall\'aboleth, esso utilizza Consumare Ricordi e recupera 5 (1d10) punti ferita.' }
      ],
      drop: [{ name: 'Reliquie', desc: 'Reliquie del suo impero sommerso da tempo e tesori custoditi in camere piene d\'aria al riparo dall\'acqua.' }],
      notes: 'Antica Mente Aliena Senza Età\n\nHabitat: Sottosuolo, Ambienti Acquatici\nTesoro: Reliquie\n\nNegli abissi acquatici gli aboleth sognano imperi morti e orchestrano complotti che si sviluppano attraverso le ere. Questi elusivi immortali anfibi sopraffanno le loro vittime sia fisicamente sia mentalmente, trasformando le creature tramite una viscida infezione aberrante e plasmando altri esseri affinché li servano sotto le onde.\n\nGli aboleth possiedono intelletti terrificanti e menti totalmente aliene. Conservano ricordi perfetti di mondi primordiali e di domini incomprensibili risalenti alle prime epoche del multiverso. I loro segreti sono innumerevoli e insondabili.\n\nEssi si annidano in luoghi intrisi di misteri ancestrali: rovine di imperi sommersi, antichi crocevia magici nascosti o fragili punti di contatto tra diversi piani di esistenza. In questi rifugi sognano epoche passate, raccolgono servitori dominati psichicamente, consumano le menti delle vittime e preparano il loro ritorno al potere. Gli obiettivi e i metodi degli aboleth sono spesso incomprensibili alle altre creature.\n\n— Intrighi dell\'Aboleth (d6) —\n1. Portare a termine piani incomprensibili che lo spingono ad agire in modi apparentemente casuali.\n2. Apprendere di più sul mondo rapendo individui e consumandone le menti.\n3. Manipolare innocenti affinché lo venerino come una divinità usando la sua telepatia dall\'ombra.\n4. Aprire un varco verso un lontano passato o futuro, liberando un\'invasione da un\'altra epoca.\n5. Risvegliare una tartaruga dragone, un kraken o un altro mostro marino per sommergere una città costiera.\n6. Ingannare cercatori di tesori affinché recuperino reliquie del suo impero caduto da tempo.\n\n— Tana dell\'Aboleth —\nGli aboleth dimorano in rovine sommerse e caverne allagate, mantenendo camere piene d\'aria per i servitori terrestri e per i tesori che l\'acqua danneggerebbe.\n\nAcque Corrotte: le fonti d\'acqua entro 1,6 km dalla tana vengono contaminate. Una creatura diversa dall\'aboleth e dai suoi alleati che ne beva deve superare un Tiro Salvezza su Costituzione CD 15 o subire la condizione Avvelenato per 1 ora.\n\nProiezione Psionica: nella sua tana l\'aboleth può lanciare Immagine Proiettata (Project Image) senza componenti materiali, usando l\'Intelligenza come caratteristica da incantatore (CD 16); la gittata diventa 1 miglio e l\'aboleth può usare la propria telepatia come se si trovasse nello spazio dell\'illusione. Se l\'aboleth muore o abbandona la tana, gli effetti terminano.'
    },
    {
      id: 'preset_elementale_aria', name: 'Elementale dell\'Aria', emoji: '🌪️', rarity: 'rare',
      type: 'Elementale', size: 'Grande', alignment: 'Neutrale',
      ac: 15, hp: 90, hpCur: 90, hpTemp: 0, hpDice: '12d10+24', init: 5,
      speed: '3 m, Volare 27 m (stazionario)', cr: '5', xp: '',
      str: 14, dex: 20, con: 14, intl: 6, wis: 10, cha: 6,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: {},
      passivePerception: 10, senses: [{ type: 'Scurovisione', value: 18, unit: 'm' }],
      languages: ['Primordiale (Auran)'],
      dmgResist: ['Contundente', 'Perforante', 'Tagliente', 'Fulmine'],
      dmgImmune: ['Veleno', 'Tuono'],
      dmgVulner: [],
      condImmune: ['Afferrato', 'Avvelenato', 'Esausto', 'Paralizzato', 'Pietrificato', 'Prono', 'Trattenuto', 'Privo di Sensi'],
      traits: [
        { name: 'Forma Aerea', desc: 'L\'elementale può entrare nello spazio di un\'altra creatura e fermarsi al suo interno.\nPuò inoltre attraversare aperture strette fino a 2,5 centimetri di larghezza senza spendere movimento aggiuntivo.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'L\'elementale effettua due attacchi Schianto Tonante.' },
        { name: 'Schianto Tonante', desc: 'Attacco in mischia: +8 a colpire, portata 3 m.\nColpito: 14 (2d8 + 5) danni da tuono.', atkHit: '+8', atkDmgs: [{ f: '2d8+5', t: 'tuono' }] },
        { name: 'Turbine (Ricarica 4-6)', desc: 'Tiro Salvezza su Forza: CD 13. Una creatura di taglia Media o inferiore che si trovi nello spazio dell\'elementale.\nFallimento: 24 (4d10 + 2) danni da tuono; il bersaglio viene spinto fino a 6 metri in linea retta lontano dall\'elementale e ottiene la condizione Prono.\nSuccesso: metà danni e nessun altro effetto.', atkDmgs: [{ f: '4d10+2', t: 'tuono' }] }
      ],
      bonusActions: [],
      reactions: [],
      legendaryActions: [],
      drop: [],
      notes: 'Spirito Primordiale del Vento e della Tempesta\n\nHabitat: Deserti, Montagne, Piani (Piano Elementale dell\'Aria)\nTesoro: Nessuno\n\nSpiriti energetici provenienti dal Piano Elementale dell\'Aria, gli elementali dell\'aria raccolgono nubi e venti in corpi mutevoli, dotati di arti indistinti e forme vagamente definite.\n\nAl di fuori del loro piano natale, questi elementali possono servire gli incantatori che li evocano oppure radunarsi attorno a nodi di energia planare incontrollata, come vette montane battute dai venti o tempeste eterne.\n\nIn combattimento, gli elementali dell\'aria travolgono i nemici con potenti raffiche oppure si trasformano in vortici devastanti capaci di scagliare lontano gli avversari.\n\n— Composizioni dell\'Elementale dell\'Aria (d6) —\n1. Nubi cumuliformi o cirri.\n2. Una miscela di gas dai colori vivaci.\n3. Un miasma acre dall\'aspetto malsano.\n4. Ammassi di nuvole mutevoli che ricordano animali o forme semplici.\n5. Tratti sinistri nascosti all\'interno di una massa nebbiosa.\n6. Nubi tempestose in continuo vortice.'
    },
    {
      id: 'preset_signore_animali', name: 'Signore degli Animali', emoji: '🐾', rarity: 'epic',
      type: 'Celestiale', size: 'Media', alignment: 'Neutrale',
      ac: 19, hp: 323, hpCur: 323, hpTemp: 0, hpDice: '34d8+170', init: 19,
      speed: '18 m, Volare 18 m (stazionario), Nuotare 18 m', cr: '20', xp: '',
      str: 24, dex: 25, con: 20, intl: 19, wis: 23, cha: 22,
      savesOverride: { str: '', dex: '', con: '11', intl: '', wis: '12', cha: '' },
      skillOverrides: { acrobazia: '13', atletica: '13', furtivita: '13', percezione: '18' },
      passivePerception: 28, senses: [{ type: 'Vista del Vero', value: 36, unit: 'm' }],
      languages: ['Tutte'],
      dmgResist: ['Freddo', 'Fuoco', 'Necrotico', 'Psichico', 'Radiante'],
      dmgImmune: [], dmgVulner: [],
      condImmune: ['Ammaliato', 'Spaventato', 'Stordito'],
      traits: [
        { name: 'Signoria Animale', desc: 'Il Signore degli Animali rappresenta un Raccoglitore, un Cacciatore oppure un Saggio (a scelta del DM). Questa scelta determina alcuni tratti presenti nel blocco statistiche.' },
        { name: 'Resistenza Leggendaria', desc: '(4/Giorno)\nSe fallisce un tiro salvezza, il Signore degli Animali può scegliere di superarlo invece.' },
        { name: 'Presenza Regale', desc: 'Tiro Salvezza su Saggezza: CD 20. Ogni nemico che inizi il proprio turno entro un\'emanazione di 9 metri deve effettuare il tiro salvezza; con un fallimento subisce uno dei seguenti effetti.\nAffascinato (solo Raccoglitore): condizione Ammaliato e Incapacitato fino alla fine del proprio turno successivo.\nTerrorizzato (solo Cacciatore): condizione Spaventato fino alla fine del proprio turno successivo.\nConfuso (solo Saggio): 10 (3d6) danni psichici e magicamente confuso fino alla fine del proprio turno successivo (mentre è confuso sottrae 1d4 a tutti i tiri salvezza).' },
        { name: 'Resistenza Magica', desc: 'Il Signore degli Animali ha vantaggio ai tiri salvezza contro incantesimi e altri effetti magici.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il Signore degli Animali effettua due attacchi, scegliendo liberamente tra Lacerazione e Raggio Radiante, quindi utilizza Spirito Animale.' },
        { name: 'Lacerazione', desc: 'Attacco in mischia: +13 a colpire, portata 1,5 m.\nColpito: 14 (2d6 + 7) danni taglienti più 7 (2d6) danni da forza.', atkHit: '+13', atkDmgs: [{ f: '2d6+7', t: 'taglienti' }, { f: '2d6', t: 'forza' }] },
        { name: 'Raggio Radiante', desc: 'Attacco a distanza: +12 a colpire, gittata 36 m.\nColpito: 20 (4d6 + 6) danni radianti.', atkHit: '+12', atkDmgs: [{ f: '4d6+6', t: 'radianti' }] },
        { name: 'Spirito Animale', desc: 'Il Signore degli Animali evoca uno spirito animale che colpisce una creatura e poi svanisce.\nTiro Salvezza su Destrezza: CD 20. Una creatura visibile entro 36 metri.\nFallimento: 28 (4d10 + 6) danni radianti. Successo: metà danni.\nIn ogni caso si verifica inoltre uno dei seguenti effetti.\nFortificare (solo Raccoglitore): il Signore degli Animali ottiene 20 punti ferita temporanei.\nMarchiato come Preda (solo Cacciatore): ottiene vantaggio ai tiri per colpire contro il bersaglio fino all\'inizio del proprio turno successivo.\nSciame Molesto (solo Saggio): il bersaglio subisce svantaggio ai tiri per colpire e alle prove di caratteristica fino alla fine del proprio turno successivo.', atkDmgs: [{ f: '4d10+6', t: 'radianti' }] },
        { name: 'Incantare', desc: 'Il Signore degli Animali lancia uno dei seguenti incantesimi senza componenti materiali, usando la Saggezza come caratteristica da incantatore (CD 20).\n\nA volontà: Amicizia con gli Animali (Animal Friendship), Animale Messaggero (Animal Messenger), Parlare con gli Animali (Speak with Animals).\n\n2 volte al giorno ciascuno: Risveglio (Awaken), Ristorare Superiore (Greater Restoration).\n\n1 volta al giorno ciascuno (solo Saggio): Forme Animali (Animal Shapes), Esplosione Solare (Sunburst).' }
      ],
      bonusActions: [
        { name: 'Mutaforma', desc: 'Il Signore degli Animali si trasforma in una versione Grande o inferiore dell\'animale che rappresenta, in un umanoide Medio o Piccolo, oppure ritorna alla sua vera forma. Le statistiche di gioco rimangono invariate eccetto la taglia. L\'equipaggiamento indossato o trasportato non viene trasformato.' }
      ],
      reactions: [],
      legendaryActions: [
        { name: 'Usi (3 per round)', desc: 'Il Signore degli Animali può utilizzare una sola azione leggendaria alla volta, immediatamente dopo il turno di un\'altra creatura. Recupera tutti gli usi spesi all\'inizio del proprio turno.' },
        { name: 'Assalto Ferino', desc: 'Il Signore degli Animali si muove fino alla propria velocità senza provocare attacchi di opportunità e poi effettua un attacco Lacerazione.', atkHit: '+13', atkDmgs: [{ f: '2d6+7', t: 'taglienti' }, { f: '2d6', t: 'forza' }] },
        { name: 'Assalto Radiante', desc: 'Il Signore degli Animali effettua un attacco Raggio Radiante.', atkHit: '+12', atkDmgs: [{ f: '4d6+6', t: 'radianti' }] }
      ],
      drop: [{ name: 'Reliquie', desc: 'Reliquie sacre legate al suo dominio e alla bestia che rappresenta.' }],
      notes: 'Reggente Immortale delle Terre Selvagge\n\nHabitat: Piani (Beastlands)\nTesoro: Reliquie\n\nI Signori degli Animali sono gli spiriti immortali di creature leggendarie. Agiscono come protettori divini degli animali della loro specie e appaiono come ibridi tra umanoidi e le bestie che difendono.\n\nSpesso assumono la forma di versioni gigantesche e idealizzate degli animali a cui sono associati, con occhi luminosi; quando interagiscono con altre creature possono apparire come esseri quasi umani dotati di sottili tratti animali. Indipendentemente dall\'aspetto, manifestano gli istinti della creatura che rappresentano, temperati da immensa saggezza ed esperienza.\n\nLa maggior parte dimora nelle Beastlands, talvolta viaggiando nel Feywild o in altri reami idilliaci. Raramente visitano il Piano Materiale, intervenendo solo quando un mondo affronta una catastrofe ambientale o quando grandi popolazioni animali sono in pericolo.\n\nTra i più noti vi sono quelli associati a gatti, falchi, lucertole e lupi, ma esistono rappresentanti di ogni bestia; alcuni incarnano persino creature rare o estinte come megafauna preistorica o dinosauri. Grazie al loro potere divino possono evocare animali spettrali, canalizzare energie spirituali e manifestare capacità legate a uno dei tre grandi archetipi: Raccoglitore, Cacciatore, Saggio.\n\n— Aspetti Raccoglitori (d10) —\nOrso, Ape, Bisonte, Capibara, Carpa, Coniglio, Gallo, Bradipo, Cervo, Avvoltoio.\n\n— Aspetti Cacciatori (d10) —\nAlligatore, Tasso, Pipistrello, Gatto, Falco, Mangusta, Mantide Religiosa, Squalo, Serpente, Lupo.\n\n— Aspetti Sapienti (d10) —\nCoyote, Corvo, Elefante, Lucertola, Topo, Gufo, Salmone, Ragno, Tartaruga, Balena.'
    },
    {
      id: 'preset_armatura_animata', name: 'Armatura Animata', emoji: '🛡️', rarity: 'common',
      type: 'Costrutto', size: 'Media', alignment: 'Senza Allineamento',
      ac: 18, hp: 33, hpCur: 33, hpTemp: 0, hpDice: '6d8+6', init: 2,
      speed: '7,5 m', cr: '1', xp: '',
      str: 14, dex: 11, con: 13, intl: 1, wis: 3, cha: 1,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: {},
      passivePerception: 6, senses: [{ type: 'Vista Cieca', value: 18, unit: 'm' }],
      languages: ['Nessuna'],
      dmgResist: [], dmgImmune: ['Psichico', 'Veleno'], dmgVulner: [],
      condImmune: ['Accecato', 'Ammaliato', 'Avvelenato', 'Assordato', 'Esausto', 'Paralizzato', 'Pietrificato', 'Spaventato'],
      traits: [],
      actions: [
        { name: 'Multiattacco', desc: 'L\'armatura effettua due attacchi Schianto.' },
        { name: 'Schianto', desc: 'Attacco in mischia: +4 a colpire, portata 1,5 m.\nColpito: 5 (1d6 + 2) danni contundenti.', atkHit: '+4', atkDmgs: [{ f: '1d6+2', t: 'contundenti' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [],
      notes: 'Oggetti Comuni che Prendono Vita\n\nHabitat: Urbano\nTesoro: Nessuno\n\nLe armature animate possono muoversi con passi lenti e deliberati oppure con andature rigide e innaturali. Spesso sono create a partire da armature complete e possono essere facilmente scambiate per soldati o cavalieri. Altri tipi di armature o persino statue metalliche possono utilizzare queste stesse statistiche.\n\n' + ANIMATI_LORE
    },
    {
      id: 'preset_scopa_animata', name: 'Scopa Animata', emoji: '🧹', rarity: 'common',
      type: 'Costrutto', size: 'Piccola', alignment: 'Senza Allineamento',
      ac: 15, hp: 14, hpCur: 14, hpTemp: 0, hpDice: '4d6', init: 5,
      speed: '1,5 m, Volare 15 m (stazionario)', cr: '1/4', xp: '',
      str: 10, dex: 17, con: 10, intl: 1, wis: 5, cha: 1,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: {},
      passivePerception: 7, senses: [{ type: 'Vista Cieca', value: 18, unit: 'm' }],
      languages: ['Nessuna'],
      dmgResist: [], dmgImmune: ['Psichico', 'Veleno'], dmgVulner: [],
      condImmune: ['Accecato', 'Ammaliato', 'Avvelenato', 'Assordato', 'Esausto', 'Paralizzato', 'Pietrificato', 'Spaventato'],
      traits: [
        { name: 'Passo Radente', desc: 'La scopa non provoca attacchi di opportunità quando esce dalla portata di un nemico mentre vola.' }
      ],
      actions: [
        { name: 'Schianto', desc: 'Attacco in mischia: +5 a colpire, portata 1,5 m.\nColpito: 5 (1d4 + 3) danni contundenti.', atkHit: '+5', atkDmgs: [{ f: '1d4+3', t: 'contundenti' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [],
      notes: 'Oggetti Comuni che Prendono Vita\n\nHabitat: Urbano\nTesoro: Nessuno\n\nLe scope animate mantengono pulito l\'ambiente circostante e lo difendono quando necessario. Quando combattono si lanciano in aria e colpiscono i nemici da direzioni imprevedibili. Anche altri oggetti volanti, come utensili o bastoni animati, possono utilizzare questo blocco statistiche.\n\n' + ANIMATI_LORE
    },
    {
      id: 'preset_spada_volante_animata', name: 'Spada Volante Animata', emoji: '🗡️', rarity: 'common',
      type: 'Costrutto', size: 'Piccola', alignment: 'Senza Allineamento',
      ac: 17, hp: 14, hpCur: 14, hpTemp: 0, hpDice: '4d6', init: 4,
      speed: '1,5 m, Volare 15 m (stazionario)', cr: '1/4', xp: '',
      str: 12, dex: 15, con: 11, intl: 1, wis: 5, cha: 1,
      savesOverride: { str: '', dex: '4', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: {},
      passivePerception: 7, senses: [{ type: 'Vista Cieca', value: 18, unit: 'm' }],
      languages: ['Nessuna'],
      dmgResist: [], dmgImmune: ['Psichico', 'Veleno'], dmgVulner: [],
      condImmune: ['Accecato', 'Ammaliato', 'Avvelenato', 'Assordato', 'Esausto', 'Paralizzato', 'Pietrificato', 'Spaventato'],
      traits: [],
      actions: [
        { name: 'Fendente', desc: 'Attacco in mischia: +4 a colpire, portata 1,5 m.\nColpito: 6 (1d8 + 2) danni taglienti.', atkHit: '+4', atkDmgs: [{ f: '1d8+2', t: 'taglienti' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [],
      notes: 'Oggetti Comuni che Prendono Vita\n\nHabitat: Urbano\nTesoro: Nessuno\n\nLe spade volanti animate si muovono come se fossero impugnate da guerrieri invisibili. Che si tratti di una lama appena forgiata o di frammenti ricomposti magicamente, il loro comportamento rimane identico. Anche altre armi animate possono utilizzare queste statistiche.\n\n' + ANIMATI_LORE
    },
    {
      id: 'preset_tappeto_soffocante_animato', name: 'Tappeto Soffocante Animato', emoji: '🟫', rarity: 'common',
      type: 'Costrutto', size: 'Grande', alignment: 'Senza Allineamento',
      ac: 12, hp: 27, hpCur: 27, hpTemp: 0, hpDice: '5d10', init: 4,
      speed: '3 m', cr: '2', xp: '',
      str: 17, dex: 14, con: 10, intl: 1, wis: 3, cha: 1,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: {},
      passivePerception: 6, senses: [{ type: 'Vista Cieca', value: 18, unit: 'm' }],
      languages: ['Nessuna'],
      dmgResist: [], dmgImmune: ['Psichico', 'Veleno'], dmgVulner: [],
      condImmune: ['Accecato', 'Ammaliato', 'Avvelenato', 'Assordato', 'Esausto', 'Paralizzato', 'Pietrificato', 'Spaventato'],
      traits: [],
      actions: [
        { name: 'Soffocare', desc: 'Attacco in mischia: +5 a colpire, portata 1,5 m.\nColpito: 10 (2d6 + 3) danni contundenti.\nSe il bersaglio è una creatura di taglia Media o inferiore, il tappeto può invece afferrarlo (CD 13 per sfuggire) al posto di infliggere danni. Finché la lotta continua il bersaglio è Accecato e Trattenuto, sta soffocando e subisce 10 (2d6 + 3) danni contundenti all\'inizio di ogni turno del tappeto. Il tappeto può soffocare una sola creatura alla volta.\nMentre afferra una creatura il tappeto non può usare nuovamente questa azione, dimezza tutti i danni che subisce (arrotondando per difetto) e la creatura afferrata subisce lo stesso ammontare di danni che il tappeto riceve.', atkHit: '+5', atkDmgs: [{ f: '2d6+3', t: 'contundenti' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [],
      notes: 'Oggetti Comuni che Prendono Vita\n\nHabitat: Urbano\nTesoro: Nessuno\n\nI tappeti soffocanti animati possono attaccare chiunque li calpesti oppure fingersi oggetti magici innocui, come tappeti volanti, per sorprendere le proprie vittime. Arazzi, pellicce e altri tessuti mortali possono utilizzare queste stesse statistiche.\n\n' + ANIMATI_LORE
    },
    {
      id: 'preset_ankheg', name: 'Ankheg', emoji: '🪲', rarity: 'uncommon',
      type: 'Mostruosità', size: 'Grande', alignment: 'Senza Allineamento',
      ac: 14, hp: 45, hpCur: 45, hpTemp: 0, hpDice: '6d10+12', init: 0,
      speed: '9 m, Scavare 3 m', cr: '2', xp: '',
      str: 17, dex: 11, con: 14, intl: 1, wis: 13, cha: 6,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: {},
      passivePerception: 11, senses: [{ type: 'Scurovisione', value: 18, unit: 'm' }, { type: 'Percezione Tellurica', value: 18, unit: 'm' }],
      languages: ['Nessuna'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [
        { name: 'Scavatore', desc: 'L\'ankheg può scavare attraverso la roccia solida alla metà della propria velocità di scavo e lascia dietro di sé un tunnel largo circa 3 metri.' }
      ],
      actions: [
        { name: 'Morso', desc: 'Attacco in mischia: +5 a colpire (con vantaggio se il bersaglio è già Afferrato dall\'ankheg), portata 1,5 m.\nColpito: 10 (2d6 + 3) danni taglienti più 3 (1d6) danni da acido.\nSe il bersaglio è una creatura di taglia Grande o inferiore, ottiene la condizione Afferrato (CD 13 per sfuggire).', atkHit: '+5', atkDmgs: [{ f: '2d6+3', t: 'taglienti' }, { f: '1d6', t: 'acido' }] },
        { name: 'Spruzzo Acido (Ricarica 6)', desc: 'Tiro Salvezza su Destrezza: CD 12. Tutte le creature in una linea lunga 9 metri e larga 1,5 metri.\nFallimento: 14 (4d6) danni da acido. Successo: metà danni.', atkDmgs: [{ f: '4d6', t: 'acido' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [],
      notes: 'Predatore Insettoide Scavatore\n\nHabitat: Foreste, Praterie\nTesoro: Nessuno\n\nGli ankheg sono enormi insetti che scavano gallerie poco sotto la superficie, creando vasti labirinti sotterranei. Dai loro tunnel emergono all\'improvviso per dissolvere e divorare creature più piccole utilizzando mandibole grondanti acido e getti di enzimi digestivi.\n\nGli ankheg rappresentano una piaga per gli agricoltori, poiché il bestiame al pascolo costituisce una facile preda. Molti vivono in solitudine, ma nelle regioni ricche di cibo possono riunirsi in nidi composti da diverse decine di esemplari, minacciando intere comunità.\n\nEliminare un nido di ankheg può essere estremamente difficile, a meno che non vengano bonificati tutti i tunnel e distrutte le loro uova.\n\nLe loro gallerie hanno generalmente forma cilindrica e sono spesso disseminate dei resti delle prede e di tesori trascinati nel sottosuolo.\n\n— Scoperte nei Tunnel degli Ankheg (d8) —\n1. Un\'altra galleria (naturale o scavata nella pietra) che conduce al Sottosuolo.\n2. Una rovina sepolta o una tomba riportata alla luce dal tunnel.\n3. Un gruppo di 1d4 uova fresche di ankheg, che possono essere rotte e utilizzate come ampolle di acido.\n4. Il cadavere di un ankheg e le prove dell\'esistenza di un predatore sotterraneo ancora più pericoloso.\n5. Un frammento di carapace di ankheg utilizzabile come scudo.\n6. Una borsa contenente 2d6 monete d\'oro accanto a una pozza d\'acido.\n7. Un animale randagio proveniente da una fattoria o da un bosco.\n8. Uno spaventapasseri brutalmente dilaniato.'
    },
    {
      id: 'preset_arcanaloth', name: 'Arcanaloth', emoji: '🐺', rarity: 'rare',
      type: 'Immondo', size: 'Media', alignment: 'Neutrale Malvagio',
      ac: 17, hp: 175, hpCur: 175, hpTemp: 0, hpDice: '27d8+54', init: 5,
      speed: '9 m, Volare 9 m (stazionario)', cr: '12', xp: '',
      str: 17, dex: 12, con: 14, intl: 20, wis: 16, cha: 17,
      savesOverride: { str: '', dex: '5', con: '6', intl: '9', wis: '7', cha: '' },
      skillOverrides: { arcano: '9', inganno: '7', intuizione: '7', percezione: '7' },
      passivePerception: 17, senses: [{ type: 'Vista del Vero', value: 36, unit: 'm' }],
      languages: ['Tutte', 'Telepatia 36 m'],
      dmgResist: ['Freddo', 'Fuoco', 'Fulmine'], dmgImmune: ['Acido', 'Veleno'], dmgVulner: [],
      condImmune: ['Ammaliato', 'Avvelenato'],
      traits: [
        { name: 'Rigenerazione Immonda', desc: 'Se l\'arcanaloth muore al di fuori di Gehenna, il suo corpo si dissolve in icore e ottiene immediatamente un nuovo corpo, tornando in vita con tutti i propri punti ferita a Gehenna.' },
        { name: 'Resistenza Magica', desc: 'L\'arcanaloth ha vantaggio ai tiri salvezza contro incantesimi e altri effetti magici.' },
        { name: 'Tomo delle Anime', desc: 'L\'arcanaloth possiede un tomo magico. Finché tiene o trasporta il tomo, può utilizzare l\'azione Artiglio Esiliante.\nIl tomo ha CA 17, 35 punti ferita e immunità ai danni necrotici, psichici e da veleno. Recupera tutti i punti ferita alla fine di ogni turno e si trasforma in polvere se ridotto a 0 punti ferita o se l\'arcanaloth muore. Se viene distrutto, l\'arcanaloth può crearne uno nuovo al termine di un riposo breve o lungo.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'L\'arcanaloth effettua tre attacchi Esplosione Immonda. Può sostituire uno di questi attacchi con Artiglio Esiliante.' },
        { name: 'Esplosione Immonda', desc: 'Attacco in mischia o a distanza: +9 a colpire, portata 1,5 m oppure gittata 36 m.\nColpito: 31 (4d12 + 5) danni necrotici.', atkHit: '+9', atkDmgs: [{ f: '4d12+5', t: 'necrotici' }] },
        { name: 'Artiglio Esiliante', desc: '(Richiede il Tomo delle Anime) Attacco in mischia: +9 a colpire, portata 1,5 m.\nColpito: 10 (2d4 + 5) danni taglienti più 19 (3d12) danni psichici.\nSe il bersaglio è una creatura, deve superare un tiro salvezza su Carisma CD 17 o venire imprigionato in un semipiano all\'interno del Tomo delle Anime (condizione Incapacitato; ripete il TS alla fine di ogni proprio turno). Con un successo fugge e riappare nello spazio che occupava (o nel più vicino libero). Se fallisce tre TS nel semipiano, resta vincolato permanentemente al tomo e può essere liberato solo riducendo il tomo a 0 punti ferita.', atkHit: '+9', atkDmgs: [{ f: '2d4+5', t: 'taglienti' }, { f: '3d12', t: 'psichici' }] },
        { name: 'Incantare', desc: 'L\'arcanaloth lancia uno dei seguenti incantesimi senza componenti materiali, usando l\'Intelligenza come caratteristica da incantatore (CD 17).\n\nA volontà: Alterare Sé Stesso (Alter Self), Individuazione del Magico (Detect Magic), Identificare (Identify), Mano Magica (Mage Hand), Prestidigitazione (Prestidigitation).\n\n1 volta al giorno ciascuno: Contattare Altri Piani (Contact Other Plane), Individuazione dei Pensieri (Detect Thoughts), Porta Dimensionale (Dimension Door), Vuoto Mentale (Mind Blank).' }
      ],
      bonusActions: [
        { name: 'Teletrasporto', desc: 'L\'arcanaloth si teletrasporta fino a 9 metri in uno spazio libero che può vedere.' }
      ],
      reactions: [
        { name: 'Controincantesimo', desc: 'L\'arcanaloth lancia Controincantesimo (Counterspell) in risposta al normale innesco dell\'incantesimo, usando la stessa caratteristica da incantatore di Incantare.' }
      ],
      legendaryActions: [],
      drop: [{ name: 'Conoscenze Arcane', desc: 'Segreti accumulati, tomi e conoscenze arcane (incluso il Tomo delle Anime).' }],
      notes: 'Yugoloth della Manipolazione Arcana\n\nHabitat: Piani (Piani Inferiori)\nTesoro: Conoscenze Arcane\n\nSebbene tutti gli yugoloth siano manifestazioni immonde di malvagità e avidità, gli arcanaloth indirizzano il loro considerevole intelletto verso l\'accumulo e lo sfruttamento dei segreti.\n\nUtilizzano tali conoscenze per intrappolare innumerevoli vittime e malviventi minori, seducendo i loro bersagli con false promesse e potenti magie.\n\nGli arcanaloth possiedono una straordinaria maestria nell\'arte degli incantesimi e spesso si celano dietro illusioni e travestimenti magici. Preferiscono lasciare che servitori magici o altri yugoloth combattano per loro, ma sono comunque perfettamente in grado di difendersi con il proprio potere arcano, arrivando persino a bandire i nemici all\'interno delle pagine dei loro tomi magici.'
    },
    {
      id: 'preset_arcistrega', name: 'Arcistrega', emoji: '🧙', rarity: 'epic',
      type: 'Fata', size: 'Grande', alignment: 'Neutrale Malvagio',
      ac: 20, hp: 333, hpCur: 333, hpTemp: 0, hpDice: '29d10+174', init: 16,
      speed: '12 m', cr: '21', xp: '',
      str: 24, dex: 15, con: 23, intl: 19, wis: 19, cha: 25,
      savesOverride: { str: '', dex: '9', con: '', intl: '', wis: '11', cha: '' },
      skillOverrides: { inganno: '14', percezione: '11', persuasione: '21' },
      passivePerception: 21, senses: [{ type: 'Vista del Vero', value: 18, unit: 'm' }],
      languages: ['Tutte'],
      dmgResist: ['Freddo', 'Fuoco', 'Psichico'], dmgImmune: [], dmgVulner: [],
      condImmune: ['Ammaliato', 'Esausto', 'Spaventato'],
      traits: [
        { name: 'Magia del Circolo', desc: 'Finché si trova entro 9 metri da almeno altre due megere alleate, l\'arcistrega può lanciare uno dei seguenti incantesimi senza componenti materiali, usando l\'Intelligenza come caratteristica da incantatore (CD 19): Presagio (Augury), Trova Famiglio (Find Familiar), Identificare (Identify), Localizza Oggetto (Locate Object), Scrutare (Scrying), Servitore Inosservato (Unseen Servant).\nDopo aver usato questo tratto, deve completare un riposo lungo prima di poterlo usare di nuovo.' },
        { name: 'Resistenza Leggendaria', desc: '(4/Giorno, oppure 5/Giorno nella Tana)\nSe fallisce un tiro salvezza, l\'arcistrega può scegliere di superarlo invece.' },
        { name: 'Resistenza Magica', desc: 'L\'arcistrega ha vantaggio ai tiri salvezza contro incantesimi e altri effetti magici.' },
        { name: 'Fuga Rancorosa', desc: 'Quando l\'arcistrega scende a 0 punti ferita, muore soltanto se si trova entro 9 metri dal proprio anatema. In caso contrario scende invece a 1 punto ferita, si teletrasporta in un semipiano innocuo e non può ritornare sul piano che ha lasciato per 2d6 giorni.\nQuando scompare, ogni creatura entro 18 metri dal punto in cui si trovava viene maledetta. Finché dura la maledizione la creatura ha svantaggio alle prove di caratteristica e ai tiri salvezza, e l\'arcistrega ne conosce la posizione in qualunque punto del multiverso.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'L\'arcistrega effettua due attacchi Artiglio Spettrale e utilizza Onda Crepitante.' },
        { name: 'Artiglio Spettrale', desc: 'Attacco in mischia o a distanza: +14 a colpire, portata 3 m oppure gittata 18 m.\nColpito: 17 (3d6 + 7) danni da forza.\nSe il bersaglio è di taglia Grande o inferiore, ottiene la condizione Prono.', atkHit: '+14', atkDmgs: [{ f: '3d6+7', t: 'forza' }] },
        { name: 'Onda Crepitante', desc: 'Tiro Salvezza su Destrezza: CD 22. Ogni creatura in un cono di 18 metri.\nFallimento: 32 (5d12) danni da fulmine. Successo: metà danni.\nIn ogni caso il bersaglio viene maledetto fino alla fine del turno successivo dell\'arcistrega; finché dura la maledizione non può effettuare reazioni.', atkDmgs: [{ f: '5d12', t: 'fulmine' }] },
        { name: 'Incantare', desc: 'L\'arcistrega lancia uno dei seguenti incantesimi senza componenti materiali, usando il Carisma come caratteristica da incantatore (CD 22).\n\nA volontà: Individuazione dei Pensieri (Detect Thoughts), Porta Dimensionale (Dimension Door), Dissolvi Magie (Dispel Magic), Trama Ipnotica (Hypnotic Pattern).\n\n2 volte al giorno ciascuno: Suggestione di Massa (Mass Suggestion), Modificare Memoria (Modify Memory), Spostamento Planare (Plane Shift).' }
      ],
      bonusActions: [
        { name: 'Colpo della Strega', desc: 'Ogni creatura maledetta dall\'arcistrega e situata entro 18 metri da essa subisce 14 (4d6) danni da fulmine.', atkDmgs: [{ f: '4d6', t: 'fulmine' }] }
      ],
      reactions: [
        { name: 'Scioglilingua', desc: 'L\'arcistrega lancia Controincantesimo (Counterspell) in risposta al normale innesco dell\'incantesimo, usando la stessa caratteristica da incantatore di Incantare.\nSe il bersaglio fallisce il tiro salvezza richiesto da Controincantesimo, viene maledetto fino alla fine del proprio turno successivo: non può lanciare incantesimi con componenti verbali e, quando parla, dice l\'opposto di ciò che intende esprimere.' }
      ],
      legendaryActions: [
        { name: 'Usi (3 per round, 4 nella Tana)', desc: 'L\'arcistrega può usare una sola azione leggendaria alla volta, immediatamente dopo il turno di un\'altra creatura. Recupera tutti gli usi spesi all\'inizio del proprio turno.' },
        { name: 'Sferzata della Megera', desc: 'L\'arcistrega effettua un attacco Artiglio Spettrale.', atkHit: '+14', atkDmgs: [{ f: '3d6+7', t: 'forza' }] },
        { name: 'Magia Malevola', desc: 'L\'arcistrega utilizza Incantare per lanciare Porta Dimensionale (Dimension Door) oppure Trama Ipnotica (Hypnotic Pattern). Non può usare di nuovo questa azione fino all\'inizio del proprio turno successivo.' }
      ],
      drop: [{ name: 'Conoscenze Arcane', desc: 'Segreti proibiti, magie bizzarre e conoscenze del multiverso — ma ogni segreto ha un prezzo.' }],
      notes: 'Megera dei Segreti Proibiti e della Malizia Magica\n\nHabitat: Qualsiasi\nTesoro: Conoscenze Arcane\n\nImmortali e imprevedibili, le arcistreghe accumulano segreti e stringono strani patti magici, alterando il destino per soddisfare i propri capricci. Queste eterne cospiratrici inseguono i misteri del multiverso e praticano magie bizzarre per perseguire obiettivi insondabili.\n\nLe arcistreghe sono egoiste, avide e imprevedibili, caratterizzate da ossessioni e fascinazioni eccentriche. Nonostante ciò, stringono spesso accordi per favorire i propri piani. Sono fonti inesauribili di conoscenze segrete, soprattutto riguardo alla magia proibita e ai misteri del multiverso.\n\nPossono condividere ciò che sanno, ma ogni segreto ha sempre un prezzo: in cambio possono richiedere missioni insolite, oggetti magici preziosi o valute soprannaturali come ricordi, anni di vita o persino la capacità di piangere.\n\nLa maggior parte evita il combattimento, ma quando è costretta a lottare scatena magie devastanti: artigli spettrali, fulmini crepitanti e incantesimi capaci di piegare la mente. Anche quando sembrano sconfitte, le loro preparazioni permettono di fuggire e tramare vendetta.\n\n— Anatemi dell\'Arcistrega —\nOgni arcistrega ha una debolezza unica legata a un evento del passato o a qualcosa che rappresenta l\'opposto della sua magia. Non può essere ferita fisicamente dal proprio anatema, ma può essere distrutta definitivamente solo quando la sua debolezza si trova nelle vicinanze.\n\nTabella degli Anatemi (d10):\n1. Le ossa del suo primo amore.\n2. Una lacrima di diavolo.\n3. Un uovo contenente un castello in miniatura.\n4. Un fiore che sboccia soltanto quando il tempo si ferma.\n5. Un dono ricevuto dalla sua gemella.\n6. La peggiore battuta del multiverso.\n7. Uno dei denti perduti dell\'arcistrega.\n8. Neve raccolta dalla cima del Monte Celestia.\n9. Una stella strappata dal cielo.\n10. Un filo proveniente dalle vesti della Signora del Dolore.\n\n— Tana dell\'Arcistrega —\nOgni arcistrega crea una dimora magica: un semipiano nascosto, un maniero sospeso su una nube tempestosa o, come Baba Yaga, una capanna su gigantesche zampe di gallina. Gli interni mutano spesso o mostrano caratteristiche assurde e disorientanti.\n\nEffetti regionali (entro 1,6 km dalla tana):\nLapsus di Lingua: le creature diverse dall\'arcistrega e dai suoi alleati sottraggono 1d10 a tutte le prove di caratteristica fatte usando l\'azione Influenzare.\nMagia Ficcanaso: quando una creatura non alleata completa un riposo lungo entro 1 miglio dalla tana, il primo incantesimo che lancia con uno slot provoca anche l\'effetto di Confusione centrato su sé stessa (usa la caratteristica da incantatore della creatura, nessuna concentrazione).\nSe l\'arcistrega è distrutta o abbandona la tana, questi effetti terminano.'
    },
    {
      id: 'preset_assassino', name: 'Assassino', emoji: '🥷', rarity: 'uncommon',
      type: 'Umanoide', size: 'Media', alignment: 'Neutrale',
      ac: 16, hp: 97, hpCur: 97, hpTemp: 0, hpDice: '15d8+30', init: 10,
      speed: '9 m', cr: '8', xp: '',
      str: 11, dex: 18, con: 14, intl: 16, wis: 11, cha: 10,
      savesOverride: { str: '', dex: '7', con: '', intl: '6', wis: '', cha: '' },
      skillOverrides: { acrobazia: '7', furtivita: '10', percezione: '6' },
      passivePerception: 16, senses: [],
      languages: ['Comune', 'Gergo dei Ladri'],
      dmgResist: ['Veleno'], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [
        { name: 'Eludere', desc: 'Quando l\'assassino è soggetto a un effetto che gli consente di effettuare un tiro salvezza su Destrezza per subire metà danni, non subisce alcun danno se supera il tiro salvezza e solo metà danni se lo fallisce.\nNon può usare questo tratto mentre è Incapacitato.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'L\'assassino effettua tre attacchi, utilizzando Spada Corta e Balestra Leggera in qualsiasi combinazione.' },
        { name: 'Spada Corta', desc: 'Attacco in mischia: +7 a colpire, portata 1,5 m.\nColpito: 7 (1d6 + 4) danni perforanti più 17 (5d6) danni da veleno.\nIl bersaglio ottiene la condizione Avvelenato fino all\'inizio del turno successivo dell\'assassino.', atkHit: '+7', atkDmgs: [{ f: '1d6+4', t: 'perforanti' }, { f: '5d6', t: 'veleno' }] },
        { name: 'Balestra Leggera', desc: 'Attacco a distanza: +7 a colpire, gittata 24/96 m.\nColpito: 8 (1d8 + 4) danni perforanti più 21 (6d6) danni da veleno.', atkHit: '+7', atkDmgs: [{ f: '1d8+4', t: 'perforanti' }, { f: '6d6', t: 'veleno' }] }
      ],
      bonusActions: [
        { name: 'Azione Scaltra', desc: 'L\'assassino esegue una delle seguenti azioni: Scatto, Disimpegno oppure Nascondersi.' }
      ],
      reactions: [], legendaryActions: [],
      drop: [{ name: 'Equipaggiamento', desc: 'Balestra Leggera, Spada Corta, Armatura di Cuoio Borchiato e oggetti personali.' }],
      notes: 'Sicario a Contratto\n\nHabitat: Qualsiasi\nTesoro: Equipaggiamento, Oggetti Personali\n\nGli assassini sono killer professionisti specializzati nell\'avvicinarsi furtivamente alle proprie vittime e colpire senza essere visti.\n\nLa maggior parte di essi uccide per una ragione precisa, mettendosi al servizio di ricchi committenti o combattendo per cause prive di scrupoli. Utilizzano veleni e altri strumenti letali e spesso trasportano equipaggiamento utile per infiltrarsi in luoghi protetti o evitare la cattura.\n\nMolti assassini seguono un rigido codice professionale oppure possiedono una caratteristica distintiva che li rende celebri.\n\n— Metodi Operativi dell\'Assassino (d6) —\n1. Disporre le proprie vittime in macabri tableaux artistici.\n2. Nascondersi all\'interno di grandi oggetti, come armature complete o mobili cavi.\n3. Lasciare un segno distintivo, come una carta da visita, un fiore, una conchiglia o un dente.\n4. Fingersi una celebrità, una figura religiosa o un servitore.\n5. Conservare trofei sottratti alle proprie vittime.\n6. Utilizzare un veleno dal colore o dall\'odore caratteristico.'
    },
    {
      id: 'preset_arbusto_risvegliato', name: 'Arbusto Risvegliato', emoji: '🌿', rarity: 'uncommon',
      type: 'Pianta', size: 'Piccola', alignment: 'Neutrale',
      ac: 9, hp: 10, hpCur: 10, hpTemp: 0, hpDice: '3d6', init: -1,
      speed: '6 m', cr: '0', xp: '',
      str: 3, dex: 8, con: 11, intl: 10, wis: 10, cha: 6,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: {},
      passivePerception: 10, senses: [],
      languages: ['Comune', 'Un\'altra lingua a scelta'],
      dmgResist: ['Perforante'], dmgImmune: [], dmgVulner: ['Fuoco'], condImmune: [],
      traits: [],
      actions: [
        { name: 'Graffio', desc: 'Attacco in mischia: +1 a colpire, portata 1,5 m.\nColpito: 1 danno tagliente.', atkHit: '+1', atkDmgs: [{ f: '1', t: 'tagliente' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [],
      notes: 'Vegetazione Dotata di Vita Magica\n\nHabitat: Foreste\nTesoro: Nessuno\n\nGli arbusti risvegliati possono assumere l\'aspetto di qualsiasi piccola pianta, dai cespugli delle foreste ai gruppi di fiori. Spesso si trovano nei pressi di alberi risvegliati o in regioni permeate da magia primordiale. Alcuni presentano forme bizzarre o fogliame che ricorda vagamente lineamenti del volto, mentre altri assomigliano a statue vegetali animate raffiguranti animali.\n\n' + PIANTE_LORE
    },
    {
      id: 'preset_albero_risvegliato', name: 'Albero Risvegliato', emoji: '🌳', rarity: 'uncommon',
      type: 'Pianta', size: 'Enorme', alignment: 'Neutrale',
      ac: 13, hp: 59, hpCur: 59, hpTemp: 0, hpDice: '7d12+14', init: -2,
      speed: '6 m', cr: '2', xp: '',
      str: 19, dex: 6, con: 15, intl: 10, wis: 10, cha: 7,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: {},
      passivePerception: 10, senses: [],
      languages: ['Comune', 'Un\'altra lingua a scelta'],
      dmgResist: ['Contundente', 'Perforante'], dmgImmune: [], dmgVulner: ['Fuoco'], condImmune: [],
      traits: [],
      actions: [
        { name: 'Schianto', desc: 'Attacco in mischia: +6 a colpire, portata 3 m.\nColpito: 14 (3d6 + 4) danni contundenti.', atkHit: '+6', atkDmgs: [{ f: '3d6+4', t: 'contundenti' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [],
      notes: 'Vegetazione Dotata di Vita Magica\n\nHabitat: Foreste\nTesoro: Nessuno\n\nAlcuni alberi risvegliati rimangono immobili per lunghi periodi in uno stato quasi meditativo, rendendosi facilmente confondibili con alberi normali. Altri pattugliano invece territori intrisi di potere naturale.\n\nTalvolta vengono animati dall\'influenza del Feywild, assumendo colori vivaci e fioriture perenni. Altri sono plasmati dall\'energia dello Shadowfell, che li ricopre di nodi contorti e deformità inquietanti, conferendo loro un aspetto quasi privo di vita.\n\n' + PIANTE_LORE
    },
    {
      id: 'preset_becco_ascia', name: 'Becco d\'Ascia', emoji: '🦤', rarity: 'common',
      type: 'Mostruosità', size: 'Grande', alignment: 'Senza Allineamento',
      ac: 11, hp: 19, hpCur: 19, hpTemp: 0, hpDice: '3d10+3', init: 1,
      speed: '15 m', cr: '1/4', xp: '',
      str: 14, dex: 12, con: 12, intl: 2, wis: 10, cha: 5,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: {},
      passivePerception: 10, senses: [],
      languages: ['Nessuna'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Becco', desc: 'Attacco in mischia: +4 a colpire, portata 1,5 m.\nColpito: 6 (1d8 + 2) danni taglienti.', atkHit: '+4', atkDmgs: [{ f: '1d8+2', t: 'taglienti' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [],
      notes: 'Predatore Aviano Incapace di Volare\n\nHabitat: Artico, Praterie, Colline\nTesoro: Nessuno\n\nSolitari o riuniti in piccoli gruppi, i becchi d\'ascia cacciano per nutrire il proprio stormo. Quando agiscono insieme usano tattiche rudimentali: alcuni distraggono le minacce mentre altri attaccano i bersagli più vulnerabili o conducono i giovani esemplari al sicuro.\n\n' + BECCO_LORE
    },
    {
      id: 'preset_becco_ascia_gigante', name: 'Becco d\'Ascia Gigante', emoji: '🦤', rarity: 'uncommon',
      type: 'Mostruosità', size: 'Enorme', alignment: 'Senza Allineamento',
      ac: 15, hp: 84, hpCur: 84, hpTemp: 0, hpDice: '8d12+32', init: 5,
      speed: '15 m', cr: '5', xp: '',
      str: 21, dex: 14, con: 19, intl: 3, wis: 12, cha: 5,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { percezione: '4' },
      passivePerception: 14, senses: [],
      languages: ['Nessuna'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Multiattacco', desc: 'Il becco d\'ascia gigante effettua un attacco Becco Affilato e un attacco Artigli.' },
        { name: 'Becco Affilato', desc: 'Attacco in mischia: +8 a colpire, portata 3 m.\nColpito: 18 (2d12 + 5) danni taglienti.\nInoltre, una creatura entro 1,5 metri dal bersaglio colpito (a scelta del becco d\'ascia) subisce 6 (1d12) danni taglienti.', atkHit: '+8', atkDmgs: [{ f: '2d12+5', t: 'taglienti' }, { f: '1d12', t: 'taglienti (a un vicino)' }] },
        { name: 'Artigli', desc: 'Attacco in mischia: +8 a colpire, portata 1,5 m.\nColpito: 14 (2d8 + 5) danni perforanti.\nSe il bersaglio è una creatura di taglia Grande o inferiore, ottiene la condizione Prono.', atkHit: '+8', atkDmgs: [{ f: '2d8+5', t: 'perforanti' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [],
      notes: 'Predatore Aviano Incapace di Volare\n\nHabitat: Artico, Praterie, Colline\nTesoro: Nessuno\n\nI becchi d\'ascia giganti abitano generalmente regioni isolate e selvagge, come isole remote o terre primordiali inesplorate. Spesso competono con dinosauri e altre bestie gigantesche per il controllo del territorio.\n\n' + BECCO_LORE
    },
    {
      id: 'preset_piromante_azer', name: 'Piromante Azer', emoji: '🔥', rarity: 'rare',
      type: 'Elementale', size: 'Media', alignment: 'Legale Neutrale',
      ac: 18, hp: 97, hpCur: 97, hpTemp: 0, hpDice: '13d8+39', init: 2,
      speed: '9 m', cr: '6', xp: '',
      str: 15, dex: 14, con: 16, intl: 12, wis: 18, cha: 13,
      savesOverride: { str: '', dex: '', con: '6', intl: '', wis: '7', cha: '' },
      skillOverrides: { arcano: '4', percezione: '7' },
      passivePerception: 17, senses: [],
      languages: ['Primordiale (Ignan)'],
      dmgResist: [], dmgImmune: ['Fuoco', 'Veleno'], dmgVulner: [], condImmune: ['Avvelenato'],
      traits: [
        { name: 'Aura di Fuoco', desc: 'Alla fine di ciascun turno dell\'azer, ogni creatura a sua scelta entro un\'emanazione di 1,5 metri subisce 11 (2d10) danni da fuoco, a meno che l\'azer non sia Incapacitato.' },
        { name: 'Illuminazione', desc: 'L\'azer emette luce intensa entro 3 metri e luce fioca per ulteriori 3 metri.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il piromante azer effettua due attacchi Esplosione di Fiamma.' },
        { name: 'Esplosione di Fiamma', desc: 'Attacco in mischia o a distanza: +7 a colpire, portata 1,5 m oppure gittata 36 m.\nColpito: 15 (2d10 + 4) danni da fuoco.', atkHit: '+7', atkDmgs: [{ f: '2d10+4', t: 'fuoco' }] },
        { name: 'Incantare', desc: 'L\'azer lancia uno dei seguenti incantesimi senza componenti materiali, usando la Saggezza come caratteristica da incantatore (CD 15).\n\nA volontà: Elementalismo (Elementalism), Mano Magica (Mage Hand).\n\n1 volta al giorno: Palla di Fuoco (Fireball).' }
      ],
      bonusActions: [],
      reactions: [
        { name: 'Intimorire Infernale (2/Giorno)', desc: 'L\'azer lancia Intimorire Infernale (Hellish Rebuke) in risposta al normale innesco dell\'incantesimo, usando la stessa caratteristica da incantatore di Incantare.' }
      ],
      legendaryActions: [],
      drop: [{ name: 'Armamenti', desc: 'Armi e oggetti personali forgiati nelle fornaci azer.' }],
      notes: 'Fabbri Ardenti di Metallo Vivente\n\nHabitat: Montagne, Piani (Piano Elementale del Fuoco)\nTesoro: Armamenti, Oggetti Personali\n\nI piromanti azer evocano fiamme dal Piano Elementale del Fuoco per difendersi e alimentare forge magiche.\n\n' + AZER_LORE
    },
    {
      id: 'preset_sentinella_azer', name: 'Sentinella Azer', emoji: '🔨', rarity: 'uncommon',
      type: 'Elementale', size: 'Media', alignment: 'Legale Neutrale',
      ac: 17, hp: 39, hpCur: 39, hpTemp: 0, hpDice: '6d8+12', init: 1,
      speed: '9 m', cr: '2', xp: '',
      str: 17, dex: 12, con: 15, intl: 12, wis: 13, cha: 10,
      savesOverride: { str: '', dex: '', con: '4', intl: '', wis: '', cha: '' },
      skillOverrides: {},
      passivePerception: 11, senses: [],
      languages: ['Primordiale (Ignan)'],
      dmgResist: [], dmgImmune: ['Fuoco', 'Veleno'], dmgVulner: [], condImmune: ['Avvelenato'],
      traits: [
        { name: 'Aura di Fuoco', desc: 'Alla fine di ciascun turno dell\'azer, ogni creatura a sua scelta entro un\'emanazione di 1,5 metri subisce 5 (1d10) danni da fuoco, a meno che l\'azer non sia Incapacitato.' },
        { name: 'Illuminazione', desc: 'L\'azer emette luce intensa entro 3 metri e luce fioca per ulteriori 3 metri.' }
      ],
      actions: [
        { name: 'Martello Ardente', desc: 'Attacco in mischia: +5 a colpire, portata 1,5 m.\nColpito: 8 (1d10 + 3) danni contundenti più 3 (1d6) danni da fuoco.', atkHit: '+5', atkDmgs: [{ f: '1d10+3', t: 'contundenti' }, { f: '1d6', t: 'fuoco' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [{ name: 'Armamenti', desc: 'Armi e oggetti personali forgiati nelle fornaci azer.' }],
      notes: 'Fabbri Ardenti di Metallo Vivente\n\nHabitat: Montagne, Piani (Piano Elementale del Fuoco)\nTesoro: Armamenti, Oggetti Personali\n\nLe sentinelle azer proteggono i fabbri delle loro comunità e incanalano il proprio fuoco attraverso le armi che impugnano.\n\n' + AZER_LORE
    },
    {
      id: 'preset_balor', name: 'Balor', emoji: '👹', rarity: 'legendary',
      type: 'Immondo', size: 'Enorme', alignment: 'Caotico Malvagio',
      ac: 19, hp: 300, hpCur: 300, hpTemp: 0, hpDice: '24d12+144', init: 14,
      speed: '12 m, Volare 24 m', cr: '19', xp: '',
      str: 26, dex: 15, con: 22, intl: 20, wis: 16, cha: 22,
      savesOverride: { str: '', dex: '', con: '12', intl: '', wis: '9', cha: '' },
      skillOverrides: { percezione: '9' },
      passivePerception: 19, senses: [{ type: 'Vista del Vero', value: 36, unit: 'm' }],
      languages: ['Abissale', 'Telepatia 36 m'],
      dmgResist: ['Freddo', 'Fulmine'], dmgImmune: ['Fuoco', 'Veleno'], dmgVulner: [],
      condImmune: ['Ammaliato', 'Avvelenato', 'Spaventato'],
      traits: [
        { name: 'Agonia della Morte', desc: 'Quando il balor muore, esplode.\nTiro Salvezza su Destrezza: CD 20. Ogni creatura entro un\'emanazione di 9 metri dal balor.\nFallimento: 31 (9d6) danni da fuoco più 31 (9d6) danni da forza. Successo: metà danni.\nInoltre, se il balor muore al di fuori dell\'Abisso, ottiene immediatamente un nuovo corpo e ritorna in vita con tutti i propri punti ferita in qualche luogo dell\'Abisso.' },
        { name: 'Aura di Fuoco', desc: 'Alla fine di ciascun turno del balor, ogni creatura entro un\'emanazione di 1,5 metri subisce 13 (3d8) danni da fuoco.' },
        { name: 'Resistenza Leggendaria', desc: '(3/Giorno)\nSe il balor fallisce un tiro salvezza, può scegliere di superarlo invece.' },
        { name: 'Resistenza Magica', desc: 'Il balor ha vantaggio ai tiri salvezza contro incantesimi e altri effetti magici.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il balor effettua un attacco Frusta di Fiamme e un attacco Lama del Fulmine.' },
        { name: 'Frusta di Fiamme', desc: 'Attacco in mischia: +14 a colpire, portata 9 metri.\nColpito: 18 (3d6 + 8) danni da forza più 17 (5d6) danni da fuoco.\nSe il bersaglio è di taglia Enorme o inferiore, viene trascinato fino a 7,5 metri in linea retta verso il balor e ottiene la condizione Prono.', atkHit: '+14', atkDmgs: [{ f: '3d6+8', t: 'forza' }, { f: '5d6', t: 'fuoco' }] },
        { name: 'Lama del Fulmine', desc: 'Attacco in mischia: +14 a colpire, portata 3 metri.\nColpito: 21 (3d8 + 8) danni da forza più 22 (4d10) danni da fulmine.\nIl bersaglio non può effettuare Reazioni fino all\'inizio del turno successivo del balor.', atkHit: '+14', atkDmgs: [{ f: '3d8+8', t: 'forza' }, { f: '4d10', t: 'fulmine' }] }
      ],
      bonusActions: [
        { name: 'Teletrasporto', desc: 'Il balor teletrasporta sé stesso oppure un demone consenziente entro 3 metri da lui fino a 18 metri, in uno spazio libero che può vedere.' }
      ],
      reactions: [], legendaryActions: [],
      drop: [{ name: 'Armamenti', desc: 'La spada del fulmine e la frusta di fiamme del balor, oltre ad altri armamenti abissali.' }],
      notes: 'Demone dell\'Ira Travolgente\n\nHabitat: Piani (Abisso)\nTesoro: Armamenti\n\nI balor incarnano la furia distruttiva e l\'odio dei demoni.\n\nQuesti colossali terrori alati ribollono di rabbia incessante, manifestando la propria collera attraverso ondate di fuoco e due armi terrificanti: una spada di fulmini crepitanti e una frusta di fiamme sferzanti.\n\nL\'ira di un balor persiste fino all\'istante della sua morte, momento in cui esplode in un\'ultima vendetta contro coloro che lo hanno abbattuto.\n\nSignori dei demoni e divinità malvagie sfruttano la furia dei balor facendone comandanti di eserciti infernali o guardiani di segreti proibiti.'
    },
    {
      id: 'preset_bandito', name: 'Bandito', emoji: '🗡️', rarity: 'common',
      type: 'Umanoide', size: 'Media', alignment: 'Neutrale',
      ac: 12, hp: 11, hpCur: 11, hpTemp: 0, hpDice: '2d8+2', init: 1,
      speed: '9 m', cr: '1/8', xp: '',
      str: 11, dex: 12, con: 12, intl: 10, wis: 10, cha: 10,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: {}, passivePerception: 10,
      senses: [], languages: ['Comune', 'Gergo dei Ladri'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Scimitarra', desc: 'Attacco con arma da mischia: +3 a colpire, portata 1,5 metri.\nColpito: 4 (1d6 + 1) danni taglienti.', atkHit: '+3', atkDmgs: [{ f: '1d6+1', t: 'taglienti' }] },
        { name: 'Balestra Leggera', desc: 'Attacco con arma a distanza: +3 a colpire, gittata 24/96 metri.\nColpito: 5 (1d8 + 1) danni perforanti.', atkHit: '+3', atkDmgs: [{ f: '1d8+1', t: 'perforanti' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [{ name: 'Equipaggiamento', desc: 'Armatura di cuoio, balestra leggera, scimitarra, più bottino vario.' }],
      notes: 'Criminali e Canaglie\n\nHabitat: Qualsiasi\nTesoro: Qualsiasi\n\nI banditi sono criminali inesperti che normalmente eseguono gli ordini di membri di rango superiore della propria banda.\n\n' + BANDITI_TAIL
    },
    {
      id: 'preset_capitano_dei_banditi', name: 'Capitano dei Banditi', emoji: '🔫', rarity: 'common',
      type: 'Umanoide', size: 'Media', alignment: 'Neutrale',
      ac: 15, hp: 52, hpCur: 52, hpTemp: 0, hpDice: '8d8+16', init: 3,
      speed: '9 m', cr: '2', xp: '',
      str: 15, dex: 16, con: 14, intl: 14, wis: 11, cha: 14,
      savesOverride: { str: '4', dex: '5', con: '', intl: '', wis: '2', cha: '' },
      skillOverrides: { atletica: '4', inganno: '4' }, passivePerception: 10,
      senses: [], languages: ['Comune', 'Gergo dei Ladri'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Multiattacco', desc: 'Il capitano dei banditi effettua due attacchi, utilizzando Scimitarra e Pistola in qualsiasi combinazione.' },
        { name: 'Scimitarra', desc: 'Attacco con arma da mischia: +5 a colpire, portata 1,5 metri.\nColpito: 6 (1d6 + 3) danni taglienti.', atkHit: '+5', atkDmgs: [{ f: '1d6+3', t: 'taglienti' }] },
        { name: 'Pistola', desc: 'Attacco con arma a distanza: +5 a colpire, gittata 9/27 metri.\nColpito: 8 (1d10 + 3) danni perforanti.', atkHit: '+5', atkDmgs: [{ f: '1d10+3', t: 'perforanti' }] }
      ],
      bonusActions: [],
      reactions: [
        { name: 'Parata', desc: 'Innesco: il capitano dei banditi viene colpito da un attacco in mischia mentre impugna un\'arma.\nRisposta: il capitano aggiunge +2 alla propria Classe Armatura contro quell\'attacco, potenzialmente facendolo mancare.' }
      ],
      legendaryActions: [],
      drop: [{ name: 'Equipaggiamento', desc: 'Pistola, scimitarra, armatura di cuoio borchiato, più bottino vario.' }],
      notes: 'Criminali e Canaglie\n\nHabitat: Qualsiasi\nTesoro: Qualsiasi\n\nI capitani dei banditi guidano bande di furfanti e organizzano rapine dirette e senza complicazioni. Alcuni servono anche come guardie del corpo o uomini di fiducia per criminali più influenti.\n\n' + BANDITI_TAIL
    },
    {
      id: 'preset_ingannatore_dei_banditi', name: 'Ingannatore dei Banditi', emoji: '🎭', rarity: 'uncommon',
      type: 'Umanoide', size: 'Media', alignment: 'Neutrale',
      ac: 16, hp: 130, hpCur: 130, hpTemp: 0, hpDice: '20d8+40', init: 6,
      speed: '9 m', cr: '7', xp: '',
      str: 8, dex: 16, con: 14, intl: 17, wis: 12, cha: 16,
      savesOverride: { str: '', dex: '6', con: '', intl: '6', wis: '', cha: '' },
      skillOverrides: { acrobazia: '6', percezione: '4', furtivita: '9' }, passivePerception: 14,
      senses: [], languages: ['Comune', 'Gergo dei Ladri'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Multiattacco', desc: 'L\'ingannatore effettua tre attacchi con Pugnale.' },
        { name: 'Pugnale', desc: 'Attacco con arma da mischia o a distanza: +6 a colpire, portata 1,5 metri oppure gittata 6/18 metri.\nColpito: 8 (2d4 + 3) danni perforanti più 10 (3d6) danni da veleno.', atkHit: '+6', atkDmgs: [{ f: '2d4+3', t: 'perforanti' }, { f: '3d6', t: 'veleno' }] },
        { name: 'Lampo Accecante (Ricarica 4-6)', desc: 'Tiro Salvezza su Costituzione: CD 14. Ogni creatura entro una sfera di 3 metri di raggio centrata su un punto visibile entro 36 metri.\nFallimento: 13 (3d6 + 3) danni radiosi; il bersaglio ottiene la condizione Accecato fino all\'inizio del turno successivo dell\'ingannatore.\nSuccesso: metà danni.', atkDmgs: [{ f: '3d6+3', t: 'radiosi' }] },
        { name: 'Incantare', desc: 'L\'ingannatore lancia uno dei seguenti incantesimi usando l\'Intelligenza come caratteristica da incantatore (CD 14).\n\nA volontà: Camuffare Sé Stesso, Mano Magica, Illusione Minore.\n\n1 volta al giorno ciascuno: Blocca Persone (versione di 4° livello), Armatura Magica (già inclusa nelle statistiche), Immagine Maggiore.' }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [{ name: 'Equipaggiamento', desc: 'Pugnali (6), bacchetta, più bottino vario.' }],
      notes: 'Criminali e Canaglie\n\nHabitat: Qualsiasi\nTesoro: Qualsiasi\n\nGli ingannatori dei banditi utilizzano la magia per nascondere le proprie attività o creare spettacolari distrazioni.\n\n' + BANDITI_TAIL
    },
    {
      id: 'preset_signore_del_crimine_dei_banditi', name: 'Signore del Crimine dei Banditi', emoji: '🎩', rarity: 'uncommon',
      type: 'Umanoide', size: 'Media', alignment: 'Neutrale',
      ac: 17, hp: 169, hpCur: 169, hpTemp: 0, hpDice: '26d8+52', init: 9,
      speed: '9 m', cr: '11', xp: '',
      str: 10, dex: 20, con: 14, intl: 18, wis: 14, cha: 15,
      savesOverride: { str: '', dex: '9', con: '6', intl: '', wis: '', cha: '' },
      skillOverrides: { acrobazia: '9', percezione: '10', furtivita: '13' }, passivePerception: 20,
      senses: [], languages: ['Comune', 'Gergo dei Ladri'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [
        { name: 'Eludere', desc: 'Quando il signore del crimine è soggetto a un effetto che consente un tiro salvezza su Destrezza per subire soltanto metà danni, non subisce alcun danno se supera il tiro salvezza e soltanto metà danni se lo fallisce.\nNon può utilizzare questo tratto mentre è Incapacitato.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il signore del crimine effettua tre attacchi, utilizzando Scimitarra e Pistola in qualsiasi combinazione.' },
        { name: 'Scimitarra', desc: 'Attacco con arma da mischia: +9 a colpire, portata 1,5 metri.\nColpito: 12 (2d6 + 5) danni taglienti più 14 (4d6) danni da veleno.', atkHit: '+9', atkDmgs: [{ f: '2d6+5', t: 'taglienti' }, { f: '4d6', t: 'veleno' }] },
        { name: 'Pistola', desc: 'Attacco con arma a distanza: +9 a colpire, gittata 9/27 metri.\nColpito: 10 (1d10 + 5) danni perforanti più 14 (4d6) danni da veleno.', atkHit: '+9', atkDmgs: [{ f: '1d10+5', t: 'perforanti' }, { f: '4d6', t: 'veleno' }] }
      ],
      bonusActions: [
        { name: 'Mira Letale', desc: 'Il signore del crimine ottiene Vantaggio al prossimo tiro per colpire effettuato durante il turno corrente.\nSe quell\'attacco colpisce, il bersaglio subisce inoltre 28 (8d6) danni da veleno aggiuntivi.', atkDmgs: [{ f: '8d6', t: 'veleno' }] }
      ],
      reactions: [], legendaryActions: [],
      drop: [{ name: 'Equipaggiamento', desc: 'Pistole (2), scimitarra, armatura di cuoio borchiato, più bottino vario.' }],
      notes: 'Criminali e Canaglie\n\nHabitat: Qualsiasi\nTesoro: Qualsiasi\n\nI signori del crimine manipolano organizzazioni oscure e mettono sempre la propria sopravvivenza davanti a qualsiasi sottoposto o piano.\n\n' + BANDITI_TAIL
    },
    {
      id: 'preset_banshee', name: 'Banshee', emoji: '👻', rarity: 'rare',
      type: 'Non Morto', size: 'Media', alignment: 'Caotico Malvagio',
      ac: 12, hp: 54, hpCur: 54, hpTemp: 0, hpDice: '12d8', init: 2,
      speed: '1,5 m, Volare 12 m (fluttuare)', cr: '4', xp: '',
      str: 1, dex: 14, con: 10, intl: 12, wis: 11, cha: 17,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '2', cha: '' },
      skillOverrides: {}, passivePerception: 10,
      senses: [{ type: 'Scurovisione', value: 18, unit: 'm' }], languages: ['Comune', 'Elfico'],
      dmgResist: ['Acido', 'Contundente', 'Fuoco', 'Fulmine', 'Perforante', 'Tagliente', 'Tuono'],
      dmgImmune: ['Freddo', 'Necrotico', 'Veleno'], dmgVulner: [],
      condImmune: ['Ammaliato', 'Afferrato', 'Avvelenato', 'Esausto', 'Spaventato', 'Paralizzato', 'Pietrificato', 'Prono', 'Trattenuto'],
      traits: [
        { name: 'Percepire la Vita', desc: 'La banshee percepisce magicamente la direzione delle creature entro 1 miglio (1,6 km) che non siano Costrutti o Non Morti.' },
        { name: 'Movimento Incorporeo', desc: 'La banshee può attraversare creature e oggetti come se fossero terreno difficile.\nSubisce 5 (1d10) danni da forza se termina il proprio turno all\'interno di un oggetto.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'La banshee effettua due attacchi Tocco Corrotto e utilizza Terrificare.' },
        { name: 'Tocco Corrotto', desc: 'Attacco con arma da mischia: +5 a colpire, portata 1,5 metri.\nColpito: 7 (1d8 + 3) danni necrotici.', atkHit: '+5', atkDmgs: [{ f: '1d8+3', t: 'necrotici' }] },
        { name: 'Terrificare', desc: 'Tiro Salvezza su Saggezza: CD 13. Una creatura entro 18 metri che la banshee possa vedere e che possa vedere la banshee.\nFallimento: il bersaglio ottiene la condizione Spaventato fino all\'inizio del turno successivo della banshee.\nSuccesso: il bersaglio diventa immune all\'Aspetto Terrificante di questa banshee per 24 ore.' },
        { name: 'Lamento Mortale (1/Giorno)', desc: 'La banshee emette un lamento funebre se non si trova alla luce del sole. Tiro Salvezza su Costituzione: CD 13. Ogni creatura entro 9 metri che possa udire il lamento e che non sia un Costrutto o un Non Morto.\nFallimento: se il bersaglio possiede 25 punti ferita o meno, i suoi punti ferita scendono immediatamente a 0; altrimenti subisce 10 (3d6) danni psichici.\nSuccesso: nessun effetto aggiuntivo oltre ai normali effetti del tiro salvezza.', atkDmgs: [{ f: '3d6', t: 'psichici' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [{ name: 'Reliquie', desc: 'Oggetti e cimeli legati al tormento irrisolto della banshee.' }],
      notes: 'Messaggera Urlante della Morte\n\nHabitat: Qualsiasi\nTesoro: Reliquie\n\nPresagi di sventura e pestilenza per i viventi, le banshee sono spiriti ossessionati da amarezza o dolore irrisolti.\n\nQuesti celebri fantasmi uccidono chiunque li guardi o ascolti i loro lamenti funebri. Sebbene qualunque anima tormentata possa trasformarsi in una banshee, alcune comunità le temono particolarmente e credono che coloro che accumulano o distruggono la bellezza — naturale o artificiale — rischino di ritornare come banshee dopo la morte.\n\nMolte forme di sofferenza possono dare origine a una banshee. Tira un dado o scegli un risultato dalla tabella seguente per determinare quale tragedia l\'abbia generata.\n\nDolori della Banshee (tira 1d6 o scegli) — Il tormento spinge la banshee a...\n1) Apparire prima della morte di un membro della famiglia.\n2) Infestare il luogo in cui è stata giustiziata.\n3) Piangere un amore perduto e infestare la sua tomba.\n4) Annunciare una catastrofe o una tragedia imminente.\n5) Cercare la restituzione di un tesoro rubato.\n6) Uccidere coloro che sono più belli di quanto fosse in vita.'
    },
    {
      id: 'preset_diavolo_uncinato', name: 'Diavolo Uncinato', emoji: '😈', rarity: 'uncommon',
      type: 'Immondo', size: 'Media', alignment: 'Legale Malvagio',
      ac: 15, hp: 110, hpCur: 110, hpTemp: 0, hpDice: '13d8+52', init: 3,
      speed: '9 m, Scalare 9 m', cr: '5', xp: '',
      str: 16, dex: 17, con: 18, intl: 12, wis: 14, cha: 14,
      savesOverride: { str: '6', dex: '', con: '7', intl: '', wis: '5', cha: '5' },
      skillOverrides: { inganno: '5', intuizione: '5', percezione: '8' }, passivePerception: 18,
      senses: [{ type: 'Vista del Diavolo', value: 36, unit: 'm' }], languages: ['Infernale', 'Telepatia 36 m'],
      dmgResist: ['Freddo'], dmgImmune: ['Fuoco', 'Veleno'], dmgVulner: [],
      condImmune: ['Avvelenato'],
      traits: [
        { name: 'Pelle Spinata', desc: 'All\'inizio di ciascuno dei suoi turni, il diavolo infligge 5 (1d10) danni perforanti a qualsiasi creatura che stia afferrando o che sia afferrata da lui.' },
        { name: 'Rigenerazione Diabolica', desc: 'Se il diavolo muore al di fuori dei Nove Inferi, il suo corpo svanisce in una nube di fumo sulfureo.\nOttiene immediatamente un nuovo corpo e ritorna in vita con tutti i suoi punti ferita in un luogo dei Nove Inferi.' },
        { name: 'Resistenza Magica', desc: 'Il diavolo possiede vantaggio ai tiri salvezza contro incantesimi e altri effetti magici.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il diavolo effettua un attacco Artigli e un attacco Coda, oppure due attacchi Scagliare Fiamma.' },
        { name: 'Artigli', desc: 'Attacco con arma da mischia: +6 a colpire, portata 1,5 metri.\nColpito: 10 (2d6 + 3) danni perforanti. Se il bersaglio è una creatura di taglia Grande o inferiore, ottiene la condizione Afferrato (CD 13 per liberarsi) da entrambi gli artigli del diavolo.', atkHit: '+6', atkDmgs: [{ f: '2d6+3', t: 'perforanti' }] },
        { name: 'Coda', desc: 'Attacco con arma da mischia: +6 a colpire, portata 3 metri.\nColpito: 14 (2d10 + 3) danni taglienti.', atkHit: '+6', atkDmgs: [{ f: '2d10+3', t: 'taglienti' }] },
        { name: 'Scagliare Fiamma', desc: 'Attacco con arma a distanza: +5 a colpire, gittata 45 metri.\nColpito: 17 (5d6) danni da fuoco. Se il bersaglio è un oggetto infiammabile che non viene indossato o trasportato, prende fuoco.', atkHit: '+5', atkDmgs: [{ f: '5d6', t: 'fuoco' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [{ name: 'Tesoro', desc: 'Parte della collezione del diavolo: manufatti rari, simboli di potere e trofei sottratti ai ladri falliti.' }],
      notes: 'Diavolo dell\'Avidità e dell\'Ossessione\n\nHabitat: Piani (Nove Inferi)\nTesoro: Qualsiasi\n\nCollezionisti infernali, i diavoli uncinati proteggono fanaticamente i propri tesori e perlustrano i piani dell\'esistenza alla ricerca di nuove aggiunte alle loro collezioni.\n\nConosciuti tra le schiere dei Nove Inferi come hamatula, questi diavoli adornano le loro pelli spinose con i possedimenti più preziosi e con trofei sottratti a coloro che hanno fallito nel tentativo di derubarli. Quando vengono minacciati, colpiscono con i loro arti ricoperti di spine e scagliano fiamme infernali contro i nemici.\n\nI diavoli uncinati servono spesso come guardie e contabili per generali di diavoli del ghiaccio, signori delle fosse, arcidiavoli e altri potenti malvagi. In cambio ottengono protezione per le proprie collezioni. Molti mantengono inoltre reti di imp e servitori incaricati di cercare nei vari piani tesori d\'interesse o mortali particolarmente avidi.\n\nRaramente raccolgono oggetti comuni come monete o gemme. Preferiscono invece possedere la più grande collezione esistente di una specifica categoria di oggetti, solitamente manufatti rari o simboli di potere. I diavoli uncinati non rubano ciò che desiderano: stipulano patti per ottenere sia tesori che anime mortali.'
    },
    {
      id: 'preset_barlgura', name: 'Barlgura', emoji: '🦍', rarity: 'uncommon',
      type: 'Immondo', size: 'Grande', alignment: 'Caotico Malvagio',
      ac: 15, hp: 85, hpCur: 85, hpTemp: 0, hpDice: '10d10+30', init: 2,
      speed: '12 m, Scalare 12 m', cr: '5', xp: '',
      str: 18, dex: 15, con: 16, intl: 7, wis: 14, cha: 9,
      savesOverride: { str: '', dex: '5', con: '6', intl: '', wis: '', cha: '' },
      skillOverrides: { percezione: '5', furtivita: '5' }, passivePerception: 15,
      senses: [{ type: 'Vista Cieca', value: 9, unit: 'm' }, { type: 'Scurovisione', value: 36, unit: 'm' }], languages: ['Abissale', 'Telepatia 36 m'],
      dmgResist: ['Freddo', 'Fuoco', 'Fulmine'], dmgImmune: ['Veleno'], dmgVulner: [],
      condImmune: ['Avvelenato'],
      traits: [
        { name: 'Rigenerazione Demoniaca', desc: 'Se la barlgura muore al di fuori dell\'Abisso, il suo corpo si dissolve in icore e ottiene immediatamente un nuovo corpo, tornando in vita con tutti i suoi punti ferita in qualche luogo dell\'Abisso.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'La barlgura effettua un attacco Morso Tormentatore e due attacchi Percossa.' },
        { name: 'Morso Tormentatore', desc: 'Attacco con arma da mischia: +7 a colpire, portata 1,5 metri.\nColpito: 11 (2d6 + 4) danni perforanti più 13 (2d12) danni psichici.', atkHit: '+7', atkDmgs: [{ f: '2d6+4', t: 'perforanti' }, { f: '2d12', t: 'psichici' }] },
        { name: 'Percossa', desc: 'Attacco con arma da mischia: +7 a colpire, portata 1,5 metri.\nColpito: 9 (1d10 + 4) danni contundenti. Se il bersaglio è una creatura di taglia Grande o inferiore, ottiene la condizione Prono.', atkHit: '+7', atkDmgs: [{ f: '1d10+4', t: 'contundenti' }] },
        { name: 'Incantare', desc: 'La barlgura lancia uno dei seguenti incantesimi senza componenti materiali, usando la Saggezza come caratteristica da incantatore (CD 13).\n\n2 volte al giorno ciascuno: Camuffare Sé Stesso, Invisibilità (solo su sé stessa).\n\n1 volta al giorno ciascuno: Intralciare, Assassino Fantasmatico (versione di 6° livello).' }
      ],
      bonusActions: [
        { name: 'Balzo', desc: 'La barlgura salta fino a 12 metri spendendo 3 metri del proprio movimento.' }
      ],
      reactions: [], legendaryActions: [],
      drop: [{ name: 'Tesoro', desc: 'Trofei di antiche cacce e simboli demoniaci sottratti alle prede.' }],
      notes: 'Demone dell\'Istinto e della Violenza Primordiale\n\nHabitat: Piani (Abisso)\nTesoro: Qualsiasi\n\nLe barlgura sono demoni che incarnano la brutalità e l\'istinto omicida. Cacciano senza pietà qualsiasi creatura entri nei loro territori, che si tratti delle terre selvagge dell\'Abisso o di luoghi in cui sono state evocate da malvagi incantatori.\n\nLe barlgura disseminano i propri domini di simboli demoniaci e terrificanti prove delle loro uccisioni.\n\nCooperano con altri demoni, specialmente con altre barlgura, purché vi siano prede in abbondanza. Se una regione viene privata di vittime da massacrare, questi demoni finiscono per rivolgere la propria ferocia gli uni contro gli altri, dando origine a scontri devastanti.\n\nL\'aspetto delle barlgura varia notevolmente, ma tutte possiedono corpi possenti e mani capaci di arrampicarsi rapidamente e infliggere colpi schiaccianti. Quando la sola forza bruta non basta, ricorrono alla magia demoniaca per evocare illusioni terrificanti e liane avvinghianti.\n\nLa maggior parte delle barlgura ricorda scimmie mostruose da incubo, mentre altre mostrano caratteristiche esagerate di predatori tipici delle terre che abitano. Molte incorporano trofei di antiche cacce direttamente nelle proprie carni demoniache.'
    },
    {
      id: 'preset_basilisco', name: 'Basilisco', emoji: '🦎', rarity: 'rare',
      type: 'Mostruosità', size: 'Media', alignment: 'Senza Allineamento',
      ac: 15, hp: 52, hpCur: 52, hpTemp: 0, hpDice: '8d8+16', init: -1,
      speed: '6 m', cr: '3', xp: '',
      str: 16, dex: 8, con: 15, intl: 2, wis: 8, cha: 7,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: {}, passivePerception: 9,
      senses: [{ type: 'Scurovisione', value: 18, unit: 'm' }], languages: [],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Morso', desc: 'Attacco con arma da mischia: +5 a colpire, portata 1,5 metri.\nColpito: 10 (2d6 + 3) danni perforanti più 7 (2d6) danni da veleno.', atkHit: '+5', atkDmgs: [{ f: '2d6+3', t: 'perforanti' }, { f: '2d6', t: 'veleno' }] }
      ],
      bonusActions: [
        { name: 'Sguardo Pietrificante (Ricarica 4-6)', desc: 'Tiro Salvezza su Costituzione: CD 12. Ogni creatura entro un cono di 9 metri. Se il basilisco vede il proprio riflesso all\'interno del cono, deve effettuare anch\'esso il tiro salvezza.\nPrimo Fallimento: il bersaglio ottiene la condizione Trattenuto e ripete il tiro salvezza alla fine del proprio turno successivo se è ancora trattenuto (con un successo, l\'effetto termina).\nSecondo Fallimento: la condizione Trattenuto viene sostituita dalla condizione Pietrificato.' }
      ],
      reactions: [], legendaryActions: [],
      drop: [{ name: 'Tesoro', desc: 'Ricchezze custodite dal basilisco e resti pietrificati delle sue prede.' }],
      notes: 'Guardiano Rettiliano dallo Sguardo Pietrificante\n\nHabitat: Montagne, Sottosuolo\nTesoro: Qualsiasi\n\nI basilischi sono predatori massicci dotati di otto zampe artigliate, spine cristalline e potenti mascelle.\n\nPiuttosto che inseguire le prede, utilizzano il loro sguardo soprannaturale per trasformare le creature in pietra e consumarle con calma in seguito. Sebbene preferiscano tane sotterranee, molti basilischi vengono catturati e tenuti da individui senza scrupoli come guardiani di tesori e ricchezze.\n\nI resti delle creature pietrificate costellano le aree in cui un basilisco caccia. Possono trattarsi di comuni avventurieri oppure di esseri molto più insoliti che hanno avuto la sfortuna di incrociare il suo sguardo. Tira un dado o scegli un risultato dalla tabella seguente per determinare quali statue si trovano nel territorio di caccia di un basilisco.\n\nVi è il 50% di probabilità che ciascuna di queste statue sia priva di arti o ridotta in pezzi.\n\nVittime Pietrificate del Basilisco (tira 1d8 o scegli) — Il basilisco ha pietrificato...\n1) Un avventuriero con una chiave decorata appesa al collo.\n2) Animali come pipistrelli, orsi, cervi o capre.\n3) Uno scalatore aggrappato a una stalattite.\n4) Sé stesso mentre osservava un grande specchio o una superficie riflettente.\n5) Un mimic camuffato da scrigno colmo di tesori.\n6) Un mostro come un umber hulk o un troglodita.\n7) Qualcuno sorpreso in una posa comica o mentre faceva una smorfia ridicola.\n8) Una vittima ormai utilizzata come nido da insetti o altri parassiti.'
    },
    {
      id: 'preset_diavolo_barbuto', name: 'Diavolo Barbuto', emoji: '👿', rarity: 'uncommon',
      type: 'Immondo', size: 'Media', alignment: 'Legale Malvagio',
      ac: 13, hp: 58, hpCur: 58, hpTemp: 0, hpDice: '9d8+18', init: 2,
      speed: '9 m', cr: '3', xp: '',
      str: 16, dex: 15, con: 15, intl: 9, wis: 11, cha: 14,
      savesOverride: { str: '5', dex: '', con: '4', intl: '', wis: '', cha: '4' },
      skillOverrides: {}, passivePerception: 10,
      senses: [{ type: 'Vista del Diavolo', value: 36, unit: 'm' }], languages: ['Infernale', 'Telepatia 36 m'],
      dmgResist: ['Freddo'], dmgImmune: ['Fuoco', 'Veleno'], dmgVulner: [],
      condImmune: ['Avvelenato', 'Spaventato'],
      traits: [
        { name: 'Resistenza Magica', desc: 'Il diavolo possiede vantaggio ai tiri salvezza contro incantesimi e altri effetti magici.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il diavolo effettua un attacco Barba e un attacco Glaive Infernale.' },
        { name: 'Barba', desc: 'Attacco con arma da mischia: +5 a colpire, portata 1,5 metri.\nColpito: 7 (1d8 + 3) danni perforanti. Il bersaglio ottiene la condizione Avvelenato fino all\'inizio del turno successivo del diavolo. Finché il veleno permane, il bersaglio non può recuperare punti ferita.', atkHit: '+5', atkDmgs: [{ f: '1d8+3', t: 'perforanti' }] },
        { name: 'Glaive Infernale', desc: 'Attacco con arma da mischia: +5 a colpire, portata 3 metri.\nColpito: 8 (1d10 + 3) danni taglienti. Se il bersaglio è una creatura e non possiede già una Ferita Infernale, deve effettuare un Tiro Salvezza su Costituzione (CD 12).\nFallimento: il bersaglio subisce una Ferita Infernale. Finché la ferita permane, all\'inizio di ciascun suo turno perde 5 (1d10) punti ferita.\nLa ferita si chiude dopo 1 minuto, se un incantesimo ripristina punti ferita al bersaglio, oppure se una creatura entro 1,5 metri usa un\'azione per fasciare la ferita superando una prova di Saggezza (Medicina) con CD 12.', atkHit: '+5', atkDmgs: [{ f: '1d10+3', t: 'taglienti' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [{ name: 'Armamenti', desc: 'La glaive infernale del diavolo e altri armamenti diabolici.' }],
      notes: 'Diavolo della Forza e dell\'Intimidazione\n\nHabitat: Piani (Nove Inferi)\nTesoro: Armamenti\n\nI diavoli barbuti, noti anche come barbazu, riempiono le legioni dei Nove Inferi.\n\nQuesti crudeli soldati eseguono gli ordini dei generali infernali mentre difendono i regni diabolici, invadono il Piano Materiale e combattono contro i demoni in conflitti che attraversano molteplici piani di esistenza.\n\nQuando agiscono di propria iniziativa, i diavoli barbuti incoraggiano i mortali a esercitare il proprio potere in modo spietato e abusarne, alimentando il loro ego e ispirando piccole tirannie.\n\nI malvagi alleati dei Nove Inferi invocano spesso i diavoli barbuti come guardiani, esecutori della propria volontà o soldati in eserciti oscuri.\n\nLe loro caratteristiche barbe sono costituite da grottesche escrescenze simili a tentacoli. Queste barbe contorte e ricoperte di aculei trasportano un veleno capace di ostacolare la guarigione magica.\n\nI diavoli barbuti sono inoltre celebri per le loro glaive infernali, attraverso le quali incanalano energie diaboliche. Le ferite inflitte da tali armi diventano piaghe infernali che peggiorano nel tempo finché non vengono curate o fasciate adeguatamente.'
    },
    {
      id: 'preset_behir', name: 'Behir', emoji: '🐉', rarity: 'rare',
      type: 'Mostruosità', size: 'Enorme', alignment: 'Neutrale Malvagio',
      ac: 17, hp: 168, hpCur: 168, hpTemp: 0, hpDice: '16d12+64', init: 3,
      speed: '15 m, Scalare 15 m', cr: '11', xp: '',
      str: 23, dex: 16, con: 18, intl: 7, wis: 14, cha: 12,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { percezione: '6', furtivita: '7' }, passivePerception: 16,
      senses: [{ type: 'Scurovisione', value: 27, unit: 'm' }], languages: ['Draconico'],
      dmgResist: [], dmgImmune: ['Fulmine'], dmgVulner: [],
      condImmune: [],
      traits: [],
      actions: [
        { name: 'Multiattacco', desc: 'Il behir effettua un attacco Morso e usa Costrizione.' },
        { name: 'Morso', desc: 'Attacco con arma da mischia: +10 a colpire, portata 3 metri.\nColpito: 19 (2d12 + 6) danni perforanti più 11 (2d10) danni da fulmine.', atkHit: '+10', atkDmgs: [{ f: '2d12+6', t: 'perforanti' }, { f: '2d10', t: 'fulmine' }] },
        { name: 'Costrizione', desc: 'Tiro Salvezza su Forza: CD 18. Una creatura Grande o più piccola entro 1,5 metri che il behir può vedere.\nFallimento: 28 (5d8 + 6) danni contundenti, e il bersaglio ottiene le condizioni Afferrato (CD fuga 16) e Trattenuto. Le condizioni terminano quando la presa termina.', atkDmgs: [{ f: '5d8+6', t: 'contundenti' }] },
        { name: 'Soffio Fulminante (Ricarica 5-6)', desc: 'Tiro Salvezza su Destrezza: CD 16. Ogni creatura in una linea lunga 27 metri e larga 1,5 metri.\nFallimento: 66 (12d10) danni da fulmine. Successo: metà danni.', atkDmgs: [{ f: '12d10', t: 'fulmine' }] }
      ],
      bonusActions: [
        { name: 'Ingoiare', desc: 'Tiro Salvezza su Destrezza: CD 18. Una creatura Grande o più piccola afferrata dal behir.\nFallimento: il bersaglio viene ingoiato. Una creatura ingoiata non è più afferrata, è Accecata e Trattenuta, ha Copertura Totale contro effetti esterni e subisce 21 (6d6) danni da acido all\'inizio di ogni turno del behir.\nSe il behir subisce 30 o più danni in un singolo turno da una creatura ingoiata, alla fine di quel turno effettua un Tiro Salvezza su Costituzione (CD 14); se fallisce, rigurgita la creatura, che cade Prona entro 3 metri da lui.\nSe il behir muore, la creatura ingoiata non è più Trattenuta e può uscire dal cadavere spendendo 4,5 metri di movimento, terminando Prona.', atkDmgs: [{ f: '6d6', t: 'acido' }] }
      ],
      reactions: [], legendaryActions: [],
      drop: [{ name: 'Tesoro', desc: 'Bottino accumulato nel covo del behir, tra resti di prede e covate di drago divorate.' }],
      notes: 'Mostro Fulminante Vorace\n\nHabitat: Sottosuolo (Underdark)\nTesoro: Qualsiasi\n\nI behir sono giganteschi predatori rettiliani dotati di dodici zampe che cacciano senza sosta la loro prossima preda. Le loro corte ma potenti zampe permettono loro di muoversi rapidamente attraverso grotte e cunicoli, mentre il loro alito elettrico incenerisce qualsiasi creatura abbastanza veloce da sfuggire alle loro fauci.\n\nSecondo antiche leggende, i primi behir furono creati dai giganti delle tempeste alterando l\'essenza dei draghi blu durante un\'antica guerra tra draghi e giganti. Da allora, queste creature hanno sviluppato una particolare predilezione per le uova di drago.\n\nI behir preferiscono sistemi di caverne estesi e rovine sotterranee, dove possono sfruttare la loro agilità e la capacità di scalare pareti verticali. Sebbene evitino i draghi adulti, talvolta assaltano i loro covi alla ricerca di uova da divorare.'
    },
    {
      id: 'preset_beholder', name: 'Beholder', emoji: '👁️', rarity: 'legendary',
      type: 'Aberrazione', size: 'Grande', alignment: 'Legale Malvagio',
      ac: 18, hp: 190, hpCur: 190, hpTemp: 0, hpDice: '20d10+80', init: 12,
      speed: '1,5 m, Volare 12 m (fluttuare)', cr: '13', xp: '',
      str: 16, dex: 14, con: 18, intl: 17, wis: 15, cha: 17,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { percezione: '12' }, passivePerception: 22,
      senses: [{ type: 'Scurovisione', value: 36, unit: 'm' }], languages: ['Linguaggio Profondo', 'Sottocomune'],
      dmgResist: [], dmgImmune: [], dmgVulner: [],
      condImmune: ['Prono'],
      traits: [
        { name: 'Resistenza Leggendaria', desc: '(3/Giorno, oppure 4/Giorno nella Tana)\nSe il beholder fallisce un tiro salvezza, può scegliere di superarlo invece.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il beholder utilizza Raggi Oculari tre volte.' },
        { name: 'Morso', desc: 'Attacco con arma da mischia: +8 a colpire, portata 1,5 metri.\nColpito: 13 (3d6 + 3) danni perforanti.', atkHit: '+8', atkDmgs: [{ f: '3d6+3', t: 'perforanti' }] },
        { name: 'Raggi Oculari', desc: 'Il beholder sceglie casualmente uno dei seguenti raggi (tira 1d10, ritirando i risultati già ottenuti nello stesso turno) contro un bersaglio che può vedere entro 36 metri.\n\n1. Raggio Ammaliante — TS Saggezza CD 16. Fallimento: 13 (3d8) danni psichici e Ammaliato per 1 ora o finché non subisce danni. Successo: metà danni.\n\n2. Raggio Paralizzante — TS Costituzione CD 16. Fallimento: Paralizzato; ripete il TS alla fine di ogni suo turno e dopo 1 minuto l\'effetto termina.\n\n3. Raggio della Paura — TS Saggezza CD 16. Fallimento: 14 (4d6) danni psichici e Spaventato fino alla fine del suo prossimo turno. Successo: metà danni.\n\n4. Raggio Rallentante — TS Costituzione CD 16. Fallimento: 18 (4d8) danni necrotici e, fino alla fine del suo prossimo turno, velocità dimezzata, niente Reazioni e una sola tra Azione e Azione Bonus. Successo: metà danni.\n\n5. Raggio Debilitante — TS Costituzione CD 16. Fallimento: 13 (3d8) danni da veleno e Avvelenato fino alla fine del suo prossimo turno (mentre è così avvelenato non può recuperare punti ferita). Successo: metà danni.\n\n6. Raggio Telecinetico — TS Forza CD 16 (le creature Mastodontiche superano automaticamente). Fallimento: il beholder sposta il bersaglio fino a 9 metri in qualsiasi direzione e lo lascia Trattenuto fino all\'inizio del proprio turno o finché non è incapacitato. Può anche manipolare oggetti.\n\n7. Raggio del Sonno — TS Saggezza CD 16 (Costrutti e Non Morti superano automaticamente). Fallimento: Privo di Sensi per 1 minuto; l\'effetto termina se il bersaglio subisce danni o se una creatura entro 1,5 metri usa un\'azione per svegliarlo.\n\n8. Raggio Pietrificante — TS Costituzione CD 16. Primo fallimento: Trattenuto (ripete il TS alla fine del suo prossimo turno). Secondo fallimento: Pietrificato.\n\n9. Raggio Disintegrante — TS Destrezza CD 16. Fallimento: 36 (8d8) danni da forza; un oggetto non magico o una creazione di forza magica colpito viene disintegrato; se riduce una creatura a 0 punti ferita, viene ridotta in polvere. Successo: metà danni.\n\n10. Raggio della Morte — TS Destrezza CD 16. Fallimento: 55 (10d10) danni necrotici; se il danno riduce il bersaglio a 0 punti ferita, esso muore. Successo: metà danni.' }
      ],
      bonusActions: [
        { name: 'Cono Antimagia', desc: 'L\'occhio centrale del beholder emette un cono antimagia di 45 metri. Fino all\'inizio del prossimo turno del beholder, l\'area funziona come l\'incantesimo Campo Antimagia e il cono blocca anche i Raggi Oculari del beholder stesso.' }
      ],
      reactions: [],
      legendaryActions: [
        { name: 'Usi (3 per round, 4 nella Tana)', desc: 'Il beholder può usare una sola azione leggendaria alla volta, immediatamente dopo il turno di un\'altra creatura. Recupera tutti gli usi spesi all\'inizio del proprio turno.' },
        { name: 'Morso Rapido', desc: 'Il beholder effettua due attacchi Morso.', atkHit: '+8', atkDmgs: [{ f: '3d6+3', t: 'perforanti' }] },
        { name: 'Sguardo', desc: 'Il beholder usa Raggi Oculari.' }
      ],
      drop: [{ name: 'Arcana', desc: 'Artefatti magici accumulati e le statue pietrificate degli eroi sconfitti, esibite come trofei.' }],
      notes: 'Tiranno Oculare Infame\n\nHabitat: Sottosuolo (Underdark)\nTesoro: Arcana\n\nI beholder, conosciuti anche come tiranni oculari, sono tra le creature più temute e detestate del Sottosuolo. Pochi esseri del multiverso ispirano tanto terrore quanto questi orrori paranoici e megalomani.\n\nIl loro corpo globulare è dominato da un\'enorme bocca piena di denti e da un gigantesco occhio centrale. Dieci peduncoli oculari si protendono dal loro corpo, ciascuno terminante con un occhio minore capace di emettere un diverso raggio magico. L\'occhio centrale può annullare la magia, mentre gli altri occhi infliggono effetti devastanti: pietrificazione, paralisi, morte istantanea e molto altro.\n\nLe menti dei beholder sono completamente aliene. Sono spesso paranoici, narcisisti e convinti della propria superiorità assoluta. Alcuni si isolano, altri costruiscono reti di servitori e manipolano intere comunità del Sottosuolo o persino della superficie.\n\nI beholder odiano ogni altro membro della loro specie. Ognuno si considera l\'apice assoluto della perfezione fisica e mentale, vedendo gli altri beholder come rivali degenerati da dominare o distruggere. Le guerre tra beholder possono devastare interi regni sotterranei per decenni.\n\nI tiranni oculari sono attratti da antiche rovine e luoghi intrisi di magia. Spesso accumulano artefatti magici e le statue pietrificate degli eroi che hanno sconfitto, esibendole come trofei.\n\n— Tana del Beholder —\nI beholder si annidano in enormi complessi di caverne che scavano usando i loro raggi oculari, oppure in fortezze costruite dai loro servitori. La regione entro 1 miglio (1,6 km) dalla tana è deformata dalla loro presenza, generando i seguenti effetti regionali.\n\nScopofobia: le creature avvertono costantemente la sensazione di essere osservate. Qualsiasi creatura (eccetto il beholder e i suoi alleati) che completa un Riposo Breve entro 1 miglio dalla tana deve superare un Tiro Salvezza su Saggezza CD 13 oppure non ottiene alcun beneficio dal riposo.\n\nTerreno Distorto: piccole anomalie della realtà si manifestano vicino alla tana. Qualsiasi creatura (eccetto il beholder) entro 1 miglio dalla tana che ottiene 1 naturale in una prova con d20 ottiene la condizione Prono.\n\nSe il beholder muore o abbandona la tana, questi effetti regionali terminano immediatamente.'
    },
    {
      id: 'preset_berserker', name: 'Berserker', emoji: '🪓', rarity: 'common',
      type: 'Umanoide', size: 'Media', alignment: 'Neutrale',
      ac: 13, hp: 67, hpCur: 67, hpTemp: 0, hpDice: '9d8+27', init: 1,
      speed: '9 m', cr: '2', xp: '',
      str: 16, dex: 12, con: 17, intl: 9, wis: 11, cha: 9,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: {}, passivePerception: 10,
      senses: [], languages: ['Comune'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [
        { name: 'Frenesia Sanguinaria', desc: 'Mentre è Ferito (Bloodied), il berserker ha vantaggio ai tiri per colpire e ai tiri salvezza.' }
      ],
      actions: [
        { name: 'Ascia Bipenne', desc: 'Attacco con arma da mischia: +5 a colpire, portata 1,5 metri.\nColpito: 9 (1d12 + 3) danni taglienti.', atkHit: '+5', atkDmgs: [{ f: '1d12+3', t: 'taglienti' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [{ name: 'Armamenti', desc: 'Ascia bipenne, armatura di pelli e bottino individuale.' }],
      notes: 'Guerrieri della Furia e Predoni Spietati\n\nHabitat: Qualsiasi\nTesoro: Armamenti, Individuale\n\nI berserker comuni combattono per gloria personale, per fedeltà a una banda o come membri di orde urlanti che devastano ogni cosa sul loro cammino.\n\n' + BERSERKER_LORE
    },
    {
      id: 'preset_comandante_berserker', name: 'Comandante Berserker', emoji: '⚔️', rarity: 'uncommon',
      type: 'Umanoide', size: 'Media', alignment: 'Neutrale',
      ac: 16, hp: 136, hpCur: 136, hpTemp: 0, hpDice: '16d8+64', init: 5,
      speed: '12 m', cr: '8', xp: '',
      str: 19, dex: 14, con: 19, intl: 10, wis: 14, cha: 9,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { atletica: '7', percezione: '5' }, passivePerception: 15,
      senses: [], languages: ['Comune'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: ['Ammaliato', 'Spaventato'],
      traits: [
        { name: 'Frenesia Sanguinaria', desc: 'Mentre è Ferito (Bloodied), il berserker ha vantaggio ai tiri per colpire e ai tiri salvezza.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il comandante berserker effettua tre attacchi, combinando liberamente Ascia Bipenne e Giavellotto.' },
        { name: 'Ascia Bipenne', desc: 'Attacco con arma da mischia: +7 a colpire, portata 1,5 metri.\nColpito: 10 (1d12 + 4) danni taglienti più 10 (3d6) danni da tuono. I danni da tuono possono colpire il bersaglio oppure un\'altra creatura entro 1,5 metri da esso.', atkHit: '+7', atkDmgs: [{ f: '1d12+4', t: 'taglienti' }, { f: '3d6', t: 'tuono' }] },
        { name: 'Giavellotto', desc: 'Attacco con arma da mischia o a distanza: +7 a colpire, portata 1,5 metri oppure gittata 9/36 metri.\nColpito: 18 (4d6 + 4) danni perforanti. La velocità del bersaglio si riduce di 1,5 metri fino all\'inizio del prossimo turno del berserker.', atkHit: '+7', atkDmgs: [{ f: '4d6+4', t: 'perforanti' }] }
      ],
      bonusActions: [
        { name: 'Carica Frenetica', desc: 'Ogni alleato entro 9 metri dal berserker può usare la propria Reazione per muoversi fino a metà della sua velocità senza provocare attacchi di opportunità. Anche il comandante può muoversi fino a metà della propria velocità senza provocare attacchi di opportunità.' }
      ],
      reactions: [], legendaryActions: [],
      drop: [{ name: 'Armamenti', desc: 'Ascia bipenne, 6 giavellotti e bottino individuale.' }],
      notes: 'Guerrieri della Furia e Predoni Spietati\n\nHabitat: Qualsiasi\nTesoro: Armamenti, Individuale\n\nI comandanti berserker portano sul corpo i segni di innumerevoli battaglie e guidano i loro seguaci con uno zelo brutale e contagioso. Molti di essi attingono a una magia primordiale che amplifica la loro forza e alimenta la furia delle orde che guidano.\n\n' + BERSERKER_LORE
    },
    {
      id: 'preset_cucciolo_drago_nero', name: 'Cucciolo di Drago Nero', emoji: '🐲', rarity: 'epic',
      type: 'Drago', size: 'Media', alignment: 'Caotico Malvagio',
      ac: 17, hp: 33, hpCur: 33, hpTemp: 0, hpDice: '6d8+6', init: 4,
      speed: '9 m, Volare 18 m, Nuotare 9 m', cr: '2', xp: '',
      str: 15, dex: 14, con: 13, intl: 10, wis: 11, cha: 13,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { percezione: '4', furtivita: '4' }, passivePerception: 14,
      senses: [{ type: 'Vista Cieca', value: 3, unit: 'm' }, { type: 'Scurovisione', value: 18, unit: 'm' }], languages: ['Draconico'],
      dmgResist: [], dmgImmune: ['Acido'], dmgVulner: [], condImmune: [],
      traits: [
        { name: 'Anfibio', desc: 'Il drago può respirare sia aria che acqua.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il drago effettua due attacchi Lacerazione.' },
        { name: 'Lacerazione', desc: 'Attacco con arma da mischia: +4 a colpire, portata 1,5 metri.\nColpito: 5 (1d6 + 2) danni taglienti più 3 (1d4) danni da acido.', atkHit: '+4', atkDmgs: [{ f: '1d6+2', t: 'taglienti' }, { f: '1d4', t: 'acido' }] },
        { name: 'Soffio Acido (Ricarica 5-6)', desc: 'Tiro Salvezza su Destrezza: CD 11. Ogni creatura in una linea lunga 4,5 metri e larga 1,5 metri.\nFallimento: 22 (5d8) danni da acido. Successo: metà danni.', atkDmgs: [{ f: '5d8', t: 'acido' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [{ name: 'Reliquie', desc: 'Reliquie di imperi caduti e simboli di speranza infranta accumulati dal drago.' }],
      notes: 'Draghi della Decadenza e della Disperazione\n\nHabitat: Palude\nTesoro: Reliquie\n\nI cuccioli di drago nero si nascondono in acquitrini e corsi d\'acqua contaminati, dove cacciano prede deboli e creature facili da sopraffare. I più giovani possono persino combattersi tra loro per stabilire una gerarchia all\'interno della covata.\n\n' + DRAGHI_NERI_LORE
    },
    {
      id: 'preset_giovane_drago_nero', name: 'Giovane Drago Nero', emoji: '🐉', rarity: 'epic',
      type: 'Drago', size: 'Grande', alignment: 'Caotico Malvagio',
      ac: 18, hp: 127, hpCur: 127, hpTemp: 0, hpDice: '15d10+45', init: 5,
      speed: '12 m, Volare 24 m, Nuotare 12 m', cr: '7', xp: '',
      str: 19, dex: 14, con: 17, intl: 12, wis: 11, cha: 15,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { percezione: '6', furtivita: '5' }, passivePerception: 16,
      senses: [{ type: 'Vista Cieca', value: 9, unit: 'm' }, { type: 'Scurovisione', value: 36, unit: 'm' }], languages: ['Comune', 'Draconico'],
      dmgResist: [], dmgImmune: ['Acido'], dmgVulner: [], condImmune: [],
      traits: [
        { name: 'Anfibio', desc: 'Il drago può respirare sia aria che acqua.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il drago effettua tre attacchi Lacerazione.' },
        { name: 'Lacerazione', desc: 'Attacco con arma da mischia: +7 a colpire, portata 3 metri.\nColpito: 9 (2d4 + 4) danni taglienti più 3 (1d6) danni da acido.', atkHit: '+7', atkDmgs: [{ f: '2d4+4', t: 'taglienti' }, { f: '1d6', t: 'acido' }] },
        { name: 'Soffio Acido (Ricarica 5-6)', desc: 'Tiro Salvezza su Destrezza: CD 14. Ogni creatura in una linea lunga 9 metri e larga 1,5 metri.\nFallimento: 49 (14d6) danni da acido. Successo: metà danni.', atkDmgs: [{ f: '14d6', t: 'acido' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [{ name: 'Reliquie', desc: 'Reliquie di imperi caduti e simboli di speranza infranta accumulati dal drago.' }],
      notes: 'Draghi della Decadenza e della Disperazione\n\nHabitat: Palude\nTesoro: Reliquie\n\nLa maggior parte dei giovani draghi neri reclama una tana nascosta, spesso situata in luoghi lugubri raggiungibili attraverso rovine pericolose o paludi insidiose. Amano terrorizzare piccoli insediamenti e assoggettare servitori timorosi come coboldi e trogloditi. Alcuni stringono alleanze con potenti non morti o aberrazioni del sottosuolo.\n\n' + DRAGHI_NERI_LORE
    },
    {
      id: 'preset_drago_nero_adulto', name: 'Drago Nero Adulto', emoji: '🐉', rarity: 'epic',
      type: 'Drago', size: 'Enorme', alignment: 'Caotico Malvagio',
      ac: 19, hp: 195, hpCur: 195, hpTemp: 0, hpDice: '17d12+85', init: 12,
      speed: '12 m, Volare 24 m, Nuotare 12 m', cr: '14', xp: '',
      str: 23, dex: 14, con: 21, intl: 14, wis: 13, cha: 19,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { percezione: '11', furtivita: '7' }, passivePerception: 21,
      senses: [{ type: 'Vista Cieca', value: 18, unit: 'm' }, { type: 'Scurovisione', value: 36, unit: 'm' }], languages: ['Comune', 'Draconico'],
      dmgResist: [], dmgImmune: ['Acido'], dmgVulner: [], condImmune: [],
      traits: [
        { name: 'Anfibio', desc: 'Il drago può respirare sia aria che acqua.' },
        { name: 'Resistenza Leggendaria', desc: '(3/Giorno, oppure 4/Giorno nella Tana)\nSe il drago fallisce un tiro salvezza, può scegliere di superarlo invece.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il drago effettua tre attacchi Lacerazione. Può sostituire uno degli attacchi con Incantesimi, lanciando Freccia Acida di Melf (versione di 3° livello).' },
        { name: 'Lacerazione', desc: 'Attacco con arma da mischia: +11 a colpire, portata 3 metri.\nColpito: 13 (2d6 + 6) danni taglienti più 4 (1d8) danni da acido.', atkHit: '+11', atkDmgs: [{ f: '2d6+6', t: 'taglienti' }, { f: '1d8', t: 'acido' }] },
        { name: 'Soffio Acido (Ricarica 5-6)', desc: 'Tiro Salvezza su Destrezza: CD 18. Ogni creatura in una linea lunga 18 metri e larga 1,5 metri.\nFallimento: 54 (12d8) danni da acido. Successo: metà danni.', atkDmgs: [{ f: '12d8', t: 'acido' }] },
        { name: 'Incantesimi', desc: 'Il drago lancia uno dei seguenti incantesimi senza componenti materiali, usando Carisma come caratteristica da incantatore (CD 17, +9 a colpire con gli attacchi con incantesimo).\n\nA volontà: Individuazione del Magico, Paura, Freccia Acida di Melf (versione di 3° livello).\n\n1/Giorno ciascuno: Parlare con i Morti, Sfera al Vetriolo.' }
      ],
      bonusActions: [],
      reactions: [],
      legendaryActions: [
        { name: 'Usi (3 per round, 4 nella Tana)', desc: 'Il drago può usare una sola azione leggendaria alla volta, alla fine del turno di un\'altra creatura. Recupera tutte le azioni spese all\'inizio del proprio turno.' },
        { name: 'Nube di Insetti', desc: 'Tiro Salvezza su Destrezza: CD 17. Una creatura entro 36 metri che il drago può vedere.\nFallimento: 22 (4d10) danni da veleno e il bersaglio ha svantaggio ai tiri salvezza per mantenere la concentrazione fino alla fine del suo prossimo turno.\nIl drago non può usare nuovamente questa azione fino all\'inizio del suo prossimo turno.', atkDmgs: [{ f: '4d10', t: 'veleno' }] },
        { name: 'Presenza Terrificante', desc: 'Il drago usa Incantesimi per lanciare Paura. Non può utilizzare nuovamente questa azione fino all\'inizio del suo prossimo turno.' },
        { name: 'Balzo Predatorio', desc: 'Il drago si muove fino a metà della sua velocità e poi effettua un attacco Lacerazione.', atkHit: '+11', atkDmgs: [{ f: '2d6+6', t: 'taglienti' }, { f: '1d8', t: 'acido' }] }
      ],
      drop: [{ name: 'Reliquie', desc: 'Reliquie di imperi caduti e simboli di speranza infranta accumulati dal drago.' }],
      notes: 'Draghi della Decadenza e della Disperazione\n\nHabitat: Palude\nTesoro: Reliquie\n\n' + DRAGHI_NERI_LORE + '\n\n(Affrontato nella propria tana, il drago vale 13.000 PE.)'
    },
    {
      id: 'preset_drago_nero_antico', name: 'Drago Nero Antico', emoji: '🐉', rarity: 'legendary',
      type: 'Drago', size: 'Mastodontica', alignment: 'Caotico Malvagio',
      ac: 22, hp: 367, hpCur: 367, hpTemp: 0, hpDice: '21d20+147', init: 16,
      speed: '12 m, Volare 24 m, Nuotare 12 m', cr: '21', xp: '',
      str: 27, dex: 14, con: 25, intl: 16, wis: 15, cha: 22,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { percezione: '16', furtivita: '9' }, passivePerception: 26,
      senses: [{ type: 'Vista Cieca', value: 18, unit: 'm' }, { type: 'Scurovisione', value: 36, unit: 'm' }], languages: ['Comune', 'Draconico'],
      dmgResist: [], dmgImmune: ['Acido'], dmgVulner: [], condImmune: [],
      traits: [
        { name: 'Anfibio', desc: 'Il drago può respirare sia aria che acqua.' },
        { name: 'Resistenza Leggendaria', desc: '(4/Giorno, oppure 5/Giorno nella Tana)\nSe il drago fallisce un tiro salvezza, può scegliere di superarlo invece.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il drago effettua tre attacchi Lacerazione. Può sostituire uno degli attacchi con Incantesimi, lanciando Freccia Acida di Melf (versione di 4° livello).' },
        { name: 'Lacerazione', desc: 'Attacco con arma da mischia: +15 a colpire, portata 4,5 metri.\nColpito: 17 (2d8 + 8) danni taglienti più 9 (2d8) danni da acido.', atkHit: '+15', atkDmgs: [{ f: '2d8+8', t: 'taglienti' }, { f: '2d8', t: 'acido' }] },
        { name: 'Soffio Acido (Ricarica 5-6)', desc: 'Tiro Salvezza su Destrezza: CD 22. Ogni creatura in una linea lunga 27 metri e larga 3 metri.\nFallimento: 67 (15d8) danni da acido. Successo: metà danni.', atkDmgs: [{ f: '15d8', t: 'acido' }] },
        { name: 'Incantesimi', desc: 'Il drago lancia uno dei seguenti incantesimi senza componenti materiali, usando Carisma come caratteristica da incantatore (CD 21, +13 a colpire con gli attacchi con incantesimo).\n\nA volontà: Individuazione del Magico, Paura, Freccia Acida di Melf (versione di 4° livello).\n\n1/Giorno ciascuno: Creare Non Morti, Parlare con i Morti, Sfera al Vetriolo (versione di 5° livello).' }
      ],
      bonusActions: [],
      reactions: [],
      legendaryActions: [
        { name: 'Usi (3 per round, 4 nella Tana)', desc: 'Il drago può usare una sola azione leggendaria alla volta, alla fine del turno di un\'altra creatura. Recupera le azioni spese all\'inizio del proprio turno.' },
        { name: 'Nube di Insetti', desc: 'Tiro Salvezza su Destrezza: CD 21. Una creatura entro 36 metri che il drago può vedere.\nFallimento: 33 (6d10) danni da veleno e il bersaglio ha svantaggio ai tiri salvezza per mantenere la concentrazione fino alla fine del suo prossimo turno.\nIl drago non può usare nuovamente questa azione fino all\'inizio del suo prossimo turno.', atkDmgs: [{ f: '6d10', t: 'veleno' }] },
        { name: 'Presenza Terrificante', desc: 'Il drago usa Incantesimi per lanciare Paura. Non può utilizzare nuovamente questa azione fino all\'inizio del suo prossimo turno.' },
        { name: 'Balzo Predatorio', desc: 'Il drago si muove fino a metà della sua velocità e poi effettua un attacco Lacerazione.', atkHit: '+15', atkDmgs: [{ f: '2d8+8', t: 'taglienti' }, { f: '2d8', t: 'acido' }] }
      ],
      drop: [{ name: 'Reliquie', desc: 'Reliquie di imperi caduti e simboli di speranza infranta accumulati nei secoli dal drago.' }],
      notes: 'Draghi della Decadenza e della Disperazione\n\nHabitat: Palude\nTesoro: Reliquie\n\n' + DRAGHI_NERI_LORE + '\n\n— Effetti della Tana —\nUn drago nero antico altera il territorio entro 1,5 km dalla sua tana.\n\nFoschia Acrida: una nebbia soffocante e maleodorante copre l\'area, che diventa Leggermente Oscurata; il viaggio richiede il doppio del tempo per chiunque non sia il drago o i suoi alleati.\n\nAcque Corrotte: le fonti d\'acqua entro 1,5 km dalla tana sono contaminate soprannaturalmente. Una creatura che beve quell\'acqua deve superare un Tiro Salvezza su Costituzione CD 15 oppure ottenere la condizione Avvelenato per 1 ora.\n\nSe il drago muore o abbandona la tana, questi effetti cessano immediatamente.\n\n(Affrontato nella propria tana, il drago vale 41.000 PE.)'
    },
    {
      id: 'preset_melma_nera', name: 'Melma Nera', emoji: '⚫', rarity: 'common',
      type: 'Melma', size: 'Grande', alignment: 'Senza Allineamento',
      ac: 7, hp: 68, hpCur: 68, hpTemp: 0, hpDice: '8d10+24', init: -3,
      speed: '6 m, Scalare 6 m', cr: '4', xp: '',
      str: 16, dex: 5, con: 16, intl: 1, wis: 6, cha: 1,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: {}, passivePerception: 8,
      senses: [{ type: 'Vista Cieca', value: 18, unit: 'm' }], languages: [],
      dmgResist: [], dmgImmune: ['Acido', 'Freddo', 'Fulmine', 'Tagliente'], dmgVulner: [],
      condImmune: ['Ammaliato', 'Assordato', 'Esausto', 'Spaventato', 'Afferrato', 'Prono', 'Trattenuto'],
      traits: [
        { name: 'Corpo Amorfo', desc: 'La melma può passare attraverso aperture larghe appena 2,5 cm senza spendere movimento aggiuntivo.' },
        { name: 'Forma Corrosiva', desc: 'Una creatura che colpisce la melma con un attacco in mischia subisce 4 (1d8) danni da acido.\nLe munizioni non magiche che la colpiscono vengono immediatamente distrutte. Le armi non magiche subiscono una penalità cumulativa di -1 ai tiri per colpire e ai danni ogni volta che colpiscono la melma; un\'arma viene distrutta quando la penalità raggiunge -5. L\'incantesimo Riparare (Mending) elimina la penalità.' },
        { name: 'Arrampicata del Ragno', desc: 'La melma può scalare superfici difficili, compresi i soffitti a testa in giù, senza effettuare prove.' }
      ],
      actions: [
        { name: 'Pseudopode Dissolvente', desc: 'Attacco con arma da mischia: +5 a colpire, portata 3 metri.\nColpito: 17 (4d6 + 3) danni da acido. Se il bersaglio indossa un\'armatura non magica, questa subisce una penalità permanente di -1 alla CA fornita (l\'armatura viene distrutta quando la sua CA si riduce a 10). L\'incantesimo Riparare (Mending) può eliminare la penalità.', atkHit: '+5', atkDmgs: [{ f: '4d6+3', t: 'acido' }] }
      ],
      bonusActions: [],
      reactions: [
        { name: 'Divisione', desc: 'Innesco: mentre la melma è Grande o Media, ha almeno 10 punti ferita e diventa Ferita Gravemente oppure subisce danni da Fulmine o Taglienti.\nEffetto: la melma si divide in due Melme Nere più piccole. Ogni nuova melma è di una categoria di taglia inferiore, agisce alla stessa iniziativa e riceve metà dei punti ferita (arrotondati per difetto).' }
      ],
      legendaryActions: [],
      drop: [],
      notes: 'Black Pudding\n\nMelma corrosiva e amorfa che divora carne, ossa e metallo, lasciando dietro di sé solo armi corrose e armature dissolte. Striscia attraverso le fessure più strette, scala persino i soffitti e si divide in due quando viene colpita da fulmini o lame.\n\nIdee d\'incontro:\n• Una Melma Nera che vive nelle fogne sotto una città.\n• Un laboratorio alchemico abbandonato pieno di melme nate da esperimenti falliti.\n• Una caverna dove le armi dei precedenti avventurieri sono state completamente corrose.\n• Una Melma Nera enorme che si divide continuamente creando decine di frammenti più piccoli.'
    },
    {
      id: 'preset_blight_ramo', name: 'Blight Ramo', emoji: '🪵', rarity: 'common',
      type: 'Pianta', size: 'Piccola', alignment: 'Neutrale Malvagio',
      ac: 14, hp: 7, hpCur: 7, hpTemp: 0, hpDice: '2d6', init: 2,
      speed: '6 m', cr: '1/8', xp: '',
      str: 6, dex: 14, con: 11, intl: 4, wis: 8, cha: 3,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { furtivita: '4' }, passivePerception: 9,
      senses: [{ type: 'Vista Cieca', value: 18, unit: 'm' }], languages: ['Comprende il Comune ma non può parlare'],
      dmgResist: [], dmgImmune: [], dmgVulner: ['Fuoco'], condImmune: ['Assordato'],
      traits: [
        { name: 'Tattiche di Branco', desc: 'Il blight ha vantaggio ai tiri per colpire contro una creatura se almeno un alleato del blight si trova entro 1,5 metri dal bersaglio e non è incapacitato.' }
      ],
      actions: [
        { name: 'Artiglio', desc: 'Attacco con arma da mischia: +4 a colpire, portata 1,5 metri.\nColpito: 4 (1d4 + 2) danni taglienti.', atkHit: '+4', atkDmgs: [{ f: '1d4+2', t: 'taglienti' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [],
      notes: 'Piante Germogliate dal Male\n\nHabitat: Foresta\nTesoro: Nessuno\n\nI blight ramo assomigliano a fasci di ramoscelli secchi o cespugli morti. Si confondono facilmente con legna accatastata, detriti vegetali o mucchi di rami presenti nelle campagne.\n\nSpesso si raccolgono in gruppi presso attraversamenti fluviali, pozzi dimenticati e antichi accampamenti, dove attendono che qualcuno abbassi la guardia prima di colpire.\n\n' + BLIGHTS_LORE
    },
    {
      id: 'preset_blight_ago', name: 'Blight Ago', emoji: '🌵', rarity: 'common',
      type: 'Pianta', size: 'Media', alignment: 'Neutrale Malvagio',
      ac: 12, hp: 16, hpCur: 16, hpTemp: 0, hpDice: '3d8+3', init: 1,
      speed: '9 m', cr: '1/4', xp: '',
      str: 12, dex: 12, con: 13, intl: 4, wis: 8, cha: 3,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: {}, passivePerception: 9,
      senses: [{ type: 'Vista Cieca', value: 18, unit: 'm' }], languages: ['Comprende il Comune ma non può parlare'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: ['Assordato'],
      traits: [],
      actions: [
        { name: 'Artiglio', desc: 'Attacco con arma da mischia: +3 a colpire, portata 1,5 metri.\nColpito: 6 (2d4 + 1) danni taglienti.', atkHit: '+3', atkDmgs: [{ f: '2d4+1', t: 'taglienti' }] },
        { name: 'Aghi', desc: 'Attacco con arma a distanza: +3 a colpire, gittata 9/18 metri.\nColpito: 6 (2d4 + 1) danni perforanti.', atkHit: '+3', atkDmgs: [{ f: '2d4+1', t: 'perforanti' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [],
      notes: 'Piante Germogliate dal Male\n\nHabitat: Foresta\nTesoro: Nessuno\n\nI blight ago possiedono una forma vagamente bipede, con arti lunghi e sottili simili a rami rinsecchiti. Che rimangano immobili come alberi morti o avanzino con la loro andatura innaturale, raramente possono essere scambiati per normali piante o viandanti.\n\nQuando individuano una preda, attaccano con artigli ricoperti di spine oppure scagliano raffiche di aghi seghettati che crescono e vengono espulsi dal loro corpo in pochi istanti.\n\n' + BLIGHTS_LORE
    },
    {
      id: 'preset_blight_rampicante', name: 'Blight Rampicante', emoji: '🌿', rarity: 'common',
      type: 'Pianta', size: 'Media', alignment: 'Neutrale Malvagio',
      ac: 12, hp: 19, hpCur: 19, hpTemp: 0, hpDice: '3d8+6', init: -1,
      speed: '6 m', cr: '1/2', xp: '',
      str: 15, dex: 8, con: 14, intl: 5, wis: 10, cha: 3,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { furtivita: '1' }, passivePerception: 10,
      senses: [{ type: 'Vista Cieca', value: 18, unit: 'm' }], languages: ['Comune'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: ['Assordato'],
      traits: [],
      actions: [
        { name: 'Liana Costrittrice', desc: 'Attacco con arma da mischia: +4 a colpire, portata 3 metri.\nColpito: 6 (1d8 + 2) danni contundenti. Se il bersaglio è di taglia Grande o inferiore, ottiene la condizione Afferrato (CD 12 per sfuggire). Finché la presa continua, il bersaglio subisce 4 (1d8) danni contundenti all\'inizio di ogni suo turno e il blight non può usare nuovamente questa azione.', atkHit: '+4', atkDmgs: [{ f: '1d8+2', t: 'contundenti' }] },
        { name: 'Piante Intrappolanti (Ricarica 5-6)', desc: 'Il blight lancia Intralciare, usando Costituzione come caratteristica da incantatore (CD 12).' }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [],
      notes: 'Piante Germogliate dal Male\n\nHabitat: Foresta\nTesoro: Nessuno\n\nI blight rampicanti ricordano figure umanoidi avvolte da liane e viticci tipici delle regioni in cui crescono. Alcuni appaiono come uomini ricoperti d\'edera, altri come masse di rampicanti intrecciati.\n\nA differenza della maggior parte dei blights, possono parlare, anche se raramente lo fanno. Quando comunicano, di solito trasmettono gli ordini dei loro padroni o ripetono le ultime parole pronunciate dalle loro vittime con una voce roca e innaturale.\n\n' + BLIGHTS_LORE
    },
    {
      id: 'preset_blight_albero', name: 'Blight Albero', emoji: '🌳', rarity: 'uncommon',
      type: 'Pianta', size: 'Enorme', alignment: 'Neutrale Malvagio',
      ac: 15, hp: 115, hpCur: 115, hpTemp: 0, hpDice: '10d12+50', init: 0,
      speed: '9 m', cr: '7', xp: '',
      str: 23, dex: 10, con: 20, intl: 6, wis: 10, cha: 3,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: {}, passivePerception: 10,
      senses: [{ type: 'Vista Cieca', value: 18, unit: 'm' }], languages: ['Comprende Comune e Druidico ma non può parlare'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: ['Assordato'],
      traits: [],
      actions: [
        { name: 'Multiattacco', desc: 'Il blight effettua due attacchi Ramo e usa Radice Avvinghiante.' },
        { name: 'Ramo', desc: 'Attacco con arma da mischia: +9 a colpire, portata 4,5 metri.\nColpito: 16 (3d6 + 6) danni contundenti.', atkHit: '+9', atkDmgs: [{ f: '3d6+6', t: 'contundenti' }] },
        { name: 'Radice Avvinghiante', desc: 'Tiro Salvezza su Forza: CD 17. Una creatura Grande o inferiore entro 4,5 metri viene trascinata fino a 3 metri verso il blight e Afferrata (CD 16 per liberarsi).\nFinché è afferrata, all\'inizio di ogni suo turno subisce 13 (2d6 + 6) danni contundenti.', atkDmgs: [{ f: '2d6+6', t: 'contundenti' }] }
      ],
      bonusActions: [
        { name: 'Rosicchiata', desc: 'Una creatura afferrata dal blight effettua un Tiro Salvezza su Destrezza (CD 17).\nFallimento: 19 (3d8 + 6) danni perforanti. Successo: metà danni.', atkDmgs: [{ f: '3d8+6', t: 'perforanti' }] }
      ],
      reactions: [], legendaryActions: [],
      drop: [],
      notes: 'Piante Germogliate dal Male\n\nHabitat: Foresta\nTesoro: Nessuno\n\nI blight albero sembrano enormi alberi morti e antichissimi, caratterizzati da rami contorti e tronchi spaccati. Animati da un\'insaziabile sete di sangue, si nutrono delle creature viventi.\n\nI resti delle loro vittime rimangono spesso impigliati tra rami e radici. Sebbene collaborino con altri blights, attaccano senza esitazione esseri simili ad alberi, come treant e alberi risvegliati.\n\n' + BLIGHTS_LORE
    },
    {
      id: 'preset_blight_gulthias', name: 'Blight Gulthias', emoji: '🌲', rarity: 'rare',
      type: 'Pianta', size: 'Mastodontica', alignment: 'Neutrale Malvagio',
      ac: 20, hp: 264, hpCur: 264, hpTemp: 0, hpDice: '16d20+96', init: 0,
      speed: '15 m', cr: '16', xp: '',
      str: 25, dex: 10, con: 22, intl: 10, wis: 18, cha: 12,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { percezione: '9' }, passivePerception: 19,
      senses: [{ type: 'Vista Cieca', value: 36, unit: 'm' }], languages: ['Comune', 'Druidico'],
      dmgResist: ['Fuoco', 'Necrotico'], dmgImmune: [], dmgVulner: [], condImmune: ['Assordato'],
      traits: [
        { name: 'Semi della Corruzione', desc: 'Al termine di un Riposo Lungo, il blight espelle 1d6 semi in spazi liberi entro 9 metri. Dopo 24 ore ogni seme diventa una creatura sotto il controllo del blight (tira 1d8 per ogni seme):\n1-4: Blight Ramo\n5-6: Blight Ago\n7-8: Blight Rampicante' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il blight effettua due attacchi Schianto o Raffica di Spine in qualsiasi combinazione, e inoltre usa Radice Drenante.' },
        { name: 'Schianto', desc: 'Attacco con arma da mischia: +12 a colpire, portata 3 metri.\nColpito: 25 (4d8 + 7) danni contundenti.', atkHit: '+12', atkDmgs: [{ f: '4d8+7', t: 'contundenti' }] },
        { name: 'Raffica di Spine', desc: 'Attacco con arma a distanza: +12 a colpire, gittata 18/54 metri.\nColpito: 20 (3d8 + 7) danni perforanti.', atkHit: '+12', atkDmgs: [{ f: '3d8+7', t: 'perforanti' }] },
        { name: 'Radice Drenante', desc: 'Tiro Salvezza su Costituzione: CD 20. Una creatura Enorme o inferiore entro 9 metri.\nFallimento: 14 (2d6 + 7) danni necrotici; la creatura viene Afferrata (CD 17), ottiene la condizione Trattenuto e all\'inizio di ogni suo turno subisce 14 (4d6) danni necrotici. Inoltre il suo massimo dei punti ferita si riduce di una quantità pari ai danni necrotici subiti e il blight recupera altrettanti punti ferita.', atkDmgs: [{ f: '2d6+7', t: 'necrotici' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [],
      notes: 'Piante Germogliate dal Male\n\nHabitat: Foresta\nTesoro: Nessuno\n\nGli antichi vegetali corrotti conosciuti come blight Gulthias si nutrono del sangue e devastano la terra che li circonda. La loro presenza genera nuovi blights e trasforma intere foreste in domini infestati.\n\nPrendono il nome da Gulthias, un vampiro il cui cuore fu trafitto da un paletto. Secondo la leggenda, dal paletto ancora intriso della sua maledizione nacque il primo albero Gulthias. Da esso discenderebbero tutti gli altri.\n\nPer queste creature ogni essere vivente è soltanto un servo da dominare oppure fertilizzante per diffondere la propria corruzione.\n\n' + BLIGHTS_LORE + '\n\n— Belak l\'Esiliato, Druido del Bosco del Crepuscolo —\n"È vivo, anche se sembra morto. In un\'epoca lontana qualcuno conficcò un paletto nel cuore di un vampiro proprio in questo luogo. Quel paletto non è mai marcito e mise radici. Così nacque l\'Albero Gulthias, pulsando di un antico potere primordiale."'
    },
    {
      id: 'preset_cane_intermittente', name: 'Cane Intermittente', emoji: '🐕', rarity: 'rare',
      type: 'Fata', size: 'Media', alignment: 'Legale Buono',
      ac: 13, hp: 22, hpCur: 22, hpTemp: 0, hpDice: '4d8+4', init: 3,
      speed: '12 m', cr: '1/4', xp: '',
      str: 12, dex: 17, con: 12, intl: 10, wis: 13, cha: 11,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { percezione: '5', furtivita: '5' }, passivePerception: 15,
      senses: [{ type: 'Scurovisione', value: 18, unit: 'm' }], languages: ['Cane Intermittente', 'Comprende Elfico e Silvano ma non può parlarli'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Morso', desc: 'Attacco con arma da mischia: +5 a colpire, portata 1,5 metri.\nColpito: 5 (1d4 + 3) danni perforanti.', atkHit: '+5', atkDmgs: [{ f: '1d4+3', t: 'perforanti' }] }
      ],
      bonusActions: [
        { name: 'Teletrasporto (Ricarica 4-6)', desc: 'Il Cane Intermittente si teletrasporta fino a 12 metri in uno spazio libero che può vedere.' }
      ],
      reactions: [], legendaryActions: [],
      drop: [],
      notes: 'Cane Lampeggiante delle Selve Fatate\n\nHabitat: Foresta, Piano Fatato (Feywild)\nTesoro: Nessuno\n\nI Cani Intermittenti scintillano di una magia innata che consente loro di teletrasportarsi, "lampeggiando" da un luogo all\'altro in un istante.\n\nQuesti cani utilizzano questo potere per inseguire le prede, confondere i nemici ed esprimere la propria gioia. Sono spesso associati agli abitanti del Feywild, come centauri e pixie, e partecipano frequentemente a cacce sfrenate che attraversano i confini tra i mondi.\n\n— Descrizione per il DM —\nI Cani Intermittenti sono tra le creature benevole più iconiche del Feywild. Nonostante il loro aspetto da semplici cani, sono intelligenti, leali e dotati di capacità soprannaturali. Spesso fungono da compagni, guide o cacciatori al servizio di fate, eladrin e altre creature delle Selve Fatate.\n\nUn branco di Cani Intermittenti può rappresentare:\n• alleati in una foresta incantata;\n• guide attraverso portali fatati;\n• protettori di un antico sentiero magico;\n• nemici temporanei se scambiano gli avventurieri per predatori o invasori.'
    },
    {
      id: 'preset_massa_annientamento', name: 'Massa dell\'Annientamento', emoji: '🕳️', rarity: 'legendary',
      type: 'Melma', size: 'Mastodontica', alignment: 'Neutrale Malvagio',
      ac: 18, hp: 448, hpCur: 448, hpTemp: 0, hpDice: '23d20+207', init: 2,
      speed: '9 m', cr: '23', xp: '',
      str: 27, dex: 14, con: 28, intl: 10, wis: 16, cha: 10,
      savesOverride: { str: '15', dex: '9', con: '16', intl: '', wis: '', cha: '' },
      skillOverrides: {}, passivePerception: 13,
      senses: [{ type: 'Vista Cieca', value: 36, unit: 'm' }], languages: [],
      dmgResist: ['Contundente', 'Perforante', 'Tagliente'], dmgImmune: ['Acido', 'Necrotico', 'Veleno'], dmgVulner: [],
      condImmune: ['Ammaliato', 'Esausto', 'Spaventato', 'Afferrato', 'Paralizzato', 'Pietrificato', 'Avvelenato', 'Prono', 'Trattenuto', 'Stordito', 'Privo di Sensi'],
      traits: [
        { name: 'Implosione Astrale', desc: 'Se la massa viene ridotta a 0 punti ferita, implode ed espelle nel Mare Astrale tutte le creature e gli oggetti che aveva inghiottito. La massa stessa svanisce, lasciando uno strato di melma su tutto ciò che si trovava entro 180 metri da essa.\nDopo 1d20 anni la massa si ricostituisce su un mondo casuale del Piano Materiale.' },
        { name: 'Resistenza Leggendaria', desc: '(4/Giorno)\nSe la massa fallisce un tiro salvezza, può scegliere di superarlo invece.' },
        { name: 'Resistenza Magica', desc: 'La massa dispone di vantaggio ai tiri salvezza contro incantesimi e altri effetti magici.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'La massa effettua due attacchi di Pseudopodo e usa Inghiottire. Può sostituire uno degli attacchi con un utilizzo di Globo Restrittivo.' },
        { name: 'Pseudopodo', desc: 'Attacco con arma da mischia: +15 a colpire, portata 9 metri.\nColpito: 24 (3d10 + 8) danni da forza.', atkHit: '+15', atkDmgs: [{ f: '3d10+8', t: 'forza' }] },
        { name: 'Inghiottire', desc: 'La massa si muove fino alla propria velocità e può attraversare gli spazi occupati da creature e oggetti Enormi o più piccoli. Ogni creatura o oggetto nel cui spazio la massa entra per la prima volta durante questo movimento effettua un Tiro Salvezza su Forza (CD 23).\nFallimento: il bersaglio viene inghiottito; gode di copertura totale contro effetti esterni, si muove con la massa e (se oggetto non magico) viene distrutto dopo 1 minuto al suo interno. Mentre è inghiottita, una creatura subisce 21 (6d6) danni da forza all\'inizio di ciascun proprio turno, sta soffocando, ha la condizione Trattenuto e ripete il tiro salvezza alla fine di ogni proprio turno; se ridotta a 0 punti ferita si dissolve in cenere, espulsa nel Mare Astrale.\nSuccesso: il bersaglio fugge e compare nello spazio libero più vicino.', atkDmgs: [{ f: '6d6', t: 'forza' }] },
        { name: 'Globo Restrittivo', desc: 'La massa lancia un globo di melma vischiosa contro una creatura Grande o più piccola che possa vedere entro 180 metri. Tiro Salvezza su Destrezza: CD 23.\nFallimento: 18 (3d6 + 8) danni da acido; il globo trascina il bersaglio per 18 metri in linea retta verso la massa e lo lascia Trattenuto fino alla fine del turno successivo della massa, quando il globo si dissolve innocuamente.\nSuccesso: metà danni.', atkDmgs: [{ f: '3d6+8', t: 'acido' }] }
      ],
      bonusActions: [],
      reactions: [],
      legendaryActions: [
        { name: 'Usi (3 per round)', desc: 'Immediatamente dopo il turno di un\'altra creatura, la massa può spendere un utilizzo per una delle azioni leggendarie seguenti. Recupera tutti gli utilizzi spesi all\'inizio di ciascun proprio turno.' },
        { name: 'Decadimento', desc: 'La massa infligge 14 (4d6) danni necrotici a ogni creatura da essa inghiottita. Non può usare nuovamente questa azione fino all\'inizio del suo prossimo turno.', atkDmgs: [{ f: '4d6', t: 'necrotici' }] },
        { name: 'Globo Afferrante', desc: 'La massa usa Globo Restrittivo. Non può usare nuovamente questa azione fino all\'inizio del suo prossimo turno.' },
        { name: 'Melma Sferzante', desc: 'La massa effettua un attacco di Pseudopodo.', atkHit: '+15', atkDmgs: [{ f: '3d10+8', t: 'forza' }] }
      ],
      drop: [{ name: 'Contenuti della Massa', desc: 'Solo gli oggetti magici e i cadaveri di dèi e titani sopravvivono al suo interno. Tira 1d10 sulla tabella "Contenuti della Massa dell\'Annientamento" (nelle note) per scoprire quale straordinario oggetto o creatura custodisce.' }],
      notes: 'Entropia Cosmica Divoratrice di Tutto Scatenata\n\nHabitat: Qualsiasi\nTesoro: Qualsiasi\n\nLa Massa dell\'Annientamento è un coagulo di entropia cosmica congiunto ai resti di divinità morte. Questa entità malvagia vaga per lo Spazio Selvaggio e per le distese del multiverso ostili alla vita: regioni immense nelle quali la probabilità di incontrarla è molto bassa.\n\nLa Massa rappresenta la minaccia più grande quando disastri o incantatori nichilisti la evocano in regni abitati. Una volta liberata, rotola attraverso le terre in enormi vortici cosmici, mentre frammenti della sua sostanza si separano per inghiottire altri bersagli.\n\nLa Massa consuma tutto ciò che incontra, spazzando foreste, villaggi e fortezze dentro il proprio corpo. Al suo interno si trova una distesa priva di aria e gravità, dove le forze entropiche distruggono qualunque cosa venga inghiottita. Nulla può sopravvivervi a lungo.\n\nSoltanto gli oggetti magici e i cadaveri di dèi e titani possono resistere all\'interno della Massa. Per questo motivo, cacciatori di tesori e teologi a volte si assumono il compito mortale di recuperare qualcosa dal suo interno: un\'impresa che di solito termina con l\'annientamento, ma che occasionalmente porta alla scoperta della vita.\n\n— Contenuti della Massa dell\'Annientamento (tira 1d10) —\n1. Un Amuleto dei Piani.\n2. Un artefatto scelto dal DM.\n3. I corpi di due divinità che combattevano quando la Massa le ha consumate.\n4. Un Cancello Cubico.\n5. Un Mazzo delle Molte Cose.\n6. Una chiave magica che apre una porta a Sigil che nessun\'altra chiave o incantesimo può aprire.\n7. Il corpo conservato di un Empireo.\n8. I resti di metà di un Kraken.\n9. Il teschio di un dio della morte.\n10. Una Tarrasque appena morta.\n\n— Vi, Artefice di Eberron —\n"Tesoro, ho visto orrori che ti farebbero sporcare i pantaloni e cercare il santuario più vicino. E poi c\'è la Massa dell\'Annientamento. Se la vedi, scappa. E se non riesci a scappare, spera soltanto di dissolverti in fretta."'
    },
    {
      id: 'preset_cucciolo_drago_blu', name: 'Cucciolo di Drago Blu', emoji: '🐲', rarity: 'epic',
      type: 'Drago', size: 'Media', alignment: 'Legale Malvagio',
      ac: 17, hp: 65, hpCur: 65, hpTemp: 0, hpDice: '10d8+20', init: 0,
      speed: '9 m, Scavare 4,5 m, Volare 18 m', cr: '3', xp: '',
      str: 17, dex: 10, con: 15, intl: 12, wis: 11, cha: 15,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { percezione: '4', furtivita: '2' }, passivePerception: 14,
      senses: [{ type: 'Vista Cieca', value: 3, unit: 'm' }, { type: 'Scurovisione', value: 18, unit: 'm' }], languages: ['Draconico'],
      dmgResist: [], dmgImmune: ['Fulmine'], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Multiattacco', desc: 'Il drago effettua due attacchi Lacerazione.' },
        { name: 'Lacerazione', desc: 'Attacco con arma da mischia: +5 a colpire, portata 1,5 metri.\nColpito: 8 (1d10 + 3) danni taglienti più 3 (1d6) danni da fulmine.', atkHit: '+5', atkDmgs: [{ f: '1d10+3', t: 'taglienti' }, { f: '1d6', t: 'fulmine' }] },
        { name: 'Soffio Fulminante (Ricarica 5-6)', desc: 'Tiro Salvezza su Destrezza: CD 12. Ogni creatura in una linea lunga 9 metri e larga 1,5 metri.\nFallimento: 21 (6d6) danni da fulmine. Successo: metà danni.', atkDmgs: [{ f: '6d6', t: 'fulmine' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [{ name: 'Reliquie', desc: 'Insegne del potere sovrano, gemme rare e oggetti magici accumulati dal drago blu.' }],
      notes: 'Draghi della Tirannia e delle Tempeste\n\nHabitat: Costa, Deserto\nTesoro: Reliquie\n\nI cuccioli di drago blu spesso servono altre creature potenti, apprendendo da esse le tecniche del controllo e costruendosi una reputazione temibile tra le creature più deboli.\n\nMolti cuccioli inizialmente servono con lealtà, ma quando il loro potere cresce fino a eguagliare le loro ambizioni finiscono per tradire o abbandonare i propri alleati.\n\nQuesti cuccioli tentano piccoli gruppi di creature affinché entrino al loro servizio, ricompensandoli con modesti tesori e promesse di potere futuro.\n\n' + DRAGHI_BLU_LORE
    },
    {
      id: 'preset_giovane_drago_blu', name: 'Giovane Drago Blu', emoji: '🐉', rarity: 'epic',
      type: 'Drago', size: 'Grande', alignment: 'Legale Malvagio',
      ac: 18, hp: 152, hpCur: 152, hpTemp: 0, hpDice: '16d10+64', init: 0,
      speed: '12 m, Scavare 6 m, Volare 24 m', cr: '9', xp: '',
      str: 21, dex: 10, con: 19, intl: 14, wis: 13, cha: 17,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { percezione: '9', furtivita: '4' }, passivePerception: 19,
      senses: [{ type: 'Vista Cieca', value: 9, unit: 'm' }, { type: 'Scurovisione', value: 36, unit: 'm' }], languages: ['Comune', 'Draconico'],
      dmgResist: [], dmgImmune: ['Fulmine'], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Multiattacco', desc: 'Il drago effettua tre attacchi Lacerazione.' },
        { name: 'Lacerazione', desc: 'Attacco con arma da mischia: +9 a colpire, portata 3 metri.\nColpito: 12 (2d6 + 5) danni taglienti più 5 (1d10) danni da fulmine.', atkHit: '+9', atkDmgs: [{ f: '2d6+5', t: 'taglienti' }, { f: '1d10', t: 'fulmine' }] },
        { name: 'Soffio Fulminante (Ricarica 5-6)', desc: 'Tiro Salvezza su Destrezza: CD 16. Ogni creatura in una linea lunga 18 metri e larga 1,5 metri.\nFallimento: 55 (10d10) danni da fulmine. Successo: metà danni.', atkDmgs: [{ f: '10d10', t: 'fulmine' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [{ name: 'Reliquie', desc: 'Insegne del potere sovrano, gemme rare e oggetti magici accumulati dal drago blu.' }],
      notes: 'Draghi della Tirannia e delle Tempeste\n\nHabitat: Costa, Deserto\nTesoro: Reliquie\n\nI giovani draghi blu cercano di imporsi come forze da temere. Molti reclamano comunità isolate da governare oppure antiche rovine dove potrebbero trovare percorsi magici verso il potere.\n\nQuesti draghi possono temporaneamente collaborare con altri draghi o potenti malvagi per ottenere seguaci e influenza.\n\n' + DRAGHI_BLU_LORE
    },
    {
      id: 'preset_drago_blu_adulto', name: 'Drago Blu Adulto', emoji: '🐉', rarity: 'epic',
      type: 'Drago', size: 'Enorme', alignment: 'Legale Malvagio',
      ac: 19, hp: 212, hpCur: 212, hpTemp: 0, hpDice: '17d12+102', init: 0,
      speed: '12 m, Scavare 9 m, Volare 24 m', cr: '16', xp: '',
      str: 25, dex: 10, con: 23, intl: 16, wis: 15, cha: 20,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { percezione: '12', furtivita: '5' }, passivePerception: 22,
      senses: [{ type: 'Vista Cieca', value: 18, unit: 'm' }, { type: 'Scurovisione', value: 36, unit: 'm' }], languages: ['Comune', 'Draconico'],
      dmgResist: [], dmgImmune: ['Fulmine'], dmgVulner: [], condImmune: [],
      traits: [
        { name: 'Resistenza Leggendaria', desc: '(3/Giorno, oppure 4/Giorno nella Tana)\nSe il drago fallisce un tiro salvezza, può scegliere di superarlo invece.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il drago effettua tre attacchi Lacerazione. Può sostituire uno degli attacchi con un uso di Incantesimi per lanciare Frantumare.' },
        { name: 'Lacerazione', desc: 'Attacco con arma da mischia: +12 a colpire, portata 3 metri.\nColpito: 16 (2d8 + 7) danni taglienti più 5 (1d10) danni da fulmine.', atkHit: '+12', atkDmgs: [{ f: '2d8+7', t: 'taglienti' }, { f: '1d10', t: 'fulmine' }] },
        { name: 'Soffio Fulminante (Ricarica 5-6)', desc: 'Tiro Salvezza su Destrezza: CD 19. Ogni creatura in una linea lunga 27 metri e larga 1,5 metri.\nFallimento: 60 (11d10) danni da fulmine. Successo: metà danni.', atkDmgs: [{ f: '11d10', t: 'fulmine' }] },
        { name: 'Incantesimi', desc: 'Il drago lancia uno dei seguenti incantesimi senza componenti materiali, usando Carisma come caratteristica da incantatore (CD 18, +10 a colpire con gli attacchi con incantesimo).\n\nA volontà: Individuazione del Magico, Invisibilità, Mano Magica, Frantumare.\n\n1/Giorno ciascuno: Scrutare, Inviare.' }
      ],
      bonusActions: [],
      reactions: [],
      legendaryActions: [
        { name: 'Usi (3 per round, 4 nella Tana)', desc: 'Il drago può usare una sola azione leggendaria alla volta, alla fine del turno di un\'altra creatura. Recupera gli utilizzi spesi all\'inizio del proprio turno.' },
        { name: 'Volo Celato', desc: 'Il drago usa Incantesimi per lanciare Invisibilità su sé stesso e può volare fino a metà della propria velocità di volo. Non può usare di nuovo questa azione fino all\'inizio del suo prossimo turno.' },
        { name: 'Boom Sonico', desc: 'Il drago usa Incantesimi per lanciare Frantumare. Non può usare di nuovo questa azione fino all\'inizio del suo prossimo turno.' },
        { name: 'Colpo di Coda', desc: 'Il drago effettua un attacco Lacerazione.', atkHit: '+12', atkDmgs: [{ f: '2d8+7', t: 'taglienti' }, { f: '1d10', t: 'fulmine' }] }
      ],
      drop: [{ name: 'Reliquie', desc: 'Insegne del potere sovrano, corone di sovrani decaduti, gemme uniche e oggetti magici accumulati dal drago blu.' }],
      notes: 'Draghi della Tirannia e delle Tempeste\n\nHabitat: Costa, Deserto\nTesoro: Reliquie\n\nI draghi blu adulti comandano piccoli imperi che possono comprendere territori popolati da sudditi sottomessi, oscure reti criminali o enclave di cultisti.\n\nPerennemente sospettosi e diffidenti verso i rivali, questi draghi elaborano complessi intrighi per rovinare i propri nemici, mettere alla prova la lealtà dei loro servitori e garantire il proprio dominio per secoli.\n\n' + DRAGHI_BLU_LORE + '\n\n' + DRAGHI_BLU_TANA + '\n\n(Affrontato nella propria tana, il drago vale 18.000 PE.)'
    },
    {
      id: 'preset_antico_drago_blu', name: 'Antico Drago Blu', emoji: '🐉', rarity: 'legendary',
      type: 'Drago', size: 'Mastodontica', alignment: 'Legale Malvagio',
      ac: 22, hp: 481, hpCur: 481, hpTemp: 0, hpDice: '26d20+208', init: 0,
      speed: '12 m, Scavare 12 m, Volare 24 m', cr: '23', xp: '',
      str: 29, dex: 10, con: 27, intl: 18, wis: 17, cha: 25,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { percezione: '17', furtivita: '7' }, passivePerception: 27,
      senses: [{ type: 'Vista Cieca', value: 18, unit: 'm' }, { type: 'Scurovisione', value: 36, unit: 'm' }], languages: ['Comune', 'Draconico'],
      dmgResist: [], dmgImmune: ['Fulmine'], dmgVulner: [], condImmune: [],
      traits: [
        { name: 'Resistenza Leggendaria', desc: '(4/Giorno, oppure 5/Giorno nella Tana)\nSe il drago fallisce un tiro salvezza, può scegliere di superarlo invece.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il drago effettua tre attacchi Lacerazione. Può sostituire uno degli attacchi con un uso di Incantesimi per lanciare Frantumare (versione di 3° livello).' },
        { name: 'Lacerazione', desc: 'Attacco con arma da mischia: +16 a colpire, portata 4,5 metri.\nColpito: 18 (2d8 + 9) danni taglienti più 11 (2d10) danni da fulmine.', atkHit: '+16', atkDmgs: [{ f: '2d8+9', t: 'taglienti' }, { f: '2d10', t: 'fulmine' }] },
        { name: 'Soffio Fulminante (Ricarica 5-6)', desc: 'Tiro Salvezza su Destrezza: CD 23. Ogni creatura in una linea lunga 36 metri e larga 3 metri.\nFallimento: 88 (16d10) danni da fulmine. Successo: metà danni.', atkDmgs: [{ f: '16d10', t: 'fulmine' }] },
        { name: 'Incantesimi', desc: 'Il drago lancia uno dei seguenti incantesimi senza componenti materiali, usando Carisma come caratteristica da incantatore (CD 22).\n\nA volontà: Individuazione del Magico, Invisibilità, Mano Magica, Frantumare (versione di 3° livello).\n\n1/Giorno ciascuno: Scrutare, Inviare.' }
      ],
      bonusActions: [],
      reactions: [],
      legendaryActions: [
        { name: 'Usi (3 per round, 4 nella Tana)', desc: 'Il drago può usare una sola azione leggendaria alla volta, alla fine del turno di un\'altra creatura. Recupera gli utilizzi spesi all\'inizio del proprio turno.' },
        { name: 'Volo Celato', desc: 'Il drago usa Incantesimi per lanciare Invisibilità su sé stesso e può volare fino a metà della propria velocità di volo. Non può usare di nuovo questa azione fino all\'inizio del proprio prossimo turno.' },
        { name: 'Boom Sonico', desc: 'Il drago usa Incantesimi per lanciare Frantumare (versione di 3° livello). Non può usare di nuovo questa azione fino all\'inizio del proprio prossimo turno.' },
        { name: 'Colpo di Coda', desc: 'Il drago effettua un attacco Lacerazione.', atkHit: '+16', atkDmgs: [{ f: '2d8+9', t: 'taglienti' }, { f: '2d10', t: 'fulmine' }] }
      ],
      drop: [{ name: 'Reliquie', desc: 'Insegne del potere sovrano, corone di sovrani decaduti, gemme uniche e oggetti magici accumulati nei secoli dal drago blu.' }],
      notes: 'Draghi della Tirannia e delle Tempeste\n\nHabitat: Costa, Deserto\nTesoro: Reliquie\n\nGli antichi draghi blu pensano oltre il semplice dominio di gruppi di servitori dalla vita breve. Cercano invece di elevare il proprio status sopra quello degli altri draghi e degli abitanti più potenti del mondo.\n\nSe la dominazione mondiale appare troppo laboriosa o banale, questi draghi possono tentare di impadronirsi di reami extraplanari, imperi multiversali o delle stesse forze della realtà, come la vita, le tempeste o il tempo.\n\n' + DRAGHI_BLU_LORE + '\n\n' + DRAGHI_BLU_TANA + '\n\n(Affrontato nella propria tana, il drago vale 62.000 PE.)'
    },
    {
      id: 'preset_diavolo_ossa', name: 'Diavolo d\'Ossa', emoji: '💀', rarity: 'rare',
      type: 'Immondo', size: 'Grande', alignment: 'Legale Malvagio',
      ac: 16, hp: 161, hpCur: 161, hpTemp: 0, hpDice: '17d10+68', init: 7,
      speed: '12 m, Volare 12 m', cr: '9', xp: '',
      str: 18, dex: 16, con: 18, intl: 13, wis: 14, cha: 16,
      savesOverride: { str: '8', dex: '', con: '', intl: '5', wis: '6', cha: '7' },
      skillOverrides: { inganno: '7', intuizione: '6' }, passivePerception: 12,
      senses: [{ type: 'Vista del Diavolo', value: 36, unit: 'm' }], languages: ['Infernale', 'Telepatia 36 m'],
      dmgResist: ['Freddo'], dmgImmune: ['Fuoco', 'Veleno'], dmgVulner: [],
      condImmune: ['Avvelenato'],
      traits: [
        { name: 'Restaurazione Diabolica', desc: 'Se il diavolo muore al di fuori dei Nove Inferi, il suo corpo scompare in una nube di fumo sulfureo e ottiene immediatamente un nuovo corpo, tornando in vita con tutti i suoi punti ferita da qualche parte nei Nove Inferi.' },
        { name: 'Resistenza Magica', desc: 'Il diavolo ha vantaggio ai tiri salvezza contro incantesimi e altri effetti magici.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il diavolo effettua due attacchi Artiglio e un attacco Pungiglione Infernale.' },
        { name: 'Artiglio', desc: 'Attacco con arma da mischia: +8 a colpire, portata 3 metri.\nColpito: 13 (2d8 + 4) danni taglienti.', atkHit: '+8', atkDmgs: [{ f: '2d8+4', t: 'taglienti' }] },
        { name: 'Pungiglione Infernale', desc: 'Attacco con arma da mischia: +8 a colpire, portata 3 metri.\nColpito: 15 (2d10 + 4) danni perforanti più 18 (4d8) danni da veleno e il bersaglio ottiene la condizione Avvelenato fino all\'inizio del turno successivo del diavolo. Mentre è Avvelenato in questo modo, non può recuperare punti ferita.', atkHit: '+8', atkDmgs: [{ f: '2d10+4', t: 'perforanti' }, { f: '4d8', t: 'veleno' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [{ name: 'Strumenti', desc: 'Strumenti e implementi diabolici usati per far rispettare i patti infernali.' }],
      notes: 'Diavolo del Terrore e dell\'Obbedienza\n\nHabitat: Planare (Nove Inferi)\nTesoro: Strumenti\n\nI diavoli d\'ossa sono Esseri Immondi alti e scheletrici dall\'aspetto da incubo, con pelle pallida tesa su corpi che combinano caratteristiche umane e insettoidi. Conosciuti anche come osyluth, comandano diavoli più deboli e altri esseri allineati alle legioni infernali.\n\nI diavoli d\'ossa garantiscono che gli ordini dei sovrani infernali vengano eseguiti con efficienza e che i non-diavoli rispettino gli impegni presi con i Nove Inferi. Uccidono coloro che rinnegano i patti infernali, inviando le anime mortali traditrici ad affrontare punizioni indicibili.\n\nQuando non sono al servizio dei loro padroni diabolici, i diavoli d\'ossa tentano i mortali egocentrici con promesse di adulazione e obbedienza da parte di altre creature: sostengono piccoli tiranni, aiutandoli a diventare sempre più crudeli e amorali.\n\nViaggiano attraverso il multiverso per adempiere agli ordini infernali e, se non hanno altra scelta, possono arruolare mortali affinché li assistano nei loro obiettivi malvagi.\n\n— Obiettivi del Diavolo d\'Ossa (tira 1d4) —\n1. Catturare un\'anima fuggita dai Nove Inferi.\n2. Consegnare un messaggio o punire qualcuno in nome di un arcidiavolo.\n3. Trovare qualcuno che ha infranto un patto con un diavolo.\n4. Uccidere qualcuno o rubare qualcosa come parte di un accordo con un malvagio utilizzatore di magia.\n\n— Sylvira Savikas, saggia di Candlekeep —\n"I diavoli d\'ossa sono solo una delle mille ragioni per non stringere mai un patto con un diavolo, ma sono una ragione importante. Rompi un accordo e probabilmente sarai trascinato nei Nove Inferi da uno di questi incubi."'
    },
    {
      id: 'preset_naga_ossa', name: 'Naga d\'Ossa', emoji: '🐍', rarity: 'uncommon',
      type: 'Non Morto', size: 'Grande', alignment: 'Neutrale Malvagio',
      ac: 15, hp: 65, hpCur: 65, hpTemp: 0, hpDice: '10d10+10', init: 3,
      speed: '12 m', cr: '4', xp: '',
      str: 15, dex: 16, con: 12, intl: 16, wis: 15, cha: 15,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: {}, passivePerception: 12,
      senses: [{ type: 'Scurovisione', value: 18, unit: 'm' }], languages: ['Comune più un\'altra lingua'],
      dmgResist: [], dmgImmune: ['Veleno'], dmgVulner: [],
      condImmune: ['Ammaliato', 'Esausto', 'Paralizzato', 'Avvelenato'],
      traits: [],
      actions: [
        { name: 'Multiattacco', desc: 'La naga effettua due attacchi Morso. Può sostituire qualsiasi attacco con un utilizzo di Sguardo Serpentino.' },
        { name: 'Morso', desc: 'Attacco con arma da mischia: +5 a colpire, portata 3 metri.\nColpito: 10 (2d6 + 3) danni perforanti più 7 (2d6) danni necrotici.', atkHit: '+5', atkDmgs: [{ f: '2d6+3', t: 'perforanti' }, { f: '2d6', t: 'necrotici' }] },
        { name: 'Sguardo Serpentino', desc: 'Tiro Salvezza su Saggezza: CD 13. Una creatura che la naga può vedere entro 18 metri.\nFallimento: 13 (3d6 + 3) danni psichici e il bersaglio ottiene la condizione Ammaliato fino all\'inizio del turno successivo della naga.', atkDmgs: [{ f: '3d6+3', t: 'psichici' }] },
        { name: 'Incantesimi', desc: 'La naga lancia uno dei seguenti incantesimi, senza componenti materiali e usando Intelligenza come caratteristica da incantatore (CD 13).\n\nA volontà: Mano Magica, Taumaturgia.\n\n1/Giorno ciascuno: Comando, Individuazione dei Pensieri, Fulmine.' }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [{ name: 'Reliquie', desc: 'Conoscenze e reliquie accumulate dalla naga durante la sua vita, ora frammentate dalla non morte.' }],
      notes: 'Manipolatore Serpentino Immortale\n\nHabitat: Sottosuolo\nTesoro: Reliquie\n\nLe naga sono immortali ma non invincibili, e una magia sufficientemente potente può porre fine alle loro vite. Le naga d\'ossa sono terrori scheletrici creati dai resti di naga uccise tramite la magia oppure di naga morte che non erano ancora ringiovanite.\n\nViene loro concessa una non-vita tramite rituali praticati da cultisti, yuan-ti e macabre naga spirituali. Queste naga non morte possiedono capacità magiche simili a quelle che avevano in vita, oltre a uno sguardo inquietante capace di ammaliare altre creature.\n\nLe naga d\'ossa normalmente obbediscono a coloro che le hanno riportate in vita, servendo i loro creatori come instancabili guardiane e condividendo le conoscenze che avevano raccolto in vita. La non morte altera la memoria perfetta di cui godevano quando erano vive, lasciandole con lacune nei ricordi o dettagli confusi in grovigli simili a enigmi.\n\nIn rari casi, le naga d\'ossa continuano a perseguire gli obiettivi che avevano in vita invece di servire altre creature. La maggior parte delle naga d\'ossa dotate di libero arbitrio sono esseri malvagi creati dai resti di naga spirituali, ma in circostanze insolite quelle create da naga guardiane continuano a essere creature buone, sebbene confuse.'
    },
    {
      id: 'preset_cucciolo_drago_ottone', name: 'Cucciolo di Drago d\'Ottone', emoji: '🐲', rarity: 'epic',
      type: 'Drago', size: 'Media', alignment: 'Caotico Buono',
      ac: 15, hp: 22, hpCur: 22, hpTemp: 0, hpDice: '4d8+4', init: 2,
      speed: '9 m, Scavare 4,5 m, Volare 18 m', cr: '1', xp: '',
      str: 15, dex: 10, con: 13, intl: 10, wis: 11, cha: 13,
      savesOverride: { str: '', dex: '2', con: '', intl: '', wis: '2', cha: '' },
      skillOverrides: { percezione: '4', furtivita: '2' }, passivePerception: 14,
      senses: [{ type: 'Vista Cieca', value: 3, unit: 'm' }, { type: 'Scurovisione', value: 18, unit: 'm' }], languages: ['Draconico'],
      dmgResist: [], dmgImmune: ['Fuoco'], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Lacerazione', desc: 'Attacco con arma da mischia: +4 a colpire, portata 1,5 metri.\nColpito: 7 (1d10 + 2) danni taglienti.', atkHit: '+4', atkDmgs: [{ f: '1d10+2', t: 'taglienti' }] },
        { name: 'Soffio di Fuoco (Ricarica 5-6)', desc: 'Tiro Salvezza su Destrezza: CD 11. Ogni creatura in una linea lunga 6 metri e larga 1,5 metri.\nFallimento: 14 (4d6) danni da fuoco. Successo: metà danni.', atkDmgs: [{ f: '4d6', t: 'fuoco' }] },
        { name: 'Soffio del Sonno', desc: 'Tiro Salvezza su Costituzione: CD 11. Ogni creatura in un cono di 4,5 metri.\nFallimento: il bersaglio ottiene la condizione Incapacitato fino alla fine del suo turno successivo, momento in cui ripete il tiro salvezza.\nSecondo Fallimento: il bersaglio ottiene la condizione Privo di Sensi per 1 minuto. L\'effetto termina se subisce danni oppure se una creatura entro 1,5 metri usa un\'azione per svegliarlo.' }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [{ name: 'Arcani', desc: 'Oggetti eclettici e curiosi, ognuno legato a una storia o a una leggenda.' }],
      notes: 'Draghi della Conoscenza e della Conversazione\n\nHabitat: Deserto\nTesoro: Arcani\n\nI cuccioli di drago d\'ottone sono instancabilmente curiosi. Cercano con entusiasmo il contatto con creature avvicinabili ed esplorano rapidamente qualsiasi luogo che presenti qualcosa di interessante. Una volta ascoltate storie di avventure, molti sono impazienti di iniziare le proprie.\n\n' + DRAGHI_OTTONE_LORE
    },
    {
      id: 'preset_giovane_drago_ottone', name: 'Giovane Drago d\'Ottone', emoji: '🐉', rarity: 'epic',
      type: 'Drago', size: 'Grande', alignment: 'Caotico Buono',
      ac: 17, hp: 110, hpCur: 110, hpTemp: 0, hpDice: '13d10+39', init: 3,
      speed: '12 m, Scavare 6 m, Volare 24 m', cr: '6', xp: '',
      str: 19, dex: 10, con: 17, intl: 12, wis: 11, cha: 15,
      savesOverride: { str: '', dex: '3', con: '', intl: '', wis: '3', cha: '' },
      skillOverrides: { percezione: '6', persuasione: '5', furtivita: '3' }, passivePerception: 16,
      senses: [{ type: 'Vista Cieca', value: 9, unit: 'm' }, { type: 'Scurovisione', value: 36, unit: 'm' }], languages: ['Comune', 'Draconico'],
      dmgResist: [], dmgImmune: ['Fuoco'], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Multiattacco', desc: 'Il drago effettua tre attacchi Lacerazione. Può sostituire due attacchi con un uso di Soffio del Sonno.' },
        { name: 'Lacerazione', desc: 'Attacco con arma da mischia: +7 a colpire, portata 3 metri.\nColpito: 15 (2d10 + 4) danni taglienti.', atkHit: '+7', atkDmgs: [{ f: '2d10+4', t: 'taglienti' }] },
        { name: 'Soffio di Fuoco (Ricarica 5-6)', desc: 'Tiro Salvezza su Destrezza: CD 14. Ogni creatura in una linea lunga 12 metri e larga 1,5 metri.\nFallimento: 38 (11d6) danni da fuoco. Successo: metà danni.', atkDmgs: [{ f: '11d6', t: 'fuoco' }] },
        { name: 'Soffio del Sonno', desc: 'Tiro Salvezza su Costituzione: CD 14. Ogni creatura in un cono di 9 metri.\nFallimento: il bersaglio ottiene la condizione Incapacitato fino alla fine del suo turno successivo e poi ripete il tiro salvezza.\nSecondo Fallimento: il bersaglio ottiene la condizione Privo di Sensi per 1 minuto. L\'effetto termina se subisce danni o se una creatura entro 1,5 metri usa un\'azione per svegliarlo.' }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [{ name: 'Arcani', desc: 'Oggetti eclettici e curiosi, ognuno legato a una storia o a una leggenda.' }],
      notes: 'Draghi della Conoscenza e della Conversazione\n\nHabitat: Deserto\nTesoro: Arcani\n\nI giovani draghi d\'ottone viaggiano molto, spesso trascorrendo alcuni anni in una regione prima di tornare alla propria tana. Alcuni lavorano a stretto contatto con altri draghi metallici, trasportando informazioni tra alleati.\n\n' + DRAGHI_OTTONE_LORE
    },
    {
      id: 'preset_drago_ottone_adulto', name: 'Drago d\'Ottone Adulto', emoji: '🐉', rarity: 'epic',
      type: 'Drago', size: 'Enorme', alignment: 'Caotico Buono',
      ac: 18, hp: 172, hpCur: 172, hpTemp: 0, hpDice: '15d12+75', init: 10,
      speed: '12 m, Scavare 9 m, Volare 24 m', cr: '13', xp: '',
      str: 23, dex: 10, con: 21, intl: 14, wis: 13, cha: 17,
      savesOverride: { str: '', dex: '5', con: '', intl: '', wis: '6', cha: '' },
      skillOverrides: { storia: '7', percezione: '11', persuasione: '8', furtivita: '5' }, passivePerception: 21,
      senses: [{ type: 'Vista Cieca', value: 18, unit: 'm' }, { type: 'Scurovisione', value: 36, unit: 'm' }], languages: ['Comune', 'Draconico'],
      dmgResist: [], dmgImmune: ['Fuoco'], dmgVulner: [], condImmune: [],
      traits: [
        { name: 'Resistenza Leggendaria', desc: '(3/Giorno, oppure 4/Giorno nella Tana)\nSe il drago fallisce un tiro salvezza, può scegliere di superarlo invece.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il drago effettua tre attacchi Lacerazione. Può sostituire un attacco con un uso di Soffio del Sonno oppure con il lancio di Raggio Rovente tramite Incantesimi.' },
        { name: 'Lacerazione', desc: 'Attacco con arma da mischia: +11 a colpire, portata 3 metri.\nColpito: 17 (2d10 + 6) danni taglienti più 4 (1d8) danni da fuoco.', atkHit: '+11', atkDmgs: [{ f: '2d10+6', t: 'taglienti' }, { f: '1d8', t: 'fuoco' }] },
        { name: 'Soffio di Fuoco (Ricarica 5-6)', desc: 'Tiro Salvezza su Destrezza: CD 18, ogni creatura nella linea del soffio.\nFallimento: 45 (10d8) danni da fuoco. Successo: metà danni.', atkDmgs: [{ f: '10d8', t: 'fuoco' }] },
        { name: 'Soffio del Sonno', desc: 'Tiro Salvezza su Costituzione: CD 18. Ogni creatura in un cono di 18 metri.\nFallimento: il bersaglio ottiene la condizione Incapacitato fino alla fine del suo turno successivo e poi ripete il tiro salvezza.\nSecondo Fallimento: il bersaglio ottiene la condizione Privo di Sensi per 10 minuti. L\'effetto termina se subisce danni o viene svegliato.' },
        { name: 'Incantesimi', desc: 'Il drago lancia i seguenti incantesimi senza componenti materiali, usando Carisma come caratteristica da incantatore (CD 16).\n\nA volontà: Individuazione del Magico, Illusione Minore, Raggio Rovente, Trasformazione (solo Bestia o Umanoide; nessun PF temporaneo e nessuna concentrazione richiesta), Parlare con gli Animali.\n\n1/Giorno ciascuno: Individuazione dei Pensieri, Controllare Tempo Atmosferico.' }
      ],
      bonusActions: [],
      reactions: [],
      legendaryActions: [
        { name: 'Usi (3 per round, 4 nella Tana)', desc: 'Il drago può usare una sola azione leggendaria alla volta, alla fine del turno di un\'altra creatura. Recupera gli utilizzi spesi all\'inizio del proprio turno.' },
        { name: 'Luce Accecante', desc: 'Il drago usa Incantesimi per lanciare Raggio Rovente.' },
        { name: 'Balzo', desc: 'Il drago si muove fino a metà della propria velocità ed effettua un attacco Lacerazione.', atkHit: '+11', atkDmgs: [{ f: '2d10+6', t: 'taglienti' }, { f: '1d8', t: 'fuoco' }] },
        { name: 'Sabbie Ustionanti', desc: 'Tiro Salvezza su Destrezza: CD 16. Una creatura entro 36 metri.\nFallimento: 27 (6d8) danni da fuoco e la velocità del bersaglio è dimezzata fino alla fine del suo turno successivo.\nIl drago non può usare nuovamente questa azione fino all\'inizio del suo turno successivo.', atkDmgs: [{ f: '6d8', t: 'fuoco' }] }
      ],
      drop: [{ name: 'Arcani', desc: 'Oggetti eclettici e curiosi, ognuno legato a una storia o a una leggenda.' }],
      notes: 'Draghi della Conoscenza e della Conversazione\n\nHabitat: Deserto\nTesoro: Arcani\n\nI draghi d\'ottone adulti conoscono molti segreti e dispongono di vaste reti di contatti. Condividono le prospettive apprese in tutto il mondo e combattono con passione le menzogne di truffatori e malvagi che portano le persone fuori strada.\n\n' + DRAGHI_OTTONE_LORE + '\n\n' + DRAGHI_OTTONE_TANA + '\n\n(Affrontato nella propria tana, il drago vale 11.500 PE.)'
    },
    {
      id: 'preset_drago_ottone_antico', name: 'Drago d\'Ottone Antico', emoji: '🐉', rarity: 'legendary',
      type: 'Drago', size: 'Mastodontica', alignment: 'Caotico Buono',
      ac: 20, hp: 332, hpCur: 332, hpTemp: 0, hpDice: '19d20+133', init: 12,
      speed: '12 m, Scavare 12 m, Volare 24 m', cr: '20', xp: '',
      str: 27, dex: 10, con: 25, intl: 16, wis: 15, cha: 22,
      savesOverride: { str: '', dex: '6', con: '', intl: '', wis: '8', cha: '' },
      skillOverrides: { storia: '9', percezione: '14', persuasione: '12', furtivita: '6' }, passivePerception: 24,
      senses: [{ type: 'Vista Cieca', value: 18, unit: 'm' }, { type: 'Scurovisione', value: 36, unit: 'm' }], languages: ['Comune', 'Draconico'],
      dmgResist: [], dmgImmune: ['Fuoco'], dmgVulner: [], condImmune: [],
      traits: [
        { name: 'Resistenza Leggendaria', desc: '(4/Giorno, oppure 5/Giorno nella Tana)\nSe il drago fallisce un tiro salvezza, può scegliere di superarlo invece.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il drago effettua tre attacchi Lacerazione. Può sostituire un attacco con Soffio del Sonno oppure con Raggio Rovente (versione di 3° livello).' },
        { name: 'Lacerazione', desc: 'Attacco con arma da mischia: +14 a colpire, portata 4,5 metri.\nColpito: 19 (2d10 + 8) danni taglienti più 7 (2d6) danni da fuoco.', atkHit: '+14', atkDmgs: [{ f: '2d10+8', t: 'taglienti' }, { f: '2d6', t: 'fuoco' }] },
        { name: 'Soffio di Fuoco (Ricarica 5-6)', desc: 'Tiro Salvezza su Destrezza: CD 21. Ogni creatura in una linea lunga 27 metri.\nFallimento: 58 (13d8) danni da fuoco. Successo: metà danni.', atkDmgs: [{ f: '13d8', t: 'fuoco' }] },
        { name: 'Soffio del Sonno', desc: 'Tiro Salvezza su Costituzione: CD 21. Ogni creatura in un cono di 27 metri.\nFallimento: il bersaglio ottiene la condizione Incapacitato fino alla fine del suo turno successivo e poi ripete il tiro salvezza.\nSecondo Fallimento: il bersaglio ottiene la condizione Privo di Sensi per 10 minuti. L\'effetto termina se subisce danni o viene svegliato.' },
        { name: 'Incantesimi', desc: 'Il drago lancia i seguenti incantesimi senza componenti materiali, usando Carisma come caratteristica da incantatore (CD 20).\n\nA volontà: Individuazione del Magico, Illusione Minore, Raggio Rovente (versione di 3° livello), Trasformazione (solo Bestia o Umanoide; nessun PF temporaneo e nessuna concentrazione richiesta), Parlare con gli Animali.\n\n1/Giorno ciascuno: Controllare Tempo Atmosferico, Individuazione dei Pensieri.' }
      ],
      bonusActions: [],
      reactions: [],
      legendaryActions: [
        { name: 'Usi (3 per round, 4 nella Tana)', desc: 'Il drago può usare una sola azione leggendaria alla volta, alla fine del turno di un\'altra creatura. Recupera gli utilizzi spesi all\'inizio del proprio turno.' },
        { name: 'Luce Accecante', desc: 'Il drago lancia Raggio Rovente (versione di 3° livello).' },
        { name: 'Balzo', desc: 'Il drago si muove fino a metà della propria velocità ed effettua un attacco Lacerazione.', atkHit: '+14', atkDmgs: [{ f: '2d10+8', t: 'taglienti' }, { f: '2d6', t: 'fuoco' }] },
        { name: 'Sabbie Ustionanti', desc: 'Tiro Salvezza su Destrezza: CD 20. Una creatura entro 36 metri.\nFallimento: 36 (8d8) danni da fuoco e la velocità del bersaglio è dimezzata fino alla fine del suo turno successivo.\nIl drago non può usare nuovamente questa azione fino all\'inizio del suo turno successivo.', atkDmgs: [{ f: '8d8', t: 'fuoco' }] }
      ],
      drop: [{ name: 'Arcani', desc: 'Oggetti eclettici e curiosi accumulati nei secoli, ognuno legato a una storia o a una leggenda.' }],
      notes: 'Draghi della Conoscenza e della Conversazione\n\nHabitat: Deserto\nTesoro: Arcani\n\nGli antichi draghi d\'ottone creano reti che si estendono attraverso interi mondi. Combattono le forze della repressione e della disinformazione, aiutando le persone a imparare dagli errori del passato. Personalmente o tramite reti di messaggeri, mantengono i loro alleati informati sulle sfide che potrebbero affrontare insieme.\n\n' + DRAGHI_OTTONE_LORE + '\n\n' + DRAGHI_OTTONE_TANA + '\n\n(Affrontato nella propria tana, il drago vale 33.000 PE.)'
    },
    {
      id: 'preset_cucciolo_drago_bronzo', name: 'Cucciolo di Drago di Bronzo', emoji: '🐲', rarity: 'epic',
      type: 'Drago', size: 'Media', alignment: 'Legale Buono',
      ac: 15, hp: 39, hpCur: 39, hpTemp: 0, hpDice: '6d8+12', init: 2,
      speed: '9 m, Volare 18 m, Nuotare 9 m', cr: '2', xp: '',
      str: 17, dex: 10, con: 15, intl: 12, wis: 11, cha: 15,
      savesOverride: { str: '', dex: '2', con: '', intl: '', wis: '2', cha: '' },
      skillOverrides: { percezione: '4', furtivita: '2' }, passivePerception: 14,
      senses: [{ type: 'Vista Cieca', value: 3, unit: 'm' }, { type: 'Scurovisione', value: 18, unit: 'm' }], languages: ['Draconico'],
      dmgResist: [], dmgImmune: ['Fulmine'], dmgVulner: [], condImmune: [],
      traits: [
        { name: 'Anfibio', desc: 'Il drago può respirare sia aria che acqua.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il drago effettua due attacchi Lacerazione.' },
        { name: 'Lacerazione', desc: 'Attacco con arma da mischia: +5 a colpire, portata 1,5 metri.\nColpito: 8 (1d10 + 3) danni taglienti.', atkHit: '+5', atkDmgs: [{ f: '1d10+3', t: 'taglienti' }] },
        { name: 'Soffio di Fulmine (Ricarica 5-6)', desc: 'Tiro Salvezza su Destrezza: CD 12. Ogni creatura in una linea lunga 12 metri e larga 1,5 metri.\nFallimento: 16 (3d10) danni da fulmine. Successo: metà danni.', atkDmgs: [{ f: '3d10', t: 'fulmine' }] },
        { name: 'Soffio di Repulsione', desc: 'Tiro Salvezza su Forza: CD 12. Ogni creatura in un cono di 9 metri.\nFallimento: il bersaglio viene spinto fino a 9 metri direttamente lontano dal drago e ottiene la condizione Prono.' }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [{ name: 'Strumenti', desc: 'Oggetti potenzialmente utili e tesori recuperati dal mare, comprese ricchezze e navi affondate.' }],
      notes: 'Draghi del Potenziale e della Conservazione\n\nHabitat: Costa\nTesoro: Strumenti\n\nI cuccioli di drago di bronzo credono di poter risolvere qualsiasi problema e cercano costantemente di dimostrarlo. Spesso si fissano su questioni locali, come siccità o banditismo dilagante. Sebbene il loro entusiasmo possa risultare affascinante, talvolta si spingono oltre le proprie capacità e possono aver bisogno di aiuto per correggere i loro errori.\n\n' + DRAGHI_BRONZO_LORE
    },
    {
      id: 'preset_giovane_drago_bronzo', name: 'Giovane Drago di Bronzo', emoji: '🐉', rarity: 'epic',
      type: 'Drago', size: 'Grande', alignment: 'Legale Buono',
      ac: 17, hp: 142, hpCur: 142, hpTemp: 0, hpDice: '15d10+60', init: 3,
      speed: '12 m, Volare 24 m, Nuotare 12 m', cr: '8', xp: '',
      str: 21, dex: 10, con: 19, intl: 14, wis: 13, cha: 17,
      savesOverride: { str: '', dex: '3', con: '', intl: '', wis: '4', cha: '' },
      skillOverrides: { intuizione: '4', percezione: '7', furtivita: '3' }, passivePerception: 17,
      senses: [{ type: 'Vista Cieca', value: 9, unit: 'm' }, { type: 'Scurovisione', value: 36, unit: 'm' }], languages: ['Comune', 'Draconico'],
      dmgResist: [], dmgImmune: ['Fulmine'], dmgVulner: [], condImmune: [],
      traits: [
        { name: 'Anfibio', desc: 'Il drago può respirare sia aria che acqua.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il drago effettua tre attacchi Lacerazione. Può sostituire un attacco con un uso di Soffio di Repulsione.' },
        { name: 'Lacerazione', desc: 'Attacco con arma da mischia: +8 a colpire, portata 3 metri.\nColpito: 16 (2d10 + 5) danni taglienti.', atkHit: '+8', atkDmgs: [{ f: '2d10+5', t: 'taglienti' }] },
        { name: 'Soffio di Fulmine (Ricarica 5-6)', desc: 'Tiro Salvezza su Destrezza: CD 15. Ogni creatura in una linea lunga 18 metri e larga 1,5 metri.\nFallimento: 49 (9d10) danni da fulmine. Successo: metà danni.', atkDmgs: [{ f: '9d10', t: 'fulmine' }] },
        { name: 'Soffio di Repulsione', desc: 'Tiro Salvezza su Forza: CD 15. Ogni creatura in un cono di 9 metri.\nFallimento: il bersaglio viene spinto fino a 12 metri direttamente lontano dal drago e ottiene la condizione Prono.' }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [{ name: 'Strumenti', desc: 'Oggetti potenzialmente utili e tesori recuperati dal mare, comprese ricchezze e navi affondate.' }],
      notes: 'Draghi del Potenziale e della Conservazione\n\nHabitat: Costa\nTesoro: Strumenti\n\nMolti giovani draghi di bronzo diventano esperti in un particolare tipo di problema, come scacciare i pirati o proteggere le comunità dalle tempeste. Raccolgono amici con competenze diverse, costruendo una comunità di esperti su cui poter fare affidamento.\n\n' + DRAGHI_BRONZO_LORE
    },
    {
      id: 'preset_drago_bronzo_adulto', name: 'Drago di Bronzo Adulto', emoji: '🐉', rarity: 'epic',
      type: 'Drago', size: 'Enorme', alignment: 'Legale Buono',
      ac: 18, hp: 212, hpCur: 212, hpTemp: 0, hpDice: '17d12+102', init: 10,
      speed: '12 m, Volare 24 m, Nuotare 12 m', cr: '15', xp: '',
      str: 25, dex: 10, con: 23, intl: 16, wis: 15, cha: 20,
      savesOverride: { str: '', dex: '5', con: '', intl: '', wis: '7', cha: '' },
      skillOverrides: { intuizione: '7', percezione: '12', furtivita: '5' }, passivePerception: 22,
      senses: [{ type: 'Vista Cieca', value: 18, unit: 'm' }, { type: 'Scurovisione', value: 36, unit: 'm' }], languages: ['Comune', 'Draconico'],
      dmgResist: [], dmgImmune: ['Fulmine'], dmgVulner: [], condImmune: [],
      traits: [
        { name: 'Anfibio', desc: 'Il drago può respirare sia aria che acqua.' },
        { name: 'Resistenza Leggendaria', desc: '(3/Giorno, oppure 4/Giorno nella Tana)\nSe il drago fallisce un tiro salvezza, può scegliere di superarlo invece.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il drago effettua tre attacchi Lacerazione. Può sostituire un attacco con un uso di Soffio di Repulsione oppure con il lancio di Dardo Tracciante (versione di 2° livello).' },
        { name: 'Lacerazione', desc: 'Attacco con arma da mischia: +12 a colpire, portata 3 metri.\nColpito: 16 (2d8 + 7) danni taglienti più 5 (1d10) danni da fulmine.', atkHit: '+12', atkDmgs: [{ f: '2d8+7', t: 'taglienti' }, { f: '1d10', t: 'fulmine' }] },
        { name: 'Soffio di Fulmine (Ricarica 5-6)', desc: 'Tiro Salvezza su Destrezza: CD 19. Ogni creatura in una linea lunga 27 metri e larga 1,5 metri.\nFallimento: 55 (10d10) danni da fulmine. Successo: metà danni.', atkDmgs: [{ f: '10d10', t: 'fulmine' }] },
        { name: 'Soffio di Repulsione', desc: 'Tiro Salvezza su Forza: CD 19. Ogni creatura in un cono di 9 metri.\nFallimento: il bersaglio viene spinto fino a 18 metri direttamente lontano dal drago e ottiene la condizione Prono.' },
        { name: 'Incantesimi', desc: 'Il drago lancia i seguenti incantesimi senza componenti materiali, usando Carisma come caratteristica da incantatore (CD 17, +10 a colpire con gli attacchi con incantesimo).\n\nA volontà: Individuazione del Magico, Dardo Tracciante (versione di 2° livello), Trasformazione (solo Bestia o Umanoide; nessun PF temporaneo e nessuna concentrazione richiesta), Parlare con gli Animali, Taumaturgia.\n\n1/Giorno ciascuno: Individuazione dei Pensieri, Respirare Sott’Acqua.' }
      ],
      bonusActions: [],
      reactions: [],
      legendaryActions: [
        { name: 'Usi (3 per round, 4 nella Tana)', desc: 'Il drago può usare una sola azione leggendaria alla volta, alla fine del turno di un\'altra creatura. Recupera gli utilizzi spesi all\'inizio del proprio turno.' },
        { name: 'Luce Guida', desc: 'Il drago usa Incantesimi per lanciare Dardo Tracciante (versione di 2° livello).' },
        { name: 'Balzo', desc: 'Il drago si muove fino a metà della propria velocità ed effettua un attacco Lacerazione.', atkHit: '+12', atkDmgs: [{ f: '2d8+7', t: 'taglienti' }, { f: '1d10', t: 'fulmine' }] },
        { name: 'Tuonoclap', desc: 'Tiro Salvezza su Costituzione: CD 17. Ogni creatura entro una sfera di raggio 6 metri centrata in un punto che il drago può vedere entro 27 metri.\nFallimento: 10 (3d6) danni da tuono e il bersaglio ottiene la condizione Assordato fino alla fine del suo turno successivo.', atkDmgs: [{ f: '3d6', t: 'tuono' }] }
      ],
      drop: [{ name: 'Strumenti', desc: 'Oggetti potenzialmente utili e tesori recuperati dal mare, comprese ricchezze e navi affondate.' }],
      notes: 'Draghi del Potenziale e della Conservazione\n\nHabitat: Costa\nTesoro: Strumenti\n\nI draghi di bronzo adulti vivono spesso vicino ai luoghi che difendono o dove aiutano gli altri a perseguire i propri obiettivi. Possono diventare protettori di intere città, consigliando i governanti e contribuendo alla prosperità di generazioni.\n\n' + DRAGHI_BRONZO_LORE + '\n\n' + DRAGHI_BRONZO_TANA + '\n\n(Affrontato nella propria tana, il drago vale 15.000 PE.)'
    },
    {
      id: 'preset_drago_bronzo_antico', name: 'Drago di Bronzo Antico', emoji: '🐉', rarity: 'legendary',
      type: 'Drago', size: 'Mastodontica', alignment: 'Legale Buono',
      ac: 22, hp: 444, hpCur: 444, hpTemp: 0, hpDice: '24d20+192', init: 14,
      speed: '12 m, Volare 24 m, Nuotare 12 m', cr: '22', xp: '',
      str: 29, dex: 10, con: 27, intl: 18, wis: 17, cha: 25,
      savesOverride: { str: '', dex: '7', con: '', intl: '', wis: '10', cha: '' },
      skillOverrides: { intuizione: '10', percezione: '17', furtivita: '7' }, passivePerception: 27,
      senses: [{ type: 'Vista Cieca', value: 18, unit: 'm' }, { type: 'Scurovisione', value: 36, unit: 'm' }], languages: ['Comune', 'Draconico'],
      dmgResist: [], dmgImmune: ['Fulmine'], dmgVulner: [], condImmune: [],
      traits: [
        { name: 'Anfibio', desc: 'Il drago può respirare sia aria che acqua.' },
        { name: 'Resistenza Leggendaria', desc: '(4/Giorno, oppure 5/Giorno nella Tana)\nSe il drago fallisce un tiro salvezza, può scegliere di superarlo invece.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il drago effettua tre attacchi Lacerazione. Può sostituire un attacco con un uso di Soffio di Repulsione oppure con il lancio di Dardo Tracciante (versione di 2° livello).' },
        { name: 'Lacerazione', desc: 'Attacco con arma da mischia: +16 a colpire, portata 4,5 metri.\nColpito: 18 (2d8 + 9) danni taglienti più 9 (2d8) danni da fulmine.', atkHit: '+16', atkDmgs: [{ f: '2d8+9', t: 'taglienti' }, { f: '2d8', t: 'fulmine' }] },
        { name: 'Soffio di Fulmine (Ricarica 5-6)', desc: 'Tiro Salvezza su Destrezza: CD 23. Ogni creatura in una linea lunga 36 metri e larga 3 metri.\nFallimento: 82 (15d10) danni da fulmine. Successo: metà danni.', atkDmgs: [{ f: '15d10', t: 'fulmine' }] },
        { name: 'Soffio di Repulsione', desc: 'Tiro Salvezza su Forza: CD 23. Ogni creatura in un cono di 9 metri.\nFallimento: il bersaglio viene spinto fino a 18 metri direttamente lontano dal drago e ottiene la condizione Prono.' },
        { name: 'Incantesimi', desc: 'Il drago lancia i seguenti incantesimi senza componenti materiali, usando Carisma come caratteristica da incantatore (CD 22, +14 a colpire con gli attacchi con incantesimo).\n\nA volontà: Individuazione del Magico, Dardo Tracciante (versione di 2° livello), Trasformazione (solo Bestia o Umanoide; nessun PF temporaneo e nessuna concentrazione richiesta), Parlare con gli Animali, Taumaturgia.\n\n1/Giorno ciascuno: Individuazione dei Pensieri, Controllare Acqua, Scrutare, Respirare Sott’Acqua.' }
      ],
      bonusActions: [],
      reactions: [],
      legendaryActions: [
        { name: 'Usi (3 per round, 4 nella Tana)', desc: 'Il drago può usare una sola azione leggendaria alla volta, alla fine del turno di un\'altra creatura. Recupera gli utilizzi spesi all\'inizio del proprio turno.' },
        { name: 'Luce Guida', desc: 'Il drago usa Incantesimi per lanciare Dardo Tracciante (versione di 2° livello).' },
        { name: 'Balzo', desc: 'Il drago si muove fino a metà della propria velocità ed effettua un attacco Lacerazione.', atkHit: '+16', atkDmgs: [{ f: '2d8+9', t: 'taglienti' }, { f: '2d8', t: 'fulmine' }] },
        { name: 'Tuonoclap', desc: 'Tiro Salvezza su Costituzione: CD 22. Ogni creatura entro una sfera di raggio 6 metri centrata in un punto che il drago può vedere entro 36 metri.\nFallimento: 13 (3d8) danni da tuono e il bersaglio ottiene la condizione Assordato fino alla fine del suo turno successivo.', atkDmgs: [{ f: '3d8', t: 'tuono' }] }
      ],
      drop: [{ name: 'Strumenti', desc: 'Oggetti potenzialmente utili e tesori recuperati dal mare, comprese ricchezze e navi affondate, accumulati nei secoli.' }],
      notes: 'Draghi del Potenziale e della Conservazione\n\nHabitat: Costa\nTesoro: Strumenti\n\nGli antichi draghi di bronzo sviluppano spettacolari patine sulle loro scaglie scintillanti. Si impegnano a proteggere intere regioni, continenti o perfino pianeti dalle minacce. Cercano soluzioni a calamità che coinvolgono più mondi o a pericoli multiversali e si oppongono al male dei potenti draghi cromatici.\n\n' + DRAGHI_BRONZO_LORE + '\n\n' + DRAGHI_BRONZO_TANA + '\n\n(Affrontato nella propria tana, il drago vale 50.000 PE.)'
    },
    {
      id: 'preset_bugbear_stalker', name: 'Bugbear Stalker', emoji: '👺', rarity: 'common',
      type: 'Fata', size: 'Media', alignment: 'Caotico Malvagio',
      ac: 15, hp: 65, hpCur: 65, hpTemp: 0, hpDice: '10d8+20', init: 2,
      speed: '9 m', cr: '3', xp: '',
      str: 17, dex: 14, con: 14, intl: 11, wis: 12, cha: 11,
      savesOverride: { str: '', dex: '', con: '4', intl: '', wis: '3', cha: '' },
      skillOverrides: { furtivita: '6', sopravvivenza: '3' }, passivePerception: 11,
      senses: [{ type: 'Scurovisione', value: 18, unit: 'm' }], languages: ['Comune', 'Goblin'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [
        { name: 'Rapire', desc: 'Il bugbear non deve spendere movimento aggiuntivo per muovere una creatura che sta afferrando.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il bugbear effettua due attacchi con Giavellotto o Mazza Chiodata.' },
        { name: 'Giavellotto', desc: 'Attacco con arma da mischia o a distanza: +5 a colpire, portata 3 metri oppure gittata 9/36 metri.\nColpito: 13 (3d6 + 3) danni perforanti.', atkHit: '+5', atkDmgs: [{ f: '3d6+3', t: 'perforanti' }] },
        { name: 'Mazza Chiodata', desc: 'Attacco con arma da mischia: +5 a colpire (con Vantaggio se il bersaglio è Afferrato dal bugbear), portata 3 metri.\nColpito: 12 (2d8 + 3) danni perforanti.', atkHit: '+5', atkDmgs: [{ f: '2d8+3', t: 'perforanti' }] }
      ],
      bonusActions: [
        { name: 'Presa Rapida', desc: 'Tiro Salvezza su Destrezza: CD 13. Una creatura Media o più piccola che il bugbear può vedere entro 3 metri.\nFallimento: il bersaglio ottiene la condizione Afferrato (CD di fuga 13).' }
      ],
      reactions: [], legendaryActions: [],
      drop: [{ name: 'Equipaggiamento', desc: 'Cotta di maglia, 6 giavellotti, mazza chiodata, più effetti personali.' }],
      notes: 'Bruti Goblinoidi in Agguato\n\nHabitat: Foresta, Prateria, Piano Fatato (Feywild), Sottosuolo\nTesoro: Armamenti, Personale\n\nI bugbear stalker prendono frequentemente in ostaggio le loro vittime, compiacendosi delle occasioni di imprigionare e terrorizzare altre creature.\n\n' + BUGBEAR_LORE
    },
    {
      id: 'preset_guerriero_bugbear', name: 'Guerriero Bugbear', emoji: '👺', rarity: 'common',
      type: 'Fata', size: 'Media', alignment: 'Caotico Malvagio',
      ac: 14, hp: 33, hpCur: 33, hpTemp: 0, hpDice: '6d8+6', init: 2,
      speed: '9 m', cr: '1', xp: '',
      str: 15, dex: 14, con: 13, intl: 8, wis: 11, cha: 9,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { furtivita: '6', sopravvivenza: '2' }, passivePerception: 10,
      senses: [{ type: 'Scurovisione', value: 18, unit: 'm' }], languages: ['Comune', 'Goblin'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [
        { name: 'Rapire', desc: 'Il bugbear non deve spendere movimento aggiuntivo per muovere una creatura che sta afferrando.' }
      ],
      actions: [
        { name: 'Afferrare', desc: 'Attacco con arma da mischia: +4 a colpire, portata 3 metri.\nColpito: 9 (2d6 + 2) danni contundenti. Se il bersaglio è una creatura Media o più piccola, ottiene la condizione Afferrato (CD di fuga 12).', atkHit: '+4', atkDmgs: [{ f: '2d6+2', t: 'contundenti' }] },
        { name: 'Martello Leggero', desc: 'Attacco con arma da mischia o a distanza: +4 a colpire (con Vantaggio se il bersaglio è Afferrato dal bugbear), portata 3 metri oppure gittata 6/18 metri.\nColpito: 9 (3d4 + 2) danni contundenti.', atkHit: '+4', atkDmgs: [{ f: '3d4+2', t: 'contundenti' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [{ name: 'Equipaggiamento', desc: 'Armatura di cuoio, 3 martelli leggeri, più effetti personali.' }],
      notes: 'Bruti Goblinoidi in Agguato\n\nHabitat: Foresta, Prateria, Piano Fatato (Feywild), Sottosuolo\nTesoro: Armamenti, Personale\n\nI Guerrieri Bugbear servono coloro che offrono loro tesori, cibo o la possibilità di cacciare prede impegnative.\n\n' + BUGBEAR_LORE
    },
    {
      id: 'preset_bulette', name: 'Bulette', emoji: '🦈', rarity: 'uncommon',
      type: 'Mostruosità', size: 'Grande', alignment: 'Senza Allineamento',
      ac: 17, hp: 94, hpCur: 94, hpTemp: 0, hpDice: '9d10+45', init: 0,
      speed: '12 m, Scavare 12 m', cr: '5', xp: '',
      str: 19, dex: 11, con: 21, intl: 2, wis: 10, cha: 5,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { percezione: '6' }, passivePerception: 16,
      senses: [{ type: 'Scurovisione', value: 18, unit: 'm' }, { type: 'Percezione Tellurica', value: 36, unit: 'm' }], languages: [],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Multiattacco', desc: 'La bulette effettua due attacchi Morso.' },
        { name: 'Morso', desc: 'Attacco con arma da mischia: +7 a colpire, portata 1,5 metri.\nColpito: 17 (2d12 + 4) danni perforanti.', atkHit: '+7', atkDmgs: [{ f: '2d12+4', t: 'perforanti' }] },
        { name: 'Balzo Mortale', desc: 'La bulette spende 1,5 metri di movimento per saltare in uno spazio entro 4,5 metri che contenga una o più creature Grandi o più piccole. Ogni creatura nello spazio di destinazione effettua un Tiro Salvezza su Destrezza (CD 15).\nFallimento: 19 (3d12) danni contundenti e il bersaglio ottiene la condizione Prono.\nSuccesso: metà danni e il bersaglio viene spinto di 1,5 metri in linea retta lontano dalla bulette.', atkDmgs: [{ f: '3d12', t: 'contundenti' }] }
      ],
      bonusActions: [
        { name: 'Balzo', desc: 'La bulette salta fino a 9 metri spendendo 3 metri di movimento.' }
      ],
      reactions: [], legendaryActions: [],
      drop: [],
      notes: 'Voraci Squali di Terra Sotterranei\n\nHabitat: Prateria, Colline, Montagne\nTesoro: Nessuno\n\nLe bulette percorrono vasti territori. Spesso minacciano le mandrie di animali e possono annientare intere comunità agricole.\n\n' + BULETTE_LORE
    },
    {
      id: 'preset_cucciolo_bulette', name: 'Cucciolo di Bulette', emoji: '🦈', rarity: 'common',
      type: 'Mostruosità', size: 'Media', alignment: 'Senza Allineamento',
      ac: 16, hp: 45, hpCur: 45, hpTemp: 0, hpDice: '6d8+18', init: -1,
      speed: '9 m, Scavare 6 m', cr: '2', xp: '',
      str: 16, dex: 8, con: 17, intl: 2, wis: 10, cha: 4,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { percezione: '4' }, passivePerception: 14,
      senses: [{ type: 'Scurovisione', value: 9, unit: 'm' }, { type: 'Percezione Tellurica', value: 18, unit: 'm' }], languages: [],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Morso', desc: 'Attacco con arma da mischia: +5 a colpire, portata 1,5 metri.\nColpito: 14 (2d10 + 3) danni perforanti.', atkHit: '+5', atkDmgs: [{ f: '2d10+3', t: 'perforanti' }] }
      ],
      bonusActions: [
        { name: 'Balzo', desc: 'Il cucciolo salta fino a 9 metri spendendo 3 metri di movimento.' }
      ],
      reactions: [], legendaryActions: [],
      drop: [],
      notes: 'Voraci Squali di Terra Sotterranei\n\nHabitat: Prateria, Colline, Montagne\nTesoro: Nessuno\n\nLe bulette giovani sono note come cuccioli. Viaggiano in piccoli gruppi, sfruttando il numero per abbattere avversari più grandi. Il loro arrivo è spesso presagio della comparsa di una bulette adulta.\n\n' + BULETTE_LORE
    },
    {
      id: 'preset_saggio_paludi_bullywug', name: 'Saggio delle Paludi Bullywug', emoji: '🐸', rarity: 'uncommon',
      type: 'Fata', size: 'Media', alignment: 'Neutrale',
      ac: 16, hp: 52, hpCur: 52, hpTemp: 0, hpDice: '8d8+16', init: 3,
      speed: '9 m, Nuotare 9 m', cr: '4', xp: '',
      str: 8, dex: 16, con: 14, intl: 10, wis: 16, cha: 12,
      savesOverride: { str: '', dex: '', con: '4', intl: '', wis: '5', cha: '' },
      skillOverrides: { natura: '4', furtivita: '5' }, passivePerception: 13,
      senses: [], languages: ['Bullywug', 'Comune', 'Silvano'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [
        { name: 'Anfibio', desc: 'Il bullywug può respirare sia aria che acqua.' },
        { name: 'Parlare con Rane e Rospi', desc: 'Quando parla in bullywug, può comunicare concetti semplici a rane e rospi.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il bullywug effettua due attacchi con il Bastone della Palude. Può sostituire uno qualsiasi di questi attacchi con l\'uso di Incantare per lanciare Raggio di Infermità.' },
        { name: 'Bastone della Palude', desc: 'Attacco con arma da mischia: +5 a colpire, portata 1,5 metri.\nColpito: 7 (1d8 + 3) danni contundenti più 10 (3d6) danni da veleno.', atkHit: '+5', atkDmgs: [{ f: '1d8+3', t: 'contundenti' }, { f: '3d6', t: 'veleno' }] },
        { name: 'Incantare', desc: 'Il bullywug lancia uno dei seguenti incantesimi usando la Saggezza come caratteristica da incantatore (CD 13, +5 a colpire con gli attacchi con incantesimo).\n\nA volontà: Luci Danzanti, Artificio Druidico, Raggio di Infermità.\n\n1/Giorno ciascuno: Parlare con i Vegetali, Sfera al Vetriolo.' }
      ],
      bonusActions: [
        { name: 'Balzo', desc: 'Il bullywug salta fino a 9 metri spendendo 3 metri di movimento.' }
      ],
      reactions: [], legendaryActions: [],
      drop: [{ name: 'Attrezzi', desc: 'Borsa dei componenti e attrezzi della palude, più effetti personali.' }],
      notes: 'Abitanti Anfibi di Paludi e Fanghiglia\n\nHabitat: Palude\nTesoro: Attrezzi, Individuale\n\nI saggi delle paludi bullywug incanalano la magia della palude per indebolire i nemici e parlare con le piante.\n\n' + BULLYWUG_LORE
    },
    {
      id: 'preset_guerriero_bullywug', name: 'Guerriero Bullywug', emoji: '🐸', rarity: 'common',
      type: 'Fata', size: 'Media', alignment: 'Neutrale',
      ac: 15, hp: 11, hpCur: 11, hpTemp: 0, hpDice: '2d8+2', init: 2,
      speed: '9 m, Nuotare 9 m', cr: '1/4', xp: '',
      str: 12, dex: 14, con: 13, intl: 7, wis: 10, cha: 7,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { furtivita: '4' }, passivePerception: 10,
      senses: [], languages: ['Bullywug', 'Comune'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [
        { name: 'Anfibio', desc: 'Il bullywug può respirare sia aria che acqua.' },
        { name: 'Parlare con Rane e Rospi', desc: 'Quando parla in bullywug, può comunicare concetti semplici a rane e rospi.' }
      ],
      actions: [
        { name: 'Stocco Insettile', desc: 'Attacco con arma da mischia: +4 a colpire, portata 1,5 metri.\nColpito: 6 (1d8 + 2) danni perforanti più 2 (1d4) danni da veleno.', atkHit: '+4', atkDmgs: [{ f: '1d8+2', t: 'perforanti' }, { f: '1d4', t: 'veleno' }] }
      ],
      bonusActions: [
        { name: 'Balzo', desc: 'Il bullywug salta fino a 9 metri spendendo 3 metri di movimento.' }
      ],
      reactions: [], legendaryActions: [],
      drop: [{ name: 'Attrezzi', desc: 'Attrezzi della palude e armi rudimentali, più effetti personali.' }],
      notes: 'Abitanti Anfibi di Paludi e Fanghiglia\n\nHabitat: Palude\nTesoro: Attrezzi, Individuale\n\nI guerrieri bullywug sono esperti nel muoversi attraverso le paludi e tendere imboscate agli intrusi. Spesso combattono al fianco di branchi di rane giganti addestrate.\n\n' + BULLYWUG_LORE
    },
    {
      id: 'preset_cambion', name: 'Cambion', emoji: '🦹', rarity: 'uncommon',
      type: 'Immondo', size: 'Media', alignment: 'Neutrale Malvagio',
      ac: 19, hp: 105, hpCur: 105, hpTemp: 0, hpDice: '14d8+42', init: 4,
      speed: '9 m, Volare 18 m', cr: '5', xp: '',
      str: 18, dex: 18, con: 16, intl: 14, wis: 12, cha: 16,
      savesOverride: { str: '7', dex: '', con: '6', intl: '5', wis: '', cha: '6' },
      skillOverrides: { inganno: '6', percezione: '4', furtivita: '7' }, passivePerception: 14,
      senses: [{ type: 'Scurovisione', value: 36, unit: 'm' }], languages: ['Abissale', 'Comune', 'Infernale'],
      dmgResist: ['Freddo', 'Fuoco', 'Fulmine', 'Veleno'], dmgImmune: [], dmgVulner: [],
      condImmune: ['Avvelenato'],
      traits: [],
      actions: [
        { name: 'Multiattacco', desc: 'Il cambion effettua due attacchi, usando Artiglio o Raggio di Fuoco in qualsiasi combinazione.' },
        { name: 'Artiglio', desc: 'Attacco con arma da mischia: +7 a colpire, portata 1,5 metri.\nColpito: 8 (1d8 + 4) danni taglienti più 7 (2d6) danni da fuoco.', atkHit: '+7', atkDmgs: [{ f: '1d8+4', t: 'taglienti' }, { f: '2d6', t: 'fuoco' }] },
        { name: 'Raggio di Fuoco', desc: 'Attacco con incantesimo a distanza: +7 a colpire, gittata 36 metri.\nColpito: 13 (3d6 + 3) danni da fuoco.', atkHit: '+7', atkDmgs: [{ f: '3d6+3', t: 'fuoco' }] },
        { name: 'Incantesimi', desc: 'Il cambion lancia uno dei seguenti incantesimi senza componenti materiali, usando Carisma come caratteristica da incantatore (CD 14).\n\n2/Giorno ciascuno: Alterare Sé Stesso, Comando (versione di 3° livello), Individuazione del Magico.\n\n1/Giorno ciascuno: Dominare Persone (versione di 8° livello), Spostamento Planare (solo su sé stesso).' }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [{ name: 'Reliquie', desc: 'Reliquie e oggetti legati alla fonte del potere immondo del cambion.' }],
      notes: 'Mortale infuso di potere immondo\n\nHabitat: Qualsiasi\nTesoro: Reliquie\n\nI cambion sono ex mortali corrotti dal potere degli immondi o posseduti da forze insidiose. Mentre i tiefling sono individui dal libero arbitrio con una traccia di ascendenza immonda, i cambion sono intrinsecamente legati alla malvagia magia dei Piani Inferiori oppure da essa ricreati.\n\nMolti cambion servono le forze malevole che costituiscono la fonte dei loro poteri. Altri cercano di rivendicare la potenza di qualunque entità li abbia creati o di impadronirsi di poteri extraplanari per conto proprio. Tra i più famigerati vi è Iuz, un malvagio che ascese allo stato di semidio e il cui regno minaccia la Libera Città di Greyhawk su Oerth.\n\n— Origini del Cambion (tira 1d6) —\n1. Essere stato posseduto da un immondo.\n2. Essere stato resuscitato da un malvagio incantatore.\n3. Una lunga esposizione a un Piano Inferiore.\n4. Aver stretto un patto con un immondo.\n5. Aver subito la maledizione di una divinità.\n6. Aver preso parte a rituali immondi.\n\n— Iuz il Malvagio, semidio cambion —\n«Sembra che debba fare tutto da solo, visto che ho soltanto degli sciocchi come servitori. Chiaramente la delusione dev\'essere il prezzo della divinità.»'
    },
    {
      id: 'preset_strisciante_carogna', name: 'Strisciante Carogna', emoji: '🪱', rarity: 'common',
      type: 'Mostruosità', size: 'Grande', alignment: 'Senza Allineamento',
      ac: 13, hp: 51, hpCur: 51, hpTemp: 0, hpDice: '6d10+18', init: 1,
      speed: '9 m, Scalare 9 m', cr: '2', xp: '',
      str: 14, dex: 13, con: 16, intl: 1, wis: 12, cha: 5,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { percezione: '5' }, passivePerception: 15,
      senses: [{ type: 'Scurovisione', value: 18, unit: 'm' }], languages: [],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [
        { name: 'Camminare sui Ragni', desc: 'Lo strisciante carogna può scalare superfici difficili, inclusi i soffitti, senza dover effettuare una prova di caratteristica.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Lo strisciante carogna usa Tentacoli Paralizzanti ed effettua un attacco con Morso.' },
        { name: 'Morso', desc: 'Attacco con arma da mischia: +4 a colpire, portata 1,5 metri.\nColpito: 7 (2d4 + 2) danni perforanti più 3 (1d6) danni da veleno.', atkHit: '+4', atkDmgs: [{ f: '2d4+2', t: 'perforanti' }, { f: '1d6', t: 'veleno' }] },
        { name: 'Tentacoli Paralizzanti', desc: 'Tiro Salvezza su Destrezza: CD 12. Una creatura che lo strisciante carogna può vedere entro 3 metri.\nFallimento: il bersaglio ottiene la condizione Avvelenato e ripete il tiro salvezza alla fine di ciascuno dei suoi turni, terminando l\'effetto su sé stesso con un successo (dopo 1 minuto riesce automaticamente). Finché è Avvelenato in questo modo, ottiene anche la condizione Paralizzato.' }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [],
      notes: 'Necrofago delle Catacombe\n\nHabitat: Sottosuolo, Urbano\nTesoro: Nessuno\n\nVoraci divoratori di cadaveri, gli striscianti carogna gravitano verso luoghi di massacro e decomposizione. In ambienti così carichi, si nutrono dei morti senza alcuna considerazione per l\'origine o la freschezza dei loro pasti.\n\nPossiedono corpi segmentati simili a giganteschi vermi tagliatori. Da sotto le loro mascelle multipartite sporgono otto sottili tentacoli sferzanti. Le creature colpite da questi tentacoli rischiano di essere paralizzate e divorate.\n\nPerlustrano fogne, campi di battaglia, necropoli e terre selvagge corrotte alla ricerca di cadaveri, aggrappandosi ai soffitti per tendere imboscate alle prede più piccole e per evitare i predatori concorrenti. Sono attratti dalla luce e dall\'odore del sangue, che riconoscono come segnali della presenza di cibo.\n\nQuesti spazzini evitano di ingerire materiale inorganico: cripte con armature funerarie ripulite dai loro cadaveri e catacombe inquietantemente immacolate sono segni di infestazione da striscianti carogna.'
    },
    {
      id: 'preset_guardiano_centauro', name: 'Guardiano Centauro', emoji: '🐎', rarity: 'rare',
      type: 'Fata', size: 'Grande', alignment: 'Neutrale Buono',
      ac: 16, hp: 105, hpCur: 105, hpTemp: 0, hpDice: '14d10+28', init: 2,
      speed: '15 m', cr: '7', xp: '',
      str: 18, dex: 14, con: 14, intl: 9, wis: 18, cha: 11,
      savesOverride: { str: '', dex: '', con: '5', intl: '', wis: '7', cha: '' },
      skillOverrides: { atletica: '7', natura: '5', percezione: '7' }, passivePerception: 17,
      senses: [], languages: ['Druidico', 'Elfico', 'Silvano'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Multiattacco', desc: 'Il centauro effettua due attacchi, usando Bastone della Foresta o Raggio Solare in qualsiasi combinazione.' },
        { name: 'Bastone della Foresta', desc: 'Attacco con arma da mischia: +7 a colpire, portata 1,5 metri.\nColpito: 13 (2d8 + 4) danni contundenti più 14 (4d6) danni da veleno.', atkHit: '+7', atkDmgs: [{ f: '2d8+4', t: 'contundenti' }, { f: '4d6', t: 'veleno' }] },
        { name: 'Raggio Solare', desc: 'Attacco con incantesimo a distanza: +7 a colpire, gittata 27 metri.\nColpito: 14 (3d6 + 4) danni radiosi e il bersaglio ottiene la condizione Accecato fino all\'inizio del turno successivo del centauro.', atkHit: '+7', atkDmgs: [{ f: '3d6+4', t: 'radiosi' }] },
        { name: 'Incantesimi', desc: 'Il centauro lancia uno dei seguenti incantesimi usando la Saggezza come caratteristica da incantatore (CD 15).\n\nA volontà: Artificio Druidico, Parlare con gli Animali.' }
      ],
      bonusActions: [
        { name: 'Sentiero Intralciante (Ricarica 5-6)', desc: 'Il centauro si muove fino alla propria velocità senza provocare attacchi di opportunità. Ogni creatura entro 1,5 metri dal centauro durante il movimento è bersaglio del seguente effetto.\nTiro Salvezza su Forza: CD 15.\nFallimento: 11 (2d6 + 4) danni contundenti e il bersaglio ottiene la condizione Trattenuto fino alla fine del suo turno successivo.', atkDmgs: [{ f: '2d6+4', t: 'contundenti' }] }
      ],
      reactions: [], legendaryActions: [],
      drop: [{ name: 'Armi', desc: 'Il bastone della foresta e le armi del centauro, più effetti personali.' }],
      notes: 'Difensori delle Terre Fatate\n\nHabitat: Foresta, Prateria, Piano Fatato (Feywild)\nTesoro: Armi, Individuale\n\nI guardiani centauri guidano spesso gruppi di soldati centauri e fungono da intermediari tra le creature fatate e gli intrusi che penetrano nei loro territori.\n\n' + CENTAURI_LORE
    },
    {
      id: 'preset_soldato_centauro', name: 'Soldato Centauro', emoji: '🐎', rarity: 'uncommon',
      type: 'Fata', size: 'Grande', alignment: 'Neutrale Buono',
      ac: 16, hp: 45, hpCur: 45, hpTemp: 0, hpDice: '6d10+12', init: 2,
      speed: '15 m', cr: '2', xp: '',
      str: 18, dex: 14, con: 14, intl: 9, wis: 13, cha: 11,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { atletica: '6', percezione: '3' }, passivePerception: 13,
      senses: [], languages: ['Elfico', 'Silvano'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Multiattacco', desc: 'Il centauro effettua due attacchi, usando Picca o Arco Lungo in qualsiasi combinazione.' },
        { name: 'Picca', desc: 'Attacco con arma da mischia: +6 a colpire, portata 3 metri.\nColpito: 9 (1d10 + 4) danni perforanti.', atkHit: '+6', atkDmgs: [{ f: '1d10+4', t: 'perforanti' }] },
        { name: 'Arco Lungo', desc: 'Attacco con arma a distanza: +4 a colpire, gittata 45/180 metri.\nColpito: 6 (1d8 + 2) danni perforanti.', atkHit: '+4', atkDmgs: [{ f: '1d8+2', t: 'perforanti' }] }
      ],
      bonusActions: [
        { name: 'Carica Travolgente (Ricarica 5-6)', desc: 'Il centauro si muove fino alla propria velocità senza provocare attacchi di opportunità e può attraversare gli spazi occupati da creature di taglia Media o inferiore. Ogni creatura il cui spazio viene attraversato è bersaglio del seguente effetto.\nTiro Salvezza su Forza: CD 14.\nFallimento: 7 (1d6 + 4) danni contundenti e il bersaglio ottiene la condizione Prono.', atkDmgs: [{ f: '1d6+4', t: 'contundenti' }] }
      ],
      reactions: [], legendaryActions: [],
      drop: [{ name: 'Equipaggiamento', desc: 'Corazza pettorale, arco lungo, picca, più effetti personali.' }],
      notes: 'Difensori delle Terre Fatate\n\nHabitat: Foresta, Prateria, Piano Fatato (Feywild)\nTesoro: Armi, Individuale\n\nI soldati centauri sono guardiani simili a cavalieri. Molti di loro diffidano delle creature che non appartengono al popolo fatato.\n\n' + CENTAURI_LORE
    },
    {
      id: 'preset_diavolo_catene', name: 'Diavolo delle Catene', emoji: '⛓️', rarity: 'rare',
      type: 'Immondo', size: 'Media', alignment: 'Legale Malvagio',
      ac: 15, hp: 85, hpCur: 85, hpTemp: 0, hpDice: '10d8+40', init: 5,
      speed: '9 m', cr: '8', xp: '',
      str: 18, dex: 15, con: 18, intl: 11, wis: 12, cha: 14,
      savesOverride: { str: '', dex: '', con: '7', intl: '', wis: '4', cha: '' },
      skillOverrides: {}, passivePerception: 11,
      senses: [{ type: 'Vista del Diavolo', value: 36, unit: 'm' }], languages: ['Infernale', 'Telepatia 36 m'],
      dmgResist: ['Contundente', 'Freddo', 'Perforante', 'Tagliente'], dmgImmune: ['Fuoco', 'Veleno'], dmgVulner: [],
      condImmune: ['Avvelenato'],
      traits: [
        { name: 'Restaurazione Diabolica', desc: 'Se il diavolo muore al di fuori dei Nove Inferi, il suo corpo scompare in una nube di fumo sulfureo e ottiene immediatamente un nuovo corpo, tornando in vita con tutti i suoi punti ferita da qualche parte nei Nove Inferi.' },
        { name: 'Resistenza Magica', desc: 'Il diavolo ha vantaggio ai tiri salvezza contro incantesimi e altri effetti magici.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il diavolo effettua due attacchi con Catena e usa Evocare Catena Infernale.' },
        { name: 'Catena', desc: 'Attacco con arma da mischia: +7 a colpire, portata 3 metri.\nColpito: 11 (2d6 + 4) danni taglienti. Se il bersaglio è una creatura di taglia Grande o inferiore, ottiene la condizione Afferrato (CD di fuga 14) da una delle due catene e la condizione Trattenuto finché la presa non termina.', atkHit: '+7', atkDmgs: [{ f: '2d6+4', t: 'taglienti' }] },
        { name: 'Evocare Catena Infernale', desc: 'Il diavolo evoca una catena fiammeggiante per vincolare una creatura. Tiro Salvezza su Destrezza: CD 15, una creatura che il diavolo può vedere entro 18 metri.\nFallimento: 9 (2d4 + 4) danni da fuoco e il bersaglio subisce la condizione Trattenuto fino alla fine del turno successivo del diavolo, quando la catena scompare; se è di taglia Grande o inferiore, il diavolo lo sposta fino a 9 metri in linea retta verso di sé.\nSuccesso: la catena scompare.', atkDmgs: [{ f: '2d4+4', t: 'fuoco' }] }
      ],
      bonusActions: [],
      reactions: [
        { name: 'Sguardo Inquietante', desc: 'Innesco: una creatura che il diavolo può vedere inizia il proprio turno entro 9 metri da lui e può vedere il diavolo.\nRisposta: la creatura effettua un Tiro Salvezza su Saggezza (CD 15).\nFallimento: subisce la condizione Spaventato fino alla fine del suo turno.\nSuccesso: è immune allo Sguardo Inquietante di questo diavolo per 24 ore.' }
      ],
      legendaryActions: [],
      drop: [{ name: 'Strumenti', desc: 'Catene animate e strumenti di tortura usati dal diavolo per estorcere segreti.' }],
      notes: 'Diavolo del Dolore e del Controllo\n\nHabitat: Piani (Nove Inferi)\nTesoro: Strumenti\n\nConosciuti anche come kyton, i diavoli delle catene si considerano macabri artigiani che usano inganno, intimidazione e metallo crudele per costringere i prigionieri a tradire sé stessi. Molti servono diavoli potenti, strappando segreti alle anime imprigionate mediante catene animate e letali. Lasciati a sé stessi, incoraggiano individui spietati a perseguire magie proibite, conducendo i loro discepoli lungo sentieri che portano ai Nove Inferi.\n\nOltre alle minacce psicologiche e ai danni fisici, un diavolo delle catene usa il suo sguardo inquietante per far percepire alle vittime la loro peggiore paura, invece del mostro che hanno davanti.\n\n— Maschere del Diavolo delle Catene (tira 1d4) —\nPer un osservatore, il diavolo appare come...\n1. Il cadavere di una persona amata.\n2. Una divinità disapprovante.\n3. Un istruttore o superiore severo.\n4. L\'osservatore nel momento più basso della sua vita.'
    },
    {
      id: 'preset_chasme', name: 'Chasme', emoji: '🪰', rarity: 'uncommon',
      type: 'Immondo', size: 'Grande', alignment: 'Caotico Malvagio',
      ac: 15, hp: 78, hpCur: 78, hpTemp: 0, hpDice: '12d10+12', init: 5,
      speed: '6 m, Volare 18 m', cr: '6', xp: '',
      str: 15, dex: 15, con: 12, intl: 11, wis: 14, cha: 10,
      savesOverride: { str: '', dex: '5', con: '', intl: '', wis: '5', cha: '' },
      skillOverrides: { percezione: '5' }, passivePerception: 15,
      senses: [{ type: 'Vista Cieca', value: 3, unit: 'm' }, { type: 'Scurovisione', value: 36, unit: 'm' }], languages: ['Abissale', 'Telepatia 36 m'],
      dmgResist: ['Freddo', 'Fuoco', 'Fulmine'], dmgImmune: ['Veleno'], dmgVulner: [],
      condImmune: ['Avvelenato'],
      traits: [
        { name: 'Restaurazione Demoniaca', desc: 'Se il chasme muore al di fuori dell\'Abisso, il suo corpo si dissolve in icore ed esso ottiene immediatamente un nuovo corpo, tornando in vita con tutti i suoi punti ferita da qualche parte nell\'Abisso.' },
        { name: 'Resistenza Magica', desc: 'Il chasme ha vantaggio ai tiri salvezza contro incantesimi e altri effetti magici.' },
        { name: 'Camminare sui Ragni', desc: 'Il chasme può scalare superfici difficili, inclusi i soffitti, senza dover effettuare una prova di caratteristica.' }
      ],
      actions: [
        { name: 'Proboscide', desc: 'Attacco con arma da mischia: +5 a colpire, portata 1,5 metri.\nColpito: 16 (4d6 + 2) danni perforanti più 21 (6d6) danni necrotici. Se il bersaglio è una creatura, il suo massimo dei punti ferita diminuisce di un ammontare pari ai danni necrotici subiti.', atkHit: '+5', atkDmgs: [{ f: '4d6+2', t: 'perforanti' }, { f: '6d6', t: 'necrotici' }] }
      ],
      bonusActions: [
        { name: 'Ronzio', desc: 'Tiro Salvezza su Costituzione: CD 12, ogni creatura entro un\'emanazione di 9 metri originata dal chasme (i demoni superano automaticamente il tiro salvezza).\nFallimento: il bersaglio subisce la condizione Privo di Sensi e ripete il tiro salvezza alla fine di ciascuno dei suoi turni. Supera automaticamente il tiro dopo 10 minuti, se subisce danni, oppure se una creatura entro 1,5 metri usa un\'azione per svuotargli addosso una fiaschetta di Acqua Santa.\nSuccesso: il bersaglio è immune al Ronzio di questo chasme per 24 ore.' }
      ],
      reactions: [], legendaryActions: [],
      drop: [{ name: 'Reliquie', desc: 'Reliquie e cimeli sottratti alle vittime trascinate nelle orde demoniache.' }],
      notes: 'Demone del Tradimento e dell\'Adulazione\n\nHabitat: Piani (Abisso)\nTesoro: Reliquie\n\nEmergendo dall\'Abisso, i chasme assomigliano a mosche grandi quanto un cavallo. Rendono incapaci i nemici producendo un ronzio che intorpidisce la mente, poi usano le loro proboscidi per prosciugare la forza vitale delle vittime. Nell\'Abisso, la maggior parte dei chasme serve ossequiosamente demoni più potenti e va in cerca di prigionieri da costringere a unirsi alle orde demoniache.'
    },
    {
      id: 'preset_chimera', name: 'Chimera', emoji: '🦁', rarity: 'uncommon',
      type: 'Mostruosità', size: 'Grande', alignment: 'Caotico Malvagio',
      ac: 14, hp: 114, hpCur: 114, hpTemp: 0, hpDice: '12d10+48', init: 0,
      speed: '9 m, Volare 18 m', cr: '6', xp: '',
      str: 19, dex: 11, con: 19, intl: 3, wis: 14, cha: 10,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { percezione: '8' }, passivePerception: 18,
      senses: [{ type: 'Scurovisione', value: 18, unit: 'm' }], languages: ['Comprende il Draconico ma non può parlare'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Multiattacco', desc: 'La chimera effettua un attacco con Cornata, un attacco con Morso e un attacco con Artiglio. Può sostituire l\'attacco con Artiglio con un utilizzo di Soffio di Fuoco, se disponibile.' },
        { name: 'Morso', desc: 'Attacco con arma da mischia: +7 a colpire, portata 1,5 metri.\nColpito: 11 (2d6 + 4) danni perforanti, oppure 18 (4d6 + 4) danni perforanti se la chimera aveva Vantaggio al tiro per colpire.', atkHit: '+7', atkDmgs: [{ f: '2d6+4', t: 'perforanti' }] },
        { name: 'Artiglio', desc: 'Attacco con arma da mischia: +7 a colpire, portata 1,5 metri.\nColpito: 7 (1d6 + 4) danni taglienti.', atkHit: '+7', atkDmgs: [{ f: '1d6+4', t: 'taglienti' }] },
        { name: 'Cornata', desc: 'Attacco con arma da mischia: +7 a colpire, portata 1,5 metri.\nColpito: 10 (1d12 + 4) danni contundenti. Se il bersaglio è una creatura di taglia Media o inferiore, ottiene la condizione Prono.', atkHit: '+7', atkDmgs: [{ f: '1d12+4', t: 'contundenti' }] },
        { name: 'Soffio di Fuoco (Ricarica 5-6)', desc: 'Tiro Salvezza su Destrezza: CD 15. Ogni creatura in un cono di 4,5 metri.\nFallimento: 31 (7d8) danni da fuoco. Successo: metà danni.', atkDmgs: [{ f: '7d8', t: 'fuoco' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [{ name: 'Tesoro', desc: 'Oggetti luccicanti, trofei e ossa delle prede accumulati nella tana cavernosa della chimera.' }],
      notes: 'Predatrice Multicefala\n\nHabitat: Prateria, Collina, Montagna\nTesoro: Qualsiasi\n\nViolente e imprevedibili, le chimere combinano i tratti più letali di leoni, arieti e draghi rossi. Con i loro artigli spaventosi, le corna devastanti e il soffio infuocato, le chimere sono tempeste di ferocia, guidate dagli istinti contrastanti delle loro tre teste. Le loro teste concordano su ben poche cose, ma condividono il desiderio di nutrirsi e di scacciare i rivali dai territori impervi in cui stabiliscono le proprie tane. Quando individuano una preda, in genere bersagliano i nemici con il loro soffio di fuoco prima di atterrare per attaccare con zanne, corna e artigli.\n\nA causa dei loro istinti draconici, le chimere sono creature avide che accumulano tesori nelle loro tane cavernose. Non sono particolarmente selettive riguardo a ciò che raccolgono, ammassando oggetti luccicanti accanto a trofei e ossa delle loro recenti uccisioni. Anime coraggiose che desiderano distrarre o placare temporaneamente una chimera possono riuscirci offrendole tesori e cibo.'
    },
    {
      id: 'preset_chuul', name: 'Chuul', emoji: '🦞', rarity: 'uncommon',
      type: 'Aberrazione', size: 'Grande', alignment: 'Caotico Malvagio',
      ac: 16, hp: 76, hpCur: 76, hpTemp: 0, hpDice: '9d10+27', init: 0,
      speed: '9 m, Nuotare 9 m', cr: '4', xp: '',
      str: 19, dex: 10, con: 16, intl: 5, wis: 11, cha: 5,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { percezione: '4' }, passivePerception: 14,
      senses: [{ type: 'Scurovisione', value: 18, unit: 'm' }], languages: ['Comprende il Linguaggio Profondo ma non può parlare'],
      dmgResist: [], dmgImmune: ['Veleno'], dmgVulner: [],
      condImmune: ['Avvelenato'],
      traits: [
        { name: 'Anfibio', desc: 'Il chuul può respirare sia aria sia acqua.' },
        { name: 'Percepire la Magia', desc: 'Il chuul percepisce la magia entro 36 metri da sé. Questo tratto funziona per il resto come l\'incantesimo Individuazione del Magico, ma non è di natura magica.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il chuul effettua due attacchi con Chela e usa Tentacoli Paralizzanti.' },
        { name: 'Chela', desc: 'Attacco con arma da mischia: +6 a colpire, portata 3 metri.\nColpito: 9 (1d10 + 4) danni contundenti. Se il bersaglio è una creatura di taglia Grande o inferiore, ottiene la condizione Afferrato (CD di fuga 14) da una delle due chele.', atkHit: '+6', atkDmgs: [{ f: '1d10+4', t: 'contundenti' }] },
        { name: 'Tentacoli Paralizzanti', desc: 'Tiro Salvezza su Costituzione: CD 13, una creatura afferrata dal chuul.\nFallimento: il bersaglio subisce la condizione Avvelenato e ripete il tiro salvezza alla fine di ciascuno dei suoi turni, terminando l\'effetto su sé stesso con un successo (dopo 1 minuto riesce automaticamente). Finché è Avvelenato in questo modo, ottiene anche la condizione Paralizzato.' }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [{ name: 'Reliquie', desc: 'Antichi tesori magici raccolti senza sosta dal chuul nel corso delle ere.' }],
      notes: 'Servitore Chitinoso di Poteri Primordiali\n\nHabitat: Costa, Palude, Sottosuolo\nTesoro: Reliquie\n\nI chuul ebbero origine in epoche dimenticate, quando gli aboleth e altre strane entità governavano imperi alieni sotto le onde. Gli aboleth trasformarono numerosi predatori degli abissi in servitori capaci di avventurarsi oltre i mari per reclamare altra magia e nuove creature da sfruttare. I chuul sono i più duraturi tra questi bizzarri servitori.\n\nMolti chuul servono signori aboleth, eseguendone i capricci nei mari senza luce e nelle paludi primordiali. Altri obbediscono a nuovi padroni aberranti, come beholder, grell o illithid. Alcuni seguono invece i propri impulsi, raccogliendo senza sosta antichi tesori magici o interpretando ordini vecchi di ere in modi bizzarri. Qualunque sia il loro scopo, i chuul intrappolano le creature nelle loro enormi chele prima di rendere impotenti i nemici con i tentacoli paralizzanti.\n\nI chuul non invecchiano e possono restare dormienti in luoghi nascosti per millenni, finché minacce, antichi ordini o strane compulsioni non li risvegliano.'
    },
    {
      id: 'preset_golem_argilla', name: 'Golem d\'Argilla', emoji: '🗿', rarity: 'rare',
      type: 'Costrutto', size: 'Grande', alignment: 'Senza Allineamento',
      ac: 14, hp: 123, hpCur: 123, hpTemp: 0, hpDice: '13d10+52', init: 3,
      speed: '9 m', cr: '9', xp: '',
      str: 20, dex: 9, con: 18, intl: 3, wis: 8, cha: 1,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: {}, passivePerception: 9,
      senses: [{ type: 'Scurovisione', value: 18, unit: 'm' }], languages: ['Comune più un\'altra lingua'],
      dmgResist: ['Contundente', 'Perforante', 'Tagliente'], dmgImmune: ['Acido', 'Veleno', 'Psichico'], dmgVulner: [],
      condImmune: ['Ammaliato', 'Esausto', 'Spaventato', 'Paralizzato', 'Pietrificato', 'Avvelenato'],
      traits: [
        { name: 'Assorbimento dell\'Acido', desc: 'Ogni volta che il golem subisce danni da acido, non subisce alcun danno e recupera invece un numero di punti ferita pari ai danni da acido che avrebbe subito.' },
        { name: 'Furia', desc: 'Ogni volta che il golem inizia il proprio turno Ferito (Bloodied), tira 1d6. Con un 6, il golem entra in Furia.\nMentre è in Furia, in ciascuno dei suoi turni attacca la creatura più vicina che riesce a vedere; se non ne ha nessuna a portata, attacca un oggetto. Rimane in Furia finché non viene distrutto o non è più Ferito.' },
        { name: 'Forma Immutabile', desc: 'Il golem non può cambiare forma.' },
        { name: 'Resistenza Magica', desc: 'Il golem ha vantaggio ai tiri salvezza contro incantesimi e altri effetti magici.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il golem effettua due attacchi Schianto, oppure tre attacchi Schianto se in questo turno ha usato Accelerazione.' },
        { name: 'Schianto', desc: 'Attacco con arma da mischia: +9 a colpire, portata 1,5 metri.\nColpito: 10 (1d10 + 5) danni contundenti più 6 (1d12) danni da acido. Inoltre il massimo dei punti ferita del bersaglio diminuisce di un ammontare pari ai danni da acido subiti.', atkHit: '+9', atkDmgs: [{ f: '1d10+5', t: 'contundenti' }, { f: '1d12', t: 'acido' }] }
      ],
      bonusActions: [
        { name: 'Accelerazione (Ricarica 5-6)', desc: 'Il golem effettua le azioni Scatto e Disimpegno.' }
      ],
      reactions: [], legendaryActions: [],
      drop: [{ name: 'Reliquie', desc: 'Materiali sacri e reliquie magiche impiegati nella creazione del golem (argilla di un sito sacro, mattoni di una rovina magica).' }],
      notes: 'Guardiano della Casa e del Focolare\n\nHabitat: Urbano\nTesoro: Reliquie\n\nI golem d\'argilla sono difensori magici creati da terra e argilla per proteggere luoghi o comunità. I materiali impiegati nella loro creazione provengono dalle vicinanze del luogo che proteggono e spesso hanno un significato speciale per i loro creatori, come argilla di un sito sacro o mattoni recuperati da una rovina magica. Alcuni golem sono scolpiti con maestria per assomigliare a esseri viventi, altri possiedono soltanto forme vagamente umanoidi.\n\nQuesti golem obbediscono agli ordini dei loro creatori e proteggono ciò che i loro padroni apprezzano di più. Alcuni continuano a seguire tali ordini molto tempo dopo la morte dei loro creatori.\n\n— Ordini del Golem d\'Argilla (tira 1d4) —\nIl golem segue ordini per...\n1. Bloccare il cammino di chiunque entri in un luogo con un\'arma sguainata.\n2. Difendere qualsiasi membro della famiglia o della comunità del suo creatore minacciato in sua presenza.\n3. Impedire a qualsiasi immondo di attraversare un ponte.\n4. Allontanare chiunque entri nel laboratorio del suo creatore.'
    },
    {
      id: 'preset_cloaker', name: 'Cloaker', emoji: '🦇', rarity: 'uncommon',
      type: 'Aberrazione', size: 'Grande', alignment: 'Caotico Neutrale',
      ac: 14, hp: 91, hpCur: 91, hpTemp: 0, hpDice: '14d10+14', init: 5,
      speed: '3 m, Volare 12 m', cr: '8', xp: '',
      str: 17, dex: 15, con: 12, intl: 13, wis: 14, cha: 7,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { furtivita: '5' }, passivePerception: 12,
      senses: [{ type: 'Scurovisione', value: 36, unit: 'm' }], languages: ['Linguaggio Profondo', 'Sottocomune'],
      dmgResist: [], dmgImmune: [], dmgVulner: [],
      condImmune: ['Spaventato'],
      traits: [
        { name: 'Sensibilità alla Luce', desc: 'Finché si trova in Luce Intensa, il cloaker ha Svantaggio ai tiri per colpire.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il cloaker effettua un attacco Avvinghiare e due attacchi con la Coda.' },
        { name: 'Avvinghiare', desc: 'Attacco con arma da mischia: +6 a colpire, portata 1,5 metri.\nColpito: 13 (3d6 + 3) danni perforanti. Se il bersaglio è una creatura di taglia Grande o inferiore, il cloaker vi si attacca.\nFinché resta attaccato: il bersaglio è Accecato; il cloaker dimezza i danni che subisce e il bersaglio subisce un ammontare di danni pari a quelli subiti dal cloaker. Il cloaker può staccarsi spendendo 1,5 metri di movimento; il bersaglio o una creatura entro 1,5 metri può usare un\'azione per staccarlo con una prova di Forza (Atletica) CD 14.', atkHit: '+6', atkDmgs: [{ f: '3d6+3', t: 'perforanti' }] },
        { name: 'Coda', desc: 'Attacco con arma da mischia: +6 a colpire, portata 3 metri.\nColpito: 8 (1d10 + 3) danni taglienti.', atkHit: '+6', atkDmgs: [{ f: '1d10+3', t: 'taglienti' }] }
      ],
      bonusActions: [
        { name: 'Fantasmi (Ricarica dopo Riposo Breve o Lungo)', desc: 'Il cloaker lancia Immagine Speculare senza componenti, usando Saggezza come caratteristica da incantatore. L\'incantesimo termina prematuramente se il cloaker inizia o termina il proprio turno in Luce Intensa.' },
        { name: 'Lamento', desc: 'Tiro Salvezza su Saggezza: CD 13, ogni creatura entro un\'emanazione di 18 metri originata dal cloaker.\nFallimento: il bersaglio subisce la condizione Spaventato fino alla fine del turno successivo del cloaker.\nSuccesso: il bersaglio è immune al Lamento di questo cloaker per 24 ore.' }
      ],
      reactions: [], legendaryActions: [],
      drop: [{ name: 'Strumenti', desc: 'Oggetti e strumenti lasciati dalle prede divorate nel nido sotterraneo del cloaker.' }],
      notes: 'Predatore delle Tenebre\n\nHabitat: Sottosuolo\nTesoro: Strumenti\n\nI cloaker sono misteriosi predatori del Sottosuolo, chiamati così dagli avventurieri per la loro somiglianza a mantelli appesi quando si aggrappano alle pareti. Come chiamino sé stessi è sconosciuto, ammesso che si riferiscano a sé stessi in qualche modo. Sebbene siano innegabilmente intelligenti, il loro comportamento è spesso imperscrutabile.\n\nTalvolta i cloaker si radunano in enclave del Sottosuolo, ma raramente costruiscono insediamenti o formano strutture sociali. La maggior parte vive come predatore solitario, annidandosi in desolate profondità sotterranee o in dungeon abbandonati — talvolta per mesi interi — mentre aspetta il passaggio di una preda. Usano le loro pelli screziate per confondersi con l\'ambiente circostante. Quando una preda ignara si avvicina, i cloaker si dispiegano e tentano di avvinghiarsi a essa per poi soffocarla nelle loro potenti ali.\n\nProvano piacere nell\'incutere paura ai nemici. Oltre ai metodi d\'imboscata, possono creare duplicati illusori di sé stessi ed emettere lamenti surreali che chi non è un cloaker trova terrificanti in modi inspiegabili e primordiali. Possono tormentare esploratori smarriti nel Sottosuolo per giorni, terrorizzandoli e disperdendoli prima di attaccare. Raramente conversano con altri esseri, se non per sussurrare inquietanti enigmi a coloro che stanno per divorare.'
    },
    {
      id: 'preset_gigante_nuvole', name: 'Gigante delle Nuvole', emoji: '☁️', rarity: 'rare',
      type: 'Gigante', size: 'Enorme', alignment: 'Neutrale',
      ac: 14, hp: 200, hpCur: 200, hpTemp: 0, hpDice: '16d12+96', init: 4,
      speed: '12 m, Volare 6 m (fluttuare)', cr: '9', xp: '',
      str: 27, dex: 10, con: 22, intl: 12, wis: 16, cha: 16,
      savesOverride: { str: '', dex: '', con: '10', intl: '', wis: '7', cha: '' },
      skillOverrides: { intuizione: '7', percezione: '11' }, passivePerception: 21,
      senses: [], languages: ['Comune', 'Gigante'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Multiattacco', desc: 'Il gigante effettua due attacchi, usando Mazza Tonante o Nube del Tuono in qualsiasi combinazione. Può sostituire uno degli attacchi con un uso di Incantesimi per lanciare Nube di Nebbia.' },
        { name: 'Mazza Tonante', desc: 'Attacco con arma da mischia: +12 a colpire, portata 3 metri.\nColpito: 21 (3d8 + 8) danni contundenti più 7 (2d6) danni da tuono.', atkHit: '+12', atkDmgs: [{ f: '3d8+8', t: 'contundenti' }, { f: '2d6', t: 'tuono' }] },
        { name: 'Nube del Tuono', desc: 'Attacco con arma a distanza: +12 a colpire, gittata 72 metri.\nColpito: 18 (3d6 + 8) danni da tuono e il bersaglio subisce la condizione Incapacitato fino alla fine del suo turno successivo.', atkHit: '+12', atkDmgs: [{ f: '3d6+8', t: 'tuono' }] },
        { name: 'Incantesimi', desc: 'Il gigante lancia uno dei seguenti incantesimi senza componenti materiali, usando Carisma come caratteristica da incantatore (CD 15).\n\nA volontà: Individuazione del Magico, Nube di Nebbia, Luce.\n\n1/Giorno ciascuno: Controllare Tempo Atmosferico, Forma Gassosa, Telecinesi.' }
      ],
      bonusActions: [
        { name: 'Passo Velato', desc: 'Il gigante lancia l\'incantesimo Passo Velato, usando la stessa caratteristica da incantatore di Incantesimi.' }
      ],
      reactions: [], legendaryActions: [],
      drop: [{ name: 'Arcani', desc: 'Favolosi tesori magici a misura di gigante, raccolti da ogni angolo del mondo o creati dal gigante stesso.' }],
      notes: 'Gigante delle Altezze Più Sublimi\n\nHabitat: Montagna\nTesoro: Arcani\n\nI giganti delle nuvole usano il potere dei cieli per osservare e influenzare sottilmente il mondo. Assomigliano a esseri umani con capelli che vanno dall\'argento al blu e pelle dalle sfumature simili alle nuvole, dal bianco abbagliante ai colori del crepuscolo. Canini ricurvi sporgono dalle loro mascelle superiori oltre il labbro inferiore. In battaglia combattono con armi avvolte da nubi tempestose e lanciano fragorose teste di tuono.\n\nLa maggior parte abita cittadelle che coronano immense montagne oppure palazzi magici che fluttuano tra le nuvole. Molti credono di possedere uno status o uno scopo altrettanto elevati: alcuni si considerano esseri quasi divini che possono manipolare e derubare impunemente le creature terrestri; altri sostengono che la loro lunga vita e il loro posto tra le nuvole concedano prospettive uniche, perciò registrano ciò che osservano nel mondo sottostante senza interferire. In entrambi i casi possiedono spesso favolosi tesori magici, ottenuti in ogni angolo del mondo oppure creati da loro stessi (e a misura di gigante).'
    },
    {
      id: 'preset_cockatrice', name: 'Cockatrice', emoji: '🐓', rarity: 'common',
      type: 'Mostruosità', size: 'Piccola', alignment: 'Senza Allineamento',
      ac: 11, hp: 22, hpCur: 22, hpTemp: 0, hpDice: '5d6+5', init: 1,
      speed: '6 m, Volare 12 m', cr: '1/2', xp: '',
      str: 6, dex: 12, con: 12, intl: 2, wis: 13, cha: 5,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: {}, passivePerception: 11,
      senses: [{ type: 'Scurovisione', value: 18, unit: 'm' }], languages: [],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: ['Pietrificato'],
      traits: [],
      actions: [
        { name: 'Morso Pietrificante', desc: 'Attacco con arma da mischia: +3 a colpire, portata 1,5 metri.\nColpito: 3 (1d4 + 1) danni perforanti. Se il bersaglio è una creatura, effettua un Tiro Salvezza su Costituzione (CD 11).\nPrimo Fallimento: il bersaglio ottiene la condizione Trattenuto e ripete il tiro salvezza alla fine del suo turno successivo se è ancora Trattenuto, terminando l\'effetto con un successo.\nSecondo Fallimento: il bersaglio ottiene la condizione Pietrificato (per 24 ore) al posto di Trattenuto.', atkHit: '+3', atkDmgs: [{ f: '1d4+1', t: 'perforanti' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [],
      notes: 'Volatili Maledetti con il Potere della Pietrificazione\n\nHabitat: Praterie\nTesoro: Nessuno\n\nLe cockatrici spesso cercano di appropriarsi di strutture appariscenti — come rovine e fattorie isolate — usandole come posatoi.\n\n' + COCKATRICE_LORE
    },
    {
      id: 'preset_cockatrice_reggente', name: 'Cockatrice Reggente', emoji: '🐓', rarity: 'uncommon',
      type: 'Mostruosità', size: 'Grande', alignment: 'Senza Allineamento',
      ac: 15, hp: 136, hpCur: 136, hpTemp: 0, hpDice: '16d10+48', init: 2,
      speed: '9 m, Volare 18 m', cr: '8', xp: '',
      str: 19, dex: 14, con: 16, intl: 3, wis: 16, cha: 5,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '6', cha: '' },
      skillOverrides: {}, passivePerception: 13,
      senses: [{ type: 'Scurovisione', value: 36, unit: 'm' }], languages: [],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: ['Pietrificato'],
      traits: [
        { name: 'Sorvolare', desc: 'La cockatrice non provoca attacchi di opportunità quando vola fuori dalla portata di un nemico.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'La cockatrice effettua un attacco con Morso Pietrificante e due attacchi con Artigli.' },
        { name: 'Morso Pietrificante', desc: 'Attacco con arma da mischia: +7 a colpire, portata 1,5 metri.\nColpito: 13 (2d8 + 4) danni perforanti. Se il bersaglio è una creatura, effettua un Tiro Salvezza su Costituzione (CD 14).\nPrimo Fallimento: il bersaglio ottiene la condizione Trattenuto e ripete il tiro salvezza alla fine del suo turno successivo se è ancora Trattenuto, terminando l\'effetto con un successo.\nSecondo Fallimento: il bersaglio ottiene la condizione Pietrificato al posto di Trattenuto.', atkHit: '+7', atkDmgs: [{ f: '2d8+4', t: 'perforanti' }] },
        { name: 'Artigli', desc: 'Attacco con arma da mischia: +7 a colpire, portata 1,5 metri.\nColpito: 18 (4d6 + 4) danni taglienti.', atkHit: '+7', atkDmgs: [{ f: '4d6+4', t: 'taglienti' }] }
      ],
      bonusActions: [],
      reactions: [
        { name: 'Contraccolpo Magico', desc: 'Innesco: una creatura entro 36 metri dalla cockatrice le infligge danni.\nRisposta: la creatura effettua un Tiro Salvezza su Destrezza (CD 14).\nFallimento: 13 (3d6 + 3) danni da forza.', atkDmgs: [{ f: '3d6+3', t: 'forza' }] }
      ],
      legendaryActions: [],
      drop: [],
      notes: 'Volatili Maledetti con il Potere della Pietrificazione\n\nHabitat: Praterie\nTesoro: Nessuno\n\nPiù audaci delle loro cugine minori, le cockatrici reggenti traboccano di energia magica instabile che utilizzano per trattenere i nemici lontani.\n\n' + COCKATRICE_LORE
    },
    {
      id: 'preset_colosso', name: 'Colosso', emoji: '🗿', rarity: 'legendary',
      type: 'Costrutto', size: 'Mastodontica', alignment: 'Senza Allineamento',
      ac: 23, hp: 553, hpCur: 553, hpTemp: 0, hpDice: '27d20+270', init: 16,
      speed: '18 m', cr: '25', xp: '',
      str: 30, dex: 11, con: 30, intl: 3, wis: 11, cha: 8,
      savesOverride: { str: '', dex: '8', con: '', intl: '', wis: '8', cha: '' },
      skillOverrides: {}, passivePerception: 10,
      senses: [{ type: 'Vista del Vero', value: 90, unit: 'm' }], languages: ['Comprende Celestiale e Comune ma non può parlare'],
      dmgResist: ['Necrotico', 'Radioso'], dmgImmune: ['Veleno', 'Psichico'], dmgVulner: [],
      condImmune: ['Ammaliato', 'Esausto', 'Spaventato', 'Paralizzato', 'Pietrificato', 'Avvelenato', 'Stordito', 'Privo di Sensi'],
      traits: [
        { name: 'Forma Immutabile', desc: 'Il colosso non può mutare forma.' },
        { name: 'Resistenza Leggendaria', desc: '(4/Giorno)\nSe il colosso fallisce un tiro salvezza, può scegliere di superarlo invece.' },
        { name: 'Resistenza Magica', desc: 'Il colosso ha vantaggio ai tiri salvezza contro incantesimi e altri effetti magici.' },
        { name: 'Assediante Mostruoso', desc: 'Il colosso infligge danni doppi a oggetti e strutture.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il colosso effettua tre attacchi, usando Schianto o Raggio Radioso in qualsiasi combinazione.' },
        { name: 'Schianto', desc: 'Attacco con arma da mischia: +18 a colpire, portata 6 metri.\nColpito: 32 (4d10 + 10) danni contundenti e il colosso spinge il bersaglio fino a 6 metri in linea retta lontano da sé.', atkHit: '+18', atkDmgs: [{ f: '4d10+10', t: 'contundenti' }] },
        { name: 'Raggio Radioso', desc: 'Attacco con arma a distanza: +18 a colpire, gittata 90 metri.\nColpito: 22 (4d10) danni radiosi. Se il bersaglio è una creatura di taglia Grande o inferiore, ottiene la condizione Prono.', atkHit: '+18', atkDmgs: [{ f: '4d10', t: 'radiosi' }] },
        { name: 'Raggio Divino (Ricarica 5-6)', desc: 'Tiro Salvezza su Destrezza: CD 26, effettuato da ogni creatura in una linea lunga 90 metri e larga 3 metri.\nFallimento: 65 (10d12) danni radiosi. Successo: metà danni.\nFallimento o Successo: una creatura ridotta a 0 punti ferita da questo raggio si disintegra in polvere, lasciando dietro di sé qualsiasi oggetto magico che indossava o trasportava.', atkDmgs: [{ f: '10d12', t: 'radiosi' }] }
      ],
      bonusActions: [],
      reactions: [],
      legendaryActions: [
        { name: 'Usi (3 per round)', desc: 'Immediatamente dopo il turno di un\'altra creatura, il colosso può spendere un utilizzo per una delle azioni leggendarie seguenti. Recupera tutti gli utilizzi spesi all\'inizio di ciascuno dei suoi turni.' },
        { name: 'Castigo', desc: 'Il colosso effettua un attacco con Raggio Radioso.', atkHit: '+18', atkDmgs: [{ f: '4d10', t: 'radiosi' }] },
        { name: 'Pestata', desc: 'Il colosso si muove fino a metà della propria velocità senza provocare attacchi di opportunità e può effettuare un attacco Schianto in qualsiasi momento durante quel movimento.', atkHit: '+18', atkDmgs: [{ f: '4d10+10', t: 'contundenti' }] }
      ],
      drop: [{ name: 'Reliquie', desc: 'Il possente cristallo divino nel cuore del colosso e reliquie sacre dei suoi creatori.' }],
      notes: 'Titanico Vascello del Potere Divino\n\nHabitat: Qualsiasi\nTesoro: Reliquie\n\nI colossi sono enormi Costrutti creati dai devoti per riflettere la natura di una divinità, benevola o malvagia che sia. Pulsano di incredibile magia e manifestano la volontà divina sulla terra.\n\nSchiere di artigiani fedeli forgiano un colosso in una forma che onori la loro divinità, quindi invocano quel dio affinché infonda vita alla statua. Questo arduo processo può richiedere decenni e coinvolgere centinaia di lavoratori. Se la divinità favorisce la creazione, il possente cristallo nel cuore del costrutto pulsa di potere divino e il colosso si erge per proteggere i fedeli o realizzare la volontà del dio.\n\nLa maggior parte dei colossi fu creata in epoche remote e ora giace dormiente in terre selvagge e isolate, risvegliandosi soltanto quando viene disturbata o richiamata a servire ancora una volta.'
    },
    {
      id: 'preset_popolano', name: 'Popolano', emoji: '🧑', rarity: 'common',
      type: 'Umanoide', size: 'Media', alignment: 'Neutrale',
      ac: 10, hp: 4, hpCur: 4, hpTemp: 0, hpDice: '1d8', init: 0,
      speed: '9 m', cr: '0', xp: '',
      str: 10, dex: 10, con: 10, intl: 10, wis: 10, cha: 10,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: {}, passivePerception: 10,
      senses: [], languages: ['Comune'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [
        { name: 'Addestramento', desc: 'Il popolano possiede competenza in un\'abilità a scelta del DM e ha Vantaggio ogni volta che effettua una prova di caratteristica usando quell\'abilità.' }
      ],
      actions: [
        { name: 'Randello', desc: 'Attacco con arma da mischia: +2 a colpire, portata 1,5 metri.\nColpito: 2 (1d4) danni contundenti.', atkHit: '+2', atkDmgs: [{ f: '1d4', t: 'contundenti' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [{ name: 'Beni Personali', desc: 'Un randello e i modesti effetti personali del popolano.' }],
      notes: 'Gente Comune\n\nHabitat: Qualsiasi\nTesoro: Individuale\n\nI popolani costituiscono la maggioranza delle persone che non perseguono talenti magici, addestramenti straordinari o una vita d\'avventura. Alcuni sono individui generosi e disponibili, mentre altri sono più cauti nel condividere ciò che possiedono.\n\n— Mestieri e ruoli (esempi) —\nArtista, Fornaio, Oste, Fabbro, Macellaio, Prigioniero, Carpentiere, Naufrago, Calzolaio, Cuoco, Tintore, Contadino, Pescatore, Costruttore di frecce, Imbroglione, Pettegolo, Eremita, Teppista, Cacciatore, Locandiere, Manovale, Lampionaio, Muratore, Mercante, Minatore, Vagabondo, Paziente, Pellegrino, Resurrezionista, Rivoltoso, Scriba, Servitore, Pastore, Studente, Sarto, Conciatore, Banditore, Tessitore, Ragazzo.\n\n(Resurrezionista: storicamente un trafugatore di cadaveri che vendeva corpi a medici e anatomisti.)'
    },
    {
      id: 'preset_cucciolo_drago_rame', name: 'Cucciolo di Drago di Rame', emoji: '🐲', rarity: 'epic',
      type: 'Drago', size: 'Media', alignment: 'Caotico Buono',
      ac: 16, hp: 22, hpCur: 22, hpTemp: 0, hpDice: '4d8+4', init: 3,
      speed: '9 m, Scalare 9 m, Volare 18 m', cr: '1', xp: '',
      str: 15, dex: 12, con: 13, intl: 14, wis: 11, cha: 13,
      savesOverride: { str: '', dex: '3', con: '', intl: '', wis: '2', cha: '' },
      skillOverrides: { percezione: '4', furtivita: '3' }, passivePerception: 14,
      senses: [{ type: 'Vista Cieca', value: 3, unit: 'm' }, { type: 'Scurovisione', value: 18, unit: 'm' }], languages: ['Draconico'],
      dmgResist: [], dmgImmune: ['Acido'], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Artiglio', desc: 'Attacco con arma da mischia: +4 a colpire, portata 1,5 metri.\nColpito: 7 (1d10 + 2) danni taglienti.', atkHit: '+4', atkDmgs: [{ f: '1d10+2', t: 'taglienti' }] },
        { name: 'Soffio Acido (Ricarica 5-6)', desc: 'Tiro Salvezza su Destrezza: CD 11. Ogni creatura in una linea lunga 6 metri e larga 1,5 metri.\nFallimento: 18 (4d8) danni da acido. Successo: metà danni.', atkDmgs: [{ f: '4d8', t: 'acido' }] },
        { name: 'Soffio Rallentante', desc: 'Tiro Salvezza su Costituzione: CD 11. Ogni creatura in un cono di 4,5 metri.\nFallimento: fino alla fine del suo turno successivo il bersaglio non può effettuare Reazioni, ha la velocità dimezzata e durante il proprio turno può compiere un\'Azione oppure un\'Azione Bonus, ma non entrambe.' }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [{ name: 'Arcani', desc: 'Doni e ricordi cari al drago, più qualche reliquia magica raccolta nei suoi viaggi.' }],
      notes: 'Draghi della Curiosità e della Comunità\n\nHabitat: Colline\nTesoro: Arcani\n\nI cuccioli di drago di rame si avventurano nel mondo alla ricerca di amici e meraviglie da scoprire. Talvolta finiscono nei guai, ma coloro che li aiutano possono diventare loro amici per la vita.\n\n' + DRAGHI_RAME_LORE
    },
    {
      id: 'preset_giovane_drago_rame', name: 'Giovane Drago di Rame', emoji: '🐉', rarity: 'epic',
      type: 'Drago', size: 'Grande', alignment: 'Caotico Buono',
      ac: 17, hp: 119, hpCur: 119, hpTemp: 0, hpDice: '14d10+42', init: 4,
      speed: '12 m, Scalare 12 m, Volare 24 m', cr: '7', xp: '',
      str: 19, dex: 12, con: 17, intl: 16, wis: 13, cha: 15,
      savesOverride: { str: '', dex: '4', con: '', intl: '', wis: '4', cha: '' },
      skillOverrides: { inganno: '5', percezione: '7', furtivita: '4' }, passivePerception: 17,
      senses: [{ type: 'Vista Cieca', value: 9, unit: 'm' }, { type: 'Scurovisione', value: 36, unit: 'm' }], languages: ['Comune', 'Draconico'],
      dmgResist: [], dmgImmune: ['Acido'], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Multiattacco', desc: 'Il drago effettua tre attacchi con Artiglio. Può sostituire uno degli attacchi con un uso di Soffio Rallentante.' },
        { name: 'Artiglio', desc: 'Attacco con arma da mischia: +7 a colpire, portata 3 metri.\nColpito: 15 (2d10 + 4) danni taglienti.', atkHit: '+7', atkDmgs: [{ f: '2d10+4', t: 'taglienti' }] },
        { name: 'Soffio Acido (Ricarica 5-6)', desc: 'Tiro Salvezza su Destrezza: CD 14. Ogni creatura in una linea lunga 12 metri e larga 1,5 metri.\nFallimento: 40 (9d8) danni da acido. Successo: metà danni.', atkDmgs: [{ f: '9d8', t: 'acido' }] },
        { name: 'Soffio Rallentante', desc: 'Tiro Salvezza su Costituzione: CD 14. Ogni creatura in un cono di 9 metri.\nFallimento: fino alla fine del suo turno successivo il bersaglio non può effettuare Reazioni, ha la velocità dimezzata e durante il proprio turno può compiere un\'Azione oppure un\'Azione Bonus, ma non entrambe.' }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [{ name: 'Arcani', desc: 'Doni e ricordi cari al drago, più qualche reliquia magica raccolta nei suoi viaggi.' }],
      notes: 'Draghi della Curiosità e della Comunità\n\nHabitat: Colline\nTesoro: Arcani\n\nI giovani draghi di rame instaurano forti legami con una comunità o un gruppo di amici, passando con entusiasmo da una fissazione artistica all\'altra.\n\n' + DRAGHI_RAME_LORE
    },
    {
      id: 'preset_drago_rame_adulto', name: 'Drago di Rame Adulto', emoji: '🐉', rarity: 'epic',
      type: 'Drago', size: 'Enorme', alignment: 'Caotico Buono',
      ac: 18, hp: 184, hpCur: 184, hpTemp: 0, hpDice: '16d12+80', init: 11,
      speed: '12 m, Scalare 12 m, Volare 24 m', cr: '14', xp: '',
      str: 23, dex: 12, con: 21, intl: 18, wis: 15, cha: 18,
      savesOverride: { str: '', dex: '6', con: '', intl: '', wis: '7', cha: '' },
      skillOverrides: { inganno: '9', percezione: '12', furtivita: '6' }, passivePerception: 22,
      senses: [{ type: 'Vista Cieca', value: 18, unit: 'm' }, { type: 'Scurovisione', value: 36, unit: 'm' }], languages: ['Comune', 'Draconico'],
      dmgResist: [], dmgImmune: ['Acido'], dmgVulner: [], condImmune: [],
      traits: [
        { name: 'Resistenza Leggendaria', desc: '(3/Giorno, oppure 4/Giorno nella Tana)\nSe il drago fallisce un tiro salvezza, può scegliere di superarlo invece.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il drago effettua tre attacchi con Artiglio. Può sostituire un attacco con un uso di Soffio Rallentante oppure con il lancio di Aculeo Mentale (versione di 4° livello) tramite Incantesimi.' },
        { name: 'Artiglio', desc: 'Attacco con arma da mischia: +11 a colpire, portata 3 metri.\nColpito: 17 (2d10 + 6) danni taglienti più 4 (1d8) danni da acido.', atkHit: '+11', atkDmgs: [{ f: '2d10+6', t: 'taglienti' }, { f: '1d8', t: 'acido' }] },
        { name: 'Soffio Acido (Ricarica 5-6)', desc: 'Tiro Salvezza su Destrezza: CD 18. Ogni creatura in una linea lunga 18 metri e larga 1,5 metri.\nFallimento: 54 (12d8) danni da acido. Successo: metà danni.', atkDmgs: [{ f: '12d8', t: 'acido' }] },
        { name: 'Soffio Rallentante', desc: 'Tiro Salvezza su Costituzione: CD 18. Ogni creatura in un cono di 18 metri.\nFallimento: fino alla fine del suo turno successivo il bersaglio non può effettuare Reazioni, ha la velocità dimezzata e durante il proprio turno può compiere un\'Azione oppure un\'Azione Bonus, ma non entrambe.' },
        { name: 'Incantesimi', desc: 'Il drago lancia uno dei seguenti incantesimi senza componenti materiali, usando Carisma come caratteristica da incantatore (CD 17).\n\nA volontà: Individuazione del Magico, Aculeo Mentale (versione di 4° livello), Illusione Minore, Trasformazione (solo forma di Bestia o Umanoide; nessun PF temporaneo e nessuna concentrazione richiesta).\n\n1/Giorno ciascuno: Ristorare Superiore, Immagine Maggiore.' }
      ],
      bonusActions: [],
      reactions: [],
      legendaryActions: [
        { name: 'Usi (3 per round, 4 nella Tana)', desc: 'Il drago può usare una sola azione leggendaria alla volta, alla fine del turno di un\'altra creatura. Recupera gli utilizzi spesi all\'inizio del proprio turno.' },
        { name: 'Magia Esilarante', desc: 'Tiro Salvezza su Carisma: CD 17, una creatura che il drago può vedere entro 27 metri.\nFallimento: 24 (7d6) danni psichici e, fino alla fine del suo turno successivo, ogni volta che il bersaglio effettua una prova di caratteristica o un tiro per colpire tira anche 1d6 e ne sottrae il risultato.\nIl drago non può usare di nuovo questa azione fino all\'inizio del suo turno successivo.', atkDmgs: [{ f: '7d6', t: 'psichici' }] },
        { name: 'Scossa Mentale', desc: 'Il drago usa Incantesimi per lanciare Aculeo Mentale (versione di 4° livello). Non può usare di nuovo questa azione fino all\'inizio del suo turno successivo.' },
        { name: 'Balzo', desc: 'Il drago si muove fino a metà della propria velocità ed effettua un attacco con Artiglio.', atkHit: '+11', atkDmgs: [{ f: '2d10+6', t: 'taglienti' }, { f: '1d8', t: 'acido' }] }
      ],
      drop: [{ name: 'Arcani', desc: 'Doni e ricordi cari al drago, più reliquie magiche raccolte dalla sua vasta rete di amici.' }],
      notes: 'Draghi della Curiosità e della Comunità\n\nHabitat: Colline\nTesoro: Arcani\n\nI draghi di rame adulti usano la loro influenza per migliorare il mondo. Con vaste cerchie di amici, traggono gioia dal mettere le persone in contatto tra loro e dall\'aiutarle a trovare luoghi dove possano prosperare. Quando si verifica una calamità, fanno affidamento sulla loro rete di conoscenze per offrire supporto, rimediare ai torti e ricostruire più saldamente di prima.\n\n' + DRAGHI_RAME_LORE + '\n\n' + DRAGHI_RAME_TANA + '\n\n(Affrontato nella propria tana, il drago vale 13.000 PE.)'
    },
    {
      id: 'preset_drago_rame_antico', name: 'Drago di Rame Antico', emoji: '🐉', rarity: 'legendary',
      type: 'Drago', size: 'Mastodontica', alignment: 'Caotico Buono',
      ac: 21, hp: 367, hpCur: 367, hpTemp: 0, hpDice: '21d20+147', init: 15,
      speed: '12 m, Scalare 12 m, Volare 24 m', cr: '21', xp: '',
      str: 27, dex: 12, con: 25, intl: 20, wis: 17, cha: 22,
      savesOverride: { str: '', dex: '8', con: '', intl: '', wis: '10', cha: '' },
      skillOverrides: { inganno: '13', percezione: '17', furtivita: '8' }, passivePerception: 27,
      senses: [{ type: 'Vista Cieca', value: 18, unit: 'm' }, { type: 'Scurovisione', value: 36, unit: 'm' }], languages: ['Comune', 'Draconico'],
      dmgResist: [], dmgImmune: ['Acido'], dmgVulner: [], condImmune: [],
      traits: [
        { name: 'Resistenza Leggendaria', desc: '(4/Giorno, oppure 5/Giorno nella Tana)\nSe il drago fallisce un tiro salvezza, può scegliere di superarlo invece.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il drago effettua tre attacchi con Artiglio. Può sostituire un attacco con un uso di Soffio Rallentante oppure con il lancio di Aculeo Mentale (versione di 5° livello) tramite Incantesimi.' },
        { name: 'Artiglio', desc: 'Attacco con arma da mischia: +15 a colpire, portata 4,5 metri.\nColpito: 19 (2d10 + 8) danni taglienti più 9 (2d8) danni da acido.', atkHit: '+15', atkDmgs: [{ f: '2d10+8', t: 'taglienti' }, { f: '2d8', t: 'acido' }] },
        { name: 'Soffio Acido (Ricarica 5-6)', desc: 'Tiro Salvezza su Destrezza: CD 22. Ogni creatura in una linea lunga 27 metri e larga 3 metri.\nFallimento: 63 (14d8) danni da acido. Successo: metà danni.', atkDmgs: [{ f: '14d8', t: 'acido' }] },
        { name: 'Soffio Rallentante', desc: 'Tiro Salvezza su Costituzione: CD 22. Ogni creatura in un cono di 27 metri.\nFallimento: fino alla fine del suo turno successivo il bersaglio non può effettuare Reazioni, ha la velocità dimezzata e durante il proprio turno può compiere un\'Azione oppure un\'Azione Bonus, ma non entrambe.' },
        { name: 'Incantesimi', desc: 'Il drago lancia uno dei seguenti incantesimi senza componenti materiali, usando Carisma come caratteristica da incantatore (CD 21).\n\nA volontà: Individuazione del Magico, Aculeo Mentale (versione di 5° livello), Illusione Minore, Trasformazione (solo forma di Bestia o Umanoide; nessun PF temporaneo e nessuna concentrazione richiesta).\n\n1/Giorno ciascuno: Ristorare Superiore, Immagine Maggiore, Immagine Proiettata.' }
      ],
      bonusActions: [],
      reactions: [],
      legendaryActions: [
        { name: 'Usi (3 per round, 4 nella Tana)', desc: 'Il drago può usare una sola azione leggendaria alla volta, alla fine del turno di un\'altra creatura. Recupera gli utilizzi spesi all\'inizio del proprio turno.' },
        { name: 'Magia Esilarante', desc: 'Tiro Salvezza su Carisma: CD 21, una creatura che il drago può vedere entro 36 metri.\nFallimento: 31 (9d6) danni psichici e, fino alla fine del suo turno successivo, ogni volta che il bersaglio effettua una prova di caratteristica o un tiro per colpire tira anche 1d8 e ne sottrae il risultato.\nIl drago non può usare di nuovo questa azione fino all\'inizio del suo turno successivo.', atkDmgs: [{ f: '9d6', t: 'psichici' }] },
        { name: 'Scossa Mentale', desc: 'Il drago usa Incantesimi per lanciare Aculeo Mentale (versione di 5° livello). Non può usare di nuovo questa azione fino all\'inizio del suo turno successivo.' },
        { name: 'Balzo', desc: 'Il drago si muove fino a metà della propria velocità ed effettua un attacco con Artiglio.', atkHit: '+15', atkDmgs: [{ f: '2d10+8', t: 'taglienti' }, { f: '2d8', t: 'acido' }] }
      ],
      drop: [{ name: 'Arcani', desc: 'Doni e ricordi cari al drago, più reliquie magiche accumulate nei secoli nelle sue accoglienti tane.' }],
      notes: 'Draghi della Curiosità e della Comunità\n\nHabitat: Colline\nTesoro: Arcani\n\nI draghi di rame antichi usano calore umano e affidabilità per influenzare il mondo nel corso del tempo. Aprono le loro accoglienti tane agli amici come rifugi di apprendimento e risate per i giovani e per chi è nel bisogno. Vigilano contro le minacce future e vi si oppongono, mentre favoriscono santuari di semplice bontà.\n\n' + DRAGHI_RAME_LORE + '\n\n' + DRAGHI_RAME_TANA + '\n\n(Affrontato nella propria tana, il drago vale 41.000 PE.)'
    },
    {
      id: 'preset_couatl', name: 'Couatl', emoji: '🌈', rarity: 'rare',
      type: 'Celestiale', size: 'Media', alignment: 'Legale Buono',
      ac: 19, hp: 60, hpCur: 60, hpTemp: 0, hpDice: '8d8+24', init: 5,
      speed: '9 m, Volare 27 m', cr: '4', xp: '',
      str: 16, dex: 20, con: 17, intl: 18, wis: 20, cha: 18,
      savesOverride: { str: '', dex: '', con: '5', intl: '', wis: '7', cha: '' },
      skillOverrides: {}, passivePerception: 15,
      senses: [{ type: 'Vista del Vero', value: 36, unit: 'm' }], languages: ['Tutte le lingue', 'Telepatia 36 m'],
      dmgResist: ['Contundente', 'Perforante', 'Tagliente'], dmgImmune: ['Psichico', 'Radioso'], dmgVulner: [],
      condImmune: [],
      traits: [
        { name: 'Mente Protetta', desc: 'I pensieri del couatl non possono essere letti con alcun mezzo e le altre creature possono comunicare telepaticamente con lui solo se il couatl lo consente.' }
      ],
      actions: [
        { name: 'Morso', desc: 'Attacco con arma da mischia: +7 a colpire, portata 1,5 metri.\nColpito: 11 (1d12 + 5) danni perforanti e il bersaglio ottiene la condizione Avvelenato fino alla fine del turno successivo del couatl.', atkHit: '+7', atkDmgs: [{ f: '1d12+5', t: 'perforanti' }] },
        { name: 'Costrizione', desc: 'Tiro Salvezza su Forza: CD 15, una creatura Media o più piccola che il couatl può vedere entro 1,5 metri.\nFallimento: 8 (1d6 + 5) danni contundenti; il bersaglio ottiene la condizione Afferrato (CD 13 per sfuggire) e la condizione Trattenuto finché la presa non termina.', atkDmgs: [{ f: '1d6+5', t: 'contundenti' }] },
        { name: 'Incantesimi', desc: 'Il couatl lancia uno dei seguenti incantesimi senza componenti materiali, usando la Saggezza come caratteristica da incantatore (CD 15).\n\nA volontà: Individuazione del Bene e del Male, Individuazione del Magico, Individuazione dei Pensieri, Trasformazione (solo forma di Bestia o Umanoide; nessun PF temporaneo e nessuna concentrazione richiesta).\n\n1/Giorno ciascuno: Creare Cibo e Acqua, Sogno, Ristorare Superiore, Scrutare, Sonno.' }
      ],
      bonusActions: [
        { name: 'Aiuto Divino (2/Giorno)', desc: 'Il couatl lancia Benedizione, Ristorare Inferiore oppure Santuario, senza componenti materiali e usando la stessa caratteristica da incantatore degli Incantesimi.' }
      ],
      reactions: [], legendaryActions: [],
      drop: [{ name: 'Reliquie', desc: 'Segreti divini, profezie e reliquie sacre custodite dal couatl, forse perfino il suo meraviglioso uovo dai colori dell\'arcobaleno.' }],
      notes: 'Manifestazione Guardiana del Divino\n\nHabitat: Deserto, Foresta, Prateria, Urbano\nTesoro: Reliquie\n\nIncarnazioni della profezia e custodi dei segreti divini, i couatl fanno sì che il destino si svolga come dovrebbe. Assomigliano a serpenti con ali dai colori dell\'arcobaleno, e ciascuno è la manifestazione di un decreto divino, di una verità o di un fato che una giusta divinità vuole resti immutabile per sempre. La maggior parte dei couatl appare in luoghi di antico potere, dove protegge magie nascoste o garantisce che eventi profetizzati avvengano — o non avvengano. Più raramente vigilano su comunità o percorrono il mondo sotto mentite spoglie, interpretando presagi o manipolando gli eventi affinché il destino segua il corso appropriato.\n\nMotivati da mandati eterni, i couatl talvolta si comportano in modi imperscrutabili o apparentemente ostili. Sono inflessibili e intransigenti, poiché la loro esistenza è legata in modo fondamentale alle direttive divine, ma arrecano danno alle altre creature soltanto quando è assolutamente necessario per raggiungere obiettivi divini.\n\nOgni couatl attraversa un periodo di rinnovamento al termine di un\'era: quando l\'era volge alla fine, depone un meraviglioso uovo dai colori dell\'arcobaleno e poi muore. Per un certo periodo il suo compito rimane senza custode; trascorso questo tempo, dallo stesso uovo si schiude il medesimo couatl, completamente cresciuto e rinnovato per servire per un\'altra era.'
    },
    {
      id: 'preset_mano_strisciante', name: 'Mano Strisciante', emoji: '🖐️', rarity: 'common',
      type: 'Non Morto', size: 'Minuscola', alignment: 'Neutrale Malvagio',
      ac: 12, hp: 2, hpCur: 2, hpTemp: 0, hpDice: '1d4', init: 2,
      speed: '6 m, Scalare 6 m', cr: '0', xp: '',
      str: 13, dex: 14, con: 11, intl: 5, wis: 10, cha: 4,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: {}, passivePerception: 10,
      senses: [{ type: 'Vista Cieca', value: 9, unit: 'm' }], languages: ['Comprende il Comune ma non può parlare'],
      dmgResist: [], dmgImmune: ['Necrotico', 'Veleno'], dmgVulner: [],
      condImmune: ['Ammaliato', 'Esausto', 'Spaventato', 'Incapacitato', 'Avvelenato'],
      traits: [],
      actions: [
        { name: 'Schianto', desc: 'Attacco con arma da mischia: +3 a colpire, portata 1,5 metri.\nColpito: 2 danni necrotici.', atkHit: '+3', atkDmgs: [{ f: '2', t: 'necrotici' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [],
      notes: 'Appendici Recise Animate da una Volontà Maligna\n\nHabitat: Qualsiasi\nTesoro: Nessuno\n\nLe mani striscianti solitarie possono continuare le serie di omicidi che perpetravano in vita. Alcune attaccano sconsideratamente i viventi, mentre altre perseguitano vittime specifiche. In rari casi una mano semina il caos mentre il resto del suo corpo è ancora vivo, e la creatura originaria potrebbe essere del tutto ignara dei crimini commessi dalla propria mano recisa.\n\n' + MANI_STRISCIANTI_LORE
    },
    {
      id: 'preset_sciame_mani_striscianti', name: 'Sciame di Mani Striscianti', emoji: '🖐️', rarity: 'common',
      type: 'Non Morto', size: 'Media', alignment: 'Neutrale Malvagio',
      ac: 12, hp: 49, hpCur: 49, hpTemp: 0, hpDice: '11d8', init: 2,
      speed: '9 m, Scalare 9 m', cr: '3', xp: '',
      str: 14, dex: 14, con: 11, intl: 5, wis: 10, cha: 4,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: {}, passivePerception: 10,
      senses: [{ type: 'Vista Cieca', value: 9, unit: 'm' }], languages: ['Comprende il Comune ma non può parlare'],
      dmgResist: ['Contundente', 'Perforante', 'Tagliente'], dmgImmune: ['Necrotico', 'Veleno'], dmgVulner: [],
      condImmune: ['Ammaliato', 'Esausto', 'Spaventato', 'Afferrato', 'Incapacitato', 'Paralizzato', 'Pietrificato', 'Avvelenato', 'Prono', 'Trattenuto', 'Stordito'],
      traits: [
        { name: 'Sciame', desc: 'Lo sciame può occupare lo spazio di un\'altra creatura e viceversa, e può muoversi attraverso qualsiasi apertura abbastanza grande da lasciar passare una creatura Minuscola. Lo sciame non può recuperare punti ferita né ottenere punti ferita temporanei.' }
      ],
      actions: [
        { name: 'Sciame di Mani Afferranti', desc: 'Attacco con arma da mischia: +4 a colpire, portata 1,5 metri.\nColpito: 20 (4d8 + 2) danni necrotici, oppure 11 (2d8 + 2) danni necrotici se lo sciame è Ferito (Bloodied). Se il bersaglio è una creatura Media o più piccola, ottiene la condizione Prono.', atkHit: '+4', atkDmgs: [{ f: '4d8+2', t: 'necrotici' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [],
      notes: 'Appendici Recise Animate da una Volontà Maligna\n\nHabitat: Qualsiasi\nTesoro: Nessuno\n\nGli sciami di mani striscianti vengono tipicamente animati da necromanti depravati. Talvolta questi sciami grotteschi sorgono da fosse comuni o in seguito a tragedie, rifiutandosi di lasciar sfuggire i loro assassini dalla propria presa.\n\n' + MANI_STRISCIANTI_LORE
    },
    {
      id: 'preset_cultista', name: 'Cultista', emoji: '🕯️', rarity: 'common',
      type: 'Umanoide', size: 'Media', alignment: 'Neutrale',
      ac: 12, hp: 9, hpCur: 9, hpTemp: 0, hpDice: '2d8', init: 1,
      speed: '9 m', cr: '1/8', xp: '',
      str: 11, dex: 12, con: 10, intl: 10, wis: 11, cha: 10,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { inganno: '2', religione: '2' }, passivePerception: 10,
      senses: [], languages: ['Comune'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Falcetto Rituale', desc: 'Attacco con arma da mischia: +3 a colpire, portata 1,5 metri.\nColpito: 3 (1d4 + 1) danni taglienti più 1 danno necrotico.', atkHit: '+3', atkDmgs: [{ f: '1d4+1', t: 'taglienti' }, { f: '1', t: 'necrotici' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [{ name: 'Equipaggiamento', desc: 'Armatura di cuoio, falcetto rituale e simboli del culto.' }],
      notes: 'Profeti di Sventura e Fanatici\n\nHabitat: Qualsiasi\nTesoro: Individuale, Reliquie\n\nI cultisti si consacrano ai capi della loro fede e ai loro padroni ultraterreni. Questo zelo non concede loro poteri magici, ma dona una notevole determinazione di fronte alle minacce. Svolgono gran parte del lavoro ordinario del culto: evangelizzazione, attività criminali o il ruolo di sacrifici.\n\n' + CULTISTI_LORE
    },
    {
      id: 'preset_fanatico_culto', name: 'Fanatico del Culto', emoji: '📿', rarity: 'common',
      type: 'Umanoide', size: 'Media', alignment: 'Neutrale',
      ac: 13, hp: 44, hpCur: 44, hpTemp: 0, hpDice: '8d8+8', init: 2,
      speed: '9 m', cr: '2', xp: '',
      str: 11, dex: 14, con: 12, intl: 10, wis: 14, cha: 13,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { inganno: '3', persuasione: '3', religione: '2' }, passivePerception: 12,
      senses: [], languages: ['Comune'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Lama del Patto', desc: 'Attacco con arma da mischia: +4 a colpire, portata 1,5 metri.\nColpito: 6 (1d8 + 2) danni taglienti più 7 (2d6) danni necrotici.', atkHit: '+4', atkDmgs: [{ f: '1d8+2', t: 'taglienti' }, { f: '2d6', t: 'necrotici' }] },
        { name: 'Incantesimi', desc: 'Il cultista lancia uno dei seguenti incantesimi usando la Saggezza come caratteristica da incantatore (CD 12, +4 a colpire con gli incantesimi).\n\nA volontà: Luce, Taumaturgia.\n\n2/Giorno: Comando.\n\n1/Giorno: Blocca Persone.' }
      ],
      bonusActions: [
        { name: 'Arma Spirituale (2/Giorno)', desc: 'Il cultista lancia Arma Spirituale, usando la stessa caratteristica da incantatore degli Incantesimi.' }
      ],
      reactions: [], legendaryActions: [],
      drop: [{ name: 'Reliquie', desc: 'Simbolo sacro, armatura di cuoio e reliquie del culto.' }],
      notes: 'Profeti di Sventura e Fanatici\n\nHabitat: Qualsiasi\nTesoro: Individuale, Reliquie\n\nI fanatici guidano piccoli culti o cellule all\'interno di culti più grandi. Conoscono più misteri del culto rispetto ai membri di rango inferiore, e ciò concede loro accesso ai poteri magici dei loro patroni.\n\n' + CULTISTI_LORE
    },
    {
      id: 'preset_ierofante_culto', name: 'Ierofante del Culto', emoji: '✨', rarity: 'rare',
      type: 'Umanoide', size: 'Media', alignment: 'Neutrale',
      ac: 16, hp: 144, hpCur: 144, hpTemp: 0, hpDice: '17d8+68', init: 8,
      speed: '9 m', cr: '10', xp: '',
      str: 20, dex: 18, con: 18, intl: 13, wis: 17, cha: 20,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { percezione: '7', persuasione: '9', religione: '5' }, passivePerception: 17,
      senses: [], languages: ['Celestiale', 'Comune'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Multiattacco', desc: 'Lo ierofante effettua tre attacchi usando Lama del Patto o Raggio Radioso in qualsiasi combinazione.' },
        { name: 'Lama del Patto', desc: 'Attacco con arma da mischia: +9 a colpire, portata 1,5 metri.\nColpito: 12 (2d6 + 5) danni taglienti più 18 (4d8) danni radiosi.', atkHit: '+9', atkDmgs: [{ f: '2d6+5', t: 'taglienti' }, { f: '4d8', t: 'radiosi' }] },
        { name: 'Raggio Radioso', desc: 'Attacco con arma a distanza: +9 a colpire, gittata 36 metri.\nColpito: 31 (4d12 + 5) danni radiosi.', atkHit: '+9', atkDmgs: [{ f: '4d12+5', t: 'radiosi' }] },
        { name: 'Incantesimi', desc: 'Il cultista lancia uno dei seguenti incantesimi usando Carisma come caratteristica da incantatore (CD 17).\n\nA volontà: Armatura Magica (già inclusa nella CA), Taumaturgia.\n\n1/Giorno ciascuno: Tempesta di Radiosità di Jallarzi (versione di 7° livello), Suggestione di Massa.' }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [{ name: 'Reliquie', desc: 'Corazza, simbolo sacro, strane reliquie e i segreti più profondi del culto.' }],
      notes: 'Profeti di Sventura e Fanatici\n\nHabitat: Qualsiasi\nTesoro: Individuale, Reliquie\n\nGli ierofanti sono leader che supervisionano la vita dei loro seguaci, dettano gli editti del culto e interpretano la volontà del loro patrono. Possiedono poteri soprannaturali e conoscono i segreti più profondi del culto, controllando spesso strane reliquie, siti mistici e servitori mostruosi.\n\n' + CULTISTI_LORE
    },
    {
      id: 'preset_cultista_aberrante', name: 'Cultista Aberrante', emoji: '🐙', rarity: 'uncommon',
      type: 'Umanoide', size: 'Media', alignment: 'Neutrale Malvagio',
      ac: 14, hp: 137, hpCur: 137, hpTemp: 0, hpDice: '25d8+25', init: 7,
      speed: '9 m', cr: '8', xp: '',
      str: 11, dex: 18, con: 12, intl: 16, wis: 18, cha: 12,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { arcano: '6', percezione: '7', religione: '6' }, passivePerception: 17,
      senses: [{ type: 'Scurovisione', value: 27, unit: 'm' }], languages: ['Comune', 'Linguaggio Profondo', 'Telepatia 9 m'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Multiattacco', desc: 'Il cultista effettua due attacchi con Frustata Tentacolare. Può sostituire uno qualsiasi degli attacchi con Marciume Mentale.' },
        { name: 'Frustata Tentacolare', desc: 'Attacco con arma da mischia: +7 a colpire, portata 3 metri.\nColpito: 7 (1d6 + 4) danni taglienti più 14 (4d6) danni psichici. Se il bersaglio è una creatura Grande o più piccola, ottiene la condizione Afferrato (CD 14 per sfuggire) da uno dei due tentacoli e la condizione Trattenuto finché la presa non termina.', atkHit: '+7', atkDmgs: [{ f: '1d6+4', t: 'taglienti' }, { f: '4d6', t: 'psichici' }] },
        { name: 'Marciume Mentale', desc: 'Tiro Salvezza su Saggezza: CD 15, una creatura che il cultista può vedere entro 27 metri.\nFallimento: 27 (6d8) danni psichici e il bersaglio ottiene la condizione Avvelenato fino all\'inizio del turno successivo del cultista. Successo: metà danni.', atkDmgs: [{ f: '6d8', t: 'psichici' }] },
        { name: 'Incantesimi', desc: 'Il cultista lancia uno dei seguenti incantesimi usando la Saggezza come caratteristica da incantatore (CD 15).\n\nA volontà: Individuazione dei Pensieri, Illusione Minore.' }
      ],
      bonusActions: [],
      reactions: [
        { name: 'Controincantesimo (2/Giorno)', desc: 'Il cultista lancia Controincantesimo in risposta al suo innesco.' }
      ],
      legendaryActions: [],
      drop: [{ name: 'Reliquie', desc: 'Reliquie aliene e frammenti di sapere proibito del Reame Remoto.' }],
      notes: 'Profeti di Sventura e Fanatici\n\nHabitat: Qualsiasi\nTesoro: Individuale, Reliquie\n\nI cultisti aberranti perseguono poteri capaci di piegare la mente provenienti da forze aliene. Si alleano con mostri come aboleth e mind flayer o con entità del Reame Remoto: Cthulhu, Hadar, Nyarlathotep, maliziosi corpi celesti o altre menti incomprensibili.\n\n' + CULTISTI_LORE
    },
    {
      id: 'preset_cultista_morte', name: 'Cultista della Morte', emoji: '⚰️', rarity: 'uncommon',
      type: 'Umanoide', size: 'Media', alignment: 'Neutrale Malvagio',
      ac: 17, hp: 127, hpCur: 127, hpTemp: 0, hpDice: '15d8+60', init: 4,
      speed: '9 m', cr: '8', xp: '',
      str: 18, dex: 14, con: 18, intl: 13, wis: 17, cha: 12,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { intuizione: '6', percezione: '6', religione: '4' }, passivePerception: 16,
      senses: [], languages: ['Comune'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Multiattacco', desc: 'Il cultista effettua tre attacchi usando Falce Funesta o Raggio Mortale in qualsiasi combinazione.' },
        { name: 'Falce Funesta', desc: 'Attacco con arma da mischia: +7 a colpire, portata 3 metri.\nColpito: 9 (1d10 + 4) danni taglienti più 11 (2d10) danni necrotici. Il bersaglio non può recuperare punti ferita fino alla fine del suo turno successivo.', atkHit: '+7', atkDmgs: [{ f: '1d10+4', t: 'taglienti' }, { f: '2d10', t: 'necrotici' }] },
        { name: 'Raggio Mortale', desc: 'Attacco con arma a distanza: +6 a colpire, gittata 36 metri.\nColpito: 22 (4d10) danni necrotici.', atkHit: '+6', atkDmgs: [{ f: '4d10', t: 'necrotici' }] },
        { name: 'Incantesimi', desc: 'Il cultista lancia uno dei seguenti incantesimi usando la Saggezza come caratteristica da incantatore (CD 14).\n\nA volontà: Parlare con i Morti, Taumaturgia.' }
      ],
      bonusActions: [
        { name: 'Lamento Spirituale (Ricarica 5-6)', desc: 'Tiro Salvezza su Saggezza: CD 14, ogni creatura in un\'emanazione di 6 metri originata dal cultista.\nFallimento: 14 (4d6) danni psichici e condizione Spaventato fino alla fine del turno successivo. Successo: metà danni.', atkDmgs: [{ f: '4d6', t: 'psichici' }] }
      ],
      reactions: [], legendaryActions: [],
      drop: [{ name: 'Reliquie', desc: 'Armatura a strisce e reliquie funeste legate alla non morte.' }],
      notes: 'Profeti di Sventura e Fanatici\n\nHabitat: Qualsiasi\nTesoro: Individuale, Reliquie\n\nI cultisti della morte si crogiolano in forze nichiliste, abbracciandole come vie verso la non morte, la purezza multiversale o l\'inevitabilità entropica. Servono potenti non morti, profezie apocalittiche o immortali che dominano la morte: Acererak, Kyuss, Orcus, Vecna o Wee Jas.\n\n' + CULTISTI_LORE
    },
    {
      id: 'preset_cultista_elementale', name: 'Cultista Elementale', emoji: '🔥', rarity: 'uncommon',
      type: 'Umanoide', size: 'Media', alignment: 'Caotico Malvagio',
      ac: 16, hp: 135, hpCur: 135, hpTemp: 0, hpDice: '18d8+54', init: 4,
      speed: '9 m', cr: '8', xp: '',
      str: 18, dex: 18, con: 16, intl: 14, wis: 18, cha: 12,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { arcano: '5', percezione: '7', religione: '5' }, passivePerception: 17,
      senses: [], languages: ['Comune', 'Primordiale'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Multiattacco', desc: 'Il cultista effettua tre attacchi usando Flagello Elementale o Artiglio Elementale in qualsiasi combinazione.' },
        { name: 'Flagello Elementale', desc: 'Attacco con arma da mischia: +7 a colpire, portata 1,5 metri.\nColpito: 25 (6d6 + 4) danni di un tipo a scelta del cultista tra acido, freddo, fuoco, fulmine o tuono.', atkHit: '+7', atkDmgs: [{ f: '6d6+4', t: 'fuoco' }] },
        { name: 'Artiglio Elementale', desc: 'Attacco con arma a distanza: +7 a colpire, gittata 36 metri.\nColpito: 22 (4d10) danni di un tipo a scelta del cultista tra acido, freddo, fuoco, fulmine o tuono. Se il bersaglio è Medio o più piccolo, il cultista lo sposta fino a 3 metri in linea retta verso di sé o lontano da sé.', atkHit: '+7', atkDmgs: [{ f: '4d10', t: 'fuoco' }] },
        { name: 'Incantesimi', desc: 'Il cultista lancia uno dei seguenti incantesimi usando la Saggezza come caratteristica da incantatore (CD 15).\n\nA volontà: Elementalismo, Mano Magica.' }
      ],
      bonusActions: [],
      reactions: [
        { name: 'Assorbimento Elementale (1/Giorno)', desc: 'Innesco: il cultista subisce danni da acido, freddo, fuoco, fulmine o tuono.\nRisposta: il cultista ottiene Resistenza a quella specifica istanza di danno e guadagna 10 punti ferita temporanei.' }
      ],
      legendaryActions: [],
      drop: [{ name: 'Reliquie', desc: 'Cotta di maglia e reliquie del Male Elementale.' }],
      notes: 'Profeti di Sventura e Fanatici\n\nHabitat: Qualsiasi\nTesoro: Individuale, Reliquie\n\nI cultisti elementali sfruttano forze naturali distruttive per purificare il mondo dalla civiltà o dimostrare il dominio di un elemento sugli altri. Sono alleati di mostri elementali o di immortali malvagi come i Principi del Male Elementale o l\'Occhio Elementale Anziano.\n\n' + CULTISTI_LORE
    },
    {
      id: 'preset_cultista_immondo', name: 'Cultista Immondo', emoji: '😈', rarity: 'uncommon',
      type: 'Umanoide', size: 'Media', alignment: 'Neutrale Malvagio',
      ac: 16, hp: 127, hpCur: 127, hpTemp: 0, hpDice: '17d8+51', init: 5,
      speed: '9 m', cr: '8', xp: '',
      str: 18, dex: 14, con: 16, intl: 13, wis: 18, cha: 12,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { percezione: '7', religione: '4' }, passivePerception: 17,
      senses: [{ type: 'Vista del Diavolo', value: 27, unit: 'm' }], languages: ['Abissale', 'Comune', 'Infernale'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Multiattacco', desc: 'Il cultista effettua tre attacchi con Ascia del Patto.' },
        { name: 'Ascia del Patto', desc: 'Attacco con arma da mischia: +7 a colpire, portata 1,5 metri.\nColpito: 10 (1d12 + 4) danni taglienti più 13 (3d8) danni da fuoco.', atkHit: '+7', atkDmgs: [{ f: '1d12+4', t: 'taglienti' }, { f: '3d8', t: 'fuoco' }] },
        { name: 'Incantesimi', desc: 'Il cultista lancia uno dei seguenti incantesimi usando la Saggezza come caratteristica da incantatore (CD 15, +7 a colpire con gli incantesimi).\n\nA volontà: Raggio Rovente (versione di 5° livello), Taumaturgia.\n\n2/Giorno: Palla di Fuoco (versione di 6° livello).' }
      ],
      bonusActions: [],
      reactions: [
        { name: 'Intimorire Infernale', desc: 'Il cultista lancia Intimorire Infernale in risposta al suo innesco, usando la stessa caratteristica da incantatore degli Incantesimi.' }
      ],
      legendaryActions: [],
      drop: [{ name: 'Reliquie', desc: 'Corazza e reliquie infernali legate al patrono immondo.' }],
      notes: 'Profeti di Sventura e Fanatici\n\nHabitat: Qualsiasi\nTesoro: Individuale, Reliquie\n\nI cultisti immondi venerano immondi o divinità malvagie. Spesso lavorano per portare rovina agli innocenti o evocare nel mondo il loro sinistro patrono. Possono servire potenze famigerate come arcidiavoli e signori dei demoni, oppure immortali corrotti quali Demogorgon, Pazuzu, Iuz, Zariel o Zuggtmoy.\n\n' + CULTISTI_LORE
    },
    {
      id: 'preset_sentinella_ciclope', name: 'Sentinella Ciclope', emoji: '🧿', rarity: 'uncommon',
      type: 'Gigante', size: 'Enorme', alignment: 'Caotico Neutrale',
      ac: 14, hp: 138, hpCur: 138, hpTemp: 0, hpDice: '12d12+60', init: 0,
      speed: '12 m', cr: '6', xp: '',
      str: 22, dex: 11, con: 20, intl: 8, wis: 6, cha: 10,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: {}, passivePerception: 8,
      senses: [], languages: ['Gigante'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Multiattacco', desc: 'Il ciclope effettua due attacchi, usando Grande Clava o Roccia in qualsiasi combinazione.' },
        { name: 'Grande Clava', desc: 'Attacco con arma da mischia: +9 a colpire, portata 3 metri.\nColpito: 16 (3d6 + 6) danni contundenti. Se il bersaglio è una creatura di taglia Enorme o inferiore, ottiene la condizione Prono.', atkHit: '+9', atkDmgs: [{ f: '3d6+6', t: 'contundenti' }] },
        { name: 'Roccia', desc: 'Attacco con arma a distanza: +9 a colpire, gittata 9/36 metri.\nColpito: 22 (3d10 + 6) danni contundenti.', atkHit: '+9', atkDmgs: [{ f: '3d10+6', t: 'contundenti' }] }
      ],
      bonusActions: [],
      reactions: [
        { name: 'Precognizione Limitata (Ricarica 6)', desc: 'Innesco: una creatura che il ciclope può vedere effettua un tiro per colpire contro di lui.\nRisposta: il ciclope impone Svantaggio a quel tiro e ottiene Vantaggio ai tiri per colpire contro quel bersaglio fino alla fine del proprio turno successivo.' }
      ],
      legendaryActions: [],
      drop: [{ name: 'Armamenti', desc: 'La grande clava e i massi della sentinella, più armamenti a misura di gigante.' }],
      notes: 'Servitori Monocoli del Destino\n\nHabitat: Costa, Deserto, Prateria, Colline, Montagne, Sottosuolo\nTesoro: Armamenti\n\nLa maggior parte delle sentinelle ciclopi serve i propri progenitori divini e si oppone a chiunque tenti di alterare il destino.\n\n' + CICLOPI_LORE
    },
    {
      id: 'preset_oracolo_ciclope', name: 'Oracolo Ciclope', emoji: '🔮', rarity: 'rare',
      type: 'Gigante', size: 'Enorme', alignment: 'Caotico Neutrale',
      ac: 16, hp: 207, hpCur: 207, hpTemp: 0, hpDice: '18d12+90', init: 8,
      speed: '12 m', cr: '10', xp: '',
      str: 22, dex: 11, con: 20, intl: 16, wis: 18, cha: 10,
      savesOverride: { str: '', dex: '', con: '9', intl: '', wis: '8', cha: '' },
      skillOverrides: { storia: '11', percezione: '12' }, passivePerception: 22,
      senses: [{ type: 'Vista del Vero', value: 9, unit: 'm' }], languages: ['Gigante'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Multiattacco', desc: 'L\'oracolo ciclope effettua tre attacchi, usando Colpo Radioso o Lampo di Luce in qualsiasi combinazione.' },
        { name: 'Colpo Radioso', desc: 'Attacco con arma da mischia: +10 a colpire, portata 3 metri.\nColpito: 22 (3d10 + 6) danni radiosi.', atkHit: '+10', atkDmgs: [{ f: '3d10+6', t: 'radiosi' }] },
        { name: 'Lampo di Luce', desc: 'Attacco con arma a distanza: +10 a colpire, gittata 36 metri.\nColpito: 17 (2d10 + 6) danni radiosi e il bersaglio ha Svantaggio ai tiri per colpire fino alla fine del turno successivo del ciclope.', atkHit: '+10', atkDmgs: [{ f: '2d10+6', t: 'radiosi' }] },
        { name: 'Incantesimi', desc: 'Il ciclope lancia uno dei seguenti incantesimi senza componenti materiali, usando la Saggezza come caratteristica da incantatore (CD 16).\n\n2/Giorno ciascuno: Occhio Arcano, Individuazione del Magico, Localizza Oggetto.\n\n1/Giorno: Conoscenza delle Leggende.' }
      ],
      bonusActions: [],
      reactions: [
        { name: 'Presagio (Ricarica 4-6)', desc: 'Innesco: il ciclope o un alleato che può vedere effettua un Test d20.\nRisposta: il ciclope tira 1d20 e sceglie se utilizzare quel risultato al posto del d20 originale.' }
      ],
      legendaryActions: [],
      drop: [{ name: 'Armamenti', desc: 'Armi e armamenti a misura di gigante dell\'oracolo, oltre a segreti e profezie raccolti nel tempo.' }],
      notes: 'Servitori Monocoli del Destino\n\nHabitat: Costa, Deserto, Prateria, Colline, Montagne, Sottosuolo\nTesoro: Armamenti\n\nGli oracoli ciclopi scrutano attraverso la storia per apprendere verità nascoste. Molti condividono questi segreti con coloro che li aiutano a correggere gli errori del passato.\n\n' + CICLOPI_LORE
    },
    {
      id: 'preset_dao', name: 'Dao', emoji: '🧞', rarity: 'epic',
      type: 'Elementale', size: 'Grande', alignment: 'Neutrale',
      ac: 18, hp: 200, hpCur: 200, hpTemp: 0, hpDice: '16d10+112', init: 1,
      speed: '9 m, Scavare 9 m, Volare 9 m (fluttuare)', cr: '11', xp: '',
      str: 23, dex: 12, con: 24, intl: 12, wis: 13, cha: 18,
      savesOverride: { str: '', dex: '5', con: '', intl: '', wis: '5', cha: '' },
      skillOverrides: {}, passivePerception: 11,
      senses: [{ type: 'Scurovisione', value: 36, unit: 'm' }], languages: ['Primordiale (Terran)'],
      dmgResist: [], dmgImmune: [], dmgVulner: [],
      condImmune: ['Pietrificato'],
      traits: [
        { name: 'Attraversare la Terra', desc: 'Il dao può scavare attraverso terra e pietra non magiche e non lavorate. Mentre lo fa, non disturba il materiale attraverso cui si muove.' },
        { name: 'Restaurazione Elementale', desc: 'Se il dao muore al di fuori del Piano Elementale della Terra, il suo corpo si dissolve in terra e ottiene un nuovo corpo in 1d4 giorni, tornando in vita con tutti i suoi punti ferita da qualche parte sul Piano della Terra.' },
        { name: 'Resistenza Magica', desc: 'Il dao ha vantaggio ai tiri salvezza contro incantesimi e altri effetti magici.' },
        { name: 'Desideri', desc: 'Il dao ha una probabilità del 30% di conoscere l\'incantesimo Desiderio. Se lo conosce, può lanciarlo soltanto per conto di una creatura non genio che esprima un desiderio in modo a lui comprensibile, senza subire lo stress dell\'incantesimo. Dopo averlo lanciato tre volte, non può più farlo per 365 giorni.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il dao effettua tre attacchi con Maglio di Terra oppure due attacchi con Esplosione Terrestre.' },
        { name: 'Maglio di Terra', desc: 'Attacco con arma da mischia: +10 a colpire, portata 1,5 metri.\nColpito: 20 (4d6 + 6) danni contundenti. Se il bersaglio è una creatura di taglia Grande o inferiore, ottiene la condizione Prono.', atkHit: '+10', atkDmgs: [{ f: '4d6+6', t: 'contundenti' }] },
        { name: 'Esplosione Terrestre', desc: 'Attacco con arma a distanza: +10 a colpire, gittata 36 metri.\nColpito: 15 (2d8 + 6) danni contundenti.\nColpito o Mancato: la terra esplode dallo spazio del bersaglio. Tiro Salvezza su Destrezza: CD 16, ogni creatura in un\'emanazione di 3 metri che parte dal bersaglio (incluso il bersaglio).\nFallimento: 10 (3d6) danni da tuono.', atkHit: '+10', atkDmgs: [{ f: '2d8+6', t: 'contundenti' }, { f: '3d6', t: 'tuono' }] },
        { name: 'Incantesimi', desc: 'Il dao lancia uno dei seguenti incantesimi senza componenti materiali, usando il Carisma come caratteristica da incantatore (CD 16).\n\nA volontà: Individuazione del Bene e del Male, Individuazione del Magico, Scolpire Pietra.\n\n1/Giorno ciascuno: Forma Gassosa, Invisibilità, Muovere il Terreno, Passapareti, Spostamento Planare, Linguaggi, Muro di Pietra.' }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [{ name: 'Strumenti', desc: 'Tesori della terra: gemme grezze, gioielli forgiati da metalli puri e meravigliosi fossili.' }],
      notes: 'Genio della Terra\n\nHabitat: Piano Elementale della Terra, Sottosuolo\nTesoro: Strumenti\n\nI dao, geni dei minerali e delle gemme, incarnano la risolutezza della roccia. Grazie alla loro magia innata si muovono attraverso la terra senza ostacoli, esplorando profondità inaccessibili ai più. Si compiacciono dei tesori della terra — gemme grezze, gioielli di metalli puri o meravigliosi fossili — e in cambio possono rivelare misteri sotterranei: passaggi attraverso il Sottosuolo, rovine sepolte o interi regni nascosti.\n\nMolti dao chiamano casa il Piano Elementale della Terra, dove costruiscono città che scintillano di tesori. Tra questi reami si trova la vasta distesa labirintica nota come il Grande Scavo Abissale (Great Dismal Delve) o Settevolte Labirinto, che protegge la Città delle Gemme, il Crogiolo di Ferro e lo Stretto dei Magneti.\n\n— Gundren Rockseeker, cacciatore di tesori nano —\n«Sul Piano Elementale della Terra, galassie di gemme brillano sopra volte piene di tesori. Se i dao si trovano laggiù, allora c\'è ricchezza degna di essere cercata.»'
    },
    {
      id: 'preset_manto_oscuro', name: 'Manto Oscuro', emoji: '🦇', rarity: 'common',
      type: 'Aberrazione', size: 'Piccola', alignment: 'Senza Allineamento',
      ac: 11, hp: 22, hpCur: 22, hpTemp: 0, hpDice: '5d6+5', init: 3,
      speed: '3 m, Volare 9 m', cr: '1/2', xp: '',
      str: 16, dex: 12, con: 13, intl: 2, wis: 10, cha: 5,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { furtivita: '3' }, passivePerception: 10,
      senses: [{ type: 'Vista Cieca', value: 18, unit: 'm' }], languages: [],
      dmgResist: [], dmgImmune: [], dmgVulner: [],
      condImmune: [],
      traits: [],
      actions: [
        { name: 'Schiacciare', desc: 'Attacco con arma da mischia: +5 a colpire, portata 1,5 metri.\nColpito: 6 (1d6 + 3) danni contundenti e il manto oscuro si attacca al bersaglio.\nSe il bersaglio è una creatura Media o più piccola e il manto oscuro aveva vantaggio al tiro per colpire, esso ricopre il bersaglio, che ottiene la condizione Accecato e sta soffocando finché il manto oscuro rimane attaccato in questo modo.\nMentre è attaccato a un bersaglio, il manto oscuro può attaccare soltanto quel bersaglio ma ha vantaggio ai tiri per colpire. La sua Velocità diventa 0, non può beneficiare di alcun bonus alla Velocità e si muove insieme al bersaglio.\nUna creatura può usare un\'Azione per tentare di staccare il manto oscuro da sé, riuscendoci con una prova di Forza (Atletica) CD 13 superata. Nel proprio turno, il manto oscuro può staccarsi usando 1,5 metri del proprio movimento.', atkHit: '+5', atkDmgs: [{ f: '1d6+3', t: 'contundenti' }] },
        { name: 'Aura di Oscurità (1/Giorno)', desc: 'Un\'Oscurità magica riempie un\'emanazione di 4,5 metri originata dal manto oscuro. Questo effetto dura finché il manto oscuro mantiene la Concentrazione, fino a un massimo di 10 minuti. La Scurovisione non può penetrare quest\'area e nessuna luce può illuminarla.' }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [],
      notes: 'Predatore d\'Imboscata che si Aggrappa ai Soffitti\n\nHabitat: Sottosuolo\nTesoro: Nessuno\n\nCacciatori sotterranei innaturali, i manti oscuri si avvolgono in ombre magiche e sfruttano la loro anatomia bizzarra per camuffarsi da stalattiti. Quando una preda passa sotto di loro, i manti oscuri appostati si lasciano cadere e dispiegano i loro tentacoli membranosi, tentando di accecare, soffocare o schiacciare le vittime.\n\nI manti oscuri condividono alcune caratteristiche con i perforatori (piercer) e i pendagli assassini (roper) e spesso cacciano vicino a tali mostri. Gli studiosi hanno tentato di stabilire un\'origine comune o un ciclo vitale condiviso tra queste creature, ma i loro sforzi sono ostacolati dalla fisiologia soprannaturale e dalla natura letale di tali mostri.'
    },
    {
      id: 'preset_cane_della_morte', name: 'Cane della Morte', emoji: '🐕', rarity: 'common',
      type: 'Mostruosità', size: 'Media', alignment: 'Neutrale Malvagio',
      ac: 12, hp: 39, hpCur: 39, hpTemp: 0, hpDice: '6d8+12', init: 2,
      speed: '12 m', cr: '1', xp: '',
      str: 15, dex: 14, con: 14, intl: 3, wis: 13, cha: 6,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { percezione: '5', furtivita: '4' }, passivePerception: 15,
      senses: [{ type: 'Scurovisione', value: 36, unit: 'm' }], languages: [],
      dmgResist: [], dmgImmune: [], dmgVulner: [],
      condImmune: ['Accecato', 'Ammaliato', 'Assordato', 'Spaventato', 'Stordito', 'Privo di Sensi'],
      traits: [],
      actions: [
        { name: 'Multiattacco', desc: 'Il cane della morte effettua due attacchi con Morso.' },
        { name: 'Morso', desc: 'Attacco con arma da mischia: +4 a colpire, portata 1,5 metri.\nColpito: 4 (1d4 + 2) danni perforanti.\nSe il bersaglio è una creatura, è soggetto al seguente effetto. Tiro Salvezza su Costituzione: CD 12.\nPrimo Fallimento: il bersaglio ottiene la condizione Avvelenato. Finché è Avvelenato, il suo massimo dei punti ferita non si ripristina al termine di un Riposo Lungo, e ripete il tiro salvezza ogni 24 ore, terminando l\'effetto con un successo.\nFallimenti Successivi: il massimo dei punti ferita del bersaglio Avvelenato diminuisce di 5 (1d10).', atkHit: '+4', atkDmgs: [{ f: '1d4+2', t: 'perforanti' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [],
      notes: 'Diffusore di Malattie a Due Teste\n\nHabitat: Deserto\nTesoro: Nessuno\n\nI cani della morte sono una piaga delle terre aride che abitano. Questi feroci canidi a due teste tendono imboscate alle creature che percepiscono come più deboli di loro, privilegiando i feriti e gli infermi. Attaccano con sconsiderata aggressività, cercando di infettare quante più creature possibile con le loro mascelle malate. Se vengono scacciati, i cani della morte rimangono nei pressi delle loro vittime, lasciando che l\'infezione indebolisca la preda prima di colpire nuovamente.\n\nLe leggende collegano i cani della morte a malvagie divinità della morte, all\'oltretomba e a sovrani maledetti. Queste storie si basano sul morbo diffuso dai cani della morte. I sintomi seguenti sono puramente narrativi e non modificano gli effetti del Morso; scompaiono quando la vittima non è più Avvelenata dal morso.\n\nSintomi del Morbo del Cane della Morte (1d6):\n1 — Segni di mascelle canine compaiono sul corpo della vittima, come se fosse ancora dilaniata dai morsi.\n2 — Il corpo della vittima si inaridisce, come se fosse costantemente esposto al calore del deserto.\n3 — La vittima è distratta da ululati lontani o sussurri indistinti che soltanto lei può udire.\n4 — La carne della vittima imputridisce come quella di un cadavere.\n5 — Un prurito incessante, come se avesse pulci o granelli di sabbia sotto la pelle.\n6 — Simboli malvagi compaiono gradualmente e si diffondono sul corpo della vittima.\n\n«E i suoi dolori perseguiteranno la tua terra come cani affamati, finché i mari non diverranno sabbia e il sole non si consumerà in cenere.»\n— Frammento di tavoletta del Deserto Splendente'
    },
    {
      id: 'preset_cavaliere_della_morte', name: 'Cavaliere della Morte', emoji: '⚔️', rarity: 'epic',
      type: 'Non Morto', size: 'Media', alignment: 'Caotico Malvagio',
      ac: 20, hp: 199, hpCur: 199, hpTemp: 0, hpDice: '21d8+105', init: 12,
      speed: '9 m', cr: '17', xp: '',
      str: 20, dex: 11, con: 20, intl: 12, wis: 16, cha: 18,
      savesOverride: { str: '', dex: '6', con: '', intl: '', wis: '9', cha: '' },
      skillOverrides: {}, passivePerception: 13,
      senses: [{ type: 'Scurovisione', value: 36, unit: 'm' }], languages: ['Abissale', 'Comune'],
      dmgResist: [], dmgImmune: ['Necrotico', 'Veleno'], dmgVulner: [],
      condImmune: ['Esausto', 'Spaventato', 'Avvelenato'],
      traits: [
        { name: 'Resistenza Leggendaria (3/Giorno)', desc: 'Se il cavaliere della morte fallisce un tiro salvezza, può scegliere di superarlo invece.' },
        { name: 'Resistenza alla Magia', desc: 'Il cavaliere della morte ha vantaggio ai tiri salvezza contro incantesimi e altri effetti magici.' },
        { name: 'Maresciallo dei Non Morti', desc: 'Le creature non morte scelte dal cavaliere della morte (escluso sé stesso) entro un\'emanazione di 18 metri originata da lui hanno vantaggio ai tiri per colpire e ai tiri salvezza. Non può usare questo tratto se possiede la condizione Incapacitato.' },
        { name: 'Restaurazione Non Morta', desc: 'Se il cavaliere della morte viene distrutto prima di aver espiato il proprio male, ottiene un nuovo corpo in 1d10 giorni, tornando in vita con tutti i suoi punti ferita. Il nuovo corpo appare in un luogo significativo per il cavaliere della morte.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il cavaliere della morte effettua tre attacchi con Lama del Terrore.' },
        { name: 'Lama del Terrore', desc: 'Attacco con arma da mischia: +11 a colpire, portata 1,5 metri.\nColpito: 12 (2d6 + 5) danni taglienti più 13 (3d8) danni necrotici.', atkHit: '+11', atkDmgs: [{ f: '2d6+5', t: 'taglienti' }, { f: '3d8', t: 'necrotici' }] },
        { name: 'Globo di Fuoco Infernale (Ricarica 5–6)', desc: 'Tiro Salvezza su Destrezza: CD 18, ogni creatura in una sfera di raggio 6 metri centrata su un punto che il cavaliere della morte può vedere entro 36 metri.\nFallimento: 35 (10d6) danni da fuoco più 35 (10d6) danni necrotici.\nSuccesso: metà danni.', atkDmgs: [{ f: '10d6', t: 'fuoco' }, { f: '10d6', t: 'necrotici' }] },
        { name: 'Incantare', desc: 'Il cavaliere della morte lancia uno dei seguenti incantesimi senza componenti materiali, usando il Carisma come caratteristica da incantatore (CD 18).\n\nA volontà: Comando, Destriero Fantomatico.\n\n2/Giorno ciascuno: Onda Distruttiva (necrotica), Dissolvi Magie.' }
      ],
      bonusActions: [],
      reactions: [
        { name: 'Parata', desc: 'Innesco: il cavaliere della morte viene colpito da un tiro per colpire in mischia mentre impugna un\'arma.\nRisposta: aggiunge +6 alla propria CA contro quell\'attacco, facendolo potenzialmente mancare.' }
      ],
      legendaryActions: [
        { name: 'Usi (3 per round)', desc: 'Immediatamente dopo il turno di un\'altra creatura, il cavaliere della morte può spendere un utilizzo per compiere una delle azioni seguenti. Recupera tutti gli utilizzi spesi all\'inizio di ciascuno dei propri turni.' },
        { name: 'Autorità Terrificante', desc: 'Il cavaliere della morte usa Incantare per lanciare Comando. Non può usare di nuovo questa azione fino all\'inizio del suo turno successivo.' },
        { name: 'Parola Letale', desc: 'Tiro Salvezza su Costituzione: CD 18, una creatura che il cavaliere della morte può vedere entro 36 metri.\nFallimento: 17 (5d6) danni necrotici e il massimo dei punti ferita del bersaglio diminuisce di un ammontare pari ai danni subiti.\nFallimento o Successo: non può usare di nuovo questa azione fino all\'inizio del suo turno successivo.', atkDmgs: [{ f: '5d6', t: 'necrotici' }] },
        { name: 'Affondo', desc: 'Il cavaliere della morte si muove fino a metà della propria Velocità ed effettua un attacco con Lama del Terrore.' }
      ],
      drop: [{ name: 'Armamenti', desc: 'Le armi e l\'armatura del cavaliere della morte.' }],
      notes: 'Comandante Infestato di Legioni Immortali\n\nHabitat: Qualsiasi\nTesoro: Armamenti\n\nCampioni del male, i cavalieri della morte sono signori della guerra scheletrici rivestiti d\'armatura. Combinando una devastante maestria marziale e una magia blasfema, questi tiranni immortali guidano legioni empie contro i viventi o covano nelle loro cittadelle maledette. Ogni cavaliere della morte è perseguitato da un\'eredità di tragedia e disonore che lo spinge a commettere mali ancora più grandi.\n\nI cavalieri della morte sono combattenti letali e comandanti dominatori dal passato tetro. Alcuni si sforzano di spezzare le maledizioni che li condannano alla non morte, sebbene le loro anime egoiste li incatenino eternamente al proprio destino. Altri, come l\'infame Lord Soth, rimuginano per secoli tra lugubri rovine, destandosi all\'azione soltanto quando qualcosa riaccende la loro malvagità imperitura.'
    },
    {
      id: 'preset_aspirante_cavaliere_della_morte', name: 'Aspirante Cavaliere della Morte', emoji: '🗡️', rarity: 'rare',
      type: 'Non Morto', size: 'Media', alignment: 'Caotico Malvagio',
      ac: 20, hp: 178, hpCur: 178, hpTemp: 0, hpDice: '21d8+84', init: 4,
      speed: '9 m', cr: '11', xp: '',
      str: 20, dex: 10, con: 18, intl: 10, wis: 12, cha: 16,
      savesOverride: { str: '', dex: '4', con: '', intl: '', wis: '5', cha: '' },
      skillOverrides: {}, passivePerception: 11,
      senses: [{ type: 'Scurovisione', value: 36, unit: 'm' }], languages: ['Abissale', 'Comune'],
      dmgResist: [], dmgImmune: ['Necrotico', 'Veleno'], dmgVulner: [],
      condImmune: ['Esausto', 'Spaventato', 'Avvelenato'],
      traits: [
        { name: 'Resistenza alla Magia', desc: 'L\'aspirante ha vantaggio ai tiri salvezza contro incantesimi e altri effetti magici.' },
        { name: 'Maresciallo dei Non Morti', desc: 'Le creature non morte scelte dall\'aspirante (escluso sé stesso) entro un\'emanazione di 18 metri originata da lui hanno vantaggio ai tiri per colpire e ai tiri salvezza. Non può usare questo tratto se possiede la condizione Incapacitato.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'L\'aspirante effettua tre attacchi con Lama del Terrore.' },
        { name: 'Lama del Terrore', desc: 'Attacco con arma da mischia: +9 a colpire, portata 1,5 metri.\nColpito: 14 (2d8 + 5) danni taglienti più 10 (3d6) danni necrotici.', atkHit: '+9', atkDmgs: [{ f: '2d8+5', t: 'taglienti' }, { f: '3d6', t: 'necrotici' }] },
        { name: 'Globo di Fuoco Infernale (Ricarica 5–6)', desc: 'Tiro Salvezza su Destrezza: CD 15, ogni creatura in una sfera di raggio 6 metri centrata su un punto che l\'aspirante può vedere entro 36 metri.\nFallimento: 21 (6d6) danni da fuoco più 21 (6d6) danni necrotici.\nSuccesso: metà danni.', atkDmgs: [{ f: '6d6', t: 'fuoco' }, { f: '6d6', t: 'necrotici' }] },
        { name: 'Incantare', desc: 'L\'aspirante lancia uno dei seguenti incantesimi usando il Carisma come caratteristica da incantatore (CD 15).\n\nA volontà: Destriero Fantomatico.\n\n1/Giorno ciascuno: Onda Distruttiva (necrotica), Dissolvi Magie.' }
      ],
      bonusActions: [],
      reactions: [
        { name: 'Parata', desc: 'Innesco: l\'aspirante viene colpito da un tiro per colpire in mischia mentre impugna un\'arma.\nRisposta: aggiunge +4 alla propria CA contro quell\'attacco, facendolo potenzialmente mancare.' }
      ],
      legendaryActions: [],
      drop: [{ name: 'Armamenti', desc: 'Le armi e l\'armatura dell\'aspirante cavaliere della morte.' }],
      notes: 'Comandante Infestato di Legioni Immortali\n\nHabitat: Qualsiasi\nTesoro: Armamenti\n\nCampioni del male, i cavalieri della morte sono signori della guerra scheletrici rivestiti d\'armatura. Combinando una devastante maestria marziale e una magia blasfema, questi tiranni immortali guidano legioni empie contro i viventi o covano nelle loro cittadelle maledette. Ogni cavaliere della morte è perseguitato da un\'eredità di tragedia e disonore che lo spinge a commettere mali ancora più grandi.\n\nQuando il capo di un ordine malvagio ascende a cavaliere della morte, i suoi devoti seguaci potrebbero unirsi a lui nella sua esistenza maledetta come aspiranti cavalieri della morte. Questi seguaci possiedono una parte del potere del loro signore e servono come facevano in vita, obbedendo fedelmente ai decreti del cavaliere della morte e annunciandone la terribile volontà.'
    },
    {
      id: 'preset_tiranno_della_morte', name: 'Tiranno della Morte', emoji: '💀', rarity: 'legendary',
      type: 'Non Morto', size: 'Grande', alignment: 'Legale Malvagio',
      ac: 19, hp: 195, hpCur: 195, hpTemp: 0, hpDice: '26d10+52', init: 12,
      speed: '1,5 m, Volare 12 m (fluttuare)', cr: '14', xp: '',
      str: 18, dex: 14, con: 14, intl: 19, wis: 15, cha: 19,
      savesOverride: { str: '', dex: '', con: '7', intl: '', wis: '7', cha: '' },
      skillOverrides: { percezione: '12' }, passivePerception: 22,
      senses: [{ type: 'Scurovisione', value: 36, unit: 'm' }], languages: ['Linguaggio Profondo', 'Sottocomune'],
      dmgResist: [], dmgImmune: ['Veleno'], dmgVulner: [],
      condImmune: ['Ammaliato', 'Esausto', 'Paralizzato', 'Pietrificato', 'Avvelenato', 'Prono'],
      traits: [
        { name: 'Resistenza Leggendaria', desc: '(3/Giorno, oppure 4/Giorno nella Tana)\nSe il tiranno della morte fallisce un tiro salvezza, può scegliere di superarlo invece.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il tiranno della morte usa Raggi Oculari tre volte.' },
        { name: 'Morso', desc: 'Attacco con arma da mischia: +9 a colpire, portata 1,5 metri.\nColpito: 13 (2d8 + 4) danni perforanti.', atkHit: '+9', atkDmgs: [{ f: '2d8+4', t: 'perforanti' }] },
        { name: 'Raggi Oculari', desc: 'Il tiranno della morte spara casualmente uno dei seguenti raggi magici contro un bersaglio che può vedere entro 36 metri (tira 1d10; ritira se quel raggio è già stato usato in questo turno).\n\n1. Raggio dell\'Ammaliamento — TS Saggezza CD 17. Fallimento: 13 (3d8) danni psichici e Ammaliato per 1 ora o finché non subisce danni. Successo: metà danni.\n\n2. Raggio Paralizzante — TS Costituzione CD 17. Fallimento: Paralizzato; ripete il TS alla fine di ciascuno dei suoi turni, terminando con un successo, e dopo 1 minuto il successo è automatico.\n\n3. Raggio della Paura — TS Saggezza CD 17. Fallimento: 10 (3d6) danni psichici e Spaventato fino alla fine del suo turno successivo. Successo: metà danni.\n\n4. Raggio Rallentante — TS Costituzione CD 17. Fallimento: 18 (4d8) danni necrotici e, fino alla fine del suo turno successivo, niente Reazioni, velocità dimezzata e una sola tra Azione e Azione Bonus. Successo: metà danni.\n\n5. Raggio di Debilitazione — TS Costituzione CD 17. Fallimento: 16 (3d10) danni da veleno e Avvelenato fino alla fine del suo turno successivo; mentre è così Avvelenato non può recuperare punti ferita. Successo: metà danni.\n\n6. Raggio Telecinetico — TS Forza CD 17 (supera automaticamente se di taglia Mastodontica). Fallimento: il tiranno della morte sposta il bersaglio fino a 9 metri in qualsiasi direzione e lo lascia Trattenuto fino all\'inizio del proprio turno successivo o finché non acquisisce la condizione Incapacitato. Può anche manipolare oggetti con precisione.\n\n7. Raggio del Sonno — TS Saggezza CD 17 (supera automaticamente se Costrutto o Non Morto). Fallimento: Privo di Sensi per 1 minuto; l\'effetto termina se il bersaglio subisce danni o se una creatura entro 1,5 metri usa un\'Azione per svegliarlo.\n\n8. Raggio Pietrificante — TS Costituzione CD 17. Primo fallimento: Trattenuto (ripete il TS alla fine del suo turno successivo se ancora Trattenuto). Secondo fallimento: Pietrificato al posto di Trattenuto.\n\n9. Raggio Disintegrante — TS Destrezza CD 17. Fallimento: 36 (8d8) danni da forza; un oggetto non magico o una creazione di forza magica (cubo di 3 metri) si disintegra; se i danni riducono una creatura a 0 punti ferita, si disintegra in polvere. Successo: metà danni.\n\n10. Raggio della Morte — TS Destrezza CD 17. Fallimento: 55 (10d10) danni necrotici. Successo: metà danni. Se il raggio riduce il bersaglio a 0 punti ferita, esso muore.' }
      ],
      bonusActions: [
        { name: 'Cono di Energia Negativa', desc: 'L\'occhio centrale del tiranno della morte emette un\'impercettibile onda magica di energia negativa in un cono di 45 metri. Le creature in quell\'area non possono recuperare punti ferita fino all\'inizio del turno successivo del tiranno della morte. Un cadavere umanoide integro presente nell\'area si rialza immediatamente come uno Zombie sotto il controllo del tiranno della morte e agisce subito dopo di lui nello stesso conteggio d\'iniziativa.' }
      ],
      reactions: [],
      legendaryActions: [
        { name: 'Usi (3 per round, 4 nella Tana)', desc: 'Il tiranno della morte può usare una sola azione leggendaria alla volta, immediatamente dopo il turno di un\'altra creatura. Recupera tutti gli usi spesi all\'inizio del proprio turno.' },
        { name: 'Divorare', desc: 'Il tiranno della morte effettua due attacchi con Morso.', atkHit: '+9', atkDmgs: [{ f: '2d8+4', t: 'perforanti' }] },
        { name: 'Sguardo', desc: 'Il tiranno della morte usa Raggi Oculari.' }
      ],
      drop: [{ name: 'Qualsiasi', desc: 'Tesori e arcana accumulati nella tana, spesso accanto ai resti dei servitori non morti del tiranno.' }],
      notes: 'Beholder Oltre la Morte\n\nHabitat: Sottosuolo\nTesoro: Qualsiasi\n\n(Affrontato nella propria tana, il tiranno della morte vale 13.000 PE.)\n\nUn tiranno della morte è un beholder che persegue obiettivi aberranti oltre la propria morte. Dieci singolarità magiche — tutto ciò che resta dei suoi occhi magici — orbitano attorno al suo fluttuante cranio ciclopico, mentre lo sguardo colmo d\'odio della sua orbita oculare centrale soffoca la vita e risveglia i morti.\n\nI beholder tipicamente si trasformano in tiranni della morte nel corso degli anni, quando i loro sogni si fissano sulla morte, su apoteosi morbose o su viaggi verso reami inospitali alla vita. Alcuni sorgono dai cadaveri di beholder uccisi o per esposizione a strane magie o alle radiazioni del Sottosuolo. Talvolta i beholder perseguono intenzionalmente questo stato non morto, proprio come alcuni maghi depravati ricercano la lichità, sebbene ciò sia raro: la maggior parte dei beholder già si considera un essere perfetto.\n\nIndipendentemente da come vengano a esistere, impulsi bizzarri guidano la loro esistenza immortale. Le loro motivazioni tendono a essere estreme o al di là della comprensione delle creature viventi.\n\n«Un gruppo di minuscole luci discese da una oscura crepa nel soffitto. Queste scintille proiettavano un bagliore inquietante sull\'enorme cranio alieno sospeso sotto di loro.»\n— Diario di Jastus Hollowquill, esploratore di Sottomonte\n\n— Tana del Tiranno della Morte —\nI tiranni della morte si annidano nelle profondità del Sottosuolo, nei labirinti di tunnel che occupavano in vita o nelle tane dei beholder che hanno conquistato. Queste tane sono prive di vita, poiché i tiranni della morte trasformano i loro servitori in orrori non morti. La regione entro 1 miglio (1,6 km) dalla tana è deformata dalla loro presenza, generando i seguenti effetti regionali.\n\nInfusione di Energia Negativa: ogni volta che una creatura entro 1 miglio dalla tana recupera punti ferita tramite un incantesimo, sottrae 1d10 al numero di punti ferita recuperati.\n\nScopofobia: le creature entro 1 miglio dalla tana si sentono costantemente osservate. Qualsiasi creatura (eccetto il tiranno della morte e i suoi alleati) che completa un Riposo Breve entro 1 miglio dalla tana deve superare un Tiro Salvezza su Saggezza CD 15 oppure non ottiene alcun beneficio da quel riposo.\n\nSe il tiranno della morte muore o sposta altrove la propria tana, questi effetti terminano immediatamente.'
    },
    {
      id: 'preset_demilich', name: 'Demilich', emoji: '☠️', rarity: 'epic',
      type: 'Non Morto', size: 'Minuscola', alignment: 'Neutrale Malvagio',
      ac: 20, hp: 180, hpCur: 180, hpTemp: 0, hpDice: '72d4', init: 17,
      speed: '1,5 m, Volare 9 m (fluttuare)', cr: '18', xp: '',
      str: 1, dex: 20, con: 10, intl: 20, wis: 17, cha: 20,
      savesOverride: { str: '', dex: '11', con: '6', intl: '11', wis: '9', cha: '' },
      skillOverrides: {}, passivePerception: 13,
      senses: [{ type: 'Vista del Vero', value: 36, unit: 'm' }], languages: [],
      dmgResist: ['Contundente', 'Perforante', 'Tagliente'], dmgImmune: ['Necrotico', 'Veleno', 'Psichico'], dmgVulner: [],
      condImmune: ['Ammaliato', 'Assordato', 'Esausto', 'Spaventato', 'Paralizzato', 'Pietrificato', 'Avvelenato', 'Prono', 'Stordito'],
      traits: [
        { name: 'Resistenza Leggendaria', desc: '(3/Giorno, oppure 4/Giorno nella Tana)\nSe il demilich fallisce un tiro salvezza, può scegliere di superarlo invece.' },
        { name: 'Restaurazione Non Morta', desc: 'Se il demilich viene distrutto, si riforma e recupera tutti i suoi punti ferita in 1d10 giorni, a meno che non venga lanciato l\'incantesimo Desiderio sui suoi resti.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il demilich effettua tre attacchi con Esplosione Necrotica.' },
        { name: 'Esplosione Necrotica', desc: 'Attacco con arma da mischia o a distanza: +11 a colpire, portata 1,5 metri oppure gittata 36 metri.\nColpito: 24 (7d6) danni necrotici.', atkHit: '+11', atkDmgs: [{ f: '7d6', t: 'necrotici' }] },
        { name: 'Ululato (Ricarica 5–6)', desc: 'Tiro Salvezza su Costituzione: CD 19, ogni creatura in un\'emanazione di 9 metri originata dal demilich.\nFallimento: 70 (20d6) danni psichici.\nFallimento o Successo: il bersaglio acquisisce la condizione Spaventato fino all\'inizio del turno successivo del demilich.', atkDmgs: [{ f: '20d6', t: 'psichici' }] }
      ],
      bonusActions: [],
      reactions: [],
      legendaryActions: [
        { name: 'Usi (3 per round, 4 nella Tana)', desc: 'Il demilich può usare una sola azione leggendaria alla volta, immediatamente dopo il turno di un\'altra creatura. Recupera tutti gli usi spesi all\'inizio del proprio turno.' },
        { name: 'Risucchio di Energia', desc: 'Tiro Salvezza su Costituzione: CD 19, una creatura che il demilich può vedere entro 36 metri.\nFallimento: il massimo dei punti ferita del bersaglio diminuisce di 14 (4d6).\nFallimento o Successo: il demilich non può usare di nuovo questa azione fino all\'inizio del suo turno successivo.' },
        { name: 'Volo di Polvere Sepolcrale', desc: 'Il demilich vola fino alla propria velocità di volo, spargendo polvere tombale. Ogni creatura entro 1,5 metri dal demilich mentre si muove deve effettuare un Tiro Salvezza su Costituzione CD 19.\nFallimento: il bersaglio acquisisce la condizione Accecato fino alla fine del turno successivo del demilich.\nFallimento o Successo: il demilich non può usare di nuovo questa azione fino all\'inizio del suo turno successivo.' },
        { name: 'Necrosi', desc: 'Il demilich effettua un attacco con Esplosione Necrotica.', atkHit: '+11', atkDmgs: [{ f: '7d6', t: 'necrotici' }] }
      ],
      drop: [{ name: 'Arcani', desc: 'Gemme e sigilli arcani incastonati nel teschio, e i tesori accumulati nel santuario intrappolato del demilich.' }],
      notes: 'Ciò che si Trova Oltre la Lichità\n\nHabitat: Qualsiasi\nTesoro: Arcani\n\n(Affrontato nella propria tana, il demilich vale 22.000 PE.)\n\nUn demilich è un teschio che custodisce i resti dell\'essenza malvagia di un lich. Se il peso dell\'immortalità sopraffà un lich, la sua coscienza si ripiega su sé stessa mentre il corpo si decompone. Ma se i suoi resti vengono disturbati, un demilich si risveglia. I demilich appaiono solitamente come teschi adornati di gemme o sigilli arcani.\n\n— Tana del Demilich —\nI demilich custodiscono gelosamente i loro santuari colmi di trappole mortali. Il più famigerato di questi è la Tomba degli Orrori, la tana dell\'infame Acererak. La regione entro 1 miglio dalla tana è deformata dalla presenza del demilich, generando i seguenti effetti regionali.\n\nDominio Snervante: ogni volta che una creatura diversa dal demilich o dai suoi alleati completa un Riposo Lungo entro 1 miglio dalla tana, deve superare un Tiro Salvezza su Costituzione CD 20 oppure il suo massimo dei punti ferita viene ridotto di 1d4. La riduzione dura finché la creatura non completa un Riposo Lungo al di fuori di quell\'area.\n\nInterdizione dei Viaggi: le creature non possono usare teletrasporto o viaggi planari per entrare o uscire dalla tana.\n\nSe il demilich muore o sposta altrove la propria tana, questi effetti terminano immediatamente.'
    },
    {
      id: 'preset_deva', name: 'Deva', emoji: '😇', rarity: 'epic',
      type: 'Celestiale', size: 'Media', alignment: 'Legale Buono',
      ac: 17, hp: 229, hpCur: 229, hpTemp: 0, hpDice: '27d8+108', init: 4,
      speed: '9 m, Volare 27 m (fluttuare)', cr: '10', xp: '',
      str: 18, dex: 18, con: 18, intl: 17, wis: 20, cha: 20,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '9', cha: '9' },
      skillOverrides: { intuizione: '9', percezione: '9' }, passivePerception: 19,
      senses: [{ type: 'Scurovisione', value: 36, unit: 'm' }], languages: ['Tutti', 'Telepatia 36 m'],
      dmgResist: ['Radioso'], dmgImmune: [], dmgVulner: [],
      condImmune: ['Ammaliato', 'Esausto', 'Spaventato'],
      traits: [
        { name: 'Restaurazione Esaltata', desc: 'Se il deva muore al di fuori del Monte Celestia, il suo corpo scompare ed esso ottiene istantaneamente un nuovo corpo, tornando in vita con tutti i suoi punti ferita da qualche parte sul Monte Celestia.' },
        { name: 'Resistenza alla Magia', desc: 'Il deva ha vantaggio ai tiri salvezza contro incantesimi e altri effetti magici.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il deva effettua due attacchi con Mazza Sacra.' },
        { name: 'Mazza Sacra', desc: 'Attacco con arma da mischia: +8 a colpire, portata 1,5 metri.\nColpito: 7 (1d6 + 4) danni contundenti più 18 (4d8) danni radiosi.', atkHit: '+8', atkDmgs: [{ f: '1d6+4', t: 'contundenti' }, { f: '4d8', t: 'radiosi' }] },
        { name: 'Incantare', desc: 'Il deva lancia uno dei seguenti incantesimi senza componenti materiali, usando il Carisma come caratteristica da incantatore (CD 17).\n\nA volontà: Individuazione del Bene e del Male, Trasformazione (solo forma di Bestia o Umanoide; nessun PF temporaneo e nessuna concentrazione richiesta).\n\n1/Giorno ciascuno: Comunione, Rianimare Morti.' }
      ],
      bonusActions: [
        { name: 'Aiuto Divino (2/Giorno)', desc: 'Il deva lancia Cura Ferite, Ristorare Inferiore oppure Rimuovi Maledizione, usando la stessa caratteristica da incantatore di Incantare.' }
      ],
      reactions: [],
      legendaryActions: [],
      drop: [{ name: 'Reliquie', desc: 'Reliquie sacre e oggetti benedetti affidati al deva o lasciati ai mortali ritenuti degni.' }],
      notes: 'Messaggero Angelico che Cambia il Mondo\n\nHabitat: Planare (Piani Superiori)\nTesoro: Reliquie\n\nI deva sono emissari della volontà divina. Questi messaggeri immortali assumono l\'aspetto di bestie mistiche o di mortali alati idealizzati. Come tutti gli angeli, le loro vere forme sono conosciute soltanto dalle divinità che servono.\n\nPiuttosto che consegnare una corrispondenza letterale da parte di un dio, un deva comunica ai mortali un\'allegoria o una missione, incaricandoli di portare qualcosa al suo luogo legittimo. Sebbene l\'angelo possa essere invocato nei momenti di bisogno, esso incoraggia l\'eroismo dei mortali. Se i campioni scelti da un deva portano a termine il loro incarico, sperimentano una rivelazione oppure il mondo viene cambiato in accordo con il proposito divino.\n\nMessaggi del Deva (1d6) — il deva incarica un mortale di consegnare...\n1 — Il corpo di un eroe che necessita di redenzione.\n2 — La cura per una piaga in una terra lontana.\n3 — Uno scrigno sacro che non deve essere aperto.\n4 — Un\'arma magica utilizzabile soltanto da un vero eroe.\n5 — Una giovane pianta che appassisce se esposta all\'ira.\n6 — Qualcuno proveniente da un altro mondo con uno scopo profetizzato ma privo di memoria.'
    },
    {
      id: 'preset_bestia_distorcente', name: 'Bestia Distorcente', emoji: '🐆', rarity: 'uncommon',
      type: 'Mostruosità', size: 'Grande', alignment: 'Legale Malvagio',
      ac: 13, hp: 76, hpCur: 76, hpTemp: 0, hpDice: '9d10+27', init: 4,
      speed: '12 m', cr: '3', xp: '',
      str: 18, dex: 15, con: 16, intl: 6, wis: 12, cha: 8,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: {}, passivePerception: 11,
      senses: [{ type: 'Scurovisione', value: 18, unit: 'm' }], languages: ['Silvano (comprende ma non parla)'],
      dmgResist: [], dmgImmune: [], dmgVulner: [],
      condImmune: [],
      traits: [
        { name: 'Elusione', desc: 'Se la bestia distorcente è soggetta a un effetto che le consente di effettuare un tiro salvezza per subire soltanto metà danni, non subisce alcun danno se supera il tiro salvezza e soltanto metà danni se lo fallisce.\nNon può usare questo tratto se possiede la condizione Incapacitato.' },
        { name: 'Distorsione', desc: 'I tiri per colpire contro la bestia distorcente hanno svantaggio, poiché essa proietta un\'illusione che la fa apparire vicina, ma non coincidente, con la sua posizione reale.\nQuesto tratto è soppresso mentre la bestia distorcente possiede la condizione Incapacitato.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'La bestia distorcente effettua un attacco con Artigliata e un attacco con Tentacolo.' },
        { name: 'Artigliata', desc: 'Attacco con arma da mischia: +6 a colpire, portata 1,5 metri.\nColpito: 9 (1d10 + 4) danni taglienti.\nSe il bersaglio è una creatura di taglia Grande o inferiore, ottiene la condizione Prono.', atkHit: '+6', atkDmgs: [{ f: '1d10+4', t: 'taglienti' }] },
        { name: 'Tentacolo', desc: 'Attacco con arma da mischia: +6 a colpire, portata 3 metri.\nColpito: 11 (2d6 + 4) danni perforanti.', atkHit: '+6', atkDmgs: [{ f: '2d6+4', t: 'perforanti' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [],
      notes: 'Felino Predatore dall\'Aspetto Ingannatore\n\nHabitat: Foresta\nTesoro: Nessuno\n\nUna bestia distorcente assomiglia a una pantera magra a sei zampe, con un tentacolo uncinato che spunta da ciascuna spalla. Questo predatore utilizza una magia innata per distorcere la luce, facendo apparire sé stesso a diversi metri di distanza dalla sua posizione reale.\n\nLe bestie distorcenti cacciano non solo per nutrirsi, ma anche perché amano uccidere. Una volta che iniziano a inseguire una preda, non possono essere scoraggiate finché non viene uccisa la preda o la bestia stessa. Sebbene abitino comunemente fitte foreste, possono inseguire viaggiatori per grandi distanze e persino fino a città o sotterranei. Più astute di semplici animali, queste creature possono tendere imboscate o restare nascoste per giorni per abbattere la loro preda.\n\nTalvolta le bestie distorcenti inseguono le loro prede attraverso portali verso altri piani di esistenza. Per questo motivo possono essere trovate in tutto il multiverso, specialmente nei mondi del Piano Materiale, nella Coltre Oscura (Shadowfell) e nel Feywild. Questi cacciatori irrequieti possono distruggere l\'equilibrio naturale di una regione e portare altre creature all\'estinzione: per questo molti circoli druidici e folletti considerano le bestie distorcenti una minaccia mortale.\n\n«La furia omicida di una bestia distorcente è adatta solo agli incubi, come ho imparato dopo essere sopravvissuto a stento a una sua imboscata. Sono certo che quella creatura mi stia ancora dando la caccia.»\n— Jen-Ahb, naturalista e sopravvissuto a una bestia distorcente'
    },
    {
      id: 'preset_djinni', name: 'Djinni', emoji: '🌬️', rarity: 'epic',
      type: 'Elementale', size: 'Grande', alignment: 'Neutrale',
      ac: 17, hp: 218, hpCur: 218, hpTemp: 0, hpDice: '19d10+114', init: 2,
      speed: '9 m, Volare 27 m (fluttuare)', cr: '11', xp: '',
      str: 21, dex: 15, con: 22, intl: 15, wis: 16, cha: 20,
      savesOverride: { str: '', dex: '6', con: '', intl: '', wis: '7', cha: '' },
      skillOverrides: {}, passivePerception: 13,
      senses: [{ type: 'Scurovisione', value: 36, unit: 'm' }], languages: ['Primordiale (Auran)'],
      dmgResist: [], dmgImmune: ['Fulmine', 'Tuono'], dmgVulner: [],
      condImmune: [],
      traits: [
        { name: 'Restaurazione Elementale', desc: 'Se il djinni muore al di fuori del Piano Elementale dell\'Aria, il suo corpo si dissolve in nebbia ed esso ottiene un nuovo corpo in 1d4 giorni, tornando in vita con tutti i suoi punti ferita da qualche parte sul Piano dell\'Aria.' },
        { name: 'Resistenza alla Magia', desc: 'Il djinni ha vantaggio ai tiri salvezza contro incantesimi e altri effetti magici.' },
        { name: 'Desideri', desc: 'Il djinni ha una probabilità del 30% di conoscere l\'incantesimo Desiderio. Se lo conosce, può lanciarlo soltanto per conto di una creatura non genio che esprima un desiderio in un modo che il djinni possa comprendere. Lanciandolo per tale creatura, non subisce alcuno stress dell\'incantesimo. Dopo averlo lanciato tre volte, non può farlo di nuovo per 365 giorni.' }
      ],
      actions: [
        { name: 'Multiattacco', desc: 'Il djinni effettua tre attacchi, usando Lama della Tempesta o Dardo della Tempesta in qualsiasi combinazione.' },
        { name: 'Lama della Tempesta', desc: 'Attacco con arma da mischia: +9 a colpire, portata 1,5 metri.\nColpito: 12 (2d6 + 5) danni taglienti più 7 (2d6) danni da fulmine.', atkHit: '+9', atkDmgs: [{ f: '2d6+5', t: 'taglienti' }, { f: '2d6', t: 'fulmine' }] },
        { name: 'Dardo della Tempesta', desc: 'Attacco con arma a distanza: +9 a colpire, gittata 36 metri.\nColpito: 13 (3d8) danni da tuono.\nSe il bersaglio è una creatura di taglia Grande o inferiore, ottiene la condizione Prono.', atkHit: '+9', atkDmgs: [{ f: '3d8', t: 'tuono' }] },
        { name: 'Creare Turbine', desc: 'Il djinni evoca un turbine in un punto che può vedere entro 36 metri. Il turbine riempie un cilindro di raggio 6 metri e altezza 18 metri centrato su quel punto e permane finché il djinni mantiene la Concentrazione. All\'inizio di ciascuno dei suoi turni il djinni può spostare il turbine fino a 6 metri.\nQuando il turbine entra nello spazio di una creatura, o una creatura vi entra, quella creatura deve effettuare un Tiro Salvezza su Forza CD 17 (una sola volta per turno; il djinni ne è immune).\nFallimento: finché si trova nel turbine il bersaglio ottiene la condizione Trattenuto e si muove insieme al turbine. All\'inizio di ciascuno dei suoi turni il bersaglio Trattenuto subisce 21 (6d6) danni da tuono.\nAlla fine di ciascuno dei suoi turni il bersaglio ripete il tiro salvezza, terminando l\'effetto su sé stesso con un successo.' },
        { name: 'Incantare', desc: 'Il djinni lancia uno dei seguenti incantesimi senza componenti materiali, usando il Carisma come caratteristica da incantatore (CD 17).\n\nA volontà: Individuazione del Bene e del Male, Individuazione del Magico.\n\n2/Giorno ciascuno: Creare Cibo e Acqua (può creare vino al posto dell\'acqua), Linguaggi, Camminare nel Vento.\n\n1/Giorno ciascuno: Creazione, Forma Gassosa, Invisibilità, Immagine Maggiore, Spostamento Planare.' }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [{ name: 'Arcani', desc: 'Tesori raccolti nei palazzi aerei e nelle città fluttuanti: arcani, opere d\'arte e ricchezze di mille piani.' }],
      notes: 'Genio dell\'Aria\n\nHabitat: Costa, Piano Elementale dell\'Aria\nTesoro: Arcani\n\nIn quanto geni dei venti e dei cieli, i djinni incarnano libertà e potenza. Possono controllare il vento e viaggiare rapidi come una brezza. Possono essere sereni come nuvole alla deriva o tempestosi come una burrasca, ma la maggior parte dei djinni ama la libertà e desidera scoprire le meraviglie del multiverso. I djinni conoscono spesso numerose storie e amano condividerle con chi offre in cambio altri racconti interessanti.\n\nSebbene molti djinni creino palazzi aerei sulle coste battute dalle tempeste o tra le alte nubi, innumerevoli altri abitano il Piano Elementale dell\'Aria. Nelle loro città fluttuanti raccolgono racconti ed esperienze da tutti i piani dell\'esistenza, condividendoli in favolosi forum, biblioteche e teatri. La più grande di queste città è la Cittadella del Ghiaccio e dell\'Acciaio, le cui torri scolpite dal vento custodiscono un tesoro di conoscenze e ricchezze grande quanto una città, al di là di ogni immaginazione.'
    }
  ];

  /* Il "Bestiario" ufficiale vive nei PRESETS (codice, sola lettura). cm_bestiary
     contiene ORA solo i mostri "Personalizzati" creati dall'utente. Migrazione:
     rimuove eventuali preset seminati in passato. */
  function isOfficialId(id) { for (var i = 0; i < PRESETS.length; i++) if (PRESETS[i].id === id) return true; return false; }
  var data = load().filter(function (m) { return m && String(m.id || '').indexOf('preset_') !== 0; });
  persist();

  function genId() { return 'm_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function abMod(s) { return Math.floor(((s | 0) - 10) / 2); }
  function fmtMod(m) { return m >= 0 ? '+' + m : '' + m; }
  function host() { return document.getElementById('bestiaryBody'); }
  function getById(id) { for (var i = 0; i < PRESETS.length; i++) if (PRESETS[i].id === id) return PRESETS[i]; for (var j = 0; j < data.length; j++) if (data[j].id === id) return data[j]; return null; }
  function currentList() { return view.tab === 'custom' ? data : PRESETS; }

  /* Foto del mostro: usa l'upload (m.photo, base64) se presente; altrimenti un
     file nel repo il cui nome corrisponde al nome della creatura:
     img/bestiary/<slug>.webp (slug = minuscolo, accenti rimossi, simboli→'-').
     Se il file manca → placeholder (registrato in imgCache per non riprovare). */
  var IMG_DIR = 'img/bestiary/';
  function slugForName(name) {
    return String(name || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  function derivedPhoto(name) { var s = slugForName(name); return s ? (IMG_DIR + s + '.webp') : ''; }
  window.cmBestiarySlug = slugForName;
  var imgCache = {};
  window.__bestImg = function (src, ok, el) { imgCache[src] = ok ? 'ok' : 'fail'; if (!ok && el && el.remove) el.remove(); };
  function monsterPhotoHtml(m) {
    var ph = '<svg class="best__photo-ph" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
    var src = m.photo || derivedPhoto(m.name);
    if (!src) return ph;
    var isData = src.slice(0, 5) === 'data:';
    if (!isData && imgCache[src] === 'fail') return ph;
    var handlers = isData ? '' : (' onload="window.__bestImg(\'' + src + '\',1)" onerror="window.__bestImg(\'' + src + '\',0,this)"');
    return ph + '<img class="best__photo-img" src="' + esc(src) + '" alt=""' + handlers + '>';
  }

  /* ---- Rarità in base alla CR (colore bordo/bagliore/foil della figurina) ---- */
  function crNum(cr) {
    if (cr == null || cr === '') return -1;
    var s = String(cr).trim();
    if (s.indexOf('/') >= 0) { var p = s.split('/'); return (parseFloat(p[0]) || 0) / (parseFloat(p[1]) || 1); }
    return parseFloat(s) || 0;
  }
  var RARITIES = {
    common:    { c1: '#7d8794', c2: '#aeb8c4', glow: 'rgba(165,178,194,.42)', holo: .10 },
    uncommon:  { c1: '#3fae5a', c2: '#86e89a', glow: 'rgba(70,200,110,.48)',  holo: .20 },
    rare:      { c1: '#3b82f6', c2: '#8fd3ff', glow: 'rgba(70,150,255,.52)',  holo: .30 },
    epic:      { c1: '#a855f7', c2: '#e2b6ff', glow: 'rgba(180,90,250,.56)',  holo: .40 },
    legendary: { c1: '#f59e0b', c2: '#ffe39a', glow: 'rgba(245,175,40,.64)',  holo: .50 }
  };
  var RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  var RARITY_NAMES = { common: 'Comune', uncommon: 'Non comune', rare: 'Raro', epic: 'Epico', legendary: 'Leggendario' };
  /* Fallback solo per mostri legacy senza rarità esplicita: derivata dalla CR. */
  function rarityKeyForCr(cr) {
    var n = crNum(cr);
    if (n < 2) return 'common';
    if (n < 5) return 'uncommon';
    if (n < 11) return 'rare';
    if (n < 17) return 'epic';
    return 'legendary';
  }
  function rarityKeyOf(m) { var k = m && m.rarity; if (k === 'mythic') k = 'legendary'; return (k && RARITIES[k]) ? k : rarityKeyForCr(m && m.cr); }
  function rarityOf(m) { return RARITIES[rarityKeyOf(m)] || RARITIES.common; }
  function rarityVars(m) { var r = rarityOf(m); return '--rare-c1:' + r.c1 + ';--rare-c2:' + r.c2 + ';--glow:' + r.glow + ';--holo:' + r.holo + ';'; }

  /* Tutti i tipi (come nella scheda nemico) e la scala CR per i filtri. */
  var BEST_TYPES = ['Aberrazione', 'Bestia', 'Celestiale', 'Costrutto', 'Drago', 'Elementale', 'Fata', 'Gigante', 'Immondo', 'Melma', 'Mostruosità', 'Non Morto', 'Pianta', 'Umanoide'];
  var BEST_CR_SCALE = ['0', '1/8', '1/4', '1/2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'];

  function blankMonster() {
    return { name: 'Nuovo mostro', emoji: '🐾', rarity: 'common', ac: 10, hp: 10, hpCur: 10, hpTemp: 0, init: 0,
             cr: '', xp: '', hpDice: '', str: 10, dex: 10, con: 10, intl: 10, wis: 10, cha: 10 };
  }

  /* ---- Stato vista (split: lista a sx, anteprima a dx; tab official|custom) ---- */
  var view = { tab: 'official', curId: null, q: '', fRarities: [], fTypes: [], fCrMin: 0, fCrMax: 33, openFilter: null, sortKey: '', sortDir: 'asc', randomOrder: {} };

  /* ---- Caricamento foto mostro (stessa compressione della scheda nemico) ---- */
  var pendingPhotoId = null;
  var fileInput = document.createElement('input');
  fileInput.type = 'file'; fileInput.accept = 'image/*'; fileInput.style.display = 'none';
  function ensureFileInput() { if (!fileInput.parentNode && document.body) document.body.appendChild(fileInput); }
  fileInput.addEventListener('change', function () {
    var f = fileInput.files && fileInput.files[0];
    var id = pendingPhotoId; pendingPhotoId = null; fileInput.value = '';
    if (!f || !id || typeof window.cmProcessMonsterImg !== 'function') return;
    window.cmProcessMonsterImg(f, function (thumb, full) {
      var m = getById(id); if (!m) return;
      m.photo = thumb; m.photoFull = full; persist(); render();
    });
  });

  /* ---- API pubblica ---- */
  window.cmBestiary = {
    all: function () { return data; },
    get: getById,
    upsert: function (obj, id) {
      var o; try { o = JSON.parse(JSON.stringify(obj)); } catch (e) { return null; }
      if (id) {
        for (var i = 0; i < data.length; i++) { if (data[i].id === id) { o.id = id; data[i] = o; persist(); render(); return id; } }
      }
      o.id = genId(); data.push(o); persist(); render(); return o.id;
    },
    remove: function (id) { for (var i = 0; i < data.length; i++) { if (data[i].id === id) { data.splice(i, 1); break; } } persist(); render(); },
    /* Usata come callback di salvataggio dall'editor: persiste e ridisegna. */
    save: function () { persist(); render(); },
    render: function () { render(); }
  };

  /* ---- Render: due colonne (lista a sinistra, anteprima a destra) ---- */
  function render() {
    var el = host(); if (!el) return;
    var left = el.querySelector('.best__left'), right = el.querySelector('.best__right');
    if (!left || !right) {
      el.innerHTML = '<div class="best__left"></div><div class="best__right"></div>';
      left = el.querySelector('.best__left'); right = el.querySelector('.best__right');
    }
    renderLeftInto(left); renderRightInto(right);
  }
  /* Aggiorna solo la colonna sinistra (per non perdere il focus dalla ricerca). */
  function renderLeft() { var el = host(); if (!el) return; var left = el.querySelector('.best__left'); if (left) renderLeftInto(left); }
  function renderRight() { var el = host(); if (!el) return; var right = el.querySelector('.best__right'); if (right) renderRightInto(right); }

  /* Persistenza della posizione di scroll della lista (sopravvive al reload della pagina). */
  var BEST_SCROLL_KEY = 'cm_best_scroll';
  var bestScrollInit = false, bestScrollSaveT = null;
  function ensureBestScrollPersist(left) {
    if (bestScrollInit || !left) return;
    bestScrollInit = true;
    // Lo scroll non fa bubbling: ascolto in fase di cattura e salvo (con debounce) la posizione di .best__cards.
    left.addEventListener('scroll', function (e) {
      var c = e.target;
      if (!c || !c.classList || !c.classList.contains('best__cards')) return;
      if (bestScrollSaveT) clearTimeout(bestScrollSaveT);
      bestScrollSaveT = setTimeout(function () {
        try { localStorage.setItem(BEST_SCROLL_KEY, String(Math.round(c.scrollTop))); } catch (_) {}
      }, 150);
    }, true);
    // Ripristino una sola volta, quando la lista diventa visibile (es. dopo un reload o riaprendo la finestra).
    if (typeof IntersectionObserver === 'function') {
      var obs = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            obs.disconnect();
            var v = 0; try { v = parseInt(localStorage.getItem(BEST_SCROLL_KEY) || '0', 10) || 0; } catch (_) {}
            if (v > 0) requestAnimationFrame(function () { var cc = left.querySelector('.best__cards'); if (cc) cc.scrollTop = v; });
            return;
          }
        }
      });
      obs.observe(left);
    }
  }

  function renderLeftInto(left) {
    ensureBestScrollPersist(left);
    var isCustom = view.tab === 'custom';
    var lastIdx = BEST_CR_SCALE.length - 1;
    var lp = (view.fCrMin / lastIdx) * 100, rp = (view.fCrMax / lastIdx) * 100;
    var h = '<div class="best__head">' +
      '<div class="best__tabs">' +
      '<button class="best__tab' + (view.tab === 'official' ? ' best__tab--on' : '') + '" data-besttab="official" type="button">Bestiario</button>' +
      '<button class="best__tab' + (isCustom ? ' best__tab--on' : '') + '" data-besttab="custom" type="button">Personalizzati</button>' +
      '</div>';
    h += '<div class="best__bar"><input class="best__search" id="bestSearch" placeholder="Cerca mostro..." value="' + esc(view.q) + '" spellcheck="false">' +
      (isCustom ? '<button class="best__add" data-bestnew="1" type="button" title="Nuovo mostro">＋</button>' : '') + '</div>';
    var crActive = (view.fCrMin > 0 || view.fCrMax < lastIdx) ? 1 : 0;
    var anyActive = view.fRarities.length || view.fTypes.length || crActive || view.sortKey;
    h += '<div class="best__filters">';
    h += '<div class="best__fbar">' +
      filterToggle('rarity', 'Rarità', view.fRarities.length, false) +
      filterToggle('type', 'Tipo', view.fTypes.length, false) +
      filterToggle('cr', 'Sfida', crActive, true) +
      filterToggle('sort', 'Ordina', view.sortKey ? 1 : 0, true) +
      '<button class="best__freset' + (anyActive ? '' : ' best__freset--off') + '" data-bestreset="1" type="button" title="Reimposta filtri e ordinamento">↺</button>' +
      '</div>';
    if (view.openFilter) {
      h += '<div class="best__fpanel">' +
        (view.openFilter === 'rarity' ? rarityPanelHtml()
          : view.openFilter === 'type' ? typePanelHtml()
            : view.openFilter === 'cr' ? crPanelHtml()
              : sortPanelHtml()) +
        '</div>';
    }
    h += '</div>';
    h += '</div>';
    h += '<div class="best__cards"></div>';
    left.innerHTML = h;
    fillCards();
    updateFilterChrome();
  }

  /* Bottone-filtro compatto (apre/chiude il pannello relativo). */
  function filterToggle(key, label, count, dot) {
    var open = view.openFilter === key, active = count > 0;
    return '<button class="best__ftoggle' + (open ? ' best__ftoggle--open' : '') + (active ? ' best__ftoggle--active' : '') + '" data-bestfopen="' + key + '" type="button">' +
      '<span class="best__ftoggle-lbl">' + label + '</span>' +
      '<span class="best__fcount' + (dot ? ' best__fcount--dot' : '') + '" data-fbadge="' + key + '"' + (active ? '' : ' style="display:none"') + '>' + (active && !dot ? count : '') + '</span>' +
      '<span class="best__fcaret">▾</span></button>';
  }
  function rarityPanelHtml() {
    return '<div class="best__chiprow">' + RARITY_ORDER.map(function (k) {
      var rr = RARITIES[k];
      return '<button class="best__fchip' + (view.fRarities.indexOf(k) >= 0 ? ' best__fchip--on' : '') + '" data-bestfrar="' + k + '" style="--c1:' + rr.c1 + ';--c2:' + rr.c2 + '" type="button"><span class="best__rarity-dot"></span>' + RARITY_NAMES[k] + '</button>';
    }).join('') + '</div>';
  }
  function typePanelHtml() {
    return '<div class="best__chiprow">' + BEST_TYPES.map(function (t) {
      return '<button class="best__fchip' + (view.fTypes.indexOf(t) >= 0 ? ' best__fchip--on' : '') + '" data-bestftype="' + esc(t) + '" type="button">' + esc(t) + '</button>';
    }).join('') + '</div>';
  }
  function crPanelHtml() {
    var lastIdx = BEST_CR_SCALE.length - 1;
    var lp = (view.fCrMin / lastIdx) * 100, rp = (view.fCrMax / lastIdx) * 100;
    return '<div class="best__cr-head"><span>Grado di sfida</span><span class="best__cr-val" id="bestCrVal">' + BEST_CR_SCALE[view.fCrMin] + ' – ' + BEST_CR_SCALE[view.fCrMax] + '</span></div>' +
      '<div class="best__cr-slider"><div class="best__cr-rail"></div><div class="best__cr-fill" id="bestCrFill" style="left:' + lp + '%;width:' + (rp - lp) + '%"></div>' +
      '<input type="range" class="best__cr-thumb" min="0" max="' + lastIdx + '" step="1" value="' + view.fCrMin + '" data-bestcr="min">' +
      '<input type="range" class="best__cr-thumb" min="0" max="' + lastIdx + '" step="1" value="' + view.fCrMax + '" data-bestcr="max"></div>';
  }

  var SORT_OPTS = [['alpha', 'Alfabetico'], ['type', 'Tipo'], ['cr', 'Sfida (CR)'], ['rarity', 'Rarità'], ['random', '🎲 Casuale']];
  function sortPanelHtml() {
    var chips = SORT_OPTS.map(function (o) {
      return '<button class="best__fchip' + (view.sortKey === o[0] ? ' best__fchip--on' : '') + '" data-bestsort="' + o[0] + '" type="button">' + o[1] + '</button>';
    }).join('');
    var desc = view.sortDir === 'desc';
    return '<div class="best__chiprow">' + chips + '</div>' +
      '<button class="best__dirbtn' + (view.sortKey && view.sortKey !== 'random' ? '' : ' best__dirbtn--off') + '" data-bestsortdir="1" type="button">' +
      (desc ? 'Decrescente <span class="best__diric">↓</span>' : 'Crescente <span class="best__diric">↑</span>') + '</button>';
  }

  function rarityRank(m) { var i = RARITY_ORDER.indexOf(rarityKeyOf(m)); return i < 0 ? 0 : i; }
  function sortItems(items) {
    if (!view.sortKey) return items;
    if (view.sortKey === 'random') {
      /* Ordine casuale STABILE: un rank casuale per carta, rigenerato solo
         cliccando "Casuale" (non a ogni ricerca/filtro). */
      var ro = view.randomOrder || (view.randomOrder = {});
      items.forEach(function (m) { if (ro[m.id] == null) ro[m.id] = Math.random(); });
      return items.slice().sort(function (a, b) { return (ro[a.id] || 0) - (ro[b.id] || 0); });
    }
    var dir = view.sortDir === 'desc' ? -1 : 1, key = view.sortKey;
    var byName = function (a, b) { return String(a.name || '').localeCompare(String(b.name || ''), 'it', { sensitivity: 'base' }); };
    var arr = items.slice();
    arr.sort(function (a, b) {
      var r = 0;
      if (key === 'alpha') r = byName(a, b);
      else if (key === 'type') r = String(a.type || '').localeCompare(String(b.type || ''), 'it', { sensitivity: 'base' });
      else if (key === 'cr') r = crNum(a.cr) - crNum(b.cr);
      else if (key === 'rarity') r = rarityRank(a) - rarityRank(b);
      if (r === 0) r = byName(a, b);
      return r * dir;
    });
    return arr;
  }

  /* Aggiorna badge/stato-attivo dei bottoni-filtro senza ricostruire il pannello. */
  function updateFilterChrome() {
    var el = host(); if (!el) return;
    var lastIdx = BEST_CR_SCALE.length - 1;
    var crA = (view.fCrMin > 0 || view.fCrMax < lastIdx) ? 1 : 0;
    var info = { rarity: view.fRarities.length, type: view.fTypes.length, cr: crA, sort: view.sortKey ? 1 : 0 };
    ['rarity', 'type', 'cr', 'sort'].forEach(function (k) {
      var btn = el.querySelector('[data-bestfopen="' + k + '"]'); if (!btn) return;
      var n = info[k], dot = (k === 'cr' || k === 'sort');
      btn.classList.toggle('best__ftoggle--active', n > 0);
      var cnt = btn.querySelector('.best__fcount');
      if (cnt) { cnt.textContent = (n && !dot) ? String(n) : ''; cnt.style.display = n ? '' : 'none'; }
    });
    var reset = el.querySelector('[data-bestreset]');
    if (reset) reset.classList.toggle('best__freset--off', !(view.fRarities.length || view.fTypes.length || crA || view.sortKey));
  }

  /* Aggiorna SOLO le card filtrate (i controlli filtro/ricerca restano intatti,
     così non si perde il focus né lo stato dello slider/chip). */
  function fillCards() {
    var el = host(); var wrap = el && el.querySelector('.best__cards'); if (!wrap) return;
    var list = currentList();
    var isCustom = view.tab === 'custom';
    var q = (view.q || '').toLowerCase();
    var lastIdx = BEST_CR_SCALE.length - 1;
    var crActive = view.fCrMin > 0 || view.fCrMax < lastIdx;
    var minVal = crNum(BEST_CR_SCALE[view.fCrMin]), maxVal = crNum(BEST_CR_SCALE[view.fCrMax]);
    var items = list.filter(function (m) {
      if (q && (m.name || '').toLowerCase().indexOf(q) < 0 && String(m.type || '').toLowerCase().indexOf(q) < 0) return false;
      if (view.fRarities.length && view.fRarities.indexOf(rarityKeyOf(m)) < 0) return false;
      if (view.fTypes.length && view.fTypes.indexOf(m.type || '') < 0) return false;
      if (crActive) { var cn = crNum(m.cr); if (cn >= 0 && (cn < minVal || cn > maxVal)) return false; }
      return true;
    });
    if (!list.length) {
      wrap.innerHTML = '<div class="best__empty">' + (isCustom
        ? 'Nessun mostro personalizzato.<br>Crea con <strong>＋</strong>, oppure salva un Nemico nel bestiario (menu ⋮ → <em>Salva nel bestiario</em>).'
        : 'Bestiario vuoto.') + '</div>';
      return;
    }
    if (!items.length) { wrap.innerHTML = '<div class="best__empty">Nessun risultato con i filtri attuali.</div>'; return; }
    items = sortItems(items);
    var ch = '<div class="best__list">';
    items.forEach(function (m) {
      var on = (m.id === view.curId) ? ' best__card--on' : '';
      var lgd = (rarityKeyOf(m) === 'legendary');
      var typeBadge = m.type ? '<span class="best__corner best__corner--tl">' + esc(m.type) + '</span>' : '';
      var crBadge = (m.cr != null && m.cr !== '') ? '<span class="best__corner best__corner--tr">' + esc(String(m.cr)) + '</span>' : '';
      ch += '<div class="best__card' + on + (lgd ? ' best__card--lgd' : '') + '" data-bestopen="' + esc(m.id) + '" draggable="true" style="' + rarityVars(m) + '">' +
        '<div class="best__photo">' + typeBadge + crBadge + monsterPhotoHtml(m) + '</div>' +
        '<div class="best__name"><span>' + esc(m.name || '(senza nome)') + '</span></div>' +
        '<div class="best__holo"></div><div class="best__shine"></div>' + (lgd ? '<div class="best__lux"></div>' : '') +
        '</div>';
    });
    ch += '</div>';
    wrap.innerHTML = ch;
    fitCardNames(wrap);
  }

  /* Rimpicciolisce il font del nome di una card finché non entra nello spazio
     (2 righe), invece di troncarlo con i puntini. */
  function fitCardNames(wrap) {
    if (!wrap) return;
    var boxes = wrap.querySelectorAll('.best__name');
    for (var i = 0; i < boxes.length; i++) {
      var box = boxes[i], span = box.querySelector('span');
      if (!span) continue;
      span.style.fontSize = '';
      if (box.clientHeight < 2) continue; // non ancora in layout (bestiario nascosto)
      var fs = parseFloat(getComputedStyle(span).fontSize) || 11;
      var minPx = 7, g = 0;
      while (span.scrollHeight > box.clientHeight + 1 && fs > minPx && g < 40) {
        fs -= 0.5; span.style.fontSize = fs + 'px'; g++;
      }
    }
  }

  /* ---- Configuratore attacco (anteprima): righe danno {f,t} + bonus colpire.
     Sola lettura per i mostri ufficiali, editabile per i personalizzati. ---- */
  var BEST_TRASH = '<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>';
  function bestItemDmgs(it) { if (it && Array.isArray(it.atkDmgs)) return it.atkDmgs; if (it && it.atkDmg != null && String(it.atkDmg).trim()) return [{ f: String(it.atkDmg), t: '' }]; return []; }
  function bestEnsureDmgs(it) { if (!Array.isArray(it.atkDmgs)) { it.atkDmgs = (it.atkDmg != null && String(it.atkDmg).trim()) ? [{ f: String(it.atkDmg), t: '' }] : []; if ('atkDmg' in it) delete it.atkDmg; } return it.atkDmgs; }
  function bestHasAtk(it) { if (!it || typeof it !== 'object') return false; if (it.atkHit && String(it.atkHit).trim()) return true; var d = bestItemDmgs(it); for (var i = 0; i < d.length; i++) if (d[i] && d[i].f && String(d[i].f).trim()) return true; return false; }
  function bestHasAtkCfg(it) { return !!(it && typeof it === 'object' && (it.atkHit != null || Array.isArray(it.atkDmgs) || (it.atkDmg != null && String(it.atkDmg).trim()))); }
  function bestAtkConfigHTML(o, key, i, ro) {
    if (key === 'drop') return ''; // i drop (tesoro) non hanno attacchi
    var atkable = (key === 'actions' || key === 'bonusActions' || key === 'legendaryActions' || key === 'reactions');
    if (ro) {
      if (!bestHasAtk(o)) return '';
      var hh = (o.atkHit && String(o.atkHit).trim()) ? '<span class="best__atk-chip">🎯 ' + esc(String(o.atkHit).trim()) + ' al colpire</span>' : '';
      var dd = bestItemDmgs(o).filter(function (d) { return d && d.f && String(d.f).trim(); }).map(function (d) { return '<span class="best__atk-chip">⚔️ ' + esc(String(d.f).trim()) + (d.t && String(d.t).trim() ? ' <em>' + esc(String(d.t).trim()) + '</em>' : '') + '</span>'; }).join('');
      if (!hh && !dd) return '';
      return '<div class="best__atk best__atk--ro">' + hh + dd + '</div>';
    }
    if (bestHasAtkCfg(o)) {
      var rows = bestItemDmgs(o).map(function (d, j) {
        return '<div class="best__atk-drow"><span class="best__atk-ico">⚔️</span><input class="best__atk-in best__atk-in--f" data-bestdmg="' + key + '-' + i + '-' + j + '" data-bestdmgf="f" value="' + esc(d.f || '') + '" placeholder="1d8+3" title="Formula danni"><input class="best__atk-in best__atk-in--t" data-bestdmg="' + key + '-' + i + '-' + j + '" data-bestdmgf="t" value="' + esc(d.t || '') + '" placeholder="tipo (es. fulmine)" title="Tipo di danno"><button class="best__atk-del" data-bestdmgdel="' + key + '-' + i + '-' + j + '" type="button" title="Rimuovi danno">' + BEST_TRASH + '</button></div>';
      }).join('');
      return '<div class="best__atk best__atk--edit"><div class="best__atk-hrow"><span class="best__atk-ico">🎯</span><input class="best__atk-in best__atk-in--hit" data-bestatkhit="' + key + '-' + i + '" value="' + esc(o.atkHit != null ? String(o.atkHit) : '') + '" placeholder="+5" title="Bonus al tiro per colpire"><button class="best__atk-dadd" data-bestdmgadd="' + key + '-' + i + '" type="button" title="Aggiungi un tipo di danno">+ danno</button></div>' + rows + '</div>';
    }
    if (atkable) return '<button class="best__atk-init" data-bestatkinit="' + key + '-' + i + '" type="button">⚔️ Aggiungi attacco</button>';
    return '';
  }

  function renderRightInto(right) {
    var m = getById(view.curId);
    if (!m) {
      right.innerHTML = '<div class="best__placeholder"><div class="best__placeholder-ico">📖</div><div>Seleziona un mostro dalla lista<br>per vederne l\'anteprima.</div></div>';
      return;
    }
    var abils = [['FOR', 'str'], ['DES', 'dex'], ['COS', 'con'], ['INT', 'intl'], ['SAG', 'wis'], ['CAR', 'cha']];
    var abH = abils.map(function (a) {
      var v = m[a[1]] != null ? m[a[1]] : 10;
      return '<div class="best__ab"><div class="best__ab-l">' + a[0] + '</div><div class="best__ab-v">' + esc(v) + '</div><div class="best__ab-m">' + fmtMod(abMod(v)) + '</div></div>';
    }).join('');

    function secList(title, key) {
      var arr = m[key] || []; if (!arr.length) return '';
      var rows = arr.map(function (it, i) {
        var o = (typeof it === 'string') ? { name: it, desc: '' } : (it || {});
        return '<div class="best__pv-item"><div class="best__pv-iname">' + esc(o.name || '') + '</div>' +
          (o.desc ? '<div class="best__pv-idesc">' + esc(o.desc) + '</div>' : '') +
          bestAtkConfigHTML(o, key, i, _ro) + '</div>';
      }).join('');
      return '<div class="best__pv-sec"><div class="best__pv-sectitle">' + title + '</div>' + rows + '</div>';
    }

    var xpVal = (m.xp != null && m.xp !== '') ? m.xp : (window.cmXpForCr ? window.cmXpForCr(m.cr) : null);
    /* Righe meta: tiri salvezza/abilità (solo dove c'è override), sensi +
       percezione passiva, lingue, difese. */
    var SAVE_L = { str: 'FOR', dex: 'DES', con: 'COS', intl: 'INT', wis: 'SAG', cha: 'CAR' };
    var SKILL_N = { atletica: 'Atletica', acrobazia: 'Acrobazia', furtivita: 'Furtività', rapidita: 'Rapidità di Mano', arcano: 'Arcano', indagare: 'Indagare', natura: 'Natura', religione: 'Religione', storia: 'Storia', animali: 'Addest. Animali', intuizione: 'Intuizione', medicina: 'Medicina', percezione: 'Percezione', sopravvivenza: 'Sopravvivenza', inganno: 'Inganno', intimidire: 'Intimidire', intrattenere: 'Intrattenere', persuasione: 'Persuasione' };
    function metaLine(label, val) { return val ? '<div class="best__pv-line"><span class="best__pv-llabel">' + label + '</span> ' + esc(val) + '</div>' : ''; }
    var so = m.savesOverride || {};
    var savesTxt = Object.keys(SAVE_L).filter(function (k) { return so[k] != null && so[k] !== ''; }).map(function (k) { return SAVE_L[k] + ' ' + fmtMod(parseInt(so[k], 10) || 0); }).join(', ');
    var sko = m.skillOverrides || {};
    var skillsTxt = Object.keys(sko).filter(function (k) { return sko[k] != null && sko[k] !== ''; }).map(function (k) { return (SKILL_N[k] || k) + ' ' + fmtMod(parseInt(sko[k], 10) || 0); }).join(', ');
    var sensesTxt = (m.senses || []).map(function (s) { return ((s.type || '') + (s.value ? ' ' + s.value + ' ' + (s.unit || 'm') : '')).trim(); }).filter(Boolean).join(', ');
    var ppVal = (m.passivePerception != null && m.passivePerception !== '') ? m.passivePerception : (10 + abMod(m.wis != null ? m.wis : 10));
    var sensesFull = (sensesTxt ? sensesTxt + ', ' : '') + 'Percezione passiva ' + ppVal;
    var metaH = metaLine('Tiri salvezza', savesTxt) + metaLine('Abilità', skillsTxt) + metaLine('Sensi', sensesFull) +
      metaLine('Lingue', (m.languages || []).join(', ')) +
      metaLine('Resistenze', (m.dmgResist || []).join(', ')) + metaLine('Immunità ai danni', (m.dmgImmune || []).join(', ')) +
      metaLine('Vulnerabilità', (m.dmgVulner || []).join(', ')) + metaLine('Immunità a condizioni', (m.condImmune || []).join(', '));
    if (metaH) metaH = '<div class="best__pv-meta">' + metaH + '</div>';

    var _ro = isOfficialId(m.id);
    var pvPhoto = '<span class="best__pv-photo"' + (_ro ? '' : ' data-bestphoto="' + esc(m.id) + '" title="Carica o cambia foto"') + '>' + monsterPhotoHtml(m) + '</span>';
    var h = '<div class="best__pv">';
    h += '<div class="best__pv-id">' + pvPhoto + '<div>' +
      '<div class="best__pv-name">' + esc(m.name || '(senza nome)') + '</div>' +
      '<div class="best__pv-sub">' + esc(m.size || '') + (m.size && m.type ? ' ' : '') + esc(m.type || '') + (m.alignment ? ', ' + esc(m.alignment) : '') + '</div></div></div>';
    h += '<div class="best__pv-actions">' +
      '<button class="best__btn best__btn--add" data-bestadd="' + esc(m.id) + '" type="button">➕ Aggiungi ai Nemici</button>' +
      (_ro
        ? '<button class="best__btn" data-bestdup="' + esc(m.id) + '" type="button">⧉ Duplica in personalizzati</button>'
        : '<button class="best__btn" data-bestedit="' + esc(m.id) + '" type="button">✏️ Modifica</button>' +
          '<button class="best__btn best__btn--del" data-bestdel="' + esc(m.id) + '" type="button">🗑 Elimina</button>') +
      '</div>';
    h += '<div class="best__pv-stats">' +
      '<span>🛡️ <strong>' + esc(m.ac != null ? m.ac : '—') + '</strong> CA</span>' +
      '<span>❤️ <strong>' + esc(m.hp != null ? m.hp : '—') + '</strong> PF' + (m.hpDice ? ' (' + esc(m.hpDice) + ')' : '') + '</span>' +
      ((m.cr != null && m.cr !== '') ? '<span>CR <strong>' + esc(String(m.cr)) + '</strong></span>' : '') +
      ((xpVal != null && xpVal !== '') ? '<span><strong>' + esc(xpVal) + '</strong> XP</span>' : '') +
      (m.speed ? '<span>🦶 ' + esc(m.speed) + '</span>' : '') +
      '<span>⚡ <strong>' + fmtMod(m.init || 0) + '</strong> Iniz.</span>' +
      '</div>';
    var _curRar = rarityKeyOf(m);
    var _rr = RARITIES[_curRar] || RARITIES.common;
    var rarH;
    if (_ro) {
      rarH = '<div class="best__rarity"><div class="best__rarity-lbl">Rarità</div><div class="best__rarity-ro"><span class="best__rarity-dot" style="--c1:' + _rr.c1 + ';--c2:' + _rr.c2 + '"></span>' + RARITY_NAMES[_curRar] + '</div></div>';
    } else {
      rarH = '<div class="best__rarity"><div class="best__rarity-lbl">Rarità</div><div class="best__rarity-chips">' +
        RARITY_ORDER.map(function (k) {
          var rr = RARITIES[k];
          return '<button class="best__rarity-chip' + (k === _curRar ? ' best__rarity-chip--sel' : '') + '" data-bestrarity="' + k + '" style="--c1:' + rr.c1 + ';--c2:' + rr.c2 + '" title="' + RARITY_NAMES[k] + '"><span class="best__rarity-dot"></span>' + RARITY_NAMES[k] + '</button>';
        }).join('') + '</div></div>';
    }
    h += rarH + '<div class="best__pv-abs">' + abH + '</div>' + metaH;
    h += secList('✨ Tratti', 'traits') + secList('⚔️ Azioni', 'actions') + secList('🎯 Azioni bonus', 'bonusActions') +
      secList('⚡ Reazioni', 'reactions') + secList('👑 Azioni leggendarie', 'legendaryActions') + secList('💰 Drop', 'drop');
    if (m.notes) h += '<div class="best__pv-sec"><div class="best__pv-sectitle">📝 Note</div><div class="best__pv-notes">' + esc(m.notes) + '</div></div>';
    h += '</div>';
    right.innerHTML = h;
  }

  /* ---- Eventi (delegati, limitati a #bestiaryBody) ---- */
  document.addEventListener('click', function (e) {
    var el = host(); if (!el || !el.contains(e.target)) return;

    var tabBtn = e.target.closest('[data-besttab]');
    if (tabBtn) { var _t = tabBtn.dataset.besttab; if (_t !== view.tab) { view.tab = _t; view.curId = null; view.q = ''; view.fRarities = []; view.fTypes = []; view.fCrMin = 0; view.fCrMax = BEST_CR_SCALE.length - 1; view.openFilter = null; view.sortKey = ''; view.sortDir = 'asc'; render(); } return; }

    var fopenBtn = e.target.closest('[data-bestfopen]');
    if (fopenBtn) { var _fk = fopenBtn.dataset.bestfopen; view.openFilter = (view.openFilter === _fk) ? null : _fk; renderLeft(); return; }

    var resetBtn = e.target.closest('[data-bestreset]');
    if (resetBtn) { view.fRarities = []; view.fTypes = []; view.fCrMin = 0; view.fCrMax = BEST_CR_SCALE.length - 1; view.sortKey = ''; view.sortDir = 'asc'; renderLeft(); return; }

    var sortBtn = e.target.closest('[data-bestsort]');
    if (sortBtn) {
      var _sk = sortBtn.dataset.bestsort;
      if (_sk === 'random') {
        /* Click su "Casuale" = (ri)mescola sempre: nuovo ordine casuale. */
        view.sortKey = 'random'; view.randomOrder = {};
        currentList().forEach(function (m) { view.randomOrder[m.id] = Math.random(); });
      } else { view.sortKey = (view.sortKey === _sk) ? '' : _sk; }
      renderLeft(); return;
    }

    var sortDirBtn = e.target.closest('[data-bestsortdir]');
    if (sortDirBtn) { if (!view.sortKey) return; view.sortDir = (view.sortDir === 'desc') ? 'asc' : 'desc'; renderLeft(); return; }

    var frarBtn = e.target.closest('[data-bestfrar]');
    if (frarBtn) { var _rk = frarBtn.dataset.bestfrar; var _ri = view.fRarities.indexOf(_rk); if (_ri >= 0) view.fRarities.splice(_ri, 1); else view.fRarities.push(_rk); frarBtn.classList.toggle('best__fchip--on'); fillCards(); updateFilterChrome(); return; }

    var ftypeBtn = e.target.closest('[data-bestftype]');
    if (ftypeBtn) { var _tk = ftypeBtn.dataset.bestftype; var _ti = view.fTypes.indexOf(_tk); if (_ti >= 0) view.fTypes.splice(_ti, 1); else view.fTypes.push(_tk); ftypeBtn.classList.toggle('best__fchip--on'); fillCards(); updateFilterChrome(); return; }

    var photoBtn = e.target.closest('[data-bestphoto]');
    if (photoBtn) { e.preventDefault(); e.stopPropagation(); pendingPhotoId = photoBtn.dataset.bestphoto; ensureFileInput(); fileInput.click(); return; }

    var rarBtn = e.target.closest('[data-bestrarity]');
    if (rarBtn) { var rm = getById(view.curId); if (rm && !isOfficialId(rm.id)) { rm.rarity = rarBtn.dataset.bestrarity; persist(); render(); } return; }

    /* Configuratore attacco (solo personalizzati): init / aggiungi danno / rimuovi danno. */
    var atkInit = e.target.closest('[data-bestatkinit]');
    if (atkInit) { var mi = getById(view.curId); if (!mi || isOfficialId(mi.id)) return; var ip = atkInit.dataset.bestatkinit.split('-'); var ik = ip[0], ii = parseInt(ip[1]); if (typeof mi[ik][ii] === 'string') mi[ik][ii] = { name: mi[ik][ii], desc: '' }; var iit = mi[ik][ii]; if (iit && typeof iit === 'object') { if (iit.atkHit == null) iit.atkHit = ''; bestEnsureDmgs(iit); if (!iit.atkDmgs.length) iit.atkDmgs.push({ f: '', t: '' }); persist(); renderRight(); var fi = host().querySelector('input[data-bestdmg="' + ik + '-' + ii + '-0"][data-bestdmgf="f"]'); if (fi) fi.focus(); } return; }

    var dmgAddB = e.target.closest('[data-bestdmgadd]');
    if (dmgAddB) { var ma = getById(view.curId); if (!ma || isOfficialId(ma.id)) return; var ap = dmgAddB.dataset.bestdmgadd.split('-'); var ak = ap[0], ai = parseInt(ap[1]); var ait = ma[ak] && ma[ak][ai]; if (ait && typeof ait === 'object') { bestEnsureDmgs(ait).push({ f: '', t: '' }); persist(); renderRight(); var nf = host().querySelector('input[data-bestdmg="' + ak + '-' + ai + '-' + (ait.atkDmgs.length - 1) + '"][data-bestdmgf="f"]'); if (nf) nf.focus(); } return; }

    var dmgDelB = e.target.closest('[data-bestdmgdel]');
    if (dmgDelB) { var mz = getById(view.curId); if (!mz || isOfficialId(mz.id)) return; var zp = dmgDelB.dataset.bestdmgdel.split('-'); var zk = zp[0], zi = parseInt(zp[1]), zj = parseInt(zp[2]); var zit = mz[zk] && mz[zk][zi]; if (zit && typeof zit === 'object') { var zarr = bestEnsureDmgs(zit); if (zarr[zj] != null) zarr.splice(zj, 1); persist(); renderRight(); } return; }

    var openC = e.target.closest('[data-bestopen]');
    if (openC) {
      view.curId = openC.dataset.bestopen;
      /* Aggiorno solo lo stato selezionato delle card e il pannello destro,
         senza ricostruire la colonna sinistra: un render() pieno rigenera
         .best__cards e riporta lo scroll in cima a ogni click. */
      var elO = host(); var wrapO = elO && elO.querySelector('.best__cards');
      var scO = wrapO ? wrapO.scrollTop : 0;
      fillCards();
      if (wrapO) wrapO.scrollTop = scO;
      renderRight();
      return;
    }

    if (e.target.closest('[data-bestnew]')) {
      view.tab = 'custom';
      var nid = window.cmBestiary.upsert(blankMonster());
      view.curId = nid; render();
      var obj = getById(nid);
      if (obj && window.cmOpenMonsterEditor) window.cmOpenMonsterEditor(obj, window.cmBestiary.save);
      return;
    }

    var addB = e.target.closest('[data-bestadd]');
    if (addB) {
      var ma = getById(addB.dataset.bestadd);
      if (ma && window.cmAddEnemyFromMonster) window.cmAddEnemyFromMonster(ma);
      return;
    }

    var dupB = e.target.closest('[data-bestdup]');
    if (dupB) {
      var src = getById(dupB.dataset.bestdup);
      if (src) {
        var nid = window.cmBestiary.upsert(src); // clona con nuovo id nei personalizzati
        view.tab = 'custom'; view.curId = nid; view.q = ''; view.openFilter = null; render();
      }
      return;
    }

    var edB = e.target.closest('[data-bestedit]');
    if (edB) {
      var me = getById(edB.dataset.bestedit);
      if (me && !isOfficialId(me.id) && window.cmOpenMonsterEditor) window.cmOpenMonsterEditor(me, window.cmBestiary.save);
      return;
    }

    var dlB = e.target.closest('[data-bestdel]');
    if (dlB) {
      var id = dlB.dataset.bestdel;
      if (isOfficialId(id)) return;
      var md = getById(id);
      var nm = md ? (md.name || '(senza nome)') : '';
      var doDel = function () { if (view.curId === id) view.curId = null; window.cmBestiary.remove(id); };
      if (typeof window.pgConfirm === 'function') window.pgConfirm('Eliminare "' + nm + '" dal bestiario?\nL\'azione è irreversibile.', doDel, { title: 'Elimina dal bestiario', okLabel: 'Elimina' });
      else if (confirm('Eliminare "' + nm + '" dal bestiario?')) doDel();
      return;
    }
  });

  /* Chiudi il pannello filtri/ordina cliccando fuori dal suo contenuto. Chiusura
     "chirurgica" (rimuove solo il pannello) così la barra di ricerca non viene
     ridisegnata e non perde il focus. */
  function closeBestFilterPanel() {
    if (!view.openFilter) return;
    view.openFilter = null;
    var el = host(); if (!el) return;
    var p = el.querySelector('.best__fpanel'); if (p) p.remove();
    el.querySelectorAll('.best__ftoggle--open').forEach(function (b) { b.classList.remove('best__ftoggle--open'); });
  }
  document.addEventListener('click', function (e) {
    if (!view.openFilter) return;
    var t = e.target;
    if (t && t.closest && (t.closest('.best__fpanel') || t.closest('[data-bestfopen]'))) return;
    closeBestFilterPanel();
  });

  /* Ricerca + slider CR: aggiornano solo le card (focus/stato preservati). */
  document.addEventListener('input', function (e) {
    var el = host(); if (!el || !e.target || !el.contains(e.target)) return;
    if (e.target.id === 'bestSearch') { view.q = e.target.value; fillCards(); return; }
    /* Configuratore attacco (solo personalizzati): salva senza re-render per non perdere il focus. */
    var t = e.target;
    if (t.dataset && t.dataset.bestatkhit !== undefined) { var mh = getById(view.curId); if (!mh || isOfficialId(mh.id)) return; var hp = t.dataset.bestatkhit.split('-'); var hit = mh[hp[0]] && mh[hp[0]][parseInt(hp[1])]; if (hit && typeof hit === 'object') { hit.atkHit = t.value; persist(); } return; }
    if (t.dataset && t.dataset.bestdmg !== undefined) { var md = getById(view.curId); if (!md || isOfficialId(md.id)) return; var dp = t.dataset.bestdmg.split('-'); var dit = md[dp[0]] && md[dp[0]][parseInt(dp[1])]; if (dit && typeof dit === 'object') { var arr = bestEnsureDmgs(dit); var dj = parseInt(dp[2]); while (arr.length <= dj) arr.push({ f: '', t: '' }); arr[dj][t.dataset.bestdmgf] = t.value; persist(); } return; }
    var cr = e.target.closest ? e.target.closest('[data-bestcr]') : null;
    if (cr) {
      var lastIdx = BEST_CR_SCALE.length - 1;
      var val = parseInt(cr.value, 10); if (isNaN(val)) val = 0;
      if (cr.dataset.bestcr === 'min') { if (val > view.fCrMax) val = view.fCrMax; cr.value = val; view.fCrMin = val; }
      else { if (val < view.fCrMin) val = view.fCrMin; cr.value = val; view.fCrMax = val; }
      var fill = document.getElementById('bestCrFill'), lbl = document.getElementById('bestCrVal');
      var lp = (view.fCrMin / lastIdx) * 100, rp = (view.fCrMax / lastIdx) * 100;
      if (fill) { fill.style.left = lp + '%'; fill.style.width = (rp - lp) + '%'; }
      if (lbl) lbl.textContent = BEST_CR_SCALE[view.fCrMin] + ' – ' + BEST_CR_SCALE[view.fCrMax];
      fillCards();
      updateFilterChrome();
      return;
    }
  });

  /* ---- Effetto figurina: tilt 3D + glare + foil olografico che seguono il
     cursore (variabili CSS aggiornate via JS, throttle a 1/frame). ---- */
  var tiltCard = null, tiltRaf = 0, tiltPos = null;
  function applyTilt() {
    tiltRaf = 0;
    if (!tiltCard || !tiltPos || !tiltCard.isConnected) return;
    var r = tiltCard.getBoundingClientRect(); if (!r.width) return;
    var px = Math.max(0, Math.min(1, (tiltPos.x - r.left) / r.width));
    var py = Math.max(0, Math.min(1, (tiltPos.y - r.top) / r.height));
    var s = tiltCard.style;
    s.setProperty('--rx', ((0.5 - py) * 15).toFixed(2) + 'deg');
    s.setProperty('--ry', ((px - 0.5) * 15).toFixed(2) + 'deg');
    s.setProperty('--scale', '1.05');
    s.setProperty('--gx', (px * 100).toFixed(1) + '%');
    s.setProperty('--gy', (py * 100).toFixed(1) + '%');
    s.setProperty('--hx', (px * 36 + 32).toFixed(1) + '%');
    s.setProperty('--hy', (py * 36 + 32).toFixed(1) + '%');
  }
  function resetTilt(card) {
    if (!card) return;
    var s = card.style;
    s.setProperty('--rx', '0deg'); s.setProperty('--ry', '0deg'); s.setProperty('--scale', '1');
    s.setProperty('--gx', '50%'); s.setProperty('--gy', '50%');
    s.setProperty('--hx', '50%'); s.setProperty('--hy', '50%');
  }
  document.addEventListener('mousemove', function (e) {
    var el = host(); if (!el) return;
    var card = (e.target && e.target.closest) ? e.target.closest('.best__card') : null;
    if (card && el.contains(card)) {
      if (card !== tiltCard) { resetTilt(tiltCard); tiltCard = card; }
      tiltPos = { x: e.clientX, y: e.clientY };
      if (!tiltRaf) tiltRaf = requestAnimationFrame(applyTilt);
    } else if (tiltCard) {
      resetTilt(tiltCard); tiltCard = null;
    }
  });

  /* ---- Trascinamento di una carta verso i Nemici: imposta l'id del mostro
     nel dataTransfer; la finestra Personaggi/Nemici lo riceve e lo aggiunge. ---- */
  document.addEventListener('dragstart', function (e) {
    var el = host(); if (!el) return;
    var card = (e.target && e.target.closest) ? e.target.closest('.best__card') : null;
    if (!card || !el.contains(card)) return;
    var id = card.dataset.bestopen; if (!id || !e.dataTransfer) return;
    try {
      e.dataTransfer.setData('application/x-cm-monster', id);
      e.dataTransfer.setData('text/plain', id);
      e.dataTransfer.effectAllowed = 'copy';
    } catch (_) {}
    resetTilt(card); if (tiltCard === card) tiltCard = null;
  });

  /* ---- Stili (iniettati: tutto il codice del bestiario resta esterno) ---- */
  var css =
    /* Due colonne: il corpo finestra diventa una flex-row con due pannelli che
       scrollano in modo indipendente (come #winChars). */
    '#winBestiary{min-width:520px}' +
    '.win__half.best-drop-over{outline:2px dashed var(--gold);outline-offset:-4px;background:rgba(196,154,50,.07);border-radius:8px}' +
    '#bestiaryBody{padding:0;display:flex;flex-direction:row;align-items:stretch;overflow:hidden}' +
    '.best__left{flex:1 1 0;display:flex;flex-direction:column;min-width:0;overflow:hidden;padding:8px;border-right:1px solid var(--border)}' +
    '.best__head{flex:0 0 auto}' +
    '.best__cards{flex:1 1 0;min-height:0;overflow:hidden auto;scrollbar-width:none;-ms-overflow-style:none}' +
    '.best__cards::-webkit-scrollbar{width:0;height:0;display:none}' +
    '.best__right{flex:1 1 0;min-width:0;overflow:hidden auto;scrollbar-width:none;-ms-overflow-style:none;padding:10px 12px}' +
    '.best__right::-webkit-scrollbar{width:0;height:0;display:none}' +
    '.best__placeholder{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;color:var(--muted);font-family:var(--mono);font-size:.74rem;line-height:1.6;padding:20px}' +
    '.best__placeholder-ico{font-size:2rem;opacity:.45}' +
    '.best__card--on{border-color:var(--rare-c2);box-shadow:0 0 0 2px var(--rare-c2) inset,0 10px 26px -8px var(--glow,rgba(0,0,0,.5))}' +
    '.best__tabs{display:flex;gap:3px;margin-bottom:7px;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:3px}' +
    '.best__tab{flex:1;padding:5px 6px;border:none;background:transparent;color:var(--muted);font-family:var(--mono);font-size:.66rem;border-radius:6px;cursor:var(--cur-pointer);transition:all .12s}' +
    '.best__tab:hover{color:var(--text)}' +
    '.best__tab--on{background:var(--bg3);color:var(--gold);font-weight:600}' +
    '.best__rarity-ro{display:inline-flex;align-items:center;gap:6px;font-family:var(--mono);font-size:.7rem;color:var(--text);font-weight:600}' +
    '.best__bar{display:flex;flex-direction:row;align-items:center;gap:6px;margin-bottom:7px}' +
    '.best__filters{margin-bottom:9px}' +
    '.best__fbar{display:flex;gap:6px}' +
    '.best__ftoggle{flex:1;min-width:0;display:flex;align-items:center;justify-content:center;gap:5px;padding:6px 8px;border-radius:6px;border:1px solid var(--border);background:var(--bg);color:var(--muted);font-family:var(--mono);font-size:.66rem;line-height:1;cursor:var(--cur-pointer);transition:all .12s}' +
    '.best__ftoggle:hover{color:var(--text);border-color:var(--bh)}' +
    '.best__ftoggle--active{color:var(--gold);border-color:rgba(196,154,50,.4)}' +
    '.best__ftoggle--open{color:var(--text);background:var(--bg3);border-color:var(--gold)}' +
    '.best__ftoggle-lbl{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.best__fcount{flex:0 0 auto;box-sizing:border-box;min-width:12px;height:12px;display:inline-flex;align-items:center;justify-content:center;padding:0 2px;border-radius:6px;background:var(--gold);color:#1a1a1a;font-size:.46rem;font-weight:700;line-height:1;text-align:center}' +
    '.best__fcount--dot{min-width:0;width:7px;height:7px;padding:0;border-radius:50%}' +
    '.best__fcaret{flex:0 0 auto;font-size:.55rem;opacity:.7;transition:transform .15s}' +
    '.best__ftoggle--open .best__fcaret{transform:rotate(180deg)}' +
    '.best__freset{flex:0 0 auto;width:30px;display:flex;align-items:center;justify-content:center;padding:0;border-radius:6px;border:1px solid var(--border);background:var(--bg);color:var(--muted);font-size:1rem;line-height:1;cursor:var(--cur-pointer);transition:all .12s}' +
    '.best__freset:hover{color:var(--red);border-color:var(--rb)}' +
    '.best__freset--off{opacity:.35;pointer-events:none}' +
    '.best__fpanel{margin-top:7px;padding:9px;border:1px solid var(--border);border-radius:7px;background:var(--bg)}' +
    '.best__dirbtn{margin-top:8px;width:100%;padding:6px 8px;border-radius:6px;border:1px solid var(--border);background:var(--bg3);color:var(--text);font-family:var(--mono);font-size:.62rem;cursor:var(--cur-pointer);transition:all .12s}' +
    '.best__dirbtn:hover{border-color:var(--gold);color:var(--gold)}' +
    '.best__dirbtn--off{opacity:.4;pointer-events:none}' +
    '.best__diric{color:var(--gold);font-weight:700}' +
    '.best__cr-head{display:flex;justify-content:space-between;align-items:center;font-family:var(--mono);font-size:.58rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:7px}' +
    '.best__cr-val{color:var(--gold);font-weight:600;letter-spacing:0;text-transform:none}' +
    '.best__chiprow{display:flex;flex-wrap:wrap;gap:4px}' +
    '.best__fchip{display:inline-flex;align-items:center;gap:5px;padding:3px 8px;border-radius:20px;border:1px solid var(--border);background:var(--bg);color:var(--muted);font-family:var(--mono);font-size:.59rem;line-height:1;cursor:var(--cur-pointer);transition:all .12s}' +
    '.best__fchip:hover{color:var(--text);border-color:var(--bh)}' +
    '.best__fchip--on{color:#fff;background:var(--bg3);border-color:var(--c1,var(--gold))}' +
    '.best__rarity-dot{width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,var(--c1,#888),var(--c2,#bbb));box-shadow:0 0 4px var(--c1,transparent);flex:0 0 auto}' +
    '.best__cr-slider{position:relative;height:20px}' +
    '.best__cr-rail{position:absolute;top:50%;left:0;right:0;height:4px;transform:translateY(-50%);background:var(--border);border-radius:2px}' +
    '.best__cr-fill{position:absolute;top:50%;height:4px;transform:translateY(-50%);background:var(--gold);border-radius:2px}' +
    '.best__cr-thumb{position:absolute;top:0;left:0;width:100%;height:20px;margin:0;padding:0;background:transparent;pointer-events:none;-webkit-appearance:none;appearance:none}' +
    '.best__cr-thumb::-webkit-slider-runnable-track{height:20px;background:transparent;border:none}' +
    '.best__cr-thumb::-webkit-slider-thumb{-webkit-appearance:none;pointer-events:auto;width:14px;height:14px;margin-top:3px;border-radius:50%;background:var(--gold);border:2px solid var(--bg2);box-shadow:0 1px 3px rgba(0,0,0,.55);cursor:var(--cur-pointer)}' +
    '.best__cr-thumb::-moz-range-track{height:20px;background:transparent;border:none}' +
    '.best__cr-thumb::-moz-range-thumb{pointer-events:auto;width:14px;height:14px;border-radius:50%;background:var(--gold);border:2px solid var(--bg2);box-shadow:0 1px 3px rgba(0,0,0,.55);cursor:var(--cur-pointer)}' +
    '.best__search{flex:1;min-width:0;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:6px 9px;color:var(--text);font-family:var(--mono);font-size:.74rem;outline:none;transition:border-color .12s}' +
    '.best__search:focus{border-color:var(--gold)}' +
    '.best__add{flex:0 0 auto;align-self:stretch;display:flex;align-items:center;justify-content:center;padding:0 16px;background:rgba(40,140,60,.1);border:1px solid rgba(40,140,60,.25);border-radius:6px;color:#4a9a5a;font-family:var(--mono);font-size:1.05rem;font-weight:600;line-height:1;cursor:var(--cur-pointer);transition:all .15s}' +
    '.best__add:hover{background:rgba(40,140,60,.2);color:#6fc47f}' +
    '.best__empty{text-align:center;color:var(--muted);font-family:var(--mono);font-size:.72rem;line-height:1.7;padding:26px 12px}' +
    '.best__list{display:grid;grid-template-columns:repeat(auto-fill,132px);gap:8px;align-content:start;justify-content:start}' +
    '.best__corner{position:absolute;top:4px;font-family:var(--mono);font-size:.56rem;font-weight:600;background:rgba(0,0,0,.62);padding:2px 5px;border-radius:5px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;z-index:2}' +
    '.best__corner--tl{left:4px;color:#fff;max-width:calc(100% - 44px)}' +
    '.best__corner--tr{right:4px;color:#fff}' +
    '.best__card{position:relative;display:flex;flex-direction:column;text-align:center;gap:5px;height:176px;padding:7px;background:#000;border:1px solid var(--rare-c1,rgba(255,255,255,.14));border-radius:10px;cursor:var(--cur-pointer);box-sizing:border-box;transform:perspective(800px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) scale(var(--scale,1));transition:transform .13s ease-out,box-shadow .3s ease,border-color .25s ease;box-shadow:0 3px 10px rgba(0,0,0,.45);will-change:transform}' +
    '.best__card:hover{z-index:3;border-color:var(--rare-c2);box-shadow:0 16px 34px -10px var(--glow,rgba(0,0,0,.5)),0 0 0 1px var(--rare-c2) inset}' +
    '.best__shine{position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:5;opacity:0;transition:opacity .3s ease;background:radial-gradient(circle at var(--gx,50%) var(--gy,50%),rgba(255,255,255,.5),rgba(255,255,255,0) 42%);mix-blend-mode:soft-light}' +
    '.best__card:hover .best__shine{opacity:1}' +
    '.best__holo{position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:4;background:linear-gradient(115deg,transparent 28%,var(--rare-c2) 43%,var(--rare-c1) 50%,var(--rare-c2) 57%,transparent 72%);background-size:200% 200%;background-repeat:no-repeat;background-position:var(--hx,50%) var(--hy,50%);opacity:0;mix-blend-mode:color-dodge;transition:opacity .3s ease}' +
    '.best__card:hover .best__holo{opacity:calc((var(--holo,0) * .5 + .03) * 1.21)}' +
    /* === Effetto premium "sbrilluccichio olografico" solo per le carte leggendarie === */
    '.best__card--lgd:hover{box-shadow:0 16px 36px -10px var(--glow),0 0 0 1px var(--rare-c2) inset,0 0 24px -3px var(--glow)}' +
    '.best__lux{position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:6;overflow:hidden;opacity:0;transition:opacity .35s ease}' +
    '.best__card--lgd:hover .best__lux{opacity:1}' +
    '.best__lux::before{content:"";position:absolute;inset:-30%;background:linear-gradient(115deg,transparent 20%,rgba(255,90,170,.55) 33%,rgba(255,220,90,.55) 40%,rgba(120,255,205,.55) 47%,rgba(120,200,255,.55) 54%,rgba(205,120,255,.55) 61%,transparent 74%);background-size:250% 250%;mix-blend-mode:color-dodge;opacity:.5;animation:bestLuxSheen 5.5s ease-in-out infinite;will-change:background-position}' +
    '@keyframes bestLuxSheen{0%{background-position:0% 0%}50%{background-position:100% 100%}100%{background-position:0% 0%}}' +
    '@media (prefers-reduced-motion:reduce){.best__lux::before{animation:none}}' +
    '.best__photo{position:relative;flex:1;width:100%;min-height:0;border-radius:7px;overflow:hidden;background:#0a0a0a;display:flex;align-items:center;justify-content:center}' +
    '.best__photo-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;z-index:1}' +
    '.best__photo-ph{width:40px;height:40px;opacity:.4;stroke:var(--muted);fill:none;stroke-width:1.6}' +
    '.best__photo .best__photo-ph{stroke:#888}' +
    '.best__name{position:relative;z-index:6;flex-shrink:0;height:2.3em;display:flex;align-items:center;justify-content:center;overflow:hidden;font-family:var(--mono);font-size:.7rem;color:#fff;font-weight:600;line-height:1.15}' +
    '.best__name span{display:block;width:100%;word-break:break-word;line-height:1.15}' +
    '.best__meta{font-family:var(--mono);font-size:.56rem;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex-shrink:0}' +
    '.best__pv-head{margin-bottom:8px}' +
    '.best__back{background:transparent;border:1px solid var(--border);border-radius:6px;padding:4px 10px;color:var(--dim);font-family:var(--mono);font-size:.7rem;cursor:var(--cur-pointer);transition:all .12s}' +
    '.best__back:hover{color:var(--gold);border-color:var(--gold)}' +
    '.best__pv{display:flex;flex-direction:column;gap:8px}' +
    '.best__pv-id{display:flex;align-items:center;gap:10px}' +
    '.best__pv-photo{position:relative;width:52px;height:52px;border-radius:8px;overflow:hidden;flex-shrink:0;background:var(--bg2);display:flex;align-items:center;justify-content:center;cursor:pointer;border:1px solid var(--border);transition:border-color .12s}' +
    '.best__pv-photo:hover{border-color:var(--gold)}' +
    '.best__pv-photo .best__photo-ph{width:26px;height:26px}' +
    '.best__pv-name{font-family:var(--mono);font-size:1rem;color:var(--gold);font-weight:700}' +
    '.best__pv-sub{font-family:var(--mono);font-size:.66rem;color:var(--muted);text-transform:capitalize}' +
    '.best__pv-stats{display:flex;flex-wrap:wrap;gap:10px;font-family:var(--mono);font-size:.74rem;color:var(--text);padding:7px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border)}' +
    '.best__pv-stats strong{color:var(--gold)}' +
    '.best__pv-abs{display:flex;gap:5px}' +
    '.best__pv-meta{display:flex;flex-direction:column;gap:3px;padding:6px 0;border-bottom:1px solid var(--border)}' +
    '.best__pv-line{font-family:var(--mono);font-size:.7rem;color:var(--text);line-height:1.45;word-break:break-word}' +
    '.best__pv-llabel{color:var(--gold);font-weight:600}' +
    '.best__rarity{display:flex;flex-direction:column;gap:5px;padding:7px 0;border-bottom:1px solid var(--border)}' +
    '.best__rarity-lbl{font-family:var(--mono);font-size:.62rem;color:var(--gold);text-transform:uppercase;letter-spacing:.05em;font-weight:600}' +
    '.best__rarity-chips{display:flex;flex-wrap:wrap;gap:5px}' +
    '.best__rarity-chip{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:20px;border:1px solid var(--border);background:var(--bg);color:var(--muted);font-family:var(--mono);font-size:.62rem;cursor:var(--cur-pointer);transition:all .12s}' +
    '.best__rarity-chip:hover{border-color:var(--c1);color:var(--text)}' +
    '.best__rarity-chip--sel{border-color:var(--c1);color:#fff;box-shadow:0 0 0 1px var(--c1) inset,0 0 10px -3px var(--c1)}' +
    '.best__rarity-dot{width:9px;height:9px;border-radius:50%;background:linear-gradient(135deg,var(--c1),var(--c2));flex-shrink:0}' +
    '.best__ab{flex:1;text-align:center;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:5px 2px}' +
    '.best__ab-l{font-family:var(--mono);font-size:.56rem;color:var(--muted)}' +
    '.best__ab-v{font-family:var(--mono);font-size:.82rem;color:var(--text);font-weight:700}' +
    '.best__ab-m{font-family:var(--mono);font-size:.66rem;color:var(--gold)}' +
    '.best__pv-sec{display:flex;flex-direction:column;gap:3px}' +
    '.best__pv-sectitle{font-family:var(--mono);font-size:.68rem;color:var(--gold);text-transform:uppercase;letter-spacing:.04em;font-weight:600;border-bottom:1px solid var(--border);padding-bottom:2px;margin-top:4px}' +
    '.best__pv-item{padding:3px 0}' +
    '.best__pv-iname{font-family:var(--mono);font-size:.72rem;color:var(--text);font-weight:600}' +
    '.best__pv-idesc,.best__pv-notes{font-family:var(--mono);font-size:.68rem;color:var(--dim);line-height:1.45;white-space:pre-wrap;word-break:break-word}' +
    '.best__atk{margin-top:5px;display:flex;flex-direction:column;gap:5px;padding:6px 7px;border:1px solid var(--border);border-radius:6px;background:var(--bg)}' +
    '.best__atk--ro{flex-direction:row;flex-wrap:wrap;gap:6px;align-items:center}' +
    '.best__atk-chip{font-family:var(--mono);font-size:.64rem;color:var(--text);background:var(--bg2);border:1px solid var(--border);border-radius:4px;padding:2px 7px}' +
    '.best__atk-chip em{color:var(--gold);font-style:normal}' +
    '.best__atk-ico{font-size:.78rem;line-height:1;flex:0 0 auto}' +
    '.best__atk-hrow,.best__atk-drow{display:flex;align-items:center;gap:5px}' +
    '.best__atk-in{background:var(--bg2);border:1px solid var(--border);border-radius:4px;padding:3px 6px;color:var(--text);font-family:var(--mono);font-size:.66rem;outline:none;min-width:0;transition:border-color .12s}' +
    '.best__atk-in:focus{border-color:var(--gold)}' +
    '.best__atk-in--hit{width:46px;flex:0 0 auto}' +
    '.best__atk-in--f{width:74px;flex:0 0 auto}' +
    '.best__atk-in--t{flex:1 1 auto}' +
    '.best__atk-dadd{margin-left:auto;flex:0 0 auto;white-space:nowrap;background:transparent;border:1px dashed rgba(196,154,50,.4);border-radius:5px;padding:2px 8px;color:var(--gold);font-family:var(--mono);font-size:.58rem;cursor:var(--cur-pointer);transition:all .12s}' +
    '.best__atk-dadd:hover{background:rgba(196,154,50,.1);border-color:var(--gold)}' +
    '.best__atk-del{flex:0 0 auto;display:flex;align-items:center;justify-content:center;width:22px;height:22px;background:transparent;border:none;color:var(--muted);cursor:var(--cur-pointer);padding:0;border-radius:4px;transition:all .12s}' +
    '.best__atk-del:hover{color:var(--red);background:var(--rl)}' +
    '.best__atk-del svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
    '.best__atk-init{margin-top:5px;background:transparent;border:1px dashed var(--border);border-radius:5px;padding:3px 9px;color:var(--muted);font-family:var(--mono);font-size:.6rem;cursor:var(--cur-pointer);transition:all .12s}' +
    '.best__atk-init:hover{border-color:var(--gold);color:var(--gold)}' +
    '.best__pv-actions{display:flex;gap:6px;flex-wrap:wrap;margin:2px 0 11px;border-bottom:1px solid var(--border);padding-bottom:11px}' +
    '.best__btn{flex:1;min-width:100px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:5px 10px;color:var(--text);font-family:var(--mono);font-size:.7rem;line-height:1.25;cursor:var(--cur-pointer);transition:all .12s}' +
    '.best__btn:hover{border-color:var(--gold);color:var(--gold)}' +
    '.best__btn--add{border-color:rgba(196,154,50,.4);color:var(--gold)}' +
    '.best__btn--add:hover{background:rgba(196,154,50,.1)}' +
    '.best__btn--del{color:var(--red);border-color:var(--rb)}' +
    '.best__btn--del:hover{background:var(--rl);color:var(--red)}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---- Render iniziale ---- */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
