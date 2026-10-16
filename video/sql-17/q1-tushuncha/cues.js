// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'tushunchasi,'], ['L1', 'vyular,'], ['L1', 'chek'], ['L1', 'materialayzd'],
   ['L2', 'Vyu'], ['L2', 'nomlangan'], ['L2', 'interfeys'],
   ['L3', 'yozish'], ['L3', 'chek'], ['L3', 'rad'],
   ['L4', 'Materialayzd'], ['L4', 'saqlaydi.'], ['L4', 'refresh'], ['L4', 'konkurentli'],
   ['L5', 'virtual'], ['L5', 'hisobotlar'], ['L5', 'arxitektura']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'interfeys'), 'ding'); } catch (e) {}
  try { add(W('L3', 'chek'), 'ding'); } catch (e) {}
  try { add(W('L3', 'rad'), 'error'); } catch (e) {}
  try { add(W('L4', 'refresh'), 'ding'); } catch (e) {}
  try { add(W('L4', 'konkurentli'), 'strike'); } catch (e) {}
  add(L('L5').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
