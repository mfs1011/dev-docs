// cues.js — 13-bob: slice guruhlari
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.tushuncha.s, S.qoidalar.s, S.qayerda_tabiiy.s, S.import_yoli.s, S.steiger.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // tushuncha
  add(W('L2', 'slayslar'), 'pop');
  add(W('L3', 'payment'), 'pop');
  add(W('L3', 'invoice,'), 'ding');
  add(W('L4', 'hisoblanmaydi.') || (L('L4').s + 6.0), 'error');

  // qoidalar
  add(W('L5', 'emas') || (L('L5').s + 4.5), 'error');
  add(W('L6', 'qo\'yilmaydi;') || (L('L6').s + 4.5), 'error');
  add(W('L7', 'cross-import'), 'error');

  // qayerda_tabiiy
  add(W('L8', 'entitiz'), 'pop');
  add(W('L8', 'peyjiz'), 'pop');
  add(W('L9', 'peyjiz/order') || (L('L9').s + 1.0), 'ding');
  add(W('L10', 'ehtiyot'), 'error');

  // import_yoli
  add(W('L11', 'qo\'shiladi,'), 'ding');
  add(W('L12', 'buzilmaydi.') || (L('L12').s + 4.0), 'ding');

  // steiger
  for (let i = 0; i < 8; i++) add(W('L13', 'Stayger') + 0.15 + i * 0.05, 'tick');
  add(W('L13', 'taqiqlaydi.') || (W('L13', 'Stayger') + 1.2), 'error');
  add(W('L14', 'himoya'), 'ding');

  // xulosa
  add(W('L15', 'slays'), 'pop');
  add(L('L16').s, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
