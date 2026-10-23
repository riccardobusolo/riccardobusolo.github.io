const assert = require('node:assert/strict');
const n = require('./models.js');
for(const x of [[0,0],[0,1],[1,0],[1,1]]) {
  assert.equal(n.mp(x,2,false),Number(x.every(Boolean)));
  assert.equal(n.mp(x,1,false),Number(x.some(Boolean)));
  assert.equal(n.mp(x,1,true),0);
}
assert.equal(n.activate('perceptron',0),1);
assert.equal(n.activate('sigmoid',0),.5);
assert.equal(n.activate('relu',-5),0);
assert.equal(n.activate('relu',8),8);
assert.equal(n.activate('adaline',-2),-2);
let r = n.learn('perceptron',[1,1],[.7,-.4],-.2,0,.1);
assert.equal(n.activate('perceptron',n.sum([1,1],r.w,r.b)),0);
r = n.learn('perceptron',[1,1],[.7,-.4],-.2,1,.1);
assert.deepEqual(r.w,[.7,-.4]);
let w=[.7,-.4], b=-.2, oldError=Infinity;
for(let i=0;i<30;i++) {
  r=n.learn('adaline',[1,1],w,b,1,.1);
  assert.ok(Math.abs(r.error)<oldError);
  oldError=Math.abs(r.error);w=r.w;b=r.b;
}
assert.ok(Math.abs(n.sum([1,1],w,b)-1)<.0001);
let state={v:-65,refractory:0}, spikes=0, firstSpike=0;
for(let t=1;t<=200;t++){
  state=n.lif(state.v,state.refractory,2,1,20);
  if(state.spike){spikes++;if(!firstSpike)firstSpike=t;assert.equal(state.v,-65);assert.equal(state.refractory,2);}
  assert.ok(state.v>=-65&&state.v<-50);
}
// Analytical first crossing: -20 ln(1 - 15/20) = 27.73 ms.
assert.equal(firstSpike,28);assert.ok(spikes>=6);
state={v:-65,refractory:0};
for(let t=0;t<1000;t++){state=n.lif(state.v,state.refractory,1,1,20);assert.equal(state.spike,0);}
assert.ok(Math.abs(state.v+55)<1e-8);
assert.ok(n.lif(-55,0,0,1,20).v<-55);
console.log('OK: AND/OR, veto, attivazioni, apprendimento, convergenza LMS, soglia LIF, reset e decadimento.');
