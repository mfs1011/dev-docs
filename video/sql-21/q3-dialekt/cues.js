// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'May'], ['L1', 'Es-kyu-layt'], ['L1', 'deyta'], ['L1', 'import'],
   ['L2', 'deyta'], ['L2', 'yigirma'], ['L2', 'sekyur'], ['L2', 'infayl'],
   ['L3', 'Lokal'], ['L3', 'e’tiborsiz'], ['L3', 'nolga'], ['L3', 'buzilib'],
   ['L4', 'Es-kyu-layt'], ['L4', 'import'], ['L4', 'avvaldan'], ['L4', 'tipsiz'],
   ['L5', 'matn'], ['L5', 'strikt'], ['L5', 'shart.'],
   ['L6', 'tezligi'], ['L6', 'ogohlantirishlarni'], ['L6', 'butunligini'], ['L6', 'asosidir.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'yigirma'), 'ding'); } catch (e) {}
  try { add(W('L3', 'buzilib'), 'strike'); } catch (e) {}
  try { add(W('L4', 'tipsiz'), 'strike'); } catch (e) {}
  try { add(W('L5', 'strikt'), 'ding'); } catch (e) {}
  try { add(W('L6', 'asosidir.'), 'ding'); } catch (e) {}
  add(L('L6').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
