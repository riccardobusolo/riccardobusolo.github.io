'use strict';
// Parse PDF syntax instead of matching text operators inside strings or images.
window.PDFEngine = (() => {
  const decode = bytes => { let s=''; for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192)); return s; };
  const encode = s => Uint8Array.from(s,c=>c.charCodeAt(0));
  function strip(source) {
    let pos=0, operands=[], edits=[];
    const white=c=>!c||/[\x00\s]/.test(c), delimiter=c=>white(c)||'()<>[]{}/%'.includes(c);
    function skip(){while(pos<source.length){if(white(source[pos]))pos++;else if(source[pos]==='%'){while(pos<source.length&&!/[\r\n]/.test(source[pos]))pos++;}else break;}}
    function token(){
      skip(); if(pos>=source.length)return null;
      const start=pos; let c=source[pos++], atom=false;
      if(c==='('){let level=1;while(pos<source.length&&level){const ch=source[pos++];if(ch==='\\'){if(source[pos]==='\r'&&source[pos+1]==='\n')pos++;pos++;}else if(ch==='(')level++;else if(ch===')')level--;}if(level)throw Error('Stringa PDF incompleta.');atom=true;}
      else if(c==='[' || (c==='<'&&source[pos]==='<')){const end=c==='['?']':'>>';if(end==='>>')pos++;while(true){skip();if(source.startsWith(end,pos)){pos+=end.length;break;}if(!token())throw Error('Struttura PDF incompleta.');}atom=true;}
      else if(c==='<'){while(pos<source.length&&source[pos]!=='>')pos++;if(pos>=source.length)throw Error('Stringa PDF incompleta.');pos++;atom=true;}
      else if(c==='/'){while(pos<source.length&&!delimiter(source[pos]))pos++;atom=true;}
      else {while(pos<source.length&&!delimiter(source[pos]))pos++;if('])>}'.includes(c))throw Error('Sintassi PDF non supportata.');}
      const value=source.slice(start,pos);return {start,end:pos,value,operand:atom||/^[+-]?(?:\d*\.\d+|\d+\.?\d*)$/.test(value)||['true','false','null'].includes(value)};
    }
    let t;while((t=token())){
      if(t.operand){operands.push(t);continue;}
      if(t.value==='BI')throw Error('Immagini inline non supportate: esportazione interrotta per proteggere la grafica.');
      if(t.value==='Tr'&&Number(operands.at(-1)?.value)!==0)throw Error('Testo con maschere, contorni o invisibile non supportato.');
      const count={Tj:1,TJ:1,"'":1,'"':3}[t.value];
      if(count){if(operands.length!==count)throw Error('Operatore di testo non valido.');const replace=t.value==="'"?' T* ':t.value==='"'?` ${operands[0].value} Tw ${operands[1].value} Tc T* `:' ';edits.push({start:operands[0].start,end:t.end,replace});}
      operands=[];
    }
    for(const e of edits.reverse())source=source.slice(0,e.start)+e.replace+source.slice(e.end);
    return source;
  }
  async function removeText(doc,signal,onPage=()=>{}){
    const {PDFName:N,PDFDict,PDFArray,PDFRawStream,PDFRef}=PDFLib;
    const visited=new Set();
    const contents=s=>s.getUnencodedContents?s.getUnencodedContents():PDFLib.decodePDFRawStream(s).decode();
    function resources(dict){
      if(!dict||visited.has(dict))return;visited.add(dict);
      const objects=dict.lookupMaybe(N.of('XObject'),PDFDict);if(!objects)return;
      for(const [name,ref]of objects.entries()){
        const obj=doc.context.lookup(ref);if(!(obj instanceof PDFRawStream)||obj.dict.get(N.of('Subtype'))?.toString()!=='/Form')continue;
        resources(obj.dict.lookupMaybe(N.of('Resources'),PDFDict));
        const fields={};for(const[k,v]of obj.dict.entries())if(!['/Length','/Filter','/DecodeParms'].includes(k.toString()))fields[k.decodeText()]=v;
        const replacement=doc.context.flateStream(encode(strip(decode(contents(obj)))),fields);
        if(ref instanceof PDFRef)doc.context.assign(ref,replacement);else objects.set(name,doc.context.register(replacement));
      }
    }
    let pageIndex=0;
    for(const page of doc.getPages()){
      signal?.throwIfAborted();onPage(++pageIndex,doc.getPageCount(),'validate');await new Promise(resolve=>setTimeout(resolve,0));signal?.throwIfAborted();
      if(page.node.Annots()?.size())throw Error('PDF con annotazioni o campi modulo: formato non supportato in questa beta.');
      resources(page.node.Resources());const entry=page.node.Contents();if(!entry)continue;
      const streams=entry instanceof PDFArray?entry.asArray():[entry];
      const source=streams.map(ref=>decode(contents(doc.context.lookup(ref)))).join('\n');
      page.node.set(N.of('Contents'),doc.context.register(doc.context.flateStream(encode(strip(source)))));
    }
  }
  async function parse(bytes,signal,progress){
    const doc=await PDFLib.PDFDocument.load(bytes.slice());
    if(doc.getPageCount()>100)throw Error('Limite beta: massimo 100 pagine.');
    // Validate all content streams before sending text to the provider.
    await removeText(doc,signal,progress);
    const reader=await pdfjsLib.getDocument({data:bytes.slice(),isEvalSupported:false}).promise;
    const pages=[];try{
      for(let n=1;n<=reader.numPages;n++){
        signal.throwIfAborted();const page=await reader.getPage(n), content=await page.getTextContent();
        if(page.rotate!==0)throw Error('Pagine ruotate non supportate in questa beta.');
        if(page.view[0]!==0||page.view[1]!==0)throw Error('PDF con origine pagina personalizzata non supportato.');
        const blocks=[];
        // Track text paint colors; fail rather than silently lose special rendering.
        const ops=await page.getOperatorList(),O=pdfjsLib.OPS,paints=[];let color=[0,0,0],stack=[];
        for(let i=0;i<ops.fnArray.length;i++){
          const op=ops.fnArray[i],args=ops.argsArray[i];
          if(op===O.save||op===O.paintFormXObjectBegin)stack.push([...color]);
          if(op===O.restore||op===O.paintFormXObjectEnd)color=stack.pop()||[0,0,0];
          if(op===O.setFillRGBColor)color=Array.from(args).map(v=>v/255);
          if(op===O.setGState&&args[0]?.some(([k,v])=>(k==='ca'&&v!==1)||(k==='BM'&&v!=='source-over')))throw Error('Trasparenze o fusione del testo non supportate in questa beta.');
          if(op===O.showText)for(const glyph of args[0]||[])if(typeof glyph==='object')for(const ch of glyph.unicode||'')if(!/\s/.test(ch))paints.push({ch,color:[...color]});
        }
        let cursor=0;
        for(const item of content.items){
          if(!item.str?.trim())continue;
          const[a,b,c,d,x,y]=item.transform,style=content.styles[item.fontName]||{};
          if(Math.abs(b)>.01||Math.abs(c)>.01||a<=0||d<=0||style.vertical||item.dir==='rtl')throw Error('Testo ruotato, specchiato o verticale non supportato.');
          const text=item.str.normalize('NFC'),chars=text.replace(/\s/g,'');
          let fill=paints[cursor]?.color||[0,0,0];
          for(let j=cursor;j<Math.min(cursor+40,paints.length);j++)if(paints.slice(j,j+chars.length).map(p=>p.ch).join('')===chars){fill=paints[j].color;cursor=j+chars.length;break;}
          let font;try{font=page.commonObjs.get(item.fontName);}catch{}
          if(font?.isType3Font)throw Error('Font Type 3 non supportati.');
          const family=font?.name||style.fontFamily||'';
          const block={text,x,y,width:item.width,size:d,color:fill,bold:/bold|black|heavy/i.test(family),italic:/italic|oblique/i.test(family),serif:/serif|times|georgia/i.test(family)&&!/sans/i.test(family),mono:/mono|courier/i.test(family)};
          const prev=blocks.at(-1),gap=prev?x-prev.x-prev.width:Infinity;
          if(prev&&Math.abs(prev.y-y)<.5&&Math.abs(prev.size-d)<.2&&gap>=-.1&&gap<d*.7&&prev.bold===block.bold&&prev.italic===block.italic&&prev.color.join()===fill.join()) {prev.text+=(gap>d*.15?' ':'')+text;prev.width=x+item.width-prev.x;}
          else blocks.push(block);
        }
        if(!blocks.length)throw Error(`Pagina ${n}: nessun testo selezionabile. Le scansioni non sono supportate.`);
        pages.push(blocks);progress(n,reader.numPages,'extract');await new Promise(resolve=>setTimeout(resolve,0));
      }
    }finally{await reader.destroy();}
    return pages;
  }
  async function build(bytes,pages,translated,signal,onProgress=()=>{}){
    const doc=await PDFLib.PDFDocument.load(bytes.slice());await removeText(doc,signal);
    const fonts=new Map();let index=0,shrunk=0;
    for(let p=0;p<pages.length;p++){
      await new Promise(resolve=>setTimeout(resolve,0));
      signal.throwIfAborted();const page=doc.getPage(p);
      for(const b of pages[p]){
        const text=translated[index++];
        const family=b.mono?'Courier':b.serif?'Times':'Helvetica';
        const names={Helvetica:['Helvetica','Helvetica-Bold','Helvetica-Oblique','Helvetica-BoldOblique'],Times:['Times-Roman','Times-Bold','Times-Italic','Times-BoldItalic'],Courier:['Courier','Courier-Bold','Courier-Oblique','Courier-BoldOblique']};
        const name=names[family][(b.bold?1:0)+(b.italic?2:0)];
        if(!fonts.has(name))fonts.set(name,await doc.embedFont(name));const font=fonts.get(name);
        let width;try{width=font.widthOfTextAtSize(text,b.size);}catch{throw Error('La traduzione contiene caratteri non disponibili nei font latini della beta. Prova una lingua europea.');}
        const size=Math.min(b.size,b.size*Math.max(b.width,1)/Math.max(width,1));
        if(size<b.size*.8)shrunk++;
        page.drawText(text,{x:b.x,y:b.y,size,font,color:PDFLib.rgb(...b.color)});
      }
      onProgress(p+1,pages.length);
    }
    // Copy only the reachable page graph into a fresh document: obsolete text streams
    // and original metadata must not remain embedded as unreferenced objects.
    const clean=await PDFLib.PDFDocument.create();for(const page of await clean.copyPages(doc,doc.getPageIndices()))clean.addPage(page);
    clean.setTitle('DocuShift — documento tradotto');clean.setProducer('DocuShift');
    return {bytes:await clean.save(),shrunk};
  }
  return {parse,build,strip};
})();
