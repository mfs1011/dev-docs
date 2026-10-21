// Ovoz effektlari: so'zlar va sahnaga mos pop, whoosh, ding va swell effektlari
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Salom!'], ['l1', 'o‘rganamiz.'],
    ['l2', 'Git'], ['l2', 'bazasidir.'],
    ['l3', 'Kalitning'], ['l3', 'ta’minlaydi.'],
    ['l4', 'Git\'da'], ['l4', 'aylanadi.'],
    ['l5', 'Git'], ['l5', 'beradi.'],
    ['l6', 'Ket-fayl'], ['l6', 'ko‘ramiz.'],
    ['l7', 'Diskdagi'], ['l7', 'saqlanadi.'],
    ['l8', 'Fayl'], ['l8', 'qilinadi.'],
    ['l9', 'Git'], ['l9', 'natijasidir.'],
    ['l10', 'Shu'], ['l10', 'shart.'],
    ['l11', 'Blob'], ['l11', 'joylashadi.'],
    ['l12', 'Keyingi'], ['l12', 'tanishamiz.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'bazasidir.'), 'ding'); } catch (e) {}
  try { add(W('l3', 'ta’minlaydi.'), 'whoosh'); } catch (e) {}
  try { add(W('l4', 'aylanadi.'), 'ding'); } catch (e) {}
  try { add(W('l5', 'beradi.'), 'pop'); } catch (e) {}
  try { add(W('l6', 'ko‘ramiz.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'saqlanadi.'), 'whoosh'); } catch (e) {}
  try { add(W('l8', 'qilinadi.'), 'ding'); } catch (e) {}
  try { add(W('l9', 'natijasidir.'), 'pop'); } catch (e) {}
  try { add(W('l10', 'shart.'), 'ding'); } catch (e) {}
  try { add(W('l11', 'joylashadi.'), 'ding'); } catch (e) {}
  add(L('l12').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
