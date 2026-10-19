// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Tashqi'], ['l1', 'uchta'], ['l1', 'indekslash'],
    ['l2', 'Postgres'], ['l2', 'May'], ['l2', 'Es-kyu-layt'],
    ['l3', 'May'], ['l3', 'indeksni'], ['l3', 'avtomatik'],
    ['l4', 'null'], ['l4', 'default'], ['l4', 'xatolik'],
    ['l5', 'Es-kyu-laytda'], ['l5', 'pragma'], ['l5', 'yoqilishi'],
    ['l6', 'unikal'], ['l6', 'xatolik'], ['l6', 'aniqlanadi'],
    ['l7', 'matritsa'], ['l7', 'ko\'rsatadi'],
    ['l8', 'Postgres'], ['l8', 'xabarlari'], ['l8', 'to\'liq'],
    ['l9', 'Aloqalarni'], ['l9', 'tarixiy'], ['l9', 'narxni'],
    ['l10', 'Kaskad'], ['l10', 'ajralmas'], ['l10', 'indekslab']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l3', 'avtomatik'), 'ding'); } catch (e) {}
  try { add(W('l4', 'xatolik'), 'error'); } catch (e) {}
  try { add(W('l5', 'pragma'), 'blip'); } catch (e) {}
  try { add(W('l6', 'xatolik'), 'strike'); } catch (e) {}
  try { add(W('l7', 'matritsa'), 'swell'); } catch (e) {}
  try { add(W('l9', 'narxni'), 'ding'); } catch (e) {}
  try { add(W('l10', 'indekslab'), 'ding'); } catch (e) {}
  add(L('l10').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
