// cues.js — 38-bob: Code review checklist
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.avtomatik_darvoza.s, S.joylashuv_va_chegaralar.s, S.public_api_va_nomlash.s, S.pr_shabloni_va_adr.s, S.tipik_xatolar.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // intro
  add(W('L1', 'cheklisti') || 9.5, 'pop');
  add(W('L2', 'oladi') || 19.5, 'ding');

  // avtomatik_darvoza
  add(W('L3', 'boshlamang') || 30.0, 'pop');
  add(W('L4', 'sarflaydi') || 37.5, 'ding');

  // joylashuv_va_chegaralar
  add(W('L5', 'shart') || 50.5, 'pop');
  add(W('L6', 'kerak') || 60.5, 'ding');
  add(W('L7', 'shart') || 68.0, 'ding');

  // public_api_va_nomlash
  add(W('L8', 'kerak') || 78.5, 'pop');
  add(W('L9', 'tanlanadi') || 89.0, 'ding');

  // pr_shabloni_va_adr
  add(W('L10', 'yoziladi') || 101.5, 'pop');
  add(W('L11', 'qo\'yiladi') || 111.0, 'ding');

  // tipik_xatolar
  add(W('L12', 'kirishishdir') || 122.0, 'ding');
  add(W('L13', 'keladi') || 128.0, 'pop');

  // xulosa
  add(W('L14', 'saqlaydi') || 139.0, 'ding');
  add(W('L15', 'chiqamiz') || 146.0, 'pop');
  add(W('L16', 'eting') || 152.0, 'ding');
  add(L('L16').e - 2.0, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
