// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['intro', 'es-kyu-el'], ['intro', 'dialektlarida'], ['intro', 'natija'],
   ['ulash', 'Satrlarni'], ['ulash', 'konkat'], ['ulash', 'null'], ['ulash', 'dablyu-es'],
   ['uzunlik', 'Postgres'], ['uzunlik', 'Es-kyu-layt'], ['uzunlik', 'lengs'], ['uzunlik', 'May'], ['uzunlik', 'baytlar'],
   ['amallar', 'Katta-kichik'], ['amallar', 'qism'], ['amallar', 'birinchi'], ['amallar', 'aski'],
   ['regex', 'Reg-eks'], ['regex', 'Postgres'], ['regex', 'May'], ['regex', 'tozalaydi.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('ulash', 'dablyu-es'), 'ding'); } catch (e) {}
  try { add(W('uzunlik', 'baytlar'), 'strike'); } catch (e) {}
  try { add(W('amallar', 'aski'), 'ding'); } catch (e) {}
  try { add(W('regex', 'tozalaydi.'), 'ding'); } catch (e) {}
  add(L('regex').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
