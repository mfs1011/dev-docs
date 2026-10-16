// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'talablar'], ['L1', 'alter'], ['L1', 'teybl'],
   ['L2', 'qo‘shish'], ['L2', 'o‘chirish'], ['L2', 'chek'],
   ['L3', 'difolt'], ['L3', 'millionlab'],
   ['L4', 'kaskad'], ['L4', 'Trankeyt'],
   ['L5', 'xavfsiz'], ['L5', 'mahoratdir']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'chek'), 'ding'); } catch (e) {}
  try { add(W('L3', 'millionlab'), 'ding'); } catch (e) {}
  try { add(W('L4', 'kaskad'), 'strike'); } catch (e) {}
  try { add(W('L4', 'Trankeyt'), 'error'); } catch (e) {}
  add(L('L5').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
