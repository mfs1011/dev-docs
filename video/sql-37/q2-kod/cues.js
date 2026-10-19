// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'birga-bir'], ['l1', 'birlamchi'],
    ['l2', 'ikkinchi'], ['l2', 'xato'],
    ['l3', 'Buyurtmalar'], ['l3', 'oraliq'],
    ['l4', 'narx'], ['l4', 'tarixiy'],
    ['l5', 'kaskad'], ['l5', 'avtomatik'],
    ['l6', 'mahsulotni'], ['l6', 'taqiq'], ['l6', 'bloklanadi'],
    ['l7', 'Multi-tenant'], ['l7', 'kompozit'], ['l7', 'null'],
    ['l8', 'Foydalanuvchi'], ['l8', 'saqlanadi'],
    ['l9', 'Postgresda'], ['l9', 'indeks'], ['l9', 'tezlashtiradi'],
    ['l10', 'ikkinchi'], ['l10', 'unumdorlik']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'xato'), 'error'); } catch (e) {}
  try { add(W('l4', 'narx'), 'ding'); } catch (e) {}
  try { add(W('l5', 'kaskad'), 'whoosh'); } catch (e) {}
  try { add(W('l6', 'taqiq'), 'strike'); } catch (e) {}
  try { add(W('l7', 'kompozit'), 'ding'); } catch (e) {}
  try { add(W('l9', 'indeks'), 'blip'); } catch (e) {}
  try { add(W('l10', 'unumdorlik'), 'ding'); } catch (e) {}
  add(L('l10').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
