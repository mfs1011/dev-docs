// cues.js — 9-bob: features qatlami
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.entity_vs_feature.s, S.qayta_ishlatish.s, S.segmentlar.s, S.cross_import.s, S.steiger.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // entity_vs_feature
  add(W('L2', 'Entity'), 'pop');
  add(W('L2', 'ficher'), 'pop');
  add(W('L3', 'mahsulot'), 'pop');
  add(W('L3', 'savatga'), 'ding');
  add(W('L4', 'bo\'lavermaydi') || (L('L4').s + 2.0), 'error');

  // qayta_ishlatish
  add(W('L5', 'sahifada'), 'ding');
  add(W('L6', 'o\'zida'), 'pop');
  add(W('L7', 'qarashda'), 'ding');

  // segmentlar
  add(W('L8', 'slays\'i'), 'pop');
  add(W('L8', 'ey-pi-ay'), 'pop');
  add(W('L9', 'Ed-tu-kart'), 'ding');
  add(W('L9', 'optimistik'), 'ding');
  add(W('L10', 'index'), 'pop');

  // cross_import
  add(W('L11', 'import') + 0.2, 'error');
  add(W('L12', 'vijet'), 'ding');

  // steiger
  for (let i = 0; i < 8; i++) add(W('L13', 'Stayger') + 0.15 + i * 0.05, 'tick');
  add(W('L13', 'taqiqlangan') || (W('L13', 'Stayger') + 1.2), 'error');
  add(W('L14', 'mustaqil'), 'ding');

  // xulosa
  add(W('L15', 'fichers'), 'pop');
  add(L('L16').s, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
