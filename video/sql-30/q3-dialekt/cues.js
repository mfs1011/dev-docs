// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['intro', 'May'], ['intro', 'Es-kyu-layt'], ['intro', 'rekursiv'],
   ['mysql_syntax', 'valyuz'], ['mysql_syntax', 'rou'], ['mysql_syntax', 'saykl'], ['mysql_syntax', 'konkat'],
   ['mysql_tiplar', 'kast'], ['mysql_tiplar', 'mingta'],
   ['sqlite_queue', 'navbat'], ['sqlite_queue', 'order'], ['sqlite_queue', 'chuqurlik'],
   ['sqlite_ixtiyoriy', 'rekursiv'], ['sqlite_ixtiyoriy', 'standartga']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('intro', 'rekursiv'), 'ding'); } catch (e) {}
  try { add(W('mysql_syntax', 'valyuz'), 'ding'); } catch (e) {}
  try { add(W('mysql_tiplar', 'mingta'), 'strike'); } catch (e) {}
  try { add(W('sqlite_queue', 'navbat'), 'ding'); } catch (e) {}
  try { add(W('sqlite_ixtiyoriy', 'standartga'), 'ding'); } catch (e) {}
  add(L('sqlite_ixtiyoriy').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
