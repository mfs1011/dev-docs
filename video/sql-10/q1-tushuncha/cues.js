// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'nul'], ['L1', 'konversiyasi'],
   ['L2', 'yo‘qligini'], ['L2', 'noma’lum'],
   ['L3', 'telefon'], ['L3', 'ma’lum'],
   ['L4', 'uchta'], ['L4', 'rost'], ['L4', 'nul'],
   ['L5', 'fols'], ['L5', 'tru'],
   ['L6', 'tenglik'], ['L6', 'barobar'],
   ['L7', 'qaytarmaydi'],
   ['L8', 'distinkt'], ['L8', 'predikatlar'],
   ['L9', 'tiplangan'], ['L9', 'kast'],
   ['L10', 'literal'], ['L10', 'butun'],
   ['L11', 'xato'],
   ['L12', 'mantiqni']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'yo‘qligini'), 'ding'); } catch (e) {}
  try { add(W('L4', 'nul'), 'ding'); } catch (e) {}
  try { add(W('L7', 'qaytarmaydi'), 'strike'); } catch (e) {}
  try { add(W('L11', 'xato'), 'strike'); } catch (e) {}
  add(L('L12').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
