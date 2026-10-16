// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'di-em-el'], ['L1', 'insert,'], ['L1', 'apdeyt'], ['L1', 'dilit'],
   ['L2', 'butun'], ['L2', 'sukut'], ['L2', 'sanab'],
   ['L3', 'ver'], ['L3', 'ogohlantirishsiz'], ['L3', 'birlamchi'],
   ['L4', 'Postgres'], ['L4', 'from'], ['L4', 'yuzing'], ['L4', 'ixtiyoriy'],
   ['L5', 'tranzaksiya'], ['L5', 'jamlangan'], ['L5', 'amaliyotdir.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'sanab'), 'ding'); } catch (e) {}
  try { add(W('L3', 'ogohlantirishsiz'), 'error'); } catch (e) {}
  try { add(W('L3', 'birlamchi'), 'ding'); } catch (e) {}
  try { add(W('L4', 'from'), 'ding'); } catch (e) {}
  try { add(W('L4', 'ixtiyoriy'), 'strike'); } catch (e) {}
  add(L('L5').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
