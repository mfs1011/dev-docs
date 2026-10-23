// cues.js — 12-bob: app qatlami
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.vazifasi.s, S.segmentlar.s, S.router_va_ulanish.s, S.import_qoidasi.s, S.steiger.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // vazifasi
  add(W('L2', 'kirish'), 'pop');
  add(W('L2', 'marshrutlar,'), 'pop');
  add(W('L3', 'segmentlardan'), 'ding');
  add(W('L4', 'yozilmaydi.') || (L('L4').s + 4.0), 'ding');

  // segmentlar
  add(W('L5', 'entrypoint,'), 'pop');
  add(W('L5', 'providers'), 'pop');
  add(W('L6', 'TanStack'), 'ding');
  add(W('L7', 'router'), 'pop');

  // router_va_ulanish
  add(W('L8', 'index'), 'ding');
  add(W('L9', 'sherd'), 'ding');
  add(W('L10', 'root'), 'pop');

  // import_qoidasi
  add(W('L11', 'import') + 0.2, 'error');
  add(W('L12', 'buzilishi') || (L('L12').s + 6.0), 'error');

  // steiger
  for (let i = 0; i < 8; i++) add(W('L13', 'Stayger') + 0.15 + i * 0.05, 'tick');
  add(W('L13', 'no-higher-layer-imports') || (W('L13', 'Stayger') + 1.2), 'error');
  add(W('L14', 'barqaror'), 'ding');

  // xulosa
  add(W('L15', 'ep'), 'pop');
  add(L('L16').s, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
