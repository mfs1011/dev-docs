// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'vaqt'],
   ['L2', 'to‘qqiz'], ['L2', 'lahzasidir'],
   ['L3', 'mahalliy'], ['L3', 'instant'],
   ['L4', 'u-te-se'], ['L4', 'toshkent'],
   ['L5', 'date'], ['L5', 'time'], ['L5', 'interval'],
   ['L6', 'date'], ['L6', 'mintaqasiz'],
   ['L7', 'tavsiya'],
   ['L8', 'timestamptz'], ['L8', 'saqlamaydi'],
   ['L9', 'u-te-se'], ['L9', 'saqlaydi'],
   ['L10', 'timezone'], ['L10', 'tashlab'],
   ['L11', 'iana'],
   ['L12', 'tashkent'],
   ['L13', 'interval'], ['L13', 'oylar'],
   ['L14', 'yozgi'],
   ['L15', 'turli'],
   ['L16', 'timestamptz'], ['L16', 'interval']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L7', 'tavsiya'), 'error'); } catch (e) {}
  try { add(W('L8', 'saqlamaydi'), 'strike'); } catch (e) {}
  try { add(W('L10', 'tashlab'), 'ding'); } catch (e) {}
  try { add(W('L15', 'turli'), 'swell'); } catch (e) {}
  add(L('L17').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
