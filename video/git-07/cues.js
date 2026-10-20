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
    ['l3', 'Oddiy'], ['l3', 'ko‘rsatadi.'],
    ['l4', 'Git'], ['l4', 'bildiradi.'],
    ['l5', 'Diff'], ['l5', 'anglatadi.'],
    ['l6', 'Boshidagi'], ['l6', 'koordinatalaridir.'],
    ['l7', 'Git'], ['l7', 'mumkin.'],
    ['l8', 'Masalan,'], ['l8', 'beradi.'],
    ['l9', 'Eng'], ['l9', 'yetkazmaydi.'],
    ['l10', 'Shuning'], ['l10', 'odatdir.'],
    ['l11', 'Xulosa'], ['l11', 'kompasidir.'],
    ['l12', 'Keyingi'], ['l12', 'Rahmat!']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'etadi.'), 'ding'); } catch (e) {}
  try { add(W('l3', 'ko‘rsatadi.'), 'whoosh'); } catch (e) {}
  try { add(W('l4', 'bildiradi.'), 'pop'); } catch (e) {}
  try { add(W('l5', 'anglatadi.'), 'pop'); } catch (e) {}
  try { add(W('l6', 'koordinatalaridir.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'mumkin.'), 'whoosh'); } catch (e) {}
  try { add(W('l8', 'beradi.'), 'ding'); } catch (e) {}
  try { add(W('l9', 'yetkazmaydi.'), 'pop'); } catch (e) {}
  try { add(W('l10', 'odatdir.'), 'ding'); } catch (e) {}
  try { add(W('l11', 'kompasidir.'), 'ding'); } catch (e) {}
  add(L('l12').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
