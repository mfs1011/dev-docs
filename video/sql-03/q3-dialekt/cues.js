// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'postgres'], ['L1', 'may'], ['L1', 'es-kyu-layt'], ['L1', 'oltita'],
   ['L2', 'pi-es-kyu-el'], ['L3', 'katta'], ['L4', 'nuqta'],
   ['L5', 'birinchi'], ['L5', 'trust'], ['L5', 'skram'],
   ['L6', 'ikkinchi'], ['L6', 'parolni'],
   ['L8', 'uchinchi'], ['L8', 'ch-mod'],
   ['L9', 'to‘rtinchi'], ['L9', 'lokal-xost'],
   ['L11', 'beshinchi'], ['L11', 'minus-minus'],
   ['L12', 'oltinchi'], ['L13', 'nuqta'],
   ['L15', 'keyingi'], ['L15', 'to‘rtinchi']
  ].forEach(([l, w]) => add(W(l, w), 'pop'));

  add(W('L5', 'trust'), 'strike');
  add(W('L5', 'skram'), 'ding');
  add(W('L6', 'parolni'), 'strike');
  add(W('L8', 'ch-mod'), 'ding');
  add(W('L9', 'lokal-xost'), 'strike');
  add(W('L11', 'minus-minus'), 'ding');
  add(W('L13', 'natijada'), 'strike');
  add(W('L14', 'shunday'), 'swell');
  add(L('L15').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
