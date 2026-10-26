// cues.js — 28-bob: Next.js shabloni
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.toqnashuv_va_yechim.s, S.steiger_linteri.s, S.reexport_va_next16.s, S.server_klient_public_api.s, S.tipik_xatolar.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // intro
  add(W('L1', 'o\'rganamiz') || 15.5, 'pop');
  add(W('L2', 'bor') || 24.0, 'ding');

  // toqnashuv_va_yechim
  add(W('L3', 'qatlamlardir') || 32.5, 'pop');
  add(W('L4', 'yashaydi') || 42.0, 'ding');
  add(W('L5', 'nomlanadi') || 50.5, 'ding');

  // steiger_linteri
  add(W('L6', 'o\'chiriladi') || 60.5, 'pop');
  add(W('L7', 'qiladi') || 69.0, 'ding');

  // reexport_va_next16
  add(W('L8', 'qiladi') || 78.5, 'pop');
  add(W('L9', 'joylashadi') || 86.0, 'ding');
  add(W('L10', 'o\'qiladi') || 93.0, 'ding');

  // server_klient_public_api
  add(W('L11', 'qilinadi') || 101.5, 'pop');
  add(W('L12', 'to\'xtatadi') || 109.5, 'ding');

  // tipik_xatolar
  add(W('L13', 'chiqib') || 118.0, 'ding');
  add(W('L14', 'aralashtirishdir') || 128.5, 'pop');

  // xulosa
  add(W('L15', 'saqlang') || 143.0, 'ding');
  add(W('L16', 'Rahmat') || 151.5, 'pop');
  add(L('L16').e - 2.0, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
