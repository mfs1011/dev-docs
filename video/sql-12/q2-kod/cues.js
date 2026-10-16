// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'terminalida'], ['L1', 'tizim'],
   ['L2', 'nol'], ['L2', 'nau'],
   ['L3', 'avtomatik'], ['L3', 'ikki'],
   ['L4', 'yashirin'], ['L4', 'koordinatasi'],
   ['L5', 'yangilaganimizda'],
   ['L6', 'to‘qnashuv'],
   ['L7', 'nusxa'], ['L7', 'saqlab'],
   ['L8', 'pe-ge-temp'], ['L8', 'harfi'],
   ['L9', 'saqlanishi'], ['L9', 'qo‘l']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L3', 'ikki'), 'strike'); } catch (e) {}
  try { add(W('L5', 'yangilaganimizda'), 'ding'); } catch (e) {}
  try { add(W('L6', 'to‘qnashuv'), 'strike'); } catch (e) {}
  try { add(W('L7', 'saqlab'), 'ding'); } catch (e) {}
  add(L('L9').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
