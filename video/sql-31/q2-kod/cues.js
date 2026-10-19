// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['intro', 'Postgres'], ['intro', 'oyna'],
   ['ortacha', 'Partishn'], ['ortacha', 'o\'rtacha'],
   ['reyting', 'renk'], ['reyting', 'dens'], ['reyting', 'vindou'],
   ['top2', 'veer'], ['top2', 'filtrlash'], ['top2', 'ikki'],
   ['yigindi', 'reynj'], ['yigindi', 'rouz'], ['yigindi', 'yig\'indi'],
   ['lag', 'Leg'], ['lag', 'last'], ['lag', 'anbaunded']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('intro', 'oyna'), 'ding'); } catch (e) {}
  try { add(W('ortacha', 'o\'rtacha'), 'ding'); } catch (e) {}
  try { add(W('reyting', 'vindou'), 'ding'); } catch (e) {}
  try { add(W('top2', 'filtrlash'), 'strike'); } catch (e) {}
  try { add(W('yigindi', 'yig\'indi'), 'ding'); } catch (e) {}
  add(L('lag').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
