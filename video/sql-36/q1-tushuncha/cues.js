// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Postgres'], ['l1', 'massiv'], ['l1', 'oraliq'], ['l1', 'domen'], ['l1', 'kompozit'],
    ['l2', 'dinamik'], ['l2', 'davrlari'],
    ['l3', 'Massiv'], ['l3', 'birdan'], ['l3', 'o\'lcham'],
    ['l4', 'to\'plam'], ['l4', 'alohida'],
    ['l5', 'Oraliq'], ['l5', 'kanonik'],
    ['l6', 'kuchukcha-katta'], ['l6', 'ampersand'],
    ['l7', 'unikallik'], ['l7', 'istisno'],
    ['l8', 'jist'], ['l8', 'band'],
    ['l9', 'Domen'], ['l9', 'cheklov'], ['l9', 'xavfsiz'],
    ['l10', 'Kompozit'], ['l10', 'jamlash']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'beradi.'), 'ding'); } catch (e) {}
  try { add(W('l4', 'etiladi.'), 'ding'); } catch (e) {}
  try { add(W('l6', 'tekshiradi.'), 'ding'); } catch (e) {}
  try { add(W('l8', 'olinadi.'), 'ding'); } catch (e) {}
  try { add(W('l10', 'beradi.'), 'ding'); } catch (e) {}
  add(L('l10').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
