'use strict';
pdfjsLib.GlobalWorkerOptions.workerSrc='pdf.worker.min.js';
const $=id=>document.getElementById(id);
let source=null,result=null,fileName='',pageNumber=1,busy=false,controller=null,workingModels=[],downloadURL=null,renderVersion=0,renderQueue=Promise.resolve();
const logs=new Map();
function status(text){$('status').textContent=text;}
function diagnostic(name,message,ok=false){
  if(!logs.has(name)){const row=document.createElement('p');logs.set(name,row);$('diagnostics').append(row);}
  const row=logs.get(name);row.textContent=name.replace('models/','')+' · '+message;row.classList.toggle('ok',ok);
  $('test-count').textContent=`(${logs.size})`;
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
  busy=true;sync();++renderVersion;await renderQueue;clearResult();await source?.destroy();source=null;$('original').style.display='none';$('empty').hidden=false;$('progress').value=0;
  try{
    const bytes=new Uint8Array(await file.arrayBuffer());if(new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw Error('Seleziona un file PDF valido.');
    const doc=await pdfjsLib.getDocument({data:bytes.slice(),isEvalSupported:false}).promise;
    if(doc.numPages>100){await doc.destroy();throw Error('Limite beta: massimo 100 pagine.');}
    source=doc;source.originalBytes=bytes;fileName=file.name;pageNumber=1;
    $('file-name').textContent=file.name;$('file-info').textContent=`${doc.numPages} pagine · ${(file.size/1024/1024).toFixed(2)} MB · clicca per sostituire`;
    status('Documento caricato. Scegli la lingua e avvia la traduzione.');await preview();
  }catch(error){status(error.name==='PasswordException'?'PDF protetto da password non supportato.':error.message);$('file-name').textContent='Scegli un altro documento';$('file-info').textContent='Il file non è stato caricato.';}
  finally{busy=false;$('file').value='';sync();}
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
  busy=true;controller=new AbortController();sync();logs.clear();$('diagnostics').replaceChildren();$('diagnostics').parentElement.open=true;workingModels=[];$('model').replaceChildren();status('Cerco i modelli accessibili e verifico le risposte…');
  try{
    const count=await AI.discover(key,controller.signal,diagnostic,model=>{workingModels.push(model.name);$('model').add(new Option(model.displayName||model.name,model.name));});
    status(`${count} modelli verificati. Puoi avviare la traduzione.`);
  }catch(error){status(controller.signal.aborted?'Test annullato.':error.message);if(!controller.signal.aborted)diagnostic('Connessione',error.message);}
  finally{busy=false;controller=null;sync();}
};
$('translate').onclick=async()=>{
  if(busy||!source)return;
  busy=true;controller=new AbortController();const signal=controller.signal;sync();await renderQueue;clearResult();$('progress').value=0;
  try{
    status('Analizzo il testo e verifico la struttura PDF…');
    const pages=await PDFEngine.parse(source.originalBytes,signal,(n,total)=>{$('progress').value=n/total*20;});
    const texts=pages.flat().map(b=>b.text),unique=[...new Set(texts)],cache=new Map();
    if($('demo').checked){for(let i=0;i<unique.length;i++)cache.set(unique[i],`[TEST ${i+1}]`);status('Simulazione: sostituisco il testo con etichette di prova.');}
    else{
      for(let offset=0;offset<unique.length;){
        signal.throwIfAborted();const batch=[];let length=0;
        while(offset+batch.length<unique.length&&batch.length<35){const text=unique[offset+batch.length];if(batch.length&&length+text.length>4500)break;batch.push(text);length+=text.length;}
        status(`Traduzione dei testi ${offset+1}–${offset+batch.length} di ${unique.length}…`);
        const output=await AI.translate(batch,$('language').value,$('key').value.trim(),$('model').value,workingModels,signal,diagnostic);
        batch.forEach((text,i)=>cache.set(text,output[i]));offset+=batch.length;$('progress').value=20+offset/unique.length*60;
      }
    }
    signal.throwIfAborted();status('Rimuovo il testo originale e compongo il PDF…');$('progress').value=85;
    const built=await PDFEngine.build(source.originalBytes,pages,texts.map(t=>cache.get(t)),signal);
    signal.throwIfAborted();
    result=await pdfjsLib.getDocument({data:built.bytes.slice(),isEvalSupported:false}).promise;
    signal.throwIfAborted();
    downloadURL=URL.createObjectURL(new Blob([built.bytes],{type:'application/pdf'}));$('download').href=downloadURL;$('download').download=fileName.replace(/\.pdf$/i,'')+($('demo').checked?'-test':'-'+$('language').value)+'.pdf';$('download').hidden=false;
    $('progress').value=100;await preview();
    status(($('demo').checked?'Simulazione completata. Il PDF contiene etichette di prova.':'Traduzione completata. Il PDF è pronto.')+(built.shrunk?` ${built.shrunk} righe ridotte oltre il 20% per rispettare gli spazi.`:''));
  }catch(error){clearResult();$('progress').value=0;status(signal.aborted?'Operazione annullata. Puoi riprovare.':error.message);}
  finally{busy=false;controller=null;sync();}
};
sync();
