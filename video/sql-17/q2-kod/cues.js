// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'Postgres'], ['L1', 'insert'], ['L1', 'apdeyt'], ['L1', 'chek'], ['L1', 'refresh'],
   ['L2', 'Faol_mahsulotlar'], ['L2', 'apdeyt'], ['L2', 'insert'], ['L2', 'jadvaliga'],
   ['L3', 'Arzonlar'], ['L3', 'chek'], ['L3', 'rad'],
   ['L4', 'Statistika'], ['L4', 'grup'], ['L4', 'xatolik'],
   ['L5', 'Narx_hisoboti'], ['L5', 'refresh,'], ['L5', 'yunik'], ['L5', 'konkurentli'],
   ['L6', 'chek'], ['L6', 'yunik'], ['L6', 'konkurentli']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'insert'), 'ding'); } catch (e) {}
  try { add(W('L3', 'rad'), 'error'); } catch (e) {}
  try { add(W('L4', 'xatolik'), 'error'); } catch (e) {}
  try { add(W('L5', 'refresh,'), 'ding'); } catch (e) {}
  try { add(W('L5', 'konkurentli'), 'strike'); } catch (e) {}
  add(L('L6').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
