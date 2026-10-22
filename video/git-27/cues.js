// Ovoz effektlari: so'zlar va sahnaga mos pop, whoosh, ding va swell effektlari
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Salom!'], ['l1', 'o‘rganamiz.'],
    ['l2', 'Remote'], ['l2', 'hisoblanadi.'],
    ['l3', 'git'], ['l3', 'ko‘rsatadi.'],
    ['l4', 'Agar'], ['l4', 'mumkin.'],
    ['l5', 'git'], ['l5', 'tegmaydi.'],
    ['l6', 'Natijada'], ['l6', 'qilamiz.'],
    ['l7', 'git'], ['l7', 'o‘rnatadi.'],
    ['l8', 'Agar'], ['l8', 'etadi.'],
    ['l9', 'Tarix'], ['l9', 'teradi.'],
    ['l10', 'git'], ['l10', 'ishlaydi.'],
    ['l11', 'Ushbu'], ['l11', 'almashinadi.'],
    ['l12', 'Keyingi'], ['l12', 'o‘rganamiz.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'hisoblanadi.'), 'ding'); } catch (e) {}
  try { add(W('l3', 'ko‘rsatadi.'), 'whoosh'); } catch (e) {}
  try { add(W('l4', 'mumkin.'), 'ding'); } catch (e) {}
  try { add(W('l5', 'tegmaydi.'), 'pop'); } catch (e) {}
  try { add(W('l6', 'qilamiz.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'o‘rnatadi.'), 'whoosh'); } catch (e) {}
  try { add(W('l8', 'etadi.'), 'ding'); } catch (e) {}
  try { add(W('l9', 'teradi.'), 'pop'); } catch (e) {}
  try { add(W('l10', 'ishlaydi.'), 'ding'); } catch (e) {}
  try { add(W('l11', 'almashinadi.'), 'ding'); } catch (e) {}
  add(L('l12').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
