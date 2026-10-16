// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'farqlari'], ['L1', 'tuzoqlarini'],
   ['L2', 'qavs'], ['L2', 'xatosi'],
   ['L3', 'shuningdek'], ['L3', 'yozilishi'],
   ['L4', 'invizibl'], ['L4', 'saqlaydi'],
   ['L5', 'farqli'], ['L5', 'avtomatik'],
   ['L6', 'rou-ay-di'], ['L6', 'yu-ti-si'],
   ['L7', 'migratsiya'], ['L7', 'dublikati'],
   ['L8', 'birlamchi'], ['L8', 'anlogd'],
   ['L9', 'xususiyatlarini'], ['L9', 'poydevoridir']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'xatosi'), 'strike'); } catch (e) {}
  try { add(W('L4', 'invizibl'), 'ding'); } catch (e) {}
  try { add(W('L5', 'avtomatik'), 'ding'); } catch (e) {}
  try { add(W('L7', 'dublikati'), 'strike'); } catch (e) {}
  add(L('L9').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
