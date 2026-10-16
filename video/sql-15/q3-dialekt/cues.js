// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'Dialektlar'], ['L1', 'tuzoqlarni'],
   ['L2', 'virtual'], ['L2', 'indeks'], ['L2', 'tayana'],
   ['L3', 'Es-kyu-layt'], ['L3', 'stord'], ['L3', 'bo‘lmaydi'],
   ['L4', 'virtual'], ['L4', 'zanjir'], ['L4', 'indekslash'],
   ['L5', 'xato'], ['L5', 'nau'], ['L5', 'stord'],
   ['L6', 'mustahkam'], ['L6', 'qurasiz']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'indeks'), 'ding'); } catch (e) {}
  try { add(W('L3', 'bo‘lmaydi'), 'error'); } catch (e) {}
  try { add(W('L5', 'xato'), 'error'); } catch (e) {}
  try { add(W('L5', 'nau'), 'strike'); } catch (e) {}
  add(L('L6').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
