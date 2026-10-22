// Ovoz effektlari: so'zlar va sahnaga mos pop, whoosh, ding va swell effektlari
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Salom!'], ['l1', 'o‘rganamiz.'],
    ['l2', 'Refspec'], ['l2', 'qoidadir.'],
    ['l3', 'Qisman'], ['l3', 'mumkin.'],
    ['l4', 'Shuningdek,'], ['l4', 'mavjud.'],
    ['l5', 'Git\'ning'], ['l5', 'uzatadi.'],
    ['l6', 'Fetch'], ['l6', 'o‘rnatadi.'],
    ['l7', 'Ko‘r-ko‘rona'], ['l7', 'mumkin.'],
    ['l8', '--force-with-lease'], ['l8', 'qoladi.'],
    ['l9', 'Biroq'], ['l9', 'foydalanamiz.'],
    ['l10', 'Ushbu'], ['l10', 'kafolatlaydi.'],
    ['l11', 'Ushbu'], ['l11', 'ko‘taradi.'],
    ['l12', 'Keyingi'], ['l12', 'chiqamiz.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'qoidadir.'), 'ding'); } catch (e) {}
  try { add(W('l3', 'mumkin.'), 'whoosh'); } catch (e) {}
  try { add(W('l4', 'mavjud.'), 'ding'); } catch (e) {}
  try { add(W('l5', 'uzatadi.'), 'pop'); } catch (e) {}
  try { add(W('l6', 'o‘rnatadi.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'mumkin.'), 'whoosh'); } catch (e) {}
  try { add(W('l8', 'qoladi.'), 'ding'); } catch (e) {}
  try { add(W('l9', 'foydalanamiz.'), 'pop'); } catch (e) {}
  try { add(W('l10', 'kafolatlaydi.'), 'ding'); } catch (e) {}
  try { add(W('l11', 'ko‘taradi.'), 'ding'); } catch (e) {}
  add(L('l12').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
