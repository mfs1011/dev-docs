// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'Filtrlash'], ['L1', 'May'], ['L1', 'Es-kyu-layt'], ['L1', 'registr'],
   ['L2', 'layk'], ['L2', 'distinkt'], ['L2', 'tenglik'],
   ['L3', 'Es-kyu-layt'], ['L3', 'aski'], ['L3', 'registrga'],
   ['L4', 'chiziq'], ['L4', 'escape'], ['L4', 'glob'],
   ['L5', 'not'], ['L5', 'null-xavfsiz'], ['L5', 'reg-eks'],
   ['L6', 'Doimo'], ['L6', 'portabel'], ['L6', 'garovidir']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'tenglik'), 'ding'); } catch (e) {}
  try { add(W('L3', 'registrga'), 'strike'); } catch (e) {}
  try { add(W('L4', 'glob'), 'ding'); } catch (e) {}
  try { add(W('L5', 'null-xavfsiz'), 'ding'); } catch (e) {}
  try { add(W('L6', 'garovidir'), 'ding'); } catch (e) {}
  add(L('L6').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
