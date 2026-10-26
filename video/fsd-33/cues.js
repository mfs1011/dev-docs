// cues.js — 33-bob: Steiger
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.ornatish_va_bayroqlar.s, S.asosiy_qoidalar.s, S.konfiguratsiya_va_istisnolar.s, S.ci_va_katta_loyihalar.s, S.tipik_xatolar.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // intro
  add(W('L1', 'qo\'llanma') || 10.0, 'pop');
  add(W('L2', 'qiladi') || 19.5, 'ding');

  // ornatish_va_bayroqlar
  add(W('L3', 'mumkin') || 29.5, 'pop');
  add(W('L4', 'beradi') || 38.5, 'ding');
  add(W('L5', 'to\'xtatadi') || 46.5, 'ding');

  // asosiy_qoidalar
  add(W('L6', 'ushlaydi') || 57.0, 'pop');
  add(W('L7', 'taqiqlaydi') || 65.0, 'ding');

  // konfiguratsiya_va_istisnolar
  add(W('L8', 'mumkin') || 75.0, 'pop');
  add(W('L9', 'o\'chiramiz') || 83.5, 'ding');

  // ci_va_katta_loyihalar
  add(W('L10', 'qiladi') || 93.5, 'pop');
  add(W('L11', 'qilinadi') || 101.5, 'ding');

  // tipik_xatolar
  add(W('L12', 'tashlashdir') || 113.0, 'ding');
  add(W('L13', 'chiqaradi') || 120.5, 'pop');

  // xulosa
  add(W('L14', 'vositadir') || 131.0, 'ding');
  add(W('L15', 'qilamiz') || 138.0, 'pop');
  add(W('L16', 'eting') || 143.5, 'ding');
  add(L('L16').e - 2.0, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
