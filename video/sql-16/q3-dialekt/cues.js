// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'di-di-el'], ['L1', 'Postgres,'], ['L1', 'es-kyu-el'], ['L1', 'Es-kyu-layt'],
   ['L2', 'modifay'], ['L2', 'avto-konversiya'], ['L2', 'instant'],
   ['L3', 'commit'], ['L3', 'trankeyt'], ['L3', 'kaskad'],
   ['L4', 'cheklangan,'], ['L4', 'yunik'], ['L4', 'difolt'], ['L4', 'trankeyt'],
   ['L5', 'qadamli'], ['L5', 'jadval'], ['L5', 'tiklash.'],
   ['L6', 'tranzaksiyaviy'], ['L6', 'tezlik']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'instant'), 'ding'); } catch (e) {}
  try { add(W('L3', 'commit'), 'strike'); } catch (e) {}
  try { add(W('L3', 'trankeyt'), 'error'); } catch (e) {}
  try { add(W('L4', 'cheklangan,'), 'ding'); } catch (e) {}
  try { add(W('L5', 'qadamli'), 'ding'); } catch (e) {}
  add(L('L6').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
