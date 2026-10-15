// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'postgres'], ['L1', 'pi-es-kyu-el'], ['L2', 'pi-ji'],
   ['L3', 'templeyt'], ['L4', 'dokon'], ['L5', 'dokon'],
   ['L6', 'talabalar'], ['L7', 'bitta'], ['L8', 'sörch'],
   ['L9', 'ombor'], ['L9', 'savdo'], ['L10', 'prefikssiz'],
   ['L11', 'savdo'], ['L12', 'ombor'], ['L13', 'nom'],
   ['L15', 'yangi'], ['L16', 'kaskad'], ['L18', 'jonli'],
   ['L19', 'may']
  ].forEach(([l, w]) => add(W(l, w), 'pop'));

  add(W('L3', 'taqiqlangan'), 'strike');
  add(W('L4', 'xato'), 'strike');
  add(W('L7', 'xato'), 'strike');
  add(W('L10', 'xato'), 'strike');
  add(W('L13', 'qaytaradi'), 'ding');
  add(W('L16', 'kaskad'), 'ding');
  add(W('L18', 'to‘liq'), 'swell');
  add(L('L19').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
