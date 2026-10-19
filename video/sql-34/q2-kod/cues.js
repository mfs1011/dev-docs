// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['intro', 'Sotuvlar'], ['intro', 'ekstrakt'], ['intro', 'yakshanba'], ['intro', 'dov'], ['intro', 'aysodov'],
   ['trunc', 'Deyt'], ['trunc', 'trank'], ['trunc', 'yanvar'], ['trunc', 'fevral'], ['trunc', 'mart'],
   ['bin', 'Deyt'], ['bin', 'bin'], ['bin', 'soat'], ['bin', 'oraliqlarga'],
   ['bosh_kunlar', 'Jenerayt'], ['bosh_kunlar', 'siris'], ['bosh_kunlar', 'yarim'], ['bosh_kunlar', 'birlashtiramiz'],
   ['farq', 'Eyj'], ['farq', 'yillik'], ['farq', 'interval'], ['farq', 'oxirgi']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('intro', 'ko\'rsatadi.'), 'ding'); } catch (e) {}
  try { add(W('trunc', 'hisoblaymiz.'), 'ding'); } catch (e) {}
  try { add(W('bin', 'beradi.'), 'ding'); } catch (e) {}
  try { add(W('bosh_kunlar', 'qo\'yamiz.'), 'ding'); } catch (e) {}
  try { add(W('farq', 'beradi.'), 'ding'); } catch (e) {}
  add(L('farq').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
