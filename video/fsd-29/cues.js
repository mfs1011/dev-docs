// cues.js — 29-bob: Vue + Vite shabloni
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.yaratish_va_tuzilma.s, S.pinia_va_composablelar.s, S.public_api_va_main.s, S.slotlar_va_reaktivlik.s, S.tipik_xatolar.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // intro
  add(W('L1', 'quramiz') || 15.5, 'pop');
  add(W('L2', 'tekshiriladi') || 23.5, 'ding');

  // yaratish_va_tuzilma
  add(W('L3', 'o\'chiriladi') || 31.5, 'pop');
  add(W('L4', 'ko\'chiriladi') || 39.0, 'ding');
  add(W('L5', 'kifoya') || 48.0, 'ding');

  // pinia_va_composablelar
  add(W('L6', 'buzadi') || 56.5, 'pop');
  add(W('L7', 'saqlanadi') || 63.5, 'ding');

  // public_api_va_main
  add(W('L8', 'nomlanadi') || 71.5, 'pop');
  add(W('L9', 'qilinadi') || 78.5, 'ding');
  add(W('L10', 'olinadi') || 86.0, 'ding');

  // slotlar_va_reaktivlik
  add(W('L11', 'uzatiladi') || 93.5, 'pop');
  add(W('L12', 'lozim') || 101.0, 'ding');

  // tipik_xatolar
  add(W('L13', 'qoldirishdir') || 109.5, 'ding');
  add(W('L14', 'etiladi') || 117.0, 'pop');

  // xulosa
  add(W('L15', 'bo\'ling') || 127.0, 'ding');
  add(W('L16', 'Rahmat') || 135.5, 'pop');
  add(L('L16').e - 2.0, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
