// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'May'], ['L1', 'Es-kyu-layt'], ['L1', 'null'],
   ['L2', 'null'], ['L2', 'kichik'], ['L2', 'iz'],
   ['L3', 'limit'], ['L3', 'ofset'], ['L3', 'fech'],
   ['L4', 'Es-kyu-layt'], ['L4', 'last'], ['L4', 'manfiy'],
   ['L5', 'noldan'], ['L5', 'mustahkamlanishi'],
   ['L6', 'Doimo'], ['L6', 'standart'], ['L6', 'ta’minlaydi']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'kichik'), 'strike'); } catch (e) {}
  try { add(W('L3', 'fech'), 'strike'); } catch (e) {}
  try { add(W('L4', 'last'), 'ding'); } catch (e) {}
  try { add(W('L5', 'mustahkamlanishi'), 'ding'); } catch (e) {}
  try { add(W('L6', 'ta’minlaydi'), 'ding'); } catch (e) {}
  add(L('L6').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
