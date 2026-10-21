// Ovoz effektlari: so'zlar va sahnaga mos pop, whoosh, ding va swell effektlari
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Salom!'], ['l1', 'o‘rganamiz.'],
    ['l2', 'Git'], ['l2', 'qiladi.'],
    ['l3', 'Birinchi'], ['l3', 'lozim.'],
    ['l4', 'Git'], ['l4', 'to‘xtatadi.'],
    ['l5', 'Ikkinchi'], ['l5', 'etilmaydi.'],
    ['l6', 'Git'], ['l6', 'mumkin.'],
    ['l7', 'Uchinchi'], ['l7', 'shart.'],
    ['l8', 'Tanada'], ['l8', 'tushuntiriladi.'],
    ['l9', 'Xabar'], ['l9', 'etadi.'],
    ['l10', 'Konvenshnal'], ['l10', 'osonlashtiradi.'],
    ['l11', 'Kommitdan'], ['l11', 'garovidir.'],
    ['l12', 'Keyingi'], ['l12', 'Rahmat!']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'qiladi.'), 'ding'); } catch (e) {}
  try { add(W('l3', 'lozim.'), 'whoosh'); } catch (e) {}
  try { add(W('l4', 'to‘xtatadi.'), 'ding'); } catch (e) {}
  try { add(W('l5', 'etilmaydi.'), 'pop'); } catch (e) {}
  try { add(W('l6', 'mumkin.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'shart.'), 'whoosh'); } catch (e) {}
  try { add(W('l8', 'tushuntiriladi.'), 'ding'); } catch (e) {}
  try { add(W('l9', 'etadi.'), 'pop'); } catch (e) {}
  try { add(W('l10', 'osonlashtiradi.'), 'ding'); } catch (e) {}
  try { add(W('l11', 'garovidir.'), 'ding'); } catch (e) {}
  add(L('l12').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
