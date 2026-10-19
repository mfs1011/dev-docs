// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['intro', 'si-ti-i'], ['intro', 'viz'],
   ['afzallik', 'Hosila'], ['afzallik', 'bir'],
   ['qoidalar', 'viz'], ['qoidalar', 'xato'],
   ['ustunlar', 'ustunlarining'],
   ['materializatsiya', 'Materializatsiya'], ['materializatsiya', 'not'],
   ['ozgartiruvchi', 'Postgres'], ['ozgartiruvchi', 'dilit'], ['ozgartiruvchi', 'rityorning']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('intro', 'si-ti-i'), 'ding'); } catch (e) {}
  try { add(W('afzallik', 'bir'), 'ding'); } catch (e) {}
  try { add(W('qoidalar', 'xato'), 'strike'); } catch (e) {}
  try { add(W('materializatsiya', 'Materializatsiya'), 'ding'); } catch (e) {}
  try { add(W('ozgartiruvchi', 'rityorning'), 'ding'); } catch (e) {}
  add(L('ozgartiruvchi').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
