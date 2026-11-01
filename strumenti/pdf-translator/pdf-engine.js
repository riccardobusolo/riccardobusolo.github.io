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
      // Link annotations only define an active area. They do not paint text or alter the
      // page content stream, so retaining them is safe and preserves table-of-contents
      // navigation. Other annotation types can carry visible appearances or AcroForm
      // field values; reject those rather than leaving untranslated text on the page.
      const annots=page.node.Annots();
      if(annots){
        for(const ref of annots.asArray()){
          const annotation=doc.context.lookup(ref,PDFDict);
          const subtype=annotation?.get(N.of('Subtype'))?.toString();
          if(subtype!=='/Link')throw Error(`Pagina ${pageIndex}: annotazione ${subtype||'sconosciuta'} non supportata. Sono supportati i collegamenti PDF; campi modulo, commenti e timbri richiedono un formato separato.`);
        }
      }
      resources(page.node.Resources());const entry=page.node.Contents();if(!entry)continue;
      const streams=entry instanceof PDFArray?entry.asArray():[entry];
      const source=streams.map(ref=>decode(contents(doc.context.lookup(ref)))).join('\n');
      page.node.set(N.of('Contents'),doc.context.register(doc.context.flateStream(encode(strip(source)))));
    }
  }
  // ---------------------------------------------------------------------------
  // Extraction: PDF.js items -> style runs -> lines -> translation units.
  // A unit is a paragraph (several lines reflowed together), a single label or
  // a table-of-contents entry. Translating whole paragraphs gives the AI full
  // sentences; the translated text is then reflowed into the original lines.
  // ---------------------------------------------------------------------------
  const MARKER_ONLY=/^\s*(?:[•▪◦●■○\-–—*·]|\d{1,2}[.)]|[a-z][.)])\s*$/;
  const LIST_START=/^(?:\d{1,3}(?:\.\d{1,3})*[.)]?\s|[•▪◦●■○\-–—*]\s?|[a-z][.)]\s|\(\w{1,3}\)\s)/;
  const hasWords=s=>/\p{L}{2,}/u.test(s);
  const keyOf=s=>[s.bold?1:0,s.italic?1:0,s.family,s.color.map(v=>v.toFixed(3)).join(',')].join('|');
  function familyOf(name,generic){
    const n=String(name||'').replace(/^[A-Z]{6}\+/,'').toLowerCase();
    if(/courier|mono|consol/.test(n))return 'mono';
    if(/calibri|carlito/.test(n))return 'carlito';
    if(/cambria|caladea/.test(n))return 'caladea';
    if(/times|tinos|georgia|garamond|antiqua|palatino|minion|serif/.test(n)&&!/sans/.test(n))return 'tinos';
    if(!n&&/serif/.test(generic||'')&&!/sans/.test(generic||''))return 'tinos';
    return 'arimo';
  }
  function dominant(entries){const score=new Map();for(const[value,weight]of entries)score.set(value,(score.get(value)||0)+weight);let best,max=-1;for(const[v,w]of score)if(w>max){max=w;best=v;}return best;}

  function toLines(blocks){
    const lines=[];
    for(const b of blocks){
      const prev=lines.at(-1),size=Math.max(b.size,prev?.size||0),gap=prev?b.x-prev.right:Infinity;
      const run={text:b.text,size:b.size,bold:b.bold,italic:b.italic,family:b.family,color:b.color,sizes:[[b.size,b.text.length]]};
      if(prev&&Math.abs(prev.y-b.y)<=.3*size&&Math.abs(prev.xSkew-b.xSkew)<.01&&gap>=-.2*size&&gap<size*.7){
        const last=prev.runs.at(-1);if(gap>size*.15&&!/\s$/.test(last.text))last.text+=' ';
        if(keyOf(last)===keyOf(run)){last.text+=run.text;last.sizes.push(...run.sizes);}else prev.runs.push(run);
        prev.right=Math.max(prev.right,b.x+b.width);
      }else lines.push({x:b.x,y:b.y,right:b.x+b.width,xSkew:b.xSkew,runs:[run]});
    }
    for(const L of lines){
      for(const r of L.runs)r.size=dominant(r.sizes);
      L.text=L.runs.map(r=>r.text).join('');L.size=dominant(L.runs.flatMap(r=>r.sizes));
      L.key=dominant(L.runs.map(r=>[keyOf(r),r.text.length]));
    }
    // Neighbours on the same baseline reveal tables, headers and TOC entries.
    for(const L of lines)for(const M of lines){
      if(M===L||Math.abs(M.y-L.y)>.35*Math.max(L.size,M.size))continue;
      if(MARKER_ONLY.test(M.text)){if(M.right<=L.x+1)L.marker=true;continue;}
      if(M.right<=L.x+1){L.left=true;L.leftRight=Math.max(L.leftRight??-Infinity,M.right);}
      else if(M.x>=L.right-1)L.rightX=Math.min(L.rightX??Infinity,M.x);
    }
    return lines;
  }

  function group(lines){
    const colRight=A=>Math.max(A.right,...lines.filter(L=>!L.left&&L.rightX===undefined&&Math.abs(L.x-A.x)<=2&&Math.abs(L.size-A.size)<=.35&&Math.abs(L.y-A.y)<=8*A.size).map(L=>L.right));
    function canJoin(P,B){
      const A=P.lines.at(-1);
      if(A.left||B.left||A.rightX!==undefined||B.rightX!==undefined)return false;
      const dy=A.y-B.y;if(dy<.8*A.size||dy>1.8*A.size||Math.abs(A.size-B.size)>.35||Math.abs(A.xSkew-B.xSkew)>.01)return false;
      if(A.key!==B.key||LIST_START.test(B.text))return false;
      if(P.lines.length>1&&Math.abs(dy-(P.lines.at(-2).y-A.y))>.35*A.size)return false;
      const lower=/^\p{Ll}/u.test(B.text),open=!/[.!?:;]["”»)]?\s*$/.test(A.text);
      const dx=Math.abs(A.x-B.x);if(dx>2&&!(lower&&open&&dx<3*A.size))return false;
      const right=colRight(A),full=A.right>=right-Math.max(3*A.size,.1*(right-A.x));
      return full||(lower&&open);
    }
    const paras=[];
    for(const L of lines){
      let target=null;for(let k=paras.length-1;k>=Math.max(0,paras.length-4)&&!target;k--)if(canJoin(paras[k],L))target=paras[k];
      if(target)target.lines.push(L);else paras.push({lines:[L]});
    }
    return paras;
  }

  function finalize(P,page){
    const lines=P.lines,runs=[];
    lines.forEach((L,i)=>L.runs.forEach((r,j)=>{
      let text=r.text;const prev=runs.at(-1);
      if(i>0&&j===0&&prev){if(/\p{L}-$/u.test(prev.text)&&/^\p{Ll}/u.test(text))prev.text=prev.text.slice(0,-1);else if(!/\s$/.test(prev.text))prev.text+=' ';}
      if(prev&&keyOf(prev)===keyOf(r))prev.text+=text;else runs.push({...r,text});
    }));
    const styles=[],index=new Map();
    for(const r of runs){const k=keyOf(r);if(!index.has(k)){index.set(k,styles.length);styles.push({size:r.size,bold:r.bold,italic:r.italic,family:r.family,color:r.color,chars:0,sizes:[]});}const s=styles[index.get(k)];s.chars+=r.text.length;s.sizes.push(...r.sizes);}
    for(const s of styles){s.size=dominant(s.sizes);delete s.sizes;}
    let base=styles.reduce((best,s,i)=>s.chars>styles[best].chars?i:best,0);
    const plain=runs.map(r=>r.text).join('').replace(/\s+/g,' ').trim();
    const first=lines[0],right=Math.max(...lines.map(L=>L.right)),size=styles[base].size;
    const unit={lines:lines.map(L=>({x:L.x,y:L.y,right:L.right})),x:first.x,y:first.y,right,width:right-first.x,size,xSkew:first.xSkew,color:styles[base].color,styles,base,align:'left',justify:false,leader:null};
    const leader=lines.length===1&&/^(.*?\S)\s*\.{4,}\s*(\d{0,4})\s*$/.exec(plain);
    if(leader&&hasWords(leader[1])){unit.leader={number:leader[2]};unit.styles=[styles[base]];unit.base=base=0;unit.text=leader[1];}
    else if(styles.length===1)unit.text=plain;
    else unit.text=runs.map(r=>{const i=index.get(keyOf(r)),t=r.text;if(i===base||!t.trim())return t;const m=/^(\s*)([\s\S]*?)(\s*)$/.exec(t);return `${m[1]}<s${i}>${m[2]}</s${i}>${m[3]}`;}).join('').replace(/\s+/g,' ').trim();
    unit.translate=hasWords(plain);
    unit.table=lines.length===1&&(first.left||first.rightX!==undefined);unit.marker=!!first.marker;
    const gaps=lines.slice(1).map((L,i)=>lines[i].y-L.y).sort((a,b)=>a-b);unit.leading=gaps.length?gaps[gaps.length>>1]:size*1.2;
    // Available width. Paragraphs keep their column; isolated labels may grow a
    // little; table cells must stay inside their original box.
    const single=lines.length===1,center=(first.x+right)/2;
    if(unit.leader)unit.maxRight=right;
    else if(!single)unit.maxRight=right,unit.justify=lines.slice(0,-1).every(L=>L.right>=right-Math.max(1.5,.3*size));
    else if(first.left&&right>=page.right-6&&first.x>page.left+(page.right-page.left)*.3){unit.align='right';unit.maxRight=right;unit.leftLimit=Math.min(first.x,first.leftRight+1.5*size);}
    else{
      const w=right-first.x,peers=page.lines.filter(L=>L!==first&&Math.abs(L.y-first.y)<=12*size&&Math.abs(L.y-first.y)>.35*size);
      const table=first.left||first.rightX!==undefined;
      const leftGap=first.left?first.x-first.leftRight:.15*w,rightGap=first.rightX!==undefined?first.rightX-right:.15*w;
      const centered=peers.some(L=>Math.abs((L.x+L.right)/2-center)<1.5&&Math.abs(L.x-first.x)>1.5)&&!peers.some(L=>Math.abs(L.x-first.x)<1);
      if(centered||(!table&&Math.abs(center-page.width/2)<3&&first.x>page.left+40)){unit.align='center';unit.center=center;}
      // Table cells may only use part of the gap to the neighbouring cell.
      if(first.left)unit.maxRight=right+Math.max(0,.45*rightGap);
      else if(first.rightX!==undefined)unit.maxRight=Math.max(right,first.rightX-1.5*size);
      else unit.maxRight=Math.min(Math.max(page.right,right),right+Math.max(.35*w,4*size));
      if(unit.align==='center')unit.halfWidth=table?w/2+.45*Math.max(0,Math.min(leftGap,rightGap)):Math.max(w/2,Math.min(center-page.left,page.right-center));
    }
    return unit;
  }

  // Text covered by an image or a shape, clipped away or painted in the background
  // colour is invisible in the original. Redrawing it on top would reveal it, so we
  // compare the page rendered with and without text inside each block.
  let strippedDoc=null,strippedSource=null;
  async function render(page,scale){const viewport=page.getViewport({scale}),canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);const ctx=canvas.getContext('2d',{willReadFrequently:true});await page.render({canvasContext:ctx,viewport}).promise;return {viewport,data:ctx.getImageData(0,0,canvas.width,canvas.height).data,width:canvas.width,height:canvas.height};}
  async function markHidden(page,stripped,n,units){
    try{
      if(strippedSource!==stripped){await strippedDoc?.destroy();strippedDoc=await pdfjsLib.getDocument({data:stripped.slice(),isEvalSupported:false}).promise;strippedSource=stripped;}
      const a=await render(page,1.5),b=await render(await strippedDoc.getPage(n),1.5);
      // Pixels covered by more than one block (overlapping text) are ambiguous: skip them.
      const rects=units.map(unit=>unit.lines.map(L=>{const [x1,y1,x2,y2]=a.viewport.convertToViewportRectangle([L.x,L.y-.2*unit.size,L.right,L.y+.75*unit.size]);return [Math.max(0,Math.floor(Math.min(x1,x2))),Math.max(0,Math.floor(Math.min(y1,y2))),Math.min(a.width,Math.ceil(Math.max(x1,x2))),Math.min(a.height,Math.ceil(Math.max(y1,y2)))];}));
      const owners=new Uint8Array(a.width*a.height);
      for(const list of rects)for(const[l,t,r,btm]of list)for(let y=t;y<btm;y++)for(let x=l;x<r;x++){const i=y*a.width+x;if(owners[i]<255)owners[i]++;}
      units.forEach((unit,u)=>{
        let changed=0,area=0,total=0;
        for(const[l,t,r,btm]of rects[u])for(let y=t;y<btm;y++)for(let x=l;x<r;x++){
          total++;const k=y*a.width+x;if(owners[k]!==1)continue;area++;const i=k*4;
          if(Math.abs(a.data[i]-b.data[i])+Math.abs(a.data[i+1]-b.data[i+1])+Math.abs(a.data[i+2]-b.data[i+2])>60)changed++;
        }
        if(area>total*.2&&changed<Math.max(3,area*.002)){unit.hidden=true;unit.translate=false;}
      });
      // Free space around each block: graphics (pixels that differ from the block's own
      // background in the text-free render) and other text blocks are obstacles.
      const W=b.width,H=b.height,scale=1.5,visible=units.map(u=>!u.hidden);
      const occupied=new Uint8Array(W*H);rects.forEach((list,u)=>{if(visible[u])for(const[l,t,r,btm]of list)for(let y=t;y<btm;y++)occupied.fill(1,y*W+l,y*W+r);});
      units.forEach((unit,u)=>{
        if(unit.hidden||!rects[u].length)return;
        const own=rects[u],[l0,t0,r0,b0]=own[0],last=own.at(-1);
        const counts=new Map();for(let y=t0;y<b0;y+=2)for(let x=l0;x<r0;x+=2){const i=(y*W+x)*4,key=(b.data[i]>>4)+','+(b.data[i+1]>>4)+','+(b.data[i+2]>>4);counts.set(key,(counts.get(key)||0)+1);}
        let bgKey='15,15,15',max=0;for(const[k,v]of counts)if(v>max){max=v;bgKey=k;}const bg=bgKey.split(',').map(v=>v*16+8);
        const inOwn=(x,y)=>own.some(([l,t,r,btm])=>x>=l&&x<r&&y>=t&&y<btm);
        const blocked=(x,y)=>{const k=y*W+x,i=k*4;if(occupied[k]&&!inOwn(x,y))return true;return Math.abs(b.data[i]-bg[0])+Math.abs(b.data[i+1]-bg[1])+Math.abs(b.data[i+2]-bg[2])>60;};
        let x=r0;outer:for(;x<W;x++)for(let y=t0;y<b0;y++)if(blocked(x,y))break outer;
        unit.spaceRight=Math.max(0,Math.min((x-r0)/scale,page.view[2]-28-unit.right));
        const right=Math.min(W,Math.ceil(Math.max(r0,(Math.max(unit.right,unit.maxRight||0))*scale)));
        let y=last[3];outer2:for(;y<H;y++)for(let xx=l0;xx<right;xx++)if(blocked(xx,y))break outer2;
        unit.spaceBelow=Math.max(0,Math.min((y-last[3])/scale,unit.lines.at(-1).y-.2*unit.size-28));
      });
    }catch{/* rendering is only a refinement: keep every block if it fails */}
  }

  // Isolated labels may grow into the free space measured on their right.
  function widen(units){
    for(const u of units)if(u.spaceRight!==undefined&&u.lines.length===1&&!u.table&&!u.leader&&u.align==='left')u.maxRight=Math.max(u.right,u.right+u.spaceRight-.6*u.size);
  }
  // A flow is a column of consecutive left-aligned blocks with the same body size:
  // when a translation needs an extra line, the blocks below move down together, and
  // any reduction is shared so the whole column keeps one size.
  function assignFlows(units,page){
    const ok=u=>!u.hidden&&u.translate&&!u.leader&&!u.table&&!u.marker&&u.align==='left';
    const sorted=units.filter(ok).sort((a,b)=>b.y-a.y),flows=[];
    for(const u of sorted){
      const f=flows.find(f=>{const L=f.at(-1),gap=L.lines.at(-1).y-u.y;return Math.abs(L.x-u.x)<=2&&Math.abs(L.size-u.size)<=.35&&gap>.8*u.size&&gap<=4*u.size;});
      if(f)f.push(u);else flows.push([u]);
    }
    flows.forEach((f,i)=>f.forEach(u=>u.flow=`${page}-${i}`));
  }

  async function parse(bytes,signal,progress){
    const doc=await PDFLib.PDFDocument.load(bytes.slice());
    if(doc.getPageCount()>100)throw Error('Limite beta: massimo 100 pagine.');
    // Validate all content streams before sending text to the provider.
    await removeText(doc,signal,progress);
    const stripped=typeof document!=='undefined'?await doc.save():null;
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
          // Horizontal shear (slanted display titles) is kept with xSkew. Rotation,
          // mirrored writing, vertical writing and RTL text need a dedicated layout.
          if(Math.abs(b)>.01||a<=0||d<=0||style.vertical||item.dir==='rtl')throw Error('Testo ruotato, specchiato, verticale o RTL non supportato.');
          const text=item.str.normalize('NFC'),chars=text.replace(/\s/g,'');
          let fill=paints[cursor]?.color||[0,0,0];
          for(let j=cursor;j<Math.min(cursor+40,paints.length);j++)if(paints.slice(j,j+chars.length).map(p=>p.ch).join('')===chars){fill=paints[j].color;cursor=j+chars.length;break;}
          let font;try{font=page.commonObjs.get(item.fontName);}catch{}
          if(font?.isType3Font)throw Error('Font Type 3 non supportati.');
          const name=font?.name||'',all=name+' '+(style.fontFamily||'');
          const block={text,x,y,width:item.width,size:d,xSkew:Math.atan2(c,d)*180/Math.PI,color:fill,bold:!!font?.bold||/bold|black|heavy|semibold|demi/i.test(all),italic:!!font?.italic||/italic|oblique/i.test(all),family:familyOf(name,style.fontFamily)};
          const prev=blocks.at(-1),gap=prev?x-prev.x-prev.width:Infinity;
          if(prev&&Math.abs(prev.y-y)<.5&&Math.abs(prev.size-d)<.2&&Math.abs(prev.xSkew-block.xSkew)<.01&&gap>=-.1&&gap<d*.7&&keyOf(prev)===keyOf(block)) {prev.text+=(gap>d*.15&&!/\s$/.test(prev.text)?' ':'')+text;prev.width=x+item.width-prev.x;}
          else blocks.push(block);
        }
        if(!blocks.length)throw Error(`Pagina ${n}: nessun testo selezionabile. Le scansioni non sono supportate.`);
        const lines=toLines(blocks),geometry={lines,width:page.view[2],left:Math.min(...lines.map(L=>L.x)),right:Math.max(...lines.map(L=>L.right))};
        const units=group(lines).map(P=>finalize(P,geometry));
        if(stripped)await markHidden(page,stripped,n,units);
        widen(units);assignFlows(units,n);
        pages.push(units);progress(n,reader.numPages,'extract');await new Promise(resolve=>setTimeout(resolve,0));
      }
    }finally{await reader.destroy();await strippedDoc?.destroy();strippedDoc=strippedSource=null;}
    return pages;
  }

  // ---------------------------------------------------------------------------
  // Composition
  // ---------------------------------------------------------------------------
  const scriptBase=(()=>{try{return new URL('.',document.currentScript?.src||document.baseURI).href;}catch{return null;}})();
  const STANDARD={arimo:'Helvetica',carlito:'Helvetica',tinos:'Times',caladea:'Times',mono:'Courier'};
  const STANDARD_NAMES={Helvetica:['Helvetica','Helvetica-Bold','Helvetica-Oblique','Helvetica-BoldOblique'],Times:['Times-Roman','Times-Bold','Times-Italic','Times-BoldItalic'],Courier:['Courier','Courier-Bold','Courier-Oblique','Courier-BoldOblique']};
  const fontFiles=new Map();
  async function fontBytes(file){
    if(!scriptBase||typeof fetch!=='function')return null;
    if(!fontFiles.has(file))fontFiles.set(file,fetch(new URL('fonts/'+file,scriptBase)).then(r=>r.ok?r.arrayBuffer():null).catch(()=>null));
    return fontFiles.get(file);
  }
  function fontManager(doc){
    const cache=new Map(),widths=new Map();const canEmbed=typeof window!=='undefined'&&window.fontkit;if(canEmbed)doc.registerFontkit(window.fontkit);
    function standard(style){const name=STANDARD_NAMES[STANDARD[style.family]||'Helvetica'][(style.bold?1:0)+(style.italic?2:0)];if(!cache.has(name))cache.set(name,doc.embedFont(name));return cache.get(name);}
    function custom(style,subset){
      if(!canEmbed||style.family==='mono')return null;
      const file=`${style.family}-${subset}-${style.bold?700:400}-${style.italic?'italic':'normal'}.woff`;
      if(!cache.has(file))cache.set(file,fontBytes(file).then(b=>b?doc.embedFont(b,{subset:true}):null).catch(()=>null));
      return cache.get(file);
    }
    const covers=(font,ch)=>{const fk=font.embedder?.font;if(typeof fk?.hasGlyphForCodePoint==="function")return fk.hasGlyphForCodePoint(ch.codePointAt(0));try{font.encodeText(ch);return true;}catch{return false;}};
    // Width at size 1, cached: custom font measurement runs a full shaping pass.
    const width=(font,text)=>{let m=widths.get(font);if(!m)widths.set(font,m=new Map());let w=m.get(text);if(w===undefined){w=font.widthOfTextAtSize(text,1);m.set(text,w);}return w;};
    // Split a word into segments, each drawn with the first font that has its glyphs:
    // metric-compatible font (latin, then latin-ext subset), then a standard PDF font.
    async function split(style,text){
      const fonts=[await custom(style,'latin'),await custom(style,'latin-ext'),await standard(style)].filter(Boolean),out=[];
      for(let ch of text){
        let font=fonts.find(f=>covers(f,ch));
        if(!font){const plain=ch.normalize('NFD').replace(/\p{M}/gu,'');ch=plain&&covers(fonts.at(-1),plain)?plain:'?';font=fonts.at(-1);}
        const last=out.at(-1);if(last&&last.font===font)last.text+=ch;else out.push({text:ch,font});
      }
      return out;
    }
    return {split,width};
  }

  // Split translated text into unbreakable groups of styled pieces.
  function tokens(text,unit){
    const pieces=[],re=/<s(\d+)>([\s\S]*?)<\/s\1>/g;let last=0,m;
    const push=(t,s)=>{t=t.replace(/<\/?s\d+>/g,'');if(t)pieces.push({text:t,style:s});};
    while((m=re.exec(text))){push(text.slice(last,m.index),unit.base);push(m[2],unit.styles[+m[1]]?+m[1]:unit.base);last=re.lastIndex;}
    push(text.slice(last),unit.base);
    const groups=[];let current=null;
    for(const p of pieces)for(const part of p.text.split(/(\s+)/)){
      if(!part)continue;
      if(/^\s+$/.test(part)){current=null;continue;}
      if(!current){current={pieces:[],space:groups.length>0};groups.push(current);}
      current.pieces.push({text:part,style:p.style});
    }
    return groups;
  }

  const STEPS=[[1,1],[1,.975],[1,.95],[1,.925],[1,.9]];for(let scale=.975;scale>=.3-1e-9;scale-=.025)STEPS.push([scale,.9]);

  async function prepare(unit,text,fonts){
    const groups=tokens(text,unit);if(!groups.length)return null;
    for(const g of groups){const pieces=[];for(const p of g.pieces)for(const seg of await fonts.split(unit.styles[p.style],p.text))pieces.push({...seg,style:p.style,unit:fonts.width(seg.font,seg.text)});g.pieces=pieces;}
    const baseStyle=unit.styles[unit.base],spaceFont=(await fonts.split(baseStyle,'n'))[0].font,spaceUnit=fonts.width(spaceFont,' ');
    const number=unit.leader?.number?(await fonts.split(baseStyle,unit.leader.number))[0]:null;
    const dotFont=unit.leader?(await fonts.split(baseStyle,'.'))[0].font:null;
    const slots=unit.lines.map(L=>{
      if(unit.align==='center')return 2*unit.halfWidth;
      if(unit.align==='right')return unit.right-unit.leftLimit;
      let avail=unit.maxRight-L.x;
      if(unit.leader)avail-=(number?fonts.width(number.font,number.text)*baseStyle.size+baseStyle.size*.4:0)+fonts.width(dotFont,'...')*baseStyle.size;
      return avail;
    });
    return {unit,groups,baseStyle,spaceUnit,number,dotFont,slots,fonts,extraSlot:unit.maxRight-unit.lines.at(-1).x};
  }

  // Wrap the words at one size; `extra` additional lines may be used below the block.
  function wrap(prep,scale,squeeze,extra){
    const {unit,groups,slots}=prep;
    for(const g of groups){g.width=0;for(const p of g.pieces){p.size=unit.styles[p.style].size*scale;p.width=p.unit*p.size*squeeze;g.width+=p.width;}}
    const space=prep.spaceUnit*prep.baseStyle.size*scale*squeeze,slot=i=>i<slots.length?slots[i]:prep.extraSlot,limit=slots.length+extra;
    const rows=[[]],widths=[0];
    for(const g of groups){
      let row=rows.length-1,w=widths[row]+(rows[row].length?space:0)+g.width;
      if(rows[row].length&&w>slot(row)+.01){if(rows.length>=limit)return null;rows.push([]);widths.push(0);row++;w=g.width;}
      if(w>slot(row)+.01)return null;
      rows[row].push(g);widths[row]=w;
    }
    return {scale,squeeze,rows,widths,space};
  }

  // Fit a flow (or a single block): the first step where every block fits, using at
  // most the free space below the column for extra lines.
  function fit(preps,free){
    const grow=free>0;
    for(const[scale,squeeze]of STEPS){
      let used=0,plans=[];
      for(const prep of preps){const plan=wrap(prep,scale,squeeze,grow?Infinity:0);if(!plan){plans=null;break;}used+=Math.max(0,plan.rows.length-prep.slots.length)*prep.unit.leading;plans.push(plan);}
      if(plans&&used<=free+.01)return plans;
    }
    // Even the minimum size overflows: keep every word on the original lines.
    const[scale,squeeze]=STEPS.at(-1);
    return preps.map(prep=>{
      const plan=wrap(prep,scale,squeeze,0);if(plan)return plan;
      const {groups,slots}=prep,space=prep.spaceUnit*prep.baseStyle.size*scale*squeeze,per=Math.ceil(groups.length/slots.length),rows=[],widths=[];
      for(let i=0;i<groups.length;i+=per){const row=groups.slice(i,i+per);rows.push(row);widths.push(row.reduce((s,g)=>s+g.width,0)+space*(row.length-1));}
      return {scale,squeeze,rows,widths,space};
    });
  }

  function draw(page,unit,plan){
    const skew=PDFLib.degrees(unit.xSkew||0);
    if(plan.squeeze<1)page.pushOperators(PDFLib.setCharacterSqueeze(plan.squeeze*100));
    plan.rows.forEach((row,i)=>{
      const line=plan.positions[i],width=plan.widths[i],slotWidth=i<plan.slots.length?plan.slots[i]:plan.extraSlot;
      let x=line.x;
      if(unit.align==='right')x=unit.right-width;else if(unit.align==='center')x=unit.center-width/2;
      const justify=unit.justify&&i<plan.rows.length-1&&row.length>1&&slotWidth-width<plan.space*6;
      const gap=justify?plan.space+(slotWidth-width)/(row.length-1):plan.space;
      // Coalesce consecutive pieces with the same font so text stays selectable as words.
      let pending=null;const flush=()=>{if(pending){page.drawText(pending.text,{x:pending.x,y:line.y,size:pending.size,font:pending.font,color:PDFLib.rgb(...pending.color),ySkew:skew});pending=null;}};
      row.forEach((g,j)=>{
        if(j>0){if(justify){flush();x+=gap;}else{if(pending)pending.text+=' ';x+=gap;}}
        for(const p of g.pieces){
          const color=unit.styles[p.style].color;
          if(pending&&pending.font===p.font&&pending.size===p.size&&pending.color.join()===color.join())pending.text+=p.text;
          else{flush();pending={text:p.text,x,size:p.size,font:p.font,color};}
          x+=p.width;
        }
      });
      flush();
      if(unit.leader&&i===0){
        const size=plan.baseStyle.size,color=PDFLib.rgb(...plan.baseStyle.color);
        const numberWidth=plan.number?plan.fonts.width(plan.number.font,plan.number.text)*size*plan.squeeze:0,end=unit.right-numberWidth-size*.2;
        const dot=plan.fonts.width(plan.dotFont,'.')*size*plan.squeeze,count=Math.max(0,Math.floor((end-x-size*.3)/dot));
        if(count)page.drawText('.'.repeat(count),{x:end-count*dot,y:line.y,size,font:plan.dotFont,color,ySkew:skew});
        if(plan.number)page.drawText(plan.number.text,{x:unit.right-numberWidth,y:line.y,size,font:plan.number.font,color,ySkew:skew});
      }
    });
    if(plan.squeeze<1)page.pushOperators(PDFLib.setCharacterSqueeze(100));
  }

  async function build(bytes,pages,translated,signal,onProgress=()=>{}){
    const doc=await PDFLib.PDFDocument.load(bytes.slice());await removeText(doc,signal);
    const fonts=fontManager(doc);let index=0,shrunk=0;
    for(let p=0;p<pages.length;p++){
      await new Promise(resolve=>setTimeout(resolve,0));
      signal.throwIfAborted();const page=doc.getPage(p);
      const groups=new Map();
      for(const unit of pages[p]){
        const text=translated[index++];if(unit.hidden)continue;
        const prep=await prepare(unit,text??unit.text,fonts);if(!prep)continue;
        const key=unit.flow??Symbol();if(!groups.has(key))groups.set(key,[]);groups.get(key).push(prep);
      }
      for(const preps of groups.values()){
        preps.sort((a,b)=>b.unit.y-a.unit.y);
        const last=preps.at(-1).unit,flowable=preps.every(({unit:u})=>!u.table&&!u.leader&&u.align==='left'&&!u.hidden);
        const plans=fit(preps,flowable?Math.max(0,(last.spaceBelow||0)-.3*last.size):0);
        let offset=0;
        preps.forEach((prep,k)=>{
          const plan={...plans[k],...prep},u=prep.unit,n=u.lines.length,lastLine=u.lines.at(-1);
          plan.positions=plan.rows.map((_,i)=>i<n?{x:u.lines[i].x,y:u.lines[i].y-offset}:{x:lastLine.x,y:lastLine.y-offset-(i-n+1)*u.leading});
          offset+=Math.max(0,plan.rows.length-n)*u.leading;
          if(plan.scale<.8)shrunk++;draw(page,u,plan);
        });
      }
      onProgress(p+1,pages.length);
    }
    // Copy only the reachable page graph into a fresh document: obsolete text streams
    // and original metadata must not remain embedded as unreferenced objects.
    const clean=await PDFLib.PDFDocument.create();for(const page of await clean.copyPages(doc,doc.getPageIndices()))clean.addPage(page);
    clean.setTitle('DocuShift — documento tradotto');clean.setProducer('DocuShift');
    return {bytes:await clean.save(),shrunk};
  }
  return {parse,build,strip,tokens};
})();
