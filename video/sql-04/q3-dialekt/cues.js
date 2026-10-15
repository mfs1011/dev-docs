// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'postgres'], ['L1', 'may'], ['L1', 'es-kyu-layt'],
   ['L2', 'bektik'], ['L3', 'kvadrat'], ['L4', 'lower'], ['L5', 'linuks'],
   ['L6', 'oltmish'], ['L6', 'bir'], ['L7', 'teskari'], ['L8', 'yangi'],
   ['L9', 'binar'], ['L10', 'ustun'], ['L11', 'probel'], ['L12', 'iks-or'],
   ['L14', 'birinchi'], ['L15', 'ikkinchi'], ['L16', 'uchinchi'],
   ['L17', 'to‘rtinchi'], ['L18', 'beshinchi'],
   ['L19', 'yakunladik'], ['L20', 'beshinchi']
  ].forEach(([l, w]) => add(W(l, w), 'pop'));

  add(W('L5', 'falokat'), 'strike');
  add(W('L6', 'xatosini'), 'strike');
  add(W('L11', 'shart'), 'ding');
  add(W('L12', 'iks-or'), 'ding');
  add(W('L13', 'oltita'), 'strike');
  add(W('L19', 'asraydi'), 'swell');
  add(L('L20').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
