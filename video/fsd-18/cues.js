// cues.js — 18-bob: ortiqcha entity'lar
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.nolinchi_qoida.s, S.oldindan_bolmaslik.s, S.crud_va_auth.s, S.yagona_kontekst.s, S.steiger.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // intro
  add(W('L1', 'Ortiqcha') || 4.3, 'pop');
  add(W('L2', 'xato') || 16.0, 'error');

  // nolinchi_qoida
  add(W('L3', 'nolinchi') || (L('L3').s + 1.5), 'ding');
  add(W('L4', 'krud') || (L('L4').s + 4.5), 'pop');

  // oldindan_bolmaslik
  add(W('L5', 'ajratmang.') || (L('L5').s + 3.0), 'error');
  add(W('L6', 'ko\'chiring.') || (L('L6').s + 7.0), 'ding');
  add(W('L7', 'asraydi.') || (L('L7').s + 6.5), 'ding');

  // crud_va_auth
  add(W('L8', 'krud') || (L('L8').s + 2.0), 'pop');
  add(W('L9', 'kirish') || (L('L9').s + 3.0), 'ding');
  add(W('L10', 'buziladi.') || (L('L10').s + 6.5), 'error');

  // yagona_kontekst
  add(W('L11', 'tashlamang.') || (L('L11').s + 6.5), 'error');
  add(W('L12', 'qotirib') || (L('L12').s + 4.8), 'error');
  add(W('L13', 'order-info') || (L('L13').s + 1.5), 'ding');

  // steiger
  for (let i = 0; i < 8; i++) add((W('L14', 'Stayger') || L('L14').s) + 0.15 + i * 0.05, 'tick');
  add(W('L14', 'buzilishlarini') || (L('L14').s + 4.0), 'error');
  add(W('L15', 'tasdiqlaydi.') || (L('L15').s + 5.5), 'ding');

  // xulosa
  add(W('L16', 'Xulosa') || L('L16').s, 'pop');
  add(L('L16').e - 2.0, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
