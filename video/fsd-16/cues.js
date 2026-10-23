// cues.js — 16-bob: yuqori qatlamda kompozitsiya
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.ioc_tushunchasi.s, S.slotlar_va_render_props.s, S.hodisalar_va_callback.s, S.di_va_kontekst.s, S.steiger.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // intro
  add(W('L1', 'kompozitsiya.') || 6.5, 'pop');
  add(W('L2', 'yonma-yon') || 26.2, 'ding');

  // ioc_tushunchasi
  add(W('L3', 'Invershn') || (L('L3').s + 1.0), 'ding');
  add(W('L3', 'qoldiradi.') || (L('L3').s + 8.5), 'pop');
  add(W('L4', 'beradigan') || (L('L4').s + 5.5), 'ding');

  // slotlar_va_render_props
  add(W('L5', 'slotlar,') || (L('L5').s + 4.0), 'pop');
  add(W('L6', 'Prodakt') || (L('L6').s + 1.5), 'ding');
  add(W('L6', 'Edd') || (L('L6').s + 5.5), 'pop');
  add(W('L7', 'bog\'lanmaydi') || (L('L7').s + 4.0), 'ding');

  // hodisalar_va_callback
  add(W('L8', 'yangilanishi') || (L('L8').s + 4.0), 'pop');
  add(W('L9', 'promokod') || (L('L9').s + 0.5), 'ding');
  add(W('L10', 'on') || (L('L10').s + 1.5), 'ding');
  add(W('L10', 'yuklaydi.') || (L('L10').s + 6.5), 'ding');

  // di_va_kontekst
  add(W('L11', 'Dependensi') || (L('L11').s + 5.0), 'ding');
  add(W('L12', 'bas') || (L('L12').s + 2.0), 'error');
  add(W('L13', 'murakkablashtiradi.') || (L('L13').s + 4.5), 'error');

  // steiger
  for (let i = 0; i < 8; i++) add((W('L14', 'Stayger') || L('L14').s) + 0.15 + i * 0.05, 'tick');
  add(W('L14', 'noqonuniy') || (L('L14').s + 2.0), 'error');
  add(W('L15', 'tasdiqlaydi.') || (L('L15').s + 4.5), 'ding');

  // xulosa
  add(W('L16', 'Xulosa') || L('L16').s, 'pop');
  add(L('L16').e - 2.0, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
