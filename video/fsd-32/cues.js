// cues.js — 32-bob: Monorepo va bir nechta FSD ildizi
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.ildiz_tamoyili.s, S.paketlarni_ulash.s, S.steiger_intizomi.s, S.ajratish_mezonlari.s, S.tipik_xatolar.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // intro
  add(W('L1', 'strategiyasi') || 11.0, 'pop');
  add(W('L2', 'birlashtiriladi') || 21.0, 'ding');

  // ildiz_tamoyili
  add(W('L3', 'bo\'ladi') || 31.0, 'pop');
  add(W('L4', 'bo\'ladi') || 40.5, 'ding');
  add(W('L5', 'qilinadi') || 48.0, 'ding');

  // paketlarni_ulash
  add(W('L6', 'usuldir') || 59.0, 'pop');
  add(W('L7', 'oshadi') || 67.0, 'ding');

  // steiger_intizomi
  add(W('L8', 'kerak') || 76.5, 'pop');
  add(W('L9', 'olinadi') || 82.5, 'ding');
  add(W('L10', 'beradi') || 89.5, 'ding');

  // ajratish_mezonlari
  add(W('L11', 'bo\'linadi') || 101.5, 'pop');
  add(W('L12', 'keladi') || 108.0, 'ding');

  // tipik_xatolar
  add(W('L13', 'qilishidir') || 119.0, 'ding');
  add(W('L14', 'taqiqlanadi') || 127.0, 'pop');

  // xulosa
  add(W('L15', 'beradi') || 138.0, 'ding');
  add(W('L16', 'Rahmat') || 147.5, 'pop');
  add(L('L16').e - 2.0, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
