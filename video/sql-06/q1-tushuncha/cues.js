// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'barcha'], ['L2', 'butun'], ['L2', 'aniq'], ['L2', 'taqribiy'],
   ['L3', 'smol-int'], ['L3', 'intijer'], ['L3', 'big-int'],
   ['L4', 'intijer'], ['L4', 'big-int'], ['L4', 'oraliq'],
   ['L5', 'nyumerik'], ['L5', 'pul'],
   ['L6', 'prezishn'], ['L6', 'skeyl'],
   ['L7', 'yaxlitlanadi'], ['L7', 'xato'],
   ['L8', 'mutlaq'],
   ['L9', 'rial'], ['L9', 'dabl'], ['L10', 'ikkilik'],
   ['L11', 'to‘rt'], ['L12', 'xavfli'],
   ['L13', 'mani'], ['L14', 'lokaliga'], ['L15', 'kesib'],
   ['L16', 'intijer'], ['L16', 'nyumerik'], ['L16', 'dabl']
  ].forEach(([l, w]) => add(W(l, w), 'pop'));

  add(W('L7', 'xato'), 'strike');
  add(W('L11', 'to‘rt'), 'ding');
  add(W('L12', 'xavfli'), 'strike');
  add(W('L15', 'kesib'), 'strike');
  add(W('L16', 'nyumerik'), 'swell');
  add(L('L17').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
