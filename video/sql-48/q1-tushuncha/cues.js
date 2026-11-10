// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Katta'], ['l1', 'usuldir.'],
    ['l2', 'Biroq'], ['l2', "bo'ladi."],
    ['l3', 'Tartiblashda'], ['l3', "qo'shiladi."],
    ['l4', 'Aynan'], ['l4', "ta'minlaydi."],
    ['l5', 'Keyset'], ['l5', 'qolinadi.'],
    ['l6', 'B-tri'], ['l6', "o'qiydi."],
    ['l7', 'Yangi'], ['l7', 'ishlaydi.'],
    ['l8', 'Shuning'], ['l8', 'etiladi.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', "bo'ladi."), 'error'); } catch (e) {}
  try { add(W('l3', "qo'shiladi."), 'ding'); } catch (e) {}
  try { add(W('l4', "ta'minlaydi."), 'ding'); } catch (e) {}
  try { add(W('l5', 'qolinadi.'), 'whoosh'); } catch (e) {}
  try { add(W('l6', "o'qiydi."), 'ding'); } catch (e) {}
  try { add(W('l7', 'dublikat'), 'error'); } catch (e) {}
  try { add(W('l7', 'ishlaydi.'), 'ding'); } catch (e) {}
  try { add(W('l8', 'etiladi.'), 'ding'); } catch (e) {}
  add(L('l8').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
