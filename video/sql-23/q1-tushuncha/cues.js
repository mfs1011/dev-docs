// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'ver'], ['L1', 'filtrlash'], ['L1', 'rost'], ['L1', 'null'],
   ['L2', 'Bitvin'], ['L2', 'kiritadi'], ['L2', 'simmetrik'],
   ['L3', 'In'], ['L3', 'not'], ['L3', 'null'], ['L3', 'qaytmaydi'],
   ['L4', 'tengsizlik'], ['L4', 'xavfsiz'], ['L4', 'distinkt'],
   ['L5', 'layk'], ['L5', 'ay-layk'], ['L5', 'pozikz'],
   ['L6', 'mantiqni'], ['L6', 'unumdorlikka'], ['L6', 'kafolatidir']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L1', 'rost'), 'ding'); } catch (e) {}
  try { add(W('L1', 'null'), 'strike'); } catch (e) {}
  try { add(W('L2', 'simmetrik'), 'ding'); } catch (e) {}
  try { add(W('L3', 'qaytmaydi'), 'strike'); } catch (e) {}
  try { add(W('L4', 'distinkt'), 'ding'); } catch (e) {}
  try { add(W('L6', 'kafolatidir'), 'ding'); } catch (e) {}
  add(L('L6').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
