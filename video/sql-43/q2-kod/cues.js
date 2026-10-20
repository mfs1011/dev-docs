// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Lover'], ['l1', 'to\'liq'],
    ['l2', 'Yunik'], ['l2', 'bloklab'], ['l2', 'xatolik'],
    ['l3', 'Oddiy'], ['l3', 'tekst'], ['l3', 'pattern'],
    ['l4', 'So\'rov'], ['l4', 'yakunlandi.'],
    ['l5', 'Atigi'], ['l5', 'qisman'], ['l5', 'yigirma'],
    ['l6', 'Yangi'], ['l6', 'bevosita'],
    ['l7', 'Inklud'], ['l7', 'onli'], ['l7', 'hip'],
    ['l8', 'Vakuum'], ['l8', 'nolga'], ['l8', 'erishildi.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l1', 'to\'liq'), 'ding'); } catch (e) {}
  try { add(W('l2', 'xatolik'), 'error'); } catch (e) {}
  try { add(W('l3', 'pattern'), 'whoosh'); } catch (e) {}
  try { add(W('l4', 'yakunlandi.'), 'ding'); } catch (e) {}
  try { add(W('l5', 'yigirma'), 'ding'); } catch (e) {}
  try { add(W('l6', 'bevosita'), 'ding'); } catch (e) {}
  try { add(W('l7', 'hip'), 'error'); } catch (e) {}
  try { add(W('l8', 'nolga'), 'ding'); } catch (e) {}
  add(L('l8').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
