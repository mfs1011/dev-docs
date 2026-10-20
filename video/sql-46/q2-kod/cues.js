// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Postgresda'], ['l1', 'beradi.'],
    ['l2', 'Yuz'], ['l2', 'qayd'],
    ['l3', 'Ammo'], ['l3', 'chiqadi.'],
    ['l4', 'Bu'], ['l4', 'kiritiladi.'],
    ['l5', 'Natijada'], ['l5', 'yetadi.'],
    ['l6', 'Jadvalga'], ['l6', 'mumkin.'],
    ['l7', 'Va'], ['l7', 'mumkin.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'qayd'), 'ding'); } catch (e) {}
  try { add(W('l3', 'chiqadi.'), 'error'); } catch (e) {}
  try { add(W('l4', 'kiritiladi.'), 'whoosh'); } catch (e) {}
  try { add(W('l5', 'yetadi.'), 'ding'); } catch (e) {}
  try { add(W('l6', 'mumkin.'), 'error'); } catch (e) {}
  try { add(W('l7', 'mumkin.'), 'ding'); } catch (e) {}
  add(L('l7').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
