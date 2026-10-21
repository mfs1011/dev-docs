// Ovoz effektlari: so'zlar va sahnaga mos pop, whoosh, ding va swell effektlari
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Salom!'], ['l1', 'o‘rganamiz.'],
    ['l2', 'Git'], ['l2', 'buyruqlari.'],
    ['l3', 'Odamlar'], ['l3', 'mumkin.'],
    ['l4', 'Avtomatlashtirilgan'], ['l4', 'qiladi.'],
    ['l5', 'Loyiha'], ['l5', 'nusxadir.'],
    ['l6', 'Uning'], ['l6', 'indeks.'],
    ['l7', 'Git'], ['l7', 'qo‘yadi.'],
    ['l8', 'Git'], ['l8', 'siljitadi.'],
    ['l9', 'Masalan,'], ['l9', 'beradi.'],
    ['l10', 'Ushbu'], ['l10', 'mumkin.'],
    ['l11', 'Plambing'], ['l11', 'hisoblanadi.'],
    ['l12', 'Keyingi'], ['l12', 'o‘rganamiz.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'buyruqlari.'), 'ding'); } catch (e) {}
  try { add(W('l3', 'mumkin.'), 'whoosh'); } catch (e) {}
  try { add(W('l4', 'qiladi.'), 'ding'); } catch (e) {}
  try { add(W('l5', 'nusxadir.'), 'pop'); } catch (e) {}
  try { add(W('l6', 'indeks.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'qo‘yadi.'), 'whoosh'); } catch (e) {}
  try { add(W('l8', 'siljitadi.'), 'ding'); } catch (e) {}
  try { add(W('l9', 'beradi.'), 'pop'); } catch (e) {}
  try { add(W('l10', 'mumkin.'), 'ding'); } catch (e) {}
  try { add(W('l11', 'hisoblanadi.'), 'ding'); } catch (e) {}
  add(L('l12').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
