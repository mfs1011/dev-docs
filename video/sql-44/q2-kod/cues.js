// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Ikki'], ['l1', 'sinab'],
    ['l2', 'Tenglik'], ['l2', 'topildi,'], ['l2', 'ketdi.'],
    ['l3', 'Teglar'], ['l3', 'saraladi.'],
    ['l4', 'Davr'], ['l4', 'bo\'ldi.'],
    ['l5', 'Fazoviy'], ['l5', 'ishlatildi.'],
    ['l6', 'Jadvaldagi'], ['l6', 'berdi.'],
    ['l7', 'Nihoyat,'], ['l7', 'qoldi.'],
    ['l8', 'Atigi'], ['l8', 'xulosalandi.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'topildi,'), 'ding'); } catch (e) {}
  try { add(W('l2', 'ketdi.'), 'error'); } catch (e) {}
  try { add(W('l3', 'saraladi.'), 'ding'); } catch (e) {}
  try { add(W('l4', 'bo\'ldi.'), 'ding'); } catch (e) {}
  try { add(W('l5', 'ishlatildi.'), 'whoosh'); } catch (e) {}
  try { add(W('l6', 'berdi.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'qoldi.'), 'whoosh'); } catch (e) {}
  try { add(W('l8', 'xulosalandi.'), 'ding'); } catch (e) {}
  add(L('l8').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
