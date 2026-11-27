/* DocuShift — condizioni d'uso obbligatorie.
   Finché non vengono accettate (spunta + "Accetto"), tutta l'interfaccia resta bloccata.
   L'accettazione vale solo per la sessione corrente (sessionStorage): chiudendo la scheda o il
   browser, alla visita successiva le avvertenze vengono mostrate di nuovo. */
(function(){
  'use strict';
  const VERSION='2026-11-27', KEY='docushift.terms';
  let accepted=false;
  try{accepted=sessionStorage.getItem(KEY)===VERSION;}catch(e){}

  const css=`
.tg{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:20px;background:rgba(4,4,8,.86);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.tg__box{width:100%;max-width:640px;max-height:calc(100vh - 40px);display:flex;flex-direction:column;background:var(--panel,#131317);border:1px solid var(--border,#26262d);border-radius:16px;box-shadow:0 30px 80px rgba(0,0,0,.6)}
.tg__head{padding:22px 26px 14px;border-bottom:1px solid var(--line,#ffffff0d)}
.tg__kicker{font:600 10px 'JetBrains Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--warn,#ffb39c);margin:0 0 6px}
.tg__title{font-size:20px;font-weight:600;margin:0;letter-spacing:-.3px}
.tg__body{padding:6px 26px 4px;overflow-y:auto;outline:none;font-size:13px;line-height:1.6;color:#c9c9d2}
.tg__body h3{font-size:13px;font-weight:600;color:var(--ink,#e6e6ea);margin:16px 0 4px}
.tg__body p{margin:0 0 6px}
.tg__body ul{margin:0 0 6px;padding-left:18px}
.tg__body li{margin:2px 0}
.tg__body strong{color:var(--ink,#e6e6ea)}
.tg__foot{padding:16px 26px 20px;border-top:1px solid var(--line,#ffffff0d);display:flex;flex-direction:column;gap:14px}
.tg__chk{display:flex;gap:10px;align-items:flex-start;font-size:13px!important;white-space:normal;line-height:1.5;cursor:pointer;color:var(--ink,#e6e6ea)}
.tg__chk span{font-size:13px;line-height:1.5}
.tg__chk input{width:17px;height:17px;margin:2px 0 0;flex:none;accent-color:#00e0d0;cursor:pointer}
.tg__btns{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap}
.tg__btn{height:40px;padding:0 18px;border-radius:10px;font-weight:600;cursor:pointer;border:1px solid var(--border,#26262d);background:var(--panel-2,#0e0e12);color:var(--ink,#e6e6ea)}
.tg__btn:hover{border-color:#00e0d066}
.tg__btn--ok{border:0;background:linear-gradient(135deg,#00e0d0,#00a99f);color:#04211f}
.tg__btn--ok:disabled{background:#1d2a2b;color:#7f9594;cursor:not-allowed}
.tg__btn:focus-visible,.tg__chk input:focus-visible{outline:2px solid #00e0d0;outline-offset:2px}
.tg__stop{text-align:center;padding:34px 28px}
.tg__stop p{color:#c9c9d2;margin:10px 0 20px;line-height:1.6}
.tg__stop .tg__btns{justify-content:center}
@media(max-width:560px){.tg{padding:10px}.tg__head,.tg__body,.tg__foot{padding-left:18px;padding-right:18px}.tg__btns{flex-direction:column-reverse}.tg__btn{width:100%}}`;

  const TERMS=`
<h3>1. La tua chiave API</h3>
<p>La chiave API dà accesso al tuo account OpenAI o Google e ai relativi costi: <strong>chi la ottiene può usarla a tue spese</strong>. DocuShift la invia solo dal tuo browser direttamente al fornitore che scegli e non la trasmette a server del gestore del sito. Tuttavia, inserire una chiave in qualsiasi sito web comporta sempre dei rischi (ad esempio estensioni del browser malevole, dispositivi compromessi o computer condivisi).</p>
<ul>
<li>Crea una <strong>chiave dedicata</strong> solo per DocuShift e revocala quando hai finito.</li>
<li>Imposta un <strong>limite di spesa</strong> basso nel tuo account del fornitore.</li>
<li>Non spuntare "ricorda" su computer condivisi o pubblici.</li>
</ul>
<h3>2. Costi</h3>
<p>Ogni traduzione consuma crediti che il fornitore addebita sul tuo account. Le stime mostrate sono indicative e possono differire dal costo reale. I costi addebitati sono interamente a tuo carico.</p>
<h3>3. I tuoi documenti</h3>
<p>Il testo del documento viene inviato al fornitore AI scelto ed è trattato secondo i suoi termini e la sua informativa. <strong>Non caricare documenti riservati</strong>, coperti da segreto o contenenti dati personali di terzi, se non sei autorizzato a farlo.</p>
<h3>4. Le traduzioni possono essere sbagliate</h3>
<p>Le traduzioni sono generate automaticamente da un'intelligenza artificiale e <strong>possono contenere errori, omissioni, termini inesatti o alterazioni dell'impaginazione</strong>. Non sostituiscono un traduttore professionista. Per documenti legali, contrattuali, medici, tecnici, di sicurezza o destinati alla pubblicazione, fai sempre verificare il risultato da un professionista prima di usarlo.</p>
<h3>5. Limitazione di responsabilità</h3>
<p>DocuShift è uno strumento gratuito e sperimentale (Beta), fornito "così com'è", senza alcuna garanzia di esattezza, completezza, continuità o idoneità a uno scopo specifico. Nei limiti massimi consentiti dalla legge, Riccardo Busolo non risponde di alcun danno, diretto o indiretto, derivante dall'uso del servizio o delle traduzioni prodotte, dall'uso o dalla sottrazione della tua chiave API o dai costi addebitati dal fornitore. Restano salvi i casi di dolo o colpa grave e le altre ipotesi in cui la legge non consente di limitare la responsabilità.</p>
<p>Usando DocuShift ti assumi la responsabilità della verifica e dell'utilizzo dei risultati.</p>`;

  function lock(on){
    for(const el of document.querySelectorAll('body > header, body > main, body > footer')){
      if(on){el.setAttribute('inert','');el.setAttribute('aria-hidden','true');}
      else{el.removeAttribute('inert');el.removeAttribute('aria-hidden');}
    }
  }

  function show(){
    if(!document.getElementById('tg-style')){const st=document.createElement('style');st.id='tg-style';st.textContent=css;document.head.appendChild(st);}
    let ov=document.getElementById('tg');
    if(!ov){ov=document.createElement('div');ov.id='tg';ov.className='tg';document.body.appendChild(ov);}
    ov.innerHTML=`<div class="tg__box" role="dialog" aria-modal="true" aria-labelledby="tg-title">
  <div class="tg__head"><p class="tg__kicker">Avvertenze obbligatorie</p><h2 class="tg__title" id="tg-title">Prima di usare DocuShift</h2></div>
  <div class="tg__body" tabindex="0">${TERMS}</div>
  <div class="tg__foot">
    <label class="tg__chk"><input type="checkbox" id="tg-chk"><span>Ho letto e compreso gli avvertimenti e accetto di usare DocuShift alle condizioni indicate, sotto la mia responsabilità.</span></label>
    <div class="tg__btns"><button type="button" class="tg__btn" id="tg-no">Rifiuto</button><button type="button" class="tg__btn tg__btn--ok" id="tg-ok" disabled>Accetto e continuo</button></div>
  </div></div>`;
    lock(true);
    const chk=ov.querySelector('#tg-chk'),ok=ov.querySelector('#tg-ok');
    chk.addEventListener('change',()=>{ok.disabled=!chk.checked;});
    ok.addEventListener('click',()=>{
      if(!chk.checked)return;
      try{sessionStorage.setItem(KEY,VERSION);}catch(e){}
      ov.remove();lock(false);
    });
    ov.querySelector('#tg-no').addEventListener('click',refused);
    setTimeout(()=>ov.querySelector('.tg__body').focus(),50);
  }

  function refused(){
    try{sessionStorage.removeItem(KEY);}catch(e){}
    const ov=document.getElementById('tg');
    ov.innerHTML=`<div class="tg__box tg__stop" role="dialog" aria-modal="true" aria-labelledby="tg-title">
  <h2 class="tg__title" id="tg-title">Non puoi usare DocuShift</h2>
  <p>Per usare il servizio è necessario accettare le avvertenze. Se cambi idea puoi rileggerle in qualsiasi momento.</p>
  <div class="tg__btns"><a class="tg__btn" href="/progetti.html#strumenti" style="display:inline-flex;align-items:center;justify-content:center">← Torna agli strumenti</a><button type="button" class="tg__btn tg__btn--ok" id="tg-again">Rileggi le avvertenze</button></div></div>`;
    ov.querySelector('#tg-again').addEventListener('click',show);
    ov.querySelector('#tg-again').focus();
  }

  // Reopen the terms from the page ("Avvertenze" link) without blocking the session again.
  window.DocuShiftTerms={open(){show();}};

  if(!accepted){
    if(document.body)show();else document.addEventListener('DOMContentLoaded',show);
  }
})();
