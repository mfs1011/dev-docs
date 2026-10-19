// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Buyurtmalar'], ['l1', 'jey-son-bi'],
    ['l2', 'Tire-katta'], ['l2', 'ikkita'], ['l2', 'toza'],
    ['l3', 'Panjara'], ['l3', 'ichki'],
    ['l4', 'Kuchukcha-katta'], ['l4', 'to\'liq'],
    ['l5', 'So\'roq'], ['l5', 'kalit'],
    ['l6', 'jey-son'], ['l6', 'darhol'],
    ['l7', 'ekzists'], ['l7', 'mos'],
    ['l8', 'teybl'], ['l8', 'relyatsion'],
    ['l9', 'virtual'], ['l9', 'summasini'],
    ['l10', 'o\'zgartirish'], ['l10', 'vertikal'],
    ['l11', 'jin'], ['l11', 'ifoda']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l3', 'olinadi.'), 'ding'); } catch (e) {}
  try { add(W('l5', 'qiladi.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'tekshiradi.'), 'ding'); } catch (e) {}
  try { add(W('l9', 'bo\'ladi.'), 'ding'); } catch (e) {}
  try { add(W('l11', 'zarur.'), 'ding'); } catch (e) {}
  add(L('l11').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
