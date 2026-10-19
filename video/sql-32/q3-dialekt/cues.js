// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['intro', 'Keys,'], ['intro', 'koales'], ['intro', 'null-if'], ['intro', 'greytist'],
   ['greatest', 'Postgres'], ['greatest', 'May'], ['greatest', 'Es-kyu-layt'], ['greatest', 'darhol'],
   ['mysql', 'IF'], ['mysql', 'if-null'], ['mysql', 'ogohlantirish'], ['mysql', 'tiplari'],
   ['sqlite', 'Es-kyu-layt'], ['sqlite', 'meks'], ['sqlite', 'ay-ay-ef'],
   ['xulosa', 'portativlik'], ['xulosa', 'keys'], ['xulosa', 'koales']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('greatest', 'darhol'), 'strike'); } catch (e) {}
  try { add(W('mysql', 'if-null'), 'ding'); } catch (e) {}
  try { add(W('sqlite', 'ay-ay-ef'), 'ding'); } catch (e) {}
  try { add(W('xulosa', 'strategiyadir.'), 'ding'); } catch (e) {}
  add(L('xulosa').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
