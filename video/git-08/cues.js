// Ovoz effektlari: so'zlar va sahnaga mos pop, whoosh, ding va swell effektlari
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Salom!'], ['l1', 'o‘rganamiz.'],
    ['l2', 'Ushbu'], ['l2', 'ta’minlaydi.'],
    ['l3', 'Nuqta'], ['l3', 'ro‘yxatidir.'],
    ['l4', 'Yulduzcha,'], ['l4', 'filtrlanadi.'],
    ['l5', 'Agar'], ['l5', 'beradi.'],
    ['l6', 'Shuningdek,'], ['l6', 'mumkin.'],
    ['l7', 'Git'], ['l7', 'tashlaydi.'],
    ['l8', 'Eng'], ['l8', 'beradi.'],
    ['l9', 'Git'], ['l9', 'bajaradi.'],
    ['l10', 'Aslida'], ['l10', 'birlashmasidir.'],
    ['l11', 'Xulosa'], ['l11', 'asosidir.'],
    ['l12', 'Keyingi'], ['l12', 'Rahmat!']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'ta’minlaydi.'), 'ding'); } catch (e) {}
  try { add(W('l3', 'ro‘yxatidir.'), 'whoosh'); } catch (e) {}
  try { add(W('l4', 'filtrlanadi.'), 'pop'); } catch (e) {}
  try { add(W('l5', 'beradi.'), 'pop'); } catch (e) {}
  try { add(W('l6', 'mumkin.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'tashlaydi.'), 'whoosh'); } catch (e) {}
  try { add(W('l8', 'beradi.'), 'ding'); } catch (e) {}
  try { add(W('l9', 'bajaradi.'), 'pop'); } catch (e) {}
  try { add(W('l10', 'birlashmasidir.'), 'ding'); } catch (e) {}
  try { add(W('l11', 'asosidir.'), 'ding'); } catch (e) {}
  add(L('l12').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
