// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.4, 'scribble'));
  [['L1', 'postgres'], ['L1', 'may'], ['L1', 'es-kyu-layt'], ['L3', 'pe-ge'], ['L6', 'proses-list'], ['L7', 'performans'], ['L8', 'storidj'], ['L10', 'es-kyu-layt'], ['L11', 'selekt'], ['L12', 'dokon'], ['L14', 'se-pe']].forEach(([l, w]) => add(W(l, w), 'pop'));
  add(W('L4', 'har'), 'ding');
  add(W('L9', 'inno-di-bi'), 'ding');
  add(W('L13', 'format'), 'ding');
  add(L('L15').e + 0.3, 'swell');
  cues.sort((a, b) => a.t - b.t); g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
