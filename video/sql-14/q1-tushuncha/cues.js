// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'yaxlitligini'], ['L1', 'cheklov'],
   ['L2', 'ifodani'], ['L2', 'chegirmadan'],
   ['L3', 'fols'], ['L3', 'alohida'],
   ['L4', 'bi-tri'], ['L4', 'ustunni'],
   ['L5', 'mavjud'], ['L5', 'himoyalaydi'],
   ['L6', 'kaskad'], ['L6', 'bo‘shatib'],
   ['L7', 'kechiktirishga'], ['L7', 'qo‘shildi'],
   ['L8', 'mustahkamligini'], ['L8', 'kafolatlang']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L3', 'fols'), 'strike'); } catch (e) {}
  try { add(W('L4', 'bi-tri'), 'ding'); } catch (e) {}
  try { add(W('L6', 'kaskad'), 'ding'); } catch (e) {}
  try { add(W('L7', 'kechiktirishga'), 'ding'); } catch (e) {}
  add(L('L8').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
