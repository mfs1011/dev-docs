// FSD 7-bob videosi: "shared" (content/fsd/07-shared.md). Ovoz — Kore, metafora — bino poydevori.
(function (g) {
  const scenes = ['intro', 'poydevor', 'segmentlar', 'lib_va_nomlar', 'kod_misol', 'steiger', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Poydevor Qatlami',
    poydevor: "Poydevor Qoidasi va Slice'siz Tuzilma",
    segmentlar: 'Asosiy Segmentlar: api, ui, lib, config',
    lib_va_nomlar: "lib Segmenti va Noto'g'ri Nomlar",
    kod_misol: 'Amaliy Kod: config va routes',
    steiger: 'Steiger Linteri va Xatolar',
    xulosa: 'Xulosa va Keyingi Qadam'
  };
  const hold = {
    L1: 0.8,
    L4: 1.2,
    L7: 1.2,
    L10: 1.2,
    L12: 1.2,
    L15: 1.2,
    L17: 0.8
  };
  const lines = [
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining yettinchi bobi — shared qatlami. Shared — bu butun ilovaning poydevori."],

    ['L2', 'poydevor', "Shared eng pastki qatlam: hamma uni import qilishi mumkin, lekin shared o'zidan yuqoridagi hech qaysi qatlamni ko'rmaydi."],
    ['L3', 'poydevor', "Ushbu qatlamda boshqalardan farqli o'laroq slice'lar bo'lmaydi — faqat to'g'ridan-to'g'ri segmentlar joylashadi."],
    ['L4', 'poydevor', "Shuningdek, shared ichidagi segmentlar bir-birini erkin va o'zaro import qilish huquqiga ega."],

    ['L5', 'segmentlar', "Standart segmentlar ilovaning barcha poydevor ehtiyojlarini to'liq qamrab oladi."],
    ['L6', 'segmentlar', "Api segmenti — backend bilan muloqot qiluvchi klient, umumiy tiplar va so'rov funksiyalaridir."],
    ['L7', 'segmentlar', "Ui segmenti — dasturning umumiy UI kit'i: tugmalar, modallar va karkas layoutlar, lekin bu yerda biznes mantiqi aslo bo'lmasligi shart."],

    ['L8', 'lib_va_nomlar', "Lib segmenti — bu helpers yoki utils degan tartibsiz axlatxona emas."],
    ['L9', 'lib_va_nomlar', "Har bir kutubxona alohida papka va aniq maqsadga ega: masalan sana yoki pul formatlash, qat'iy README bilan."],
    ['L10', 'lib_va_nomlar', "Segmentlarni components, hooks yoki types deb nomlash FSD tamoyillariga ziddir: nom doim maqsadni anglatsin."],

    ['L11', 'kod_misol', "Config va routes segmentlari ilovani mustahkam va tiplangan konstantalar bilan ta'minlaydi."],
    ['L12', 'kod_misol', "Env fayli muhit o'zgaruvchilarini bir joyda tekshirsa, routes obyekti barcha sahifalar URL manzillarini tartibga soladi."],

    ['L13', 'steiger', "Steiger linteri shared qoidalarini ham qat'iy nazorat qiladi."],
    ['L14', 'steiger', "Agar shared ichiga slice ochilsa yoki shared yuqori qatlamdan kod import qilsa, Steiger darhol xatolik beradi."],
    ['L15', 'steiger', "Qoidalar to'g'ri bajarilganda esa arxitektura toza va barqaror deb tasdiqlanadi."],

    ['L16', 'xulosa', "Xulosa qilsak: shared — poydevor, slice'siz erkin segmentlar va biznes mantiqisiz toza instrumentlar to'plamidir."],
    ['L17', 'xulosa', "Keyingi bobda entities qatlamiga qadam qo'yamiz. E'tiboringiz uchun rahmat!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
