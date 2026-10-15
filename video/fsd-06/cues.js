// Ovoz effektlari: anim.js dagi harakatlar bilan bir xil so'z bog'lanishlari (SY.W) -> [vaqt, tur]
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.import.s, S.api.s, S.yollar.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));
  // import
  add(W('L2', 'qatiy'), 'lift');
  [W('L3', 'peyjiz'), W('L3', 'vijets', 1), W('L3', 'fichers', 1)].forEach((t) => add(t, 'pop'));
  add(W('L3', 'teskari') + 0.5, 'error');
  add(W('L4', 'pastdagi'), 'pop'); add(W('L4', 'yuqoridagilar'), 'blip');
  // public API
  add(W('L5', 'shartnoma'), 'thunk'); add(W('L5', 'darvozadek') + 0.6, 'ding');
  add(W('L6', 'uchta'), 'pop');
  [['L7', 'birinchi'], ['L8', 'ikkinchi'], ['L9', 'uchinchi']].forEach(([l, w]) => add(W(l, w), 'pop'));
  add(W('L7', 'birinchi') + 0.4, 'whoosh');
  // yo'llar
  [W('L10', 'nisbiy'), W('L11', 'eylias'), W('L12', 'sherd')].forEach((t) => { add(t, 'pop'); add(t + 0.5, 'ding'); });
  // xavf
  [['L13', 'eksport'], ['L14', 'ay-di-i'], ['L15', 'indeks']].forEach(([l, w], j) => add(W(l, w) - 0.3, j === 2 ? 'blip' : 'error'));
  // Steiger
  for (let i = 0; i < 12; i++) add(W('L16', 'stayger') + 0.15 + i * 0.05, 'tick');
  add(W('L16', 'import-lokaliti'), 'blip');
  [['L17', 'entitiz'], ['L18', 'katalog'], ['L19', 'ed-tu-kart'], ['L20', 'ikkala']].forEach(([l, w]) => add(W(l, w), 'error'));
  add(W('L20', 'eksport'), 'blip');
  add(W('L21', 'muammo'), 'ding');
  // xulosa
  ['import', 'pablik', 'nisbiy'].forEach((w) => add(W('L22', w), 'pop'));
  add(L('L23').s, 'swell');
  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
