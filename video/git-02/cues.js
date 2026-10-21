// Ovoz effektlari: so'zlar va sahnaga mos pop, whoosh, ding va swell effektlari
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Salom!'], ['l1', 'o‘rganamiz.'],
    ['l2', 'Grafik'], ['l2', 'ishlaydi.'],
    ['l3', 'Terminalda'], ['l3', 'tekshirishingiz'],
    ['l4', 'Agar'], ['l4', 'qiladi.'],
    ['l5', 'Har'], ['l5', 'yo‘llari.'],
    ['l6', 'Har'], ['l6', 'bildiradi.'],
    ['l7', 'Katta'], ['l7', 'beradi.'],
    ['l8', 'Agar'], ['l8', 'beriladi.'],
    ['l9', 'Ikkita'], ['l9', 'oladi.'],
    ['l10', 'Yulduzcha'], ['l10', 'qo‘yadi.'],
    ['l11', 'Xulosa'], ['l11', 'garovidir.'],
    ['l12', 'Keyingi'], ['l12', 'rahmat!']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'ishlaydi.'), 'whoosh'); } catch (e) {}
  try { add(W('l3', 'tekshirishingiz'), 'ding'); } catch (e) {}
  try { add(W('l4', 'qiladi.'), 'pop'); } catch (e) {}
  try { add(W('l5', 'yo‘llari.'), 'whoosh'); } catch (e) {}
  try { add(W('l6', 'bildiradi.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'beradi.'), 'pop'); } catch (e) {}
  try { add(W('l8', 'beriladi.'), 'ding'); } catch (e) {}
  try { add(W('l9', 'oladi.'), 'whoosh'); } catch (e) {}
  try { add(W('l10', 'qo‘yadi.'), 'ding'); } catch (e) {}
  try { add(W('l11', 'garovidir.'), 'ding'); } catch (e) {}
  add(L('l12').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
