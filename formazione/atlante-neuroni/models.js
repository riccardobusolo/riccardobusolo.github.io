/* Fixed teaching examples: only inputs change, never the rule or weights. */
const NeuronDemo = Object.freeze({
  duration: 3500,
  examples: {
    mp: [[1, 0], [1, 1], [0, 1], [0, 0]],
    perceptron: [[1, 2], [3, 1], [0, 2], [2, 3], [2, 0], [1, 0]],
    relu: [[1, 2], [3, 1], [0, 2], [2, 3], [2, 0], [1, 0]]
  },
  calculate(kind, cycle) {
    const examples = this.examples[kind], x = examples[cycle % examples.length];
    const weights = kind === 'mp' ? [1, 1] : [2, -1];
    const correction = kind === 'mp' ? 0 : -1;
    const products = x.map((value, i) => value * weights[i]);
    const sum = products[0] + products[1] + correction;
    const output = kind === 'mp' ? Number(sum >= 2) : kind === 'perceptron' ? Number(sum >= 0) : Math.max(0, sum);
    return { x, weights, correction, products, sum, output };
  },
  advance(stage, cycle) {
    return stage === 3 ? { stage: 0, cycle: cycle + 1 } : { stage: stage + 1, cycle };
  }
});
if (typeof module !== 'undefined') module.exports = NeuronDemo;
