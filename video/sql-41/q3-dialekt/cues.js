// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'May'], ['l1', 'ikkilamchi'], ['l1', 'birlamchi'],
    ['l2', 'sababli'], ['l2', 'avtomatik'], ['l2', 'qoplovchi'],
    ['l3', 'To\'qson'], ['l3', 'rejalashtiruvchisi'], ['l3', 'xato'],
    ['l4', 'uch'], ['l4', 'sekinlashdi,'], ['l4', 'ignor'], ['l4', 'tezlikni'],
    ['l5', 'Es-kyu-laytda'], ['l5', 'skan'], ['l5', 'rou-ay-di'],
    ['l6', 'Indeks'], ['l6', 'yopishgani'], ['l6', 'not'],
    ['l7', 'Uchala'], ['l7', 'bi-tri'], ['l7', 'xatodir.'],
    ['l8', 'Ishlatilmaydigan'], ['l8', 'ekspleyn'], ['l8', 'amaliyotdir.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'qoplovchi'), 'ding'); } catch (e) {}
  try { add(W('l3', 'xato'), 'error'); } catch (e) {}
  try { add(W('l4', 'tezlikni'), 'ding'); } catch (e) {}
  try { add(W('l5', 'rou-ay-di'), 'whoosh'); } catch (e) {}
  try { add(W('l6', 'not'), 'ding'); } catch (e) {}
  try { add(W('l7', 'xatodir.'), 'error'); } catch (e) {}
  try { add(W('l8', 'amaliyotdir.'), 'ding'); } catch (e) {}
  add(L('l8').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
