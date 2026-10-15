// Ovoz effektlari: anim.js dagi harakatlar bilan bir xil so'z bog'lanishlari (SY.W) -> [vaqt, tur]
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.tarif.s, S.ideal.s, S.guruh.s, S.steiger.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));
  // slice nima
  add(L('L2').s, 'pop');
  add(W('L3', 'xonalar') - 0.6, 'whoosh');
  ['prodakt', 'order', 'ed-tu-kart', 'vishlist'].forEach((w) => add(W('L3', w) - 0.2, 'pop'));
  add(W('L4', 'standart'), 'pop');
  add(W('L5', 'slayslar') - 0.4, 'thunk'); add(W('L5', 'peyjiz'), 'ding'); add(W('L5', 'sherd'), 'blip');
  // ideal
  add(W('L7', 'nol'), 'pop'); add(W('L7', 'bilmaydi'), 'error');
  add(W('L8', 'yuqori'), 'pop');
  ['tugmasi', 'sorovi', 'holati'].forEach((w) => add(W('L8', w), 'pop'));
  // public API
  add(W('L9', 'indeks'), 'thunk');
  add(W('L10', 'eshik') + 0.6, 'ding'); add(W('L10', 'ichidagi') + 0.6, 'error');
  // guruh
  add(W('L11', 'guruhlash'), 'pop'); add(W('L11', 'alohida'), 'ding'); add(W('L11', 'umumiy') + 0.3, 'error');
  // Steiger
  for (let i = 0; i < 12; i++) add(W('L12', 'stayger') + 0.15 + i * 0.05, 'tick');
  [W('L13', 'ed-tu-kart'), W('L14', 'entitiz'), W('L15', 'vishlistda'), W('L15', 'ichki')].forEach((t) => add(t, 'error'));
  add(W('L16', 'muammo'), 'ding');
  // xulosa
  ['xona', 'mustaqil', 'pablik'].forEach((w) => add(W('L17', w), 'pop'));
  add(L('L18').s, 'swell');
  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
