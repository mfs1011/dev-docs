// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Es-kyu-el'], ['l1', 'qiladi.'],
    ['l2', 'Ekspleyn'], ['l2', 'skanerlash,'], ['l2', 'turadi.'],
    ['l3', 'Oddiy'], ['l3', 'ko\'rsatadi.'],
    ['l4', 'Baza'], ['l4', 'bahodir.'],
    ['l5', 'Ekspleyn'], ['l5', 'chiqaradi.'],
    ['l6', 'Ichki'], ['l6', 'shart.'],
    ['l7', 'O\'ta'], ['l7', 'o\'chiradi.'],
    ['l8', 'Shuning'], ['l8', 'foydalaning.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'turadi.'), 'whoosh'); } catch (e) {}
  try { add(W('l3', 'ko\'rsatadi.'), 'ding'); } catch (e) {}
  try { add(W('l4', 'bahodir.'), 'ding'); } catch (e) {}
  try { add(W('l5', 'chiqaradi.'), 'whoosh'); } catch (e) {}
  try { add(W('l6', 'shart.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'o\'chiradi.'), 'error'); } catch (e) {}
  try { add(W('l8', 'foydalaning.'), 'ding'); } catch (e) {}
  add(L('l8').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
