// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'May'], ['l1', 'beradi.'],
    ['l2', 'Masalan,'], ['l2', 'tushadi.'],
    ['l3', 'Agar'], ['l3', 'mumkin.'],
    ['l4', 'Sinovimizda'], ['l4', 'qisqardi.'],
    ['l5', 'Es-kyu-laytda'], ['l5', 'saqlanadi.'],
    ['l6', 'Tizim'], ['l6', 'bajaradi.'],
    ['l7', 'So\'rovda'], ['l7', 'qo\'llaniladi.'],
    ['l8', 'Es-kyu-laytda'], ['l8', 'bo\'ysunadi.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'tushadi.'), 'ding'); } catch (e) {}
  try { add(W('l3', 'mumkin.'), 'whoosh'); } catch (e) {}
  try { add(W('l4', 'qisqardi.'), 'ding'); } catch (e) {}
  try { add(W('l5', 'saqlanadi.'), 'ding'); } catch (e) {}
  try { add(W('l6', 'bajaradi.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'qo\'llaniladi.'), 'whoosh'); } catch (e) {}
  try { add(W('l8', 'bo\'ysunadi.'), 'error'); } catch (e) {}
  add(L('l8').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
