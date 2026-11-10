// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'May'], ['l1', 'emas.'],
    ['l2', 'Agar'], ['l2', 'etiladi.'],
    ['l3', 'Biroq'], ['l3', 'elaydi.'],
    ['l4', 'Natijada'], ['l4', 'sekinlashadi.'],
    ['l5', 'Es-kyu-laytda'], ['l5', 'qoladi.'],
    ['l6', 'multi'], ['l6', 'birlashtiradi.'],
    ['l7', 'Uchala'], ['l7', 'turadi.'],
    ['l8', 'Lekin'], ['l8', 'uzating.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l1', 'emas.'), 'whoosh'); } catch (e) {}
  try { add(W('l2', 'etiladi.'), 'ding'); } catch (e) {}
  try { add(W('l3', 'elaydi.'), 'error'); } catch (e) {}
  try { add(W('l4', 'sekinlashadi.'), 'error'); } catch (e) {}
  try { add(W('l5', 'qoladi.'), 'ding'); } catch (e) {}
  try { add(W('l6', 'birlashtiradi.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'turadi.'), 'whoosh'); } catch (e) {}
  try { add(W('l8', 'uzating.'), 'ding'); } catch (e) {}
  add(L('l8').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
