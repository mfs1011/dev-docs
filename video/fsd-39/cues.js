// cues.js — 39-bob: Tez-tez beriladigan savollar
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.asoslar_faq.s, S.qatlam_tanlash_faq.s, S.chegaralar_faq.s, S.steiger_va_asboblar_faq.s, S.frameworklar_faq.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // intro
  add(W('L1', 'yechimlari') || 10.5, 'pop');
  add(W('L2', 'ajratamiz') || 20.0, 'ding');

  // asoslar_faq
  add(W('L3', 'bo\'ladi') || 30.0, 'pop');
  add(W('L4', 'taqiqlanadi') || 38.5, 'ding');

  // qatlam_tanlash_faq
  add(W('L5', 'joylashadi') || 50.0, 'pop');
  add(W('L6', 'saqlanadi') || 59.0, 'ding');
  add(W('L7', 'ishlayveradi') || 67.0, 'ding');

  // chegaralar_faq
  add(W('L8', 'birlashadi') || 79.0, 'pop');
  add(W('L9', 'birlashtiriladi') || 87.0, 'ding');

  // steiger_va_asboblar_faq
  add(W('L10', 'shart') || 99.5, 'pop');
  add(W('L11', 'foydalaniladi') || 108.0, 'ding');

  // frameworklar_faq
  add(W('L12', 'ishlatiladi') || 122.0, 'pop');
  add(W('L13', 'qo\'llaniladi') || 131.0, 'ding');

  // xulosa
  add(W('L14', 'kelishuvdir') || 143.0, 'ding');
  add(W('L15', 'jamlaymiz') || 149.5, 'pop');
  add(W('L16', 'eting') || 155.5, 'ding');
  add(L('L16').e - 2.0, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
