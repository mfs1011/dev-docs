// Ovoz effektlari: anim.js dagi harakatlar bilan bir xil so'z bog'lanishlari (SY.W) -> [vaqt, tur]
(function (g) {
  const { L, W } = g.SY;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  // kamera ko'chishlari
  [W('L5', 'ef-es-di') - 0.4, W('L12', 'eng'), W('L15', 'har') - 0.3, W('L17', 'xona') - 0.3, W('L19', 'har') - 0.3, W('L21', 'bu') - 0.3, W('L24', 'qayerdan') - 0.3, W('L26', 'xulosa') - 0.3].forEach((t) => add(t, 'whoosh'));
  ['komponents', 'yutils', 'xelpers'].forEach((w) => add(W('L2', w), 'pop'));
  add(W('L3', 'buziladi'), 'error');
  [['L6', 'sherd'], ['L7', 'entitiz'], ['L8', 'fichers'], ['L9', 'vijets'], ['L10', 'peyjiz'], ['L10', 'ep']].forEach(([l, w]) => add(W(l, w), 'pop'));
  add(W('L11', 'proseses'), 'blip');
  add(W('L13', 'sahifa'), 'lift'); add(W('L13', 'sahifa') + 1.2, 'ding');
  add(W('L13', 'entiti') + 0.3, 'error');
  add(W('L15', 'prodakt') - 0.3, 'pop'); add(W('L15', 'kart') - 0.3, 'pop');
  add(W('L16', 'import'), 'error');
  ['yu-ay', 'ey-pi-ay', 'model', 'lib', 'konfig'].forEach((w) => add(W('L18', w), 'pop'));
  add(W('L19', 'eshigi'), 'thunk');
  add(W('L20', 'eshik') + 0.6, 'ding'); add(W('L20', 'ichki') + 0.6, 'error');
  for (let i = 0; i < 16; i++) add(W('L21', 'stayger') + 0.15 + i * 0.05, 'tick');
  [W('L22', 'yuqori'), W('L22', 'bir'), W('L22', 'chetlab')].forEach((t) => add(t, 'error'));
  add(W('L23', 'muammo'), 'ding');
  add(W('L25', 'kodni'), 'pop'); add(W('L25', 'bir'), 'pop');
  add(W('L25', 'kochiring'), 'lift'); add(W('L25', 'kochiring') + 1.2, 'ding');
  ['qatlamlar', 'lift', 'xonalar', 'eshikdan'].forEach((w) => add(W('L26', w), 'pop'));
  add(L('L27').s, 'swell');
  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
