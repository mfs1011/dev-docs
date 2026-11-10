// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Postgresda'], ['l1', 'ti-es-vektor'],
    ['l2', 'Simpl'], ['l2', 'inglizcha'], ['l2', 'tashlanadi.'],
    ['l3', 'Ti-es-kveri'], ['l3', 'konteyner'], ['l3', 'qoladi.'],
    ['l4', "So'z"], ['l4', 'yulduzcha'], ['l4', 'topiladi.'],
    ['l5', 'Ti-es-rank'], ['l5', 'saralaydi.'],
    ['l6', 'Veb-syorch'], ['l6', 'qiladi.'],
    ['l7', 'Yuz'], ['l7', 'jin'], ['l7', 'ishlaydi.'],
    ['l8', 'Trigramma'], ['l8', 'beradi.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l1', 'boshlanadi.'), 'ding'); } catch (e) {}
  try { add(W('l2', 'tashlanadi.'), 'whoosh'); } catch (e) {}
  try { add(W('l3', 'qoladi.'), 'error'); } catch (e) {}
  try { add(W('l4', 'topiladi.'), 'ding'); } catch (e) {}
  try { add(W('l5', 'saralaydi.'), 'ding'); } catch (e) {}
  try { add(W('l6', 'qiladi.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'ishlaydi.'), 'ding'); } catch (e) {}
  try { add(W('l8', 'beradi.'), 'ding'); } catch (e) {}
  add(L('l8').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
