// cues.js — 40-bob: Shpargalka (Grand Finale)
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.olti_qatlam_ierarxiya.s, S.ikki_asosiy_qonun.s, S.kod_qayerga.s, S.segmentlar_va_steiger.s, S.tipik_xatolar.s, S.grand_finale.s].forEach((t) => add(t, 'whoosh'));

  // intro
  add(W('L1', 'shpargalkasi') || 9.5, 'pop');
  add(W('L2', 'mo\'ljallangan') || 18.0, 'ding');

  // olti_qatlam_ierarxiya
  add(W('L3', 'sherd') || 29.5, 'pop');
  add(W('L4', 'bo\'linadi') || 38.0, 'ding');

  // ikki_asosiy_qonun
  add(W('L5', 'bilmaydi') || 49.0, 'pop');
  add(W('L6', 'qiladi') || 58.0, 'ding');

  // kod_qayerga
  add(W('L7', 'yashaydi') || 70.0, 'pop');
  add(W('L8', 'osonroqdir') || 79.0, 'ding');

  // segmentlar_va_steiger
  add(W('L9', 'ishlatiladi') || 91.5, 'pop');
  add(W('L10', 'shart') || 99.5, 'ding');

  // tipik_xatolar
  add(W('L11', 'saqlashdir') || 111.5, 'ding');
  add(W('L12', 'lozim') || 119.5, 'pop');

  // grand_finale
  add(W('L13', 'yakunladik') || 129.5, 'pop');
  add(W('L14', 'olasiz') || 138.0, 'ding');
  add(W('L15', 'qoling') || 146.0, 'pop');
  add(W('L16', 'bo\'lsin') || 151.5, 'ding');
  add(L('L16').e - 2.0, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
