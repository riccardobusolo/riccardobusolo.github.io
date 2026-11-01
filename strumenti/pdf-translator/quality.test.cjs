// Glossary and review prompts, structured OpenAI requests.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
global.window=global;vm.runInThisContext(fs.readFileSync(__dirname+'/prompt.js','utf8'));vm.runInThisContext(fs.readFileSync(__dirname+'/openai-service.js','utf8'));
(async()=>{
  const glossary=[{source:'Ratio valve',target:'valvola proporzionale'}];
  const t=translationPrompt('Italiano',['Ratio valve'],'Return JSON',glossary);
  assert.match(t,/Mandatory glossary.*Ratio valve → valvola proporzionale/);assert.match(t,/WARNING → AVVERTENZA/);
  assert.doesNotMatch(translationPrompt('Italiano',['a']),/Mandatory glossary/);
  const g=glossaryPrompt('Deutsch',['x'.repeat(1000)]);assert.match(g,/WARNING → WARNUNG/);assert.ok(g.includes('x'.repeat(300)+'…'));
  const r=reviewPrompt('Italiano',glossary,[{id:0,source:'a',translation:'b'}]);assert.match(r,/"id":0/);assert.match(r,/only the items that need a fix/);
  let body;global.fetch=async(url,options)=>{body=JSON.parse(options.body);return{ok:true,status:200,json:async()=>({status:'completed',output:[{type:'message',content:[{type:'output_text',text:'{"terms":[{"source":"A","target":"B"}]}'}]}]})};};
  const data=await OpenAIService.ask(g,TRANSLATION_SCHEMAS.glossary,'k','gpt-4.1-mini',[],new AbortController().signal,()=>{});
  assert.deepEqual(data.terms,[{source:'A',target:'B'}]);assert.equal(body.text.format.name,'glossary');assert.equal(body.text.format.strict,true);assert.equal(body.store,false);
  global.fetch=async()=>({ok:true,status:200,json:async()=>({status:'completed',output:[{type:'message',content:[{type:'output_text',text:'not json'}]}]})});
  await assert.rejects(OpenAIService.ask(r,TRANSLATION_SCHEMAS.review,'k','gpt-4.1-mini',[],new AbortController().signal,()=>{}),/JSON non valido/);
  console.log('PASS: glossary/review prompts, signal-word conventions, structured OpenAI requests, invalid JSON.');
})().catch(e=>{console.error(e);process.exitCode=1;});
