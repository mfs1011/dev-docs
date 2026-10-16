// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'Dialektlar'], ['L1', 'tuzoqlarni'],
   ['L2', 'chek'], ['L2', 'versiyalarda'], ['L2', 'indeks'],
   ['L3', 'xavfli'], ['L3', 'pragma'], ['L3', 'himoya'],
   ['L4', 'standart'], ['L4', 'avtomatik'], ['L4', 'mexanizmi'],
   ['L5', 'xato'], ['L5', 'unutishdir'], ['L5', 'indekslamaslik'],
   ['L6', 'ishonchli'], ['L6', 'arxitektura']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'indeks'), 'ding'); } catch (e) {}
  try { add(W('L3', 'xavfli'), 'error'); } catch (e) {}
  try { add(W('L3', 'himoya'), 'ding'); } catch (e) {}
  try { add(W('L5', 'xato'), 'error'); } catch (e) {}
  try { add(W('L5', 'unutishdir'), 'strike'); } catch (e) {}
  try { add(W('L5', 'qotirib'), 'strike'); } catch (e) {}
  add(L('L6').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
