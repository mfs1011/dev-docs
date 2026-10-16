// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'Yangi'], ['L1', 'avtomatik'], ['L1', 'identifikatorini'],
   ['L2', 'Ay-di-ni'], ['L2', 'maks'], ['L2', 'poyga'],
   ['L3', 'Retyorning'], ['L3', 'di-em-el'], ['L3', 'xavfsizlikni'],
   ['L4', 'Insert'], ['L4', 'apdeyt'], ['L4', 'dilit'],
   ['L5', 'Postgres'], ['L5', 'old'], ['L5', 'nyu'], ['L5', 'solishtirib'],
   ['L6', 'retyorning'], ['L6', 'ishonchli']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'poyga'), 'strike'); } catch (e) {}
  try { add(W('L3', 'Retyorning'), 'ding'); } catch (e) {}
  try { add(W('L5', 'nyu'), 'ding'); } catch (e) {}
  try { add(W('L6', 'ishonchli'), 'ding'); } catch (e) {}
  add(L('L6').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
