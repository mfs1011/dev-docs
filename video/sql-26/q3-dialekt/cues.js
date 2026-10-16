// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['g1', 'May'], ['g1', 'Es-kyu-layt'],
   ['g2', 'onli'], ['g2', 'full'], ['g2', 'eni'], ['g2', 'velyu'],
   ['g3', 'string'], ['g3', 'grup'], ['g3', 'konkat'],
   ['g4', 'filtr'], ['g4', 'keys'], ['g4', 'ven'],
   ['g5', 'Rollap'], ['g5', 'kyub'],
   ['g6', 'Es-kyu-layt'], ['g6', 'yalang\'och'],
   ['g7', 'maks'], ['g7', 'min'],
   ['g8', 'total'], ['g8', 'nol'],
   ['g9', 'xatosiz']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('g2', 'onli'), 'ding'); } catch (e) {}
  try { add(W('g3', 'konkat'), 'ding'); } catch (e) {}
  try { add(W('g4', 'keys'), 'ding'); } catch (e) {}
  try { add(W('g5', 'Rollap'), 'ding'); } catch (e) {}
  try { add(W('g7', 'maks'), 'ding'); } catch (e) {}
  try { add(W('g8', 'total'), 'ding'); } catch (e) {}
  add(L('g9').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
