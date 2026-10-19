// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['intro', 'Window'], ['intro', 'saqlanib'],
   ['over', 'over'], ['over', 'partishn'], ['over', 'order'],
   ['frame', 'Frame'], ['frame', 'sukut'], ['frame', 'yig\'indini'],
   ['reyting', 'rou'], ['reyting', 'renk'], ['reyting', 'dens'],
   ['siljish', 'leg'], ['siljish', 'liid'], ['siljish', 'forst'],
   ['tartib', 'veer'], ['tartib', 'grup'], ['tartib', 'taqiqlangan']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('intro', 'saqlanib'), 'ding'); } catch (e) {}
  try { add(W('over', 'over'), 'ding'); } catch (e) {}
  try { add(W('frame', 'yig\'indini'), 'ding'); } catch (e) {}
  try { add(W('reyting', 'dens'), 'ding'); } catch (e) {}
  try { add(W('tartib', 'taqiqlangan'), 'strike'); } catch (e) {}
  add(L('tartib').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
