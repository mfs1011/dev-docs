// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['g1', 'Postgres'], ['g1', 'jadvallarini'],
   ['g2', 'kaunt'], ['g2', 'yulduzcha'],
   ['g3', 'nol'], ['g3', 'null'],
   ['g4', 'Grup'], ['g4', 'bay'],
   ['g5', 'Heving'], ['g5', 'ko\'p'],
   ['g6', 'Birlamchi'], ['g6', 'kalit'],
   ['g7', 'Filtr'], ['g7', 'a\'lochilarni'],
   ['g8', 'Rollap'], ['g8', 'oraliq']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('g2', 'kaunt'), 'ding'); } catch (e) {}
  try { add(W('g3', 'null'), 'ding'); } catch (e) {}
  try { add(W('g4', 'Grup'), 'ding'); } catch (e) {}
  try { add(W('g5', 'Heving'), 'ding'); } catch (e) {}
  try { add(W('g6', 'kalit'), 'ding'); } catch (e) {}
  try { add(W('g7', 'Filtr'), 'ding'); } catch (e) {}
  try { add(W('g8', 'Rollap'), 'ding'); } catch (e) {}
  add(L('g8').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
