// cues.js — 8-bob: entities qatlami
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.tushuncha.s, S.segmentlar.s, S.harakat_qoidasi.s, S.cross_import.s, S.steiger.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // tushuncha
  add(W('L2', 'user'), 'pop');
  add(W('L2', 'prodakt'), 'pop');
  add(W('L2', 'order'), 'pop');
  add(W('L3', 'slays'), 'ding');
  add(W('L4', 'pablik'), 'ding');

  // segmentlar
  add(W('L5', 'model'), 'pop');
  add(W('L6', 'yu-ay'), 'pop');
  add(W('L7', 'ey-pi-ay'), 'pop');

  // harakat qoidasi
  add(W('L8', 'mutatsiya'), 'error');
  add(W('L9', 'prodakt-kard'), 'pop');
  add(W('L9', 'slot'), 'ding');
  add(W('L10', 'erkin'), 'ding');

  // cross-import
  add(W('L11', 'import') + 0.3, 'error');
  add(W('L12', 'fichers'), 'ding');

  // steiger
  for (let i = 0; i < 8; i++) add(W('L13', 'stayger') + 0.15 + i * 0.05, 'tick');
  add(W('L13', 'cross-import') || W('L13', 'stayger') + 1.2, 'error');
  add(W('L14', 'mustaqil'), 'ding');

  // xulosa
  add(W('L15', 'entitiz'), 'pop');
  add(L('L16').s, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
