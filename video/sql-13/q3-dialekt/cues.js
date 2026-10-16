// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'Avto-inkrement'], ['L1', 'rou-ayd'],
   ['L2', 'last-insert-ayd'], ['L2', 'qaytaradi'],
   ['L3', 'ergashadi'], ['L3', 'to‘xtaydi'],
   ['L4', 'praymari'], ['L4', 'taxallusi'],
   ['L5', 'es-kyu-layt-sikvens'], ['L5', 'ishlatilmaydi'],
   ['L6', 'yozilishi'], ['L6', 'ishlamaydi'],
   ['L7', 'standarti'], ['L7', 'mavjud'],
   ['L8', 'tayanishdir'], ['L8', 'qonuniyatdir'],
   ['L9', 'ishonchli'], ['L9', 'yarating']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'last-insert-ayd'), 'ding'); } catch (e) {}
  try { add(W('L3', 'to‘xtaydi'), 'strike'); } catch (e) {}
  try { add(W('L5', 'es-kyu-layt-sikvens'), 'ding'); } catch (e) {}
  try { add(W('L6', 'ishlamaydi'), 'strike'); } catch (e) {}
  try { add(W('L8', 'qonuniyatdir'), 'ding'); } catch (e) {}
  add(L('L9').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
