// Ovoz effektlari: anim.js dagi harakatlar bilan bir xil so'z bog'lanishlari (SY.W) -> [vaqt, tur]
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.v20.s, S.conduit.s, S.nomlar.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));
  // v2.0: qavatlar pastdan yuqoriga quriladi
  [L('L2').s - 0.4, W('L2', 'entiti'), W('L2', 'ficher'), W('L3', 'vijet'), W('L3', 'sahifalar')].forEach((t) => add(t + 0.5, 'thunk'));
  add(W('L3', 'pastdan'), 'lift');
  // v2.1
  add(W('L4', 'sahifalar'), 'ding');
  add(W('L5', 'sahifalarga'), 'whoosh');
  [W('L5', 'interfeysi'), W('L5', 'sorovlari'), W('L5', 'holatini'), W('L5', 'umumiy')].forEach((t) => add(t, 'pop'));
  add(W('L6', 'buzuvchi'), 'ding');
  // Conduit
  add(W('L7', 'kondyuit'), 'pop');
  ['lentasi', 'kirish', 'oqish', 'tahrirlash', 'profil', 'sozlamalar'].forEach((w) => add(W('L8', w), 'pop'));
  add(W('L9', 'kirish'), 'pop');
  add(W('L10', 'uchta'), 'ding');
  // nomlar maydoni
  add(W('L11', 'global'), 'blip');
  add(W('L12', 'ozgaruvchini'), 'pop'); add(W('L12', 'ozgaruvchini') + 1.0, 'pop');
  add(W('L12', 'chiqarmang'), 'error');
  // pastga tushirish
  add(W('L13', 'kartasi'), 'pop');
  add(W('L14', 'profil'), 'pop');
  add(W('L14', 'endi'), 'whoosh');
  add(W('L15', 'kochadi'), 'lift'); add(W('L15', 'kochadi') + 1.4, 'thunk');
  add(W('L15', 'import'), 'ding');
  add(W('L16', 'rasmiy'), 'pop');
  add(L('L17').s, 'pop');
  // Steiger
  for (let i = 0; i < 12; i++) add(W('L18', 'stayger') + 0.15 + i * 0.05, 'tick');
  [W('L19', 'profil'), W('L20', 'artikl'), W('L20', 'layk')].forEach((t) => add(t, 'error'));
  add(W('L21', 'muammo'), 'ding');
  // xulosa
  ['avval', 'poydevor', 'pastga'].forEach((w) => add(W('L22', w), 'pop'));
  add(L('L23').s, 'swell');
  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
