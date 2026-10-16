// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'order'], ['L1', 'bay'], ['L1', 'aniq'],
   ['L2', 'Ask'], ['L2', 'desk'], ['L2', 'ta’sir'],
   ['L3', 'Postgres'], ['L3', 'null'], ['L3', 'nulls'], ['L3', 'last'],
   ['L4', 'Limit'], ['L4', 'offset'], ['L4', 'saralashsiz'],
   ['L5', 'fech'], ['L5', 'vit'], ['L5', 'tayz'], ['L5', 'adolatli'],
   ['L6', 'barqaror'], ['L6', 'null'], ['L6', 'muvaffaqiyat']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'Ask'), 'ding'); } catch (e) {}
  try { add(W('L3', 'nulls'), 'ding'); } catch (e) {}
  try { add(W('L4', 'saralashsiz'), 'strike'); } catch (e) {}
  try { add(W('L5', 'tayz'), 'ding'); } catch (e) {}
  try { add(W('L6', 'muvaffaqiyat'), 'ding'); } catch (e) {}
  add(L('L6').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
