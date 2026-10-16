// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'Amaliyot'], ['L1', 'mahsulotlar'], ['L1', 'si-es-vi'], ['L1', 'xato'],
   ['L2', 'kopi'], ['L2', 'to‘xtaydi'], ['L2', 'bekor'],
   ['L3', 'ignor'], ['L3', 'verbositi'], ['L3', 'uchta'], ['L3', 'yuklanadi.'],
   ['L4', 'Postgres'], ['L4', 'ridjekt'], ['L4', 'limit'], ['L4', 'to‘xtatish'],
   ['L5', 'server'], ['L5', 'pi-es-kyu-el'], ['L5', 'bek-slesh'],
   ['L6', 'selekt'], ['L6', 'standart'], ['L6', 'si-es-vi'], ['L6', 'eksport']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'to‘xtaydi'), 'strike'); } catch (e) {}
  try { add(W('L3', 'yuklanadi.'), 'ding'); } catch (e) {}
  try { add(W('L4', 'limit'), 'strike'); } catch (e) {}
  try { add(W('L5', 'bek-slesh'), 'ding'); } catch (e) {}
  try { add(W('L6', 'eksport'), 'ding'); } catch (e) {}
  add(L('L6').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
