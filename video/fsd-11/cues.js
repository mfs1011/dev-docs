// cues.js — 11-bob: pages qatlami
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.sahifa_va_slice.s, S.sahifaga_xos_kod.s, S.segmentlar.s, S.cross_import.s, S.steiger.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // sahifa_va_slice
  add(W('L2', 'slays'), 'pop');
  add(W('L3', 'katalog'), 'pop');
  add(W('L3', 'mahsulot'), 'pop');
  add(W('L4', 'peyjiz/sign-in') || (L('L4').s + 4.0), 'ding');

  // sahifaga_xos_kod
  add(W('L5', 'qulaylik:'), 'ding');
  add(W('L6', 'galereyasi'), 'pop');
  add(W('L6', 'skeleton'), 'pop');
  add(W('L7', 'shart') || (L('L7').s + 4.0), 'error');

  // segmentlar
  add(W('L8', 'slays\'ida'), 'pop');
  add(W('L8', 'yuklanish'), 'pop');
  add(W('L9', 'routerdan'), 'ding');
  add(W('L10', 'ProductPage'), 'pop');

  // cross_import
  add(W('L11', 'import') + 0.2, 'error');
  add(W('L12', 'checkout'), 'error');
  add(W('L12', 'tushiriladi') || (L('L12').s + 8.0), 'ding');

  // steiger
  for (let i = 0; i < 8; i++) add(W('L13', 'Stayger') + 0.15 + i * 0.05, 'tick');
  add(W('L13', 'cross-import') || (W('L13', 'Stayger') + 1.2), 'error');
  add(W('L14', 'mustaqil'), 'ding');

  // xulosa
  add(W('L15', 'peyjiz'), 'pop');
  add(L('L16').s, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
