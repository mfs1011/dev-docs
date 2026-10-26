// cues.js — 21-bob: Server holati
(function (g) {
  const { L, W } = g.SY;
  const S = g.TM.scenes;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });

  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  [S.query_factory.s, S.kesh_invalidatsiyasi.s, S.mutatsiyalar_joyi.s, S.yagona_query_klient.s, S.tipik_xatolar.s, S.xulosa.s].forEach((t) => add(t, 'whoosh'));

  // intro
  add(W('L1', 'Server') || 5.3, 'pop');
  add(W('L2', 'holatidir') || 25.36, 'ding');

  // query_factory
  add(W('L3', 'fektori') || 32.92, 'ding');
  add(W('L4', 'birlashtiring') || 45.09, 'pop');

  // kesh_invalidatsiyasi
  add(W('L5', 'yangilaydi') || 56.31, 'ding');
  add(W('L6', 'invalideyt') || 63.42, 'ding');
  add(W('L7', 'oshiradi') || 69.36, 'pop');

  // mutatsiyalar_joyi
  add(W('L8', 'aralashtirmang') || 74.98, 'ding');
  add(W('L9', 'saqlanadi') || 87.43, 'pop');
  add(W('L10', 'yangilanadi') || 92.96, 'ding');

  // yagona_query_klient
  add(W('L11', 'yaratilib') || 102.48, 'pop');
  add(W('L12', 'keladi') || 110.23, 'ding');
  add(W('L13', 'manbaidir') || 117.79, 'ding');

  // tipik_xatolar
  add(W('L14', 'joylashtirish') || 129.32, 'ding');
  for (let i = 0; i < 6; i++) add((W('L15', 'Kveri') || L('L15').s) + 0.15 + i * 0.05, 'tick');
  add(W('L15', 'qutulasiz') || 135.3, 'ding');

  // xulosa
  add(W('L16', 'Xulosa') || 139.24, 'pop');
  add(L('L16').e - 2.0, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
