(() => {
  'use strict';
  const canvas = document.getElementById('projects-background');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  const toggle = document.getElementById('background-toggle');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  const TAU = Math.PI * 2;
  const seed = Math.floor(Math.random() * 0xffffffff);
  const pointer = { x: 0, y: 0, active: false };
  const starLayer = document.createElement('canvas');
  const starCtx = starLayer.getContext('2d');
  const glow = document.createElement('canvas');
  glow.width = glow.height = 64;
  const gc = glow.getContext('2d');
  const gradient = gc.createRadialGradient(32,32,0,32,32,32);
  gradient.addColorStop(0,'rgba(157,255,235,.8)');
  gradient.addColorStop(.16,'rgba(70,235,215,.25)');
  gradient.addColorStop(1,'rgba(0,210,200,0)');
  gc.fillStyle = gradient; gc.fillRect(0,0,64,64);
  let width=0, height=0, nodes=[], edges=[], time=0, last=0, frame=null, resizeTimer;
  let paused=motion.matches, manualChoice=false, waves=[];
  function randomSource() {
    let state=seed;
    return () => {
      state=(state+0x6D2B79F5)|0;
      let n=Math.imul(state^state>>>15,1|state);
      n^=n+Math.imul(n^n>>>7,61|n);
      return ((n^n>>>14)>>>0)/4294967296;
    };
  }
  function resize() {
    width=innerWidth; height=innerHeight;
    // CSS-space density stays constant; backing pixels have a separate memory budget.
    const ratio=Math.min(devicePixelRatio||1,1.5,Math.sqrt(8500000/(width*height)));
    canvas.width=Math.round(width*ratio); canvas.height=Math.round(height*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);
    starLayer.width=canvas.width; starLayer.height=canvas.height;
    starCtx.setTransform(ratio,0,0,ratio,0,0);
    const random=randomSource(), cell=180, bins=new Map();
    const key=(x,y)=>x+','+y;
    function neighbors(x,y) {
      const bx=Math.floor(x/cell),by=Math.floor(y/cell),result=[];
      for(let dx=-1;dx<=1;dx++) for(let dy=-1;dy<=1;dy++)
        result.push(...(bins.get(key(bx+dx,by+dy))||[]));
      return result;
    }
    nodes=[]; edges=[]; waves=[];
    const count=Math.min(coarse.matches?240:1400,Math.max(24,Math.round(width*height/(coarse.matches?13500:10500))));
    // Seeded dart sampling prevents grids, diagonal bands and crowded edge clumps.
    for(let attempt=0;nodes.length<count && attempt<count*24;attempt++) {
      const x=12+random()*Math.max(1,width-24),y=12+random()*Math.max(1,height-24);
      if(neighbors(x,y).some(n=>(n.bx-x)**2+(n.by-y)**2<48**2)) continue;
      const n={id:nodes.length,bx:x,by:y,x,y,phase:random()*TAU,speed:.08+random()*.13,
        radius:.8+random()*.8,brightness:.3+random()*.22,energy:0,links:[]};
      nodes.push(n);
      const k=key(Math.floor(x/cell),Math.floor(y/cell));
      if(!bins.has(k)) bins.set(k,[]);
      bins.get(k).push(n);
    }
    for(const n of nodes) {
      const near=neighbors(n.bx,n.by).filter(b=>b!==n)
        .map(b=>({b,d:Math.hypot(n.bx-b.bx,n.by-b.by)}))
        .filter(v=>v.d<178).sort((a,b)=>a.d-b.d);
      const degree=random()<.24?3:2;
      for(const {b,d} of near) {
        if(n.links.length>=degree) break;
        if(b.links.length>=3 || n.links.some(e=>e.a===b||e.b===b)) continue;
        // Keep small branches and open polygons instead of a uniform mesh.
        if(n.links.length && random()<.3) continue;
        const e={a:n,b,length:d,alpha:.085+random()*.07,period:8+random()*10,phase:random()*18,reverse:random()<.5};
        edges.push(e);n.links.push(e);b.links.push(e);
      }
    }
    const stars=Math.min(1000,Math.round(width*height/12000));
    for(let i=0;i<stars;i++) {
      starCtx.fillStyle='rgba(155,202,218,'+(.09+random()*.22)+')';
      starCtx.beginPath();starCtx.arc(random()*width,random()*height,.35+random()*.5,0,TAU);starCtx.fill();
    }
    pointer.active=false;
    draw(0);
  }
  function light(x,y,size,alpha) {
    if(alpha<=.01) return;
    ctx.globalAlpha=Math.min(1,alpha);
    ctx.drawImage(glow,x-size/2,y-size/2,size,size);
    ctx.globalAlpha=1;
  }
  function draw(dt) {
    time+=dt;
    ctx.clearRect(0,0,width,height);
    ctx.drawImage(starLayer,0,0,width,height);
    waves=waves.filter(w=>time-w.start<4);
    const interactive=pointer.active&&!paused;
    const nearby=[];
    const blend=dt?1-Math.exp(-dt*5):1;
    for(const n of nodes) {
      const bx=n.bx+Math.sin(time*n.speed+n.phase)*7;
      const by=n.by+Math.cos(time*n.speed*.8+n.phase)*6;
      const dx=pointer.x-bx,dy=pointer.y-by,d=Math.hypot(dx,dy);
      const influence=interactive?Math.max(0,1-d/190):0;
      n.x+=(bx+dx*influence*.055-n.x)*blend;
      n.y+=(by+dy*influence*.055-n.y)*blend;
      n.energy=influence*.75;
      if(influence) nearby.push({n,d});
      for(const w of waves) {
        const arrival=w.arrivals[n.id];
        const age=time-w.start-arrival;
        if(age>=0 && age<1.3) n.energy=Math.max(n.energy,Math.sin(Math.min(1,age/.12)*Math.PI/2)*Math.exp(-age*2.8));
      }
    }
    for(const e of edges) {
      const {a,b}=e,energy=Math.max(a.energy,b.energy);
      const phase=((time+e.phase)%e.period)/e.period;
      const travel=phase/.32;
      const active=!paused&&travel<1;
      const pulse=active?Math.sin(travel*Math.PI):0;
      ctx.strokeStyle='rgba(74,191,196,'+(e.alpha+energy*.27+pulse*.14)+')';
      ctx.lineWidth=.65+energy*.45;
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      if(active) {
        const t=e.reverse?1-travel:travel,x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;
        light(x,y,18,pulse*.5);
        ctx.fillStyle='rgba(179,255,235,'+(pulse*.8)+')';
        ctx.beginPath();ctx.arc(x,y,1.2,0,TAU);ctx.fill();
      }
      for(const w of waves) {
        const da=w.arrivals[a.id],db=w.arrivals[b.id],duration=e.length/260;
        const start=Math.min(da,db),age=time-w.start-start;
        if(age<0 || age>duration || !Number.isFinite(start)) continue;
        const t=da<=db?age/duration:1-age/duration;
        light(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,26,.85);
      }
    }
    if(interactive) {
      nearby.sort((a,b)=>a.d-b.d);
      for(const {n,d} of nearby.slice(0,4)) {
        ctx.strokeStyle='rgba(125,240,225,'+((1-d/190)*.28)+')';
        ctx.lineWidth=.75;
        ctx.beginPath();ctx.moveTo(pointer.x,pointer.y);ctx.lineTo(n.x,n.y);ctx.stroke();
      }
      light(pointer.x,pointer.y,160,.18);
    }
    for(const w of waves) {
      const age=time-w.start;
      if(age>1.8) continue;
      ctx.strokeStyle='rgba(107,236,224,'+(.12*(1-age/1.8))+')';
      ctx.lineWidth=.8;ctx.beginPath();ctx.arc(w.x,w.y,age*160+8,0,TAU);ctx.stroke();
    }
    for(const n of nodes) {
      const shimmer=.88+.12*Math.sin(time*.5+n.phase);
      light(n.x,n.y,18+n.energy*18,.13+n.energy*.7);
      ctx.fillStyle='rgba(147,228,224,'+Math.min(.95,n.brightness*shimmer+n.energy*.55)+')';
      ctx.beginPath();ctx.arc(n.x,n.y,n.radius+n.energy*.75,0,TAU);ctx.fill();
    }
  }
  function spark(x,y) {
    // Dijkstra runs only on click: light travels along actual links, not all-pairs per frame.
    const arrivals=new Float64Array(nodes.length).fill(Infinity),visited=new Uint8Array(nodes.length);
    const near=nodes.map(n=>({n,d:Math.hypot(n.x-x,n.y-y)})).sort((a,b)=>a.d-b.d).slice(0,3);
    near.forEach(({n,d})=>arrivals[n.id]=d/400);
    for(let step=0;step<nodes.length;step++) {
      let best=-1,min=Infinity;
      for(let i=0;i<nodes.length;i++) if(!visited[i]&&arrivals[i]<min){best=i;min=arrivals[i];}
      if(best<0 || min>2.6) break;
      visited[best]=1;
      for(const e of nodes[best].links) {
        const other=e.a.id===best?e.b:e.a;
        arrivals[other.id]=Math.min(arrivals[other.id],min+e.length/260);
      }
    }
    waves.push({x,y,start:time,arrivals});
    if(waves.length>3) waves.shift();
  }
  function tick(stamp) {
    frame=null;
    if(paused||document.hidden) return;
    if(!last) last=stamp;
    const interval=1000/(coarse.matches?24:30);
    if(stamp-last>=interval-1) {draw(Math.min((stamp-last)/1000,.1));last=stamp;}
    frame=requestAnimationFrame(tick);
  }
  function sync() {
    if(frame!==null) cancelAnimationFrame(frame);
    frame=null;last=0;
    if(toggle) {
      toggle.textContent=paused?'Animazione di sfondo: in pausa':'Animazione di sfondo: attiva';
      toggle.setAttribute('aria-pressed',String(paused));
    }
    if(paused){pointer.active=false;waves=[];draw(0);}
    if(!paused&&!document.hidden) frame=requestAnimationFrame(tick);
  }
  document.addEventListener('pointermove',e=>{
    if(e.pointerType!=='mouse'||paused) return;
    pointer.x=e.clientX;pointer.y=e.clientY;pointer.active=true;
  },{passive:true});
  document.documentElement.addEventListener('pointerleave',()=>pointer.active=false);
  window.addEventListener('blur',()=>pointer.active=false);
  document.addEventListener('pointerdown',e=>{
    if(paused||e.button!==0||e.target.closest('a,button,input,select,textarea,.card-wrap')) return;
    spark(e.clientX,e.clientY);
  },{passive:true});
  toggle?.addEventListener('click',()=>{manualChoice=true;paused=!paused;sync();});
  motion.addEventListener('change',()=>{if(motion.matches||!manualChoice){paused=motion.matches;sync();}});
  window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(resize,120);},{passive:true});
  coarse.addEventListener('change',resize);
  document.addEventListener('visibilitychange',sync);
  window.addEventListener('pagehide',()=>{if(frame!==null)cancelAnimationFrame(frame);frame=null;});
  window.addEventListener('pageshow',sync);
  if(toggle) toggle.hidden=false;
  resize();sync();
})();
