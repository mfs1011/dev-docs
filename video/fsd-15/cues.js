// cues.js — 15-bob: cross-import va @x
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.code_smell.s, S.at_x_shablon.s, S.strategiya_ab.s, S.strategiya_cd.s, S.steiger.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // intro
  add(W('L1', 'kross-import') || 5.5, 'pop');
  add(W('L2', 'prodakt') || 20.3, 'error');

  // code_smell
  add(W('L3', 'smel') || (L('L3').s + 3.0), 'error');
  add(W('L3', 'xiralashadi,') || (L('L3').s + 6.0), 'error');
  add(W('L4', 'siklik') || (L('L4').s + 7.0), 'error');

  // at_x_shablon
  add(W('L5', 'ijrochi') || (L('L5').s + 5.5), 'ding');
  add(W('L6', 'et-iks,') || (L('L6').s + 4.5), 'pop');
  add(W('L6', 'kesishuv') || (L('L6').s + 5.5), 'ding');
  add(W('L7', 'bo\'lmaydi.') || (L('L7').s + 5.0), 'error');
  add(W('L7', 'qo\'llanadi.') || (L('L7').s + 10.0), 'ding');

  // strategiya_ab
  add(W('L8', 'strategiya') || (L('L8').s + 7.5), 'pop');
  add(W('L9', 'birlashtirish.') || (L('L9').s + 2.0), 'ding');
  add(W('L10', 'tushirish.') || (L('L10').s + 4.0), 'ding');

  // strategiya_cd
  add(W('L11', 'Invershn') || (L('L11').s + 3.5), 'ding');
  add(W('L11', 'slot') || (L('L11').s + 8.0), 'pop');
  add(W('L12', 'taqiqlanadi.') || (L('L12').s + 11.5), 'error');
  add(W('L13', 'refaktoring') || (L('L13').s + 7.0), 'ding');

  // steiger
  for (let i = 0; i < 8; i++) add((W('L14', 'stayger') || L('L14').s) + 0.15 + i * 0.05, 'tick');
  add(W('L15', 'noqonuniy') || (L('L15').s + 1.0), 'error');
  add(W('L15', 'tozaligini') || (L('L15').s + 6.0), 'ding');

  // xulosa
  add(W('L16', 'Xulosa') || L('L16').s, 'pop');
  add(L('L16').e - 2.0, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
