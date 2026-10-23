'use strict';
const $ = id => document.getElementById(id);
const fmt = n => Math.abs(n) < .0005 ? '0.00' : n.toFixed(2);
const models = [
  {id:'mp',year:'1943',name:'McCulloch–Pitts',author:'WARREN McCULLOCH & WALTER PITTS',symbol:'Σ',caption:'SOGLIA',experiment:'Accendi entrambi gli ingressi. Poi attiva l’inibizione: chi avrà l’ultima parola?',ideaTitle:'Il pensiero diventa logica.',idea:'Nel 1943 McCulloch e Pitts descrivono reti di unità “tutto o niente” capaci di esprimere operazioni logiche. Qui due ingressi eccitatori si sommano; un ingresso inibitorio attivo impedisce sempre l’uscita. Le connessioni sono fissate: questo modello non impara dai dati.',observeTitle:'Una decisione senza sfumature.',observe:'Con soglia 2 ottieni AND: servono entrambi gli ingressi. Con soglia 1 ottieni OR: ne basta uno. L’inibizione è un veto assoluto, non un peso negativo. Il calcolo mostra una singola transizione logica, senza il ritardo discreto delle reti originali.',insight:'Prova: con x₁ = x₂ = 1, attiva il veto. La somma resta 2, ma l’uscita diventa 0.',source:'https://doi.org/10.1007/BF02478259'},
  {id:'perceptron',year:'1958',name:'Perceptron',author:'FRANK ROSENBLATT',symbol:'Σ',caption:'GRADINO',experiment:'Imposta un obiettivo diverso dall’uscita. Esegui un passo di apprendimento e osserva i pesi.',ideaTitle:'Le connessioni diventano adattabili.',idea:'Il lavoro di Rosenblatt del 1958 dà forma al perceptron come sistema di riconoscimento che apprende. Qui esplori la sua unità di decisione nella formulazione didattica moderna: somma pesata, bias e soglia. Non è una ricostruzione dell’intera architettura storica.',observeTitle:'L’errore corregge la decisione.',observe:'Il neurone restituisce 1 quando z ≥ 0. Il pulsante aggiorna ogni peso con Δwᵢ = η(t − y)xᵢ e il bias con Δb = η(t − y), usando η = 0,1. Se la risposta è già corretta, non cambia nulla. Ogni clic usa soltanto l’esempio corrente.',insight:'Un singolo perceptron separa linearmente i dati: non può rappresentare XOR sui due ingressi originali.',source:'https://doi.org/10.1037/h0042519'},
  {id:'adaline',year:'1960',name:'ADALINE',author:'BERNARD WIDROW & MARCIAN HOFF',symbol:'Σ',caption:'LINEARE',experiment:'Scegli un valore obiettivo. Ripeti l’aggiornamento e osserva la risposta lineare avvicinarsi al bersaglio.',ideaTitle:'Imparare anche dall’intensità dell’errore.',idea:'Widrow e Hoff presentano ADALINE nel 1960. La differenza decisiva è la regola di adattamento: l’errore viene calcolato sul segnale lineare, prima di un’eventuale decisione a soglia. Qui osservi proprio quell’uscita continua.',observeTitle:'Una correzione proporzionale.',observe:'Con z = Σwᵢxᵢ + b, la regola LMS aggiorna i pesi con η(t − z)xᵢ. L’obiettivo è ridurre ½(t − z)². Anche una classificazione corretta può produrre un aggiornamento se il valore lineare è lontano dal bersaglio. Usiamo η = 0,1.',insight:'Confronta lo stesso esempio nel perceptron: lì conta l’errore della decisione, qui la distanza numerica.',source:'https://www-isl.stanford.edu/~widrow/publications.html'},
  {id:'sigmoid',year:'1986 · riferimento',name:'Sigmoide',author:'RUMELHART, HINTON & WILLIAMS',symbol:'σ',caption:'SIGMOIDE',experiment:'Porta la somma vicino a zero, poi verso gli estremi. Dove cambia di più l’uscita?',ideaTitle:'Una risposta morbida e derivabile.',idea:'Il lavoro del 1986 di Rumelhart, Hinton e Williams contribuisce a diffondere la backpropagation nelle reti multistrato con unità differenziabili. La sigmoide logistica è molto più antica: il 1986 è una tappa della sua applicazione alle reti, non la sua nascita.',observeTitle:'Tra zero e uno, senza un salto.',observe:'La funzione σ(z) = 1 / (1 + e⁻ᶻ) trasforma la somma in un valore tra 0 e 1. La derivata y(1 − y) raggiunge 0,25 a z = 0 e si riduce agli estremi: è la saturazione. Il laboratorio mostra la singola attivazione, non l’addestramento di una rete.',insight:'Un’uscita tra 0 e 1 non è automaticamente una probabilità calibrata: dipende dal modello e dall’addestramento.',source:'https://doi.org/10.1038/323533a0'},
  {id:'relu',year:'2010 · riferimento',name:'ReLU',author:'VINOD NAIR & GEOFFREY HINTON',symbol:'↗',caption:'RETTIFICA',experiment:'Rendi negativa la somma: il segnale si spegne. Rendila positiva: quanto ne passa?',ideaTitle:'Lasciare passare il segnale positivo.',idea:'Nair e Hinton mostrano nel 2010 l’efficacia di unità rettificate nelle Restricted Boltzmann Machines, una tappa della loro diffusione nel deep learning. La rettificazione ha antecedenti: il lavoro non coincide con l’invenzione della funzione max(0, z).',observeTitle:'Zero sotto soglia, lineare sopra.',observe:'La ReLU restituisce 0 per z ≤ 0 e z per z > 0. Sul lato positivo la derivata è 1; sul lato negativo è 0. In z = 0 la derivata non è definita: molti software scelgono convenzionalmente 0. Non esiste un limite superiore all’uscita.',insight:'Se un’unità resta sempre sul lato negativo, il gradiente locale è nullo: è il problema della “ReLU morta”.',source:'https://icml.cc/2010/papers/432.pdf'},
  {id:'lif',year:'radici · 1907',name:'Integrate-and-fire',author:'DALL’INTUIZIONE DI LOUIS LAPICQUE',symbol:'∫',caption:'MEMBRANA',experiment:'Aumenta la corrente oltre 1,5 nA. Osserva la carica, lo spike e il ritorno al potenziale di reset.',ideaTitle:'Qui il tempo fa parte del calcolo.',idea:'La famiglia integrate-and-fire ha radici nel lavoro di Lapicque del 1907. Questa simulazione usa la formulazione moderna leaky integrate-and-fire: una membrana accumula corrente ma perde parte della carica. È un ramo della modellazione neuronale, non il successore cronologico della ReLU.',observeTitle:'Accumula. Scarica. Ricomincia.',observe:'Usiamo τ dV/dt = −(V − Vrest) + RI, con Vrest = Vreset = −65 mV, R = 10 MΩ e soglia −50 mV. Alla soglia compare uno spike e V torna a −65 mV; seguono 2 ms refrattari. L’altezza del segno di spike è simbolica: il modello non ricostruisce la forma del potenziale d’azione.',insight:'Riduci la corrente a zero: il potenziale torna gradualmente a riposo. Il neurone conserva memoria del suo stato precedente.',source:'https://neuronaldynamics.epfl.ch/online/Ch1.S3.html'}
];
let selected = 0, state, running = !matchMedia('(prefers-reduced-motion: reduce)').matches, history = [], time = 0, phase = 0, last = 0, accumulator = 0;
const DT = 1, DISPLAY_STEP = 20, HISTORY_MAX = 200;
function initial(){return {x:[1,1],w:[.7,-.4],b:-.2,threshold:2,inhibited:false,target:1,current:2,tau:20,v:-65,refractory:0,spike:0,spikes:0};}
function range(id,label,value,min,max,step){return `<div class="control"><label for="${id}">${label}<output id="${id}-value" for="${id}">${fmt(value)}</output></label><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></div>`;}
function bindRange(id,fn){$(id).addEventListener('input',e=>{fn(Number(e.target.value));$(id+'-value').textContent=fmt(Number(e.target.value));render();});}
function toggle(id,label,value){return `<div class="toggle-row"><span>${label}</span><button type="button" id="${id}" aria-label="${label}" aria-pressed="${Boolean(value)}">${value?1:0}</button></div>`;}
function selectModel(index){
  selected=index;state=initial();history=[];time=0;phase=0;accumulator=0;
  const m=models[selected], kind=m.id;
  document.querySelectorAll('.model-tab').forEach((el,i)=>el.setAttribute('aria-pressed',String(i===index)));
  $('model-meta').textContent=m.year.toUpperCase()+' / '+m.author;$('model-title').textContent=m.name;
  for(const [id,key] of [['experiment','experiment'],['idea-title','ideaTitle'],['idea','idea'],['observe-title','observeTitle'],['observe','observe'],['insight','insight']])$(id).textContent=m[key];
  $('source').href=m.source;$('source').textContent=(kind==='lif'?'Approfondisci su Neuronal Dynamics':'Leggi la fonte storica')+' ↗';
  $('core-symbol').textContent=m.symbol;$('core-caption').textContent=m.caption;
  $('special-controls').innerHTML='';
  if(kind==='mp'){
    $('inputs').innerHTML=toggle('x0','Ingresso eccitatorio x₁',1)+toggle('x1','Ingresso eccitatorio x₂',1)+toggle('inhibit','Veto inibitorio',0)+range('threshold','Soglia θ',2,1,2,1)+'<div class="preset-row"><button id="and" type="button">Porta AND</button><button id="or" type="button">Porta OR</button></div>';
    for(let i=0;i<2;i++)$('x'+i).onclick=()=>{state.x[i]=1-state.x[i];$('x'+i).textContent=state.x[i];$('x'+i).setAttribute('aria-pressed',String(Boolean(state.x[i])));render();};
    $('inhibit').onclick=()=>{state.inhibited=!state.inhibited;$('inhibit').textContent=Number(state.inhibited);$('inhibit').setAttribute('aria-pressed',String(state.inhibited));render();};
    bindRange('threshold',v=>state.threshold=v);
    for(const [id,val] of [['and',2],['or',1]])$(id).onclick=()=>{state.threshold=val;$('threshold').value=val;$('threshold-value').textContent=fmt(val);render();};
    $('control-note').textContent='Entrambi gli ingressi sono binari. Nessun apprendimento: cambi gli stimoli e la regola logica.';
  }else if(kind==='lif'){
    $('inputs').innerHTML=range('current','Corrente I · nA',2,0,4,.05)+range('tau','Costante di tempo τ · ms',20,5,50,1);
    bindRange('current',v=>state.current=v);bindRange('tau',v=>state.tau=v);
    $('control-note').textContent='20 ms simulati per secondo reale. “Un passo” avanza di 20 ms. In pausa, il potenziale resta fermo anche se cambi corrente.';
  }else{
    $('inputs').innerHTML=range('x0','Ingresso x₁',1,-1,1,.05)+range('x1','Ingresso x₂',1,-1,1,.05)+range('w0','Peso w₁',.7,-3,3,.05)+range('w1','Peso w₂',-.4,-3,3,.05)+range('bias','Bias b',-.2,-3,3,.05);
    for(let i=0;i<2;i++){bindRange('x'+i,v=>state.x[i]=v);bindRange('w'+i,v=>state.w[i]=v);}bindRange('bias',v=>state.b=v);
    if(['perceptron','adaline'].includes(kind)){
      $('special-controls').innerHTML=range('target','Obiettivo t',1,kind==='adaline'?-1:0,1,kind==='adaline'?.1:1)+'<button type="button" class="train" id="train">Un passo di apprendimento ↗</button><p class="feedback" id="feedback" role="status">η = 0,1 · esempio corrente</p>';
      bindRange('target',v=>state.target=v);$('train').onclick=learn;
      $('control-note').textContent='I pesi cambiano solo quando premi il pulsante di apprendimento. Non è un addestramento automatico su un dataset.';
    }else $('control-note').textContent='Ogni cursore aggiorna subito il calcolo. La traccia registra la risposta nel tempo; non è il grafico della funzione di attivazione.';
  }
  $('third-label').textContent=kind==='mp'?'i':kind==='lif'?'τ':'b';
  render();syncTransport();
}
function result(){const kind=models[selected].id,z=NeuronMath.sum(state.x,state.w,state.b);return kind==='mp'?{z:state.x[0]+state.x[1],y:NeuronMath.mp(state.x,state.threshold,state.inhibited)}:kind==='lif'?{z:state.v,y:state.spike}:{z,y:NeuronMath.activate(kind,z)};}
function learn(){
  const kind=models[selected].id,r=NeuronMath.learn(kind,state.x,state.w,state.b,state.target,.1);
  state.w=r.w;state.b=r.b;
  for(const [id,v] of [['w0',state.w[0]],['w1',state.w[1]],['bias',state.b]]){const el=$(id);el.min=Math.min(-3,Math.floor(v));el.max=Math.max(3,Math.ceil(v));el.step='any';el.value=v;$(id+'-value').textContent=fmt(v);}
  $('feedback').textContent=`Errore prima: ${fmt(r.error)} → dopo: ${fmt(state.target-result().y)}. Pesi aggiornati con η = 0,1.`;render();
}
function advance(ms){
  for(let i=0;i<ms;i++){
    if(models[selected].id==='lif'){const r=NeuronMath.lif(state.v,state.refractory,state.current,DT,state.tau);Object.assign(state,r);state.spikes+=r.spike;}
    time+=DT;
    // Keep spikes visible in the sampled temporal trace, without changing the model.
    if(models[selected].id==='lif' && state.spike) pendingSpike=true;
    if(models[selected].id==='lif'||time%DISPLAY_STEP===0){const r=result();history.push({y:r.y,v:state.v,spike:pendingSpike});pendingSpike=false;if(history.length>HISTORY_MAX)history.shift();}
  }
  phase+=ms/(models[selected].id==='lif'?45:900);
}
let pendingSpike=false;
function render(){
  const kind=models[selected].id,{z,y}=result();
  $('clock').textContent=`t = ${time} ms`;
  $('sum-title').textContent=kind==='lif'?'Potenziale V · mV':kind==='mp'?'Somma eccitatoria':'Somma pesata z';
  $('sum-value').textContent=fmt(z);
  $('rule-title').textContent=kind==='lif'?'Soglia · mV':kind==='mp'?'Soglia θ':kind==='sigmoid'||kind==='relu'?'Derivata locale':'Bias b';
  $('rule-value').textContent=kind==='lif'?'−50':kind==='mp'?state.threshold:kind==='sigmoid'?fmt(y*(1-y)):kind==='relu'?(z===0?'non definita':z>0?'1':'0'):fmt(state.b);
  $('output-title').textContent=kind==='lif'?'Spike totali':'Uscita y';$('output-value').textContent=kind==='lif'?state.spikes:fmt(y);
  $('diagram-output').textContent=kind==='lif'?(state.spike?'↑':'·'):fmt(y);
  $('sum-label').textContent=kind==='lif'?`V = ${fmt(state.v)} mV`:`${kind==='mp'?'Σx':'z'} = ${fmt(z)}`;
  const wireText=kind==='mp'?[`x₁ = ${state.x[0]}`,`x₂ = ${state.x[1]}`,state.inhibited?'VETO ATTIVO':'veto spento']:kind==='lif'?[`I = ${fmt(state.current)} nA`,'R = 10 MΩ',`τ = ${state.tau} ms`]:[`${fmt(state.x[0])} × ${fmt(state.w[0])}`,`${fmt(state.x[1])} × ${fmt(state.w[1])}`,`b = ${fmt(state.b)}`];
  wireText.forEach((t,i)=>$('wire'+i).textContent=t);
  document.querySelectorAll('.svg-label text')[0].textContent=kind==='lif'?'I':'x₁';document.querySelectorAll('.svg-label text')[1].textContent=kind==='lif'?'R':'x₂';
  $('formula').textContent=kind==='mp'?`y = (${state.x[0]} + ${state.x[1]} ≥ ${state.threshold}) ET (veto = 0) → ${y}${state.inhibited?' · bloccato dal veto':''}`:kind==='lif'?`${state.tau} · dV/dt = −(V + 65) + 10 × ${fmt(state.current)} · reset a −65 mV dopo lo spike`:`z = (${fmt(state.x[0])} × ${fmt(state.w[0])}) + (${fmt(state.x[1])} × ${fmt(state.w[1])}) + (${fmt(state.b)}) = ${fmt(z)} → ${kind==='sigmoid'?'σ(z)':kind==='relu'?'max(0, z)':kind==='perceptron'?'1 se z ≥ 0, altrimenti 0':'y = z'} = ${fmt(y)}`;
  drawScope();drawParticles();
}
function drawScope(){
  const lif=models[selected].id==='lif',values=history.map(p=>lif?p.v:p.y),lo=lif?-70:Math.min(0,...values),hi=lif?-45:Math.max(1,...values),py=v=>100-(v-lo)/(hi-lo)*80;
  let svg=[20,60,100].map(y=>`<path d="M30 ${y}H690" stroke="#27383b" fill="none"/>`).join('');
  svg+=`<text x="0" y="24" fill="#a2b4b3" font-size="9">${hi.toFixed(0)}</text><text x="0" y="104" fill="#a2b4b3" font-size="9">${lo.toFixed(0)}</text>`;
  if(lif)svg+=`<path d="M30 ${py(-50)}H690" stroke="#e7ae7f" stroke-dasharray="4 5"/>`;
  if(history.length){svg+=`<polyline points="${history.map((p,i)=>`${30+i*660/(HISTORY_MAX-1)},${py(lif?p.v:p.y)}`).join(' ')}" fill="none" stroke="#82e5c3" stroke-width="2" stroke-linejoin="round"/>`;if(lif)history.forEach((p,i)=>{if(p.spike){const x=30+i*660/(HISTORY_MAX-1);svg+=`<path d="M${x} 15v-10" stroke="#e7ae7f" stroke-width="2"/>`;}});}
  $('scope').innerHTML=svg;$('scope-title').textContent=lif?'MEMBRANA (VERDE) · SPIKE (RAME)':'USCITA NEL TEMPO';
  $('scope').setAttribute('aria-label',lif?'Potenziale di membrana e spike negli ultimi 200 millisecondi simulati':'Uscita negli ultimi 4 secondi simulati');
  $('scope-scale').textContent=lif?'−70 / −45 mV · 200 ms':'scala adattiva · finestra 4 s';
}
function drawParticles(){
  const kind=models[selected].id,{y}=result();let svg='';
  // Cubic Bezier points follow the exact input paths in the diagram.
  for(let i=0;i<3;i++){
    const signal=kind==='mp'?(i===2?Number(state.inhibited):state.x[i]):kind==='lif'?(i===0?state.current:0):i===2?state.b:state.x[i]*state.w[i];
    if(Math.abs(signal)<.001)continue;
    const startY=[70,160,250][i],t=(phase+i*.24)%1,u=1-t;
    const x=i===1?110+240*t:u*u*u*110+3*u*u*t*245+3*u*t*t*245+t*t*t*350;
    const cy=i===1?160:u*u*u*startY+3*u*u*t*startY+3*u*t*t*160+t*t*t*160;
    const color=(kind==='mp'&&i===2)||signal<0?'#e7ae7f':'#82e5c3';svg+=`<circle cx="${x}" cy="${cy}" r="${Math.min(5,2+Math.abs(signal))}" fill="${color}"/>`;
  }
  if(Math.abs(y)>.001)svg+=`<circle cx="${470+(phase%1)*160}" cy="160" r="4" fill="${y<0?'#e7ae7f':'#82e5c3'}"/>`;
  $('particles').innerHTML=svg;
}
function syncTransport(){$('pause').textContent=running?'Ⅱ Pausa':'▶ Riprendi';$('run-state').textContent=running?'IN ESECUZIONE':'IN PAUSA';}
$('models').innerHTML=models.map((m,i)=>`<button type="button" class="model-tab" aria-pressed="${i===0}" data-model="${i}"><span>${m.year}</span><strong>${m.name}</strong></button>`).join('');
document.querySelectorAll('.model-tab').forEach(el=>el.onclick=()=>{pendingSpike=false;selectModel(Number(el.dataset.model));});
$('pause').onclick=()=>{running=!running;accumulator=0;syncTransport();};
$('step').onclick=()=>{running=false;accumulator=0;advance(DISPLAY_STEP);render();syncTransport();};
$('reset').onclick=()=>{pendingSpike=false;selectModel(selected);};
function frame(stamp){
  const elapsed=last?Math.min(stamp-last,100):0;last=stamp;
  if(running&&!document.hidden){accumulator+=elapsed/(models[selected].id==='lif'?50:1);const ms=Math.floor(accumulator);if(ms){accumulator-=ms;advance(ms);render();}}
  requestAnimationFrame(frame);
}
document.addEventListener('visibilitychange',()=>{last=0;accumulator=0;});
selectModel(0);requestAnimationFrame(frame);
