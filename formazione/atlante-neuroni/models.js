/* Pure numerical core. LIF uses milliseconds, mV, nA and MΩ. */
const NeuronMath = Object.freeze({
  sum: (x, w, b = 0) => x.reduce((s, v, i) => s + v * w[i], b),
  mp: (x, threshold, inhibited) => inhibited ? 0 : Number(x[0] + x[1] >= threshold),
  activate: (kind, z) => kind === 'perceptron' ? Number(z >= 0) : kind === 'sigmoid' ? 1 / (1 + Math.exp(-z)) : kind === 'relu' ? Math.max(0, z) : z,
  learn(kind, x, w, b, target, rate) {
    const z = this.sum(x, w, b), y = this.activate(kind, z), error = target - y;
    // ADALINE minimizes 1/2 (target - z)^2, not classification error.
    return { w: w.map((v, i) => v + rate * error * x[i]), b: b + rate * error, error, y };
  },
  lif(v, refractory, current, dt, tau) {
    if (refractory > 0) return { v: -65, refractory: Math.max(0, refractory - dt), spike: 0 };
    const next = -65 + 10 * current + (v + 65 - 10 * current) * Math.exp(-dt / tau);
    return next >= -50 ? { v: -65, refractory: 2, spike: 1 } : { v: next, refractory: 0, spike: 0 };
  }
});
if (typeof module !== 'undefined') module.exports = NeuronMath;
