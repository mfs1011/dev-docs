// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'tuzoqni'],
   ['L2', 'farqlar'],
   ['L3', 'boolean'],
   ['L4', 'rost'],
   ['L5', 'tushib'],
   ['L6', 'mavjud'],
   ['L7', 'taxmin'],
   ['L8', 'raqamlar'],
   ['L9', 'mavjud'],
   ['L10', 'matn'],
   ['L11', 'check'],
   ['L12', 'yo‘qoladi'],
   ['L13', 'isrof'],
   ['L14', 'o‘chirib'],
   ['L15', 'xavfsiz']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L5', 'tushib'), 'error'); } catch (e) {}
  try { add(W('L7', 'taxmin'), 'ding'); } catch (e) {}
  try { add(W('L12', 'yo‘qoladi'), 'strike'); } catch (e) {}
  try { add(W('L13', 'isrof'), 'error'); } catch (e) {}
  try { add(W('L14', 'o‘chirib'), 'strike'); } catch (e) {}
  add(L('L16').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
