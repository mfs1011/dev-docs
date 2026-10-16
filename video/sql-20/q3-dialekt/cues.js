// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'Apsert'], ['L1', 'May'], ['L1', 'Es-kyu-layt'], ['L1', 'Postgres'],
   ['L2', 'myorj'], ['L2', 'dyuplikate'], ['L2', 'apdeyt'], ['L2', 'nyu'],
   ['L3', 'ripleys'], ['L3', 'o‘chirib'], ['L3', 'ay-di-ni'], ['L3', 'buzib'],
   ['L4', 'Postgres'], ['L4', 'konflikt'], ['L4', 'ketma-ket'],
   ['L5', 'Ripleys'], ['L5', 'ver'], ['L5', 'tru'], ['L5', 'xatolardir.'],
   ['L6', 'konfliktlarni'], ['L6', 'ay-di'], ['L6', 'kalitidir.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'dyuplikate'), 'ding'); } catch (e) {}
  try { add(W('L3', 'buzib'), 'strike'); } catch (e) {}
  try { add(W('L4', 'konflikt'), 'ding'); } catch (e) {}
  try { add(W('L5', 'xatolardir.'), 'strike'); } catch (e) {}
  try { add(W('L6', 'kalitidir.'), 'ding'); } catch (e) {}
  add(L('L6').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
