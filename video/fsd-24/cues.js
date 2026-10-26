// cues.js — 24-bob: Layout'lar
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.shared_ui_layout_va_slot.s, S.teskari_import_xatosi.s, S.app_layouts_yechimi.s, S.layout_kerakmi.s, S.tipik_xatolar.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // intro
  add(W('L1', 'karkaslari') || 9.29, 'pop');
  add(W('L2', 'karkasdir') || 24.74, 'ding');

  // shared_ui_layout_va_slot
  add(W('L3', 'yaratiladi') || 38.18, 'ding');
  add(W('L4', 'etadi') || 48.47, 'pop');

  // teskari_import_xatosi
  add(W('L5', 'qilishdir') || 60.04, 'ding');
  add(W('L6', 'to\'xtatiladi') || 67.78, 'ding');
  add(W('L7', 'emas') || 73.9, 'pop');

  // app_layouts_yechimi
  add(W('L8', 'katalogidir') || 85.21, 'pop');
  add(W('L9', 'birlashtiradi') || 94.78, 'ding');
  add(W('L10', 'qo\'llanadi') || 101.92, 'ding');

  // layout_kerakmi
  add(W('L11', 'kerakmi') || 111.05, 'pop');
  add(W('L12', 'qulayroqdir') || 120.43, 'ding');
  add(W('L13', 'ta\'minlaydi') || 125.1, 'ding');

  // tipik_xatolar
  add(W('L14', 'qilish') || 139.48, 'ding');
  for (let i = 0; i < 6; i++) add((W('L15', 'Router') || L('L15').s) + 0.15 + i * 0.05, 'tick');
  add(W('L15', 'yo\'ldir') || 145.51, 'ding');

  // xulosa
  add(W('L16', 'Xulosa') || 149.33, 'pop');
  add(L('L16').e - 2.0, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
