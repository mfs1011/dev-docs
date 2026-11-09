// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Postgresda'], ['l1', "o'qiladi."],
    ['l2', 'Biroq'], ['l2', "cho'ziladi."],
    ['l3', 'Keyset'], ['l3', 'boshlaydi.'],
    ['l4', 'Natijada'], ['l4', 'yakunlanadi.'],
    ['l5', 'Agar'], ['l5', 'sarflaydi.'],
    ['l6', 'Shuning'], ['l6', 'lozim.'],
    ['l7', 'Jonli'], ['l7', "ko'rsatdi."],
    ['l8', 'Keyset'], ['l8', 'oldi.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l1', "o'qiladi."), 'ding'); } catch (e) {}
  try { add(W('l2', "cho'ziladi."), 'error'); } catch (e) {}
  try { add(W('l3', 'boshlaydi.'), 'ding'); } catch (e) {}
  try { add(W('l4', 'yakunlanadi.'), 'ding'); } catch (e) {}
  try { add(W('l5', 'sarflaydi.'), 'error'); } catch (e) {}
  try { add(W('l6', 'lozim.'), 'ding'); } catch (e) {}
  try { add(W('l7', "ko'rsatdi."), 'error'); } catch (e) {}
  try { add(W('l8', 'oldi.'), 'ding'); } catch (e) {}
  add(L('l8').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
