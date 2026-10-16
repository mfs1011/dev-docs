// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'Retyorning'], ['L1', 'Postgres'], ['L1', 'Es-kyu-layt'],
   ['L2', 'May'], ['L2', 'xato'], ['L2', 'insert'],
   ['L3', 'birinchi'], ['L3', 'rou'], ['L3', 'haqiqatda'],
   ['L4', 'retyorning'], ['L4', 'si-ti-i'], ['L4', 'ixtiyoriydir.'],
   ['L5', 'Maksimal'], ['L5', 'yashirin'], ['L5', 'xatolarni'],
   ['L6', 'generatsiya'], ['L6', 'qaytarish'], ['L6', 'ishonchli']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'xato'), 'strike'); } catch (e) {}
  try { add(W('L3', 'birinchi'), 'ding'); } catch (e) {}
  try { add(W('L4', 'ixtiyoriydir.'), 'strike'); } catch (e) {}
  try { add(W('L5', 'xatolarni'), 'strike'); } catch (e) {}
  try { add(W('L6', 'ishonchli'), 'ding'); } catch (e) {}
  add(L('L6').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
