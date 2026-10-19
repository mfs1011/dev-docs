// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['intro', 'Postgres'], ['intro', 'rekursiv'], ['intro', 'si-ti-i'],
   ['sonlar', 'yuzgacha'], ['sonlar', 'ellik'],
   ['daraja', 'Xodimlar'], ['daraja', 'Alisadan'], ['daraja', 'darajasini'],
   ['yol', 'Yo\'l'], ['yol', 'chuqurlik'], ['yol', 'daraxt'],
   ['cycle', 'sorch'], ['cycle', 'saykl'], ['cycle', 'cheksiz'],
   ['cheklov', 'agregat'], ['cheklov', 'limit'], ['cheklov', 'taqiqlangan']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('intro', 'rekursiv'), 'ding'); } catch (e) {}
  try { add(W('sonlar', 'ellik'), 'ding'); } catch (e) {}
  try { add(W('yol', 'daraxt'), 'ding'); } catch (e) {}
  try { add(W('cycle', 'saykl'), 'ding'); } catch (e) {}
  try { add(W('cheklov', 'taqiqlangan'), 'strike'); } catch (e) {}
  add(L('cheklov').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
