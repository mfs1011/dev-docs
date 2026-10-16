// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['g1', 'joyn'], ['g1', 'yaxlit'],
   ['g2', 'Dekart'], ['g2', 'ko\'paytmasi'],
   ['g3', 'Kross'], ['g3', 'ko\'paytirilgan'],
   ['g4', 'Inner'], ['g4', 'on'],
   ['g5', 'left'], ['g5', 'rayt'], ['g5', 'full'], ['g5', 'null'],
   ['g6', 'on'], ['g6', 'veer'], ['g6', 'farq'],
   ['g7', 'filtr'], ['g7', 'butun'],
   ['g8', 'Lateral'], ['g8', 'so\'rov'],
   ['g9', 'Postgres']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('g3', 'Kross'), 'ding'); } catch (e) {}
  try { add(W('g4', 'Inner'), 'ding'); } catch (e) {}
  try { add(W('g5', 'null'), 'ding'); } catch (e) {}
  try { add(W('g7', 'filtr'), 'ding'); } catch (e) {}
  try { add(W('g8', 'Lateral'), 'ding'); } catch (e) {}
  add(L('g9').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
