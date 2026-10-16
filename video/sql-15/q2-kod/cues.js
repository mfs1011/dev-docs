// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'Postgres'], ['L1', 'virtual'],
   ['L2', 'summa'], ['L2', 'summa_s'],
   ['L3', 'apdeyt'], ['L3', 'hisoblanadi'],
   ['L4', 'attribyut'], ['L4', 'taqiqlanadi'], ['L4', 'difolt'],
   ['L5', 'Nau'], ['L5', 'xatolik'],
   ['L6', 'tejaydi'], ['L6', 'aniqligini']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'summa_s'), 'ding'); } catch (e) {}
  try { add(W('L3', 'apdeyt'), 'ding'); } catch (e) {}
  try { add(W('L4', 'taqiqlanadi'), 'strike'); } catch (e) {}
  try { add(W('L5', 'xatolik'), 'error'); } catch (e) {}
  add(L('L6').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
