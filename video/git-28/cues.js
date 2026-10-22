// Ovoz effektlari: so'zlar va sahnaga mos pop, whoosh, ding va swell effektlari
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [
    ['l1', 'Salom!'], ['l1', 'o‘rganamiz.'],
    ['l2', 'Git\'da'], ['l2', 'branchlar.'],
    ['l3', 'git'], ['l3', 'qulaydir.'],
    ['l4', 'Git'], ['l4', 'o‘rnatiladi.'],
    ['l5', 'git'], ['l5', 'ko‘rsatadi.'],
    ['l6', 'Ahead'], ['l6', 'bildiradi.'],
    ['l7', 'Yangi'], ['l7', 'o‘rnatadi.'],
    ['l8', 'push.autoSetupRemote'], ['l8', 'ulanadi.'],
    ['l9', 'Ishi'], ['l9', 'tashlaymiz.'],
    ['l10', 'Boshqa'], ['l10', 'foydalaniladi.'],
    ['l11', 'Remote'], ['l11', 'saqlanadi.'],
    ['l12', 'Keyingi'], ['l12', 'qilamiz.']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('l2', 'branchlar.'), 'ding'); } catch (e) {}
  try { add(W('l3', 'qulaydir.'), 'whoosh'); } catch (e) {}
  try { add(W('l4', 'o‘rnatiladi.'), 'ding'); } catch (e) {}
  try { add(W('l5', 'ko‘rsatadi.'), 'pop'); } catch (e) {}
  try { add(W('l6', 'bildiradi.'), 'ding'); } catch (e) {}
  try { add(W('l7', 'o‘rnatadi.'), 'whoosh'); } catch (e) {}
  try { add(W('l8', 'ulanadi.'), 'ding'); } catch (e) {}
  try { add(W('l9', 'tashlaymiz.'), 'pop'); } catch (e) {}
  try { add(W('l10', 'foydalaniladi.'), 'ding'); } catch (e) {}
  try { add(W('l11', 'saqlanadi.'), 'ding'); } catch (e) {}
  add(L('l12').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
