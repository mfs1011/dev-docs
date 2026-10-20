// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Postgres'], ['l1', 'vizaut'], ['l1', 'overleps'],
    ['l2', 'Bitta'], ['l2', 'eksklyud'], ['l2', 'xatolik'],
    ['l3', 'Aksiyalar'], ['l3', 'period'],
    ['l4', 'to\'liq'], ['l4', 'buziladi.'],
    ['l5', 'Xodimlar'], ['l5', 'universal'], ['l5', 'audit'],
    ['l6', 'yangilash'], ['l6', 'kim'], ['l6', 'auditga'],
    ['l7', 'Foydalanuvchilar'], ['l7', 'ochirilgan'], ['l7', 'yumshoq'],
    ['l8', 'faol'], ['l8', 'qisman'], ['l8', 'ruxsat']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l1', 'overleps'), 'ding'); } catch (e) {}
  try { add(W('l2', 'xatolik'), 'error'); } catch (e) {}
  try { add(W('l3', 'period'), 'whoosh'); } catch (e) {}
  try { add(W('l4', 'buziladi.'), 'error'); } catch (e) {}
  try { add(W('l5', 'audit'), 'ding'); } catch (e) {}
  try { add(W('l7', 'ochirilgan'), 'strike'); } catch (e) {}
  try { add(W('l8', 'ruxsat'), 'ding'); } catch (e) {}
  add(L('l8').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
