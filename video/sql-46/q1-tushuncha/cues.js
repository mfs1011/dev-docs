// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Rejalashtiruvchi'], ['l1', 'qaytadi?'],
    ['l2', 'Buning'], ['l2', 'qilinadi.'],
    ['l3', 'Postgresda'], ['l3', 'saqlaydi.'],
    ['l4', 'Ushbu'], ['l4', 'boradi.'],
    ['l5', 'Ammo'], ['l5', 'mumkin.'],
    ['l6', 'Bunday'], ['l6', 'yaratiladi.'],
    ['l7', 'Rejani'], ['l7', 'ishlatiladi.'],
    ['l8', 'Es-kyu-laytda'], ['l8', 'soladi.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'qilinadi.'), 'ding'); } catch (e) {}
  try { add(W('l3', 'saqlaydi.'), 'whoosh'); } catch (e) {}
  try { add(W('l4', 'boradi.'), 'ding'); } catch (e) {}
  try { add(W('l5', 'mumkin.'), 'error'); } catch (e) {}
  try { add(W('l6', 'yaratiladi.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'ishlatiladi.'), 'whoosh'); } catch (e) {}
  try { add(W('l8', 'soladi.'), 'ding'); } catch (e) {}
  add(L('l8').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
