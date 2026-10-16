// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'Di-em-el'], ['L1', 'May'], ['L1', 'Es-kyu-layt'],
   ['L2', 'insert'], ['L2', 'xato'], ['L2', 'joyn'],
   ['L3', 'order'], ['L3', 'limit'], ['L3', 'rou'],
   ['L4', 'from'], ['L4', 'yuzing'], ['L4', 'subquery'],
   ['L5', 'ver'], ['L5', 'not'], ['L5', 'xatolik'],
   ['L6', 'from'], ['L6', 'joyn'], ['L6', 'subquery']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'joyn'), 'ding'); } catch (e) {}
  try { add(W('L3', 'limit'), 'ding'); } catch (e) {}
  try { add(W('L4', 'yuzing'), 'strike'); } catch (e) {}
  try { add(W('L5', 'xatolik'), 'strike'); } catch (e) {}
  try { add(W('L6', 'SQL'), 'ding'); } catch (e) {}
  add(L('L6').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
