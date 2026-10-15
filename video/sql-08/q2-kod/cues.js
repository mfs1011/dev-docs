// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'terminalida'],
   ['L2', 'timezone'],
   ['L3', 'timestamptz'],
   ['L4', 'tashlab'], ['L4', 'toshkent'],
   ['L5', 'mintaqasini'],
   ['L6', 'u-te-se'],
   ['L7', 'operatorini'],
   ['L8', 'timestamptz'],
   ['L9', 'interval'],
   ['L10', 'fevralda'],
   ['L11', 'yetti'],
   ['L12', 'yozgi'],
   ['L13', 'natijada'],
   ['L14', 'xato'],
   ['L15', 'datestyle'],
   ['L16', 'timezone']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L4', 'tashlab'), 'ding'); } catch (e) {}
  try { add(W('L10', 'fevralda'), 'pop'); } catch (e) {}
  try { add(W('L13', 'natijada'), 'swell'); } catch (e) {}
  try { add(W('L14', 'xato'), 'error'); } catch (e) {}
  try { add(W('L15', 'mutlaqo'), 'strike'); } catch (e) {}
  add(L('L17').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
