// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Maxsus'], ['l1', 'imkonini'],
    ['l2', 'Ular'], ['l2', 'ifodalar,'], ['l2', 'qisman'],
    ['l3', 'Katta-kichik'], ['l3', 'oddiy'],
    ['l4', 'Lover'], ['l4', 'tezlashtiradi,'], ['l4', 'unik'], ['l4', 'taqiqlaydi.'],
    ['l5', 'Qisman'], ['l5', 'yaratiladi.'],
    ['l6', 'U'], ['l6', 'o\'nlab'], ['l6', 'himoyalaydi.'],
    ['l7', 'Inklud'], ['l7', 'yuklaydi.'],
    ['l8', 'Baza'], ['l8', 'vakuum'],
    ['l9', 'Standart'], ['l9', 'layk'], ['l9', 'pattern'],
    ['l10', 'U'], ['l10', 'belgima-belgi'], ['l10', 'oraliqqa'], ['l10', 'tezlashtiradi.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l4', 'tezlashtiradi,'), 'ding'); } catch (e) {}
  try { add(W('l4', 'taqiqlaydi.'), 'error'); } catch (e) {}
  try { add(W('l5', 'Qisman'), 'whoosh'); } catch (e) {}
  try { add(W('l6', 'himoyalaydi.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'Inklud'), 'whoosh'); } catch (e) {}
  try { add(W('l8', 'vakuum'), 'ding'); } catch (e) {}
  try { add(W('l9', 'pattern'), 'whoosh'); } catch (e) {}
  try { add(W('l10', 'tezlashtiradi.'), 'ding'); } catch (e) {}
  add(L('l10').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
