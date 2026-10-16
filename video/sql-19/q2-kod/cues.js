// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'Postgres'], ['L1', 'ay-di'], ['L1', 'si-ti-i'],
   ['L2', 'retyorning'], ['L2', 'id'], ['L2', 'ay-di-ni'],
   ['L3', 'sintaksisi'], ['L3', 'old'], ['L3', 'nyu'],
   ['L4', 'Dilit'], ['L4', 'yulduzcha'], ['L4', 'nol'],
   ['L5', 'si-ti-i'], ['L5', 'insert'], ['L5', 'atomar'],
   ['L6', 'Retyorning'], ['L6', 'selekt'], ['L6', 'xavfsizlikni']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'id'), 'ding'); } catch (e) {}
  try { add(W('L3', 'nyu'), 'ding'); } catch (e) {}
  try { add(W('L4', 'yulduzcha'), 'ding'); } catch (e) {}
  try { add(W('L5', 'atomar'), 'ding'); } catch (e) {}
  try { add(W('L6', 'xavfsizlikni'), 'ding'); } catch (e) {}
  add(L('L6').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
