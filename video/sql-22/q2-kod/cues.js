// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'Amaliyot'], ['L1', 'sotuvlar'], ['L1', 'oltita'],
   ['L2', 'aliasini'], ['L2', 'ver'], ['L2', 'xato'],
   ['L3', 'To‘g‘ri'], ['L3', 'saralash'], ['L3', 'taniydi'],
   ['L4', 'yirik'], ['L4', 'distinkt'], ['L4', 'on'],
   ['L5', 'Vergul'], ['L5', 'nom'], ['L5', 'selekt'],
   ['L6', 'Selekt'], ['L6', 'kutilmagan'], ['L6', 'oldini']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'xato'), 'strike'); } catch (e) {}
  try { add(W('L3', 'taniydi'), 'ding'); } catch (e) {}
  try { add(W('L4', 'distinkt'), 'ding'); } catch (e) {}
  try { add(W('L5', 'nom'), 'strike'); } catch (e) {}
  try { add(W('L6', 'oldini'), 'ding'); } catch (e) {}
  add(L('L6').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
