// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['intro', 'es-kyu-el'], ['intro', 'Es-kyu-layt'], ['intro', 'oyna'],
   ['groups', 'grups'], ['groups', 'eksklyud'], ['groups', 'xatosi'],
   ['filter', 'filter'], ['filter', 'CASE'], ['filter', 'DISTINCT'],
   ['sqlite', 'Es-kyu-layt'], ['sqlite', 'grups,'], ['sqlite', 'zanjiri'],
   ['xulosa', 'sukutdagi'], ['xulosa', 'Postgres'], ['xulosa', 'Es-kyu-layt']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('groups', 'xatosi'), 'strike'); } catch (e) {}
  try { add(W('filter', 'DISTINCT'), 'strike'); } catch (e) {}
  try { add(W('sqlite', 'zanjiri'), 'ding'); } catch (e) {}
  try { add(W('xulosa', 'imkoniyatga'), 'ding'); } catch (e) {}
  add(L('xulosa').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
