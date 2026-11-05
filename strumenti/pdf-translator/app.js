'use strict';
pdfjsLib.GlobalWorkerOptions.workerSrc='pdf.worker.min.js';
const $=id=>document.getElementById(id);
let source=null,result=null,fileName='',pageNumber=1,busy=false,controller=null,workingModels=[],downloadURL=null,renderVersion=0,renderQueue=Promise.resolve();
const logs=new Map();
const providerSessions=new Map();let currentProvider='openai';
const providerName=()=>currentProvider==='openai'?'OpenAI':'Gemini';
const service=()=>currentProvider==='openai'?OpenAIService:AI;
function providerUI(){
  const openai=currentProvider==='openai';
  for(const b of document.querySelectorAll('[data-provider]'))b.setAttribute('aria-pressed',String(b.dataset.provider===currentProvider));
  $('key-label').textContent='API key '+providerName();$('key').placeholder=openai?'sk-… · chiave OpenAI':'Chiave Gemini (AI Studio)';
  $('key-link').href=openai?'https://platform.openai.com/api-keys':'https://aistudio.google.com/apikey';
  $('billing-link').hidden=!openai;$('test').hidden=openai;$('test').textContent='✦ Trova un modello funzionante';
  $('provider-hint').textContent=openai?'La chiave viene verificata gratuitamente (elenco modelli, nessun token). I costi stimati usano il listino OpenAI di novembre 2026 e il consumo misurato su un manuale reale.':'Il test prova fino a 6 modelli Gemini, privilegiando Flash, con una breve richiesta ciascuno. L’accesso non garantisce quota gratuita: verifica il piano in AI Studio.';
  $('remember').checked=!!storedKey(currentProvider);
}
// Optional: the key can be kept in this browser only (localStorage), never elsewhere.
const keyStore='docushift.key.';
function storedKey(provider){try{return localStorage.getItem(keyStore+provider)||'';}catch{return '';}}
function storeKey(provider,key){try{if(key)localStorage.setItem(keyStore+provider,key);else localStorage.removeItem(keyStore+provider);}catch{}}
// Costs are priced in USD by OpenAI and shown in euro, rounded to the cent. The ECB rate
// is refreshed on every opening (Frankfurter API) and cached; 0.895 is the 30 Oct 2026 rate.
let usdToEur=.895,rateDate='30/10/2026';
try{const cached=JSON.parse(localStorage.getItem('docushift.usdeur')||'null');if(cached?.rate){usdToEur=cached.rate;rateDate=cached.date;}}catch{}
const money=usd=>{if(usd==null)return '—';const eur=Math.round(usd*usdToEur*100)/100;return eur<.01?'< 0,01 €':'≈ '+eur.toFixed(2).replace('.',',')+' €';};
async function refreshRate(){
  try{const r=await fetch('https://api.frankfurter.dev/v1/latest?from=USD&to=EUR',{referrerPolicy:'no-referrer'});const d=await r.json();const rate=d?.rates?.EUR;
    if(rate>.5&&rate<2){usdToEur=rate;rateDate=String(d.date||'').split('-').reverse().join('/');try{localStorage.setItem('docushift.usdeur',JSON.stringify({rate,date:rateDate}));}catch{}updateEstimate();}}
  catch{}
}
const docChars=()=>source?.chars||null;
function keyStatus(text,state=''){$('key-status').textContent=text;$('key-status').dataset.state=state;$('key-status').title=text;}
// OpenAI models are shown as a small table: price for 10 pages and for the loaded PDF.
let modelsOpen=false;
function updateEstimate(){
  const list=$('model-list'),openai=currentProvider==='openai';
  if(list){list.hidden=!openai;$('model').hidden=openai;}
  if(!openai){$('estimate').textContent='Costo secondo il piano Gemini: i token usati vengono mostrati a fine traduzione.';return;}
  const chars=docChars(),selected=$('model').value;
  if(list&&list.replaceChildren){
    list.classList.toggle('no-doc',!chars);
    const head=document.createElement('div');head.className='models-head';head.innerHTML='<span></span><span>Modello</span><span>10 pag.</span><span class="doc">Il tuo PDF</span>';
    // Collapsed: only the selected model, with a hint to open the alternatives.
    list.classList.toggle('open',modelsOpen);
    const rows=[...$('model').options].filter(o=>modelsOpen||o.value===selected).map(o=>{const m=OpenAIService.info(o.value);const b=document.createElement('button');b.type='button';b.className='model';b.setAttribute('role','radio');b.setAttribute('aria-checked',String(o.value===selected));b.dataset.off=o.disabled?'1':'0';b.disabled=o.disabled||busy;
      b.innerHTML=`<span class="radio"></span><span class="name">${m.label}<small>${o.disabled?'non disponibile sul tuo account':m.note}</small></span><span class="price">${money(OpenAIService.estimate(m.id,10*OpenAIService.CHARS_PER_PAGE))}</span><span class="price doc">${chars?money(OpenAIService.estimate(m.id,chars)):''}</span>`;
      b.title=`${m.label}: $${m.input} input · $${m.output} output per milione di token (≈ ${(m.input*usdToEur).toFixed(2).replace('.',',')} € / ${(m.output*usdToEur).toFixed(2).replace('.',',')} €)${m.legacyPrice?' · prezzo storico, da verificare':''}`;
      b.onclick=()=>{if(busy)return;if(!modelsOpen){modelsOpen=true;updateEstimate();list.querySelector('[aria-checked=true]')?.focus();return;}modelsOpen=false;$('model').value=o.value;$('model').onchange();};return b;});
    const more=document.createElement('button');more.type='button';more.className='models-more';more.disabled=busy;
    more.textContent=modelsOpen?'Chiudi elenco ▴':`Cambia modello · ${$('model').options.length-1} alternative ▾`;more.onclick=()=>{modelsOpen=!modelsOpen;updateEstimate();};
    list.replaceChildren(head,...rows,more);
  }
  const m=OpenAIService.info(selected);
  $('estimate').textContent=m?`Stime da consumi misurati con glossario e revisione, ~1.200 caratteri per pagina · listino OpenAI 1/11/2026 · cambio BCE ${rateDate}: 1 $ = ${usdToEur.toFixed(3).replace('.',',')} €.`:'';
}
function resetModels(available=null){
  const selected=$('model').value;workingModels=[];$('model').replaceChildren();
  if(currentProvider==='openai'){
    for(const m of OpenAIService.catalog){const ok=!available||available.includes(m.id);const o=new Option(`${m.label} · ${m.note}${ok?'':' · non disponibile'}`,m.id);o.disabled=!ok;$('model').add(o);}
    if(available){workingModels=[...available];}
    const pick=[selected,...(available||OpenAIService.models)].find(id=>id&&OpenAIService.models.includes(id)&&(!available||available.includes(id)));if(pick)$('model').value=pick;
  }else $('model').add(new Option('Prima verifica la connessione',''));
  updateEstimate();
}
// OpenAI: the key is checked as soon as it is pasted (or remembered) with a free request.
let verifyTimer=null,verifyRun=0;
async function verifyKey(){
  clearTimeout(verifyTimer);const key=$('key').value.trim(),run=++verifyRun;
  if(currentProvider!=='openai')return;
  resetModels();if(!key){keyStatus('');sync();return;}
  keyStatus('Verifica…','busy');
  try{const {available,total}=await OpenAIService.listModels(key);if(run!==verifyRun)return;
    resetModels(available);diagnostic('OpenAI',`Chiave valida · ${total} modelli sul tuo account · ${available.length}/${OpenAIService.models.length} supportati da DocuShift`,true);
    keyStatus(available.length?'✓ Chiave verificata':'Nessun modello compatibile',available.length?'ok':'error');
    if($('remember').checked)storeKey('openai',key);
    if(!busy)status(source?'Pronto: scegli il modello e avvia la traduzione.':'Chiave verificata. Carica un documento.');
  }catch(error){if(run!==verifyRun)return;keyStatus(error.message,'error');diagnostic('OpenAI',error.message);}
  sync();
}

$('provider').onchange=()=>{
  providerSessions.set(currentProvider,{key:$('key').value,verified:[...workingModels],options:[...$('model').options].map(o=>[o.text,o.value]),selected:$('model').value});
  currentProvider=$('provider').value;const saved=providerSessions.get(currentProvider);$('key').value=saved?.key||storedKey(currentProvider);keyStatus('');$('key').type='password';$('show-key').setAttribute('aria-label','Mostra chiave');
  resetModels();if(saved){workingModels=saved.verified;$('model').replaceChildren(...saved.options.map(([text,value])=>new Option(text,value)));$('model').value=saved.selected;}
  logs.clear();$('diagnostics').replaceChildren();$('test-count').textContent='';providerUI();updateEstimate();sync();if(currentProvider==='openai'&&$('key').value.trim()&&!saved?.verified?.length)verifyKey();status(providerName()+' selezionato. '+(workingModels.includes($('model').value)?'Connessione già verificata.':currentProvider==='openai'?'Incolla la chiave: viene verificata subito, senza costi.':'Inserisci la chiave e trova un modello funzionante.'));
};
const activity=document.createElement('section');
activity.id='activity';activity.hidden=true;activity.setAttribute('aria-label','Stato elaborazione');
activity.innerHTML='<div class="activity-head"><span class="activity-spinner" aria-hidden="true"></span><div><strong id="activity-title"></strong><p id="activity-detail"></p></div><span id="activity-time">0:00</span></div><ol id="activity-steps"><li>Analisi PDF</li><li>Traduzione AI</li><li>Creazione PDF</li><li>Anteprima</li></ol><div class="activity-meta"><span id="activity-count">Avvio…</span><span id="activity-percent">0%</span></div><p id="activity-heartbeat"></p><details><summary>Attività e tentativi</summary><div id="activity-log" role="log" aria-live="polite"></div></details>';
$('progress').before(activity);
let activityTimer=null,activityStarted=0,lastActivity=0,activityStep=-1;
const paint=()=>new Promise(resolve=>setTimeout(resolve,0));
function eventLog(text){const row=document.createElement('p');row.textContent=new Date().toLocaleTimeString('it-IT')+' · '+text;$('activity-log').append(row);while($('activity-log').children.length>60)$('activity-log').firstChild.remove();lastActivity=Date.now();}
function tick(){const elapsed=Math.floor((Date.now()-activityStarted)/1000),waiting=Math.floor((Date.now()-lastActivity)/1000);$('activity-time').textContent=Math.floor(elapsed/60)+':'+String(elapsed%60).padStart(2,'0');$('activity-heartbeat').textContent=waiting>=10?`Nessun nuovo risultato da ${waiting} s. ${activityStep===1?'Il provider sta elaborando: ogni richiesta ha un limite di 2 minuti.':'Elaborazione del documento in corso.'}`:'In lavorazione · puoi annullare in qualsiasi momento.';}
function startActivity(title,steps=true){
  clearInterval(activityTimer);activityStarted=lastActivity=Date.now();activityStep=-1;activity.hidden=false;activity.dataset.state='running';activity.setAttribute('aria-busy','true');$('activity-log').replaceChildren();$('activity-steps').hidden=!steps;$('activity-title').textContent=title;$('activity-detail').textContent='Avvio dell’operazione…';$('activity-count').textContent='Preparazione';setProgress(0);tick();activityTimer=setInterval(tick,1000);eventLog(title);
  activity.scrollIntoView({block:'nearest',behavior:'auto'});
}
function setProgress(value,count){if(Number($('progress').value)!==value||(count&&$('activity-count').textContent!==count))lastActivity=Date.now();$('progress').value=value;$('activity-percent').textContent=Math.round(value)+'%';if(count)$('activity-count').textContent=count;}
function stage(step,title,detail,value,count){
  if(activityStep!==step){activityStep=step;eventLog(title);}
  $('activity-title').textContent=title;$('activity-detail').textContent=detail;setProgress(value,count);
  [...$('activity-steps').children].forEach((li,i)=>{li.dataset.state=i<step?'done':i===step?'current':'pending';if(i===step)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});
}
function endActivity(state,message){
  clearInterval(activityTimer);activityTimer=null;activity.dataset.state=state;activity.setAttribute('aria-busy','false');$('activity-title').textContent=state==='done'?'Operazione completata':state==='cancelled'?'Operazione annullata':'Elaborazione interrotta';$('activity-detail').textContent=message;$('activity-heartbeat').textContent=state==='error'?'Il processo si è fermato. Correggi il problema indicato e riprova.':state==='done'?'Elaborazione terminata.':'';eventLog(message);
  if(state==='done'){setProgress(100,'Completato');[...$('activity-steps').children].forEach(li=>{li.dataset.state='done';li.removeAttribute('aria-current');});}
  else $('activity-count').textContent=state==='cancelled'?'Annullato':'Errore';
}
function status(text){$('status').textContent=text;}
function diagnostic(name,message,ok=false){
  if(!logs.has(name)){const row=document.createElement('p');logs.set(name,row);$('diagnostics').append(row);}
  const row=logs.get(name);row.textContent=name.replace('models/','')+' · '+message;row.classList.toggle('ok',ok);
  $('test-count').textContent=`(${logs.size})`;
  if(busy&&!activity.hidden){eventLog(name.replace('models/','')+' · '+message);if(!ok)$('activity-detail').textContent=message;}
}
function sync(){
  $('translate').disabled=busy||!source||!workingModels.includes($('model').value)||!$('key').value.trim();
  for(const id of ['test','file','key','model','language','notes','review','show-key','sample','provider','remember'])$(id).disabled=busy;
  for(const b of document.querySelectorAll('[data-provider]'))b.disabled=busy;
  document.body.classList?.toggle('has-file',!!source);
  for(const b of $('model-list')?.children||[])if(b.dataset?.off)b.disabled=busy||b.dataset.off==='1';
  $('cancel').hidden=!busy;$('translate').hidden=busy;
  $('prev').disabled=busy||!source||pageNumber===1;$('next').disabled=busy||!source||pageNumber>=source.numPages;
}
function clearResult(){result?.destroy();result=null;if(downloadURL)URL.revokeObjectURL(downloadURL);downloadURL=null;$('download').hidden=true;$('translated').style.display='none';$('empty-result').hidden=false;}
function preview(){
  const version=++renderVersion,n=pageNumber,original=source,output=result;
  renderQueue=renderQueue.catch(()=>{}).then(async()=>{
    if(version!==renderVersion)return;
    $('page-label').textContent=original?`${n} / ${original.numPages}`:'— / —';
    for(const [doc,id,empty]of [[original,'original','empty'],[output,'translated','empty-result']]){
      if(!doc)continue;const page=await doc.getPage(n);if(version!==renderVersion)return;
      const viewport=page.getViewport({scale:1.3}),canvas=$(id);canvas.width=viewport.width;canvas.height=viewport.height;
      await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
      if(version!==renderVersion)return;canvas.style.display='block';$(empty).hidden=true;
    }
  }).catch(()=>status('Anteprima non disponibile. Ricarica il documento.'));
  sync();return renderQueue;
}
async function load(file){
  if(busy||!file)return;
  if(file.size>25*1024*1024){status('Il file supera il limite di 25 MB.');return;}
  busy=true;controller=new AbortController();const signal=controller.signal;sync();startActivity('Caricamento del PDF',false);++renderVersion;
  try{
    await paint();await renderQueue;clearResult();await source?.destroy();source=null;$('original').style.display='none';$('empty').hidden=false;$('progress').value=0;
    signal.throwIfAborted();
    const bytes=new Uint8Array(await file.arrayBuffer());if(new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw Error('Seleziona un file PDF valido.');
    const doc=await pdfjsLib.getDocument({data:bytes.slice(),isEvalSupported:false}).promise;
    if(doc.numPages>100){await doc.destroy();throw Error('Limite beta: massimo 100 pagine.');}
    source=doc;source.originalBytes=bytes;fileName=file.name;pageNumber=1;
    $('file-name').textContent=file.name;$('file-info').textContent=`${doc.numPages} pagine · ${(file.size/1024/1024).toFixed(2)} MB · clicca per sostituire`;
    // Characters of selectable text: basis of the cost estimate for this document.
    let chars=0;for(let n=1;n<=doc.numPages;n++){const c=await (await doc.getPage(n)).getTextContent();for(const it of c.items)chars+=(it.str||'').trim().length;}source.chars=chars;updateEstimate();
    signal.throwIfAborted();status('Documento caricato. Scegli la lingua e avvia la traduzione.');await preview();endActivity('done','PDF caricato: '+doc.numPages+' pagine. Pronto per la traduzione.');
  }catch(error){await source?.destroy();source=null;$('original').style.display='none';$('empty').hidden=false;const message=signal.aborted?'Caricamento annullato.':error.name==='PasswordException'?'PDF protetto da password non supportato.':error.message;status(message);endActivity(signal.aborted?'cancelled':'error',message);$('file-name').textContent='Scegli un altro documento';$('file-info').textContent='Il file non è stato caricato.';updateEstimate();}
  finally{busy=false;controller=null;$('file').value='';sync();}
}
$('file').addEventListener('change',e=>load(e.target.files[0]));
$('sample').onclick=async()=>{
  if(busy)return;
  try{const response=await fetch('test-fixture.pdf');if(!response.ok)throw Error('Esempio non disponibile.');const blob=await response.blob();if(busy)return;await load(new File([blob],'docushift-esempio.pdf',{type:'application/pdf'}));}
  catch(error){status(error.message);}
};
// The whole workspace accepts a dropped PDF.
const dropZone=$('work')||$('drop');
for(const type of ['dragenter','dragover'])dropZone.addEventListener(type,e=>{e.preventDefault();if(!busy)dropZone.classList.add('drag');});
for(const type of ['dragleave','drop'])dropZone.addEventListener(type,e=>{e.preventDefault();if(type==='dragleave'&&dropZone.contains?.(e.relatedTarget))return;dropZone.classList.remove('drag');if(type==='drop')load(e.dataTransfer.files[0]);});
$('empty').onclick=()=>{if(!busy)$('file').click();};
$('show-key').onclick=()=>{const hidden=$('key').type==='password';$('key').type=hidden?'text':'password';$('show-key').setAttribute('aria-label',hidden?'Nascondi chiave':'Mostra chiave');};
$('key').addEventListener('input',()=>{if(currentProvider==='openai'){keyStatus('');clearTimeout(verifyTimer);verifyTimer=setTimeout(verifyKey,450);workingModels=[];}else resetModels();if($('remember').checked)storeKey(currentProvider,$('key').value.trim());sync();});
$('remember').onchange=()=>{storeKey(currentProvider,$('remember').checked?$('key').value.trim():'');};
for(const b of document.querySelectorAll('[data-provider]'))b.onclick=()=>{if(busy||b.dataset.provider===currentProvider)return;$('provider').value=b.dataset.provider;$('provider').onchange();};
$('model').onchange=()=>{updateEstimate();sync();};
$('prev').onclick=()=>{if(pageNumber>1){pageNumber--;preview();}};
$('next').onclick=()=>{if(pageNumber<source.numPages){pageNumber++;preview();}};
$('cancel').onclick=()=>{controller?.abort();status('Annullamento in corso…');};
$('test').onclick=async()=>{
  const key=$('key').value.trim();if(!key){status('Inserisci la tua API key '+providerName()+'.');$('key').focus();return;}
  const selectedModel=$('model').value;
  busy=true;controller=new AbortController();sync();startActivity('Verifica connessione '+providerName(),false);logs.clear();$('diagnostics').replaceChildren();$('diagnostics').parentElement.open=true;workingModels=[];if(currentProvider!=='openai')$('model').replaceChildren();status('Verifico la risposta di '+providerName()+'…');
  try{
    const count=await service().discover(key,controller.signal,diagnostic,model=>{workingModels.push(model.name);if(currentProvider!=='openai')$('model').add(new Option(model.displayName||model.name,model.name));},selectedModel);
    status(`${count} modelli verificati. Puoi avviare la traduzione.`);
    endActivity('done',`${count} modelli hanno risposto correttamente.`);
  }catch(error){const message=controller.signal.aborted?'Test annullato.':error.message;status(message);if(!controller.signal.aborted)diagnostic('Connessione',error.message);endActivity(controller.signal.aborted?'cancelled':'error',message);}
  finally{busy=false;controller=null;sync();}
};
$('translate').onclick=async()=>{
  if(busy||!source)return;
  busy=true;controller=new AbortController();const signal=controller.signal;sync();startActivity('Avvio della traduzione');let reviewNote='',costNote='';$('cost').hidden=true;
  const usage={input:0,cached:0,output:0},usedModel=$('model').value,meter=(model,u)=>{usage.input+=u.input_tokens??u.promptTokenCount??0;usage.cached+=u.input_tokens_details?.cached_tokens??u.cachedContentTokenCount??0;usage.output+=u.output_tokens??((u.candidatesTokenCount||0)+(u.thoughtsTokenCount||0));};
  globalThis.OpenAIService?.setMeter?.(meter);globalThis.AI?.setMeter?.(meter);
  try{
    await paint();await renderQueue;signal.throwIfAborted();clearResult();
    status('Analizzo il testo e verifico la struttura PDF…');
    stage(0,'Analisi del documento','Controllo della struttura e dei testi selezionabili.',0,'Preparazione PDF');await paint();
    const pages=await PDFEngine.parse(source.originalBytes,signal,(n,total,phase)=>{const checking=phase==='validate';stage(0,checking?'Verifica della struttura PDF':'Estrazione dei testi',`Pagina ${n} di ${total}`,checking?n/total*8:8+n/total*12,`${n} / ${total} pagine`);});
    window.setTranslationNotes($('notes').value);if($('notes').value.trim())eventLog('Indicazioni per l’AI: '+$('notes').value.trim().slice(0,200));
    if(pages.overlaps.length)eventLog(`Omessi ${pages.overlaps.length} frammenti stampati sopra altro testo nell’originale: ${pages.overlaps.join(" · ")}`);
    const units=pages.flat(),texts=units.map(u=>u.text),unique=[...new Set(units.filter(u=>u.translate).map(u=>u.text))],cache=new Map(),instructed=new Set();
    eventLog(`${units.length} blocchi di testo estratti · ${unique.length} da tradurre (paragrafi interi, etichette e celle).`);
    // Page and role of each text: the model needs them to apply instructions such as
    // "change the title of the first page" or to recognise a multilingual page.
    const context=new Map();
    pages.forEach((page,p)=>{const visible=page.filter(u=>!u.hidden&&u.translate);if(!visible.length)return;
      const weight=new Map();for(const u of visible)weight.set(u.size,(weight.get(u.size)||0)+u.text.length);
      const body=[...weight].sort((a,b)=>b[1]-a[1])[0][0],top=Math.max(...visible.map(u=>u.size));
      for(const u of visible){if(context.has(u.text))continue;const c={page:p+1};if(u.size===top&&top>=1.3*body)c.role='page title';else if(u.size>=1.15*body)c.role='heading';context.set(u.text,c);}});
    window.setTranslationContext(context);
    {
      // Batches keep neighbouring blocks together (context for the model) and run
      // a few at a time; any failed batch stops the export, nothing partial is saved.
      const svc=service(),key=$('key').value.trim(),model=$('model').value,language=$('language').value,quality=typeof svc.ask==='function';
      // 1. Glossary: one request fixes the recurring terms for every batch.
      let glossary=[];
      if(quality){
        stage(1,'Glossario del documento','Individuo i termini ricorrenti, i titoli e le parole di sicurezza da tradurre sempre allo stesso modo.',20,'Terminologia');status('Preparo il glossario del documento…');await paint();
        try{
          const data=await svc.ask(window.glossaryPrompt(language,unique),window.TRANSLATION_SCHEMAS.glossary,key,model,workingModels,signal,diagnostic);
          const seen=new Set();glossary=(data.terms||[]).filter(t=>typeof t?.source==='string'&&typeof t?.target==='string'&&t.source.trim()&&t.target.trim()&&!seen.has(t.source.toLowerCase())&&seen.add(t.source.toLowerCase())).slice(0,80).map(t=>({source:t.source.trim(),target:t.target.trim()}));
          eventLog(`Glossario: ${glossary.length} termini fissati.`);for(const t of glossary.slice(0,25))eventLog(`Glossario · ${t.source} → ${t.target}`);
        }catch(error){signal.throwIfAborted();eventLog('Glossario non disponibile ('+error.message+'): proseguo senza.');}
      }
      const sourceLanguage=new Map(),foreign=new Set();
      const batches=[];for(let offset=0;offset<unique.length;){const batch=[];let length=0;while(offset+batch.length<unique.length&&batch.length<40){const text=unique[offset+batch.length];if(batch.length&&length+text.length>3500)break;batch.push(text);length+=text.length;}batches.push({offset,batch});offset+=batch.length;}
      let done=0,next=0;const stop=new AbortController(),batchSignal=AbortSignal.any([signal,stop.signal]);const update=()=>{setProgress((quality?24:20)+done/unique.length*(quality?($('review').checked?48:56):60),`${done} / ${unique.length} testi tradotti`);status(`Traduzione in corso: ${done} di ${unique.length} testi…`);};
      stage(1,'Traduzione in corso',`${unique.length} testi in ${batches.length} richieste a ${providerName()}.`,quality?24:20,`0 / ${unique.length} testi tradotti`);update();await paint();
      // A reply with a different number of items (the model merged two fragments)
      // is retried on two halves, down to single strings.
      const translateBatch=async(batch,offset,...rest)=>{
        try{return await svc.translate(batch,...rest,glossary);}
        catch(error){
          if(batchSignal.aborted||batch.length===1||error.status!==422)throw error;
          const half=Math.ceil(batch.length/2);eventLog(`Risposta incompleta per i testi ${offset+1}–${offset+batch.length}: ritraduco in due parti.`);
          const a=await translateBatch(batch.slice(0,half),offset,...rest),b=await translateBatch(batch.slice(half),offset+half,...rest),out=[...a,...b];out.languages=[...(a.languages||a.map(()=>'')),...(b.languages||b.map(()=>''))];out.instructed=[...(a.instructed||a.map(()=>false)),...(b.instructed||b.map(()=>false))];return out;
        }
      };
      const worker=async()=>{try{while(next<batches.length){batchSignal.throwIfAborted();const {offset,batch}=batches[next++];
        const output=await translateBatch(batch,offset,$('language').value,$('key').value.trim(),$('model').value,workingModels,batchSignal,diagnostic,attempt=>{const message=`${providerName()} · ${attempt.model.replace('models/','')} · testi ${offset+1}–${offset+batch.length} · ${attempt.state==='response'?'risposta ricevuta':'attesa risposta'}`;$('activity-detail').textContent=message;eventLog(message);});
        batch.forEach((text,i)=>{cache.set(text,output[i]);if(output.languages?.[i])sourceLanguage.set(text,output.languages[i]);if(output.instructed?.[i]&&output[i]!==text)instructed.add(text);});done+=batch.length;update();eventLog(`Ricevuti e verificati ${batch.length} testi tradotti.`);}}catch(error){stop.abort();throw error;}};
      const workers=Array.from({length:Math.min(currentProvider==='openai'?4:2,batches.length)},worker);
      const outcome=await Promise.allSettled(workers);signal.throwIfAborted();const failed=outcome.find(r=>r.status==='rejected'&&!(r.reason?.name==='AbortError'));if(failed)throw failed.reason;if(outcome.some(r=>r.status==='rejected'))throw Error('Traduzione interrotta.');
      // Passages in a language other than the document's main one (for example a
      // declaration repeated in several languages) keep their original text.
      if(sourceLanguage.size){
        const weight=new Map();for(const[text,lang]of sourceLanguage)weight.set(lang,(weight.get(lang)||0)+text.length);
        const main=[...weight].sort((a,b)=>b[1]-a[1])[0][0],kept=new Map();
        const langAt=i=>sourceLanguage.get(unique[i]);
        // Texts changed on the user's instructions are kept as the model returned them.
        unique.forEach((text,i)=>{const lang=langAt(i);if(!lang||lang===main||instructed.has(text)||!/\p{L}{3}/u.test(text))return;
          // Short fragments count as foreign only next to other fragments in the same language.
          if(text.replace(/<\/?s\d+>/g,'').trim().length<12&&langAt(i-1)!==lang&&langAt(i+1)!==lang)return;
          cache.set(text,text);foreign.add(text);kept.set(lang,(kept.get(lang)||0)+1);});
        if(kept.size)eventLog(`Lingua principale: ${main}. Lasciati in lingua originale ${[...kept.values()].reduce((a,b)=>a+b,0)} testi (${[...kept].map(([l,n])=>l+' '+n).join(', ')}).`);
      }
      if(instructed.size)eventLog(`Indicazioni applicate a ${instructed.size} testi: `+[...instructed].slice(0,8).map(t=>`«${t.slice(0,40)}» → «${cache.get(t).slice(0,40)}»`).join(' · '));
      // 2. Final review: the model rereads source and translation of the whole
      // document and returns only the items to fix. Best effort: on error the
      // translation is kept as it is.
      if(quality&&$('review').checked){
        stage(1,'Revisione della traduzione','Rileggo originale e traduzione: errori di senso, terminologia, parole di sicurezza, lingue da lasciare invariate.',72,'Revisione');status('Revisione finale della traduzione…');await paint();
        const tags=t=>(t.match(/<\/?s\d+>/g)||[]).sort().join(),digits=t=>(t.match(/\d+/g)||[]).sort().join();
        const items=unique.map((source,id)=>({id,source,translation:cache.get(source)})).filter(it=>!foreign.has(it.source)&&!instructed.has(it.source)).map(it=>({...it,...context.get(it.source)})),byId=new Map(items.map(it=>[it.id,it])),chunks=[];
        for(let i=0;i<items.length;){const chunk=[];let length=0;while(i<items.length){const it=items[i],size=it.source.length+it.translation.length+20;if(chunk.length&&(length+size>12000||chunk.length>=80))break;chunk.push(it);length+=size;i++;}chunks.push(chunk);}
        let fixed=0,reviewed=0,next=0;
        const reviewWorker=async()=>{while(next<chunks.length){const chunk=chunks[next++];signal.throwIfAborted();
          try{
            const data=await svc.ask(window.reviewPrompt(language,glossary,chunk),window.TRANSLATION_SCHEMAS.review,key,model,workingModels,signal,diagnostic);
            for(const c of data.corrections||[]){
              const item=byId.get(c?.id);if(!item||!chunk.includes(item)||typeof c.translation!=='string'||!c.translation.trim()||c.translation===cache.get(item.source))continue;
              // Never accept a correction that alters numbers, codes or style tags of the source.
              if(tags(c.translation)!==tags(item.source)||digits(c.translation)!==digits(item.source))continue;
              const before=cache.get(item.source);cache.set(item.source,c.translation);fixed++;
              if(fixed<=60)eventLog(`Revisione · «${before.slice(0,60)}» → «${c.translation.slice(0,60)}»`);
            }
          }catch(error){signal.throwIfAborted();eventLog('Revisione parziale non completata ('+error.message+'): mantengo la traduzione.');}
          reviewed++;setProgress(72+reviewed/chunks.length*8,`Revisione ${reviewed} / ${chunks.length}`);$('activity-detail').textContent=`Revisione: ${reviewed} di ${chunks.length} parti.`;
        }};
        await Promise.all(Array.from({length:Math.min(currentProvider==='openai'?4:2,chunks.length)},reviewWorker));signal.throwIfAborted();
        reviewNote=fixed?` Revisione: ${fixed} correzioni applicate (dettagli nel registro).`:' Revisione: nessuna correzione necessaria.';eventLog(reviewNote.trim());
      }
    }
    // Glossary terms often come from all-caps headings or the table of contents:
    // running text whose source has no all-caps words must not gain any.
    {let recased=0;
      for(const text of unique){const tr=cache.get(text);if(!tr||tr===text||instructed.has(text))continue;
        if(/\b\p{Lu}{4,}\b/u.test(text.replace(/<\/?s\d+>/g,''))||!/\p{Ll}/u.test(text))continue;
        const fixed=tr.replace(/(^|[.!?:]\s+|\s|[(“"«'])(\p{Lu}{4,})(?=\b)/gu,(m,before,word)=>text.includes(word)?m:before+(/^$|[.!?:]\s+$/.test(before)?word[0]+word.slice(1).toLowerCase():word.toLowerCase()));
        if(fixed!==tr){cache.set(text,fixed);recased++;}}
      if(recased)eventLog(`Maiuscole: uniformate ${recased} traduzioni al testo originale.`);}
    signal.throwIfAborted();status('Rimuovo il testo originale e compongo il PDF…');$('progress').value=85;
    stage(2,'Creazione del PDF tradotto','Rimozione dei testi originali e inserimento delle traduzioni.',80,'Preparazione pagine');await paint();
    const built=await PDFEngine.build(source.originalBytes,pages,texts.map((t,i)=>units[i].translate?cache.get(t):t),signal,(n,total)=>{stage(2,'Creazione del PDF tradotto',`Composizione della pagina ${n} di ${total}.`,80+n/total*14,`${n} / ${total} pagine ricomposte`);});
    signal.throwIfAborted();
    stage(3,'Preparazione dell’anteprima','Apro il PDF esportato e preparo il download.',95,'Verifica risultato');await paint();
    result=await pdfjsLib.getDocument({data:built.bytes.slice(),isEvalSupported:false}).promise;
    signal.throwIfAborted();
    // Real cost of this document, from the token usage reported by the provider.
    if(usage.input+usage.output){const k=n=>n>=1000?(n/1000).toFixed(1).replace('.',',')+'k':String(n);const c=currentProvider==='openai'?OpenAIService.cost(usedModel,usage):null;
      $('cost').textContent=(c!=null?'Costo '+money(c)+' · ':'')+`${k(usage.input)} + ${k(usage.output)} token`;$('cost').title=`Token in ingresso ${usage.input} (in cache ${usage.cached}) · in uscita ${usage.output}${c!=null?` · ${OpenAIService.info(usedModel).label} a listino: $${c.toFixed(4)} · cambio ${usdToEur.toFixed(3)}`:''}`;$('cost').hidden=false;costNote=c!=null?` Costo da listino: ${money(c)} (l’addebito esatto, in dollari, è nel pannello OpenAI).`:` Token usati: ${usage.input+usage.output}.`;eventLog('Consumo: '+$('cost').title);}
    downloadURL=URL.createObjectURL(new Blob([built.bytes],{type:'application/pdf'}));$('download').href=downloadURL;$('download').download=fileName.replace(/\.pdf$/i,'')+'-'+$('language').value+'.pdf';$('download').hidden=false;
    await preview();signal.throwIfAborted();
    status('Traduzione completata. Il PDF è pronto.'+reviewNote+costNote+(pages.overlaps.length?` ${pages.overlaps.length} frammenti stampati sopra altro testo nell’originale sono stati omessi.`:'')+(built.shrunk?` ${built.shrunk} blocchi con carattere ridotto oltre il 20% per rispettare gli spazi.`:''));
    endActivity('done',$('status').textContent);
  }catch(error){clearResult();const message=signal.aborted?'Operazione annullata. Puoi riprovare.':error.message;status(message);endActivity(signal.aborted?'cancelled':'error',message);}
  finally{globalThis.OpenAIService?.setMeter?.(null);globalThis.AI?.setMeter?.(null);busy=false;controller=null;sync();}
};
$('provider').value=currentProvider;$('key').value=storedKey(currentProvider);providerUI();resetModels();sync();if($('key').value.trim())verifyKey();refreshRate();
