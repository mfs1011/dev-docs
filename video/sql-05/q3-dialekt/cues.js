// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'postgres'], ['L1', 'may'], ['L1', 'es-kyu-layt'],
   ['L2', 'sxema'], ['L3', 'ierarxiyasida'], ['L4', 'joyn'],
   ['L5', 'yuz'], ['L6', 'fayldir'], ['L7', 'attach'],
   ['L8', 'meyn'], ['L8', 'temp'], ['L9', 'uchala'],
   ['L10', 'cheklangan'], ['L11', 'templeyt'],
   ['L13', 'birinchi'], ['L14', 'ikkinchi'], ['L15', 'uchinchi'],
   ['L16', 'to‘rtinchi'], ['L17', 'beshinchi'], ['L18', 'oltinchi'],
   ['L19', 'to‘liq'], ['L20', 'oltinchi']
  ].forEach(([l, w]) => add(W(l, w), 'pop'));

  add(W('L4', 'joyn'), 'ding');
  add(W('L5', 'xatosi'), 'strike');
  add(W('L12', 'oltita'), 'strike');
  add(W('L16', 'xavfli'), 'strike');
  add(W('L19', 'to‘liq'), 'swell');
  add(L('L20').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
