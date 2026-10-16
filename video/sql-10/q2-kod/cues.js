// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'terminalida'], ['L1', 'nul'],
   ['L2', 'barobar'], ['L2', 'tekshiramiz'],
   ['L3', 'distinkt'], ['L3', 'tru'],
   ['L4', 'telefonlar'], ['L4', 'kiritamiz'],
   ['L5', 'farq'], ['L5', 'ro‘yxatga'],
   ['L6', 'distinkt'], ['L6', 'topiladi'],
   ['L7', 'kaunt'], ['L7', 'kirmaydi'],
   ['L8', 'konkat'], ['L8', 'ulaydi'],
   ['L9', 'int'], ['L9', 'qo‘shiladi'],
   ['L10', 'xato'], ['L10', 'kutilgan'],
   ['L11', 'operator'], ['L11', 'chiqaradi'],
   ['L12', 'kast'], ['L12', 'shart']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L3', 'tru'), 'ding'); } catch (e) {}
  try { add(W('L6', 'topiladi'), 'ding'); } catch (e) {}
  try { add(W('L5', 'ro‘yxatga'), 'strike'); } catch (e) {}
  try { add(W('L10', 'xato'), 'strike'); } catch (e) {}
  try { add(W('L11', 'chiqaradi'), 'strike'); } catch (e) {}
  add(L('L12').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
