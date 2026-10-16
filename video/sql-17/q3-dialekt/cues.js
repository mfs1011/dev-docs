// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'Vyu'], ['L1', 'Materialayzd'], ['L1', 'es-kyu-el'], ['L1', 'Es-kyu-layt'],
   ['L2', 'vyular'], ['L2', 'birga-bir'], ['L2', 'chek'], ['L2', 'kaskeydid'],
   ['L3', 'Xavfli'], ['L3', 'ustunni'], ['L3', 'buzilib'],
   ['L4', 'Community'], ['L4', 'Materialayzd'], ['L4', 'refresh'], ['L4', 'xato'],
   ['L5', 'Es-kyu-layt'], ['L5', 'qat’iy'], ['L5', 'insted'], ['L5', 'yozish'],
   ['L6', 'bog‘liqlik'], ['L6', 'Materialayzd'], ['L6', 'kaskeydid'], ['L6', 'insted']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'kaskeydid'), 'ding'); } catch (e) {}
  try { add(W('L3', 'buzilib'), 'error'); } catch (e) {}
  try { add(W('L4', 'xato'), 'error'); } catch (e) {}
  try { add(W('L5', 'insted'), 'ding'); } catch (e) {}
  try { add(W('L6', 'bog‘liqlik'), 'strike'); } catch (e) {}
  add(L('L6').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
