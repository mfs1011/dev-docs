// Ovoz effektlari: so'zlar va sahnaga mos pop, whoosh, ding va swell effektlari
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Salom!'], ['l1', 'o‘rganamiz.'],
    ['l2', 'Xato'], ['l2', 'qo‘llaniladi.'],
    ['l3', 'Agar'], ['l3', 'beradi.'],
    ['l4', 'Muhim'], ['l4', 'zarur.'],
    ['l5', 'Keraksiz'], ['l5', 'oladi.'],
    ['l6', 'Bu'], ['l6', 'qoladi.'],
    ['l7', 'Agar'], ['l7', 'mumkin.'],
    ['l8', 'Biroq'], ['l8', 'olmaydi.'],
    ['l9', 'Eski'], ['l9', 'hisoblanardi.'],
    ['l10', 'Zamonaviy'], ['l10', 'almashtiradi.'],
    ['l11', 'Xulosa'], ['l11', 'bo‘ling.'],
    ['l12', 'Keyingi'], ['l12', 'Rahmat!']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'qo‘llaniladi.'), 'ding'); } catch (e) {}
  try { add(W('l3', 'beradi.'), 'whoosh'); } catch (e) {}
  try { add(W('l4', 'zarur.'), 'ding'); } catch (e) {}
  try { add(W('l5', 'oladi.'), 'pop'); } catch (e) {}
  try { add(W('l6', 'qoladi.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'mumkin.'), 'whoosh'); } catch (e) {}
  try { add(W('l8', 'olmaydi.'), 'pop'); } catch (e) {}
  try { add(W('l9', 'hisoblanardi.'), 'ding'); } catch (e) {}
  try { add(W('l10', 'almashtiradi.'), 'ding'); } catch (e) {}
  try { add(W('l11', 'bo‘ling.'), 'ding'); } catch (e) {}
  add(L('l12').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
