// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'Postgres'], ['L1', 'konflikt,'], ['L1', 'myorj'],
   ['L2', 'Lug‘at'], ['L2', 'apdeyt'], ['L2', 'retyorning'],
   ['L3', 'eksklyuded'], ['L3', 'soni'], ['L3', 'yangilaydi.'],
   ['L4', 'yunik'], ['L4', 'ikki'], ['L4', 'xatolik'],
   ['L5', 'myorj'], ['L5', 'ombor'], ['L5', 'o‘chirdi.'],
   ['L6', 'konflikt'], ['L6', 'myorj'], ['L6', 'mukammal']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'retyorning'), 'ding'); } catch (e) {}
  try { add(W('L3', 'eksklyuded'), 'ding'); } catch (e) {}
  try { add(W('L4', 'xatolik'), 'strike'); } catch (e) {}
  try { add(W('L5', 'o‘chirdi.'), 'ding'); } catch (e) {}
  try { add(W('L6', 'mukammal'), 'ding'); } catch (e) {}
  add(L('L6').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
