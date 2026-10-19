// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['intro', 'Sana'], ['intro', 'hisobotlar'], ['intro', 'davriy'], ['intro', 'relyatsion'],
   ['extract', 'Ekstrakt'], ['extract', 'hafta'], ['extract', 'dushanbani'], ['extract', 'aysodov'],
   ['yaxlitlash', 'Deyt'], ['yaxlitlash', 'trank'], ['yaxlitlash', 'bin'], ['yaxlitlash', 'oraliqlarni'],
   ['bosh_kunlar', 'Guruhlashda'], ['bosh_kunlar', 'jenerayt'], ['bosh_kunlar', 'siris'], ['bosh_kunlar', 'koales'], ['bosh_kunlar', 'nollarni'],
   ['farq', 'Sanalar'], ['farq', 'eyj'], ['farq', 'kunlar'], ['farq', 'tranzaksiya'], ['farq', 'kafolatlaydi']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('intro', 'qoidalari'), 'ding'); } catch (e) {}
  try { add(W('extract', 'aysodov'), 'ding'); } catch (e) {}
  try { add(W('yaxlitlash', 'qulaydir.'), 'ding'); } catch (e) {}
  try { add(W('bosh_kunlar', 'nollarni'), 'ding'); } catch (e) {}
  try { add(W('farq', 'kafolatlaydi.'), 'ding'); } catch (e) {}
  add(L('farq').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
