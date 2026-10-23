// cues.js — 10-bob: widgets qatlami
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.kompozitsiya.s, S.qachon_ishlatish.s, S.segmentlar.s, S.cross_import.s, S.steiger.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // kompozitsiya
  add(W('L2', 'Widget'), 'pop');
  add(W('L2', 'kompozitsiya'), 'ding');
  add(W('L3', 'Header'), 'pop');
  add(W('L3', 'jamlanadi') || (L('L3').s + 4.5), 'ding');
  add(W('L4', 'to\'liq'), 'pop');

  // qachon_ishlatish
  add(W('L5', 'takrorlansa'), 'ding');
  add(W('L6', 'katta'), 'pop');
  add(W('L7', 'shart') || (L('L7').s + 3.0), 'error');

  // segmentlar
  add(W('L8', 'slays\'i'), 'pop');
  add(W('L8', 'model'), 'pop');
  add(W('L9', 'Header'), 'pop');
  add(W('L9', 'leyaut'), 'ding');
  add(W('L10', 'index'), 'pop');

  // cross_import
  add(W('L11', 'import') + 0.2, 'error');
  add(W('L12', 'sidebar'), 'error');
  add(W('L12', 'birlashtiradi') || (L('L12').s + 4.0), 'ding');

  // steiger
  for (let i = 0; i < 8; i++) add(W('L13', 'Stayger') + 0.15 + i * 0.05, 'tick');
  add(W('L13', 'cross-import') || (W('L13', 'Stayger') + 1.2), 'error');
  add(W('L14', 'mustaqil'), 'ding');

  // xulosa
  add(W('L15', 'vijets'), 'pop');
  add(L('L16').s, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
