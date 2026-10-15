// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'tuzoqni'],
   ['L2', 'standartlarga'],
   ['L3', 'datetime'], ['L3', 'timestamp'],
   ['L4', 'muammosi'],
   ['L5', 'xato'],
   ['L6', 'sintaktik'],
   ['L7', 'yaxlitlab'],
   ['L8', 'alohida'],
   ['L9', 'text'], ['L9', 'integer'],
   ['L10', 'funksiyalar'],
   ['L11', 'floor'],
   ['L12', 'xato'],
   ['L13', 'kichik'],
   ['L14', 'xavfsiz'],
   ['L15', 'formatida']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L4', 'muammosi'), 'ding'); } catch (e) {}
  try { add(W('L5', 'xato'), 'error'); } catch (e) {}
  try { add(W('L6', 'sintaktik'), 'strike'); } catch (e) {}
  try { add(W('L7', 'yaxlitlab'), 'error'); } catch (e) {}
  try { add(W('L11', 'floor'), 'ding'); } catch (e) {}
  try { add(W('L12', 'xato'), 'error'); } catch (e) {}
  try { add(W('L13', 'kichik'), 'strike'); } catch (e) {}
  add(L('L16').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
