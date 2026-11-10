// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Jadvalda'], ['l1', 'olmaydi.'],
    ['l2', 'ifoda'], ['l2', 'yoziladi.'],
    ['l3', 'Ikkinchi'], ['l3', 'solishtirishdir.'],
    ['l4', 'Postgresda'], ['l4', 'elaydi.'],
    ['l5', 'Turli'], ['l5', 'qiladi.'],
    ['l6', 'bitlar'], ['l6', "o'qiladi."],
    ['l7', "Ko'p"], ['l7', 'proporsionaldir.'],
    ['l8', 'rel-tyupls'], ['l8', 'ishlatiladi.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l1', 'olmaydi.'), 'error'); } catch (e) {}
  try { add(W('l2', 'yoziladi.'), 'ding'); } catch (e) {}
  try { add(W('l3', 'solishtirishdir.'), 'whoosh'); } catch (e) {}
  try { add(W('l4', 'xato'), 'error'); } catch (e) {}
  try { add(W('l5', 'qiladi.'), 'whoosh'); } catch (e) {}
  try { add(W('l6', 'birlashtiriladi,'), 'ding'); } catch (e) {}
  try { add(W('l6', "o'qiladi."), 'error'); } catch (e) {}
  try { add(W('l7', 'proporsionaldir.'), 'whoosh'); } catch (e) {}
  try { add(W('l8', 'ishlatiladi.'), 'ding'); } catch (e) {}
  add(L('l8').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
