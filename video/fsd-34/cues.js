// cues.js — 34-bob: ESLint, TypeScript va alias'lar
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.alias_sozlamalari.s, S.no_restricted_imports.s, S.boundaries_plagini.s, S.natijalar_va_ide.s, S.tipik_xatolar.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // intro
  add(W('L1', 'qilish') || 11.0, 'pop');
  add(W('L2', 'beradi') || 21.0, 'ding');

  // alias_sozlamalari
  add(W('L3', 'shart') || 30.5, 'pop');
  add(W('L4', 'kerak') || 39.0, 'ding');
  add(W('L5', 'tushunadi') || 47.5, 'ding');

  // no_restricted_imports
  add(W('L6', 'yuboradi') || 57.0, 'pop');
  add(W('L7', 'taqiqlanadi') || 65.5, 'ding');

  // boundaries_plagini
  add(W('L8', 'qiladi') || 75.5, 'pop');
  add(W('L9', 'to\'xtatiladi') || 83.5, 'ding');

  // natijalar_va_ide
  add(W('L10', 'tushuntiriladi') || 93.0, 'pop');
  add(W('L11', 'ta\'minlaydi') || 99.5, 'ding');

  // tipik_xatolar
  add(W('L12', 'olishdir') || 111.0, 'ding');
  add(W('L13', 'olmasligidir') || 118.0, 'pop');

  // xulosa
  add(W('L14', 'kafolatlaydi') || 129.0, 'ding');
  add(W('L15', 'o\'rganamiz') || 134.5, 'pop');
  add(W('L16', 'to\'xtamang') || 137.5, 'ding');
  add(L('L16').e - 2.0, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
