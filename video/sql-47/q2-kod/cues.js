// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Postgresda'], ['l1', 'tushadi.'],
    ['l2', 'yaratilgach,'], ['l2', 'tezlashadi.'],
    ['l3', 'Sana'], ['l3', 'elaydi.'],
    ['l4', 'Shartni'], ['l4', 'tushiradi.'],
    ['l5', 'Matnli'], ['l5', 'qaytaradi.'],
    ['l6', "To'g'ri"], ['l6', 'oshiriladi.'],
    ['l7', 'Turli'], ['l7', 'sarflaydi.'],
    ['l8', 'Jadval'], ['l8', 'lozim.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l1', 'tushadi.'), 'error'); } catch (e) {}
  try { add(W('l2', 'tezlashadi.'), 'ding'); } catch (e) {}
  try { add(W('l3', 'elaydi.'), 'error'); } catch (e) {}
  try { add(W('l4', 'tushiradi.'), 'ding'); } catch (e) {}
  try { add(W('l5', 'qaytaradi.'), 'error'); } catch (e) {}
  try { add(W('l6', 'oshiriladi.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'sarflaydi.'), 'ding'); } catch (e) {}
  try { add(W('l8', 'lozim.'), 'ding'); } catch (e) {}
  add(L('l8').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
