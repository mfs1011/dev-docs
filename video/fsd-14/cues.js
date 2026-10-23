// cues.js — 14-bob: public api chuqur
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.shartnoma_va_eksport.s, S.siklik_importlar.s, S.tree_shaking.s, S.server_klient.s, S.steiger.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // shartnoma_va_eksport
  add(W('L2', 'berkitadi'), 'pop');
  add(W('L3', 'yulduzcha') || (L('L3').s + 2.0), 'error');
  add(W('L3', 'nomlangan'), 'ding');
  add(W('L4', 'imkonsiz') || (L('L4').s + 5.0), 'error');

  // siklik_importlar
  add(W('L5', 'import') + 0.2, 'error');
  add(W('L6', 'nisbiy'), 'pop');
  add(W('L7', 'alias'), 'ding');

  // tree_shaking
  add(W('L8', 'buzishi') || (L('L8').s + 6.0), 'error');
  add(W('L9', 'mustaqil'), 'ding');
  add(W('L10', 'Button'), 'pop');

  // server_klient
  add(W('L11', 'index.server') || (L('L11').s + 6.0), 'ding');
  add(W('L12', 'himoyalanadi.') || (L('L12').s + 5.0), 'ding');

  // steiger
  for (let i = 0; i < 8; i++) add(W('L13', 'Stayger') + 0.15 + i * 0.05, 'tick');
  add(W('L13', 'public-ey-pi-ay') || (W('L13', 'Stayger') + 1.2), 'error');
  add(W('L14', 'saqlaydi.') || (L('L14').s + 5.0), 'ding');

  // xulosa
  add(W('L15', 'Public'), 'pop');
  add(L('L16').s, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
