// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'es-kyu-el'], ['L1', 'beshinchi'], ['L2', 'klaster'], ['L2', 'alohida'],
   ['L3', 'bitta'], ['L4', 'sxemalarga'],
   ['L5', 'shablon'], ['L5', 'templeyt'], ['L6', 'avtomatik'], ['L7', 'templeyt'],
   ['L8', 'ulanmagan'], ['L9', 'sxema'], ['L11', 'ombor'], ['L11', 'savdo'],
   ['L12', 'birlashtirib'], ['L13', 'sörch'], ['L14', 'ketma-ket'],
   ['L15', 'pablik'], ['L16', 'yovuz'], ['L16', 'bekor'],
   ['L17', 'xulosa'], ['L18', 'keyingi']
  ].forEach(([l, w]) => add(W(l, w), 'pop'));

  add(W('L3', 'eng'), 'strike');
  add(W('L6', 'paydo'), 'ding');
  add(W('L8', 'diqqat'), 'strike');
  add(W('L15', 'jiddiy'), 'strike');
  add(W('L16', 'bekor'), 'ding');
  add(W('L17', 'demak'), 'swell');
  add(L('L18').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
