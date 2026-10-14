// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.4, 'scribble'));
  [['L1', 'asosiy'], ['L1', 'taqqoslaymiz'], ['L1', 'reliz'], ['L2', 'postgres'], ['L8', 'postgres'], ['L9', 'may'], ['L10', 'es-kyu-layt'], ['L11', 'es-kyu-laytni'], ['L12', 'tarmoq'], ['L13', 'postgres'], ['L14', 'may'], ['L15', 'ishlab']].forEach(([l, w]) => add(W(l, w), 'pop'));
  add(W('L8', 'besh'), 'ding');
  add(W('L9', 'el-te-es'), 'ding');
  add(W('L10', 'ikki'), 'ding');
  add(W('L11', 'oyinchoq'), 'error');
  add(W('L12', 'buzilishi'), 'error');
  add(L('L16').e + 0.3, 'swell');
  cues.sort((a, b) => a.t - b.t); g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
