// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Standart'], ['l1', 'tanlov'],
    ['l2', 'Ammo'], ['l2', 'kesishuvi'],
    ['l3', 'Bunday'], ['l3', 'bajaradi.'],
    ['l4', 'GiST'], ['l4', 'infratuzilmadir.'],
    ['l5', 'GIN'], ['l5', 'oladi.'],
    ['l6', 'Natijada,'], ['l6', 'topiladi.'],
    ['l7', 'BRIN'], ['l7', 'yechimdir.'],
    ['l8', 'Aynan'], ['l8', 'oladi.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l3', 'bajaradi.'), 'ding'); } catch (e) {}
  try { add(W('l4', 'infratuzilmadir.'), 'whoosh'); } catch (e) {}
  try { add(W('l5', 'GIN'), 'whoosh'); } catch (e) {}
  try { add(W('l6', 'topiladi.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'BRIN'), 'whoosh'); } catch (e) {}
  try { add(W('l8', 'oladi.'), 'ding'); } catch (e) {}
  add(L('l8').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
