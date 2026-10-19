// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['intro', 'si-ti-i'], ['intro', 'guruhlar'],
   ['zanjir', 'Zanjirli'], ['zanjir', 'Vali'], ['zanjir', 'Dilnozani'],
   ['ustunlar', 'guruh'], ['ustunlar', 'soni'],
   ['xatolar', 'xato'], ['xatolar', 'viz'], ['xatolar', 'taqiqlangan'],
   ['explain', 'EXPLAIN'], ['explain', 'materialayzd'],
   ['kochiruvchi', 'dilit'], ['kochiruvchi', 'rityorning'], ['kochiruvchi', 'arxiv']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('intro', 'si-ti-i'), 'ding'); } catch (e) {}
  try { add(W('zanjir', 'Dilnozani'), 'ding'); } catch (e) {}
  try { add(W('xatolar', 'xato'), 'strike'); } catch (e) {}
  try { add(W('explain', 'EXPLAIN'), 'ding'); } catch (e) {}
  try { add(W('kochiruvchi', 'rityorning'), 'ding'); } catch (e) {}
  add(L('kochiruvchi').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
