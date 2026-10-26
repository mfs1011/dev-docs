// cues.js — 23-bob: Tiplar va validatsiya
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.shared_types_xatosi.s, S.dto_mapper_va_domen.s, S.forma_va_props_tiplari.s, S.utility_va_ambient_tiplar.s, S.tipik_xatolar.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // intro
  add(W('L1', 'Tiplar') || 5.54, 'pop');
  add(W('L2', 'lozim') || 22.75, 'ding');

  // shared_types_xatosi
  add(W('L3', 'yaratishdir') || 32.08, 'ding');
  add(W('L4', 'kabi') || 39.62, 'pop');

  // dto_mapper_va_domen
  add(W('L5', 'turadi') || 48.93, 'ding');
  add(W('L6', 'o\'giriladi') || 57.09, 'ding');
  add(W('L7', 'oladi') || 62.0, 'pop');

  // forma_va_props_tiplari
  add(W('L8', 'saqlanadi') || 73.06, 'ding');
  add(W('L9', 'qilinadi') || 79.39, 'pop');
  add(W('L10', 'qiyinlashtiradi') || 83.75, 'ding');

  // utility_va_ambient_tiplar
  add(W('L11', 'jamlanadi') || 93.33, 'pop');
  add(W('L12', 'saqlanadi') || 103.54, 'ding');
  add(W('L13', 'beradi') || 110.59, 'ding');

  // tipik_xatolar
  add(W('L14', 'yoyish') || 123.83, 'ding');
  for (let i = 0; i < 6; i++) add((W('L15', 'Sxema') || L('L15').s) + 0.15 + i * 0.05, 'tick');
  add(W('L15', 'asraydi') || 130.08, 'ding');

  // xulosa
  add(W('L16', 'Xulosa') || 134.06, 'pop');
  add(L('L16').e - 2.0, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
