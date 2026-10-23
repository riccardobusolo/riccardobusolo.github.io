'use strict';
const $ = id => document.getElementById(id);
const models = [
  {id:'mp',name:'McCulloch–Pitts',subtitle:'Una risposta sì o no.',summary:'Due segnali: basta la loro somma per decidere.',rule:['Somma ≥ 2?','Sì: 1 · No: 0'],formula:'f(s) = 1 se s ≥ 2; altrimenti 0',functionText:'s indica la somma. La funzione è una regola: se la somma arriva a 2, esce 1. Altrimenti esce 0.',takeaway:'Qui tutti gli ingressi contano allo stesso modo. Servono due segnali accesi per ottenere 1.',history:'Nel 1943 Warren McCulloch e Walter Pitts descrivono neuroni artificiali con risposte tutto-o-niente. Mostriamo il caso semplice con due ingressi, soglia 2 e nessun ingresso inibitorio. Non impara: segue una regola fissa.',source:'https://doi.org/10.1007/BF02478259'},
  {id:'perceptron',name:'Percettrone',subtitle:'Alcuni numeri contano di più.',summary:'Prima di sommare, dà un’importanza diversa agli ingressi.',rule:['Somma ≥ 0?','Sì: 1 · No: 0'],formula:'f(s) = 1 se s ≥ 0; altrimenti 0',functionText:'s indica la somma. Se è zero o positiva, esce 1. Se è negativa, esce 0. La risposta è ancora sì oppure no.',takeaway:'Un “peso” è solo un moltiplicatore: stabilisce quanto conta un ingresso. Qui il primo viene raddoppiato e il secondo viene sottratto.',history:'Frank Rosenblatt presenta il perceptron nel 1958. I suoi pesi possono essere appresi dagli esempi. Qui li teniamo fissi (2 e −1), con una correzione di −1, chiamata bias, per mostrare soltanto come viene calcolata una risposta. Non stiamo simulando l’apprendimento.',source:'https://doi.org/10.1037/h0042519'},
  {id:'relu',name:'ReLU',subtitle:'Lascia passare i valori positivi.',summary:'La somma può diventare un risultato più grande di 1.',rule:['Tieni il maggiore','tra 0 e la somma'],formula:'f(s) = max(0, s)',functionText:'s indica la somma. “max” significa: scegli il valore più grande. Tra 0 e una somma negativa vince 0. Una somma positiva passa senza cambiare.',takeaway:'Con gli stessi ingressi e gli stessi pesi, il percettrone risponde 0 o 1. La ReLU può restituire anche 3, 4 o altri valori positivi.',history:'La ReLU è una funzione usata dentro i neuroni di molte reti moderne. Il lavoro di Nair e Hinton del 2010 è una tappa della sua diffusione, non l’invenzione della rettificazione. Usiamo gli stessi pesi e la stessa correzione del percettrone: cambia soltanto la regola finale.',source:'https://icml.cc/2010/papers/432.pdf'}
];
const stageTitles=['Arrivano due numeri','Il neurone fa la somma','La funzione applica la regola','Ecco il risultato'];
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
let selected=0,stage=0,cycle=0,elapsed=0,last=null,running=!reducedMotion;
const fmt=n=>String(n).replace('-', '−');
const signed=n=>n<0?`(${fmt(n)})`:fmt(n);
const data=()=>NeuronDemo.calculate(models[selected].id,cycle);
function syncTransport(){
  $('pause').textContent=running?'Ⅱ Pausa':'▶ Riprendi';
  $('run-state').textContent=running?'DIMOSTRAZIONE AUTOMATICA':'IN PAUSA';
}
function render(){
  const m=models[selected],d=data(),simple=m.id==='mp';
  $('cycle').textContent=`Esempio ${cycle+1} · passaggio ${stage+1} di 4`;
  $('stage-number').textContent=stage+1;$('stage-title').textContent=stageTitles[stage];
  const descriptions=[
    simple?`Entrano ${d.x[0]} e ${d.x[1]}. Qui 1 significa “acceso” e 0 significa “spento”.`:`Entrano ${d.x[0]} e ${d.x[1]}. I numeri cambiano a ogni giro; i moltiplicatori restano gli stessi.`,
    simple?`Sommiamo i due ingressi: ${d.x[0]} + ${d.x[1]} = ${d.sum}. “Sommatoria” significa proprio mettere insieme i valori con una somma.`:`Il primo numero viene moltiplicato per 2, il secondo per −1. Poi sommiamo i risultati e togliamo 1: otteniamo ${fmt(d.sum)}.`,
    simple?`La somma è ${d.sum}. Arriva almeno a 2? ${d.sum>=2?'Sì: la regola sceglie 1.':'No: la regola sceglie 0.'}`:m.id==='perceptron'?`La somma è ${fmt(d.sum)}. È almeno zero? ${d.sum>=0?'Sì: la regola sceglie 1.':'No: la regola sceglie 0.'}`:`Confrontiamo 0 e ${fmt(d.sum)}. Il maggiore è ${fmt(d.output)}: è il numero che passerà in uscita.`,
    `Esce ${fmt(d.output)}. Il neurone ha trasformato due numeri in un solo risultato. Tra poco arriverà un nuovo esempio.`
  ];
  $('stage-description').textContent=descriptions[stage];
  $('input-a').textContent=d.x[0];$('input-b').textContent=d.x[1];
  $('weight-a').textContent=simple?'nessuna modifica':'× 2';$('weight-b').textContent=simple?'nessuna modifica':'× (−1)';
  $('correction').textContent=simple?'':'poi togliamo 1';
  $('sum-number').textContent=stage>=2?fmt(d.sum):stage===1?'…':'?';
  $('rule-line1').textContent=m.rule[0];$('rule-line2').textContent=m.rule[1];
  $('output-number').textContent=stage===3?fmt(d.output):'?';$('output-caption').textContent=stage===3?'USCITA':'IN ATTESA';
  $('inputs-value').textContent=`${d.x[0]} e ${d.x[1]}`;
  $('inputs-explanation').textContent=simple?'Solo 0 e 1: spento oppure acceso.':'Sono i valori che il neurone riceve in questo esempio.';
  $('sum-formula').textContent=stage>=1?(simple?`${d.x[0]} + ${d.x[1]}`:`(${d.x[0]} × 2) + (${d.x[1]} × −1) − 1`):'Aspettiamo che entrino i numeri.';
  $('sum-result').textContent=stage>=2?`${fmt(d.products[0])} + ${signed(d.products[1])}${simple?'':' − 1'} = ${fmt(d.sum)}`:stage===1?'Calcolo in corso…':'—';
  $('sum-explanation').textContent=simple?'Tutti gli ingressi contano allo stesso modo.':'I moltiplicatori si chiamano “pesi”. Il −1 finale è una correzione fissa.';
  $('function-formula').textContent=m.formula;$('function-explanation').textContent=m.functionText;
  $('final-value').textContent=stage===3?fmt(d.output):'?';$('final-explanation').textContent=stage===3?(m.id==='relu'?`max(0, ${fmt(d.sum)}) = ${fmt(d.output)}`:`${fmt(d.sum)} ${d.output?'≥':'<'} ${simple?2:0} → esce ${d.output}`):'Il risultato compare dopo l’applicazione della regola.';
  for(let i=0;i<4;i++){$('card-'+i).classList.toggle('active',stage===i);$('card-'+i).classList.toggle('done',stage>i);}
  $('sum-halo').classList.toggle('active',stage===1);$('rule-box').classList.toggle('active',stage===2);$('output-node').classList.toggle('active',stage===3);
  syncTransport();animate();
}
function animate(){
  const d=data(),p=elapsed/NeuronDemo.duration;
  $('progress-fill').style.width=`${(stage+p)/4*100}%`;
  let html='';
  const badge=(x,y,value)=>`<g transform="translate(${x} ${y})"><rect x="-27" y="-19" width="54" height="38" rx="12"/><text y="6">${value}</text></g>`;
  if(stage===1){
    for(let i=0;i<2;i++){
      const t=reducedMotion?1:Math.min(1,Math.max(0,p*2.8-i*.9));
      const u=1-t,sy=i===0?85:215;
      const x=u*u*u*140+3*u*u*t*250+3*u*t*t*260+t*t*t*340;
      const y=u*u*u*sy+3*u*u*t*sy+3*u*t*t*150+t*t*t*150;
      if(t<1)html+=badge(x,y,fmt(t<.35?d.x[i]:d.products[i]));
    }
    if(p>.72){$('sum-number').textContent=fmt(d.sum);$('sum-result').textContent=`${fmt(d.products[0])} + ${signed(d.products[1])}${models[selected].id==='mp'?'':' − 1'} = ${fmt(d.sum)}`;}
  }
  if(stage===2&&!reducedMotion&&p<.55)html+=badge(470+Math.min(1,p/.55)*60,150,fmt(d.sum));
  if(stage===3&&!reducedMotion&&p<.6)html+=badge(720+Math.min(1,p/.6)*58,150,fmt(d.output));
  $('moving-values').innerHTML=html;
}
function selectModel(index){
  selected=index;stage=0;cycle=0;elapsed=0;last=null;
  const m=models[index];
  document.querySelectorAll('.model-tab').forEach((el,i)=>el.setAttribute('aria-pressed',String(index===i)));
  $('model-title').textContent=m.name;$('model-summary').textContent=m.summary;
  $('takeaway').textContent=m.takeaway;$('history').textContent=m.history;$('source').href=m.source;
  render();
}
function next(manual=false){({stage,cycle}=NeuronDemo.advance(stage,cycle));elapsed=manual?NeuronDemo.duration*.9:0;render();}
$('models').innerHTML=models.map((m,i)=>`<button type="button" class="model-tab" data-model="${i}" aria-pressed="${i===0}"><strong>${m.name}</strong><span>${m.subtitle}</span></button>`).join('');
document.querySelectorAll('.model-tab').forEach(el=>el.onclick=()=>selectModel(Number(el.dataset.model)));
$('pause').onclick=()=>{running=!running;last=null;syncTransport();};
$('step').onclick=()=>{running=false;last=null;next(true);};
$('reset').onclick=()=>selectModel(selected);
function frame(now){
  const dt=last===null?0:Math.min(100,now-last);last=now;
  if(running&&!document.hidden){elapsed+=dt;if(elapsed>=NeuronDemo.duration)next();else animate();}
  requestAnimationFrame(frame);
}
document.addEventListener('visibilitychange',()=>{last=null;});
selectModel(0);requestAnimationFrame(frame);
