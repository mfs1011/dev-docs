// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'Postgres'], ['L1', 'insert'], ['L1', 'apdeyt,'], ['L1', 'from,'], ['L1', 'yuzing'],
   ['L2', 'Ombor'], ['L2', 'sanab'], ['L2', 'chapdan'], ['L2', 'nol'],
   ['L3', 'Narxlarni'], ['L3', 'ver'], ['L3', 'nol'],
   ['L4', 'Sotuvlar'], ['L4', 'from'], ['L4', 'subquery'],
   ['L5', 'jamlamasdan'], ['L5', 'ikkita'], ['L5', 'ixtiyoriy'],
   ['L6', 'yuzing'], ['L6', 'di-em-el'], ['L6', 'bajaring.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'sanab'), 'ding'); } catch (e) {}
  try { add(W('L3', 'ver'), 'ding'); } catch (e) {}
  try { add(W('L4', 'subquery'), 'ding'); } catch (e) {}
  try { add(W('L5', 'ixtiyoriy'), 'strike'); } catch (e) {}
  try { add(W('L6', 'yuzing'), 'ding'); } catch (e) {}
  add(L('L6').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
