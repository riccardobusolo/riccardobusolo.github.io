// Glossary and review prompts, structured OpenAI requests.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
global.window=global;vm.runInThisContext(fs.readFileSync(__dirname+'/prompt.js','utf8'));vm.runInThisContext(fs.readFileSync(__dirname+'/openai-service.js','utf8'));
(async()=>{
  const glossary=[{source:'Ratio valve',target:'valvola proporzionale'}];
  const t=translationPrompt('Italian',['Ratio valve'],'Return JSON',glossary);
  assert.match(t,/Mandatory glossary.*Ratio valve → valvola proporzionale/);assert.match(t,/WARNING → AVVERTENZA/);
  assert.doesNotMatch(translationPrompt('Italian',['a']),/Mandatory glossary/);
  const g=glossaryPrompt('German',['x'.repeat(1000)]);assert.match(g,/WARNING → WARNUNG/);assert.ok(g.includes('x'.repeat(300)+'…'));
  // Regional variants share the signal words of the language and get its spelling rules.
  const us=translationPrompt('English (United States)',['a']);assert.match(us,/AVVERTENZA\/WARNUNG → WARNING/);assert.match(us,/American English/);
  assert.match(translationPrompt('Latvian',['a']),/ISO 3864 \/ ANSI Z535 convention/);
  const r=reviewPrompt('Italian',glossary,[{id:0,source:'a',translation:'b'}]);assert.match(r,/"id":0/);assert.match(r,/only the items that need a fix/);
  const c=correctionPrompt('Danish',[],'Write DRYPLUS in the cover title',[{id:3,source:'a',translation:'b',page:1,role:'page title'}]);
  assert.match(c,/Write DRYPLUS in the cover title/);assert.match(c,/"role":"page title"/);assert.match(c,/only the changed items/);assert.match(c,/ADVARSEL/);
  let body;global.fetch=async(url,options)=>{body=JSON.parse(options.body);return{ok:true,status:200,json:async()=>({status:'completed',output:[{type:'message',content:[{type:'output_text',text:'{"terms":[{"source":"A","target":"B"}]}'}]}]})};};
  const data=await OpenAIService.ask(g,TRANSLATION_SCHEMAS.glossary,'k','gpt-6.1-sol',[],new AbortController().signal,()=>{});
  assert.deepEqual(data.terms,[{source:'A',target:'B'}]);assert.equal(body.text.format.name,'glossary');assert.equal(body.text.format.strict,true);assert.equal(body.store,false);
  global.fetch=async()=>({ok:true,status:200,json:async()=>({status:'completed',output:[{type:'message',content:[{type:'output_text',text:'not json'}]}]})});
  await assert.rejects(OpenAIService.ask(r,TRANSLATION_SCHEMAS.review,'k','gpt-6.1-sol',[],new AbortController().signal,()=>{}),/JSON non valido/);
  console.log('PASS: glossary/review prompts, signal-word conventions, structured OpenAI requests, invalid JSON.');
})().catch(e=>{console.error(e);process.exitCode=1;});
