// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Ikki'], ['l1', 'ko\'ramiz.'],
    ['l2', 'Tartiblash'], ['l2', 'ko\'tariladi.'],
    ['l3', 'Besh'], ['l3', 'tanladi.'],
    ['l4', 'Tashqi'], ['l4', 'topildi.'],
    ['l5', 'Ammo'], ['l5', 'tushirdi.'],
    ['l6', 'Mijozlar'], ['l6', 'tutashtirildi.'],
    ['l7', 'Limit'], ['l7', 'turildi.'],
    ['l8', 'O\'chirish'], ['l8', 'ko\'rdik.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'ko\'tariladi.'), 'whoosh'); } catch (e) {}
  try { add(W('l3', 'tanladi.'), 'ding'); } catch (e) {}
  try { add(W('l4', 'topildi.'), 'ding'); } catch (e) {}
  try { add(W('l5', 'tushirdi.'), 'whoosh'); } catch (e) {}
  try { add(W('l6', 'tutashtirildi.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'turildi.'), 'ding'); } catch (e) {}
  try { add(W('l8', 'ko\'rdik.'), 'ding'); } catch (e) {}
  add(L('l8').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
