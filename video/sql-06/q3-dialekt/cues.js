// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'may'], ['L1', 'es-kyu-layt'], ['L1', 'oltita'],
   ['L2', 'tayni-int'], ['L2', 'ansaynd'],
   ['L3', 'qat‘iy'], ['L3', 'kesib'],
   ['L4', 'o‘nni'], ['L4', 'div'],
   ['L5', 'desimal'], ['L5', 'zerofil'],
   ['L6', 'es-kyu-layt'],
   ['L7', 'desimal'], ['L7', 'rial'],
   ['L8', 'chegarasidan'], ['L8', 'desimal'],
   ['L9', 'uchala'], ['L9', 'may'], ['L9', 'es-kyu-layt'],
   ['L10', 'nol'], ['L10', 'desimal'], ['L10', 'rial'],
   ['L11', 'xato'], ['L11', 'kesishi'], ['L11', 'qabul'],
   ['L12', 'oltita'],
   ['L13', 'birinchi'], ['L14', 'ikkinchi'],
   ['L15', 'uchinchi'], ['L16', 'to‘rtinchi'],
   ['L17', 'beshinchi'], ['L18', 'oltinchi'],
   ['L19', 'to‘liq'], ['L19', 'yettinchi']
  ].forEach(([l, w]) => add(W(l, w), 'pop'));

  add(W('L3', 'kesib'), 'strike');
  add(W('L4', 'div'), 'ding');
  add(W('L5', 'zerofil'), 'strike');
  add(W('L8', 'desimal'), 'ding');
  add(W('L11', 'xato'), 'strike');
  add(W('L12', 'oltita'), 'strike');
  add(W('L19', 'to‘liq'), 'swell');
  add(L('L19').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
