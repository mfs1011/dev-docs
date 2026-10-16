// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'Amaliyotda'], ['L1', 'mavjud'], ['L1', 'yangilashdir.'],
   ['L2', 'selekt'], ['L2', 'insert'], ['L2', 'to‘qnashuvi'],
   ['L3', 'Apsert'], ['L3', 'atomar'], ['L3', 'konflikt'],
   ['L4', 'Eksklyuded'], ['L4', 'chetlatilgan,'], ['L4', 'imkonini'],
   ['L5', 'Standart'], ['L5', 'myorj'], ['L5', 'dilit'],
   ['L6', 'Apsert'], ['L6', 'poyga'], ['L6', 'xavfsizlik']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'to‘qnashuvi'), 'strike'); } catch (e) {}
  try { add(W('L3', 'atomar'), 'ding'); } catch (e) {}
  try { add(W('L4', 'Eksklyuded'), 'ding'); } catch (e) {}
  try { add(W('L5', 'myorj'), 'ding'); } catch (e) {}
  try { add(W('L6', 'xavfsizlik'), 'ding'); } catch (e) {}
  add(L('L6').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
