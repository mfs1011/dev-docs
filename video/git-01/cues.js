// Ovoz effektlari: so'zlar va sahnaga mos pop, whoosh, ding va swell effektlari
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Salom!'], ['l1', 'chiqamiz.'],
    ['l2', 'Ko‘pchilik'], ['l2', 'qiyin.'],
    ['l3', 'Lokal'], ['l3', 'qoladi.'],
    ['l4', 'Taqsimlangan'], ['l4', 'hisoblanadi.'],
    ['l5', 'Boshqa'], ['l5', 'saqlaydi.'],
    ['l6', 'Agar'], ['l6', 'qo‘yadi.'],
    ['l7', 'Gitda'], ['l7', 'ishlaydi.'],
    ['l8', 'Har'], ['l8', 'kafolatlanadi.'],
    ['l9', 'Git'], ['l9', 'qoladi.'],
    ['l10', 'Fayllar'], ['l10', 'muhrlanadi.'],
    ['l11', 'Xulosa'], ['l11', 'qurilgan.'],
    ['l12', 'Keyingi'], ['l12', 'rahmat!']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'qiyin.'), 'error'); } catch (e) {}
  try { add(W('l3', 'qoladi.'), 'error'); } catch (e) {}
  try { add(W('l4', 'hisoblanadi.'), 'ding'); } catch (e) {}
  try { add(W('l5', 'saqlaydi.'), 'whoosh'); } catch (e) {}
  try { add(W('l6', 'qo‘yadi.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'ishlaydi.'), 'whoosh'); } catch (e) {}
  try { add(W('l8', 'kafolatlanadi.'), 'ding'); } catch (e) {}
  try { add(W('l9', 'qoladi.'), 'pop'); } catch (e) {}
  try { add(W('l10', 'muhrlanadi.'), 'ding'); } catch (e) {}
  try { add(W('l11', 'qurilgan.'), 'ding'); } catch (e) {}
  add(L('l12').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
