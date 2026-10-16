// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'Postgres'], ['L1', 'kolumn,'], ['L1', 'tayp'], ['L1', 'kaskad'], ['L1', 'trankeyt'],
   ['L2', 'chek'], ['L2', 'tavsif'], ['L2', 'soni'], ['L2', 'xavfsiz'],
   ['L3', 'Narx'], ['L3', 'nyumerik'], ['L3', 'xatosi'], ['L3', 'yuzing'],
   ['L4', 'Tashqi'], ['L4', 'drop'], ['L4', 'kaskad'], ['L4', 'cheklov'],
   ['L5', 'trankeyt'], ['L5', 'xato'], ['L5', 'rolbek'],
   ['L6', 'di-di-el'], ['L6', 'xavfsiz'], ['L6', 'migratsiyalarni']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'chek'), 'ding'); } catch (e) {}
  try { add(W('L3', 'xatosi'), 'error'); } catch (e) {}
  try { add(W('L3', 'yuzing'), 'ding'); } catch (e) {}
  try { add(W('L4', 'kaskad'), 'strike'); } catch (e) {}
  try { add(W('L5', 'xato'), 'error'); } catch (e) {}
  try { add(W('L5', 'rolbek'), 'ding'); } catch (e) {}
  add(L('L6').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
