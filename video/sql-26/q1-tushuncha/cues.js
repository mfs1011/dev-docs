// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['g1', 'Agregat'], ['g1', 'yakuniy'],
   ['g2', 'Kaunt'], ['g2', 'sam'], ['g2', 'averij'], ['g2', 'min'], ['g2', 'maks'],
   ['g3', 'yulduzcha'], ['g3', 'null'],
   ['g4', 'nol'], ['g4', 'null'],
   ['g5', 'Grup'], ['g5', 'bay'], ['g5', 'guruhlaydi'],
   ['g6', 'veer'], ['g6', 'heving'],
   ['g7', 'ustunlarni'], ['g7', 'selekt'],
   ['g8', 'birlamchi'], ['g8', 'kalit'],
   ['g9', 'filtr'], ['g9', 'rollap'],
   ['g10', 'Postgres']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('g2', 'Kaunt'), 'ding'); } catch (e) {}
  try { add(W('g3', 'null'), 'strike'); } catch (e) {}
  try { add(W('g4', 'null'), 'ding'); } catch (e) {}
  try { add(W('g5', 'Grup'), 'ding'); } catch (e) {}
  try { add(W('g6', 'heving'), 'ding'); } catch (e) {}
  try { add(W('g8', 'kalit'), 'ding'); } catch (e) {}
  try { add(W('g9', 'rollap'), 'ding'); } catch (e) {}
  add(L('g10').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
