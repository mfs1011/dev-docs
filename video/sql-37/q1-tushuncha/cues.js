// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Tashqi'], ['l1', 'yaxlitligini'],
    ['l2', 'yetim'], ['l2', 'oldini'],
    ['l3', 'Birga-ko\'p'], ['l3', 'birga-bir'], ['l3', 'unikal'],
    ['l4', 'Ko\'pga-ko\'p'], ['l4', 'oraliq'],
    ['l5', 'kaskad'], ['l5', 'taqiq'],
    ['l6', 'buyurtma'], ['l6', 'mahsulotni'],
    ['l7', 'Postgresda'], ['l7', 'indeks'],
    ['l8', 'ikkinchi'], ['l8', 'tezligini'],
    ['l9', 'narx'], ['l9', 'atributlarni'],
    ['l10', 'loyihalangan'], ['l10', 'poydevor']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l1', 'Tashqi'), 'ding'); } catch (e) {}
  try { add(W('l2', 'yetim'), 'error'); } catch (e) {}
  try { add(W('l3', 'unikal'), 'ding'); } catch (e) {}
  try { add(W('l5', 'kaskad'), 'whoosh'); } catch (e) {}
  try { add(W('l5', 'taqiq'), 'strike'); } catch (e) {}
  try { add(W('l7', 'indeks'), 'blip'); } catch (e) {}
  try { add(W('l10', 'poydevor'), 'ding'); } catch (e) {}
  add(L('l10').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
