// Ovoz effektlari: so'zlar va sahnaga mos pop, whoosh, ding va swell effektlari
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Salom!'], ['l1', 'kommit.'],
    ['l2', 'Ushbu'], ['l2', 'qiladi.'],
    ['l3', 'Git'], ['l3', 'beradi.'],
    ['l4', 'U'], ['l4', 'etadi.'],
    ['l5', 'Git'], ['l5', 'tayyorlashdir.'],
    ['l6', 'U'], ['l6', 'kiritadi.'],
    ['l7', 'Git'], ['l7', 'yaratadi.'],
    ['l8', 'Har'], ['l8', 'yoziladi.'],
    ['l9', 'Fayllar'], ['l9', 'o‘tadi.'],
    ['l10', 'Tahrirlanganda'], ['l10', 'boraveradi.'],
    ['l11', 'Xulosa'], ['l11', 'qurollaridir.'],
    ['l12', 'Keyingi'], ['l12', 'Rahmat!']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'qiladi.'), 'ding'); } catch (e) {}
  try { add(W('l3', 'beradi.'), 'whoosh'); } catch (e) {}
  try { add(W('l4', 'etadi.'), 'pop'); } catch (e) {}
  try { add(W('l5', 'tayyorlashdir.'), 'pop'); } catch (e) {}
  try { add(W('l6', 'kiritadi.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'yaratadi.'), 'whoosh'); } catch (e) {}
  try { add(W('l8', 'yoziladi.'), 'ding'); } catch (e) {}
  try { add(W('l9', 'o‘tadi.'), 'pop'); } catch (e) {}
  try { add(W('l10', 'boraveradi.'), 'ding'); } catch (e) {}
  try { add(W('l11', 'qurollaridir.'), 'ding'); } catch (e) {}
  add(L('l12').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
