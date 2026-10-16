// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'terminalida'], ['L1', 'kaskadlari'],
   ['L2', 'musbat_narx'], ['L2', 'to‘xtatadi'],
   ['L3', 'bermaydi'], ['L3', 'ko‘rsatadi'],
   ['L4', 'distinkt'], ['L4', 'etiladi'],
   ['L5', 'kaskad'], ['L5', 'taqiqlaydi'],
   ['L6', 'kechiktiriladi'], ['L6', 'saqlanadi'],
   ['L7', 'relyatsion'], ['L7', 'kafolatlay']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'musbat_narx'), 'strike'); } catch (e) {}
  try { add(W('L4', 'distinkt'), 'ding'); } catch (e) {}
  try { add(W('L5', 'kaskad'), 'ding'); } catch (e) {}
  try { add(W('L5', 'taqiqlaydi'), 'strike'); } catch (e) {}
  try { add(W('L6', 'kechiktiriladi'), 'ding'); } catch (e) {}
  add(L('L7').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
