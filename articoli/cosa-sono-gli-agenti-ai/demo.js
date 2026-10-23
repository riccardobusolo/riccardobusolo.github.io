'use strict';
const AgentExample = {
  offers: [{name:'Alfa',price:980,shipping:180,days:10},{name:'Beta',price:1180,shipping:0,days:5},{name:'Gamma',price:1050,shipping:90,days:7}],
  compare(budget, deadline, priority) {
    const rows=this.offers.map(o=>({...o,total:o.price+o.shipping,eligible:o.price+o.shipping<=budget&&o.days<=deadline}));
    const eligible=rows.filter(o=>o.eligible).sort((a,b)=>priority==='speed'?a.days-b.days||a.total-b.total:a.total-b.total||a.days-b.days);
    return {rows,winner:eligible[0]||null};
  }
};
if(typeof module!=='undefined')module.exports=AgentExample;
if(typeof document!=='undefined'){
  const $=id=>document.getElementById(id), euro=n=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
  const names=['Obiettivo','Lettura','Calcolo','Confronto','Conferma'];
  let step=0,confirmed=false;
  function render(){
    const budget=Number($('budget').value),deadline=Number($('deadline').value),priority=$('priority').value;
    const {rows,winner}=AgentExample.compare(budget,deadline,priority);
    $('stepper').innerHTML=names.map((name,i)=>`<li class="${i===step?'active':i<step?'done':''}" ${i===step?'aria-current="step"':''}><span>${i+1}</span>${name}</li>`).join('');
    $('stage-tag').textContent=`PASSAGGIO ${step+1} / 5 · ${['ISTRUZIONI','DOCUMENTI','CALCOLATRICE','VERIFICA DEI VINCOLI','CONTROLLO UMANO'][step]}`;
    const titles=['Definisce che cosa deve ottenere','Raccoglie le informazioni','Calcola il costo completo','Esclude ciò che non rispetta la richiesta',winner?'Si ferma prima di ordinare':'Si ferma: nessuna offerta è valida'];
    const messages=[`Confrontare tre preventivi entro ${euro(budget)}, con consegna entro ${deadline} giorni. Tra quelli validi, preferire ${priority==='price'?'il costo più basso':'la consegna più rapida'}.`,
      'Legge le tre offerte. Prezzo e spedizione sono due voci distinte: il numero più evidente non è necessariamente il totale.',
      'Usa una calcolatrice per aggiungere il trasporto. Il calcolo è controllabile, senza affidarsi a una risposta a memoria.',
      winner?`La proposta è ${winner.name}: ${euro(winner.total)}, consegna in ${winner.days} giorni. Rispetta entrambi i limiti ed è la migliore tra le offerte valide per la priorità scelta.`:'Nessuna offerta rispetta tutti i limiti. Non sceglie comunque un fornitore: propone di rivedere budget o scadenza, oppure cercare nuove offerte.',
      winner?'Prepara la proposta e attende il controllo della persona. Confrontare le offerte non equivale ad avere il permesso di fare un acquisto.':'Il compito si conclude con una spiegazione del problema. La persona può cambiare i criteri qui sopra e riprovare.'];
    $('stage-title').textContent=titles[step];$('stage-text').textContent=messages[step];
    let detail='';
    if(step===0)detail='<div class="task-note">Consegna prevista: tabella di confronto e raccomandazione.<br><strong>Limite: nessun ordine e nessun contatto con i fornitori.</strong></div>';
    if(step===1)detail=`<div class="offer-grid">${rows.map(o=>`<div class="offer"><span>PREVENTIVO ${o.name.toUpperCase()}</span><strong>${euro(o.price)}</strong><small>Trasporto: ${euro(o.shipping)}<br>Consegna: ${o.days} giorni</small></div>`).join('')}</div>`;
    if(step===2)detail=`<div class="calculations">${rows.map(o=>`<div><span>${o.name}</span><code>${euro(o.price)} + ${euro(o.shipping)}</code><strong>= ${euro(o.total)}</strong></div>`).join('')}</div>`;
    if(step===3)detail=`<div class="table-wrap"><table><caption>Confronto con i tuoi criteri</caption><thead><tr><th scope="col">Offerta</th><th scope="col">Totale</th><th scope="col">Giorni</th><th scope="col">Esito</th></tr></thead><tbody>${rows.map(o=>`<tr class="${winner&&o.name===winner.name?'chosen':''}"><th scope="row">${o.name}</th><td>${euro(o.total)}</td><td>${o.days}</td><td>${o.eligible?(o.name===winner.name?'Proposta':'Valida'):[o.total>budget?'Oltre budget':'',o.days>deadline?'Troppo tardi':''].filter(Boolean).join(' · ')}</td></tr>`).join('')}</tbody></table></div>`;
    if(step===4)detail=winner?`<div class="approval"><span>PROPOSTA DA VERIFICARE</span><strong>${winner.name} · ${euro(winner.total)} · ${winner.days} giorni</strong><button type="button" id="confirm" ${confirmed?'disabled':''}>${confirmed?'Conferma simulata ✓':'Simula la conferma della proposta'}</button><p>${confirmed?'Hai confermato la proposta nella dimostrazione. Nessun ordine è stato inviato.':'Controlla i documenti e le condizioni prima di decidere. Il pulsante simula soltanto una conferma.'}</p></div>`:'<div class="task-note warning">Nessun acquisto proposto. Cambia i limiti oppure ricomincia per rivedere i dati.</div>';
    $('stage-detail').innerHTML=detail;
    if($('confirm'))$('confirm').onclick=()=>{confirmed=true;render();$('confirm').focus();};
    $('prev').disabled=step===0;$('next').disabled=step===4;
  }
  for(const id of ['budget','deadline','priority'])$(id).onchange=()=>{step=0;confirmed=false;render();};
  $('prev').onclick=()=>{if(step>0){step--;render();}};
  $('next').onclick=()=>{if(step<4){step++;render();}};
  $('restart').onclick=()=>{step=0;confirmed=false;render();};
  render();
}
