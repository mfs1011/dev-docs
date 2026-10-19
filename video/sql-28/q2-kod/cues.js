// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['intro', 'Postgres'], ['intro', 'jadvallaridan'],
   ['union_all', 'yunion'], ['union_all', 'oll'],
   ['intersect_except', 'intersekt'], ['intersect_except', 'eksept'],
   ['all_hisob', 'oll'], ['all_hisob', 'aniq'],
   ['ustuvorlik', 'ustunroq'], ['ustuvorlik', 'intersekt'],
   ['order_nom', 'order'], ['order_nom', 'xato'],
   ['xatolar', 'xato'], ['xatolar', 'null']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('union_all', 'yunion'), 'ding'); } catch (e) {}
  try { add(W('intersect_except', 'intersekt'), 'ding'); } catch (e) {}
  try { add(W('intersect_except', 'eksept'), 'ding'); } catch (e) {}
  try { add(W('all_hisob', 'oll'), 'ding'); } catch (e) {}
  try { add(W('ustuvorlik', 'intersekt'), 'ding'); } catch (e) {}
  try { add(W('order_nom', 'xato'), 'strike'); } catch (e) {}
  try { add(W('xatolar', 'xato'), 'strike'); } catch (e) {}
  add(L('xatolar').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
