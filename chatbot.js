/* ═══════════════════════════════════════════════════════════
   RB Assistant — Chatbot interattivo per riccardobusolo.com
   v3.0 — Draggable + Resizable + Expanded tree
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Albero decisionale ── */
  const TREE = {
    root: {
      msg: 'Ciao! Sono <strong>RB Assistant</strong>, il tuo assistente virtuale. Come posso aiutarti oggi?',
      options: [
        { label: '💼 Scopri i servizi', next: 'servizi' },
        { label: '🔬 Esplora i progetti', next: 'progetti' },
        { label: '📚 Materiali di formazione', next: 'risorse' },
        { label: '🤖 Domande sull\'AI', next: 'faq_ai' },
        { label: '🏢 AI per la tua azienda', next: 'azienda' },
        { label: '✉️ Contattami', next: 'contatti' },
        { label: '🔍 Naviga il sito', next: 'navigazione' },
      ],
    },
    servizi: {
      msg: 'Offro tre tipologie di servizio, ognuna pensata per esigenze diverse. Quale ti interessa?',
      options: [
        { label: '🎓 Formazione AI', next: 'srv_formazione' },
        { label: '⚙️ Affiancamento Personalizzato', next: 'srv_affiancamento' },
        { label: '💻 Vibe Coding', next: 'srv_vibecoding' },
        { label: '🤔 Non so quale fa per me', next: 'srv_quale' },
        { label: '💰 Info su costi e preventivi', next: 'preventivo' },
        { label: '← Torna al menu', next: 'root' },
      ],
    },
    srv_formazione: {
      msg: 'Il percorso di <strong>Formazione AI</strong> è pensato per rendere ogni membro del team autonomo nell\'uso dell\'Intelligenza Artificiale.\n\nCosa imparerai:\n• Prompt engineering e ragionamento multi-step\n• AI applicata a marketing, grafica e contenuti\n• Creazione di agenti AI semi-autonomi\n• Collaborazione uomo-AI ad alta efficienza\n\nÈ rivolto a qualsiasi ruolo aziendale: amministrazione, commerciale, marketing, HR, area tecnica e oltre.',
      options: [
        { label: '📋 Vai alla sezione servizi', action: 'scroll', target: 'servizi' },
        { label: '🕐 Quanto dura il percorso?', next: 'srv_formazione_durata' },
        { label: '👥 Per quante persone?', next: 'srv_formazione_gruppo' },
        { label: '✉️ Richiedi informazioni', next: 'contatti' },
        { label: '← Altri servizi', next: 'servizi' },
      ],
    },
    srv_formazione_durata: {
      msg: 'La durata del percorso è <strong>flessibile</strong> e viene adattata alle esigenze del team.\n\nGeneralmente:\n• Un workshop introduttivo può durare 1-2 giornate\n• Un percorso completo si sviluppa in 4-8 sessioni distribuite su alcune settimane\n• Per esigenze specifiche, possiamo concordare una struttura ad hoc\n\nOgni sessione prevede una parte teorica e una pratica, con esercitazioni su casi reali del tuo contesto lavorativo.',
      options: [
        { label: '✉️ Richiedi un preventivo', next: 'contatti' },
        { label: '← Torna alla formazione', next: 'srv_formazione' },
        { label: '← Menu principale', next: 'root' },
      ],
    },
    srv_formazione_gruppo: {
      msg: 'Il percorso è pensato per essere efficace sia con <strong>piccoli gruppi</strong> (3-5 persone) che con <strong>team più ampi</strong> (fino a 15-20 partecipanti).\n\nPer gruppi numerosi, strutturiamo il percorso con sotto-gruppi tematici per ruolo aziendale, così ogni partecipante riceve formazione rilevante per le proprie attività quotidiane.\n\nSono disponibile anche per percorsi <strong>one-to-one</strong> per manager e figure chiave.',
      options: [
        { label: '✉️ Richiedi informazioni', next: 'contatti' },
        { label: '← Torna alla formazione', next: 'srv_formazione' },
        { label: '← Menu principale', next: 'root' },
      ],
    },
    srv_affiancamento: {
      msg: 'L\'<strong>Affiancamento Personalizzato</strong> parte dall\'analisi concreta dei tuoi processi aziendali.\n\nCome funziona:\n• Analizzo i flussi di lavoro esistenti\n• Identifico le attività con il maggiore potenziale di automazione\n• Definisco un piano d\'azione prioritizzato\n• Lavoro fianco a fianco con il tuo team\n• Trasferisco le competenze per renderti autonomo\n\nL\'obiettivo è che alla fine del percorso tu non abbia più bisogno di me.',
      options: [
        { label: '📋 Vai alla sezione servizi', action: 'scroll', target: 'servizi' },
        { label: '🔎 Come funziona l\'analisi?', next: 'srv_affiancamento_analisi' },
        { label: '✉️ Richiedi informazioni', next: 'contatti' },
        { label: '← Altri servizi', next: 'servizi' },
      ],
    },
    srv_affiancamento_analisi: {
      msg: 'L\'analisi iniziale è la fase più importante. Ecco come si svolge:\n\n<strong>1. Intervista iniziale</strong> — Mappo i processi chiave della tua azienda e i pain point attuali\n\n<strong>2. Osservazione</strong> — Affianco il team per capire i flussi operativi reali, non quelli teorici\n\n<strong>3. Report</strong> — Ti consegno un documento con le opportunità identificate, ordinate per impatto e facilità di implementazione\n\n<strong>4. Piano d\'azione</strong> — Insieme scegliamo da dove partire e definiamo tempi e obiettivi misurabili',
      options: [
        { label: '✉️ Prenota l\'analisi', next: 'contatti' },
        { label: '← Torna all\'affiancamento', next: 'srv_affiancamento' },
        { label: '← Menu principale', next: 'root' },
      ],
    },
    srv_vibecoding: {
      msg: 'Con il <strong>Vibe Coding</strong> chiunque può creare strumenti software usando solo il linguaggio naturale — zero programmazione.\n\nCosa imparerai a costruire:\n• Strumenti di automazione interni su misura\n• Script per elaborare dati e generare report\n• Piccole applicazioni web per il tuo team\n• Connettori tra strumenti già in uso (CRM, email, calendar)\n• Agenti AI personalizzati\n\nNessuna conoscenza di programmazione richiesta.',
      options: [
        { label: '📋 Vai alla sezione servizi', action: 'scroll', target: 'servizi' },
        { label: '🛠️ Esempi concreti?', next: 'srv_vibecoding_esempi' },
        { label: '✉️ Richiedi informazioni', next: 'contatti' },
        { label: '← Altri servizi', next: 'servizi' },
      ],
    },
    srv_vibecoding_esempi: {
      msg: 'Ecco alcuni esempi reali di cosa puoi costruire con il Vibe Coding:\n\n• <strong>Dashboard automatica</strong> che raccoglie dati da più fonti e genera un report settimanale\n• <strong>Bot email</strong> che classifica e pre-risponde ai messaggi in arrivo\n• <strong>Generatore di preventivi</strong> che calcola e formatta offerte partendo da un foglio di calcolo\n• <strong>Assistente interno</strong> che risponde alle domande dei colleghi basandosi sulla documentazione aziendale\n• <strong>Automatismo CRM</strong> che aggiorna i contatti e invia follow-up programmati\n\nTutto creato descrivendo a parole ciò che ti serve.',
      options: [
        { label: '✉️ Voglio saperne di più', next: 'contatti' },
        { label: '← Torna al Vibe Coding', next: 'srv_vibecoding' },
        { label: '← Menu principale', next: 'root' },
      ],
    },
    srv_quale: {
      msg: 'Nessun problema, ti aiuto a capire! Rispondi a questa domanda:\n\n<strong>Qual è il tuo obiettivo principale?</strong>',
      options: [
        { label: 'Voglio che il mio team impari a usare l\'AI', next: 'srv_quale_formazione' },
        { label: 'Ho processi lenti e voglio ottimizzarli', next: 'srv_quale_affiancamento' },
        { label: 'Vorrei creare strumenti software senza programmare', next: 'srv_quale_vibecoding' },
        { label: 'Ho bisogno di tutto un po\'', next: 'srv_quale_tutto' },
        { label: '← Torna ai servizi', next: 'servizi' },
      ],
    },
    srv_quale_formazione: {
      msg: 'Ti consiglio il percorso di <strong>Formazione AI</strong>. È pensato esattamente per portare il tuo team da zero a operativo con l\'Intelligenza Artificiale, indipendentemente dal livello tecnico di partenza.',
      options: [{ label: '🎓 Approfondisci la Formazione', next: 'srv_formazione' },{ label: '✉️ Contattami', next: 'contatti' },{ label: '← Menu principale', next: 'root' }],
    },
    srv_quale_affiancamento: {
      msg: 'Il servizio che fa per te è l\'<strong>Affiancamento Personalizzato</strong>. Parto analizzando i tuoi processi reali, identifico i colli di bottiglia e costruisco insieme a te un percorso per automatizzarli con l\'AI.',
      options: [{ label: '⚙️ Approfondisci l\'Affiancamento', next: 'srv_affiancamento' },{ label: '✉️ Contattami', next: 'contatti' },{ label: '← Menu principale', next: 'root' }],
    },
    srv_quale_vibecoding: {
      msg: 'Il <strong>Vibe Coding</strong> è perfetto per te. Ti insegno a creare i tuoi strumenti software usando solo il linguaggio naturale, senza dipendere da sviluppatori o dall\'IT.',
      options: [{ label: '💻 Approfondisci il Vibe Coding', next: 'srv_vibecoding' },{ label: '✉️ Contattami', next: 'contatti' },{ label: '← Menu principale', next: 'root' }],
    },
    srv_quale_tutto: {
      msg: 'In quel caso il mio suggerimento è partire con un <strong>Affiancamento Personalizzato</strong> per mappare le priorità, e poi integrare formazione e vibe coding dove servono di più.\n\nScrivimi e ne parliamo — ogni azienda ha esigenze diverse e preferisco costruire un percorso su misura.',
      options: [{ label: '✉️ Contattami', next: 'contatti' },{ label: '← Torna ai servizi', next: 'servizi' },{ label: '← Menu principale', next: 'root' }],
    },
    preventivo: {
      msg: 'Ogni progetto è diverso, per questo preferisco valutare le esigenze specifiche prima di proporre un preventivo.\n\nCompila il <strong>modulo di contatto</strong> descrivendo brevemente:\n• Il tuo ruolo e settore aziendale\n• L\'obiettivo che vuoi raggiungere\n• Il numero di persone coinvolte (se applicabile)\n\nTi risponderò con una proposta personalizzata.',
      options: [{ label: '✉️ Vai al modulo contatti', action: 'scroll', target: 'contatti' },{ label: '← Torna ai servizi', next: 'servizi' },{ label: '← Menu principale', next: 'root' }],
    },

    /* ═══════════ PROGETTI ═══════════ */
    progetti: {
      msg: 'I miei progetti sono organizzati in tre aree. Quale ti interessa esplorare?',
      options: [
        { label: '🎓 Progetti di Formazione', next: 'proj_formazione' },
        { label: '🛠️ Strumenti', next: 'proj_strumenti' },
        { label: '📝 Articoli', next: 'proj_articoli' },
        { label: '🔬 Vai alla pagina Progetti', action: 'link', target: 'progetti.html' },
        { label: '← Menu principale', next: 'root' },
      ],
    },
    proj_formazione: {
      msg: '<strong>Progetti di Formazione</strong>\n\nCorsi per aziende, workshop e materiali didattici per imparare a usare l\'AI in modo pratico e consapevole.\n\nI progetti in questa sezione includono:\n• <strong>Dall\'AI Generativa agli Agenti Autonomi</strong> — percorso completo dalla comprensione degli LLM alla creazione di agenti AI\n• <strong>Prompt Engineering Masterclass</strong> — workshop intensivo sulle tecniche avanzate\n• <strong>AI per Team Non-Tecnici</strong> — formazione su misura per ruoli non tecnici',
      options: [
        { label: '🔬 Vai alla sezione Formazione', action: 'link', target: 'progetti.html#formazione' },
        { label: '💼 Info sui servizi di formazione', next: 'srv_formazione' },
        { label: '✉️ Richiedi informazioni', next: 'contatti' },
        { label: '← Torna ai progetti', next: 'progetti' },
        { label: '← Menu principale', next: 'root' },
      ],
    },
    proj_strumenti: {
      msg: '<strong>Strumenti AI</strong>\n\nDashboard, automazioni e demo tecniche costruite con l\'Intelligenza Artificiale. Soluzioni concrete per problemi reali.\n\nStrumenti disponibili:\n• <strong>PixelForge — Image Converter</strong> — converti, ridimensiona e comprimi immagini direttamente nel browser\n\nIn arrivo:\n• Dashboard Analytics con AI\n• Neural Network Trainer',
      options: [
        { label: '🖼️ Prova PixelForge', next: 'proj_pixelforge' },
        { label: '🔬 Vai alla sezione Strumenti', action: 'link', target: 'progetti.html#strumenti' },
        { label: '← Torna ai progetti', next: 'progetti' },
        { label: '← Menu principale', next: 'root' },
      ],
    },
    proj_pixelforge: {
      msg: '<strong>PixelForge — Image Converter</strong>\n\nUn convertitore di immagini gratuito che funziona interamente nel browser:\n\n• Converti tra <strong>PNG, JPG e WebP</strong>\n• <strong>Ridimensiona</strong> con larghezza e altezza personalizzate\n• <strong>Comprimi</strong> regolando la qualità dell\'output\n• Confronta dimensione prima e dopo la conversione\n• <strong>Zero upload</strong> — tutto avviene localmente, i tuoi file non lasciano mai il tuo dispositivo\n\nÈ stato costruito interamente con tecniche di Vibe Coding.',
      options: [
        { label: '🚀 Apri PixelForge', action: 'link', target: 'strumenti/pixelforge/' },
        { label: '💻 Cos\'è il Vibe Coding?', next: 'srv_vibecoding' },
        { label: '← Torna agli strumenti', next: 'proj_strumenti' },
        { label: '← Menu principale', next: 'root' },
      ],
    },
    proj_articoli: {
      msg: '<strong>Articoli</strong>\n\nApprofondimenti tecnici e guide divulgative sull\'Intelligenza Artificiale: trend, strategie, tutorial e riflessioni sul futuro.\n\nIn arrivo:\n• <strong>AI nel 2026: Lo Stato dell\'Arte</strong> — analisi completa su dove si trova l\'AI oggi\n• <strong>Perché Ogni Azienda Ha Bisogno di una Strategia AI</strong> — guida pratica alla trasformazione\n• <strong>Vibe Coding: Creare Software Senza Codice</strong> — tutorial passo-passo',
      options: [
        { label: '📝 Vai alla sezione Articoli', action: 'link', target: 'progetti.html#articoli' },
        { label: '📚 Scarica i PDF gratuiti', next: 'risorse' },
        { label: '← Torna ai progetti', next: 'progetti' },
        { label: '← Menu principale', next: 'root' },
      ],
    },

    risorse: {
      msg: 'Nella sezione <strong>Materiali di Formazione</strong> trovi i PDF dei miei corsi teorici, consultabili e scaricabili gratuitamente. Quale ti interessa?',
      options: [
        { label: '📖 Storia dell\'Intelligenza Artificiale', next: 'res_storia' },
        { label: '🧠 Fondamenti di Intelligenza Artificiale', next: 'res_fondamenti' },
        { label: '✍️ Tecniche di Prompt Engineering', next: 'res_prompt' },
        { label: '📚 Vai alla sezione risorse', action: 'scroll', target: 'risorse' },
        { label: '← Menu principale', next: 'root' },
      ],
    },
    res_storia: {
      msg: '<strong>Storia dell\'Intelligenza Artificiale</strong> (PDF — 1.9 MB)\n\nUn viaggio dalle origini ai giorni nostri: dal Perceptron di Rosenblatt negli anni \'50 alle reti neurali profonde e ai Large Language Model. Perfetto per capire da dove arriva tutto ciò che usiamo oggi.',
      options: [{ label: '📥 Apri il PDF', action: 'link', target: 'pdf/Storia dell%27Intelligenza Artificiale - Riccardo Busolo.pdf' },{ label: '← Altre risorse', next: 'risorse' },{ label: '← Menu principale', next: 'root' }],
    },
    res_fondamenti: {
      msg: '<strong>Fondamenti di Intelligenza Artificiale</strong> (PDF — 778 KB)\n\nI concetti chiave spiegati in modo accessibile: machine learning, deep learning, reti neurali, elaborazione del linguaggio naturale. Le basi teoriche che ogni professionista dovrebbe conoscere.',
      options: [{ label: '📥 Apri il PDF', action: 'link', target: 'pdf/Fondamenti di Intelligenza Artificiale - Riccardo Busolo.pdf' },{ label: '← Altre risorse', next: 'risorse' },{ label: '← Menu principale', next: 'root' }],
    },
    res_prompt: {
      msg: '<strong>Tecniche di Prompt Engineering</strong> (PDF — 827 KB)\n\nCome comunicare efficacemente con i modelli AI: strutturazione dei prompt, chain-of-thought, few-shot learning, gestione del contesto. Tecniche pratiche che puoi applicare immediatamente.',
      options: [{ label: '📥 Apri il PDF', action: 'link', target: 'pdf/Tecniche di Prompt Engineering - Riccardo Busolo.pdf' },{ label: '← Altre risorse', next: 'risorse' },{ label: '← Menu principale', next: 'root' }],
    },
    azienda: {
      msg: 'L\'AI può trasformare praticamente ogni area della tua azienda. In che settore operi?',
      options: [
        { label: '🏪 Commercio / Retail', next: 'az_commercio' },
        { label: '🏭 Manifattura / Produzione', next: 'az_manifattura' },
        { label: '💼 Servizi professionali', next: 'az_servizi' },
        { label: '🏥 Sanità / Benessere', next: 'az_sanita' },
        { label: '📊 Altro settore', next: 'az_altro' },
        { label: '← Menu principale', next: 'root' },
      ],
    },
    az_commercio: {
      msg: 'Nel <strong>commercio e retail</strong>, l\'AI può essere un grande alleato:\n\n• <strong>Gestione inventario</strong> — previsione della domanda e riordino automatico\n• <strong>Customer service</strong> — chatbot e risposte automatiche\n• <strong>Marketing</strong> — campagne personalizzate, contenuti generati, analisi dei trend\n• <strong>Pricing dinamico</strong> — adattamento automatico dei prezzi\n• <strong>Analisi vendite</strong> — report automatici e insight sui pattern di acquisto',
      options: [{ label: '✉️ Parliamone', next: 'contatti' },{ label: '⚙️ Scopri l\'affiancamento', next: 'srv_affiancamento' },{ label: '← Altri settori', next: 'azienda' },{ label: '← Menu principale', next: 'root' }],
    },
    az_manifattura: {
      msg: 'Nella <strong>manifattura e produzione</strong>, l\'AI può intervenire su:\n\n• <strong>Ottimizzazione processi</strong> — identificare inefficienze e colli di bottiglia\n• <strong>Manutenzione predittiva</strong> — anticipare guasti e ridurre i fermi macchina\n• <strong>Controllo qualità</strong> — ispezione visiva automatizzata\n• <strong>Pianificazione produzione</strong> — schedulazione intelligente\n• <strong>Documentazione</strong> — generazione automatica di report e procedure',
      options: [{ label: '✉️ Parliamone', next: 'contatti' },{ label: '⚙️ Scopri l\'affiancamento', next: 'srv_affiancamento' },{ label: '← Altri settori', next: 'azienda' },{ label: '← Menu principale', next: 'root' }],
    },
    az_servizi: {
      msg: 'Nei <strong>servizi professionali</strong> (consulenza, studi, agenzie), l\'AI può potenziare:\n\n• <strong>Automazione documenti</strong> — contratti, report, proposte generate in automatico\n• <strong>Gestione email</strong> — classificazione, bozze di risposta, follow-up\n• <strong>Ricerca e analisi</strong> — sintesi di documenti, normative, trend di mercato\n• <strong>Project management</strong> — task assignment e tracking automatizzato\n• <strong>CRM</strong> — aggiornamento automatico dei contatti e pipeline',
      options: [{ label: '✉️ Parliamone', next: 'contatti' },{ label: '⚙️ Scopri l\'affiancamento', next: 'srv_affiancamento' },{ label: '← Altri settori', next: 'azienda' },{ label: '← Menu principale', next: 'root' }],
    },
    az_sanita: {
      msg: 'Nella <strong>sanità e nel benessere</strong>, l\'AI può supportare:\n\n• <strong>Gestione appuntamenti</strong> — scheduling intelligente e reminder automatici\n• <strong>Documentazione clinica</strong> — trascrizione e sintesi dei referti\n• <strong>Comunicazione pazienti</strong> — risposte automatiche a domande frequenti\n• <strong>Amministrazione</strong> — fatturazione, gestione pratiche, archiviazione\n• <strong>Formazione interna</strong> — aggiornamento continuo del personale',
      options: [{ label: '✉️ Parliamone', next: 'contatti' },{ label: '⚙️ Scopri l\'affiancamento', next: 'srv_affiancamento' },{ label: '← Altri settori', next: 'azienda' },{ label: '← Menu principale', next: 'root' }],
    },
    az_altro: {
      msg: 'Qualunque sia il tuo settore, l\'AI può quasi certamente migliorare i tuoi processi. Le aree di intervento più comuni sono:\n\n• Automazione delle attività ripetitive\n• Generazione e gestione di contenuti\n• Analisi dei dati e reportistica\n• Comunicazione interna ed esterna\n• Formazione del personale\n\nIl modo migliore per capire dove intervenire è una consulenza iniziale.',
      options: [{ label: '✉️ Richiedi una consulenza', next: 'contatti' },{ label: '⚙️ Scopri l\'affiancamento', next: 'srv_affiancamento' },{ label: '← Menu principale', next: 'root' }],
    },
    faq_ai: {
      msg: 'Ecco le domande più frequenti sull\'Intelligenza Artificiale. Quale ti interessa?',
      options: [
        { label: 'Cos\'è l\'Intelligenza Artificiale?', next: 'faq_cosai' },
        { label: 'Cosa sono gli LLM?', next: 'faq_llm' },
        { label: 'Cos\'è il Prompt Engineering?', next: 'faq_prompt' },
        { label: 'L\'AI sostituirà il mio lavoro?', next: 'faq_lavoro' },
        { label: 'È difficile imparare a usare l\'AI?', next: 'faq_difficile' },
        { label: 'L\'AI è sicura per la mia azienda?', next: 'faq_sicurezza' },
        { label: '← Menu principale', next: 'root' },
      ],
    },
    faq_cosai: {
      msg: 'L\'<strong>Intelligenza Artificiale</strong> è un insieme di tecnologie che permettono ai computer di svolgere compiti che normalmente richiedono intelligenza umana: comprendere il linguaggio, riconoscere immagini, prendere decisioni, generare contenuti.\n\nNon è un\'entità singola ma un campo vastissimo che include machine learning, deep learning, reti neurali, elaborazione del linguaggio naturale e molto altro.',
      options: [{ label: '📚 Scarica il PDF sui Fondamenti', action: 'link', target: 'pdf/Fondamenti di Intelligenza Artificiale - Riccardo Busolo.pdf' },{ label: '← Altre domande', next: 'faq_ai' },{ label: '← Menu principale', next: 'root' }],
    },
    faq_llm: {
      msg: 'I <strong>Large Language Model (LLM)</strong> sono modelli di AI addestrati su enormi quantità di testo per comprendere e generare linguaggio naturale.\n\nEsempi noti: ChatGPT, Claude, Gemini, LLaMA. Funzionano prevedendo la parola più probabile successiva in una sequenza, ma la scala dei dati e dei parametri li rende capaci di ragionamento, sintesi, traduzione e molto altro.',
      options: [{ label: '🎓 Scopri la formazione AI', next: 'srv_formazione' },{ label: '← Altre domande', next: 'faq_ai' },{ label: '← Menu principale', next: 'root' }],
    },
    faq_prompt: {
      msg: 'Il <strong>Prompt Engineering</strong> è l\'arte di comunicare in modo efficace con i modelli AI. Un buon prompt può fare la differenza tra una risposta generica e un risultato preciso e utile.\n\nTecniche avanzate:\n• Strutturazione con ruoli e contesto\n• Ragionamento multi-step (chain-of-thought)\n• Few-shot learning con esempi\n• Gestione del contesto e della memoria',
      options: [{ label: '📚 Scarica il PDF', action: 'link', target: 'pdf/Tecniche di Prompt Engineering - Riccardo Busolo.pdf' },{ label: '🎓 Scopri la formazione', next: 'srv_formazione' },{ label: '← Altre domande', next: 'faq_ai' }],
    },
    faq_lavoro: {
      msg: 'L\'AI non è qui per sostituire le persone, ma per <strong>potenziare le loro capacità</strong>. I ruoli più a rischio sono quelli ripetitivi e prevedibili, mentre i lavori che richiedono creatività, empatia e giudizio critico diventano ancora più preziosi.\n\nChi sa collaborare con l\'AI sarà più competitivo di chi la ignora.',
      options: [{ label: '🎓 Scopri la formazione', next: 'srv_formazione' },{ label: '← Altre domande', next: 'faq_ai' },{ label: '← Menu principale', next: 'root' }],
    },
    faq_difficile: {
      msg: 'Assolutamente <strong>no</strong>. I moderni strumenti AI sono progettati per interagire in linguaggio naturale: parli con loro come parleresti con un collega.\n\nNei miei corsi, persone senza alcuna esperienza tecnica riescono a creare agenti AI funzionanti già dalla prima settimana. Il segreto è avere un metodo e sapere cosa chiedere.',
      options: [{ label: '🎓 Scopri la formazione', next: 'srv_formazione' },{ label: '💻 Scopri il Vibe Coding', next: 'srv_vibecoding' },{ label: '← Altre domande', next: 'faq_ai' }],
    },
    faq_sicurezza: {
      msg: 'La sicurezza è un tema fondamentale:\n\n• <strong>Dati sensibili</strong> — Non condividere dati riservati con AI pubbliche senza precauzioni\n• <strong>Allucinazioni</strong> — I modelli possono generare info errate: serve sempre verifica umana\n• <strong>Privacy</strong> — Esistono configurazioni enterprise che garantiscono la riservatezza\n\nNei miei percorsi dedico sempre una sezione alla sicurezza e alle best practice.',
      options: [{ label: '🎓 Scopri la formazione', next: 'srv_formazione' },{ label: '⚙️ Scopri l\'affiancamento', next: 'srv_affiancamento' },{ label: '← Altre domande', next: 'faq_ai' },{ label: '← Menu principale', next: 'root' }],
    },
    contatti: {
      msg: 'Puoi contattarmi compilando il <strong>modulo nella sezione Contatti</strong> del sito. Descrivi brevemente il tuo progetto o la tua richiesta e ti risponderò il prima possibile.\n\nSono disponibile per consulenze in presenza nell\'area di Padova e dintorni, e da remoto ovunque.',
      options: [
        { label: '✉️ Vai al modulo contatti', action: 'scroll', target: 'contatti' },
        { label: '📍 Vedi area di copertura', action: 'scroll', target: 'contatti' },
        { label: '🔒 Leggi la Privacy Policy', action: 'link', target: 'policy.html#privacy' },
        { label: '← Menu principale', next: 'root' },
      ],
    },
    navigazione: {
      msg: 'Posso portarti direttamente alla sezione che ti interessa. Dove vuoi andare?',
      options: [
        { label: '🏠 Torna in cima', action: 'scroll', target: 'hero' },
        { label: '💼 Servizi', action: 'scroll', target: 'servizi' },
        { label: '🔬 Progetti AI', action: 'scroll', target: 'progetti' },
        { label: '🎓 Progetti Formazione', action: 'link', target: 'progetti.html#formazione' },
        { label: '🛠️ Progetti Strumenti', action: 'link', target: 'progetti.html#strumenti' },
        { label: '📝 Progetti Articoli', action: 'link', target: 'progetti.html#articoli' },
        { label: '📚 Materiali di formazione', action: 'scroll', target: 'risorse' },
        { label: '✉️ Contatti', action: 'scroll', target: 'contatti' },
        { label: '🔒 Privacy & Cookie Policy', action: 'link', target: 'policy.html#privacy' },
        { label: '← Menu principale', next: 'root' },
      ],
    },
  };

  const IS_DESKTOP = window.matchMedia('(min-width:521px)').matches;
  const MIN_W = 360, MIN_H = 400;

  /* ── CSS ── */
  const S = document.createElement('style');
  S.textContent = `
    .rb-chat-btn{position:fixed;bottom:32px;right:32px;z-index:100;width:64px;height:64px;border-radius:50%;border:none;background:var(--cyan,#00e0d0);color:#08080e;cursor:pointer;box-shadow:0 4px 24px rgba(0,224,208,.35);transition:all .4s cubic-bezier(.16,1,.3,1);display:flex;align-items:center;justify-content:center;overflow:hidden}
    .rb-chat-btn.pulse{animation:rbPulse 2s ease-in-out infinite}
    @keyframes rbPulse{0%,100%{box-shadow:0 4px 24px rgba(0,224,208,.35)}30%{box-shadow:0 0 0 0 rgba(0,224,208,.5),0 4px 28px rgba(0,224,208,.5)}60%{box-shadow:0 0 0 20px rgba(0,224,208,0),0 4px 36px rgba(0,224,208,.6)}}
    .rb-chat-btn:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,224,208,.45)}
    .rb-chat-btn:active{transform:translateY(0) scale(.94);transition-duration:.1s}
    .rb-chat-btn .rb-icon{position:absolute;transition:all .4s cubic-bezier(.16,1,.3,1)}
    .rb-chat-btn .rb-icon-chat{opacity:1;transform:scale(1)}
    .rb-chat-btn .rb-icon-close{opacity:0;transform:scale(.5) rotate(-90deg)}
    .rb-chat-btn.open .rb-icon-chat{opacity:0;transform:scale(.5) rotate(90deg)}
    .rb-chat-btn.open .rb-icon-close{opacity:1;transform:scale(1) rotate(0deg)}

    .rb-chat{position:fixed;z-index:100;background:#131316;border:1px solid rgba(180,180,190,.1);border-radius:20px;display:flex;flex-direction:column;opacity:0;transform:translateY(20px) scale(.94);pointer-events:none;transition:opacity .4s cubic-bezier(.16,1,.3,1),transform .4s cubic-bezier(.16,1,.3,1);box-shadow:0 24px 64px rgba(0,0,0,.5),0 0 0 1px rgba(0,224,208,.04);overflow:visible}
    .rb-chat.open{opacity:1;transform:translateY(0) scale(1);pointer-events:all}
    .rb-chat.dragging,.rb-chat.resizing{transition:none!important}

    .rb-chat__header{display:flex;align-items:center;gap:12px;padding:14px 22px;border-bottom:1px solid rgba(180,180,190,.06);flex-shrink:0;background:rgba(21,21,24,.6);border-radius:20px 20px 0 0;user-select:none}
    .rb-chat__drag{cursor:grab;flex:1;display:flex;align-items:center;gap:12px}
    .rb-chat__drag:active{cursor:grabbing}
    .rb-chat__avatar{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,var(--cyan,#00e0d0),#4facfe);display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .rb-chat__avatar svg{width:18px;height:18px;stroke:#08080e;fill:none;stroke-width:2.2}
    .rb-chat__htext{flex:1}
    .rb-chat__name{font-family:'Outfit',sans-serif;font-size:.92rem;font-weight:600;color:#e6e6ea}
    .rb-chat__status{font-family:'JetBrains Mono',monospace;font-size:.63rem;color:var(--cyan,#00e0d0);letter-spacing:.04em;margin-top:1px}
    .rb-chat__restart{background:none;border:1px solid rgba(180,180,190,.1);border-radius:8px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#7a7a8e;transition:all .3s;flex-shrink:0}
    .rb-chat__restart:hover{border-color:rgba(0,224,208,.3);color:#00e0d0}
    .rb-chat__restart svg{width:14px;height:14px}
    .rb-chat__close{display:none;background:none;border:1px solid rgba(180,180,190,.1);border-radius:8px;width:32px;height:32px;align-items:center;justify-content:center;cursor:pointer;color:#7a7a8e;transition:all .3s;flex-shrink:0}
    .rb-chat__close:hover{border-color:rgba(0,224,208,.3);color:#00e0d0}
    .rb-chat__close svg{width:14px;height:14px}

    .rb-chat__body{flex:1;overflow-y:auto;padding:20px 22px;display:flex;flex-direction:column;gap:10px;scrollbar-width:thin;scrollbar-color:rgba(0,224,208,.12) transparent}

    .rb-chat__msg{max-width:90%;padding:14px 18px;border-radius:16px 16px 16px 4px;background:#1a1a1e;font-family:'Outfit',sans-serif;font-size:.86rem;color:#9a9a9e;line-height:1.7;font-weight:300;animation:rbIn .3s cubic-bezier(.16,1,.3,1) both}
    .rb-chat__msg strong{color:#e6e6ea;font-weight:600}
    .rb-chat__msg--user{align-self:flex-end;border-radius:16px 16px 4px 16px;background:rgba(0,224,208,.07);border:1px solid rgba(0,224,208,.1);color:#e6e6ea;font-weight:400}
    @keyframes rbIn{from{opacity:0;transform:translateY(10px)}}

    .rb-chat__opts{display:flex;flex-direction:column;gap:5px;animation:rbIn .3s cubic-bezier(.16,1,.3,1) .08s both}
    .rb-chat__opt{background:transparent;border:1px solid rgba(180,180,190,.1);border-radius:10px;padding:11px 16px;color:#e6e6ea;font-family:'Outfit',sans-serif;font-size:.84rem;font-weight:400;cursor:pointer;text-align:left;transition:all .25s cubic-bezier(.16,1,.3,1);line-height:1.4}
    .rb-chat__opt:hover{background:rgba(0,224,208,.06);border-color:rgba(0,224,208,.2);color:#00e0d0}
    .rb-chat__opt:active{transform:scale(.97);transition-duration:.08s}

    .rb-chat__typing{display:flex;gap:5px;padding:14px 18px;max-width:75px;background:#1a1a1e;border-radius:16px 16px 16px 4px}
    .rb-chat__dot{width:6px;height:6px;border-radius:50%;background:#7a7a8e;animation:rbDot 1.2s ease-in-out infinite}
    .rb-chat__dot:nth-child(2){animation-delay:.15s}
    .rb-chat__dot:nth-child(3){animation-delay:.3s}
    @keyframes rbDot{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-5px)}}

    /* ── Resize handles (desktop only) ── */
    .rb-resize{position:absolute;z-index:2}
    .rb-resize--n{top:-4px;left:12px;right:12px;height:8px;cursor:ns-resize}
    .rb-resize--s{bottom:-4px;left:12px;right:12px;height:8px;cursor:ns-resize}
    .rb-resize--e{right:-4px;top:12px;bottom:12px;width:8px;cursor:ew-resize}
    .rb-resize--w{left:-4px;top:12px;bottom:12px;width:8px;cursor:ew-resize}
    .rb-resize--ne{top:-4px;right:-4px;width:14px;height:14px;cursor:nesw-resize}
    .rb-resize--nw{top:-4px;left:-4px;width:14px;height:14px;cursor:nwse-resize}
    .rb-resize--se{bottom:-4px;right:-4px;width:14px;height:14px;cursor:nwse-resize}
    .rb-resize--sw{bottom:-4px;left:-4px;width:14px;height:14px;cursor:nesw-resize}

    @media(max-width:520px){
      .rb-chat{right:0!important;left:0!important;bottom:0!important;top:0!important;width:100%!important;height:100%!important;max-height:100%!important;border-radius:0;border:none;transform:translateY(100%);opacity:1;pointer-events:none}
      .rb-chat.open{transform:translateY(0);pointer-events:all}
      .rb-chat-btn{bottom:24px;right:24px;width:60px;height:60px}
      .rb-chat-btn.open{opacity:0;pointer-events:none;transform:scale(.5)}
      .rb-resize{display:none}
      .rb-chat__header{border-radius:0;padding:16px 20px;padding-top:max(16px,env(safe-area-inset-top))}
      .rb-chat__drag{cursor:default}
      .rb-chat__close{display:flex}
      .rb-chat__body{padding:16px 18px;padding-bottom:max(16px,env(safe-area-inset-bottom))}
      .rb-chat__msg{font-size:.9rem;max-width:94%;padding:14px 16px}
      .rb-chat__opt{padding:13px 16px;font-size:.88rem}
    }
    @media(min-width:521px) and (max-width:800px){
      .rb-chat{right:16px;width:calc(100vw - 32px);max-width:440px;bottom:104px;height:calc(100vh - 120px)}
    }
  `;
  document.head.appendChild(S);

  /* ── Button ── */
  const btn = document.createElement('button');
  btn.className = 'rb-chat-btn pulse';
  btn.setAttribute('aria-label', 'Apri assistente');
  btn.innerHTML = `
    <svg class="rb-icon rb-icon-chat" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
    <svg class="rb-icon rb-icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  document.body.appendChild(btn);

  /* ── Chat panel ── */
  const chat = document.createElement('div');
  chat.className = 'rb-chat';
  // Default position/size
  const defW = 440, defH = 600;
  const defR = 32, defB = 108;
  chat.style.cssText = `right:${defR}px;bottom:${defB}px;width:${defW}px;height:${defH}px;max-height:calc(100vh - 140px);`;

  // Header with drag handle
  chat.innerHTML = `
    <div class="rb-chat__header">
      <div class="rb-chat__drag" id="rb-drag">
        <div class="rb-chat__avatar"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg></div>
        <div class="rb-chat__htext"><div class="rb-chat__name">RB Assistant</div><div class="rb-chat__status">● Online</div></div>
      </div>
      <button class="rb-chat__restart" id="rb-restart" title="Ricomincia"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></button>
      <button class="rb-chat__close" id="rb-close" title="Chiudi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>
    <div class="rb-chat__body" id="rb-chat-body"></div>
    ${IS_DESKTOP ? `
    <div class="rb-resize rb-resize--n" data-dir="n"></div>
    <div class="rb-resize rb-resize--s" data-dir="s"></div>
    <div class="rb-resize rb-resize--e" data-dir="e"></div>
    <div class="rb-resize rb-resize--w" data-dir="w"></div>
    <div class="rb-resize rb-resize--ne" data-dir="ne"></div>
    <div class="rb-resize rb-resize--nw" data-dir="nw"></div>
    <div class="rb-resize rb-resize--se" data-dir="se"></div>
    <div class="rb-resize rb-resize--sw" data-dir="sw"></div>` : ''}
  `;
  document.body.appendChild(chat);

  const body = document.getElementById('rb-chat-body');
  let isOpen = false;

  /* ── Toggle ── */
  btn.addEventListener('click', () => {
    btn.classList.remove('pulse');
    isOpen = !isOpen;
    chat.classList.toggle('open', isOpen);
    btn.classList.toggle('open', isOpen);
    if (isOpen && body.children.length === 0) showNode('root');
  });

  /* ── Restart ── */
  document.getElementById('rb-restart').addEventListener('click', () => {
    body.innerHTML = '';
    showNode('root');
  });

  /* ── Close (mobile) ── */
  document.getElementById('rb-close').addEventListener('click', () => {
    isOpen = false;
    chat.classList.remove('open');
    btn.classList.remove('open');
  });

  /* ══════════════════════════════════
     DRAG (desktop only)
     ══════════════════════════════════ */
  if (IS_DESKTOP) {
    const drag = document.getElementById('rb-drag');
    let dX, dY, posMode = 'br'; // 'br' = bottom-right, 'tl' = top-left

    function switchToTL() {
      if (posMode === 'tl') return;
      const r = chat.getBoundingClientRect();
      chat.style.top = r.top + 'px';
      chat.style.left = r.left + 'px';
      chat.style.bottom = 'auto';
      chat.style.right = 'auto';
      chat.style.maxHeight = 'none';
      posMode = 'tl';
    }

    drag.addEventListener('pointerdown', e => {
      if (e.target.closest('.rb-chat__restart')) return;
      e.preventDefault();
      switchToTL();
      const r = chat.getBoundingClientRect();
      dX = e.clientX - r.left;
      dY = e.clientY - r.top;
      chat.classList.add('dragging');
      drag.setPointerCapture(e.pointerId);

      function onMove(ev) {
        let nx = ev.clientX - dX;
        let ny = ev.clientY - dY;
        nx = Math.max(0, Math.min(window.innerWidth - chat.offsetWidth, nx));
        ny = Math.max(0, Math.min(window.innerHeight - chat.offsetHeight, ny));
        chat.style.left = nx + 'px';
        chat.style.top = ny + 'px';
      }
      function onUp() {
        chat.classList.remove('dragging');
        drag.removeEventListener('pointermove', onMove);
        drag.removeEventListener('pointerup', onUp);
      }
      drag.addEventListener('pointermove', onMove);
      drag.addEventListener('pointerup', onUp);
    });

    /* ══════════════════════════════════
       RESIZE (desktop only)
       ══════════════════════════════════ */
    chat.querySelectorAll('.rb-resize').forEach(handle => {
      handle.addEventListener('pointerdown', e => {
        e.preventDefault();
        e.stopPropagation();
        switchToTL();
        const dir = handle.dataset.dir;
        const startX = e.clientX, startY = e.clientY;
        const rect = chat.getBoundingClientRect();
        const startW = rect.width, startH = rect.height;
        const startL = rect.left, startT = rect.top;
        chat.classList.add('resizing');
        handle.setPointerCapture(e.pointerId);

        function onMove(ev) {
          const dx = ev.clientX - startX;
          const dy = ev.clientY - startY;
          let w = startW, h = startH, l = startL, t = startT;

          if (dir.includes('e')) w = Math.max(MIN_W, startW + dx);
          if (dir.includes('w')) { w = Math.max(MIN_W, startW - dx); l = startL + startW - w; }
          if (dir.includes('s')) h = Math.max(MIN_H, startH + dy);
          if (dir.includes('n')) { h = Math.max(MIN_H, startH - dy); t = startT + startH - h; }

          // Clamp to viewport
          if (l < 0) { w += l; l = 0; }
          if (t < 0) { h += t; t = 0; }
          if (l + w > window.innerWidth) w = window.innerWidth - l;
          if (t + h > window.innerHeight) h = window.innerHeight - t;

          chat.style.width = w + 'px';
          chat.style.height = h + 'px';
          chat.style.left = l + 'px';
          chat.style.top = t + 'px';
        }
        function onUp() {
          chat.classList.remove('resizing');
          handle.removeEventListener('pointermove', onMove);
          handle.removeEventListener('pointerup', onUp);
        }
        handle.addEventListener('pointermove', onMove);
        handle.addEventListener('pointerup', onUp);
      });
    });
  }

  /* ── Render node ── */
  function showNode(key) {
    const node = TREE[key];
    if (!node) return;
    const typing = document.createElement('div');
    typing.className = 'rb-chat__typing';
    typing.innerHTML = '<div class="rb-chat__dot"></div><div class="rb-chat__dot"></div><div class="rb-chat__dot"></div>';
    body.appendChild(typing);
    scrollDown();
    setTimeout(() => {
      typing.remove();
      const msgEl = document.createElement('div');
      msgEl.className = 'rb-chat__msg';
      msgEl.innerHTML = node.msg.replace(/\n/g, '<br>');
      body.appendChild(msgEl);
      if (node.options && node.options.length) {
        const optsEl = document.createElement('div');
        optsEl.className = 'rb-chat__opts';
        node.options.forEach(opt => {
          const b = document.createElement('button');
          b.className = 'rb-chat__opt';
          b.textContent = opt.label;
          b.addEventListener('click', () => handleOption(opt));
          optsEl.appendChild(b);
        });
        body.appendChild(optsEl);
      }
      scrollDown();
    }, 450 + Math.random() * 200);
  }

  /* ── Handle option ── */
  function handleOption(opt) {
    body.querySelectorAll('.rb-chat__opts').forEach(el => el.remove());
    const echo = document.createElement('div');
    echo.className = 'rb-chat__msg rb-chat__msg--user';
    echo.textContent = opt.label.replace(/^[^\s]+\s/, '');
    body.appendChild(echo);
    scrollDown();

    if (opt.action === 'scroll') {
      setTimeout(() => {
        const el = document.getElementById(opt.target);
        if (el) { isOpen = false; chat.classList.remove('open'); btn.classList.remove('open'); el.scrollIntoView({ behavior: 'smooth' }); }
      }, 300);
      setTimeout(() => showNode(opt.next || 'root'), 600);
      return;
    }
    if (opt.action === 'link') {
      setTimeout(() => { window.open(opt.target, '_blank'); }, 300);
      setTimeout(() => showNode(opt.next || 'root'), 600);
      return;
    }
    if (opt.next) setTimeout(() => showNode(opt.next), 200);
  }

  function scrollDown() {
    requestAnimationFrame(() => { body.scrollTop = body.scrollHeight; });
  }

})();
