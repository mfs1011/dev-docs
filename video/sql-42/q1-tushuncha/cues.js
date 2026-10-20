// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Ko\'p'], ['l1', 'massiv'],
    ['l2', 'telefon'], ['l2', 'qidirish'], ['l2', 'varaqlashga'],
    ['l3', 'Chap'], ['l3', 'chapdan'],
    ['l4', 'Oltin'], ['l4', 'tenglik'], ['l4', 'oraliq'],
    ['l5', 'Agar'], ['l5', 'sakrab'], ['l5', 'skip'],
    ['l6', 'Bu'], ['l6', 'o\'ngdagi'],
    ['l7', 'Indeks'], ['l7', 'saralash'],
    ['l8', 'Aralash'], ['l8', 'disending'],
    ['l9', 'Bitta'], ['l9', 'or'],
    ['l10', 'Bunday'], ['l10', 'bit'], ['l10', 'birlashtirib']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'qidirish'), 'ding'); } catch (e) {}
  try { add(W('l3', 'chapdan'), 'whoosh'); } catch (e) {}
  try { add(W('l4', 'tenglik'), 'ding'); } catch (e) {}
  try { add(W('l5', 'skip'), 'ding'); } catch (e) {}
  try { add(W('l7', 'saralash'), 'ding'); } catch (e) {}
  try { add(W('l8', 'disending'), 'whoosh'); } catch (e) {}
  try { add(W('l9', 'emas.'), 'error'); } catch (e) {}
  try { add(W('l10', 'birlashtirib'), 'ding'); } catch (e) {}
  add(L('l10').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
