/* ════════════════════════════════════════════════════════════
   curriculum.js — contenuti didattici + generatori di esercizi
   Espone window.MT (curriculum, diagnostic, badges, generate…)
   Tutto deterministico, nessuna AI.
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── helpers numerici ── */
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const nz = (a, b) => { let v = 0; while (v === 0) v = ri(a, b); return v; };
  const sgnTxt = (c, first) => (c < 0 ? (first ? "-" : " - ") : (first ? "" : " + "));

  /* termine c·x^p → LaTeX e math.js */
  function termLatex(c, p, first) {
    const a = Math.abs(c), s = sgnTxt(c, first);
    if (p === 0) return s + a;
    const coef = a === 1 ? "" : a;
    if (p === 1) return s + coef + "x";
    return s + coef + "x^{" + p + "}";
  }
  function termExpr(c, p) {
    if (p === 0) return "(" + c + ")";
    if (p === 1) return "(" + c + ")*x";
    return "(" + c + ")*x^" + p;
  }
  /* polinomio da lista [{c,p}] (ordinata per p decrescente) */
  function polyLatex(terms) {
    return terms.filter(t => t.c !== 0).map((t, i) => termLatex(t.c, t.p, i === 0)).join("") || "0";
  }
  function polyExpr(terms) {
    const tt = terms.filter(t => t.c !== 0);
    if (!tt.length) return "0";
    return tt.map(t => termExpr(t.c, t.p)).join("+");
  }
  function dPoly(terms) {
    return terms.filter(t => t.p > 0).map(t => ({ c: t.c * t.p, p: t.p - 1 }));
  }

  /* ════════════════════════════════════════════════
     GENERATORI DI ESERCIZI
     Contratto restituito:
     { topicId, difficulty, variable, promptLatex, instruction,
       answerExpr (math.js, in x), answerLatex, domain:[a,b],
       plot:{f,d}|null, steps:[{ask,hint,guide,solutionLatex,solution,expect?}] }
     ════════════════════════════════════════════════ */

  /* ---- DERIVATE ---- */
  function genDerivate(diff) {
    if (diff === "base") return derivPoly();
    if (diff === "intermedio") return derivElementary();
    return derivChain();
  }

  function derivPoly() {
    const n = ri(2, 3);
    const powers = [];
    while (powers.length < n) { const p = ri(1, 4); if (!powers.includes(p)) powers.push(p); }
    powers.sort((a, b) => b - a);
    let terms = powers.map(p => ({ c: nz(-6, 6), p }));
    if (Math.random() < 0.6) terms.push({ c: nz(-9, 9), p: 0 });
    const der = dPoly(terms);
    const perTerm = terms.filter(t => t.p > 0).map(t =>
      `\\dfrac{d}{dx}\\left(${termLatex(t.c, t.p, true)}\\right)=${t.c * t.p}${t.p - 1 === 0 ? "" : (t.p - 1 === 1 ? "x" : "x^{" + (t.p - 1) + "}")}`
    );
    return {
      promptLatex: "f(x)=" + polyLatex(terms),
      instruction: "Calcola la derivata  f'(x)",
      answerExpr: polyExpr(der),
      answerLatex: polyLatex(der),
      domain: [-3, 3],
      plot: { f: polyExpr(terms), d: polyExpr(der) },
      steps: [
        {
          ask: "Da dove conviene partire? Qual è la regola per derivare una singola potenza \\(x^n\\)?",
          hint: "È la <b>regola della potenza</b>. L'esponente \"scende\" davanti.",
          guide: "\\(\\dfrac{d}{dx}x^{n}=n\\,x^{n-1}\\): moltiplichi per l'esponente e poi lo abbassi di 1.",
          solutionLatex: "\\frac{d}{dx}x^{n}=n\\,x^{n-1}",
          solution: "Regola della potenza: porti giù l'esponente come coefficiente e diminuisci l'esponente di 1."
        },
        {
          ask: "La derivata di una somma è la somma delle derivate. Deriva ogni termine separatamente.",
          hint: "Tratta ogni termine in modo indipendente; le costanti additive spariscono.",
          guide: "Applica la regola della potenza termine per termine. Un termine costante ha derivata 0.",
          solutionLatex: perTerm.join("\\quad ; \\quad "),
          solution: "Derivo ogni termine con la regola della potenza."
        },
        {
          ask: "Ora somma i risultati: scrivi \\(f'(x)\\).",
          hint: "Riunisci i termini derivati rispettando i segni.",
          guide: "Combina i termini ottenuti: il risultato è la derivata cercata.",
          solutionLatex: "f'(x)=" + polyLatex(der),
          solution: "Sommo i termini derivati.",
          expect: polyExpr(der)
        }
      ]
    };
  }

  function derivElementary() {
    const kind = pick(["polysin", "expk", "lnx2", "sumtrig"]);
    const a = nz(2, 5), k = nz(2, 4), b = nz(1, 6);
    if (kind === "polysin") {
      // f = a x^2 + b sin(x)
      const fL = `${a}x^2 ${b < 0 ? "-" : "+"} ${Math.abs(b)}\\sin x`;
      return {
        promptLatex: "f(x)=" + fL,
        instruction: "Calcola la derivata  f'(x)",
        answerExpr: `(${2 * a})*x + (${b})*cos(x)`,
        answerLatex: `${2 * a}x ${b < 0 ? "-" : "+"} ${Math.abs(b)}\\cos x`,
        domain: [-6, 6],
        plot: { f: `${a}*x^2+(${b})*sin(x)`, d: `${2 * a}*x+(${b})*cos(x)` },
        steps: [
          { ask: "Quante \"parti\" sommate vedi? Puoi derivarle separatamente.", hint: "È una somma di due funzioni note.", guide: "Deriva \\(ax^2\\) con la regola della potenza e \\(b\\sin x\\) con \\(\\frac{d}{dx}\\sin x=\\cos x\\).", solutionLatex: "\\frac{d}{dx}\\sin x=\\cos x", solution: "Derivata della somma = somma delle derivate." },
          { ask: "Scrivi \\(f'(x)\\).", hint: "\\(\\frac{d}{dx}(ax^2)=2ax\\).", guide: `Primo termine \\(${2 * a}x\\), secondo \\(${Math.abs(b)}\\cos x\\) (col segno corretto).`, solutionLatex: `f'(x)=${2 * a}x ${b < 0 ? "-" : "+"} ${Math.abs(b)}\\cos x`, solution: "Sommo le due derivate.", expect: `(${2 * a})*x + (${b})*cos(x)` }
        ]
      };
    }
    if (kind === "expk") {
      // f = a e^{k x}
      return {
        promptLatex: `f(x)=${a}e^{${k}x}`,
        instruction: "Calcola la derivata  f'(x)",
        answerExpr: `(${a * k})*exp(${k}*x)`,
        answerLatex: `${a * k}e^{${k}x}`,
        domain: [-2, 2],
        plot: { f: `${a}*exp(${k}*x)`, d: `${a * k}*exp(${k}*x)` },
        steps: [
          { ask: "È una funzione composta: \\(e^{(\\cdot)}\\). Quale regola serve?", hint: "Regola della catena.", guide: "\\(\\frac{d}{dx}e^{g(x)}=g'(x)e^{g(x)}\\). Qui \\(g(x)=" + k + "x\\).", solutionLatex: "\\frac{d}{dx}e^{g(x)}=g'(x)\\,e^{g(x)}", solution: "Derivata dell'esponenziale per la derivata dell'esponente." },
          { ask: "Scrivi \\(f'(x)\\).", hint: `\\(g'(x)=${k}\\).`, guide: `Moltiplico la costante \\(${a}\\) per \\(${k}\\) e mantengo \\(e^{${k}x}\\).`, solutionLatex: `f'(x)=${a * k}e^{${k}x}`, solution: "Costante × derivata dell'esponente × esponenziale.", expect: `(${a * k})*exp(${k}*x)` }
        ]
      };
    }
    if (kind === "lnx2") {
      // f = ln(x^2 + b),  b>0
      const bb = ri(1, 6);
      return {
        promptLatex: `f(x)=\\ln\\!\\left(x^2+${bb}\\right)`,
        instruction: "Calcola la derivata  f'(x)",
        answerExpr: `(2*x)/(x^2+${bb})`,
        answerLatex: `\\dfrac{2x}{x^2+${bb}}`,
        domain: [-4, 4],
        plot: { f: `log(x^2+${bb})`, d: `(2*x)/(x^2+${bb})` },
        steps: [
          { ask: "Funzione composta \\(\\ln(g(x))\\): quale regola?", hint: "Catena + derivata del logaritmo.", guide: "\\(\\frac{d}{dx}\\ln g(x)=\\dfrac{g'(x)}{g(x)}\\).", solutionLatex: "\\frac{d}{dx}\\ln g(x)=\\frac{g'(x)}{g(x)}", solution: "Derivata del logaritmo per la catena." },
          { ask: "Scrivi \\(f'(x)\\).", hint: `\\(g(x)=x^2+${bb}\\Rightarrow g'(x)=2x\\).`, guide: "Metti \\(g'(x)\\) al numeratore e \\(g(x)\\) al denominatore.", solutionLatex: `f'(x)=\\dfrac{2x}{x^2+${bb}}`, solution: "g'(x)/g(x).", expect: `(2*x)/(x^2+${bb})` }
        ]
      };
    }
    // sumtrig: f = a sin(x) + b cos(x)
    return {
      promptLatex: `f(x)=${a}\\sin x ${b < 0 ? "-" : "+"} ${Math.abs(b)}\\cos x`,
      instruction: "Calcola la derivata  f'(x)",
      answerExpr: `(${a})*cos(x) - (${b})*sin(x)`,
      answerLatex: `${a}\\cos x ${(-b) < 0 ? "-" : "+"} ${Math.abs(b)}\\sin x`,
      domain: [-6, 6],
      plot: { f: `${a}*sin(x)+(${b})*cos(x)`, d: `${a}*cos(x)-(${b})*sin(x)` },
      steps: [
        { ask: "Ricordi le derivate di seno e coseno?", hint: "\\(\\frac{d}{dx}\\sin x=\\cos x\\), \\(\\frac{d}{dx}\\cos x=-\\sin x\\).", guide: "Attenzione al segno meno nella derivata del coseno.", solutionLatex: "\\frac{d}{dx}\\sin x=\\cos x,\\quad \\frac{d}{dx}\\cos x=-\\sin x", solution: "Derivate goniometriche fondamentali." },
        { ask: "Scrivi \\(f'(x)\\).", hint: "Il coseno deriva in \\(-\\sin\\).", guide: `Primo termine \\(${a}\\cos x\\); secondo \\(-${Math.abs(b)}\\sin x\\) col segno corretto.`, solutionLatex: `f'(x)=${a}\\cos x ${(-b) < 0 ? "-" : "+"} ${Math.abs(b)}\\sin x`, solution: "Derivo ciascun termine.", expect: `(${a})*cos(x) - (${b})*sin(x)` }
      ]
    };
  }

  function derivChain() {
    const kind = pick(["powchain", "sinchain", "product", "quotient"]);
    const a = nz(2, 4), b = nz(1, 5), n = ri(2, 4);
    if (kind === "powchain") {
      // f = (a x^2 + b)^n
      const inner = `${a}x^2 ${b < 0 ? "-" : "+"} ${Math.abs(b)}`;
      return {
        promptLatex: `f(x)=\\left(${inner}\\right)^{${n}}`,
        instruction: "Calcola la derivata  f'(x)",
        answerExpr: `${n}*(${2 * a}*x)*(${a}*x^2+(${b}))^${n - 1}`,
        answerLatex: `${n}\\,(${2 * a}x)\\left(${inner}\\right)^{${n - 1}}`,
        domain: [-2.5, 2.5],
        plot: { f: `(${a}*x^2+(${b}))^${n}`, d: `${n}*(${2 * a}*x)*(${a}*x^2+(${b}))^${n - 1}` },
        steps: [
          { ask: "Funzione composta \\(g(x)^n\\): identifica la funzione interna \\(g(x)\\).", hint: "L'interno è ciò che sta tra parentesi.", guide: `\\(g(x)=${inner}\\), esterna \\((\\cdot)^{${n}}\\).`, solutionLatex: `g(x)=${inner}`, solution: "Riconosco interna ed esterna." },
          { ask: "Applica la regola della catena \\(\\frac{d}{dx}g^n = n\\,g^{\\,n-1}\\,g'\\). Quanto vale \\(g'(x)\\)?", hint: "Deriva l'interno con la regola della potenza.", guide: `\\(g'(x)=${2 * a}x\\).`, solutionLatex: `g'(x)=${2 * a}x`, solution: "Derivo la funzione interna." },
          { ask: "Scrivi \\(f'(x)\\).", hint: "Moltiplica i tre fattori: \\(n\\), \\(g^{n-1}\\), \\(g'\\).", guide: `\\(f'(x)=${n}\\,(${inner})^{${n - 1}}\\cdot ${2 * a}x\\).`, solutionLatex: `f'(x)=${n}\\,(${2 * a}x)\\left(${inner}\\right)^{${n - 1}}`, solution: "Catena: esterna' · interna'.", expect: `${n}*(${2 * a}*x)*(${a}*x^2+(${b}))^${n - 1}` }
        ]
      };
    }
    if (kind === "sinchain") {
      // f = sin(a x + b)
      return {
        promptLatex: `f(x)=\\sin\\!\\left(${a}x ${b < 0 ? "-" : "+"} ${Math.abs(b)}\\right)`,
        instruction: "Calcola la derivata  f'(x)",
        answerExpr: `(${a})*cos(${a}*x+(${b}))`,
        answerLatex: `${a}\\cos\\!\\left(${a}x ${b < 0 ? "-" : "+"} ${Math.abs(b)}\\right)`,
        domain: [-6, 6],
        plot: { f: `sin(${a}*x+(${b}))`, d: `${a}*cos(${a}*x+(${b}))` },
        steps: [
          { ask: "Composta \\(\\sin(g(x))\\). Quale derivata esterna?", hint: "\\(\\frac{d}{dx}\\sin u=\\cos u\\).", guide: `Esterna \\(\\cos(g)\\), interna \\(g=${a}x${b < 0 ? "" : "+"}${b}\\).`, solutionLatex: "\\frac{d}{dx}\\sin g=\\cos g\\cdot g'", solution: "Coseno dell'argomento per la derivata dell'argomento." },
          { ask: "Scrivi \\(f'(x)\\).", hint: `\\(g'(x)=${a}\\).`, guide: `\\(f'(x)=${a}\\cos(${a}x${b < 0 ? "" : "+"}${b})\\).`, solutionLatex: `f'(x)=${a}\\cos\\!\\left(${a}x ${b < 0 ? "-" : "+"} ${Math.abs(b)}\\right)`, solution: "Catena con seno.", expect: `(${a})*cos(${a}*x+(${b}))` }
        ]
      };
    }
    if (kind === "product") {
      // f = (a x + b) * e^{x}
      return {
        promptLatex: `f(x)=\\left(${a}x ${b < 0 ? "-" : "+"} ${Math.abs(b)}\\right)e^{x}`,
        instruction: "Calcola la derivata  f'(x)",
        answerExpr: `(${a})*exp(x) + (${a}*x+(${b}))*exp(x)`,
        answerLatex: `\\left(${a}x ${b < 0 ? "-" : "+"} ${Math.abs(b)} + ${a}\\right)e^{x}`,
        domain: [-3, 2],
        plot: { f: `(${a}*x+(${b}))*exp(x)`, d: `(${a})*exp(x)+(${a}*x+(${b}))*exp(x)` },
        steps: [
          { ask: "Prodotto di due funzioni: quale regola?", hint: "Regola del prodotto.", guide: "\\((uv)'=u'v+uv'\\). Poni \\(u=" + a + "x" + (b < 0 ? "" : "+") + b + "\\), \\(v=e^x\\).", solutionLatex: "(uv)'=u'v+uv'", solution: "Identifico i due fattori u e v." },
          { ask: "Calcola \\(u'\\) e \\(v'\\).", hint: "\\(u'=" + a + "\\), \\(v'=e^x\\).", guide: `\\(u'=${a}\\), \\(v'=e^x\\).`, solutionLatex: `u'=${a},\\quad v'=e^{x}`, solution: "Derivo i due fattori." },
          { ask: "Componi \\(u'v+uv'\\) e scrivi \\(f'(x)\\).", hint: "Raccogli \\(e^x\\) se vuoi semplificare.", guide: `\\(f'(x)=${a}e^x+(${a}x${b < 0 ? "" : "+"}${b})e^x\\).`, solutionLatex: `f'(x)=\\left(${a}x ${b < 0 ? "-" : "+"} ${Math.abs(b)}+${a}\\right)e^{x}`, solution: "Applico u'v+uv'.", expect: `(${a})*exp(x) + (${a}*x+(${b}))*exp(x)` }
        ]
      };
    }
    // quotient: f = (a x + b)/(x^2 + 1)
    return {
      promptLatex: `f(x)=\\dfrac{${a}x ${b < 0 ? "-" : "+"} ${Math.abs(b)}}{x^2+1}`,
      instruction: "Calcola la derivata  f'(x)",
      answerExpr: `(${a}*(x^2+1) - (${a}*x+(${b}))*(2*x))/(x^2+1)^2`,
      answerLatex: `\\dfrac{${a}(x^2+1)-(${a}x ${b < 0 ? "-" : "+"} ${Math.abs(b)})(2x)}{(x^2+1)^2}`,
      domain: [-4, 4],
      plot: { f: `(${a}*x+(${b}))/(x^2+1)`, d: `(${a}*(x^2+1)-(${a}*x+(${b}))*(2*x))/(x^2+1)^2` },
      steps: [
        { ask: "Rapporto di funzioni: quale regola?", hint: "Regola del quoziente.", guide: "\\(\\left(\\frac{u}{v}\\right)'=\\dfrac{u'v-uv'}{v^2}\\).", solutionLatex: "\\left(\\frac{u}{v}\\right)'=\\frac{u'v-uv'}{v^2}", solution: "Identifico numeratore u e denominatore v." },
        { ask: "Calcola \\(u'\\) e \\(v'\\).", hint: `\\(u'=${a}\\), \\(v'=2x\\).`, guide: `\\(u=${a}x${b < 0 ? "" : "+"}${b}\\Rightarrow u'=${a}\\); \\(v=x^2+1\\Rightarrow v'=2x\\).`, solutionLatex: `u'=${a},\\quad v'=2x`, solution: "Derivo numeratore e denominatore." },
        { ask: "Sostituisci in \\(\\frac{u'v-uv'}{v^2}\\) e scrivi \\(f'(x)\\).", hint: "Non serve semplificare per la verifica.", guide: "Metti tutto sul denominatore \\((x^2+1)^2\\).", solutionLatex: `f'(x)=\\dfrac{${a}(x^2+1)-(${a}x ${b < 0 ? "-" : "+"} ${Math.abs(b)})(2x)}{(x^2+1)^2}`, solution: "Applico la regola del quoziente.", expect: `(${a}*(x^2+1) - (${a}*x+(${b}))*(2*x))/(x^2+1)^2` }
      ]
    };
  }

  /* ---- FRAZIONI (Liv.0) ---- */
  function genFrazioni() {
    const a = ri(1, 7), b = ri(2, 9), c = ri(1, 7), d = ri(2, 9);
    const num = a * d + c * b, den = b * d;
    const g = (x, y) => y ? g(y, x % y) : x;
    const k = g(Math.abs(num), den);
    const rn = num / k, rd = den / k;
    return {
      promptLatex: `\\dfrac{${a}}{${b}}+\\dfrac{${c}}{${d}}`,
      instruction: "Calcola la somma e riduci ai minimi termini",
      answerExpr: `${rn}/${rd}`,
      answerLatex: rd === 1 ? `${rn}` : `\\dfrac{${rn}}{${rd}}`,
      domain: null, plot: null,
      steps: [
        { ask: "Per sommare due frazioni cosa serve prima di tutto?", hint: "Un denominatore comune.", guide: `Un denominatore comune è \\(${b}\\cdot${d}=${b * d}\\).`, solutionLatex: `\\text{m.c. } = ${b * d}`, solution: "Trovo il denominatore comune." },
        { ask: "Riscrivi le due frazioni con denominatore comune e somma i numeratori.", hint: `\\(\\frac{${a}}{${b}}=\\frac{${a * d}}{${b * d}}\\), \\(\\frac{${c}}{${d}}=\\frac{${c * b}}{${b * d}}\\).`, guide: `Numeratore \\(=${a * d}+${c * b}=${num}\\).`, solutionLatex: `\\dfrac{${num}}{${den}}`, solution: "Sommo i numeratori." },
        { ask: "Riduci ai minimi termini.", hint: `Dividi numeratore e denominatore per il loro MCD (\\(${k}\\)).`, guide: `\\(\\frac{${num}}{${den}}=\\frac{${rn}}{${rd}}\\).`, solutionLatex: rd === 1 ? `${rn}` : `\\dfrac{${rn}}{${rd}}`, solution: "Semplifico.", expect: `${rn}/${rd}` }
      ]
    };
  }

  /* ---- POTENZE (Liv.0) ---- */
  function genPotenze() {
    const m = ri(2, 6), n = ri(2, 6);
    return {
      promptLatex: `x^{${m}}\\cdot x^{${n}}`,
      instruction: "Semplifica usando le proprietà delle potenze",
      answerExpr: `x^${m + n}`,
      answerLatex: `x^{${m + n}}`,
      domain: null, plot: null,
      steps: [
        { ask: "Prodotto di potenze con la stessa base: cosa fai con gli esponenti?", hint: "Si sommano.", guide: "\\(a^m\\cdot a^n=a^{m+n}\\).", solutionLatex: "a^m\\cdot a^n=a^{m+n}", solution: "Stessa base ⇒ sommo gli esponenti." },
        { ask: "Scrivi il risultato.", hint: `\\(${m}+${n}=${m + n}\\).`, guide: `\\(x^{${m}}\\cdot x^{${n}}=x^{${m + n}}\\).`, solutionLatex: `x^{${m + n}}`, solution: "Sommo gli esponenti.", expect: `x^${m + n}` }
      ]
    };
  }

  /* ---- EQUAZIONI 1° GRADO (Liv.0) ---- */
  function genEqLineari() {
    const a = nz(2, 6), x0 = nz(-5, 5), b = ri(-9, 9);
    const c = a * x0 + b; // a x + b = c  → x = x0
    return {
      promptLatex: `${a}x ${b < 0 ? "-" : "+"} ${Math.abs(b)} = ${c}`,
      instruction: "Risolvi rispetto a x",
      answerExpr: `${x0}`,
      answerLatex: `x=${x0}`,
      domain: null, plot: null,
      steps: [
        { ask: "Primo obiettivo: isolare il termine con la x. Cosa porti a destra?", hint: `Sposta il termine noto \\(${b}\\) dall'altra parte.`, guide: `\\(${a}x = ${c} ${b < 0 ? "+" : "-"} ${Math.abs(b)} = ${c - b}\\).`, solutionLatex: `${a}x = ${c - b}`, solution: "Isolo il termine in x." },
        { ask: "Ora come ottieni x?", hint: `Dividi entrambi i membri per \\(${a}\\).`, guide: `\\(x=\\dfrac{${c - b}}{${a}}=${x0}\\).`, solutionLatex: `x=${x0}`, solution: "Divido per il coefficiente.", expect: `${x0}` }
      ]
    };
  }

  /* mappa generatori per topic */
  const GEN = {
    derivate: genDerivate,
    frazioni: () => genFrazioni(),
    potenze: () => genPotenze(),
    "equazioni": () => genEqLineari()
  };

  /* ════════════════════════════════════════════════
     CURRICULUM (livelli → argomenti)
     campo `module:true` ⇒ ha esercizi+tutor (in GEN)
     ════════════════════════════════════════════════ */
  const ICON = {
    book: "M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z",
    func: "M3 3v18h18M7 16l4-7 3 4 4-8",
    sigma: "M6 4h12l-7 8 7 8H6",
    deriv: "M3 17c4 0 5-10 9-10s5 7 9 7",
    integral: "M8 4c2 0 3 1 3 4v8c0 3 1 4 3 4M6 18h2M16 6h2",
    complex: "M12 2v20M2 12h20",
    grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
    wave: "M2 12c2-6 4-6 6 0s4 6 6 0 4-6 6 0",
    target: "M12 12m-9 0a9 9 0 1018 0 9 9 0 10-18 0M12 12m-4 0a4 4 0 108 0 4 4 0 10-8 0",
  };

  const CURRICULUM = [
    {
      id: 0, key: "fondamenta", label: "Ripasso Fondamenta",
      blurb: "Le basi indispensabili. Se qui c'è una lacuna, tutto il resto traballa.",
      topics: [
        {
          id: "frazioni", title: "Frazioni e aritmetica", icon: ICON.sigma, module: true, prereqs: [],
          summary: "Operazioni con frazioni, denominatori comuni, semplificazione.",
          theory: [
            { h: "Idea di frazione", body: "Una frazione \\(\\frac{a}{b}\\) rappresenta \\(a\\) parti di un intero diviso in \\(b\\) parti uguali. Il numero in alto è il <b>numeratore</b>, quello in basso il <b>denominatore</b>." },
            { h: "Somma di frazioni", body: "Per sommare \\(\\frac{a}{b}+\\frac{c}{d}\\) serve un <b>denominatore comune</b>: \\(\\frac{a}{b}+\\frac{c}{d}=\\frac{ad+cb}{bd}\\). Poi si riduce ai minimi termini dividendo per il MCD." },
            { h: "Prodotto e quoziente", body: "\\(\\frac{a}{b}\\cdot\\frac{c}{d}=\\frac{ac}{bd}\\);   dividere equivale a moltiplicare per il reciproco: \\(\\frac{a}{b}:\\frac{c}{d}=\\frac{a}{b}\\cdot\\frac{d}{c}\\)." }
          ],
          formulas: [{ cap: "Somma", tex: "\\frac{a}{b}+\\frac{c}{d}=\\frac{ad+cb}{bd}" }, { cap: "Prodotto", tex: "\\frac{a}{b}\\cdot\\frac{c}{d}=\\frac{ac}{bd}" }, { cap: "Divisione", tex: "\\frac{a}{b}:\\frac{c}{d}=\\frac{ad}{bc}" }],
          theorems: [],
          definitions: [{ term: "Frazione ridotta", def: "Numeratore e denominatore non hanno divisori comuni oltre 1." }],
          errors: ["Sommare i denominatori (\\(\\frac{1}{2}+\\frac{1}{3}\\neq\\frac{2}{5}\\)).", "Dimenticare di ridurre il risultato.", "Invertire la frazione sbagliata nella divisione."],
          tips: ["Trova SEMPRE il denominatore comune prima di sommare.", "Il prodotto \\(b\\cdot d\\) è un denominatore comune valido (non sempre il minimo)."]
        },
        {
          id: "potenze", title: "Potenze e radicali", icon: ICON.sigma, module: true, prereqs: ["frazioni"],
          summary: "Proprietà delle potenze, esponenti negativi e razionali, radicali.",
          theory: [
            { h: "Definizione", body: "\\(a^n\\) è il prodotto di \\(a\\) per sé stesso \\(n\\) volte. \\(a^0=1\\) (con \\(a\\neq0\\))." },
            { h: "Proprietà fondamentali", body: "Stessa base: \\(a^m a^n=a^{m+n}\\) e \\(\\frac{a^m}{a^n}=a^{m-n}\\). Potenza di potenza: \\((a^m)^n=a^{mn}\\). Esponente negativo: \\(a^{-n}=\\frac{1}{a^n}\\)." },
            { h: "Radicali", body: "\\(\\sqrt[n]{a}=a^{1/n}\\): un radicale è una potenza a esponente razionale. Quindi tutte le proprietà delle potenze valgono anche per i radicali." }
          ],
          formulas: [{ cap: "Prodotto", tex: "a^m\\cdot a^n=a^{m+n}" }, { cap: "Quoziente", tex: "\\frac{a^m}{a^n}=a^{m-n}" }, { cap: "Potenza di potenza", tex: "(a^m)^n=a^{mn}" }, { cap: "Radicale", tex: "\\sqrt[n]{a}=a^{1/n}" }],
          theorems: [],
          definitions: [{ term: "Esponente", def: "Indica quante volte la base si moltiplica per sé stessa." }],
          errors: ["\\(a^m\\cdot a^n=a^{mn}\\) (sbagliato: gli esponenti si <b>sommano</b>).", "\\((a+b)^2=a^2+b^2\\) (manca il doppio prodotto!).", "Dimenticare che \\(a^{-n}=1/a^n\\)."],
          tips: ["Trasforma i radicali in potenze con esponente frazionario: tutto diventa più semplice."]
        },
        {
          id: "equazioni", title: "Equazioni e disequazioni", icon: ICON.func, module: true, prereqs: ["potenze"],
          summary: "Equazioni di 1° e 2° grado, disequazioni, sistemi.",
          theory: [
            { h: "Equazioni di primo grado", body: "Si isola la \\(x\\) portando i termini noti da una parte e i termini con \\(x\\) dall'altra, poi si divide per il coefficiente: \\(ax+b=c\\Rightarrow x=\\frac{c-b}{a}\\)." },
            { h: "Equazioni di secondo grado", body: "\\(ax^2+bx+c=0\\) ha soluzioni \\(x=\\frac{-b\\pm\\sqrt{\\Delta}}{2a}\\) con \\(\\Delta=b^2-4ac\\). Se \\(\\Delta<0\\) niente soluzioni reali." },
            { h: "Disequazioni", body: "Stesse regole, MA moltiplicando/dividendo per un numero negativo il verso della disuguaglianza si <b>inverte</b>." }
          ],
          formulas: [{ cap: "1° grado", tex: "ax+b=0\\Rightarrow x=-\\frac{b}{a}" }, { cap: "2° grado", tex: "x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}" }, { cap: "Discriminante", tex: "\\Delta=b^2-4ac" }],
          theorems: [],
          definitions: [{ term: "Soluzione", def: "Valore che, sostituito, rende vera l'uguaglianza." }],
          errors: ["Non invertire il verso della disequazione quando si divide per un negativo.", "Sbagliare il segno spostando un termine.", "Dimenticare la soluzione \\(\\pm\\) nel secondo grado."],
          tips: ["Verifica sempre la soluzione sostituendola nell'equazione di partenza."]
        },
        {
          id: "trigonometria", title: "Trigonometria", icon: ICON.wave, module: false, prereqs: ["equazioni"],
          summary: "Seno, coseno, tangente, identità e formule goniometriche.",
          theory: [
            { h: "Definizioni sul cerchio", body: "Sul cerchio unitario, \\(\\cos\\theta\\) è l'ascissa e \\(\\sin\\theta\\) l'ordinata del punto. \\(\\tan\\theta=\\frac{\\sin\\theta}{\\cos\\theta}\\)." },
            { h: "Identità fondamentale", body: "\\(\\sin^2\\theta+\\cos^2\\theta=1\\): è il teorema di Pitagora sul cerchio unitario." },
            { h: "Formule di addizione", body: "\\(\\sin(\\alpha\\pm\\beta)=\\sin\\alpha\\cos\\beta\\pm\\cos\\alpha\\sin\\beta\\) e \\(\\cos(\\alpha\\pm\\beta)=\\cos\\alpha\\cos\\beta\\mp\\sin\\alpha\\sin\\beta\\)." }
          ],
          formulas: [{ cap: "Identità", tex: "\\sin^2\\theta+\\cos^2\\theta=1" }, { cap: "Tangente", tex: "\\tan\\theta=\\frac{\\sin\\theta}{\\cos\\theta}" }, { cap: "Duplicazione", tex: "\\sin 2\\theta=2\\sin\\theta\\cos\\theta" }],
          theorems: [],
          definitions: [{ term: "Radiante", def: "Angolo che sottende un arco di lunghezza pari al raggio; \\(180°=\\pi\\) rad." }],
          errors: ["Lavorare in gradi quando servono i radianti (e viceversa).", "\\(\\sin(\\alpha+\\beta)\\neq\\sin\\alpha+\\sin\\beta\\)."],
          tips: ["Memorizza i valori notevoli (0, 30°, 45°, 60°, 90°)."]
        },
        {
          id: "logaritmi", title: "Logaritmi ed esponenziali", icon: ICON.func, module: false, prereqs: ["potenze"],
          summary: "Proprietà di log ed esponenziali, equazioni e disequazioni relative.",
          theory: [
            { h: "Definizione", body: "\\(\\log_a b=c\\) significa \\(a^c=b\\). Il logaritmo è l'inverso dell'esponenziale." },
            { h: "Proprietà", body: "\\(\\log(xy)=\\log x+\\log y\\), \\(\\log\\frac{x}{y}=\\log x-\\log y\\), \\(\\log x^k=k\\log x\\)." }
          ],
          formulas: [{ cap: "Prodotto", tex: "\\log(xy)=\\log x+\\log y" }, { cap: "Potenza", tex: "\\log x^k=k\\log x" }, { cap: "Cambio base", tex: "\\log_a b=\\frac{\\ln b}{\\ln a}" }],
          theorems: [],
          definitions: [{ term: "Numero di Eulero", def: "\\(e\\approx 2{,}718\\), base del logaritmo naturale \\(\\ln\\)." }],
          errors: ["\\(\\log(x+y)\\neq\\log x+\\log y\\).", "Argomento del logaritmo \\(\\le 0\\) (non esiste)."],
          tips: ["Le proprietà del log trasformano prodotti in somme: utilissime nelle derivate."]
        }
      ]
    },
    {
      id: 1, key: "mat1", label: "Matematica 1",
      blurb: "Analisi di una variabile: funzioni, limiti, derivate, integrali.",
      topics: [
        {
          id: "funzioni", title: "Funzioni", icon: ICON.func, module: false, prereqs: ["equazioni"],
          summary: "Dominio, segno, intersezioni, lettura del grafico.",
          theory: [
            { h: "Dominio", body: "L'insieme dei valori di \\(x\\) per cui \\(f(x)\\) ha senso: niente denominatori nulli, niente radici pari di negativi, niente log di non-positivi." },
            { h: "Studio del segno", body: "Stabilire dove \\(f(x)>0\\) e dove \\(f(x)<0\\) aiuta a posizionare il grafico rispetto all'asse \\(x\\)." }
          ],
          formulas: [{ cap: "Dominio frazione", tex: "\\text{denominatore}\\neq 0" }, { cap: "Dominio radice pari", tex: "\\text{radicando}\\ge 0" }, { cap: "Dominio log", tex: "\\text{argomento}>0" }],
          theorems: [],
          definitions: [{ term: "Funzione", def: "Relazione che a ogni \\(x\\) del dominio associa un solo valore \\(f(x)\\)." }],
          errors: ["Dimenticare le condizioni di esistenza nel dominio.", "Confondere zeri della funzione con punti di non esistenza."],
          tips: ["Il dominio è il primo passo di ogni studio di funzione."]
        },
        {
          id: "limiti", title: "Limiti", icon: ICON.deriv, module: false, prereqs: ["funzioni"],
          summary: "Definizione, forme indeterminate, limiti notevoli.",
          theory: [
            { h: "Idea di limite", body: "\\(\\lim_{x\\to c}f(x)=L\\) significa che \\(f(x)\\) si avvicina a \\(L\\) quando \\(x\\) si avvicina a \\(c\\)." },
            { h: "Forme indeterminate", body: "Espressioni come \\(\\frac{0}{0}\\), \\(\\frac{\\infty}{\\infty}\\), \\(0\\cdot\\infty\\), \\(\\infty-\\infty\\) non si risolvono per sostituzione: servono manipolazioni o de l'Hôpital." }
          ],
          formulas: [{ cap: "Notevole", tex: "\\lim_{x\\to0}\\frac{\\sin x}{x}=1" }, { cap: "Notevole", tex: "\\lim_{x\\to0}\\frac{e^x-1}{x}=1" }, { cap: "Notevole", tex: "\\lim_{x\\to\\infty}\\left(1+\\frac1x\\right)^x=e" }],
          theorems: [{ name: "Teorema del confronto", statement: "Se \\(g\\le f\\le h\\) e \\(g,h\\to L\\), allora \\(f\\to L\\)." }],
          definitions: [{ term: "Forma indeterminata", def: "Espressione il cui valore non è determinato dalla sola sostituzione." }],
          errors: ["Sostituire direttamente in una forma indeterminata.", "Applicare de l'Hôpital quando NON c'è forma \\(\\frac00\\) o \\(\\frac\\infty\\infty\\)."],
          tips: ["Riconosci subito i limiti notevoli: spesso bastano loro."]
        },
        {
          id: "continuita", title: "Continuità", icon: ICON.func, module: false, prereqs: ["limiti"],
          summary: "Punti di discontinuità e teoremi fondamentali.",
          theory: [
            { h: "Definizione", body: "\\(f\\) è continua in \\(c\\) se \\(\\lim_{x\\to c}f(x)=f(c)\\): nessun salto, buco o asintoto." },
            { h: "Tipi di discontinuità", body: "Eliminabile (buco), di salto (1ª specie), di seconda specie (asintoto)." }
          ],
          formulas: [{ cap: "Continuità", tex: "\\lim_{x\\to c}f(x)=f(c)" }],
          theorems: [{ name: "Teorema di Weierstrass", statement: "Una funzione continua su \\([a,b]\\) ha massimo e minimo." }, { name: "Teorema degli zeri", statement: "Se \\(f\\) è continua e \\(f(a)f(b)<0\\), esiste uno zero in \\((a,b)\\)." }],
          definitions: [{ term: "Discontinuità eliminabile", def: "Il limite esiste finito ma diverso dal valore (o non definito)." }],
          errors: ["Confondere esistenza del limite con continuità."],
          tips: ["Continuità = il grafico si disegna senza staccare la penna."]
        },
        {
          id: "derivate", title: "Derivate", icon: ICON.deriv, module: true, prereqs: ["limiti"],
          summary: "Definizione, regole di derivazione, derivate fondamentali e teoremi.",
          theory: [
            { h: "Cos'è una derivata", body: "La derivata \\(f'(x)\\) misura la <b>velocità di variazione</b> di \\(f\\): è la pendenza della retta tangente al grafico nel punto \\(x\\). Formalmente è un limite: \\(f'(x)=\\lim_{h\\to0}\\dfrac{f(x+h)-f(x)}{h}\\)." },
            { h: "Regola della potenza", body: "La regola più usata: \\(\\dfrac{d}{dx}x^{n}=n\\,x^{n-1}\\). L'esponente \"scende\" davanti come coefficiente e diminuisce di 1. Esempio: \\(\\frac{d}{dx}x^5=5x^4\\)." },
            { h: "Linearità", body: "La derivata di una somma è la somma delle derivate, e le costanti moltiplicative \"escono\": \\((\\,a\\,f+b\\,g\\,)'=a f'+b g'\\). Una costante additiva ha derivata 0." },
            { h: "Regola del prodotto e del quoziente", body: "\\((uv)'=u'v+uv'\\) e \\(\\left(\\dfrac{u}{v}\\right)'=\\dfrac{u'v-uv'}{v^2}\\). Attenzione all'ordine e ai segni." },
            { h: "Regola della catena", body: "Per le funzioni composte: \\((f(g(x)))'=f'(g(x))\\cdot g'(x)\\). Si deriva la funzione esterna lasciando intatta l'interna, poi si moltiplica per la derivata dell'interna." }
          ],
          formulas: [
            { cap: "Potenza", tex: "\\frac{d}{dx}x^n=n\\,x^{n-1}" },
            { cap: "Prodotto", tex: "(uv)'=u'v+uv'" },
            { cap: "Quoziente", tex: "\\left(\\frac{u}{v}\\right)'=\\frac{u'v-uv'}{v^2}" },
            { cap: "Catena", tex: "(f\\circ g)'=f'(g)\\,g'" },
            { cap: "Esponenziale", tex: "\\frac{d}{dx}e^{x}=e^{x}" },
            { cap: "Logaritmo", tex: "\\frac{d}{dx}\\ln x=\\frac1x" },
            { cap: "Seno", tex: "\\frac{d}{dx}\\sin x=\\cos x" },
            { cap: "Coseno", tex: "\\frac{d}{dx}\\cos x=-\\sin x" }
          ],
          theorems: [
            { name: "Teorema di Fermat", statement: "Se \\(x_0\\) è un estremo interno e \\(f\\) è derivabile, allora \\(f'(x_0)=0\\)." },
            { name: "Teorema di Lagrange", statement: "Esiste \\(c\\in(a,b)\\) con \\(f'(c)=\\dfrac{f(b)-f(a)}{b-a}\\)." },
            { name: "Teorema di Rolle", statement: "Se \\(f(a)=f(b)\\), esiste \\(c\\) con \\(f'(c)=0\\)." }
          ],
          definitions: [
            { term: "Derivata", def: "Limite del rapporto incrementale; pendenza della tangente." },
            { term: "Punto stazionario", def: "Punto in cui \\(f'(x)=0\\)." }
          ],
          errors: [
            "Dimenticare di moltiplicare per la derivata dell'argomento (regola della catena).",
            "Scordare il segno meno in \\(\\frac{d}{dx}\\cos x=-\\sin x\\).",
            "Nel quoziente invertire \\(u'v\\) con \\(uv'\\) al numeratore.",
            "Applicare la regola della potenza ad \\(a^x\\) (è esponenziale, non potenza)."
          ],
          tips: [
            "Identifica PRIMA la struttura: somma? prodotto? quoziente? composizione?",
            "Nella catena chiediti sempre: \"qual è la funzione interna?\".",
            "Non serve semplificare per verificare: il tutor accetta forme equivalenti."
          ]
        },
        {
          id: "studio-funzione", title: "Studio di funzione", icon: ICON.func, module: false, prereqs: ["derivate"],
          summary: "Monotonia, concavità, flessi, asintoti.",
          theory: [
            { h: "Crescenza con la derivata prima", body: "Dove \\(f'>0\\) la funzione cresce, dove \\(f'<0\\) decresce. I punti con \\(f'=0\\) sono candidati a massimo/minimo." },
            { h: "Concavità con la derivata seconda", body: "Se \\(f''>0\\) la concavità è verso l'alto; se \\(f''<0\\) verso il basso. Dove cambia, c'è un <b>flesso</b>." }
          ],
          formulas: [{ cap: "Crescente", tex: "f'(x)>0" }, { cap: "Concavità alto", tex: "f''(x)>0" }, { cap: "Asintoto obliquo", tex: "m=\\lim_{x\\to\\infty}\\frac{f(x)}{x}" }],
          theorems: [],
          definitions: [{ term: "Flesso", def: "Punto in cui cambia la concavità." }, { term: "Asintoto", def: "Retta a cui il grafico si avvicina indefinitamente." }],
          errors: ["Concludere che \\(f'(x_0)=0\\) implica sempre un estremo (può essere un flesso a tangente orizzontale)."],
          tips: ["Schema: dominio → simmetrie → limiti/asintoti → \\(f'\\) → \\(f''\\) → grafico."]
        },
        {
          id: "integrali", title: "Integrali", icon: ICON.integral, module: false, prereqs: ["derivate"],
          summary: "Indefiniti, definiti, per parti, per sostituzione.",
          theory: [
            { h: "Integrale come anti-derivata", body: "Integrare è l'operazione inversa del derivare: \\(\\int f'(x)\\,dx=f(x)+C\\)." },
            { h: "Teorema fondamentale", body: "\\(\\int_a^b f(x)\\,dx=F(b)-F(a)\\), dove \\(F'=f\\). Collega area e primitiva." },
            { h: "Tecniche", body: "Per parti: \\(\\int u\\,dv=uv-\\int v\\,du\\). Per sostituzione: si cambia variabile per ricondursi a un integrale noto." }
          ],
          formulas: [{ cap: "Potenza", tex: "\\int x^n dx=\\frac{x^{n+1}}{n+1}+C" }, { cap: "Per parti", tex: "\\int u\\,dv=uv-\\int v\\,du" }, { cap: "Fondamentale", tex: "\\int_a^b f=F(b)-F(a)" }],
          theorems: [{ name: "Teorema fondamentale del calcolo", statement: "Lega l'integrale definito alla primitiva: \\(\\int_a^b f=F(b)-F(a)\\)." }],
          definitions: [{ term: "Primitiva", def: "Funzione \\(F\\) tale che \\(F'=f\\)." }],
          errors: ["Dimenticare la costante \\(+C\\) nell'indefinito.", "Sbagliare il segno nell'integrazione per parti."],
          tips: ["Se sai derivare bene, l'integrazione diventa \"derivare al contrario\"."]
        }
      ]
    },
    {
      id: 2, key: "mat2", label: "Matematica 2",
      blurb: "Più variabili, complessi, serie, equazioni differenziali e oltre.",
      topics: [
        {
          id: "numeri-complessi", title: "Numeri complessi", icon: ICON.complex, module: false, prereqs: ["trigonometria"],
          summary: "Forma algebrica, modulo, argomento, forma esponenziale, De Moivre.",
          theory: [
            { h: "Forma algebrica", body: "\\(z=a+ib\\) con \\(i^2=-1\\). \\(a\\) è la parte reale, \\(b\\) l'immaginaria." },
            { h: "Modulo e argomento", body: "\\(|z|=\\sqrt{a^2+b^2}\\), argomento \\(\\theta=\\arg z\\). Forma trigonometrica: \\(z=|z|(\\cos\\theta+i\\sin\\theta)\\)." },
            { h: "Forma esponenziale e De Moivre", body: "\\(z=|z|e^{i\\theta}\\). Potenze: \\(z^n=|z|^n e^{in\\theta}\\) (De Moivre)." }
          ],
          formulas: [{ cap: "Modulo", tex: "|z|=\\sqrt{a^2+b^2}" }, { cap: "Eulero", tex: "e^{i\\theta}=\\cos\\theta+i\\sin\\theta" }, { cap: "De Moivre", tex: "z^n=|z|^n e^{in\\theta}" }],
          theorems: [{ name: "Teorema fondamentale dell'algebra", statement: "Ogni polinomio di grado \\(n\\) ha esattamente \\(n\\) radici complesse (con molteplicità)." }],
          definitions: [{ term: "Unità immaginaria", def: "\\(i\\) tale che \\(i^2=-1\\)." }],
          errors: ["Dimenticare le \\(n\\) radici n-esime distinte.", "Confondere argomento in gradi e radianti."],
          tips: ["La forma esponenziale rende banali prodotti e potenze."]
        },
        {
          id: "piu-variabili", title: "Funzioni di più variabili", icon: ICON.grid, module: false, prereqs: ["studio-funzione"],
          summary: "Dominio, limiti, continuità, curve di livello.",
          theory: [{ h: "Funzioni di due variabili", body: "\\(f(x,y)\\) associa a ogni punto del piano un valore: una superficie nello spazio. Le <b>curve di livello</b> sono gli insiemi \\(f(x,y)=k\\)." }],
          formulas: [{ cap: "Curva di livello", tex: "f(x,y)=k" }],
          theorems: [],
          definitions: [{ term: "Curva di livello", def: "Luogo dei punti con uguale valore di \\(f\\)." }],
          errors: ["Assumere che il limite esista perché esiste lungo una retta (vanno provate tutte le direzioni)."],
          tips: ["Le curve di livello sono come le isoipse di una mappa."]
        },
        {
          id: "calcolo-diff", title: "Calcolo differenziale (più variabili)", icon: ICON.grid, module: false, prereqs: ["piu-variabili", "derivate"],
          summary: "Derivate parziali, gradiente, Hessiana, piano tangente.",
          theory: [{ h: "Derivate parziali", body: "\\(\\frac{\\partial f}{\\partial x}\\) deriva rispetto a \\(x\\) trattando \\(y\\) come costante. Il <b>gradiente</b> \\(\\nabla f=(f_x,f_y)\\) punta nella direzione di massima crescita." }],
          formulas: [{ cap: "Gradiente", tex: "\\nabla f=\\left(\\frac{\\partial f}{\\partial x},\\frac{\\partial f}{\\partial y}\\right)" }, { cap: "Piano tangente", tex: "z=f_0+f_x\\Delta x+f_y\\Delta y" }],
          theorems: [{ name: "Teorema di Schwarz", statement: "Se le derivate seconde miste sono continue, \\(f_{xy}=f_{yx}\\)." }],
          definitions: [{ term: "Gradiente", def: "Vettore delle derivate parziali prime." }],
          errors: ["Dimenticare che nelle parziali le altre variabili sono costanti."],
          tips: ["Derivata parziale = derivata ordinaria, congelando le altre variabili."]
        },
        {
          id: "max-min", title: "Massimi e minimi vincolati", icon: ICON.target, module: false, prereqs: ["calcolo-diff"],
          summary: "Punti critici, Hessiano, moltiplicatori di Lagrange.",
          theory: [{ h: "Punti critici", body: "Si cercano dove \\(\\nabla f=0\\). La natura (max/min/sella) si decide con la matrice <b>Hessiana</b>." }, { h: "Lagrange", body: "Con un vincolo \\(g=0\\): si risolve \\(\\nabla f=\\lambda\\nabla g\\)." }],
          formulas: [{ cap: "Punti critici", tex: "\\nabla f=0" }, { cap: "Lagrange", tex: "\\nabla f=\\lambda\\nabla g" }],
          theorems: [],
          definitions: [{ term: "Punto di sella", def: "Critico ma né massimo né minimo." }],
          errors: ["Ignorare il vincolo e cercare estremi liberi."],
          tips: ["Hessiana: determinante e segno per classificare i punti."]
        },
        {
          id: "edo", title: "Equazioni differenziali", icon: ICON.func, module: false, prereqs: ["integrali"],
          summary: "Separabili, lineari, Bernoulli, ordine superiore, Cauchy.",
          theory: [{ h: "A variabili separabili", body: "\\(y'=g(x)h(y)\\) si risolve separando: \\(\\int\\frac{dy}{h(y)}=\\int g(x)\\,dx\\)." }, { h: "Lineari del 1° ordine", body: "\\(y'+p(x)y=q(x)\\) si risolve col fattore integrante \\(e^{\\int p\\,dx}\\)." }],
          formulas: [{ cap: "Separabili", tex: "\\int\\frac{dy}{h(y)}=\\int g(x)dx" }, { cap: "Fattore integrante", tex: "\\mu=e^{\\int p(x)dx}" }],
          theorems: [{ name: "Teorema di Cauchy-Lipschitz", statement: "Sotto ipotesi di regolarità, il problema di Cauchy ha soluzione unica." }],
          definitions: [{ term: "Problema di Cauchy", def: "EDO + condizione iniziale \\(y(x_0)=y_0\\)." }],
          errors: ["Dimenticare la costante d'integrazione e quindi la condizione iniziale."],
          tips: ["Classifica subito il tipo di EDO: la tecnica risolutiva dipende da quello."]
        },
        {
          id: "serie-potenze", title: "Serie di potenze e Taylor", icon: ICON.sigma, module: false, prereqs: ["limiti"],
          summary: "Raggio e intervallo di convergenza, sviluppo di Taylor.",
          theory: [{ h: "Serie di potenze", body: "\\(\\sum a_n (x-x_0)^n\\): converge in un intervallo centrato in \\(x_0\\) di raggio \\(R\\)." }, { h: "Taylor", body: "\\(f(x)=\\sum\\frac{f^{(n)}(x_0)}{n!}(x-x_0)^n\\): approssima \\(f\\) con polinomi." }],
          formulas: [{ cap: "Raggio", tex: "R=\\lim\\left|\\frac{a_n}{a_{n+1}}\\right|" }, { cap: "Taylor", tex: "\\sum\\frac{f^{(n)}(x_0)}{n!}(x-x_0)^n" }],
          theorems: [],
          definitions: [{ term: "Raggio di convergenza", def: "Distanza dal centro entro cui la serie converge." }],
          errors: ["Trascurare di studiare la convergenza agli estremi dell'intervallo."],
          tips: ["Conosci gli sviluppi notevoli di \\(e^x,\\sin x,\\cos x,\\frac{1}{1-x}\\)."]
        },
        {
          id: "fourier", title: "Serie di Fourier", icon: ICON.wave, module: false, prereqs: ["integrali"],
          summary: "Coefficienti, sviluppo, convergenza, applicazioni.",
          theory: [{ h: "Idea", body: "Ogni funzione periodica (regolare a tratti) si scrive come somma di seni e coseni. I <b>coefficienti</b> si calcolano con integrali su un periodo." }],
          formulas: [{ cap: "Coefficiente", tex: "a_n=\\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} f(x)\\cos(nx)\\,dx" }, { cap: "Coefficiente", tex: "b_n=\\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} f(x)\\sin(nx)\\,dx" }],
          theorems: [{ name: "Teorema di Dirichlet", statement: "Sotto ipotesi di regolarità, la serie converge a \\(f\\) nei punti di continuità e alla media nei salti." }],
          definitions: [{ term: "Armonica", def: "Singolo termine \\(\\sin(nx)\\) o \\(\\cos(nx)\\) della serie." }],
          errors: ["Sbagliare l'intervallo o il periodo nell'integrale dei coefficienti."],
          tips: ["Sfrutta la parità: funzione pari ⇒ solo coseni; dispari ⇒ solo seni."]
        },
        {
          id: "analisi-complessa", title: "Analisi complessa", icon: ICON.complex, module: false, prereqs: ["numeri-complessi", "integrali"],
          summary: "Funzioni olomorfe, Cauchy-Riemann, residui.",
          theory: [{ h: "Olomorfia", body: "Una funzione complessa è olomorfa se è derivabile in senso complesso; equivale alle equazioni di <b>Cauchy-Riemann</b>." }],
          formulas: [{ cap: "Cauchy-Riemann", tex: "u_x=v_y,\\quad u_y=-v_x" }, { cap: "Teorema dei residui", tex: "\\oint f=2\\pi i\\sum\\text{Res}" }],
          theorems: [{ name: "Teorema di Cauchy", statement: "L'integrale di una funzione olomorfa su una curva chiusa (in un dominio semplicemente connesso) è nullo." }],
          definitions: [{ term: "Residuo", def: "Coefficiente di \\((z-z_0)^{-1}\\) nello sviluppo di Laurent." }],
          errors: ["Applicare i residui a singolarità fuori dalla curva."],
          tips: ["I residui trasformano integrali complicati in semplici somme."]
        },
        {
          id: "misura", title: "Teoria della misura", icon: ICON.grid, module: false, prereqs: ["integrali"],
          summary: "Introduzione, misura di Lebesgue, concetti fondamentali.",
          theory: [{ h: "Perché serve", body: "L'integrale di Lebesgue estende quello di Riemann: misura insiemi più generali e gestisce meglio i limiti." }],
          formulas: [{ cap: "Misura", tex: "\\mu(E)\\ge 0,\\ \\mu(\\varnothing)=0" }],
          theorems: [{ name: "Convergenza dominata", statement: "Sotto dominazione integrabile, limite e integrale si scambiano." }],
          definitions: [{ term: "Insieme misurabile", def: "Insieme a cui si può assegnare coerentemente una misura." }],
          errors: ["Confondere \"quasi ovunque\" con \"ovunque\"."],
          tips: ["Pensa alla misura come a una \"lunghezza/area generalizzata\"."]
        }
      ]
    }
  ];

  /* ════════════════════════════════════════════════
     TEST DI INGRESSO (diagnostico)
     Ogni domanda mappa a una skill → seed del piano
     ════════════════════════════════════════════════ */
  const DIAGNOSTIC = [
    { skill: "frazioni", q: "Quanto vale \\(\\frac{1}{2}+\\frac{1}{3}\\)?", opts: ["\\(\\frac{2}{5}\\)", "\\(\\frac{5}{6}\\)", "\\(\\frac{1}{6}\\)", "\\(\\frac{2}{6}\\)"], correct: 1 },
    { skill: "potenze", q: "Semplifica \\(x^3\\cdot x^4\\).", opts: ["\\(x^{12}\\)", "\\(x^{7}\\)", "\\(x^{1}\\)", "\\(2x^{7}\\)"], correct: 1 },
    { skill: "potenze", q: "Quanto vale \\(2^{-3}\\)?", opts: ["\\(-8\\)", "\\(-6\\)", "\\(\\frac{1}{8}\\)", "\\(6\\)"], correct: 2 },
    { skill: "equazioni", q: "Risolvi \\(2x+6=0\\).", opts: ["\\(x=3\\)", "\\(x=-3\\)", "\\(x=-12\\)", "\\(x=6\\)"], correct: 1 },
    { skill: "equazioni", q: "Le soluzioni di \\(x^2-5x+6=0\\) sono:", opts: ["\\(2,3\\)", "\\(-2,-3\\)", "\\(1,6\\)", "\\(-1,-6\\)"], correct: 0 },
    { skill: "trigonometria", q: "Quanto vale \\(\\sin^2\\theta+\\cos^2\\theta\\)?", opts: ["\\(0\\)", "\\(2\\)", "\\(1\\)", "dipende da \\(\\theta\\)"], correct: 2 },
    { skill: "logaritmi", q: "Per le proprietà del log, \\(\\log(ab)\\) è uguale a:", opts: ["\\(\\log a\\cdot\\log b\\)", "\\(\\log a+\\log b\\)", "\\(\\log a-\\log b\\)", "\\(\\frac{\\log a}{\\log b}\\)"], correct: 1 },
    { skill: "funzioni", q: "Il dominio di \\(f(x)=\\frac{1}{x-2}\\) è:", opts: ["tutti i reali", "\\(x\\neq0\\)", "\\(x\\neq2\\)", "\\(x>2\\)"], correct: 2 },
    { skill: "limiti", q: "Quanto vale \\(\\lim_{x\\to0}\\frac{\\sin x}{x}\\)?", opts: ["\\(0\\)", "\\(\\infty\\)", "\\(1\\)", "non esiste"], correct: 2 },
    { skill: "derivate", q: "La derivata di \\(x^3\\) è:", opts: ["\\(3x^2\\)", "\\(x^2\\)", "\\(3x\\)", "\\(\\frac{x^4}{4}\\)"], correct: 0 },
    { skill: "derivate", q: "La derivata di \\(\\sin x\\) è:", opts: ["\\(\\cos x\\)", "\\(-\\cos x\\)", "\\(-\\sin x\\)", "\\(\\tan x\\)"], correct: 0 },
    { skill: "integrali", q: "Quanto vale \\(\\int x^2\\,dx\\)?", opts: ["\\(2x+C\\)", "\\(\\frac{x^3}{3}+C\\)", "\\(x^3+C\\)", "\\(\\frac{x^2}{2}+C\\)"], correct: 1 }
  ];

  /* ════════════════════════════════════════════════
     BADGE / OBIETTIVI
     ════════════════════════════════════════════════ */
  const BADGES = [
    { id: "first-step", icon: "🎯", name: "Primo passo", desc: "Completa il test di ingresso", check: (s) => s.diagnostic && s.diagnostic.done },
    { id: "ten-ex", icon: "✏️", name: "Apprendista", desc: "Risolvi 10 esercizi", check: (s) => totalCorrect(s) >= 10 },
    { id: "fifty-ex", icon: "📐", name: "Stakanovista", desc: "Risolvi 50 esercizi", check: (s) => totalCorrect(s) >= 50 },
    { id: "streak3", icon: "🔥", name: "Costante", desc: "Streak di 3 giorni", check: (s) => s.streak.count >= 3 },
    { id: "streak7", icon: "⚡", name: "Inarrestabile", desc: "Streak di 7 giorni", check: (s) => s.streak.count >= 7 },
    { id: "deriv-master", icon: "🧮", name: "Re delle derivate", desc: "Padronanza ≥90% su Derivate", check: (s) => (s.mastery.derivate && s.mastery.derivate.mastery >= 0.9) },
    { id: "level5", icon: "🚀", name: "Livello 5", desc: "Raggiungi il livello 5", check: (s) => s.level >= 5 },
    { id: "exam-pass", icon: "🎓", name: "Promosso", desc: "Supera una simulazione d'esame", check: (s) => s.examsPassed >= 1 }
  ];
  function totalCorrect(s) { return Object.values(s.mastery || {}).reduce((a, m) => a + (m.correct || 0), 0); }

  /* ── API pubblica ── */
  const topicIndex = {};
  CURRICULUM.forEach(l => l.topics.forEach(t => { t.level = l.id; topicIndex[t.id] = t; }));

  window.MT = {
    curriculum: CURRICULUM,
    diagnostic: DIAGNOSTIC,
    badges: BADGES,
    topicIndex,
    findTopic: (id) => topicIndex[id] || null,
    hasModule: (id) => !!(topicIndex[id] && topicIndex[id].module && GEN[id]),
    generate: (id, diff) => (GEN[id] ? GEN[id](diff || "base") : null),
    moduleTopics: () => Object.keys(topicIndex).filter(id => topicIndex[id].module && GEN[id]),
    totalCorrect
  };
})();
