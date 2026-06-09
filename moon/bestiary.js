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
        { name: 'Multiattacco', desc: 'L\'aarakocra effettua due attacchi con il Bastone del Vento e può utilizzare Incantare per lanciare Raffica di Vento.' },
        { name: 'Bastone del Vento', desc: 'Attacco con arma da mischia o a distanza: +5 a colpire.\nPortata 1,5 m oppure gittata 36/72 m.\nColpito: 7 (1d8 + 3) danni contundenti più 11 (2d10) danni da fulmine.', atkHit: '+5', atkDmgs: [{ f: '1d8+3', t: 'contundenti' }, { f: '2d10', t: 'fulmine' }] },
        { name: 'Incantare', desc: 'L\'aarakocra lancia uno dei seguenti incantesimi senza componenti materiali, usando la Saggezza come caratteristica da incantatore (CD 13 per i tiri salvezza).\n\nA volontà: Controllo Elementale (Elementalism), Raffica di Vento (Gust of Wind), Mano Magica (Mage Hand), Messaggio (Message).\n\n1 volta al giorno: Fulmine (Lightning Bolt).' }
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
        { name: 'Incantare', desc: 'Il Signore degli Animali lancia uno dei seguenti incantesimi senza componenti materiali, usando la Saggezza come caratteristica da incantatore (CD 20).\n\nA volontà: Amicizia con gli Animali (Animal Friendship), Messaggero Animale (Animal Messenger), Parlare con gli Animali (Speak with Animals).\n\n2 volte al giorno ciascuno: Risveglio (Awaken), Restauro Superiore (Greater Restoration).\n\n1 volta al giorno ciascuno (solo Saggio): Forme Animali (Animal Shapes), Esplosione Solare (Sunburst).' }
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
        { name: 'Incantare', desc: 'L\'arcanaloth lancia uno dei seguenti incantesimi senza componenti materiali, usando l\'Intelligenza come caratteristica da incantatore (CD 17).\n\nA volontà: Alterare Sé (Alter Self), Individuazione del Magico (Detect Magic), Identificare (Identify), Mano Magica (Mage Hand), Prestidigitazione (Prestidigitation).\n\n1 volta al giorno ciascuno: Contattare Altri Piani (Contact Other Plane), Individuazione dei Pensieri (Detect Thoughts), Porta Dimensionale (Dimension Door), Mente Vuota (Mind Blank).' }
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
        { name: 'Magia del Circolo', desc: 'Finché si trova entro 9 metri da almeno altre due megere alleate, l\'arcistrega può lanciare uno dei seguenti incantesimi senza componenti materiali, usando l\'Intelligenza come caratteristica da incantatore (CD 19): Augurio (Augury), Trova Famiglio (Find Familiar), Identificare (Identify), Individuare Oggetto (Locate Object), Scrutare (Scrying), Servitore Invisibile (Unseen Servant).\nDopo aver usato questo tratto, deve completare un riposo lungo prima di poterlo usare di nuovo.' },
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
        { name: 'Rimprovero Infernale (2/Giorno)', desc: 'L\'azer lancia Rimprovero Infernale (Hellish Rebuke) in risposta al normale innesco dell\'incantesimo, usando la stessa caratteristica da incantatore di Incantare.' }
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
      senses: [{ type: 'Scurovisione (non ostacolata dall\'oscurità magica)', value: 36, unit: 'm' }], languages: ['Infernale', 'Telepatia 36 m'],
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
      senses: [{ type: 'Scurovisione (non ostacolata dall\'oscurità magica)', value: 36, unit: 'm' }], languages: ['Infernale', 'Telepatia 36 m'],
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

  function renderLeftInto(left) {
    var isCustom = view.tab === 'custom';
    var lastIdx = BEST_CR_SCALE.length - 1;
    var lp = (view.fCrMin / lastIdx) * 100, rp = (view.fCrMax / lastIdx) * 100;
    var h = '<div class="best__tabs">' +
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
      var typeBadge = m.type ? '<span class="best__corner best__corner--tl">' + esc(m.type) + '</span>' : '';
      var crBadge = (m.cr != null && m.cr !== '') ? '<span class="best__corner best__corner--tr">' + esc(String(m.cr)) + '</span>' : '';
      ch += '<div class="best__card' + on + '" data-bestopen="' + esc(m.id) + '" draggable="true" style="' + rarityVars(m) + '">' +
        '<div class="best__photo">' + typeBadge + crBadge + monsterPhotoHtml(m) + '</div>' +
        '<div class="best__name"><span>' + esc(m.name || '(senza nome)') + '</span></div>' +
        '<div class="best__holo"></div><div class="best__shine"></div>' +
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
    if (openC) { view.curId = openC.dataset.bestopen; render(); return; }

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
    '.best__left{flex:1 1 0;display:flex;flex-direction:column;min-width:0;overflow:hidden auto;scrollbar-width:none;-ms-overflow-style:none;padding:8px;border-right:1px solid var(--border)}' +
    '.best__left::-webkit-scrollbar{width:0;height:0;display:none}' +
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
