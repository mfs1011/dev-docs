// Ovoz effektlari: so'zlar va sahnaga mos pop, whoosh, ding va swell effektlari
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Salom!'], ['l1', 'o‘rganamiz.'],
    ['l2', 'U'], ['l2', 'etadi.'],
    ['l3', 'Har'], ['l3', 'bo‘lmaydi.'],
    ['l4', 'Shu'], ['l4', 'harakatlanadi.'],
    ['l5', 'Standart'], ['l5', 'beradi.'],
    ['l6', 'Graf'], ['l6', 'ko‘rsatadi.'],
    ['l7', 'Minus'], ['l7', 'chiqaradi.'],
    ['l8', 'Minus'], ['l8', 'ochiqlaydi.'],
    ['l9', 'Git'], ['l9', 'mumkin.'],
    ['l10', 'Ayniqsa,'], ['l10', 'beradi.'],
    ['l11', 'Xulosa'], ['l11', 'manbaidir.'],
    ['l12', 'Keyingi'], ['l12', 'Rahmat!']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'etadi.'), 'ding'); } catch (e) {}
  try { add(W('l3', 'bo‘lmaydi.'), 'whoosh'); } catch (e) {}
  try { add(W('l4', 'harakatlanadi.'), 'pop'); } catch (e) {}
  try { add(W('l5', 'beradi.'), 'pop'); } catch (e) {}
  try { add(W('l6', 'ko‘rsatadi.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'chiqaradi.'), 'whoosh'); } catch (e) {}
  try { add(W('l8', 'ochiqlaydi.'), 'ding'); } catch (e) {}
  try { add(W('l9', 'mumkin.'), 'pop'); } catch (e) {}
  try { add(W('l10', 'beradi.'), 'ding'); } catch (e) {}
  try { add(W('l11', 'manbaidir.'), 'ding'); } catch (e) {}
  add(L('l12').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
