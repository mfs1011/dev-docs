// Ovoz effektlari: so'zlar va sahnaga mos pop, whoosh, ding va swell effektlari
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Salom!'], ['l1', 'o‘rganamiz.'],
    ['l2', 'Git'], ['l2', 'mavjud.'],
    ['l3', 'Agar'], ['l3', 'ishlatiladi.'],
    ['l4', 'Ushbu'], ['l4', 'birlashtiriladi.'],
    ['l5', 'Minus'], ['l5', 'qoladi.'],
    ['l6', 'Natijada'], ['l6', 'muddao.'],
    ['l7', 'Bir'], ['l7', 'tanlaydi.'],
    ['l8', 'Natijaviy'], ['l8', 'to‘xtatadi.'],
    ['l9', 'Xato'], ['l9', 'hisoblanadi.'],
    ['l10', 'Agar'], ['l10', 'qaytaramiz.'],
    ['l11', 'Shuningdek,'], ['l11', 'qutulamiz.'],
    ['l12', 'Keyingi'], ['l12', 'o‘zlashtiramiz.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'mavjud.'), 'ding'); } catch (e) {}
  try { add(W('l3', 'ishlatiladi.'), 'whoosh'); } catch (e) {}
  try { add(W('l4', 'birlashtiriladi.'), 'ding'); } catch (e) {}
  try { add(W('l5', 'qoladi.'), 'pop'); } catch (e) {}
  try { add(W('l6', 'muddao.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'tanlaydi.'), 'whoosh'); } catch (e) {}
  try { add(W('l8', 'to‘xtatadi.'), 'ding'); } catch (e) {}
  try { add(W('l9', 'hisoblanadi.'), 'pop'); } catch (e) {}
  try { add(W('l10', 'qaytaramiz.'), 'ding'); } catch (e) {}
  try { add(W('l11', 'qutulamiz.'), 'ding'); } catch (e) {}
  add(L('l12').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
