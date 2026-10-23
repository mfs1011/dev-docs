// cues.js — 7-bob: shared qatlami
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.poydevor.s, S.segmentlar.s, S.lib_va_nomlar.s, S.kod_misol.s, S.steiger.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // poydevor
  add(W('L2', 'sherd'), 'lift');
  add(W('L2', 'import'), 'pop');
  add(W('L3', 'slayslar') + 0.3, 'error');
  add(W('L4', 'erkin'), 'ding');

  // segmentlar
  add(W('L5', 'standart'), 'pop');
  add(W('L6', 'ey-pi-ay'), 'pop');
  add(W('L7', 'yu-ay'), 'pop');
  add(W('L7', 'biznes') + 0.4, 'error');

  // lib va nomlar
  add(W('L8', 'xelpers'), 'error');
  add(W('L9', 'ridmi'), 'ding');
  add(W('L10', 'komponents'), 'error');

  // kod misol
  add(W('L11', 'konfig'), 'pop');
  add(W('L12', 'env'), 'ding');

  // steiger
  for (let i = 0; i < 8; i++) add(W('L13', 'stayger') + 0.15 + i * 0.05, 'tick');
  add(W('L14', 'slays'), 'error');
  add(W('L15', 'toza'), 'ding');

  // xulosa
  add(W('L16', 'sherd'), 'pop');
  add(L('L17').s, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
