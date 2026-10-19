// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['intro', 'Sana'], ['intro', 'relyatsion'], ['intro', 'tafovutlar'], ['intro', 'saqlash'],
   ['hafta_kuni', 'deyt'], ['hafta_kuni', 'trank'], ['hafta_kuni', 'format'], ['hafta_kuni', 'dushanbaga'],
   ['bosh_kunlar', 'Postgresdagi'], ['bosh_kunlar', 'jenerayt'], ['bosh_kunlar', 'rekursiv'], ['bosh_kunlar', 'si-ti-i'],
   ['farq', 'Sanalar'], ['farq', 'taym-stemp'], ['farq', 'lest'], ['farq', 'mans'],
   ['joriy_vaqt', 'Joriy'], ['joriy_vaqt', 'now'], ['joriy_vaqt', 'NOW'], ['joriy_vaqt', 'operator'], ['joriy_vaqt', 'portativ']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('intro', 'qiladi.'), 'ding'); } catch (e) {}
  try { add(W('hafta_kuni', 'beradi.'), 'ding'); } catch (e) {}
  try { add(W('bosh_kunlar', 'qilinadi.'), 'ding'); } catch (e) {}
  try { add(W('farq', 'mavjud.'), 'ding'); } catch (e) {}
  try { add(W('joriy_vaqt', 'etiladi.'), 'ding'); } catch (e) {}
  add(L('joriy_vaqt').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
