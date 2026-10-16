// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['g1', 'May'], ['g1', 'Es-kyu-layt'],
   ['g2', 'kross'], ['g2', 'inner'],
   ['g3', 'full'], ['g3', 'yo\'q'],
   ['g4', 'left'], ['g4', 'rayt'], ['g4', 'yunion'],
   ['g5', 'Es-kyu-layt'], ['g5', 'to\'liq'],
   ['g6', 'kross'], ['g6', 'optimizator'],
   ['g7', 'vergul'], ['g7', 'ustuvorlikda'],
   ['g8', 'lateral'], ['g8', 'mavjud'],
   ['g9', 'xavfsiz']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('g2', 'kross'), 'ding'); } catch (e) {}
  try { add(W('g3', 'yo\'q'), 'strike'); } catch (e) {}
  try { add(W('g4', 'yunion'), 'ding'); } catch (e) {}
  try { add(W('g5', 'to\'liq'), 'ding'); } catch (e) {}
  try { add(W('g7', 'vergul'), 'ding'); } catch (e) {}
  try { add(W('g8', 'lateral'), 'ding'); } catch (e) {}
  add(L('g9').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
