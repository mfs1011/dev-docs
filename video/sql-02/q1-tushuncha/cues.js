// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.4, 'scribble'));
  [['L1', 'postgres'], ['L1', 'may'], ['L1', 'es-kyu-layt'], ['L3', 'postgres'], ['L4', 'es-kyu-layt'], ['L5', 'postgres'], ['L8', 'may'], ['L10', 'storidj'], ['L12', 'es-kyu-layt'], ['L17', 'birinchi'], ['L18', 'ikkinchi'], ['L19', 'uchinchi'], ['L20', 'es-kyu-layt']].forEach(([l, w]) => add(W(l, w), 'pop'));
  add(W('L11', 'inno-di-bi'), 'ding');
  add(W('L14', 'bitta'), 'strike');
  add(W('L7', 'boshqa'), 'whoosh');
  add(W('L20', 'qolgan'), 'ding');
  add(L('L21').e + 0.3, 'swell');
  cues.sort((a, b) => a.t - b.t); g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
