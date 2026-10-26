// cues.js — 31-bob: Angular shabloni
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.loyiha_tuzilmasi.s, S.app_qatlami.s, S.sahifa_va_komponentlar.s, S.rasmlar_va_aktivlar.s, S.tipik_xatolar.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // intro
  add(W('L1', 'quramiz') || 17.0, 'pop');
  add(W('L2', 'beradi') || 28.0, 'ding');

  // loyiha_tuzilmasi
  add(W('L3', 'yo\'naltiradi') || 37.5, 'pop');
  add(W('L4', 'joylashadi') || 46.0, 'ding');
  add(W('L5', 'aniqlaydi') || 53.0, 'ding');

  // app_qatlami
  add(W('L6', 'tushiradi') || 62.5, 'pop');
  add(W('L7', 'chaqiriladi') || 70.5, 'ding');

  // sahifa_va_komponentlar
  add(W('L8', 'yuklaydi') || 82.5, 'pop');
  add(W('L9', 'bog\'lanadi') || 89.5, 'ding');
  add(W('L10', 'qiladi') || 97.0, 'ding');

  // rasmlar_va_aktivlar
  add(W('L11', 'loaderi') || 107.0, 'pop');
  add(W('L12', 'yondashuvdir') || 113.5, 'ding');

  // tipik_xatolar
  add(W('L13', 'o\'tishdir') || 124.0, 'ding');
  add(W('L14', 'taqiqlanadi') || 131.0, 'pop');

  // xulosa
  add(W('L15', 'birlashadi') || 141.0, 'ding');
  add(W('L16', 'Rahmat') || 149.0, 'pop');
  add(L('L16').e - 2.0, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
