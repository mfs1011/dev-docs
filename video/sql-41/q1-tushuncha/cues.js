// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Indekssiz'], ['l1', 'oxirigacha'],
    ['l2', 'kitob'], ['l2', 'topish'],
    ['l3', 'bi-tri'], ['l3', 'tartiblangan'], ['l3', 'millionlab'],
    ['l4', 'tenglik,'], ['l4', 'oraliq'], ['l4', 'saralash'],
    ['l5', 'barcha'], ['l5', 'o\'zida'],
    ['l6', 'qoplovchi'], ['l6', 'minimal'],
    ['l7', 'Rejalashtiruvchi'], ['l7', 'tanlaydi.'],
    ['l8', 'katta'], ['l8', 'skanerlash'], ['l8', 'tezroq'],
    ['l9', 'sekinlashtiradi'], ['l9', 'oshiradi.'],
    ['l10', 'foydasizlarini'], ['l10', 'zarur.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'topish'), 'ding'); } catch (e) {}
  try { add(W('l3', 'bi-tri'), 'whoosh'); } catch (e) {}
  try { add(W('l4', 'saralash'), 'ding'); } catch (e) {}
  try { add(W('l6', 'qoplovchi'), 'ding'); } catch (e) {}
  try { add(W('l8', 'tezroq'), 'ding'); } catch (e) {}
  try { add(W('l9', 'sekinlashtiradi'), 'error'); } catch (e) {}
  try { add(W('l10', 'zarur.'), 'ding'); } catch (e) {}
  add(L('l10').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
