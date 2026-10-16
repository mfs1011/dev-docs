// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'kodlash'], ['L1', 'kollatsiya'],
   ['L2', 'harflar'], ['L2', 'raqamli'],
   ['L3', 'solishtirish'], ['L3', 'oldin'],
   ['L4', 'tartibi'], ['L4', 'qidiruvi'],
   ['L5', 'sekinlashtirishi'], ['L5', 'tez'],
   ['L6', 'provayderlari'], ['L6', 'ay-si-yu'],
   ['L7', 'cheklov'], ['L7', 'o‘zgartirib'],
   ['L8', 'deterministik'], ['L8', 'baytlari'],
   ['L9', 'nondeterministik'], ['L9', 'teng'],
   ['L10', 'saralash'],
   ['L11', 'sinab']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L3', 'oldin'), 'ding'); } catch (e) {}
  try { add(W('L7', 'o‘zgartirib'), 'strike'); } catch (e) {}
  try { add(W('L9', 'teng'), 'ding'); } catch (e) {}
  add(L('L11').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
