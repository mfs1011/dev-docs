// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'Postgres'], ['L1', 'mijozlar'], ['L1', 'terminalda'],
   ['L2', 'bitvin'], ['L2', 'simmetrik'], ['L2', 'to‘g‘ri'],
   ['L3', 'not'], ['L3', 'null'], ['L3', 'nolta'],
   ['L4', 'noma’lum'], ['L4', 'distinkt'], ['L4', 'xavfsiz'],
   ['L5', 'ay-layk'], ['L5', 'pozikz'], ['L5', 'tekshiradi'],
   ['L6', 'operatorning'], ['L6', 'null'], ['L6', 'oldini']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'to‘g‘ri'), 'ding'); } catch (e) {}
  try { add(W('L3', 'nolta'), 'strike'); } catch (e) {}
  try { add(W('L4', 'distinkt'), 'ding'); } catch (e) {}
  try { add(W('L5', 'tekshiradi'), 'ding'); } catch (e) {}
  try { add(W('L6', 'oldini'), 'ding'); } catch (e) {}
  add(L('L6').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
