// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'postgres'], ['L1', 'psql'],
   ['L2', 'nol'], ['L3', 'nyumerik'], ['L3', 'mutlaq'],
   ['L4', 'flout'], ['L4', 'oxirida'], ['L4', 'yolg‘on'], ['L4', 'rost'],
   ['L5', 'smol-int'], ['L5', 'xatosi'],
   ['L6', 'intijer'], ['L6', 'xato'],
   ['L7', 'big-int'],
   ['L8', 'besh'], ['L8', 'yaxlitlanadi'],
   ['L9', 'sig‘adi'], ['L10', 'xato'],
   ['L11', 'o‘nni'], ['L11', 'ikki'],
   ['L12', 'kasr'], ['L13', 'qoldiqni'],
   ['L14', 'raund'], ['L15', 'uch'], ['L15', 'juft'],
   ['L16', 'cheksizlik'], ['L16', 'manfiy'],
   ['L17', 'xotirani'], ['L18', 'may'], ['L18', 'es-kyu-layt']
  ].forEach(([l, w]) => add(W(l, w), 'pop'));

  add(W('L4', 'yolg‘on'), 'strike');
  add(W('L4', 'rost'), 'ding');
  add(W('L5', 'xatosi'), 'strike');
  add(W('L6', 'xato'), 'strike');
  add(W('L7', 'big-int'), 'ding');
  add(W('L10', 'xato'), 'strike');
  add(W('L11', 'ikki'), 'ding');
  add(W('L17', 'xotirani'), 'swell');
  add(L('L18').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
