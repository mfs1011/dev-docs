// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['g1', 'Postgres'], ['g1', 'jadvallarini'],
   ['g2', 'Inner'], ['g2', 'raqamli'],
   ['g3', 'Yuzing'], ['g3', 'natural'],
   ['g4', 'Left'], ['g4', 'rayt'], ['g4', 'null'],
   ['g5', 'Full'], ['g5', 'birlashtiradi'],
   ['g6', 'on'], ['g6', 'veer'],
   ['g7', 'iz'], ['g7', 'null'],
   ['g8', 'Lateral'], ['g8', 'yuqori']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('g2', 'Inner'), 'ding'); } catch (e) {}
  try { add(W('g3', 'natural'), 'ding'); } catch (e) {}
  try { add(W('g4', 'null'), 'ding'); } catch (e) {}
  try { add(W('g5', 'Full'), 'ding'); } catch (e) {}
  try { add(W('g7', 'null'), 'ding'); } catch (e) {}
  try { add(W('g8', 'Lateral'), 'ding'); } catch (e) {}
  add(L('g8').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
