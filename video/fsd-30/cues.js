// cues.js — 30-bob: Nuxt shabloni
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.toqnashuv_va_yechim.s, S.konfiguratsiya_va_alias.s, S.marshrut_qobigi.s, S.ssr_va_asyncdata.s, S.tipik_xatolar.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // intro
  add(W('L1', 'quramiz') || 15.0, 'pop');
  add(W('L2', 'qiladi') || 24.0, 'ding');

  // toqnashuv_va_yechim
  add(W('L3', 'ifodalaydi') || 30.5, 'pop');
  add(W('L4', 'qoldirishdir') || 38.5, 'ding');
  add(W('L5', 'yo\'naltiriladi') || 47.0, 'ding');

  // konfiguratsiya_va_alias
  add(W('L6', 'qoldiriladi') || 54.5, 'pop');
  add(W('L7', 'qiladi') || 62.0, 'ding');

  // marshrut_qobigi
  add(W('L8', 'chizadi') || 69.0, 'pop');
  add(W('L9', 'ko\'rsatadi') || 76.0, 'ding');
  add(W('L10', 'beradi') || 82.5, 'ding');

  // ssr_va_asyncdata
  add(W('L11', 'chaqiriladi') || 90.0, 'pop');
  add(W('L12', 'qaytariladi') || 96.5, 'ding');

  // tipik_xatolar
  add(W('L13', 'tayanishdir') || 105.5, 'ding');
  add(W('L14', 'shart') || 114.0, 'pop');

  // xulosa
  add(W('L15', 'bo\'lasiz') || 125.5, 'ding');
  add(W('L16', 'Rahmat') || 132.5, 'pop');
  add(L('L16').e - 2.0, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
