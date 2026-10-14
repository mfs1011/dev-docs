// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.4, 'scribble'));
  [['L2', 'postgres'], ['L2', 'may'], ['L2', 'es-kyu-layt'], ['L5', 'qator'], ['L6', 'ustun'], ['L9', 'tashqi'], ['L10', 'baza'], ['L10', 'jadval'], ['L13', 'togridan-togri'], ['L13', 'kod'], ['L13', 'o-er-em'], ['L19', 'kengaytma'], ['L19', 'farq'], ['L20', 'postgres'], ['L20', 'may'], ['L21', 'es-kyu-layt']].forEach(([l, w]) => add(W(l, w), 'pop'));
  add(W('L7', 'birlamchi'), 'ding');
  add(W('L8', 'nol'), 'strike'); add(W('L11', 'qatorlar') + 0.3, 'whoosh'); add(W('L11', 'qatorlar') + 1.6, 'whoosh'); add(W('L11', 'qatorlar') + 2.9, 'whoosh');
  add(W('L4', 'emas'), 'error'); add(W('L16', 'kamida'), 'ding'); add(W('L16', 'hech'), 'error');
  add(L('L22').e + 0.3, 'swell');
  cues.sort((a, b) => a.t - b.t); g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
