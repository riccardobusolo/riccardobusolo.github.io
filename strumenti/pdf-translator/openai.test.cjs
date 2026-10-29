const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
global.window=global;vm.runInThisContext(fs.readFileSync(__dirname+'/openai-service.js','utf8'));
const signal=new AbortController().signal,calls=[];
function mock(data,status=200){global.fetch=async(url,options)=>{calls.push({url,options});assert.equal(url,'https://api.openai.com/v1/responses');assert.equal(options.headers.Authorization,'Bearer fake-test-key');const body=JSON.parse(options.body);assert.equal(body.store,false);assert.ok(!options.body.includes('fake-test-key'));return{ok:status===200,status,json:async()=>data};};}
const response=text=>({status:'completed',output:[{type:'reasoning',summary:[]},{type:'message',content:[{type:'output_text',text}]}]});
(async()=>{
  mock(response('OK'));let found;
  assert.equal(await OpenAIService.discover('fake-test-key',signal,()=>{},m=>found=m,'gpt-4.1-mini'),1);assert.equal(calls.length,1);assert.equal(found.name,'gpt-4.1-mini');assert.equal(JSON.parse(calls[0].options.body).max_output_tokens,32);
  mock(response('{"translations":["Ciao"]}'));const attempts=[];
  assert.deepEqual(await OpenAIService.translate(['Hello'],'Italiano','fake-test-key','gpt-4.1-mini',['gpt-4.1-nano'],signal,()=>{},a=>attempts.push(a)),['Ciao']);
  const body=JSON.parse(calls.at(-1).options.body);assert.equal(body.text.format.type,'json_schema');assert.equal(body.text.format.strict,true);assert.deepEqual(attempts.map(a=>a.state),['waiting','response']);
  mock({error:{code:'insufficient_quota',message:'fake-test-key'}},429);const before=calls.length;
  await assert.rejects(OpenAIService.translate(['Hello'],'Italiano','fake-test-key','gpt-4.1-mini',['gpt-4.1-nano'],signal,()=>{}),/Credito API esaurito/);assert.equal(calls.length,before+1);
  mock({error:{message:'fake-test-key'}},401);await assert.rejects(OpenAIService.discover('fake-test-key',signal,()=>{},()=>{}),error=>/401/.test(error.message)&&!error.message.includes('fake-test-key'));
  mock(response('{"translations":[]}'));await assert.rejects(OpenAIService.translate(['Hello'],'Italiano','fake-test-key','gpt-4.1-mini',[],signal,()=>{}),/incompleta/);
  mock({status:'incomplete',output:[]});await assert.rejects(OpenAIService.discover('fake-test-key',signal,()=>{},()=>{}),/incompleta/);
  mock({status:'completed',output:[{type:'message',content:[{type:'refusal',refusal:'No'}]}]});await assert.rejects(OpenAIService.discover('fake-test-key',signal,()=>{},()=>{}),/rifiutato/);
  const aborted=new AbortController();aborted.abort();await assert.rejects(OpenAIService.translate(['Hello'],'Italiano','fake-test-key','gpt-4.1-mini',[],aborted.signal,()=>{}),{name:'AbortError'});
  console.log('PASS: OpenAI Responses authentication, single paid test, strict translation schema, no paid fallback, billing/auth errors, incomplete/refused/malformed results, cancellation.');
})().catch(error=>{console.error(error);process.exitCode=1;});
