'use strict';
pdfjsLib.GlobalWorkerOptions.workerSrc='pdf.worker.min.js';
const $=id=>document.getElementById(id);
let source=null,result=null,fileName='',pageNumber=1,busy=false,controller=null,workingModels=[],downloadURL=null,renderVersion=0,renderQueue=Promise.resolve();
const logs=new Map();
const providerSessions=new Map();let currentProvider='gemini';
const providerName=()=>currentProvider==='openai'?'OpenAI':'Gemini';
const service=()=>currentProvider==='openai'?OpenAIService:AI;
function providerUI(){
  const openai=currentProvider==='openai';
  $('key-label').textContent='API key '+providerName();$('key').placeholder=openai?'sk-… · chiave OpenAI':'Incolla la tua chiave Gemini';
  $('key-link').href=openai?'https://platform.openai.com/api-keys':'https://aistudio.google.com/apikey';$('key-link').textContent=openai?'Crea una chiave OpenAI ↗':'Ottieni una chiave in Google AI Studio ↗';
  $('billing-link').hidden=!openai;$('test').textContent=openai?'✦ Testa il modello OpenAI':'✦ Trova un modello funzionante';
  $('provider-hint').textContent=openai?'API a consumo, separate dall’abbonamento ChatGPT. Il test esegue una sola richiesta sul modello scelto. Nessun cambio automatico di modello o provider.':'Il test prova fino a 6 modelli, privilegiando Flash. L’accesso non garantisce quota gratuita: verifica il piano in AI Studio.';
}
function resetModels(){workingModels=[];$('model').replaceChildren();if(currentProvider==='openai')for(const name of OpenAIService.models)$('model').add(new Option(name,name));else $('model').add(new Option('Prima verifica la connessione',''));}
$('provider').onchange=()=>{
  providerSessions.set(currentProvider,{key:$('key').value,verified:[...workingModels],options:[...$('model').options].map(o=>[o.text,o.value]),selected:$('model').value});
  currentProvider=$('provider').value;const saved=providerSessions.get(currentProvider);$('key').value=saved?.key||'';$('key').type='password';$('show-key').setAttribute('aria-label','Mostra chiave');
  resetModels();if(saved){workingModels=saved.verified;$('model').replaceChildren(...saved.options.map(([text,value])=>new Option(text,value)));$('model').value=saved.selected;}
  logs.clear();$('diagnostics').replaceChildren();$('test-count').textContent='';providerUI();sync();status(providerName()+' selezionato. '+(workingModels.includes($('model').value)?'Connessione già verificata in questa sessione.':'Inserisci la chiave e verifica il modello.'));
};
const activity=document.createElement('section');
activity.id='activity';activity.hidden=true;activity.setAttribute('aria-label','Stato elaborazione');
activity.innerHTML='<div class="activity-head"><span class="activity-spinner" aria-hidden="true"></span><div><strong id="activity-title"></strong><p id="activity-detail"></p></div><span id="activity-time">0:00</span></div><ol id="activity-steps"><li>Analisi PDF</li><li>Traduzione AI</li><li>Creazione PDF</li><li>Anteprima</li></ol><div class="activity-meta"><span id="activity-count">Avvio…</span><span id="activity-percent">0%</span></div><p id="activity-heartbeat"></p><details><summary>Attività e tentativi</summary><div id="activity-log" role="log" aria-live="polite"></div></details>';
$('progress').before(activity);
let activityTimer=null,activityStarted=0,lastActivity=0,activityStep=-1;
const paint=()=>new Promise(resolve=>setTimeout(resolve,0));
function eventLog(text){const row=document.createElement('p');row.textContent=new Date().toLocaleTimeString('it-IT')+' · '+text;$('activity-log').append(row);while($('activity-log').children.length>60)$('activity-log').firstChild.remove();lastActivity=Date.now();}
function tick(){const elapsed=Math.floor((Date.now()-activityStarted)/1000),waiting=Math.floor((Date.now()-lastActivity)/1000);$('activity-time').textContent=Math.floor(elapsed/60)+':'+String(elapsed%60).padStart(2,'0');$('activity-heartbeat').textContent=waiting>=10?`Nessun nuovo risultato da ${waiting} s. ${activityStep===1?'Il provider sta elaborando: ogni tentativo ha un limite di 45 s.':'Elaborazione del documento in corso.'}`:'In lavorazione · puoi annullare in qualsiasi momento.';}
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
  $('translate').disabled=busy||!source||(!$('demo').checked&&(!workingModels.includes($('model').value)||!$('key').value.trim()));
  for(const id of ['test','file','key','model','language','demo','review','show-key','sample','provider'])$(id).disabled=busy;
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
    signal.throwIfAborted();status('Documento caricato. Scegli la lingua e avvia la traduzione.');await preview();endActivity('done','PDF caricato: '+doc.numPages+' pagine. Pronto per la traduzione.');
  }catch(error){await source?.destroy();source=null;$('original').style.display='none';$('empty').hidden=false;const message=signal.aborted?'Caricamento annullato.':error.name==='PasswordException'?'PDF protetto da password non supportato.':error.message;status(message);endActivity(signal.aborted?'cancelled':'error',message);$('file-name').textContent='Scegli un altro documento';$('file-info').textContent='Il file non è stato caricato.';}
  finally{busy=false;controller=null;$('file').value='';sync();}
}
$('file').addEventListener('change',e=>load(e.target.files[0]));
$('sample').onclick=async()=>{
  if(busy)return;
  try{const response=await fetch('test-fixture.pdf');if(!response.ok)throw Error('Esempio non disponibile.');const blob=await response.blob();if(busy)return;$('demo').checked=true;await load(new File([blob],'docushift-esempio.pdf',{type:'application/pdf'}));}
  catch(error){status(error.message);}
};
for(const type of ['dragenter','dragover'])$('drop').addEventListener(type,e=>{e.preventDefault();if(!busy)$('drop').classList.add('drag');});
for(const type of ['dragleave','drop'])$('drop').addEventListener(type,e=>{e.preventDefault();$('drop').classList.remove('drag');if(type==='drop')load(e.dataTransfer.files[0]);});
$('show-key').onclick=()=>{const hidden=$('key').type==='password';$('key').type=hidden?'text':'password';$('show-key').setAttribute('aria-label',hidden?'Nascondi chiave':'Mostra chiave');};
$('key').addEventListener('input',()=>{const selected=$('model').value;resetModels();if(currentProvider==='openai')$('model').value=selected;sync();});
$('demo').onchange=sync;$('model').onchange=sync;
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
  busy=true;controller=new AbortController();const signal=controller.signal;sync();startActivity('Avvio della traduzione');let reviewNote='';
  try{
    await paint();await renderQueue;signal.throwIfAborted();clearResult();
    status('Analizzo il testo e verifico la struttura PDF…');
    stage(0,'Analisi del documento','Controllo della struttura e dei testi selezionabili.',0,'Preparazione PDF');await paint();
    const pages=await PDFEngine.parse(source.originalBytes,signal,(n,total,phase)=>{const checking=phase==='validate';stage(0,checking?'Verifica della struttura PDF':'Estrazione dei testi',`Pagina ${n} di ${total}`,checking?n/total*8:8+n/total*12,`${n} / ${total} pagine`);});
    const units=pages.flat(),texts=units.map(u=>u.text),unique=[...new Set(units.filter(u=>u.translate).map(u=>u.text))],cache=new Map();
    eventLog(`${units.length} blocchi di testo estratti · ${unique.length} da tradurre (paragrafi interi, etichette e celle).`);
    if($('demo').checked){stage(1,'Simulazione senza API','Genero etichette di prova: nessuna traduzione reale.',20,`${unique.length} testi`);await paint();for(let i=0;i<unique.length;i++)cache.set(unique[i],`[TEST ${i+1}]`);status('Simulazione: sostituisco il testo con etichette di prova.');}
    else{
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
          const a=await translateBatch(batch.slice(0,half),offset,...rest),b=await translateBatch(batch.slice(half),offset+half,...rest),out=[...a,...b];out.languages=[...(a.languages||a.map(()=>'')),...(b.languages||b.map(()=>''))];return out;
        }
      };
      const worker=async()=>{try{while(next<batches.length){batchSignal.throwIfAborted();const {offset,batch}=batches[next++];
        const output=await translateBatch(batch,offset,$('language').value,$('key').value.trim(),$('model').value,workingModels,batchSignal,diagnostic,attempt=>{const message=`${providerName()} · ${attempt.model.replace('models/','')} · testi ${offset+1}–${offset+batch.length} · ${attempt.state==='response'?'risposta ricevuta':'attesa risposta (massimo 45 s)'}`;$('activity-detail').textContent=message;eventLog(message);});
        batch.forEach((text,i)=>{cache.set(text,output[i]);if(output.languages?.[i])sourceLanguage.set(text,output.languages[i]);});done+=batch.length;update();eventLog(`Ricevuti e verificati ${batch.length} testi tradotti.`);}}catch(error){stop.abort();throw error;}};
      const workers=Array.from({length:Math.min(currentProvider==='openai'?4:2,batches.length)},worker);
      const outcome=await Promise.allSettled(workers);signal.throwIfAborted();const failed=outcome.find(r=>r.status==='rejected'&&!(r.reason?.name==='AbortError'));if(failed)throw failed.reason;if(outcome.some(r=>r.status==='rejected'))throw Error('Traduzione interrotta.');
      // Passages in a language other than the document's main one (for example a
      // declaration repeated in several languages) keep their original text.
      if(sourceLanguage.size){
        const weight=new Map();for(const[text,lang]of sourceLanguage)weight.set(lang,(weight.get(lang)||0)+text.length);
        const main=[...weight].sort((a,b)=>b[1]-a[1])[0][0],kept=new Map();
        const langAt=i=>sourceLanguage.get(unique[i]);
        unique.forEach((text,i)=>{const lang=langAt(i);if(!lang||lang===main||!/\p{L}{3}/u.test(text))return;
          // Short fragments count as foreign only next to other fragments in the same language.
          if(text.replace(/<\/?s\d+>/g,'').trim().length<12&&langAt(i-1)!==lang&&langAt(i+1)!==lang)return;
          cache.set(text,text);foreign.add(text);kept.set(lang,(kept.get(lang)||0)+1);});
        if(kept.size)eventLog(`Lingua principale: ${main}. Lasciati in lingua originale ${[...kept.values()].reduce((a,b)=>a+b,0)} testi (${[...kept].map(([l,n])=>l+' '+n).join(', ')}).`);
      }
      // 2. Final review: the model rereads source and translation of the whole
      // document and returns only the items to fix. Best effort: on error the
      // translation is kept as it is.
      if(quality&&$('review').checked){
        stage(1,'Revisione della traduzione','Rileggo originale e traduzione: errori di senso, terminologia, parole di sicurezza, lingue da lasciare invariate.',72,'Revisione');status('Revisione finale della traduzione…');await paint();
        const tags=t=>(t.match(/<\/?s\d+>/g)||[]).sort().join(),digits=t=>(t.match(/\d+/g)||[]).sort().join();
        const items=unique.map((source,id)=>({id,source,translation:cache.get(source)})).filter(it=>!foreign.has(it.source)),byId=new Map(items.map(it=>[it.id,it])),chunks=[];
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
    if(!$('demo').checked){let recased=0;
      for(const text of unique){const tr=cache.get(text);if(!tr||tr===text)continue;
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
    downloadURL=URL.createObjectURL(new Blob([built.bytes],{type:'application/pdf'}));$('download').href=downloadURL;$('download').download=fileName.replace(/\.pdf$/i,'')+($('demo').checked?'-test':'-'+$('language').value)+'.pdf';$('download').hidden=false;
    await preview();signal.throwIfAborted();
    status(($('demo').checked?'Simulazione completata. Il PDF contiene etichette di prova.':'Traduzione completata. Il PDF è pronto.'+reviewNote)+(built.shrunk?` ${built.shrunk} blocchi con carattere ridotto oltre il 20% per rispettare gli spazi.`:''));
    endActivity('done',$('status').textContent);
  }catch(error){clearResult();const message=signal.aborted?'Operazione annullata. Puoi riprovare.':error.message;status(message);endActivity(signal.aborted?'cancelled':'error',message);}
  finally{busy=false;controller=null;sync();}
};
providerUI();sync();
