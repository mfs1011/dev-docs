// Ovoz effektlari: anim.js dagi harakatlar bilan bir xil so'z bog'lanishlari (SY.W) -> [vaqt, tur]
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.tartib.s, S.istisno.s, S.tanlash.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));
  // tartib
  add(W('L2', 'yettita'), 'pop'); add(W('L2', 'masuliyat'), 'lift');
  add(W('L3', 'yuqoridagisi'), 'pop'); add(W('L3', 'pastga'), 'pop');
  // yettita qatlam
  [['L4', 'ep'], ['L6', 'peyjiz'], ['L7', 'vijets'], ['L8', 'fichers'], ['L9', 'entitiz'], ['L10', 'sherd']].forEach(([l, w]) => add(W(l, w) - 0.2, 'pop'));
  add(W('L5', 'proseses'), 'blip');
  // import
  add(W('L11', 'qatiy'), 'lift');
  ['fichers', 'entitiz', 'sherd'].forEach((w) => add(W('L12', w), 'pop'));
  add(W('L12', 'togri'), 'ding');
  add(W('L13', 'vijetdan'), 'error'); add(W('L13', 'peyjiz') + 0.6, 'error');
  // istisno
  add(W('L14', 'sherd'), 'pop');
  for (let i = 0; i < 4; i++) add(W('L15', 'segmentlar') + i * 0.2, 'pop');
  add(W('L15', 'libdan') + 0.6, 'ding');
  // tanlash
  add(W('L16', 'kamida'), 'ding');
  for (let i = 0; i < 3; i++) add(W('L17', 'qolganlari') + 0.4 + i * 0.5, 'thunk');
  add(W('L18', 'yangi'), 'blip'); add(W('L18', 'tavsiya'), 'error');
  // Steiger
  for (let i = 0; i < 12; i++) add(W('L19', 'stayger') + 0.15 + i * 0.05, 'tick');
  add(W('L20', 'xeder'), 'error'); add(W('L20', 'peyjiz'), 'blip'); add(W('L21', 'eskirgan'), 'error');
  add(W('L22', 'kor'), 'blip');
  add(W('L23', 'tuzatilgan') + 0.6, 'ding');
  // xulosa
  ['yettita', 'import', 'ep'].forEach((w) => add(W('L24', w), 'pop'));
  add(L('L25').s, 'swell');
  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
