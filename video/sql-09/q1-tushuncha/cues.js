// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'boolean'], ['L1', 'uuid'], ['L1', 'enum'],
   ['L2', 'identifikator'],
   ['L3', 'bayt'],
   ['L4', 'rost'], ['L4', 'null'],
   ['L5', 'standartga'],
   ['L6', 'universal'],
   ['L7', 'to‘rtinchi'], ['L7', 'yettinchi'],
   ['L8', 'qirq'], ['L8', 'olti'],
   ['L9', 'cheklangan'],
   ['L10', 'tartib'],
   ['L11', 'o‘chirib'],
   ['L12', 'tanlovdir']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L4', 'null'), 'ding'); } catch (e) {}
  try { add(W('L8', 'olti'), 'ding'); } catch (e) {}
  try { add(W('L11', 'o‘chirib'), 'strike'); } catch (e) {}
  add(L('L13').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
