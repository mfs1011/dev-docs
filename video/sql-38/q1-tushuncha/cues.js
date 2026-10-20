// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Normalizatsiya'], ['l1', 'jadvallarga'],
    ['l2', 'fakt'], ['l2', 'saqlanishi'],
    ['l3', 'tekis'], ['l3', 'anomaliyalarini'],
    ['l4', 'manzil'], ['l4', 'bekor'], ['l4', 'yo\'qolishi'],
    ['l5', 'modelda'], ['l5', 'alohida'], ['l5', 'bog\'lanadi'],
    ['l6', 'joyn'], ['l6', 'yaxlitligi'],
    ['l7', 'massiv'], ['l7', 'jeyson'], ['l7', 'noto\'g\'ri'],
    ['l8', 'filtrlash'], ['l8', 'jadval'],
    ['l9', 'Denormalizatsiya'], ['l9', 'tezlik'],
    ['l10', 'uchinchi'], ['l10', 'arxitektura']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l1', 'Normalizatsiya'), 'ding'); } catch (e) {}
  try { add(W('l3', 'anomaliyalarini'), 'error'); } catch (e) {}
  try { add(W('l4', 'yo\'qolishi'), 'strike'); } catch (e) {}
  try { add(W('l5', 'bog\'lanadi'), 'ding'); } catch (e) {}
  try { add(W('l6', 'yaxlitligi'), 'ding'); } catch (e) {}
  try { add(W('l7', 'noto\'g\'ri'), 'strike'); } catch (e) {}
  try { add(W('l8', 'jadval'), 'blip'); } catch (e) {}
  try { add(W('l10', 'arxitektura'), 'ding'); } catch (e) {}
  add(L('l10').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
