// cues.js — 19-bob: qaror daraxti: kod qayerga?
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.daraxt_asosiy.s, S.sahifalar_va_lokallik.s, S.widgets_features_entities.s, S.element_hayoti.s, S.steiger.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // intro
  add(W('L1', 'Qaror') || 5.7, 'pop');
  add(W('L2', 'tanlashdir.') || 23.0, 'ding');

  // daraxt_asosiy
  add(W('L3', 'qatlamiga.') || (L('L3').s + 7.5), 'ding');
  add(W('L4', 'sherd') || (L('L4').s + 7.5), 'pop');

  // sahifalar_va_lokallik
  add(W('L5', 'qoldiring.') || (L('L5').s + 8.5), 'ding');
  add(W('L6', 'oltin') || (L('L6').s + 0.5), 'ding');
  add(W('L7', 'ko\'chirish') || (L('L7').s + 5.5), 'pop');

  // widgets_features_entities
  add(W('L8', 'vijets,') || (L('L8').s + 4.5), 'ding');
  add(W('L9', 'fichers,') || (L('L9').s + 2.5), 'pop');
  add(W('L10', 'entitiz,') || (L('L10').s + 4.5), 'ding');

  // element_hayoti
  add(W('L11', 'reytingi') || (L('L11').s + 1.0), 'pop');
  add(W('L11', 'o\'tadi.') || (L('L11').s + 9.5), 'ding');
  add(W('L12', 'reyt-prodakt') || (L('L12').s + 3.0), 'ding');
  add(W('L12', 'jamlanadi.') || (L('L12').s + 7.5), 'pop');

  // steiger
  for (let i = 0; i < 8; i++) add((W('L14', 'Stayger') || L('L14').s) + 0.15 + i * 0.05, 'tick');
  add(W('L15', 'tasdiq') || (L('L15').s + 5.0), 'ding');

  // xulosa
  add(W('L16', 'Xulosa') || L('L16').s, 'pop');
  add(L('L16').e - 2.0, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
