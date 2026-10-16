// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'farqlari'], ['L1', 'amaliy'],
   ['L2', 'oddiy'], ['L2', 'emojilarni'], ['L2', 'xato'],
   ['L3', 'to‘liq'], ['L3', 'kodlashini'],
   ['L4', 'katta-kichik'], ['L4', 'teng'],
   ['L5', 'elektron'], ['L5', 'rad'],
   ['L6', 'ichki'], ['L6', 'bayneri'],
   ['L7', 'faqat'], ['L7', 'o‘zgartira'],
   ['L8', 'tanlang'], ['L8', 'ilova'],
   ['L9', 'butunligi'], ['L9', 'asosidir']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L2', 'xato'), 'strike'); } catch (e) {}
  try { add(W('L4', 'teng'), 'ding'); } catch (e) {}
  try { add(W('L5', 'rad'), 'strike'); } catch (e) {}
  try { add(W('L7', 'o‘zgartira'), 'strike'); } catch (e) {}
  add(L('L9').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
