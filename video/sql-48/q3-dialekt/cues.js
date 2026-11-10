// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'May'], ['l1', "o'qiydi."],
    ['l2', 'Biroq'], ['l2', 'tushadi.'],
    ['l3', 'Aksincha,'], ['l3', 'qisqaradi.'],
    ['l4', 'Bu'], ['l4', 'qilingan.'],
    ['l5', 'Es-kyu-laytda'], ['l5', 'faollashtiradi.'],
    ['l6', 'Sinovimizda'], ['l6', 'bajarildi.'],
    ['l7', 'Xulosa'], ['l7', 'beradi.'],
    ['l8', 'Ilovangiz'], ['l8', 'tekshiring.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l1', "o'qiydi."), 'error'); } catch (e) {}
  try { add(W('l2', 'tushadi.'), 'error'); } catch (e) {}
  try { add(W('l3', 'qisqaradi.'), 'ding'); } catch (e) {}
  try { add(W('l4', 'qilingan.'), 'ding'); } catch (e) {}
  try { add(W('l5', 'faollashtiradi.'), 'ding'); } catch (e) {}
  try { add(W('l6', 'bajarildi.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'beradi.'), 'whoosh'); } catch (e) {}
  try { add(W('l8', 'tekshiring.'), 'ding'); } catch (e) {}
  add(L('l8').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
