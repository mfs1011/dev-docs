// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['intro', 'keys'], ['intro', 'qimmat,'], ['intro', 'arzon'],
   ['null_tiplar', 'barobar'], ['null_tiplar', 'null'], ['null_tiplar', 'iz'], ['null_tiplar', 'tiplari'],
   ['coalesce', 'Koales'], ['coalesce', 'tavsifni'], ['coalesce', 'noldan'], ['coalesce', 'null'],
   ['nullif', 'Null-if'], ['nullif', 'satrni'], ['nullif', 'nolga'],
   ['greatest', 'Greytist'], ['greatest', 'liyst'], ['greatest', 'katta'], ['greatest', 'kichik']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('null_tiplar', 'buziladi,'), 'strike'); } catch (e) {}
  try { add(W('coalesce', 'tanlaymiz'), 'ding'); } catch (e) {}
  try { add(W('nullif', 'xavfsiz'), 'ding'); } catch (e) {}
  try { add(W('greatest', 'katta'), 'ding'); } catch (e) {}
  add(L('greatest').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
