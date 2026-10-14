// Ovoz effektlari: anim.js dagi harakatlar bilan bir xil so'z bog'lanishlari (SY.W) -> [vaqt, tur]
(function (g) {
  const { L, W } = g.SY;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });
  const TMs = g.TM.scenes;
  add(0.3, 'swell');
  for (let i = 0; i < 6; i++) add(0.4 + i * 0.28 + 0.55, 'thunk');
  // kamera ko'chishlari
  [TMs.savollar.s, TMs.daraja.s, W('L8', 'qavat') - 0.3, W('L9', 'xona') - 0.3, TMs.kimga.s, W('L13', 'bir') - 0.4, W('L14', 'ikkinchisi') - 0.3, TMs.xulosa.s].forEach((t) => add(t, 'whoosh'));
  // savollar
  add(W('L2', 'frontend'), 'pop');
  add(W('L3', 'birinchisi'), 'pop'); add(W('L3', 'papkaga'), 'pop');
  add(W('L4', 'ikkinchisi'), 'pop'); add(W('L4', 'import'), 'lift');
  add(W('L5', 'uchinchisi'), 'pop'); add(W('L5', 'interfeysi'), 'thunk');
  add(W('L6', 'yangi'), 'ding');
  // daraja
  add(W('L7', 'qatlam'), 'pop');
  add(W('L8', 'prodakt') - 0.3, 'pop'); add(W('L8', 'kart') - 0.3, 'pop');
  ['yu-ay', 'ey-pi-ay', 'model'].forEach((w) => add(W('L9', w), 'pop'));
  // kimga
  ['frontend', 'veb', 'mobil', 'desktop'].forEach((w) => add(W('L10', w), 'pop'));
  add(W('L10', 'kutubxona'), 'error'); add(W('L10', 'ilova'), 'ding');
  ['react', 'vyu', 'angular'].forEach((w) => add(W('L11', w), 'pop')); add(W('L11', 'qoidalar'), 'ding');
  add(W('L12', 'istalgan'), 'pop');
  // foyda
  add(W('L13', 'bir') + 0.4, 'thunk');
  add(W('L14', 'ozgartirsangiz'), 'pop'); add(W('L14', 'kutilmagan'), 'ding');
  add(W('L15', 'umumiy'), 'pop'); add(W('L15', 'lokal'), 'pop');
  ['linteri', 'generatorlari', 'misollari'].forEach((w) => add(W('L16', w), 'pop'));
  // qachon
  add(W('L17', 'rasmiy'), 'pop'); add(W('L17', 'ishlayotgan'), 'ding');
  ['sherd', 'peyjiz', 'ep'].forEach((w) => add(W('L18', w), 'pop'));
  for (let i = 0; i < 3; i++) add(W('L19', 'bosqichma') + 0.4 + i * 0.6, 'thunk');
  // xatolar
  add(W('L20', 'birinchisi'), 'error'); add(W('L20', 'uchta'), 'ding');
  add(W('L21', 'modyuls'), 'blip'); add(W('L21', 'tavsiya'), 'error');
  add(W('L22', 'uchinchisi'), 'error');
  for (let i = 0; i < 12; i++) add(L('L23').s + 0.1 + i * 0.05, 'tick');
  for (let i = 0; i < 3; i++) add(L('L23').s + 0.4 + i * 0.4, 'error');
  // xulosa
  ['qavat', 'xona', 'segmentga', 'pastga'].forEach((w) => add(W('L24', w), 'pop'));
  add(L('L25').s, 'swell');
  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);
