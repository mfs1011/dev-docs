// Ovoz effektlari: so'zlar va sahnaga mos pop, whoosh, ding va swell effektlari
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Salom!'], ['l1', 'o‘rganamiz.'],
    ['l2', 'Gitda'], ['l2', 'klon.'],
    ['l3', 'Git'], ['l3', 'aylantiradi.'],
    ['l4', 'Nuqta'], ['l4', 'etiladi.'],
    ['l5', 'Yangi'], ['l5', 'bo‘ladi.'],
    ['l6', 'Ilk'], ['l6', 'keladi.'],
    ['l7', 'Git'], ['l7', 'oladi.'],
    ['l8', 'Natijada'], ['l8', 'bo‘ladi.'],
    ['l9', 'Klonlashda'], ['l9', 'mumkin.'],
    ['l10', 'Katta'], ['l10', 'qulay.'],
    ['l11', 'Xulosa'], ['l11', 'debochasidir.'],
    ['l12', 'Keyingi'], ['l12', 'rahmat!']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'klon.'), 'ding'); } catch (e) {}
  try { add(W('l3', 'aylantiradi.'), 'whoosh'); } catch (e) {}
  try { add(W('l4', 'etiladi.'), 'pop'); } catch (e) {}
  try { add(W('l5', 'bo‘ladi.'), 'error'); } catch (e) {}
  try { add(W('l6', 'keladi.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'oladi.'), 'whoosh'); } catch (e) {}
  try { add(W('l8', 'bo‘ladi.'), 'ding'); } catch (e) {}
  try { add(W('l9', 'mumkin.'), 'pop'); } catch (e) {}
  try { add(W('l10', 'qulay.'), 'ding'); } catch (e) {}
  try { add(W('l11', 'debochasidir.'), 'ding'); } catch (e) {}
  add(L('l12').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
