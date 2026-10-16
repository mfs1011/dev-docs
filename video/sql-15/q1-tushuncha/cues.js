// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'Jenerated'], ['L1', 'summani'],
   ['L2', 'stord'], ['L2', 'Virtual'], ['L2', 'sukut'],
   ['L3', 'Difolt'], ['L3', 'yangilanib'],
   ['L4', 'o‘zgarmas'], ['L4', 'taqiqlanadi'],
   ['L5', 'yaxlitligini'], ['L5', 'qisqartiradi']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'Virtual'), 'ding'); } catch (e) {}
  try { add(W('L2', 'stord'), 'ding'); } catch (e) {}
  try { add(W('L3', 'yangilanib'), 'ding'); } catch (e) {}
  try { add(W('L4', 'taqiqlanadi'), 'error'); } catch (e) {}
  add(L('L5').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
