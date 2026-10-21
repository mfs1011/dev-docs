// Ovoz effektlari: so'zlar va sahnaga mos pop, whoosh, ding va swell effektlari
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Salom!'], ['l1', 'tushunib'],
    ['l2', 'Keling,'], ['l2', 'chiqamiz.'],
    ['l3', 'Ko‘pchilik'], ['l3', 'qo‘yadi.'],
    ['l4', 'Lekin'], ['l4', 'qolmaydi.'],
    ['l5', 'Dastlab'], ['l5', 'qolgan.'],
    ['l6', 'Git'], ['l6', 'aylanadi.'],
    ['l7', 'Boshqa'], ['l7', 'saqlaydi.'],
    ['l8', 'Bunda'], ['l8', 'erishiladi.'],
    ['l9', 'Gitda'], ['l9', 'kechadi.'],
    ['l10', 'Har'], ['l10', 'himoyalangan.'],
    ['l11', 'Xulosa'], ['l11', 'arxitekturadir.'],
    ['l12', 'Keyingi'], ['l12', 'rahmat!']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'chiqamiz.'), 'whoosh'); } catch (e) {}
  try { add(W('l3', 'qo‘yadi.'), 'pop'); } catch (e) {}
  try { add(W('l4', 'qolmaydi.'), 'ding'); } catch (e) {}
  try { add(W('l5', 'qolgan.'), 'whoosh'); } catch (e) {}
  try { add(W('l6', 'aylanadi.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'saqlaydi.'), 'whoosh'); } catch (e) {}
  try { add(W('l8', 'erishiladi.'), 'ding'); } catch (e) {}
  try { add(W('l9', 'kechadi.'), 'pop'); } catch (e) {}
  try { add(W('l10', 'himoyalangan.'), 'ding'); } catch (e) {}
  try { add(W('l11', 'arxitekturadir.'), 'ding'); } catch (e) {}
  add(L('l12').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
