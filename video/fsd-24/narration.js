// FSD 24-bob videosi: "Layout'lar" (content/fsd/24-layoutlar.md). Ovoz — Kore, metafora — karkas, slotlar va app/layouts.
(function (g) {
  const scenes = ['intro', 'shared_ui_layout_va_slot', 'teskari_import_xatosi', 'app_layouts_yechimi', 'layout_kerakmi', 'tipik_xatolar', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Layout\'lar Arxitekturasi',
    shared_ui_layout_va_slot: 'shared/ui/layout va PageShell Slotlari',
    teskari_import_xatosi: 'Teskari Import Xatosi (shared → widgets)',
    app_layouts_yechimi: 'app/layouts: Widgetlarni Birlashtirish',
    layout_kerakmi: 'Layout Umuman Kerakmi? Oddiylik Qoidasi',
    tipik_xatolar: 'Layout Boshqaruvidagi Tipik Xatolar',
    xulosa: 'Xulosa va Keyingi Qadam'
  };
  const hold = {
    L1: 0.8,
    L4: 1.2,
    L7: 1.2,
    L10: 1.2,
    L13: 1.2,
    L15: 1.2,
    L16: 0.8
  };
  const lines = [
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining yigirma to'rtinchi bobi — Layout'lar arxitekturasi. Bugun ilova karkaslari, umumiy sarlavhalar va yon panellarni FSD qoidalariga zid kelmagan holda to'g'ri joylashtirishni o'rganamiz."],
    ['L2', 'intro', "Layout bir nechta sahifa umumiy tuzilmaga ega bo'lganda paydo bo'ladigan karkasdir."],

    ['L3', 'shared_ui_layout_va_slot', "Agar layout faqat sof markup, CSS to'ri va tema almashtirish kabi UI mantiqidan iborat bo'lsa — u shared/ui/layout ichida yaratiladi."],
    ['L4', 'shared_ui_layout_va_slot', "Bunday PageShell komponenti hech qanday biznes widget'larini bilmaydi, faqat slot yoki render props orqali joylarni taqdim etadi."],

    ['L5', 'teskari_import_xatosi', "FSD da eng ko'p uchraydigan qoidabuzarlik — shared layout ichiga widgets/header'ni to'g'ridan-to'g'ri import qilishdir."],
    ['L6', 'teskari_import_xatosi', "Bu shared qatlamidan yuqoriga noqonuniy bog'lanish yaratadi va Steiger linteri tomonidan qat'iy to'xtatiladi."],
    ['L7', 'teskari_import_xatosi', "Shared hech qachon o'zidan yuqoridagi widget yoki sahifalarni bilishi mumkin emas."],

    ['L8', 'app_layouts_yechimi', "Xo'sh, ichida widget'lari bor to'liq layoutni qayerda yig'ish kerak? Eng ideal joy — app/layouts katalogidir."],
    ['L9', 'app_layouts_yechimi', "App qatlami eng yuqorida turgani sababli, u header, sidebar va PageShell'ni bemalol import qilib, bitta karkasga birlashtiradi."],
    ['L10', 'app_layouts_yechimi', "So'ngra router konfiguratsiyasida MainLayout asosiy o'ram sifatida barcha sahifalarga qo'llanadi."],

    ['L11', 'layout_kerakmi', "Yangi loyihalarda eng birinchi beriladigan savol: layout umuman kerakmi?"],
    ['L12', 'layout_kerakmi', "Agar karkas atigi ikki-uch qatordan iborat bo'lsa, uni har bir sahifada takrorlash sun'iy abstraksiyadan ancha arzon va qulayroqdir."],
    ['L13', 'layout_kerakmi', "Nusxa ko'chirish sahifalarning bir-biriga bog'lanib qolmasligini ta'minlaydi."],

    ['L14', 'tipik_xatolar', "Tipik xatolar: shared layout'ga widget import qilish, layout ichida sahifaga xos ma'lumotlarni yuklash yoki widgets ichida sahifalarni import qilish."],
    ['L15', 'tipik_xatolar', "Router orqali sahifalarni Outlet bilan ulash har doim toza va xavfsiz yo'ldir."],

    ['L16', 'xulosa', "Xulosa: karkasni shared/ui/layout da, yig'ilganini app/layouts da saqlang va teskari import qilmang. Keyingi bobda Assetlar, stillar va i18n arxitekturasini o'rganamiz. Rahmat!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
