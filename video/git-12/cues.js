// Ovoz effektlari: so'zlar va sahnaga mos pop, whoosh, ding va swell effektlari
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Salom!'], ['l1', 'o‘rganamiz.'],
    ['l2', 'Teg'], ['l2', 'harakatlanmaydi.'],
    ['l3', "Git'da"], ['l3', 'fayldir.'],
    ['l4', 'Annoteyted'], ['l4', 'biriktiriladi.'],
    ['l5', 'Standart'], ['l5', 'kerak.'],
    ['l6', 'Keraksiz'], ['l6', 'mumkin.'],
    ['l7', 'Git'], ['l7', 'ifodalaydi.'],
    ['l8', 'Teg'], ['l8', 'lozim.'],
    ['l9', 'Tez-tez'], ['l9', 'o‘rnatiladi.'],
    ['l10', 'Masalan,'], ['l10', 'tezlashtiradi.'],
    ['l11', 'Rasmiy'], ['l11', 'saqlaning.'],
    ['l12', 'O‘z'], ['l12', 'ishlang.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'harakatlanmaydi.'), 'ding'); } catch (e) {}
  try { add(W('l3', 'fayldir.'), 'whoosh'); } catch (e) {}
  try { add(W('l4', 'biriktiriladi.'), 'ding'); } catch (e) {}
  try { add(W('l5', 'kerak.'), 'pop'); } catch (e) {}
  try { add(W('l6', 'mumkin.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'ifodalaydi.'), 'whoosh'); } catch (e) {}
  try { add(W('l8', 'lozim.'), 'ding'); } catch (e) {}
  try { add(W('l9', 'o‘rnatiladi.'), 'pop'); } catch (e) {}
  try { add(W('l10', 'tezlashtiradi.'), 'ding'); } catch (e) {}
  try { add(W('l11', 'saqlaning.'), 'ding'); } catch (e) {}
  add(L('l12').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
