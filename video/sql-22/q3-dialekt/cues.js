// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'Selekt'], ['L1', 'farqlarga'], ['L1', 'aliaslarni'],
   ['L2', 'alias'], ['L2', 'ver'], ['L2', 'having'], ['L2', 'distinkt'],
   ['L3', 'May'], ['L3', 'dual'], ['L3', 'soxta'],
   ['L4', 'Es-kyu-layt'], ['L4', 'ver'], ['L4', 'having'], ['L4', 'standart'],
   ['L5', 'Es-kyu-layt'], ['L5', 'Postgres'], ['L5', 'qiyinchilik'],
   ['L6', 'Doimo'], ['L6', 'standartiga'], ['L6', 'nom'], ['L6', 'garovidir']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'ishlamasa'), 'strike'); } catch (e) {}
  try { add(W('L2', 'distinkt'), 'strike'); } catch (e) {}
  try { add(W('L3', 'dual'), 'ding'); } catch (e) {}
  try { add(W('L4', 'having'), 'ding'); } catch (e) {}
  try { add(W('L4', 'standart'), 'strike'); } catch (e) {}
  try { add(W('L5', 'qiyinchilik'), 'strike'); } catch (e) {}
  try { add(W('L6', 'garovidir'), 'ding'); } catch (e) {}
  add(L('L6').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
