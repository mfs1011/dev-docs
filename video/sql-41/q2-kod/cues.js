// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Yuz'], ['l1', 'indekssiz'], ['l1', 'sahifalarni'],
    ['l2', 'Bi-tri'], ['l2', 'qo\'shilgach'], ['l2', 'atigi'], ['l2', 'natija'],
    ['l3', 'Shartda'], ['l3', 'plyus'], ['l3', 'chetlab'],
    ['l4', 'Baza'], ['l4', 'skanerlash'],
    ['l5', 'Atigi'], ['l5', 'yangi'], ['l5', 'to\'g\'ridan-to\'g\'ri'],
    ['l6', 'To\'qson'], ['l6', 'yopilgan'], ['l6', 'ketma-ket'],
    ['l7', 'Uchta'], ['l7', 'yetmish'], ['l7', 'sekinlashtirdi'],
    ['l8', 'Statistika'], ['l8', 'nol'], ['l8', 'aniqlash']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'natija'), 'ding'); } catch (e) {}
  try { add(W('l3', 'chetlab'), 'error'); } catch (e) {}
  try { add(W('l4', 'skanerlash'), 'whoosh'); } catch (e) {}
  try { add(W('l5', 'to\'g\'ridan-to\'g\'ri'), 'ding'); } catch (e) {}
  try { add(W('l6', 'ketma-ket'), 'ding'); } catch (e) {}
  try { add(W('l7', 'sekinlashtirdi'), 'error'); } catch (e) {}
  try { add(W('l8', 'aniqlash'), 'ding'); } catch (e) {}
  add(L('l8').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
