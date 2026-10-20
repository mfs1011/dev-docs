// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Postgres'], ['l1', 'temporal'], ['l1', 'audit'],
    ['l2', 'temporal'], ['l2', 'emas,'],
    ['l3', 'ON'], ['l3', 'UPDATE'], ['l3', 'yangilaydi.'],
    ['l4', 'Es-kyu-laytda'], ['l4', 'cheksiz'], ['l4', 'WHEN'],
    ['l5', 'Davrlarni'], ['l5', 'yopiq'], ['l5', 'kesishish'],
    ['l6', 'Yumshoq'], ['l6', 'unikal'], ['l6', 'to\'sqinlik'],
    ['l7', 'yarim'], ['l7', 'ochiq'], ['l7', 'qisman'],
    ['l8', 'Tranzaksiyalar'], ['l8', 'audit'], ['l8', 'kafolatlaydi.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l1', 'audit'), 'ding'); } catch (e) {}
  try { add(W('l3', 'yangilaydi.'), 'ding'); } catch (e) {}
  try { add(W('l4', 'WHEN'), 'whoosh'); } catch (e) {}
  try { add(W('l5', 'kesishish'), 'error'); } catch (e) {}
  try { add(W('l6', 'to\'sqinlik'), 'strike'); } catch (e) {}
  try { add(W('l7', 'qisman'), 'ding'); } catch (e) {}
  try { add(W('l8', 'kafolatlaydi.'), 'ding'); } catch (e) {}
  add(L('l8').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
