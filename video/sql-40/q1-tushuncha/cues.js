// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Ko\'plab'], ['l1', 'narxlar,'], ['l1', 'xodim'],
    ['l2', 'Eski'], ['l2', 'buzadi.'],
    ['l3', 'Postgres'], ['l3', 'vizaut'], ['l3', 'overleps'],
    ['l4', 'tenglik'], ['l4', 'eksklyud'],
    ['l5', 'Period'], ['l5', 'tashqi'], ['l5', 'to\'liq'],
    ['l6', 'aksiyasi'], ['l6', 'muddat'],
    ['l7', 'Audit'], ['l7', 'amallarini'],
    ['l8', 'Trigger'], ['l8', 'qayd'],
    ['l9', 'Yumshoq'], ['l9', 'o\'chirilgan'],
    ['l10', 'Qisman'], ['l10', 'faol'], ['l10', 'ta\'minlaydi.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'buzadi.'), 'error'); } catch (e) {}
  try { add(W('l3', 'vizaut'), 'ding'); } catch (e) {}
  try { add(W('l4', 'eksklyud'), 'strike'); } catch (e) {}
  try { add(W('l5', 'Period'), 'whoosh'); } catch (e) {}
  try { add(W('l7', 'Audit'), 'ding'); } catch (e) {}
  try { add(W('l8', 'qayd'), 'pop'); } catch (e) {}
  try { add(W('l9', 'o\'chirilgan'), 'strike'); } catch (e) {}
  try { add(W('l10', 'ta\'minlaydi.'), 'ding'); } catch (e) {}
  add(L('l10').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
