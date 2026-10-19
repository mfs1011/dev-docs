// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['intro', 'Odamlar'], ['intro', 'null'], ['intro', 'konkat'], ['intro', 'dablyu-es'],
   ['uzunlik', 'Oʻgʻiloy'], ['uzunlik', 'tutuq'], ['uzunlik', 'baytni'], ['uzunlik', 'trim'], ['uzunlik', 'kichik'],
   ['kesish', 'Sabstring'], ['kesish', 'left'], ['kesish', 'split'], ['kesish', 'domenini'],
   ['lpad', 'el-ped'], ['lpad', 'besh'], ['lpad', 'nollar'],
   ['regex', 'Reg-eks'], ['regex', 'telefon'], ['regex', 'raqamlar']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('intro', 'toza'), 'ding'); } catch (e) {}
  try { add(W('uzunlik', 'baytni'), 'ding'); } catch (e) {}
  try { add(W('kesish', 'domenini'), 'ding'); } catch (e) {}
  try { add(W('lpad', 'to\'ldiramiz.'), 'ding'); } catch (e) {}
  try { add(W('regex', 'raqamlar'), 'ding'); } catch (e) {}
  add(L('regex').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
