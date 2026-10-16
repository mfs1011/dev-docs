// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'terminalida'], ['L1', 'kodlash'],
   ['L2', 'tekshiramiz'], ['L2', 'provayderi'],
   ['L3', 'o‘nta'], ['L3', 'kiritib'],
   ['L4', 'baytlar'], ['L4', 'lotin'], ['L4', 'joylashadi'],
   ['L5', 'kollatsiyasini'], ['L5', 'aylanadi'],
   ['L6', 'yordamida'], ['L6', 'yaratish'],
   ['L7', 'takroriy'], ['L7', 'xatosini'],
   ['L8', 'saralash'], ['L8', 'tengsizdir']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L4', 'joylashadi'), 'ding'); } catch (e) {}
  try { add(W('L5', 'aylanadi'), 'ding'); } catch (e) {}
  try { add(W('L7', 'xatosini'), 'strike'); } catch (e) {}
  add(L('L8').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
