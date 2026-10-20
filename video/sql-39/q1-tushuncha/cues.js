// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Birlamchi'], ['l1', 'tabiiy'], ['l1', 'sun\'iy'],
    ['l2', 'Email'], ['l2', 'xavfsizroq'],
    ['l3', 'Avtomatik'], ['l3', 'big-int'], ['l3', 'sakkiz'],
    ['l4', 'yu-yu-ay-di'], ['l4', 'generatsiya'],
    ['l5', 'Tasodifiy'], ['l5', 've-to\'rt'], ['l5', 'shishishiga'],
    ['l6', 'tartiblangan'], ['l6', 've-yetti'], ['l6', 'oshkor'],
    ['l7', 'inno-de-be'], ['l7', 'klasterli'],
    ['l8', 'ikkilamchi'], ['l8', 'shishiradi'],
    ['l9', 'Postgresda'], ['l9', 'Es-kyu-layt'], ['l9', 'rou-ay-di'],
    ['l10', 'tanlangan'], ['l10', 'kafolatlaydi']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l1', 'Birlamchi'), 'ding'); } catch (e) {}
  try { add(W('l2', 'xavfsizroq'), 'ding'); } catch (e) {}
  try { add(W('l5', 'shishishiga'), 'error'); } catch (e) {}
  try { add(W('l6', 've-yetti'), 'ding'); } catch (e) {}
  try { add(W('l7', 'klasterli'), 'whoosh'); } catch (e) {}
  try { add(W('l8', 'shishiradi'), 'strike'); } catch (e) {}
  try { add(W('l10', 'kafolatlaydi'), 'ding'); } catch (e) {}
  add(L('l10').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
