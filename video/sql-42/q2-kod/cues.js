// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Ikki'], ['l1', 'rol'], ['l1', 'ishlatildi.'],
    ['l2', 'Lekin'], ['l2', 'uchdan'], ['l2', 'ketma-ket'],
    ['l3', 'So\'rovda'], ['l3', 'beshta'], ['l3', 'skip'],
    ['l4', 'Rolning'], ['l4', 'sakrab,'], ['l4', 'olindi.'],
    ['l5', 'Teskari'], ['l5', 'orqaga'], ['l5', 'bajarildi.'],
    ['l6', 'Aralash'], ['l6', 'disending'], ['l6', 'yo\'qoldi.'],
    ['l7', 'Or'], ['l7', 'alohida'], ['l7', 'bitmap'], ['l7', 'birlashtirildi.'],
    ['l8', 'Baza'], ['l8', 'xaritasini'], ['l8', 'qildi.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l1', 'ishlatildi.'), 'ding'); } catch (e) {}
  try { add(W('l2', 'ketma-ket'), 'whoosh'); } catch (e) {}
  try { add(W('l3', 'skip'), 'ding'); } catch (e) {}
  try { add(W('l4', 'olindi.'), 'ding'); } catch (e) {}
  try { add(W('l5', 'bajarildi.'), 'ding'); } catch (e) {}
  try { add(W('l6', 'yo\'qoldi.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'birlashtirildi.'), 'ding'); } catch (e) {}
  try { add(W('l8', 'qildi.'), 'ding'); } catch (e) {}
  add(L('l8').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
