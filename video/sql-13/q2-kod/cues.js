// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'terminalida'], ['L1', 'Aydentiti'],
   ['L2', 'olveys'], ['L2', 'xato'],
   ['L3', 'overrayding'], ['L3', 'valyu'],
   ['L4', 'difolt'], ['L4', 'ikkini'],
   ['L5', 'serial'], ['L5', 'funksiyasi'],
   ['L6', 'Nekst-val'], ['L6', 'kar-val'],
   ['L7', 'rolbek'], ['L7', 'to‘rtinchi'],
   ['L8', 'bo‘shliqlar'], ['L8', 'isbotlaydi'],
   ['L9', 'xavfsiz'], ['L9', 'mexanizmini']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'xato'), 'strike'); } catch (e) {}
  try { add(W('L3', 'overrayding'), 'ding'); } catch (e) {}
  try { add(W('L6', 'Nekst-val'), 'ding'); } catch (e) {}
  try { add(W('L7', 'rolbek'), 'strike'); } catch (e) {}
  try { add(W('L8', 'bo‘shliqlar'), 'ding'); } catch (e) {}
  add(L('L9').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
