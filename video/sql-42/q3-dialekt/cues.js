// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'May'], ['l1', 'skip'], ['l1', 'mavjud'],
    ['l2', 'Aralash'], ['l2', 'to\'liq'],
    ['l3', 'Es-kyu-laytda'], ['l3', 'analayz'], ['l3', 'yetarli'],
    ['l4', 'Statistikasiz'], ['l4', 'eni'], ['l4', 'sakrashni'],
    ['l5', 'Or'], ['l5', 'birlashtirib'], ['l5', 'qo\'llaydi.'],
    ['l6', 'Es-kyu-layt'], ['l6', 'multi-indeks'], ['l6', 'qidiradi.'],
    ['l7', 'Ko\'p'], ['l7', 'isrof'],
    ['l8', 'Doimo'], ['l8', 'tenglik'], ['l8', 'tekshiring.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l1', 'skip'), 'ding'); } catch (e) {}
  try { add(W('l2', 'to\'liq'), 'whoosh'); } catch (e) {}
  try { add(W('l3', 'analayz'), 'ding'); } catch (e) {}
  try { add(W('l4', 'eni'), 'whoosh'); } catch (e) {}
  try { add(W('l5', 'birlashtirib'), 'ding'); } catch (e) {}
  try { add(W('l6', 'multi-indeks'), 'ding'); } catch (e) {}
  try { add(W('l7', 'isrof'), 'error'); } catch (e) {}
  try { add(W('l8', 'tekshiring.'), 'ding'); } catch (e) {}
  add(L('l8').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
