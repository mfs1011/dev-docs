// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['intro', 'May'], ['intro', 'Es-kyu-layt'],
   ['mysql_errors', 'May'], ['mysql_errors', 'xatosi'],
   ['mysql_limit', 'limit'], ['mysql_limit', 'hosila'],
   ['mysql_update', 'materializatsiya'],
   ['sqlite_any_all', 'Es-kyu-layt'], ['sqlite_any_all', 'maks'],
   ['sqlite_bare_scalar', 'etibor'], ['sqlite_bare_scalar', 'birinchi'],
   ['sqlite_kengaytma', 'kengaytmasi']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('mysql_errors', 'xatosi'), 'strike'); } catch (e) {}
  try { add(W('mysql_limit', 'limit'), 'strike'); } catch (e) {}
  try { add(W('mysql_update', 'materializatsiya'), 'ding'); } catch (e) {}
  try { add(W('sqlite_any_all', 'Es-kyu-layt'), 'ding'); } catch (e) {}
  try { add(W('sqlite_bare_scalar', 'birinchi'), 'ding'); } catch (e) {}
  add(L('sqlite_kengaytma').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
