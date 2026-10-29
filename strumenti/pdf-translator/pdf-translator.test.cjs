const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
global.window=global;global.PDFLib=require('./pdf-lib.min.js');global.pdfjsLib=require('./pdf.min.js');
pdfjsLib.GlobalWorkerOptions.workerSrc=require('node:path').join(__dirname,'pdf.worker.min.js');
vm.runInThisContext(fs.readFileSync(__dirname+'/pdf-engine.js','utf8'));
vm.runInThisContext(fs.readFileSync(__dirname+'/ai-service.js','utf8'));
(async()=>{
  assert.equal(PDFEngine.strip('BT /F1 12 Tf (A \\(nested\\) Tj) Tj ET'),'BT /F1 12 Tf   ET');
  assert.equal(PDFEngine.strip('[(a) 12 (b)] TJ 0 0 m 20 20 l S'),'  0 0 m 20 20 l S');
  assert.throws(()=>PDFEngine.strip('BI /W 1 ID bytes EI'),/inline/);
  assert.throws(()=>PDFEngine.strip('BT 7 Tr (a) Tj ET'),/maschere/);
  const doc=await PDFLib.PDFDocument.create(),page=doc.addPage([400,300]);
  page.drawRectangle({x:0,y:0,width:400,height:300,color:PDFLib.rgb(.1,.2,.3)});
  page.drawText('ORIGINAL SECRET',{x:30,y:220,size:18,color:PDFLib.rgb(1,1,1)});
  page.drawLine({start:{x:30,y:200},end:{x:370,y:200},color:PDFLib.rgb(1,0,0),thickness:2});
  const image=await doc.embedPng(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9b8AAAAASUVORK5CYII=','base64'));page.drawImage(image,{x:40,y:40,width:20,height:20});
  const source=await PDFLib.PDFDocument.create();source.addPage([100,100]).drawText('FORM SECRET',{x:4,y:50,size:10});
  const [form]=await doc.embedPdf(await source.save());page.drawPage(form,{x:200,y:20,width:100,height:100});
  const bytes=await doc.save(),signal=new AbortController().signal;
  const parsed=await PDFEngine.parse(bytes,signal,()=>{});assert.equal(parsed.flat().length,2);assert.deepEqual(parsed[0][0].color,[1,1,1]);
  const built=await PDFEngine.build(bytes,parsed,['TRADOTTO','FORM NUOVO'],signal);
  const reader=await pdfjsLib.getDocument({data:built.bytes.slice(),isEvalSupported:false}).promise;
  const resultPage=await reader.getPage(1),text=(await resultPage.getTextContent()).items.map(i=>i.str).join(' ');
  assert.match(text,/TRADOTTO/);assert.match(text,/FORM NUOVO/);assert.doesNotMatch(text,/SECRET|ORIGINAL/);
  const ops=await resultPage.getOperatorList();assert.ok(ops.fnArray.includes(pdfjsLib.OPS.paintImageXObject));assert.ok(ops.fnArray.includes(pdfjsLib.OPS.constructPath));await reader.destroy();
  const saved=await PDFLib.PDFDocument.load(built.bytes);for(const[,obj]of saved.context.enumerateIndirectObjects())if(obj instanceof PDFLib.PDFRawStream){let content;try{content=PDFLib.decodePDFRawStream(obj).decode();}catch{continue;}assert.doesNotMatch(Buffer.from(content).toString('latin1'),/SECRET|ORIGINAL/);}

  // A table-of-contents /Link annotation does not paint text and must remain usable.
  const linked=await PDFLib.PDFDocument.create(),linkedPage=linked.addPage([200,100]);linkedPage.drawText('CLICKABLE ORIGINAL',{x:10,y:50,size:12});
  const link=linked.context.obj({Type:'Annot',Subtype:'Link',Rect:[10,40,130,62],Border:[0,0,0],A:{S:'URI',URI:PDFLib.PDFString.of('https://example.com')}});linkedPage.node.addAnnot(linked.context.register(link));
  const linkedBytes=await linked.save(),linkedPages=await PDFEngine.parse(linkedBytes,signal,()=>{}),linkedBuilt=await PDFEngine.build(linkedBytes,linkedPages,['CLICKABLE TRADOTTO'],signal);
  const linkedOut=await PDFLib.PDFDocument.load(linkedBuilt.bytes);assert.equal(linkedOut.getPage(0).node.Annots().size(),1);const linkedReader=await pdfjsLib.getDocument({data:linkedBuilt.bytes.slice(),isEvalSupported:false}).promise;assert.doesNotMatch((await linkedReader.getPage(1)).getAnnotations?JSON.stringify(await (await linkedReader.getPage(1)).getAnnotations()):'',/ORIGINAL/);await linkedReader.destroy();

  // Sheared display text is common in manuals; keep the same x-axis angle.
  const sheared=await PDFLib.PDFDocument.create(),shearedPage=sheared.addPage([200,100]);shearedPage.drawText('SHEARED ORIGINAL',{x:10,y:40,size:18});
  const shearedBytes=await sheared.save(),shearedPages=[[{text:'SHEARED ORIGINAL',x:10,y:40,width:160,size:18,xSkew:18.4,color:[0,0,0],bold:false,italic:false,serif:false,mono:false}]],shearedBuilt=await PDFEngine.build(shearedBytes,shearedPages,['SHEARED TRADOTTO'],signal);const shearedReader=await pdfjsLib.getDocument({data:shearedBuilt.bytes.slice(),isEvalSupported:false}).promise;assert.match((await shearedReader.getPage(1)).getTextContent?JSON.stringify(await (await shearedReader.getPage(1)).getTextContent()):'',/SHEARED TRADOTTO/);await shearedReader.destroy();
  const calls=[];global.fetch=async(url,opts)=>{
    calls.push(url);assert.equal(opts.headers['x-goog-api-key'],'test-key');assert.ok(!url.includes('test-key'));
    if(url.includes('models?'))return{ok:true,json:async()=>({models:[{name:'models/gemini-test-flash',supportedGenerationMethods:['generateContent']},{name:'models/gemini-test-pro',supportedGenerationMethods:['generateContent']}]})};
    if(url.includes('flash'))return{ok:false,status:429,json:async()=>({error:{status:'RESOURCE_EXHAUSTED'}})};
    const prompt=JSON.parse(opts.body).contents[0].parts[0].text;
    return{ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text:prompt.includes('Translate')?'["Ciao"]':'OK'}]}}]})};
  };
  const found=[],logs=[];assert.equal(await AI.discover('test-key',signal,(...x)=>logs.push(x),m=>found.push(m.name)),1);assert.equal(found[0],'models/gemini-test-pro');assert.ok(logs.some(x=>/429/.test(x[1])));
  assert.deepEqual(await AI.translate(['Hello'],'Italiano','test-key','models/gemini-test-flash',found,signal,()=>{}),['Ciao']);
  global.fetch=async()=>({ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text:'[]'}]}}]})});
  await assert.rejects(AI.translate(['Hello'],'Italiano','test-key',found[0],[],signal,()=>{}),/non riescono/);
  if(!fs.existsSync(__dirname+'/test-fixture.pdf'))fs.writeFileSync(__dirname+'/test-fixture.pdf',bytes);console.log('PASS: lexer, original text removal (page + form), graphics/images, colors, PDF export, Gemini discovery, quota fallback, malformed response.');
})().catch(e=>{console.error(e);process.exitCode=1;});
