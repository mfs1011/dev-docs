// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['intro', 'Viz'], ['intro', 'rekursiv'], ['intro', 'si-ti-i'],
   ['tuzilish', 'boshlang\'ich'], ['tuzilish', 'yunon'], ['tuzilish', 'rekursiv'],
   ['algoritm', 'rekursiya'], ['algoritm', 'ishchi'], ['algoritm', 'jadval'],
   ['daraxt', 'daraxtlarni'], ['daraxt', 'graflarni'],
   ['tartib', 'kenglik'], ['tartib', 'chuqurlik'],
   ['aylana', 'aylana'], ['aylana', 'cheksiz'], ['aylana', 'to\'xtash']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('intro', 'rekursiv'), 'ding'); } catch (e) {}
  try { add(W('tuzilish', 'rekursiv'), 'ding'); } catch (e) {}
  try { add(W('algoritm', 'jadval'), 'ding'); } catch (e) {}
  try { add(W('aylana', 'cheksiz'), 'strike'); } catch (e) {}
  add(L('aylana').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
