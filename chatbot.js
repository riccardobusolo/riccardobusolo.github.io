/* ═══════════════════════════════════════════════════════════
   RB Assistant — Chatbot interattivo per riccardobusolo.com
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Albero decisionale ── */
  const TREE = {
    root: {
      msg: 'Ciao! Sono <strong>RB Assistant</strong>, il tuo assistente virtuale. Come posso aiutarti oggi?',
      options: [
        { label: '💼 Scopri i servizi', next: 'servizi' },
        { label: '📚 Materiali di formazione', next: 'risorse' },
        { label: '🤖 Domande sull\'AI', next: 'faq_ai' },
        { label: '✉️ Contattami', next: 'contatti' },
        { label: '🔍 Naviga il sito', next: 'navigazione' },
      ],
    },

    /* ── SERVIZI ── */
    servizi: {
      msg: 'Offro tre tipologie di servizio. Quale ti interessa approfondire?',
      options: [
        { label: '🎓 Formazione AI', next: 'srv_formazione' },
        { label: '⚙️ Affiancamento Personalizzato', next: 'srv_affiancamento' },
        { label: '💻 Vibe Coding', next: 'srv_vibecoding' },
        { label: '💰 Info su costi e preventivi', next: 'preventivo' },
        { label: '← Torna al menu', next: 'root' },
      ],
    },
    srv_formazione: {
      msg: 'Il percorso di <strong>Formazione AI</strong> è pensato per rendere ogni membro del team autonomo nell\'uso dell\'Intelligenza Artificiale.\n\nCosa imparerai:\n• Prompt engineering e ragionamento multi-step\n• AI applicata a marketing, grafica e contenuti\n• Creazione di agenti AI semi-autonomi\n• Collaborazione uomo-AI ad alta efficienza\n\nÈ rivolto a qualsiasi ruolo aziendale: amministrazione, commerciale, marketing, HR, area tecnica e oltre.',
      options: [
        { label: '📋 Vai alla sezione servizi', action: 'scroll', target: 'servizi' },
        { label: '✉️ Richiedi informazioni', next: 'contatti' },
        { label: '← Altri servizi', next: 'servizi' },
        { label: '← Menu principale', next: 'root' },
      ],
    },
    srv_affiancamento: {
      msg: 'L\'<strong>Affiancamento Personalizzato</strong> parte dall\'analisi concreta dei tuoi processi aziendali.\n\nCome funziona:\n• Analizzo i flussi di lavoro esistenti\n• Identifico le attività con il maggiore potenziale di automazione\n• Definisco un piano d\'azione prioritizzato\n• Lavoro fianco a fianco con il tuo team\n• Trasferisco le competenze per renderti autonomo\n\nL\'obiettivo è che alla fine del percorso tu non abbia più bisogno di me.',
      options: [
        { label: '📋 Vai alla sezione servizi', action: 'scroll', target: 'servizi' },
        { label: '✉️ Richiedi informazioni', next: 'contatti' },
        { label: '← Altri servizi', next: 'servizi' },
        { label: '← Menu principale', next: 'root' },
      ],
    },
    srv_vibecoding: {
      msg: 'Con il <strong>Vibe Coding</strong> chiunque può creare strumenti software usando solo il linguaggio naturale — zero programmazione.\n\nCosa imparerai a costruire:\n• Strumenti di automazione interni su misura\n• Script per elaborare dati e generare report\n• Piccole applicazioni web per il tuo team\n• Connettori tra strumenti già in uso (CRM, email, calendar)\n• Agenti AI personalizzati\n\nNessuna conoscenza di programmazione richiesta.',
      options: [
        { label: '📋 Vai alla sezione servizi', action: 'scroll', target: 'servizi' },
        { label: '✉️ Richiedi informazioni', next: 'contatti' },
        { label: '← Altri servizi', next: 'servizi' },
        { label: '← Menu principale', next: 'root' },
      ],
    },
    preventivo: {
      msg: 'Ogni progetto è diverso, per questo preferisco valutare le esigenze specifiche prima di proporre un preventivo.\n\nCompila il <strong>modulo di contatto</strong> descrivendo brevemente il tuo progetto o la tua richiesta, e ti risponderò il prima possibile con una proposta personalizzata.',
      options: [
        { label: '✉️ Vai al modulo contatti', action: 'scroll', target: 'contatti' },
        { label: '← Torna ai servizi', next: 'servizi' },
        { label: '← Menu principale', next: 'root' },
      ],
    },

    /* ── RISORSE ── */
    risorse: {
      msg: 'Nella sezione <strong>Materiali di Formazione</strong> trovi i PDF dei miei corsi teorici, consultabili e scaricabili gratuitamente:\n\n• <strong>Storia dell\'Intelligenza Artificiale</strong> — dalle origini ai giorni nostri\n• <strong>Fondamenti di Intelligenza Artificiale</strong> — concetti chiave e basi teoriche\n• <strong>Tecniche di Prompt Engineering</strong> — come comunicare efficacemente con gli LLM',
      options: [
        { label: '📚 Vai alle risorse', action: 'scroll', target: 'risorse' },
        { label: '💼 Scopri i servizi', next: 'servizi' },
        { label: '← Menu principale', next: 'root' },
      ],
    },

    /* ── FAQ AI ── */
    faq_ai: {
      msg: 'Ecco alcune domande frequenti sull\'Intelligenza Artificiale. Quale ti interessa?',
      options: [
        { label: 'Cos\'è l\'Intelligenza Artificiale?', next: 'faq_cosai' },
        { label: 'Cosa sono gli LLM?', next: 'faq_llm' },
        { label: 'Cos\'è il Prompt Engineering?', next: 'faq_prompt' },
        { label: 'L\'AI sostituirà il mio lavoro?', next: 'faq_lavoro' },
        { label: 'Come può l\'AI aiutare la mia azienda?', next: 'faq_azienda' },
        { label: '← Menu principale', next: 'root' },
      ],
    },
    faq_cosai: {
      msg: 'L\'<strong>Intelligenza Artificiale</strong> è un insieme di tecnologie che permettono ai computer di svolgere compiti che normalmente richiedono intelligenza umana: comprendere il linguaggio, riconoscere immagini, prendere decisioni, generare contenuti.\n\nNon è un\'entità singola ma un campo vastissimo che include machine learning, deep learning, reti neurali, elaborazione del linguaggio naturale e molto altro.',
      options: [
        { label: '📚 Scarica il PDF sui Fondamenti', action: 'scroll', target: 'risorse' },
        { label: '← Altre domande', next: 'faq_ai' },
        { label: '← Menu principale', next: 'root' },
      ],
    },
    faq_llm: {
      msg: 'I <strong>Large Language Model (LLM)</strong> sono modelli di AI addestrati su enormi quantità di testo per comprendere e generare linguaggio naturale.\n\nEsempi noti: ChatGPT, Claude, Gemini, LLaMA. Funzionano prevedendo la parola più probabile successiva in una sequenza, ma la scala dei dati e dei parametri li rende capaci di ragionamento, sintesi, traduzione e molto altro.\n\nSono lo strumento principale che insegno a usare nei miei corsi.',
      options: [
        { label: '🎓 Scopri la formazione AI', next: 'srv_formazione' },
        { label: '← Altre domande', next: 'faq_ai' },
        { label: '← Menu principale', next: 'root' },
      ],
    },
    faq_prompt: {
      msg: 'Il <strong>Prompt Engineering</strong> è l\'arte di comunicare in modo efficace con i modelli AI. Un buon prompt può fare la differenza tra una risposta generica e un risultato preciso e utile.\n\nNei miei corsi insegno tecniche avanzate come:\n• Strutturazione dei prompt con ruoli e contesto\n• Ragionamento multi-step (chain-of-thought)\n• Few-shot learning con esempi\n• Gestione del contesto e della memoria',
      options: [
        { label: '📚 Scarica il PDF sul Prompt Engineering', action: 'scroll', target: 'risorse' },
        { label: '🎓 Scopri la formazione', next: 'srv_formazione' },
        { label: '← Altre domande', next: 'faq_ai' },
        { label: '← Menu principale', next: 'root' },
      ],
    },
    faq_lavoro: {
      msg: 'L\'AI non è qui per sostituire le persone, ma per <strong>potenziare le loro capacità</strong>. I ruoli più a rischio sono quelli ripetitivi e prevedibili, mentre i lavori che richiedono creatività, empatia e giudizio critico diventano ancora più preziosi.\n\nLa chiave è imparare a usare l\'AI come strumento: chi sa collaborare con l\'AI sarà più competitivo di chi la ignora. È esattamente questo che insegno nei miei percorsi di formazione.',
      options: [
        { label: '🎓 Scopri la formazione', next: 'srv_formazione' },
        { label: '⚙️ Affiancamento personalizzato', next: 'srv_affiancamento' },
        { label: '← Altre domande', next: 'faq_ai' },
        { label: '← Menu principale', next: 'root' },
      ],
    },
    faq_azienda: {
      msg: 'L\'AI può trasformare praticamente ogni area della tua azienda:\n\n• <strong>Marketing</strong> — generazione di contenuti, campagne, analisi\n• <strong>Amministrazione</strong> — automazione documenti, email, report\n• <strong>Vendite</strong> — lead scoring, follow-up automatici\n• <strong>Supporto clienti</strong> — chatbot, risposte automatiche\n• <strong>Produzione</strong> — ottimizzazione processi, controllo qualità\n\nIl primo passo è sempre un\'analisi del tuo contesto specifico per capire dove l\'AI può avere il maggiore impatto.',
      options: [
        { label: '⚙️ Scopri l\'affiancamento', next: 'srv_affiancamento' },
        { label: '✉️ Contattami per una consulenza', next: 'contatti' },
        { label: '← Altre domande', next: 'faq_ai' },
        { label: '← Menu principale', next: 'root' },
      ],
    },

    /* ── CONTATTI ── */
    contatti: {
      msg: 'Puoi contattarmi compilando il <strong>modulo nella sezione Contatti</strong> del sito. Descrivi brevemente il tuo progetto o la tua richiesta e ti risponderò il prima possibile.\n\nRicorda: ogni informazione che condividi è trattata nel rispetto della Privacy Policy.',
      options: [
        { label: '✉️ Vai al modulo contatti', action: 'scroll', target: 'contatti' },
        { label: '🔒 Leggi la Privacy Policy', action: 'link', target: 'policy.html#privacy' },
        { label: '← Menu principale', next: 'root' },
      ],
    },

    /* ── NAVIGAZIONE ── */
    navigazione: {
      msg: 'Posso portarti direttamente alla sezione che ti interessa. Dove vuoi andare?',
      options: [
        { label: '🏠 Torna in cima', action: 'scroll', target: 'hero' },
        { label: '💼 Servizi', action: 'scroll', target: 'servizi' },
        { label: '🔬 Progetti AI', action: 'scroll', target: 'progetti' },
        { label: '📚 Materiali di formazione', action: 'scroll', target: 'risorse' },
        { label: '✉️ Contatti', action: 'scroll', target: 'contatti' },
        { label: '🔒 Privacy & Cookie Policy', action: 'link', target: 'policy.html#privacy' },
        { label: '← Menu principale', next: 'root' },
      ],
    },
  };

  /* ── CSS ── */
  const STYLE = document.createElement('style');
  STYLE.textContent = `
    .rb-chat-btn{position:fixed;bottom:28px;right:28px;z-index:100;width:56px;height:56px;border-radius:50%;border:none;background:var(--cyan,#00e0d0);color:#08080e;cursor:pointer;box-shadow:0 4px 20px rgba(0,224,208,.3);transition:all .35s cubic-bezier(.16,1,.3,1);display:flex;align-items:center;justify-content:center}
    .rb-chat-btn:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(0,224,208,.4)}
    .rb-chat-btn:active{transform:translateY(0) scale(.95);transition-duration:.1s}
    .rb-chat-btn svg{width:26px;height:26px;transition:transform .3s}
    .rb-chat-btn.open svg{transform:rotate(90deg)}

    .rb-chat{position:fixed;bottom:96px;right:28px;z-index:100;width:380px;max-height:520px;background:#151518;border:1px solid rgba(180,180,190,.12);border-radius:16px;display:flex;flex-direction:column;opacity:0;transform:translateY(16px) scale(.96);pointer-events:none;transition:all .35s cubic-bezier(.16,1,.3,1);box-shadow:0 16px 48px rgba(0,0,0,.4);overflow:hidden}
    .rb-chat.open{opacity:1;transform:translateY(0) scale(1);pointer-events:all}

    .rb-chat__header{display:flex;align-items:center;gap:10px;padding:16px 20px;border-bottom:1px solid rgba(180,180,190,.08);flex-shrink:0}
    .rb-chat__avatar{width:32px;height:32px;border-radius:50%;background:var(--cyan,#00e0d0);display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .rb-chat__avatar svg{width:16px;height:16px;stroke:#08080e;fill:none;stroke-width:2}
    .rb-chat__htext{flex:1}
    .rb-chat__name{font-family:'Outfit',sans-serif;font-size:.88rem;font-weight:600;color:#e6e6ea}
    .rb-chat__status{font-family:'JetBrains Mono',monospace;font-size:.62rem;color:#00e0d0;letter-spacing:.05em}

    .rb-chat__body{flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:12px;scrollbar-width:thin;scrollbar-color:rgba(0,224,208,.15) transparent}

    .rb-chat__msg{max-width:92%;padding:12px 16px;border-radius:12px 12px 12px 4px;background:#1c1c20;border:1px solid rgba(180,180,190,.06);font-family:'Outfit',sans-serif;font-size:.85rem;color:#9a9a9e;line-height:1.65;font-weight:300;animation:rbMsgIn .35s cubic-bezier(.16,1,.3,1) both}
    .rb-chat__msg strong{color:#e6e6ea;font-weight:600}
    @keyframes rbMsgIn{from{opacity:0;transform:translateY(8px)}}

    .rb-chat__opts{display:flex;flex-direction:column;gap:6px;animation:rbMsgIn .35s cubic-bezier(.16,1,.3,1) .1s both}
    .rb-chat__opt{background:transparent;border:1px solid rgba(180,180,190,.12);border-radius:8px;padding:10px 14px;color:#e6e6ea;font-family:'Outfit',sans-serif;font-size:.82rem;font-weight:400;cursor:pointer;text-align:left;transition:all .25s cubic-bezier(.16,1,.3,1);line-height:1.4}
    .rb-chat__opt:hover{background:rgba(0,224,208,.06);border-color:rgba(0,224,208,.25);color:#00e0d0}
    .rb-chat__opt:active{transform:scale(.97);transition-duration:.08s}

    .rb-chat__typing{display:flex;gap:4px;padding:12px 16px;max-width:70px}
    .rb-chat__dot{width:6px;height:6px;border-radius:50%;background:#7a7a8e;animation:rbDot 1.2s ease-in-out infinite}
    .rb-chat__dot:nth-child(2){animation-delay:.15s}
    .rb-chat__dot:nth-child(3){animation-delay:.3s}
    @keyframes rbDot{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-4px)}}

    @media(max-width:500px){
      .rb-chat{right:12px;left:12px;bottom:84px;width:auto;max-height:70vh}
      .rb-chat-btn{bottom:20px;right:20px;width:50px;height:50px}
    }
  `;
  document.head.appendChild(STYLE);

  /* ── HTML ── */
  // Toggle button
  const btn = document.createElement('button');
  btn.className = 'rb-chat-btn';
  btn.setAttribute('aria-label', 'Apri assistente');
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>';
  document.body.appendChild(btn);

  // Chat panel
  const chat = document.createElement('div');
  chat.className = 'rb-chat';
  chat.innerHTML = `
    <div class="rb-chat__header">
      <div class="rb-chat__avatar"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg></div>
      <div class="rb-chat__htext"><div class="rb-chat__name">RB Assistant</div><div class="rb-chat__status">● Online</div></div>
    </div>
    <div class="rb-chat__body" id="rb-chat-body"></div>
  `;
  document.body.appendChild(chat);

  const body = document.getElementById('rb-chat-body');
  let isOpen = false;

  /* ── Toggle ── */
  btn.addEventListener('click', () => {
    isOpen = !isOpen;
    chat.classList.toggle('open', isOpen);
    btn.classList.toggle('open', isOpen);
    if (isOpen && body.children.length === 0) showNode('root');
  });

  /* ── Render node ── */
  function showNode(key) {
    const node = TREE[key];
    if (!node) return;

    // Typing indicator
    const typing = document.createElement('div');
    typing.className = 'rb-chat__typing';
    typing.innerHTML = '<div class="rb-chat__dot"></div><div class="rb-chat__dot"></div><div class="rb-chat__dot"></div>';
    body.appendChild(typing);
    scrollDown();

    setTimeout(() => {
      typing.remove();

      // Message bubble
      const msgEl = document.createElement('div');
      msgEl.className = 'rb-chat__msg';
      msgEl.innerHTML = node.msg.replace(/\n/g, '<br>');
      body.appendChild(msgEl);

      // Options
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
    }, 500 + Math.random() * 300);
  }

  /* ── Handle option click ── */
  function handleOption(opt) {
    // Remove previous options
    const oldOpts = body.querySelectorAll('.rb-chat__opts');
    oldOpts.forEach(el => el.remove());

    // Show user choice as echo
    const echo = document.createElement('div');
    echo.className = 'rb-chat__msg';
    echo.style.cssText = 'align-self:flex-end;border-radius:12px 12px 4px 12px;background:rgba(0,224,208,.08);border-color:rgba(0,224,208,.15);color:#e6e6ea';
    echo.textContent = opt.label.replace(/^[^\s]+\s/, '');
    body.appendChild(echo);
    scrollDown();

    if (opt.action === 'scroll') {
      // Scroll to section and close chat
      setTimeout(() => {
        const el = document.getElementById(opt.target);
        if (el) {
          isOpen = false;
          chat.classList.remove('open');
          btn.classList.remove('open');
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
      // Still show next content after a beat
      setTimeout(() => showNode(opt.next || 'root'), 600);
      return;
    }

    if (opt.action === 'link') {
      setTimeout(() => {
        window.open(opt.target, '_blank');
      }, 300);
      setTimeout(() => showNode(opt.next || 'root'), 600);
      return;
    }

    if (opt.next) {
      setTimeout(() => showNode(opt.next), 200);
    }
  }

  /* ── Scroll helper ── */
  function scrollDown() {
    requestAnimationFrame(() => {
      body.scrollTop = body.scrollHeight;
    });
  }

})();
