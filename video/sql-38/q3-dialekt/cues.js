// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Normalizatsiya'], ['l1', 'poydevorga'],
    ['l2', 'yig\'ma'], ['l2', 'tekshirishda'],
    ['l3', 'May'], ['l3', 'uchinchi'], ['l3', 'vyu'],
    ['l4', 'Yig\'ma'], ['l4', 'triggerlar'],
    ['l5', 'Es-kyu-laytda'], ['l5', 'pragma'], ['l5', 'tekshirilmaydi'],
    ['l6', 'cheklovlarni'], ['l6', 'yaxlitlik'],
    ['l7', 'matritsa'], ['l7', 'boshqaruvini'],
    ['l8', 'Postgresda'], ['l8', 'vyu'], ['l8', 'sinxronlash'],
    ['l9', 'Mijoz'], ['l9', 'narx'], ['l9', 'oltin'],
    ['l10', 'normallashgan'], ['l10', 'denormalizatsiyani']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l3', 'vyu'), 'error'); } catch (e) {}
  try { add(W('l5', 'pragma'), 'blip'); } catch (e) {}
  try { add(W('l6', 'yaxlitlik'), 'ding'); } catch (e) {}
  try { add(W('l7', 'matritsa'), 'swell'); } catch (e) {}
  try { add(W('l8', 'vyu'), 'ding'); } catch (e) {}
  try { add(W('l9', 'oltin'), 'ding'); } catch (e) {}
  try { add(W('l10', 'normallashgan'), 'ding'); } catch (e) {}
  add(L('l10').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
