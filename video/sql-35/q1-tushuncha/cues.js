// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['intro', 'Jey-son'], ['intro', 'relyatsion'], ['intro', 'dinamik'],
   ['types', 'Postgresda'], ['types', 'aniq'], ['types', 'jey-son-bi'], ['types', 'binar'], ['types', 'tozalaydi'],
   ['ops', 'Tire-katta'], ['ops', 'toza'], ['ops', 'matn'], ['ops', 'panjara'],
   ['contain', 'Kuchukcha-katta'], ['contain', 'to\'liq'], ['contain', 'so\'roq'], ['contain', 'kalit'],
   ['design', 'yangilanganda'], ['design', 'qulflanadi'], ['design', 'oddiy'], ['design', 'jin'], ['design', 'indeksi']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('intro', 'qiladi.'), 'ding'); } catch (e) {}
  try { add(W('types', 'ta\'minlaydi.'), 'ding'); } catch (e) {}
  try { add(W('ops', 'oladi.'), 'ding'); } catch (e) {}
  try { add(W('contain', 'aniqlaydi.'), 'ding'); } catch (e) {}
  try { add(W('design', 'zarur.'), 'ding'); } catch (e) {}
  add(L('design').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
