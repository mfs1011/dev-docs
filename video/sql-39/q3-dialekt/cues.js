// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Postgresda'], ['l1', 'inno-de-be'], ['l1', 'klasterli'],
    ['l2', 'Es-kyu-layt'], ['l2', 'rou-ay-di'], ['l2', 'vizaut'],
    ['l3', 'Postgresda'], ['l3', 've-yetti'], ['l3', 'IDENTITY'],
    ['l4', 'binar'], ['l4', 'inkrement'],
    ['l5', 'matnli'], ['l5', 'ikkilamchi'], ['l5', 'shishirib'],
    ['l6', 'Tasodifiy'], ['l6', 've-to\'rt'], ['l6', 've-yetti'],
    ['l7', 'vizaut'], ['l7', 'kompozit'], ['l7', 'tezroq'],
    ['l8', 'Standart'], ['l8', 'big-int'], ['l8', 've-yetti']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l1', 'klasterli'), 'whoosh'); } catch (e) {}
  try { add(W('l2', 'vizaut'), 'whoosh'); } catch (e) {}
  try { add(W('l3', 've-yetti'), 'ding'); } catch (e) {}
  try { add(W('l4', 'inkrement'), 'ding'); } catch (e) {}
  try { add(W('l5', 'shishirib'), 'strike'); } catch (e) {}
  try { add(W('l6', 've-to\'rt'), 'error'); } catch (e) {}
  try { add(W('l7', 'tezroq'), 'ding'); } catch (e) {}
  try { add(W('l8', 've-yetti'), 'ding'); } catch (e) {}
  add(L('l8').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
