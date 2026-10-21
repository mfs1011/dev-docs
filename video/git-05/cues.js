// Ovoz effektlari: so'zlar va sahnaga mos pop, whoosh, ding va swell effektlari
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Salom!'], ['l1', 'o‘rganamiz.'],
    ['l2', 'Shu'], ['l2', 'olasiz.'],
    ['l3', 'Git'], ['l3', 'kommitted.'],
    ['l4', 'Modifayd'], ['l4', 'bildiradi.'],
    ['l5', 'Bu'], ['l5', 'direktori.'],
    ['l6', 'Vorking'], ['l6', 'omboridir.'],
    ['l7', 'Ish'], ['l7', 'yozasiz.'],
    ['l8', 'Muhim'], ['l8', 'yashaydi.'],
    ['l9', 'Ko‘p'], ['l9', 'bor.'],
    ['l10', 'U'], ['l10', 'beradi.'],
    ['l11', 'Xulosa'], ['l11', 'mexanizmdir.'],
    ['l12', 'Keyingi'], ['l12', 'Rahmat!']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'olasiz.'), 'ding'); } catch (e) {}
  try { add(W('l3', 'kommitted.'), 'whoosh'); } catch (e) {}
  try { add(W('l4', 'bildiradi.'), 'pop'); } catch (e) {}
  try { add(W('l5', 'direktori.'), 'pop'); } catch (e) {}
  try { add(W('l6', 'omboridir.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'yozasiz.'), 'whoosh'); } catch (e) {}
  try { add(W('l8', 'yashaydi.'), 'ding'); } catch (e) {}
  try { add(W('l9', 'bor.'), 'pop'); } catch (e) {}
  try { add(W('l10', 'beradi.'), 'ding'); } catch (e) {}
  try { add(W('l11', 'mexanizmdir.'), 'ding'); } catch (e) {}
  add(L('l12').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
