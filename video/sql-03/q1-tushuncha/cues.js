// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));
  
  // So'z bog'lanishlari
  [['L1', 'es-kyu-el'], ['L1', 'uchinchi'], ['L2', 'host'], ['L2', 'port'], ['L2', 'foydalanuvchi'], ['L2', 'baza'],
   ['L3', 'postgres'], ['L3', 'may'], ['L4', 'parol'],
   ['L5', 'yuniks'], ['L6', 'ti-si-pi'], ['L7', 'lokal-xost'], ['L8', 'es-kyu-layt'],
   ['L9', 'init-di-bi'], ['L10', 'trust'], ['L11', 'skram'], ['L12', 'pi-ji-si-ti-el'],
   ['L13', 'may-es-kyu-el-di'], ['L14', 'minus-minus'], ['L15', 'alter'],
   ['L17', 'pi-es-kyu-el'], ['L17', 'may'], ['L17', 'es-kyu-layt']
  ].forEach(([l, w]) => add(W(l, w), 'pop'));

  add(W('L10', 'diqqat'), 'strike');
  add(W('L11', 'xavfsiz'), 'ding');
  add(W('L14', 'tasodifiy'), 'ding');
  add(W('L16', 'demak'), 'swell');
  add(L('L17').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
