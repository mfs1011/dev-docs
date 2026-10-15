// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'matnli'], ['L1', 'binary'],
   ['L2', 'belgilar'], ['L2', 'xom'],
   ['L3', 'char'], ['L3', 'varcha'],
   ['L4', 'belgilar'], ['L4', 'probellar'],
   ['L5', 'xato'],
   ['L6', 'tekst'],
   ['L7', 'farqi'],
   ['L8', 'sekin'],
   ['L9', 'sarlavha'],
   ['L10', 'toust'],
   ['L11', 'tezligiga'],
   ['L12', 'baytea'], ['L12', 'blob'],
   ['L13', 'xatosini'],
   ['L14', 'heks'],
   ['L15', 'tekst'], ['L15', 'baytea']
  ].forEach(([l, w]) => add(W(l, w), 'pop'));

  add(W('L5', 'xato'), 'strike');
  add(W('L8', 'sekin'), 'error');
  add(W('L10', 'toust'), 'ding');
  add(W('L13', 'xatosini'), 'strike');
  add(W('L15', 'tekst'), 'swell');
  add(L('L16').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
