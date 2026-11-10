// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Matnlar'], ['l1', 'layk'],
    ['l2', 'Chunki'], ['l2', 'grammatikasini'], ['l2', 'bi-tri'],
    ['l3', "To'liq"], ['l3', 'tokenlarga'], ['l3', 'leksemalarga'],
    ['l4', 'Hosil'], ['l4', 'teskari'],
    ['l5', 'Postgresda'], ['l5', 'simpl'],
    ['l6', "Qo'shimchalarni"], ['l6', 'yulduzcha'],
    ['l7', 'Imlo'], ['l7', 'trigramma'],
    ['l8', 'Trigramma'], ['l8', 'topiladi.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'olmaydi.'), 'error'); } catch (e) {}
  try { add(W('l3', 'aylantiradi.'), 'ding'); } catch (e) {}
  try { add(W('l4', 'saqlanadi.'), 'ding'); } catch (e) {}
  try { add(W('l5', 'ishlatiladi.'), 'whoosh'); } catch (e) {}
  try { add(W('l6', 'qidiriladi.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'trigramma'), 'pop'); } catch (e) {}
  try { add(W('l8', 'topiladi.'), 'ding'); } catch (e) {}
  add(L('l8').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
