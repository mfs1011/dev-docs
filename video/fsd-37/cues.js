// cues.js — 37-bob: Amaliy loyiha: do'kon frontendi
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.bosqich1_uch_qatlam.s, S.bosqich2_3_takrorlanish.s, S.bosqich4_5_header_admin.s, S.steiger_metrikalari.s, S.tipik_xatolar.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // intro
  add(W('L1', 'qo\'llash') || 11.5, 'pop');
  add(W('L2', 'kerak') || 20.5, 'ding');

  // bosqich1_uch_qatlam
  add(W('L3', 'quriladi') || 32.5, 'pop');
  add(W('L4', 'beradi') || 40.0, 'ding');

  // bosqich2_3_takrorlanish
  add(W('L5', 'chiqiladi') || 50.0, 'pop');
  add(W('L6', 'yaratiladi') || 57.5, 'ding');
  add(W('L7', 'uzatiladi') || 65.5, 'ding');

  // bosqich4_5_header_admin
  add(W('L8', 'shakllantiriladi') || 75.5, 'pop');
  add(W('L9', 'olinadi') || 83.5, 'ding');

  // steiger_metrikalari
  add(W('L10', 'chiqadi') || 94.0, 'pop');
  add(W('L11', 'qiladi') || 102.0, 'ding');

  // tipik_xatolar
  add(W('L12', 'qilishdir') || 113.0, 'ding');
  add(W('L13', 'xatodir') || 120.5, 'pop');

  // xulosa
  add(W('L14', 'boradi') || 132.5, 'ding');
  add(W('L15', 'chiqamiz') || 139.0, 'pop');
  add(W('L16', 'quring') || 144.0, 'ding');
  add(L('L16').e - 2.0, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
