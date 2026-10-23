const assert = require('node:assert/strict');
const demo = require('./models.js');
assert.deepEqual(Object.keys(demo.examples), ['mp', 'perceptron']);
for (const [kind, examples] of Object.entries(demo.examples)) {
  const outputs = [];
  examples.forEach((x, cycle) => {
    const result = demo.calculate(kind, cycle);
    assert.equal(result.sum, result.products.reduce((a, b) => a + b, result.correction));
    assert.equal(result.output, kind === 'mp' ? Number(x[0] + x[1] >= 2) : Number(2 * x[0] - x[1] - 1 >= 0));
    assert.notDeepEqual(x, examples[(cycle + 1) % examples.length]);
    outputs.push(result.output);
  });
  assert.ok(outputs.includes(0));
  assert.ok(outputs.some(y => y > 0));
  assert.deepEqual(demo.calculate(kind, examples.length), demo.calculate(kind, 0));
}
assert.equal(demo.calculate('perceptron', 3).sum, 0);
assert.equal(demo.calculate('perceptron', 3).output, 1);
let stage = 0, cycle = 0;
for (let i = 0; i < 24; i++) {
  assert.equal(stage, i % 8);
  assert.equal(cycle, Math.floor(i / 8));
  ({stage, cycle} = demo.advance(stage, cycle));
}
assert.equal(demo.durations.reduce((a,b)=>a+b,0), 17500);
// Arrival boundaries: a value cannot enter a sum before its journey ends.
assert.equal(demo.visualState(1,.999).firstArrived,false);
assert.equal(demo.visualState(2,0).firstArrived,true);
assert.equal(demo.visualState(2,.999).secondArrived,false);
assert.equal(demo.visualState(3,0).secondArrived,true);
assert.equal(demo.visualState(3,.79).sumReady,false);
assert.equal(demo.visualState(3,.8).sumReady,true);
assert.equal(demo.visualState(5,.64).ruleGenerated,false);
assert.equal(demo.visualState(5,.65).ruleGenerated,true);
for(let stage=0;stage<7;stage++) {
  for(const progress of [0,.5,.999,1]) assert.equal(demo.visualState(stage,progress).outputArrived,false);
}
assert.equal(demo.visualState(7,0).outputArrived,true);
console.log('OK: due modelli, calcoli, sequenza, arrivi separati e risultato nascosto fino all’arrivo.');
