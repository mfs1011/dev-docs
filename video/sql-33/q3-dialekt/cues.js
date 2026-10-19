// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['intro', 'Matn'], ['intro', 'relyatsion'], ['intro', 'farqlar'], ['intro', 'xato'],
   ['ulash', 'vertikal'], ['ulash', 'or'], ['ulash', 'nol'], ['ulash', 'konkat'], ['ulash', 'null'], ['ulash', 'dablyu-es'],
   ['uzunlik', 'lengs'], ['uzunlik', 'baytlarni'], ['uzunlik', 'char'], ['uzunlik', 'Es-kyu-layt'], ['uzunlik', 'apper'], ['uzunlik', 'aski'],
   ['kesish', 'split'], ['kesish', 'sabstring'], ['kesish', 'Es-kyu-layt'], ['kesish', 'sabstr'], ['kesish', 'el-ped'], ['kesish', 'printf'],
   ['regex', 'reg-eks'], ['regex', 'ji'], ['regex', 'sukutda'], ['regex', 'portativ'], ['regex', 'standart']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('intro', 'xato'), 'ding'); } catch (e) {}
  try { add(W('ulash', 'dablyu-es'), 'ding'); } catch (e) {}
  try { add(W('uzunlik', 'char'), 'ding'); } catch (e) {}
  try { add(W('kesish', 'printf'), 'ding'); } catch (e) {}
  try { add(W('regex', 'standart'), 'ding'); } catch (e) {}
  add(L('regex').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
