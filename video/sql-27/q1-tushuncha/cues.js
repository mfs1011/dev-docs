// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['intro', 'Sabkveri'], ['intro', 'selekt'],
   ['turlari', 'skalyar'], ['turlari', 'jadval'],
   ['skalyar', 'bitta'], ['skalyar', 'null'],
   ['korrelyatsiya', 'korrelyatsiyalangan'], ['korrelyatsiya', 'har'],
   ['exists', 'Egzists'], ['exists', 'null'],
   ['in_any_all', 'In'], ['in_any_all', 'eni'], ['in_any_all', 'oll'],
   ['not_in_trap', 'tuzaq'], ['not_in_trap', 'null'], ['not_in_trap', 'egzists'],
   ['derived', 'From'], ['derived', 'hosila'], ['derived', 'jadval']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('intro', 'Sabkveri'), 'ding'); } catch (e) {}
  try { add(W('skalyar', 'null'), 'strike'); } catch (e) {}
  try { add(W('korrelyatsiya', 'korrelyatsiyalangan'), 'ding'); } catch (e) {}
  try { add(W('exists', 'Egzists'), 'ding'); } catch (e) {}
  try { add(W('not_in_trap', 'null'), 'strike'); } catch (e) {}
  try { add(W('derived', 'hosila'), 'ding'); } catch (e) {}
  add(L('derived').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
