// cues.js — 27-bob: React + Vite shabloni
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.yaratish_va_sozlash.s, S.steiger_linteri.s, S.app_va_provayderlar.s, S.kompozitsiya_amalda.s, S.tipik_xatolar.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // intro
  add(W('L1', 'yig\'amiz') || 18.5, 'pop');
  add(W('L2', 'chiqilgan') || 26.0, 'ding');

  // yaratish_va_sozlash
  add(W('L3', 'almashtirishdir') || 34.0, 'pop');
  add(W('L4', 'qaratiladi') || 43.5, 'ding');
  add(W('L5', 'ulanadi') || 50.5, 'ding');

  // steiger_linteri
  add(W('L6', 'ulanadi') || 56.5, 'pop');
  add(W('L7', 'beriladi') || 63.0, 'ding');

  // app_va_provayderlar
  add(W('L8', 'oladi') || 71.0, 'pop');
  add(W('L9', 'tushiriladi') || 78.0, 'ding');
  add(W('L10', 'qilinadi') || 86.0, 'ding');

  // kompozitsiya_amalda
  add(W('L11', 'joylaydi') || 95.0, 'pop');
  add(W('L12', 'birlashadi') || 102.5, 'ding');

  // tipik_xatolar
  add(W('L13', 'unutishdir') || 112.0, 'ding');
  add(W('L14', 'keltiradi') || 119.0, 'pop');

  // xulosa
  add(W('L15', 'bo\'lasiz') || 128.5, 'ding');
  add(W('L16', 'Rahmat') || 136.5, 'pop');
  add(L('L16').e - 2.0, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
