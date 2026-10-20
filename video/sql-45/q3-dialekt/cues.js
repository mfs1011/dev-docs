// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'May'], ['l1', 'ko\'rsatadi.'],
    ['l2', 'Eng'], ['l2', 'yozuvidir.'],
    ['l3', 'Zamonaviy'], ['l3', 'o\'lchaydi.'],
    ['l4', 'Katta'], ['l4', 'qoldi.'],
    ['l5', 'Es-kyu-laytda'], ['l5', 'shart.'],
    ['l6', 'U'], ['l6', 'berilmaydi.'],
    ['l7', 'Eng'], ['l7', 'olmaslikdir.'],
    ['l8', 'Rejani'], ['l8', 'etasiz.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'yozuvidir.'), 'error'); } catch (e) {}
  try { add(W('l3', 'o\'lchaydi.'), 'whoosh'); } catch (e) {}
  try { add(W('l4', 'qoldi.'), 'ding'); } catch (e) {}
  try { add(W('l5', 'shart.'), 'whoosh'); } catch (e) {}
  try { add(W('l6', 'berilmaydi.'), 'error'); } catch (e) {}
  try { add(W('l7', 'olmaslikdir.'), 'error'); } catch (e) {}
  try { add(W('l8', 'etasiz.'), 'ding'); } catch (e) {}
  add(L('l8').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
