// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'Selekt'], ['L1', 'from,'], ['L1', 'having,'], ['L1', 'limit'],
   ['L2', 'Lekin'], ['L2', 'from'], ['L2', 'ver,'], ['L2', 'selekt'],
   ['L3', 'alias'], ['L3', 'oltinchi'], ['L3', 'uchinchi'], ['L3', 'bo‘lmaydi.'],
   ['L4', 'Saralash'], ['L4', 'order'], ['L4', 'taniydi.'],
   ['L5', 'Ustunlar'], ['L5', 'vergul'], ['L5', 'aliasiga'], ['L5', 'ez'],
   ['L6', 'Postgres'], ['L6', 'distinkt'], ['L6', 'shart.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'selekt'), 'ding'); } catch (e) {}
  try { add(W('L3', 'bo‘lmaydi.'), 'strike'); } catch (e) {}
  try { add(W('L4', 'taniydi.'), 'ding'); } catch (e) {}
  try { add(W('L5', 'aliasiga'), 'strike'); } catch (e) {}
  try { add(W('L6', 'distinkt'), 'ding'); } catch (e) {}
  add(L('L6').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
