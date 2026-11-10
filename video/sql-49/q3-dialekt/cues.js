// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'May'], ['l1', 'ful-tekst'],
    ['l2', 'Metch'], ['l2', 'bulien'], ['l2', 'qo\'llaniladi.'],
    ['l3', 'Inno-de-be'], ['l3', 'olmaydi.'],
    ['l4', "So'z"], ['l4', 'engrem'], ['l4', 'foydalaniladi.'],
    ['l5', 'Es-kyu-laytda'], ['l5', 'ef-ti-es-besh'], ['l5', 'etiladi.'],
    ['l6', 'Qidiruv'], ['l6', 'be-em-yigirma-besh'], ['l6', 'hisoblanadi.'],
    ['l7', 'Postgresda'], ['l7', 'May'], ['l7', 'Es-kyu-laytda'],
    ['l8', "O'zbek"], ['l8', 'prefiks'], ['l8', 'amaliyotdir.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l1', 'ishlaydi.'), 'ding'); } catch (e) {}
  try { add(W('l2', "qo'llaniladi."), 'ding'); } catch (e) {}
  try { add(W('l3', 'olmaydi.'), 'error'); } catch (e) {}
  try { add(W('l4', 'foydalaniladi.'), 'ding'); } catch (e) {}
  try { add(W('l5', 'etiladi.'), 'whoosh'); } catch (e) {}
  try { add(W('l6', 'hisoblanadi.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'keladi.'), 'ding'); } catch (e) {}
  try { add(W('l8', 'amaliyotdir.'), 'ding'); } catch (e) {}
  add(L('l8').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
