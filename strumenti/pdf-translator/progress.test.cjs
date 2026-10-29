// Exercise the UI while the AI promise is pending, then on success/error/cancel.
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
class Element{
  constructor(){this.children=[];this.style={};this.dataset={};this.attrs={};this.value='';this.textContent='';this.hidden=false;this.classList={toggle(){},add(){},remove(){}};this.parentElement={};}
  setAttribute(k,v){this.attrs[k]=v;}removeAttribute(k){delete this.attrs[k];}
  append(e){this.children.push(e);}replaceChildren(...args){this.children=args;}before(){}scrollIntoView(){}addEventListener(){}focus(){}
  get firstChild(){return this.children[0];}
}
const elements=new Map(),get=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);};
get('activity-steps').children=Array.from({length:4},()=>new Element());get('key').value='fake-key';get('model').value='models/test';get('language').value='Italiano';
const fakePage={getViewport:()=>({width:100,height:100}),render:()=>({promise:Promise.resolve()})};
const fakeDoc={numPages:1,originalBytes:new Uint8Array([1]),getPage:async()=>fakePage,destroy:async()=>{}};
get('original').getContext=get('translated').getContext=()=>({});
let resolveAI,rejectAI;
const context=vm.createContext({console,setTimeout,clearTimeout,setInterval,clearInterval,Date,AbortController,URL,Blob,TextDecoder,Option:class{},window:{},document:{getElementById:get,createElement:()=>new Element()},pdfjsLib:{GlobalWorkerOptions:{},getDocument:()=>({promise:Promise.resolve(fakeDoc)})},PDFEngine:{parse:async(bytes,signal,progress)=>{signal.throwIfAborted();progress(1,1,'validate');progress(1,1,'extract');return[[{text:'Hello'}]];},build:async(bytes,pages,text,signal,progress)=>{signal.throwIfAborted();progress(1,1);return{bytes:new Uint8Array([1]),shrunk:0};}},AI:{translate:async(texts,language,key,model,alternatives,signal,log,onAttempt)=>{onAttempt({model,index:1,total:1,state:'waiting'});return new Promise((resolve,reject)=>{resolveAI=resolve;rejectAI=reject;signal.addEventListener('abort',()=>reject(new Error('Aborted')),{once:true});});}}});
vm.runInContext(fs.readFileSync(__dirname+'/app.js','utf8'),context);
const activity=vm.runInContext('activity',context);
const flush=async()=>{for(let i=0;i<100&&!resolveAI;i++)await new Promise(resolve=>setTimeout(resolve,10));assert.ok(resolveAI,'AI request was not reached');};
function reset(){resolveAI=rejectAI=null;context.fixture=fakeDoc;vm.runInContext('source=fixture; workingModels=["models/test"]; fileName="test.pdf";',context);}
(async()=>{
  reset();let job=get('translate').onclick();await flush();
  assert.equal(activity.dataset.state,'running');assert.equal(activity.attrs['aria-busy'],'true');assert.equal(get('activity-steps').children[1].dataset.state,'current');assert.match(get('activity-detail').textContent,/attesa risposta/);assert.equal(get('activity-percent').textContent,'20%');assert.equal(get('cancel').hidden,false);
  resolveAI(['Ciao']);await job;assert.equal(activity.dataset.state,'done');assert.equal(get('activity-percent').textContent,'100%');assert.equal(get('download').hidden,false);assert.equal(activity.attrs['aria-busy'],'false');assert.equal(vm.runInContext('activityTimer',context),null);
  reset();job=get('translate').onclick();await flush();rejectAI(new Error('429 · Quota esaurita'));await job;assert.equal(activity.dataset.state,'error');assert.match(get('activity-detail').textContent,/429/);assert.equal(get('download').hidden,true);assert.equal(get('translate').disabled,false);
  reset();job=get('translate').onclick();await flush();get('cancel').onclick();await job;assert.equal(activity.dataset.state,'cancelled');assert.equal(get('download').hidden,true);assert.equal(vm.runInContext('activityTimer',context),null);
  console.log('PASS: pending AI progress + attempt details, completed PDF, visible API error, cancellation, timer cleanup, retry enabled.');
})().catch(error=>{vm.runInContext('clearInterval(activityTimer)',context);console.error(error);process.exitCode=1;});
