// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'May'], ['l1', 'aylanadi.'],
    ['l2', 'Baza'], ['l2', 'ishlaydi.'],
    ['l3', 'Geometrik'], ['l3', 'qo\'llanadi.'],
    ['l4', 'Yana'], ['l4', 'mumkin.'],
    ['l5', 'Es-kyu-laytda'], ['l5', 'keladi.'],
    ['l6', 'Fazoviy'], ['l6', 'etilgan.'],
    ['l7', 'Eng'], ['l7', 'o\'ylashdir.'],
    ['l8', 'Har'], ['l8', 'yengillashtiradi.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l1', 'aylanadi.'), 'error'); } catch (e) {}
  try { add(W('l2', 'ishlaydi.'), 'ding'); } catch (e) {}
  try { add(W('l3', 'qo\'llanadi.'), 'whoosh'); } catch (e) {}
  try { add(W('l4', 'mumkin.'), 'ding'); } catch (e) {}
  try { add(W('l5', 'keladi.'), 'error'); } catch (e) {}
  try { add(W('l6', 'etilgan.'), 'whoosh'); } catch (e) {}
  try { add(W('l7', 'o\'ylashdir.'), 'error'); } catch (e) {}
  try { add(W('l8', 'yengillashtiradi.'), 'ding'); } catch (e) {}
  add(L('l8').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
