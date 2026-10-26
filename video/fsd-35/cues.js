// cues.js — 35-bob: FSD'da testlash
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.test_turlari_va_joylashuv.s, S.soxtalar_va_shared_testing.s, S.steiger_testlarda.s, S.komponent_testi_misoli.s, S.tipik_xatolar.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // intro
  add(W('L1', 'qilish') || 10.0, 'pop');
  add(W('L2', 'ko\'chadi') || 18.5, 'ding');

  // test_turlari_va_joylashuv
  add(W('L3', 'olinadi') || 27.5, 'pop');
  add(W('L4', 'saqlanadi') || 35.0, 'ding');
  add(W('L5', 'yashaydi') || 42.5, 'ding');

  // soxtalar_va_shared_testing
  add(W('L6', 'qilinadi') || 54.0, 'pop');
  add(W('L7', 'etadi') || 62.0, 'ding');

  // steiger_testlarda
  add(W('L8', 'qiladi') || 72.0, 'pop');
  add(W('L9', 'chiqaradi') || 79.5, 'ding');

  // komponent_testi_misoli
  add(W('L10', 'qilinadi') || 89.5, 'pop');
  add(W('L11', 'tekshiriladi') || 97.5, 'ding');

  // tipik_xatolar
  add(W('L12', 'o\'tishdir') || 108.0, 'ding');
  add(W('L13', 'xatodir') || 115.5, 'pop');

  // xulosa
  add(W('L14', 'beradi') || 126.5, 'ding');
  add(W('L15', 'ko\'ramiz') || 133.5, 'pop');
  add(W('L16', 'eting') || 137.5, 'ding');
  add(L('L16').e - 2.0, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
