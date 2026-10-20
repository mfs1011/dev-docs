// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'May'], ['l1', 'sukut'], ['l1', 'oddiy'],
    ['l2', 'Lekin'], ['l2', 'funksional'], ['l2', 'yaratiladi.'],
    ['l3', 'Es-kyu-layt'], ['l3', 'tushunmaydi'], ['l3', 'harfma-harf'],
    ['l4', 'layk'], ['l4', 'nokase'], ['l4', 'zarur.'],
    ['l5', 'Qisman'], ['l5', 'Postgres'], ['l5', 'sintaksis'],
    ['l6', 'Inklud'], ['l6', 'Postgresda'], ['l6', 'foydalanadi.'],
    ['l7', 'Har'], ['l7', 'bir'], ['l7', 'qoching.'],
    ['l8', 'Kam'], ['l8', 'qisman'], ['l8', 'tejang.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'yaratiladi.'), 'ding'); } catch (e) {}
  try { add(W('l3', 'tushunmaydi'), 'error'); } catch (e) {}
  try { add(W('l4', 'nokase'), 'whoosh'); } catch (e) {}
  try { add(W('l5', 'sintaksis'), 'error'); } catch (e) {}
  try { add(W('l6', 'Inklud'), 'ding'); } catch (e) {}
  try { add(W('l7', 'bir'), 'ding'); } catch (e) {}
  try { add(W('l8', 'tejang.'), 'ding'); } catch (e) {}
  add(L('l8').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
