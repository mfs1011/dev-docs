// FSD 22-bob videosi: "Autentifikatsiya" (content/fsd/22-autentifikatsiya.md). Ovoz — Kore, metafora — kirish, token va sessiya xavfsizligi.
(function (g) {
  const scenes = ['intro', 'login_sahifasi_va_dialog', 'token_qayerda_saqlanadi', 'auth_sorovlari_va_refresh', 'logout_va_tozalash', 'tipik_xatolar', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Autentifikatsiya Arxitekturasi',
    login_sahifasi_va_dialog: 'Login Sahifasi yoki Widget Dialogi',
    token_qayerda_saqlanadi: 'Token va Sessiya Qayerda Saqlanadi?',
    auth_sorovlari_va_refresh: 'Auth So\'rovlari va Token Refresh',
    logout_va_tozalash: 'Logout va Sessiyani Xavfsiz Tozalash',
    tipik_xatolar: 'Eng Ko\'p Uchraydigan Auth Xatolari',
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
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining yigirma ikkinchi bobi — Autentifikatsiya arxitekturasi. Bugun kirish, ro'yxatdan o'tish, tokenlarni saqlash va sessiyani boshqarishni FSD qatlamlarida to'g'ri tashkil qilishni o'rganamiz."],
    ['L2', 'intro', "Autentifikatsiya uch asosiy qadamdan iborat: foydalanuvchidan ma'lumot olish, backend'ga yuborish va kelgan tokenni to'g'ri qatlamda saqlash."],

    ['L3', 'login_sahifasi_va_dialog', "Birinchi qadam — UI joylashuvi: to'liq login yoki ikki bosqichli tasdiqlash sahifasi pages/sign-in qatlamida joylashadi."],
    ['L4', 'login_sahifasi_va_dialog', "Agar login shakli har qanday sahifadan ochiladigan modal dialog bo'lsa — u widgets/login-dialog sifatida yaratiladi."],

    ['L5', 'token_qayerda_saqlanadi', "Eng ko'p xato qilinadigan joy — tokenni pages ichida saqlashdir. Boshqa sahifalar unga yeta olmaydi va cross-import taqiqlangan."],
    ['L6', 'token_qayerda_saqlanadi', "Token va joriy foydalanuvchi holati shared/auth yoki alohida entities/session qatlamida saqlanishi shart."],
    ['L7', 'token_qayerda_saqlanadi', "Eng xavfsiz va qulay usul — HttpOnly cookie bo'lib, u frontend kodini ortiqcha token boshqaruvidan butunlay ozod qiladi."],

    ['L8', 'auth_sorovlari_va_refresh', "Login, logout va refresh so'rovlari shared/api/endpoints/auth katalogida markazlashgan holda yoziladi."],
    ['L9', 'auth_sorovlari_va_refresh', "To'rt yuz bir xatosi yuz berganda, client.ts middleware'i yangi access token olish uchun avtomatik ravishda refresh chaqiradi."],
    ['L10', 'auth_sorovlari_va_refresh', "Agar sessiya muddati tugagan bo'lsa, foydalanuvchi to'g'ridan-to'g'ri login sahifasiga yo'naltiriladi."],

    ['L11', 'logout_va_tozalash', "Chiqish tugmasi va uning mantiqi odatda uni ko'rsatuvchi widget'da, masalan header modelida saqlanadi."],
    ['L12', 'logout_va_tozalash', "Oltin qoida: backend logout so'rovi xato bilan tugasa ham, finally blokida mahalliy sessiya va tokenlar darhol tozalanishi kerak."],
    ['L13', 'logout_va_tozalash', "Shuningdek, joriy foydalanuvchini boshqa oddiy user entity'lari bilan aralashtirmaslik lozim."],

    ['L14', 'tipik_xatolar', "Tipik xatolar: tokenni sahifa modelida qoldirish, logout xatosida sessiyani tozalashni unutish yoki localStorage'dan o'rinsiz foydalanish."],
    ['L15', 'tipik_xatolar', "Toza arxitektura orqali autentifikatsiya xavfsiz, barqaror va qulay ishlaydi."],

    ['L16', 'xulosa', "Xulosa: sahifani pages ga, tokenni shared/auth ga qo'ying, logoutda sessiyani tozalang va cookie'dan foydalaning. Keyingi bobda Tiplar va validatsiyani ko'rib chiqamiz. Rahmat!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
