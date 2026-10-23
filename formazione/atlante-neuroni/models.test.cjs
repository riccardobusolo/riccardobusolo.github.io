const assert = require('node:assert/strict');
const demo = require('./models.js');
assert.deepEqual(Object.keys(demo.examples), ['mp', 'perceptron', 'relu']);
for (const [kind, examples] of Object.entries(demo.examples)) {
  const outputs = [];
  examples.forEach((x, cycle) => {
    const result = demo.calculate(kind, cycle);
    assert.equal(result.sum, result.products.reduce((a, b) => a + b, result.correction));
    assert.equal(result.output, kind === 'mp' ? Number(x[0] + x[1] >= 2) : kind === 'perceptron' ? Number(2 * x[0] - x[1] - 1 >= 0) : Math.max(0, 2 * x[0] - x[1] - 1));
    assert.notDeepEqual(x, examples[(cycle + 1) % examples.length]);
    outputs.push(result.output);
  });
  assert.ok(outputs.includes(0));
  assert.ok(outputs.some(y => y > 0));
  assert.deepEqual(demo.calculate(kind, examples.length), demo.calculate(kind, 0));
}
assert.equal(demo.calculate('perceptron', 3).sum, 0);
assert.equal(demo.calculate('perceptron', 3).output, 1);
assert.equal(demo.calculate('relu', 3).output, 0);
assert.equal(demo.calculate('relu', 1).output, 4);
let stage = 0, cycle = 0;
for (let i = 0; i < 24; i++) {
  assert.equal(stage, i % 4);
  assert.equal(cycle, Math.floor(i / 4));
  ({stage, cycle} = demo.advance(stage, cycle));
}
assert.equal(demo.duration * 4, 14000);
console.log('OK: tre modelli, calcoli, soglie, esempi variabili, ripetizione e sequenza di 14 secondi.');
