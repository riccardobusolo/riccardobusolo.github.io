'use strict';
pdfjsLib.GlobalWorkerOptions.workerSrc='pdf.worker.min.js';
const $=id=>document.getElementById(id);
let source=null,result=null,fileName='',pageNumber=1,busy=false,controller=null,workingModels=[],downloadURL=null,renderVersion=0,renderQueue=Promise.resolve();
const logs=new Map();
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
  for(const id of ['test','file','key','model','language','demo','show-key','sample'])$(id).disabled=busy;
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
$('key').addEventListener('input',()=>{workingModels=[];$('model').replaceChildren(new Option('Verifica la nuova chiave',''));sync();});
$('demo').onchange=sync;$('model').onchange=sync;
$('prev').onclick=()=>{if(pageNumber>1){pageNumber--;preview();}};
$('next').onclick=()=>{if(pageNumber<source.numPages){pageNumber++;preview();}};
$('cancel').onclick=()=>{controller?.abort();status('Annullamento in corso…');};
$('test').onclick=async()=>{
  const key=$('key').value.trim();if(!key){status('Inserisci la tua API key Gemini.');$('key').focus();return;}
  busy=true;controller=new AbortController();sync();startActivity('Verifica dei modelli Gemini',false);logs.clear();$('diagnostics').replaceChildren();$('diagnostics').parentElement.open=true;workingModels=[];$('model').replaceChildren();status('Cerco i modelli accessibili e verifico le risposte…');
  try{
    const count=await AI.discover(key,controller.signal,diagnostic,model=>{workingModels.push(model.name);$('model').add(new Option(model.displayName||model.name,model.name));});
    status(`${count} modelli verificati. Puoi avviare la traduzione.`);
    endActivity('done',`${count} modelli hanno risposto correttamente.`);
  }catch(error){const message=controller.signal.aborted?'Test annullato.':error.message;status(message);if(!controller.signal.aborted)diagnostic('Connessione',error.message);endActivity(controller.signal.aborted?'cancelled':'error',message);}
  finally{busy=false;controller=null;sync();}
};
$('translate').onclick=async()=>{
  if(busy||!source)return;
  busy=true;controller=new AbortController();const signal=controller.signal;sync();startActivity('Avvio della traduzione');
  try{
    await paint();await renderQueue;signal.throwIfAborted();clearResult();
    status('Analizzo il testo e verifico la struttura PDF…');
    stage(0,'Analisi del documento','Controllo della struttura e dei testi selezionabili.',0,'Preparazione PDF');await paint();
    const pages=await PDFEngine.parse(source.originalBytes,signal,(n,total,phase)=>{const checking=phase==='validate';stage(0,checking?'Verifica della struttura PDF':'Estrazione dei testi',`Pagina ${n} di ${total}`,checking?n/total*8:8+n/total*12,`${n} / ${total} pagine`);});
    const texts=pages.flat().map(b=>b.text),unique=[...new Set(texts)],cache=new Map();
    eventLog(`${texts.length} righe estratte · ${unique.length} testi unici.`);
    if($('demo').checked){stage(1,'Simulazione senza API','Genero etichette di prova: nessuna traduzione reale.',20,`${unique.length} testi`);await paint();for(let i=0;i<unique.length;i++)cache.set(unique[i],`[TEST ${i+1}]`);status('Simulazione: sostituisco il testo con etichette di prova.');}
    else{
      for(let offset=0;offset<unique.length;){
        signal.throwIfAborted();const batch=[];let length=0;
        while(offset+batch.length<unique.length&&batch.length<35){const text=unique[offset+batch.length];if(batch.length&&length+text.length>4500)break;batch.push(text);length+=text.length;}
        status(`Traduzione dei testi ${offset+1}–${offset+batch.length} di ${unique.length}…`);
        stage(1,'Traduzione in corso',`Invio dei testi ${offset+1}–${offset+batch.length} di ${unique.length}.`,20+offset/unique.length*60,`${offset} / ${unique.length} testi tradotti`);await paint();
        const output=await AI.translate(batch,$('language').value,$('key').value.trim(),$('model').value,workingModels,signal,diagnostic,attempt=>{const message=`${attempt.model.replace('models/','')} · tentativo ${attempt.index} / ${attempt.total} · ${attempt.state==='response'?'risposta ricevuta':'attesa risposta (massimo 45 s)'}`;$('activity-detail').textContent=message;eventLog(message);});
        batch.forEach((text,i)=>cache.set(text,output[i]));offset+=batch.length;setProgress(20+offset/unique.length*60,`${offset} / ${unique.length} testi tradotti`);eventLog(`Ricevuti e verificati ${batch.length} testi tradotti.`);
      }
    }
    signal.throwIfAborted();status('Rimuovo il testo originale e compongo il PDF…');$('progress').value=85;
    stage(2,'Creazione del PDF tradotto','Rimozione dei testi originali e inserimento delle traduzioni.',80,'Preparazione pagine');await paint();
    const built=await PDFEngine.build(source.originalBytes,pages,texts.map(t=>cache.get(t)),signal,(n,total)=>{stage(2,'Creazione del PDF tradotto',`Composizione della pagina ${n} di ${total}.`,80+n/total*14,`${n} / ${total} pagine ricomposte`);});
    signal.throwIfAborted();
    stage(3,'Preparazione dell’anteprima','Apro il PDF esportato e preparo il download.',95,'Verifica risultato');await paint();
    result=await pdfjsLib.getDocument({data:built.bytes.slice(),isEvalSupported:false}).promise;
    signal.throwIfAborted();
    downloadURL=URL.createObjectURL(new Blob([built.bytes],{type:'application/pdf'}));$('download').href=downloadURL;$('download').download=fileName.replace(/\.pdf$/i,'')+($('demo').checked?'-test':'-'+$('language').value)+'.pdf';$('download').hidden=false;
    await preview();signal.throwIfAborted();
    status(($('demo').checked?'Simulazione completata. Il PDF contiene etichette di prova.':'Traduzione completata. Il PDF è pronto.')+(built.shrunk?` ${built.shrunk} righe ridotte oltre il 20% per rispettare gli spazi.`:''));
    endActivity('done',$('status').textContent);
  }catch(error){clearResult();const message=signal.aborted?'Operazione annullata. Puoi riprovare.':error.message;status(message);endActivity(signal.aborted?'cancelled':'error',message);}
  finally{busy=false;controller=null;sync();}
};
sync();
