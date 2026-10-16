// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'raqamlarini'], ['L1', 'sikvens'],
   ['L2', 'himoya'], ['L2', 'olveys'],
   ['L3', 'qabul'], ['L3', 'keyingi'],
   ['L4', 'haqiqiy'], ['L4', 'qisqartmasidir'],
   ['L5', 'hisoblagich'], ['L5', 'atomar'],
   ['L6', 'muqarrar'], ['L6', 'bekor'],
   ['L7', 'buxgalteriya'], ['L7', 'bo‘shliqsiz'],
   ['L8', 'standart'], ['L8', 'me\'yor'],
   ['L9', 'samarali'], ['L9', 'garovidir']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'olveys'), 'ding'); } catch (e) {}
  try { add(W('L5', 'atomar'), 'ding'); } catch (e) {}
  try { add(W('L6', 'muqarrar'), 'strike'); } catch (e) {}
  try { add(W('L7', 'bo‘shliqsiz'), 'strike'); } catch (e) {}
  add(L('L9').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
