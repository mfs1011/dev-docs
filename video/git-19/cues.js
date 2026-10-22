// Ovoz effektlari: so'zlar va sahnaga mos pop, whoosh, ding va swell effektlari
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Salom!'], ['l1', 'o‘rganamiz.'],
    ['l2', 'Blob'], ['l2', 'beradi.'],
    ['l3', 'To‘g‘ridan-to‘g‘ri'], ['l3', 'beradi.'],
    ['l4', 'Shuningdek,'], ['l4', 'ta’minlaydi.'],
    ['l5', 'Git'], ['l5', 'yozadi.'],
    ['l6', 'Git'], ['l6', 'mumkin.'],
    ['l7', 'Git'], ['l7', 'yasaydi.'],
    ['l8', 'Bunda'], ['l8', 'tejaladi.'],
    ['l9', 'Teskari'], ['l9', 'beradi.'],
    ['l10', 'Ushbu'], ['l10', 'ko‘rsatadi.'],
    ['l11', 'Tri'], ['l11', 'birikadi.'],
    ['l12', 'Keyingi'], ['l12', 'o‘rganamiz.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'beradi.'), 'ding'); } catch (e) {}
  try { add(W('l3', 'beradi.'), 'whoosh'); } catch (e) {}
  try { add(W('l4', 'ta’minlaydi.'), 'ding'); } catch (e) {}
  try { add(W('l5', 'yozadi.'), 'pop'); } catch (e) {}
  try { add(W('l6', 'mumkin.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'yasaydi.'), 'whoosh'); } catch (e) {}
  try { add(W('l8', 'tejaladi.'), 'ding'); } catch (e) {}
  try { add(W('l9', 'beradi.'), 'pop'); } catch (e) {}
  try { add(W('l10', 'ko‘rsatadi.'), 'ding'); } catch (e) {}
  try { add(W('l11', 'birikadi.'), 'ding'); } catch (e) {}
  add(L('l12').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
