// narration.js — 28-bob: Remote branch'lar va kuzatish
(function (g) {
  const scenes = [
    'intro',
    'tracking_va_switch',
    'ahead_va_behind',
    'remote_branch_push',
    'delete_va_prune',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'Kirish: Uch Xil Branch va Remote-Tracking',
    tracking_va_switch: 'Tracking va Yangi Branch Ochish',
    ahead_va_behind: 'Ahead va Behind Hisobi',
    remote_branch_push: 'Yangi Branch Push va autoSetupRemote',
    delete_va_prune: 'Masofaviy Branchlarni O‘chirish va Prune',
    xulosa: 'Xulosa va Keyingi Qadam'
  };

  const hold = {
    l2: 1.5,
    l4: 2.0,
    l6: 2.0,
    l8: 2.0,
    l10: 2.0,
    l12: 2.0
  };

  const lines = [
    {
      id: 'l1',
      scene: 'intro',
      text: 'Salom! Ushbu yigirma sakkizinchi bobda Git\'da remote branchlar, kuzatuvchi tarmoqlar va ularning ichki mexanizmlarini batafsil o‘rganamiz.'
    },
    {
      id: 'l2',
      scene: 'intro',
      text: 'Git\'da uch xil tarmoq mavjud: lokal branchlar, serverdagi branchlar hamda server holatini xatcho‘p kabi eslab qoluvchi remote-tracking branchlar.'
    },
    {
      id: 'l3',
      scene: 'tracking_va_switch',
      text: 'git switch qidiruv buyrug‘i orqali remote-tracking branchdan avtomatik ravishda kuzatuvchi lokal branch ochish juda qulaydir.'
    },
    {
      id: 'l4',
      scene: 'tracking_va_switch',
      text: 'Git konfiguratsiyasida branch nuqta remote va branch nuqta merge qatorlari orqali tarmoqlar o‘rtasida to‘g‘ridan-to‘g‘ri bog‘liqlik o‘rnatiladi.'
    },
    {
      id: 'l5',
      scene: 'ahead_va_behind',
      text: 'git status va git branch -vv buyruqlari sizning lokal branchingiz serverdan necha commit oldinda yoki orqadaligini aniq ko‘rsatadi.'
    },
    {
      id: 'l6',
      scene: 'ahead_va_behind',
      text: 'Ahead raqami hali push qilinmagan commitlarni, behind esa serverda bor, ammo hali olib birlashtirilmagan yangi ishlarni bildiradi.'
    },
    {
      id: 'l7',
      scene: 'remote_branch_push',
      text: 'Yangi branchni birinchi marta yuborishda git push -u origin buyrug‘i serverda branch yaratadi va upstream bog‘liqligini o‘rnatadi.'
    },
    {
      id: 'l8',
      scene: 'remote_branch_push',
      text: 'push.autoSetupRemote sozlamasini yoqib qo‘ysak, kelgusida barcha yangi tarmoqlar birgina oddiy git push buyrug‘i bilan avtomatik ulanadi.'
    },
    {
      id: 'l9',
      scene: 'delete_va_prune',
      text: 'Ishi tugagan masofaviy branchni git push origin --delete buyrug‘i yordamida serverdan xavfsiz o‘chirib tashlaymiz.'
    },
    {
      id: 'l10',
      scene: 'delete_va_prune',
      text: 'Boshqa jamoa a’zolarida qolib ketgan eskirgan xatcho‘plarni tozalash uchun esa git fetch --prune buyrug‘idan foydalaniladi.'
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: 'Remote branchlar va prune amaliyoti orqali ombordagi barcha tarmoqlar doimo sarishta, toza va aniq sinxron holatda saqlanadi.'
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: 'Keyingi bobda fetch va push amallarining ichki protokollari, refspeklar va tarmoq trafigini to‘liq tahlil qilamiz.'
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
