// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['intro', 'May'], ['intro', 'Es-kyu-layt'], ['intro', 'si-ti-i'],
   ['mysql_insert', 'insert'], ['mysql_insert', 'apdeyt'], ['mysql_insert', "to'qson"],
   ['sqlite_mat', 'materialayzd'], ['sqlite_mat', 'maslahat'],
   ['sqlite_forward', 'oldinga'], ['sqlite_forward', 'xatosiz'],
   ['chegaralar', 'dilit'], ['chegaralar', 'apdeyt'], ['chegaralar', 'selekt']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('intro', 'si-ti-i'), 'ding'); } catch (e) {}
  try { add(W('mysql_insert', "to'qson"), 'strike'); } catch (e) {}
  try { add(W('sqlite_mat', 'materialayzd'), 'ding'); } catch (e) {}
  try { add(W('sqlite_forward', 'xatosiz'), 'ding'); } catch (e) {}
  try { add(W('chegaralar', 'selekt'), 'ding'); } catch (e) {}
  add(L('chegaralar').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
