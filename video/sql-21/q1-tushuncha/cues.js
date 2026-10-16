// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'Bazaga'], ['L1', 'millionlab'], ['L1', 'bittalab'], ['L1', 'insert'], ['L1', 'diskka'],
   ['L2', 'May'], ['L2', 'avtokommitni'], ['L2', 'tranzaksiyaga'],
   ['L3', 'Postgres'], ['L3', 'tez'], ['L3', 'kopi'],
   ['L4', 'Kopi'], ['L4', 'pi-es-kyu-el'], ['L4', 'bek-slesh'],
   ['L5', 'Maksimal'], ['L5', 'indekslar'], ['L5', 'tahlil'],
   ['L6', 'Postgres'], ['L6', 'e’tiborsiz'], ['L6', 'chegarasini']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('L1', 'bittalab'), 'strike'); } catch (e) {}
  try { add(W('L2', 'tranzaksiyaga'), 'ding'); } catch (e) {}
  try { add(W('L3', 'kopi'), 'ding'); } catch (e) {}
  try { add(W('L4', 'bek-slesh'), 'ding'); } catch (e) {}
  try { add(W('L5', 'tahlil'), 'ding'); } catch (e) {}
  try { add(W('L6', 'chegarasini'), 'ding'); } catch (e) {}
  add(L('L6').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
