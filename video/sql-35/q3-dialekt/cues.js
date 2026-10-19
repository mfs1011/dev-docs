// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Postgresda'], ['l1', 'May'], ['l1', 'darhol'],
    ['l2', 'Es-kyu-layt'], ['l2', 'oddiy'], ['l2', 'cheklov'],
    ['l3', 'Postgres'], ['l3', 'to\'g\'ridan-to\'g\'ri'], ['l3', 'talab'],
    ['l4', 'Es-kyu-layt'], ['l4', 'ikkala'],
    ['l5', 'kuchukcha-katta'], ['l5', 'konteyns'], ['l5', 'member'],
    ['l6', 'teybl'], ['l6', 'ich'], ['l6', 'massiv'],
    ['l7', 'jin'], ['l7', 'ifoda'],
    ['l8', 'taqiqlanadi'], ['l8', 'hosila'], ['l8', 'qiymatli'],
    ['l9', 'bi-tri'], ['l9', 'ruxsat'],
    ['l10', 'besh'], ['l10', 'erkin'], ['l10', 'mos'],
    ['l11', 'indekslash'], ['l11', 'barqarorligini']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'shart.'), 'ding'); } catch (e) {}
  try { add(W('l4', 'qo\'llab-quvvatlaydi.'), 'ding'); } catch (e) {}
  try { add(W('l6', 'yoyiladi.'), 'ding'); } catch (e) {}
  try { add(W('l9', 'beradi.'), 'ding'); } catch (e) {}
  try { add(W('l11', 'ta\'minlaydi.'), 'ding'); } catch (e) {}
  add(L('l11').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
