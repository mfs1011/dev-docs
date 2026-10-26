// cues.js — 36-bob: Migratsiya
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.sakkiz_qadam.s, S.sahifalar_va_reexport.s, S.steiger_bosqichlari.s, S.versiyalar_evolyutsiyasi.s, S.tipik_xatolar.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // intro
  add(W('L1', 'qilish') || 10.0, 'pop');
  add(W('L2', 'kerak') || 19.5, 'ding');

  // sakkiz_qadam
  add(W('L3', 'ajratish') || 30.0, 'pop');
  add(W('L4', 'ko\'chiriladi') || 39.5, 'ding');
  add(W('L5', 'ajratiladi') || 46.0, 'ding');

  // sahifalar_va_reexport
  add(W('L6', 'ko\'chadi') || 57.0, 'pop');
  add(W('L7', 'beradi') || 64.5, 'ding');

  // steiger_bosqichlari
  add(W('L8', 'tekshiriladi') || 76.0, 'pop');
  add(W('L9', 'yoqiladi') || 83.5, 'ding');

  // versiyalar_evolyutsiyasi
  add(W('L10', 'standartlashtirildi') || 94.5, 'pop');
  add(W('L11', 'qilindi') || 102.5, 'ding');

  // tipik_xatolar
  add(W('L12', 'majburlashdir') || 113.0, 'ding');
  add(W('L13', 'etilmaydi') || 121.5, 'pop');

  // xulosa
  add(W('L14', 'ta\'minlaydi') || 132.0, 'ding');
  add(W('L15', 'qilamiz') || 140.0, 'pop');
  add(W('L16', 'eting') || 146.0, 'ding');
  add(L('L16').e - 2.0, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
