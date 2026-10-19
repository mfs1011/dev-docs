// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Postgresga'], ['l1', 'relyatsion'],
    ['l2', 'portativlik'], ['l2', 'muqobil'],
    ['l3', 'May'], ['l3', 'massiv'], ['l3', 'jadvallar'],
    ['l4', 'Oraliqlar'], ['l4', 'domen'], ['l4', 'cheklov'],
    ['l5', 'Es-kyu-laytda'], ['l5', 'massiv'], ['l5', 'matn'],
    ['l6', 'tuzoq'], ['l6', 'element'],
    ['l7', 'Solishtirma'], ['l7', 'istisno'], ['l7', 'Postgresda'],
    ['l8', 'poyga'], ['l8', 'tranzaksiyalar'],
    ['l9', 'Loyiha'], ['l9', 'universal'],
    ['l10', 'unumdorlik'], ['l10', 'yaxlitligini']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'keladi.'), 'ding'); } catch (e) {}
  try { add(W('l4', 'takrorlanadi.'), 'ding'); } catch (e) {}
  try { add(W('l6', 'bo\'lmaydi.'), 'ding'); } catch (e) {}
  try { add(W('l8', 'qilinadi.'), 'ding'); } catch (e) {}
  try { add(W('l10', 'kafolatlaydi.'), 'ding'); } catch (e) {}
  add(L('l10').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
