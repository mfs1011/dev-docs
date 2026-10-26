// cues.js — 22-bob: Autentifikatsiya
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.login_sahifasi_va_dialog.s, S.token_qayerda_saqlanadi.s, S.auth_sorovlari_va_refresh.s, S.logout_va_tozalash.s, S.tipik_xatolar.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // intro
  add(W('L1', 'Autentifikatsiya') || 6.42, 'pop');
  add(W('L2', 'saqlash') || 29.82, 'ding');

  // login_sahifasi_va_dialog
  add(W('L3', 'joylashadi') || 41.81, 'ding');
  add(W('L4', 'yaratiladi') || 51.29, 'pop');

  // token_qayerda_saqlanadi
  add(W('L5', 'taqiqlangan') || 63.72, 'ding');
  add(W('L6', 'shart') || 72.86, 'ding');
  add(W('L7', 'ozod') || 81.97, 'pop');

  // auth_sorovlari_va_refresh
  add(W('L8', 'yoziladi') || 94.4, 'ding');
  add(W('L9', 'chaqiradi') || 103.18, 'ding');
  add(W('L10', 'yo\'naltiriladi') || 109.19, 'pop');

  // logout_va_tozalash
  add(W('L11', 'saqlanadi') || 119.25, 'pop');
  add(W('L12', 'tozalanishi') || 128.34, 'ding');
  add(W('L13', 'lozim') || 135.06, 'ding');

  // tipik_xatolar
  add(W('L14', 'foydalanish') || 148.61, 'ding');
  for (let i = 0; i < 6; i++) add((W('L15', 'Toza') || L('L15').s) + 0.15 + i * 0.05, 'tick');
  add(W('L15', 'ishlaydi') || 154.65, 'ding');

  // xulosa
  add(W('L16', 'Xulosa') || 158.69, 'pop');
  add(L('L16').e - 2.0, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
