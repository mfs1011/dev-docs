// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'matn'],
   ['L2', 'tekst'],
   ['L3', 'char'],
   ['L4', 'to‘qqiz'], ['L4', 'xato'],
   ['L5', 'probellar'],
   ['L6', 'kast'],
   ['L7', 'rost'],
   ['L8', 'yolg‘on'],
   ['L9', 'oktet'],
   ['L10', 'tutuq'],
   ['L11', 'xatosini'],
   ['L12', 'baytea'], ['L12', 'heks'],
   ['L13', 'apper'],
   ['L14', 'chegarani'],
   ['L15', 'tuzoqni']
  ].forEach(([l, w]) => add(W(l, w), 'pop'));

  add(W('L4', 'xato'), 'strike');
  add(W('L7', 'rost'), 'ding');
  add(W('L8', 'yolg‘on'), 'error');
  add(W('L11', 'xatosini'), 'strike');
  add(W('L13', 'apper'), 'error');
  add(W('L14', 'chegarani'), 'swell');
  add(L('L15').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
