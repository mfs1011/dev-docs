// cues.js — 25-bob: Assetlar, stillar va i18n
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.oltin_qoida.s, S.joylashuv_xaritasi.s, S.i18n_arxitekturasi.s, S.kod_va_import.s, S.tipik_xatolar.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // intro
  add(W('L1', 'o\'rganamiz') || 16.5, 'pop');
  add(W('L2', 'bo\'yicha') || 25.0, 'ding');

  // oltin_qoida
  add(W('L3', 'etilmaydi') || 37.5, 'ding');
  add(W('L4', 'saqlanadi') || 49.5, 'pop');
  add(W('L5', 'ko\'chiriladi') || 56.5, 'ding');

  // joylashuv_xaritasi
  add(W('L6', 'turadi') || 72.5, 'pop');
  add(W('L7', 'joylashadi') || 81.0, 'ding');

  // i18n_arxitekturasi
  add(W('L8', 'saqlanadi') || 95.0, 'pop');
  add(W('L9', 'yuklanadi') || 106.8, 'ding');
  add(W('L10', 'ulanadi') || 114.5, 'ding');

  // kod_va_import
  add(W('L11', 'qilinadi') || 122.0, 'pop');
  add(W('L12', 'nusxalanadi') || 137.0, 'ding');

  // tipik_xatolar
  add(W('L13', 'saqlashdir') || 151.5, 'ding');
  add(W('L14', 'qiyinlashadi') || 162.0, 'pop');

  // xulosa
  add(W('L15', 'taqsimlang') || 176.0, 'ding');
  add(W('L16', 'Rahmat') || 185.5, 'pop');
  add(L('L16').e - 2.0, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
