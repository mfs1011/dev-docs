// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Postgresda'], ['l1', 'big-int'], ['l1', 've-yetti'],
    ['l2', 'Yu-yu-ay-di'], ['l2', 've-to\'rt'], ['l2', 'shishdi'],
    ['l3', 'inno-de-be'], ['l3', 'ikkilamchi'], ['l3', 'indeks'],
    ['l4', 'Butun'], ['l4', 'kalitda'], ['l4', 'ko\'paydi'],
    ['l5', 'Es-kyu-laytda'], ['l5', 'vizaut'], ['l5', 'rou-ay-di'],
    ['l6', 'xato'], ['l6', 'klasterlanadi'],
    ['l7', 'AUTOINCREMENT'], ['l7', 'taqiqlangan'], ['l7', 'majburiy'],
    ['l8', 'to\'lmaydi'], ['l8', 'xatosi']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l1', 'big-int'), 'ding'); } catch (e) {}
  try { add(W('l1', 've-yetti'), 'ding'); } catch (e) {}
  try { add(W('l2', 'shishdi'), 'strike'); } catch (e) {}
  try { add(W('l4', 'ko\'paydi'), 'error'); } catch (e) {}
  try { add(W('l5', 'vizaut'), 'whoosh'); } catch (e) {}
  try { add(W('l6', 'xato'), 'error'); } catch (e) {}
  try { add(W('l7', 'taqiqlangan'), 'strike'); } catch (e) {}
  try { add(W('l8', 'xatosi'), 'error'); } catch (e) {}
  add(L('l8').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
