// cues.js — 26-bob: Marshrutlash va lazy loading
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.app_va_shared_routes.s, S.guard_va_auth.s, S.lazy_loading_va_public_api.s, S.kod_namunalari.s, S.tipik_xatolar.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // intro
  add(W('L1', 'o\'rganamiz') || 16.5, 'pop');
  add(W('L2', 'bo\'linadi') || 23.5, 'ding');

  // app_va_shared_routes
  add(W('L3', 'biladi') || 36.0, 'pop');
  add(W('L4', 'muhtoj') || 47.5, 'ding');
  add(W('L5', 'joylashtiriladi') || 57.5, 'ding');

  // guard_va_auth
  add(W('L6', 'yoziladi') || 67.5, 'pop');
  add(W('L7', 'yo\'naltiradi') || 77.0, 'ding');

  // lazy_loading_va_public_api
  add(W('L8', 'shart') || 85.5, 'pop');
  add(W('L9', 'kerak') || 94.0, 'ding');
  add(W('L10', 'taqiqlanadi') || 102.5, 'ding');

  // kod_namunalari
  add(W('L11', 'ishlatiladi') || 112.5, 'pop');
  add(W('L12', 'yuklanadi') || 120.5, 'ding');

  // tipik_xatolar
  add(W('L13', 'qilishdir') || 132.0, 'ding');
  add(W('L14', 'tekshiriladi') || 142.0, 'pop');

  // xulosa
  add(W('L15', 'yuklang') || 153.5, 'ding');
  add(W('L16', 'Rahmat') || 162.5, 'pop');
  add(L('L16').e - 2.0, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
