// cues.js — 17-bob: desegmentatsiya va nomlash
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.muammolar.s, S.domen_boyicha.s, S.nomlash_qoidalari.s, S.istisnolar_va_xatolar.s, S.steiger.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // intro
  add(W('L1', 'Desegmentatsiya') || 5.4, 'pop');
  add(W('L2', 'sochib') || 23.3, 'error');

  // muammolar
  add(W('L3', 'bog\'liqlik') || (L('L3').s + 3.0), 'error');
  add(W('L3', 'beshta') || (L('L3').s + 7.5), 'error');
  add(W('L4', 'imkonsiz') || (L('L4').s + 6.5), 'error');

  // domen_boyicha
  add(W('L5', 'domen') || (L('L5').s + 2.5), 'ding');
  add(W('L6', 'deliveri') || (L('L6').s + 0.8), 'pop');
  add(W('L7', 'tezlashtiradi.') || (L('L7').s + 7.0), 'ding');

  // nomlash_qoidalari
  add(W('L8', 'maqsadda') || (L('L8').s + 5.5), 'ding');
  add(W('L9', 'Tayps') || (L('L9').s + 0.2), 'error');
  add(W('L9', 'prodakt') || (L('L9').s + 7.0), 'ding');
  add(W('L10', 'joylang.') || (L('L10').s + 6.0), 'ding');

  // istisnolar_va_xatolar
  add(W('L11', 'tabiiydir:') || (L('L11').s + 3.5), 'pop');
  add(W('L12', 'axlat') || (L('L12').s + 3.0), 'error');
  add(W('L12', 'deyt') || (L('L12').s + 5.0), 'ding');
  add(W('L13', 'ortiqcha') || (L('L13').s + 1.0), 'error');

  // steiger
  for (let i = 0; i < 8; i++) add((W('L14', 'Stayger') || L('L14').s) + 0.15 + i * 0.05, 'tick');
  add(W('L14', 'noto\'g\'ri') || (L('L14').s + 3.5), 'error');
  add(W('L15', 'saqlaydi.') || (L('L15').s + 6.5), 'ding');

  // xulosa
  add(W('L16', 'Xulosa') || L('L16').s, 'pop');
  add(L('L16').e - 2.0, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
