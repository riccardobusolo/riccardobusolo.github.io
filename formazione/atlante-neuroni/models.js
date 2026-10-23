/* Fixed teaching examples: only inputs change, never the rule or weights. */
const NeuronDemo = Object.freeze({
  durations: [1800, 2400, 2400, 1800, 2200, 2000, 2400, 2500],
  examples: {
    mp: [[1, 0], [1, 1], [0, 1], [0, 0]],
    perceptron: [[1, 2], [3, 1], [0, 2], [2, 3], [2, 0], [1, 0]]
  },
  calculate(kind, cycle) {
    const examples = this.examples[kind], x = examples[cycle % examples.length];
    const weights = kind === 'mp' ? [1, 1] : [2, -1];
    const correction = kind === 'mp' ? 0 : -1;
    const products = x.map((value, i) => value * weights[i]);
    const sum = products[0] + products[1] + correction;
    const output = Number(sum >= (kind === 'mp' ? 2 : 0));
    return { x, weights, correction, products, sum, output };
  },
  advance(stage, cycle) {
    return stage === 7 ? { stage: 0, cycle: cycle + 1 } : { stage: stage + 1, cycle };
  },
  visualState(stage, progress) {
    return {
      firstArrived: stage >= 2,
      secondArrived: stage >= 3,
      sumReady: stage >= 4 || (stage === 3 && progress >= .8),
      ruleGenerated: stage >= 6 || (stage === 5 && progress >= .65),
      outputArrived: stage >= 7
    };
  }
});
if (typeof module !== 'undefined') module.exports = NeuronDemo;
