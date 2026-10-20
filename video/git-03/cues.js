// Ovoz effektlari: so'zlar va sahnaga mos pop, whoosh, ding va swell effektlari
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Salom!'], ['l1', 'o‘rganamiz.'],
    ['l2', 'Git'], ['l2', 'muhrlanadi.'],
    ['l3', 'Git'], ['l3', 'lokal.'],
    ['l4', 'Bunda'], ['l4', 'oladi.'],
    ['l5', 'Yuzer'], ['l5', 'bo‘lmaydi.'],
    ['l6', 'Gitning'], ['l6', 'bo‘lingan.'],
    ['l7', 'Standart'], ['l7', 'qulay.'],
    ['l8', 'Shuningdek,'], ['l8', 'mumkin.'],
    ['l9', 'Git'], ['l9', 'beradi.'],
    ['l10', 'Qo‘shimcha'], ['l10', 'ko‘rsatadi.'],
    ['l11', 'Xulosa'], ['l11', 'qiladi.'],
    ['l12', 'Keyingi'], ['l12', 'rahmat!']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'muhrlanadi.'), 'ding'); } catch (e) {}
  try { add(W('l3', 'lokal.'), 'whoosh'); } catch (e) {}
  try { add(W('l4', 'oladi.'), 'ding'); } catch (e) {}
  try { add(W('l5', 'bo‘lmaydi.'), 'error'); } catch (e) {}
  try { add(W('l6', 'bo‘lingan.'), 'pop'); } catch (e) {}
  try { add(W('l7', 'qulay.'), 'ding'); } catch (e) {}
  try { add(W('l8', 'mumkin.'), 'whoosh'); } catch (e) {}
  try { add(W('l9', 'beradi.'), 'ding'); } catch (e) {}
  try { add(W('l10', 'ko‘rsatadi.'), 'pop'); } catch (e) {}
  try { add(W('l11', 'qiladi.'), 'ding'); } catch (e) {}
  add(L('l12').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
