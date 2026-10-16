// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'Postgres'], ['L1', 'order'], ['L1', 'nulls'],
   ['L2', 'Sobir'], ['L2', 'nulls'], ['L2', 'last'],
   ['L3', 'Limit'], ['L3', 'offset'], ['L3', 'barqaror'],
   ['L4', 'fech'], ['L4', 'vit'], ['L4', 'tayz'],
   ['L5', 'guruh'], ['L5', 'ball'], ['L5', 'xatosiz'],
   ['L6', 'deterministik'], ['L6', 'nulls'], ['L6', 'garovidir']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'Sobir'), 'strike'); } catch (e) {}
  try { add(W('L2', 'last'), 'ding'); } catch (e) {}
  try { add(W('L3', 'barqaror'), 'ding'); } catch (e) {}
  try { add(W('L4', 'tayz'), 'ding'); } catch (e) {}
  try { add(W('L6', 'garovidir'), 'ding'); } catch (e) {}
  add(L('L6').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
