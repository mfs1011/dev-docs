// cues.js — 20-bob: API so'rovlari
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.shared_api_va_klient.s, S.endpoints_segmentatsiyasi.s, S.lokal_sorovlar.s, S.openapi_va_qalin_klient.s, S.tipik_xatolar.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // intro
  add(W('L1', 'yigirmanchi') || 4.04, 'pop');
  add(W('L2', 'kafolatidir') || 24.84, 'ding');

  // shared_api_va_klient
  add(W('L3', 'klient') || 32.74, 'ding');
  add(W('L4', 'ishonchli') || 44.93, 'pop');

  // endpoints_segmentatsiyasi
  add(W('L5', 'desegmentatsiya') || 52.49, 'ding');
  add(W('L6', 'so\'rov') || 64.86, 'pop');
  add(W('L7', 'saqlaydi') || 73.12, 'ding');

  // lokal_sorovlar
  add(W('L8', 'maxsus') || 83.31, 'ding');
  add(W('L9', 'public') || 90.69, 'pop');
  add(W('L10', 'tamoyili') || 93.94, 'ding');

  // openapi_va_qalin_klient
  add(W('L11', 'avtomatik') || 103.6, 'pop');
  add(W('L12', 'tahrirlamaslik') || 113.03, 'ding');
  add(W('L13', 'mepperlardan') || 120.37, 'pop');

  // tipik_xatolar
  add(W('L14', 'chaqirish') || 128.26, 'ding');
  for (let i = 0; i < 6; i++) add((W('L15', 'Stayger') || L('L15').s) + 0.15 + i * 0.05, 'tick');
  add(W('L15', 'mumkin') || 139.36, 'ding');

  // xulosa
  add(W('L16', 'Xulosa') || 143.13, 'pop');
  add(L('L16').e - 2.0, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
