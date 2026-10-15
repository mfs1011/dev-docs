// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'terminalida'],
   ['L2', 'hajmi'],
   ['L3', 'vazifalar'],
   ['L4', 'xato'],
   ['L5', 'bajarildi'],
   ['L6', 'null'],
   ['L7', 'shartidan'],
   ['L8', 'uuidv7'],
   ['L9', 'vaqtni'],
   ['L10', 'qirq'], ['L10', 'olti'],
   ['L11', 'holatlarini'],
   ['L12', 'tartiblandi'], ['L12', 'rad'],
   ['L13', 'kengaydi'],
   ['L14', 'hushyor']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L4', 'xato'), 'error'); } catch (e) {}
  try { add(W('L6', 'null'), 'ding'); } catch (e) {}
  try { add(W('L7', 'shartidan'), 'swell'); } catch (e) {}
  try { add(W('L10', 'olti'), 'ding'); } catch (e) {}
  try { add(W('L12', 'rad'), 'strike'); } catch (e) {}
  add(L('L15').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
