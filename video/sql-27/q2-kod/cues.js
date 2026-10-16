// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['intro', 'Postgres'], ['intro', 'guruhlar'],
   ['skalyar', 'skalyar'], ['skalyar', 'Vali'],
   ['skalyar_xato', 'xato'], ['skalyar_xato', 'null'],
   ['korrelyatsiya', 'korrelyatsiyalangan'], ['korrelyatsiya', 'yetakchi'],
   ['exists_in', 'egzists'], ['exists_in', 'in'],
   ['not_in_trap', 'xato'], ['not_in_trap', 'null'], ['not_in_trap', 'egzists'],
   ['any_all', 'Oll'], ['any_all', 'eni'],
   ['derived_update', 'hosila'], ['derived_update', 'apdeyt']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('skalyar', 'Vali'), 'ding'); } catch (e) {}
  try { add(W('skalyar_xato', 'xato'), 'strike'); } catch (e) {}
  try { add(W('korrelyatsiya', 'korrelyatsiyalangan'), 'ding'); } catch (e) {}
  try { add(W('not_in_trap', 'xato'), 'strike'); } catch (e) {}
  try { add(W('not_in_trap', 'egzists'), 'ding'); } catch (e) {}
  try { add(W('derived_update', 'hosila'), 'ding'); } catch (e) {}
  add(L('derived_update').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
