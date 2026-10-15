// Ovoz effektlari: anim.js dagi harakatlar bilan bir xil so'z bog'lanishlari (SY.W) -> [vaqt, tur]
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.tarif.s, W('L3', 'binoda') - 0.3, S.ozingiz.s, S.nom.s, S.steiger.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));
  add(L('L2').s, 'pop');
  add(W('L3', 'epplay-promo-kod') - 0.3, 'pop'); add(W('L3', 'kub'), 'thunk');
  [['L4', 'yu-ay'], ['L5', 'ey-pi-ay'], ['L6', 'model'], ['L7', 'lib'], ['L8', 'konfig']].forEach(([l, w]) => add(W(l, w) - 0.2, 'pop'));
  for (let i = 0; i < 4; i++) add(S.ozingiz.s + 0.8 + i * 0.15, 'pop');
  add(W('L9', 'yaratish'), 'ding'); add(W('L9', 'yaratish') + 0.3, 'pop');
  add(W('L10', 'maqsadini'), 'ding'); add(W('L10', 'mohiyatini'), 'blip');
  ['komponents', 'xuks', 'tayps'].forEach((w) => add(W('L11', w), 'error'));
  for (let i = 0; i < 12; i++) add(W('L12', 'stayger') + 0.15 + i * 0.05, 'tick');
  ['komponents', 'konstants', 'xuks', 'tayps', 'yutils'].forEach((w) => add(W('L13', w), 'error'));
  add(W('L14', 'muammo'), 'ding');
  ['kub', 'beshta', 'maqsadni'].forEach((w) => add(W('L15', w), 'pop'));
  add(L('L16').s, 'swell');
  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
