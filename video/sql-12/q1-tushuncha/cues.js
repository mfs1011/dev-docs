// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'yaratish'], ['L1', 'tizim'],
   ['L2', 'qat\'iy'], ['L2', 'tartibi'], ['L2', 'dublikat'],
   ['L3', 'nomi'], ['L3', 'ko‘plik'],
   ['L4', 'berilmasa'], ['L4', 'sukut'],
   ['L5', 'dinamik'], ['L5', 'yozilayotgan'],
   ['L6', 'yashirin'], ['L6', 'koordinatasi'], ['L6', 'tranzaksiya'],
   ['L7', 'o‘chib'], ['L7', 'jurnallashsiz'],
   ['L8', 'sxemani'], ['L8', 'martalik'],
   ['L9', 'loyihalash'], ['L9', 'garovidir']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'dublikat'), 'strike'); } catch (e) {}
  try { add(W('L5', 'yozilayotgan'), 'ding'); } catch (e) {}
  try { add(W('L6', 'tranzaksiya'), 'pop'); } catch (e) {}
  try { add(W('L7', 'jurnallashsiz'), 'ding'); } catch (e) {}
  add(L('L9').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
