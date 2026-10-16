// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'farqlari'], ['L1', 'nul'],
   ['L2', 'distinkt'], ['L2', 'tenglik'], ['L2', 'rost'],
   ['L3', 'konkat'], ['L3', 'aylanadi'],
   ['L4', 'tuzoq'], ['L4', 'kasr'],
   ['L5', 'nolga'], ['L5', 'ishlamaydi'],
   ['L6', 'saynd'], ['L6', 'yaxlitlanadi'],
   ['L7', 'afiniti'], ['L7', 'kesib'],
   ['L8', 'strikt'], ['L8', 'rad'],
   ['L9', 'saqlaning'], ['L9', 'kaunt'],
   ['L10', 'boshqarish']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'rost'), 'ding'); } catch (e) {}
  try { add(W('L5', 'ishlamaydi'), 'strike'); } catch (e) {}
  try { add(W('L8', 'rad'), 'strike'); } catch (e) {}
  try { add(W('L9', 'saqlaning'), 'ding'); } catch (e) {}
  add(L('L10').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
