'use strict';
const $ = id => document.getElementById(id);
const models = [
  {id:'mp',name:'McCulloch–Pitts',subtitle:'Una risposta sì o no.',summary:'Due segnali: basta la loro somma per decidere.',formula:'f(s) = 1 se s ≥ 2; altrimenti 0',functionText:'s indica la somma. Se arriva almeno a 2, la regola produce 1. Altrimenti produce 0.',takeaway:'Qui tutti gli ingressi contano allo stesso modo. Servono due segnali accesi per ottenere 1.',historyTitle:'1943 · Un’idea grande, fatta di piccoli sì e no',history:['Nel 1943 Warren McCulloch, che studiava il sistema nervoso, e Walter Pitts, appassionato di logica, si fanno una domanda: si può descrivere un pezzetto del funzionamento del cervello con la matematica? Non cercano di costruire una persona artificiale. Partono da qualcosa di molto più piccolo: una cellula che riceve segnali e decide se rispondere.', 'Immagina una porta che si apre soltanto quando sono premuti due pulsanti. Un pulsante da solo non basta; due insieme fanno scattare il meccanismo. È un esempio del tipo di regola che il loro neurone può rappresentare. Collegando tante unità semplici, mostrano come si possano costruire ragionamenti più articolati.', 'La novità è questa: anche una decisione può essere descritta come un calcolo. Il loro neurone non impara dagli errori; segue le regole assegnate. Ma quell’idea diventa uno dei punti di partenza per le reti neurali.'],note:'Qui mostriamo il caso con due ingressi, soglia 2 e nessun segnale che blocca l’uscita. È un esempio semplificato del modello.',source:'https://doi.org/10.1007/BF02478259'},
  {id:'perceptron',name:'Percettrone',subtitle:'Alcuni numeri contano di più.',summary:'Prima di sommare, dà un’importanza diversa agli ingressi.',formula:'f(s) = 1 se s ≥ 0; altrimenti 0',functionText:'s indica la somma. Se è zero o positiva, la regola produce 1. Se è negativa, produce 0.',takeaway:'Un “peso” è un moltiplicatore: stabilisce quanto conta un ingresso. Qui il primo viene raddoppiato e il secondo viene sottratto.',historyTitle:'1958 · E se la macchina potesse imparare dagli esempi?',history:['Nel 1958 Frank Rosenblatt presenta il perceptron. La domanda fa un passo avanti: invece di scrivere a mano ogni regola, possiamo dare a una macchina degli esempi e farle correggere il tiro? Il suo lavoro esplora proprio questa possibilità, anche per riconoscere schemi visivi.', 'Pensa a quando impari a scegliere un frutto maturo. All’inizio guardi il colore, poi scopri che contano anche il profumo e la consistenza. Con l’esperienza dai più importanza ad alcuni indizi e meno ad altri. È un paragone per capire i “pesi” del percettrone: numeri che stabiliscono quanto conta ciascun ingresso.', 'Durante l’apprendimento, gli errori possono far cambiare quei pesi. Quando deve dare una risposta, invece, il percettrone moltiplica, somma e sceglie tra 0 e 1. Non capisce il mondo come una persona: segue un procedimento matematico. Ma è un passo importante verso macchine capaci di migliorare grazie agli esempi.'],note:'Nella dimostrazione i pesi restano fissi a 2 e −1, con una correzione finale di −1. Osserviamo come nasce una risposta, non la fase di apprendimento.',source:'https://doi.org/10.1037/h0042519'}
];
const stageTitles=['Ecco i due numeri','Entra il primo valore','Entra il secondo valore','Completiamo la somma','La somma entra nella regola','La regola prepara la risposta','La risposta viaggia verso l’uscita','Il risultato è arrivato'];
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
let selected=0,stage=0,cycle=0,elapsed=0,last=null,running=!reducedMotion,stepMode=false;
const fmt=n=>String(n).replace('-', '−');
const signed=n=>n<0?`(${fmt(n)})`:fmt(n);
const data=()=>NeuronDemo.calculate(models[selected].id,cycle);
const totalDuration=NeuronDemo.durations.reduce((a,b)=>a+b,0);
function syncTransport(){
  $('pause').textContent=running?'Ⅱ Pausa':'▶ Riprendi';
  $('run-state').textContent=running?(stepMode?'UN PASSAGGIO ALLA VOLTA':'DIMOSTRAZIONE AUTOMATICA'):'IN PAUSA';
}
function render(){
  const m=models[selected],d=data(),simple=m.id==='mp';
  $('cycle').textContent=`Esempio ${cycle+1} · passaggio ${stage+1} di 8`;
  $('stage-number').textContent=stage+1;$('stage-title').textContent=stageTitles[stage];
  const descriptions=[
    simple?`Partiamo da ${d.x[0]} e ${d.x[1]}. Qui 1 significa “acceso” e 0 significa “spento”.`:`Partiamo da ${d.x[0]} e ${d.x[1]}. Prima di sommarli, ciascun numero incontra il suo moltiplicatore.`,
    simple?'Il primo numero percorre il collegamento. La somma lo accoglie soltanto quando arriva.':`Il primo numero incontra × 2: ${d.x[0]} × 2 = ${fmt(d.products[0])}. Segui il valore fino al centro.`,
    simple?'Ora parte il secondo numero. Il primo è già nel centro e aspetta di essere sommato.':`Ora il secondo numero incontra × (−1): ${d.x[1]} × (−1) = ${fmt(d.products[1])}. Il primo valore è già arrivato.`,
    simple?'Entrambi i valori sono arrivati: li mettiamo insieme con una somma.':'Aggiungiamo l’ultima correzione: −1. Anche questo valore entra nel centro prima di completare la somma.',
    'La somma è pronta. Ora percorre il collegamento ed entra nella casella della regola.',
    `La regola confronta la somma con ${simple?'2':'0'}. Solo dopo il confronto viene preparata la risposta.`,
    'La risposta è partita. L’area del risultato rimane vuota finché il numero non la raggiunge.',
    `È arrivato ${d.output}: questo è il risultato. Nel prossimo esempio cambieranno i numeri in ingresso.`
  ];
  $('stage-description').textContent=descriptions[stage];
  $('input-a').textContent=d.x[0];$('input-b').textContent=d.x[1];
  $('weight-a').textContent=simple?'nessuna modifica':'× 2';$('weight-b').textContent=simple?'nessuna modifica':'× (−1)';
  $('correction').textContent=simple?'':'correzione: −1';
  $('inputs-value').textContent=`${d.x[0]} e ${d.x[1]}`;
  $('inputs-explanation').textContent=simple?'Solo 0 e 1: spento oppure acceso.':'Sono i numeri ricevuti in questo esempio.';
  $('sum-formula').textContent=stage>=1?(simple?`${d.x[0]} + ${d.x[1]}`:`(${d.x[0]} × 2) + (${d.x[1]} × −1) − 1`):'Aspettiamo che entrino i numeri.';
  $('sum-explanation').textContent=simple?'Tutti gli ingressi contano allo stesso modo.':'I moltiplicatori si chiamano “pesi”. Il −1 finale è una correzione fissa.';
  $('function-formula').textContent=m.formula;$('function-explanation').textContent=m.functionText;
  const activeCard=stage===0?0:stage<=3?1:stage<=5?2:3;
  for(let i=0;i<4;i++){$('card-'+i).classList.toggle('active',activeCard===i);$('card-'+i).classList.toggle('done',activeCard>i);}
  $('sum-halo').classList.toggle('active',stage>=1&&stage<=3);$('rule-box').classList.toggle('active',stage===5);
  syncTransport();animate();
}
function animate(){
  const d=data(),simple=models[selected].id==='mp',p=Math.min(1,elapsed/NeuronDemo.durations[stage]);
  const v=NeuronDemo.visualState(stage,p);
  const before=NeuronDemo.durations.slice(0,stage).reduce((a,b)=>a+b,0);
  $('progress-fill').style.width=`${(before+elapsed)/totalDuration*100}%`;
  $('sum-number').textContent=v.sumReady?fmt(d.sum):v.secondArrived?fmt(d.products[0]+d.products[1]):v.firstArrived?fmt(d.products[0]):'?';
  $('sum-result').textContent=v.sumReady?`${fmt(d.products[0])} + ${signed(d.products[1])}${simple?'':' − 1'} = ${fmt(d.sum)}`:v.secondArrived?`${fmt(d.products[0])} + ${signed(d.products[1])} = ${fmt(d.products[0]+d.products[1])}`:v.firstArrived?`${fmt(d.products[0])} · primo valore arrivato`:'In attesa dei valori';
  // All destination readouts share one arrival gate: no premature answer.
  $('output-number').textContent=v.outputArrived?fmt(d.output):'?';
  $('output-caption').textContent=v.outputArrived?'ARRIVATO':'IN ATTESA';
  $('final-value').textContent=v.outputArrived?fmt(d.output):'?';
  $('final-explanation').textContent=v.outputArrived?`${fmt(d.sum)} ${d.output?'≥':'<'} ${simple?2:0} → esce ${d.output}`:'Il numero comparirà solo quando raggiungerà l’uscita.';
  $('output-node').classList.toggle('active',v.outputArrived);
  $('rule-line1').textContent=stage===5?`${fmt(d.sum)} ≥ ${simple?2:0}?`:`Somma ≥ ${simple?2:0}?`;
  $('rule-line2').textContent=stage===5?(v.ruleGenerated?`${d.output?'Sì':'No'} → ${d.output}`:'Confronto in corso…'):stage===6?'Risposta in viaggio':'Sì: 1 · No: 0';
  let html='';
  const badge=(x,y,value)=>`<g transform="translate(${x} ${y})"><rect x="-27" y="-19" width="54" height="38" rx="12"/><text y="6">${value}</text></g>`;
  if(stage===1||stage===2){
    const i=stage-1,t=p,u=1-t,sy=i===0?85:215;
    const x=u*u*u*95+3*u*u*t*250+3*u*t*t*260+t*t*t*400;
    const y=u*u*u*sy+3*u*u*t*sy+3*u*t*t*150+t*t*t*150;
    if(!reducedMotion)html=badge(x,y,fmt(t<.35?d.x[i]:d.products[i]));
  }else if(stage===3&&!simple&&p<.8&&!reducedMotion){
    html=badge(400,230-80*p/.8,'−1');
  }else if(stage===4&&!reducedMotion){
    html=badge(400+220*p,150,fmt(d.sum));
  }else if(stage===6&&!reducedMotion){
    html=badge(620+205*p,150,fmt(d.output));
  }
  $('moving-values').innerHTML=html;
}
function selectModel(index){
  selected=index;stage=0;cycle=0;elapsed=0;last=null;stepMode=false;
  const m=models[index];
  document.querySelectorAll('.model-tab').forEach((el,i)=>el.setAttribute('aria-pressed',String(index===i)));
  $('model-title').textContent=m.name;$('model-summary').textContent=m.summary;
  $('takeaway').textContent=m.takeaway;$('history-title').textContent=m.historyTitle;
  $('history').replaceChildren(...m.history.map(text=>{const paragraph=document.createElement('p');paragraph.textContent=text;return paragraph;}));
  $('model-note').textContent=m.note;$('source').href=m.source;
  render();
}
function next(){({stage,cycle}=NeuronDemo.advance(stage,cycle));elapsed=0;render();}
$('models').innerHTML=models.map((m,i)=>`<button type="button" class="model-tab" data-model="${i}" aria-pressed="${i===0}"><strong>${m.name}</strong><span>${m.subtitle}</span></button>`).join('');
document.querySelectorAll('.model-tab').forEach(el=>el.onclick=()=>selectModel(Number(el.dataset.model)));
$('pause').onclick=()=>{running=!running;stepMode=false;last=null;syncTransport();};
$('step').onclick=()=>{if(!running&&(stage===0||stage===7))next();stepMode=true;running=true;last=null;syncTransport();};
$('reset').onclick=()=>selectModel(selected);
function frame(now){
  const dt=last===null?0:Math.min(100,now-last);last=now;
  if(running&&!document.hidden){
    elapsed+=dt;
    if(elapsed>=NeuronDemo.durations[stage]){if(stepMode){running=false;stepMode=false;}next();}
    else animate();
  }
  requestAnimationFrame(frame);
}
document.addEventListener('visibilitychange',()=>{last=null;});
selectModel(0);requestAnimationFrame(frame);
