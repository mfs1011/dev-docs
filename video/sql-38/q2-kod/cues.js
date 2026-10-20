// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'tekis'], ['l1', 'anomaliyalarini'],
    ['l2', 'ko\'chganda'], ['l2', 'ikki'], ['l2', 'yo\'qoldi'],
    ['l3', 'to\'rtta'], ['l3', 'mijozlar'], ['l3', 'buyurtma'],
    ['l4', 'narx'], ['l4', 'tarixiy'],
    ['l5', 'yangilansa'], ['l5', 'o\'zgaradi'], ['l5', 'avtomatik'],
    ['l6', 'bekor'], ['l6', 'butun'], ['l6', 'saqlanadi'],
    ['l7', 'joyn'], ['l7', 'birlashtirib'],
    ['l8', 'Postgres'], ['l8', 'indekslar'], ['l8', 'tez'],
    ['l9', 'yig\'ma'], ['l9', 'tafovut'],
    ['l10', 'denormalizatsiyani'], ['l10', 'mexanizmi']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l1', 'anomaliyalarini'), 'error'); } catch (e) {}
  try { add(W('l2', 'yo\'qoldi'), 'strike'); } catch (e) {}
  try { add(W('l3', 'to\'rtta'), 'ding'); } catch (e) {}
  try { add(W('l4', 'tarixiy'), 'ding'); } catch (e) {}
  try { add(W('l6', 'saqlanadi'), 'ding'); } catch (e) {}
  try { add(W('l7', 'joyn'), 'ding'); } catch (e) {}
  try { add(W('l9', 'tafovut'), 'blip'); } catch (e) {}
  try { add(W('l10', 'mexanizmi'), 'ding'); } catch (e) {}
  add(L('l10').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
