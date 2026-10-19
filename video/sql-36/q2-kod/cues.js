// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Maqolalar'], ['l1', 'massiv'],
    ['l2', 'Birinchi'], ['l2', 'operatorlari'],
    ['l3', 'An-nest'], ['l3', 'guruhlash'],
    ['l4', 'Errey'], ['l4', 'massivga'],
    ['l5', 'Deyt-renj'], ['l5', 'kanonik'],
    ['l6', 'ampersand'], ['l6', 'multi-renj'],
    ['l7', 'Mehmonxona'], ['l7', 'eksklyud'],
    ['l8', 'poyga'], ['l8', 'ishonchli'],
    ['l9', 'Telefon'], ['l9', 'domenlari'],
    ['l10', 'Kompozit'], ['l10', 'qavsli']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'osonlashtiradi.'), 'ding'); } catch (e) {}
  try { add(W('l4', 'beradi.'), 'ding'); } catch (e) {}
  try { add(W('l6', 'ishlatiladi.'), 'ding'); } catch (e) {}
  try { add(W('l8', 'oladi.'), 'ding'); } catch (e) {}
  try { add(W('l10', 'qilinadi.'), 'ding'); } catch (e) {}
  add(L('l10').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
