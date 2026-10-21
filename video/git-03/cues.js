// Ovoz effektlari: so'zlar va sahnaga mos pop, whoosh, ding va swell effektlari
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Salom!'], ['l1', 'o‘rganamiz.'],
    ['l2', 'Har'], ['l2', 'shart.'],
    ['l3', 'Git'], ['l3', 'daraja.'],
    ['l4', 'Bunda'], ['l4', 'yengadi.'],
    ['l5', 'Keling,'], ['l5', 'yoziladi.'],
    ['l6', 'Gitning'], ['l6', 'boshqariladi.'],
    ['l7', 'Standart'], ['l7', 'mumkin.'],
    ['l8', 'Konfig'], ['l8', 'qulay.'],
    ['l9', 'Git'], ['l9', 'ochiladi.'],
    ['l10', 'Shuningdek,'], ['l10', 'etadi.'],
    ['l11', 'Xulosa'], ['l11', 'qiladi.'],
    ['l12', 'Keyingi'], ['l12', 'rahmat!']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'shart.'), 'ding'); } catch (e) {}
  try { add(W('l3', 'daraja.'), 'whoosh'); } catch (e) {}
  try { add(W('l4', 'yengadi.'), 'ding'); } catch (e) {}
  try { add(W('l5', 'yoziladi.'), 'pop'); } catch (e) {}
  try { add(W('l6', 'boshqariladi.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'mumkin.'), 'ding'); } catch (e) {}
  try { add(W('l8', 'qulay.'), 'whoosh'); } catch (e) {}
  try { add(W('l9', 'ochiladi.'), 'ding'); } catch (e) {}
  try { add(W('l10', 'etadi.'), 'pop'); } catch (e) {}
  try { add(W('l11', 'qiladi.'), 'ding'); } catch (e) {}
  add(L('l12').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
