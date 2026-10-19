// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['intro', 'May'], ['intro', 'Es-kyu-layt'],
   ['mysql_tiplar', 'May'], ['mysql_tiplar', 'matn'],
   ['mysql_order', 'order'],
   ['sqlite_all', 'Es-kyu-layt'], ['sqlite_all', 'xatosi'],
   ['sqlite_precedence', 'intersekt'], ['sqlite_precedence', 'Postgres'],
   ['sqlite_subquery', 'limit'], ['sqlite_subquery', 'hosila'],
   ['sqlite_tiplar', 'tiplar']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('mysql_tiplar', 'May'), 'ding'); } catch (e) {}
  try { add(W('mysql_order', 'order'), 'ding'); } catch (e) {}
  try { add(W('sqlite_all', 'xatosi'), 'strike'); } catch (e) {}
  try { add(W('sqlite_precedence', 'intersekt'), 'ding'); } catch (e) {}
  try { add(W('sqlite_subquery', 'hosila'), 'ding'); } catch (e) {}
  add(L('sqlite_tiplar').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
