# 01 — Deploy nima

[Mundarija](README.md)

## Tushuncha

**Deploy** (joylashtirish) — kodni repozitoriydan serverga yetkazish, uni ishga tushirish va eski versiya o'rniga qo'yish. Har deploy uch savolga javob beradi:

| Savol | Bu kitobda |
| --- | --- |
| Kod serverga **qanday yetadi**? | Qo'lda (4-bob), GitHub Actions'dan SSH orqali (13-bob), image sifatida (19-bob) |
| **Qayerga** joylanadi? | Har versiya — alohida papka, `current` — joriysiga havola (5-bob) |
| Eskisi **qanday almashtiriladi**? | Restart (8, 16-boblar), ikki nusxa (17-bob), socket activation (18-bob) |

### Uzluksiz integratsiya (CI)

GH (Continuous integration): **uzluksiz integratsiya** (CI — continuous integration) — kodni umumiy repozitoriyga tez-tez commit qilish amaliyoti. Kod qancha tez-tez qo'shilsa, xato shuncha erta topiladi va qidirish kerak bo'lgan kod shuncha kam bo'ladi. Har commit'da kod avtomatik yig'iladi (build) va sinaladi: linter (kod uslubini tekshiruvchi), xavfsizlik tekshiruvlari, testlar. Buning uchun server kerak — lokal kompyuter yoki repozitoriydagi yangi commit'larni kuzatuvchi CI serveri.

### Uzluksiz deploy (CD)

GH (Continuous deployment): **uzluksiz deploy** (CD — continuous deployment) — dastur yangilanishlarini avtomatika bilan chiqarish va joylashtirish. Odatiy CD jarayonida kod deploydan **oldin** avtomatik yig'iladi va sinaladi. CD ko'pincha CI bilan birga ishlatiladi.

GH: CD workflow quyidagilarda ishga tushishi mumkin:

- hodisa bo'lganda (masalan, asosiy branch'ga yangi kod push qilinganda);
- jadval bo'yicha;
- qo'lda;
- tashqi hodisada (repository dispatch webhook).

GitHub Actions deployni nazorat qilish uchun imkoniyatlar beradi: **muhitlar** (environment) — job davom etishi uchun tasdiq talab qilish, qaysi branch'lar ishga tushira olishini cheklash, sirlarga kirishni cheklash (12-bob); **concurrency** — bir vaqtda bir nechta deployni cheklash (14-bob).

### Qo'lda va uzluksiz deploy

| | Qo'lda | Uzluksiz (CD) |
| --- | --- | --- |
| Kim bajaradi | Odam, serverga kirib | Workflow, hodisa bo'yicha |
| Test | Esdan chiqishi mumkin | Har safar deploydan oldin (GH) |
| Takrorlanishi | Har safar biroz boshqacha | Har safar bir xil qadamlar |
| Qachon foydali | Birinchi marta, jarayonni tushunish (4-bob) | Doimiy ish |

Kitob tartibi shundan: avval hammasini **qo'lda** qilib, har qadamni tushunamiz (I–II qismlar), keyin o'sha qadamlarni GitHub Actions'ga topshiramiz (III qism).

### GitHub Actions tarkibi

GH (Understanding GitHub Actions):

| Tushuncha | Nima |
| --- | --- |
| **Workflow** | Bir yoki bir nechta job'ni bajaradigan sozlanadigan avtomatik jarayon. Repozitoriydagi `.github/workflows` papkasidagi YAML fayl |
| **Event** (hodisa) | Workflow'ni ishga tushiradigan faoliyat: pull request ochilishi, push, issue yaratilishi; yoki jadval, qo'lda |
| **Job** | Bitta runner'da bajariladigan step'lar to'plami. Standart holatda job'lar bir-biriga bog'liq emas va **parallel** ishlaydi; bog'liqlik berilsa — kutadi |
| **Step** | Shell skript yoki action. Ketma-ket bajariladi, bir runner'da bo'lgani uchun ma'lumot almasha oladi |
| **Action** | Qayta ishlatiladigan tayyor vazifa: repozitoriyni olish, kerakli vositalarni o'rnatish va h.k. |
| **Runner** | Workflow'ni bajaradigan server; bir vaqtda bitta job. GitHub Ubuntu, Windows va macOS runner'larini beradi — har workflow ishi yangi virtual mashinada; o'zingizniki ham bo'lishi mumkin (self-hosted) |

### Nol to'xtovli deploy

Bu kitobdagi ta'rif: **nol to'xtovli deploy** (zero-downtime deployment) — yangi versiyaga o'tish paytida foydalanuvchi so'rovlaridan **birortasi ham** xato (masalan, 502) yoki uzilish bilan tugamaydi. Rasmiy hujjatlarda bitta ta'rif yo'q; kitobda uni o'lchab tekshiramiz: deploy paytida uzluksiz so'rov yuborib, xatolarni sanaymiz (16-bob).

To'xtash qayerdan keladi va uni qanday yo'qotish:

| Usul | Bob | Natija |
| --- | --- | --- |
| Oddiy restart | 16 | Ilova qayta ishga tushguncha so'rovlar xato |
| Ikki nusxa + nginx `reload` | 17 | Yangisi tayyor bo'lgach trafik o'tkaziladi |
| systemd socket activation | 18 | Portni systemd ushlab turadi, ulanishlar kutadi |
| Docker Compose `up --no-deps -d` | 19 | Servis to'xtatiladi, o'chiriladi va qayta yaratiladi (DK) — qisqa to'xtash |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Testsiz deploy | Xato production'ga tushadi | CD'da build va test deploydan oldin (GH) |
| Har safar serverda qo'lda, yodda | Qadamlar unutiladi, har safar boshqacha | Skript yoki workflow |
| Darhol avtomatlashtirish | Nima avtomatlashganini tushunmay qolish | Avval qo'lda (4-bob) |
| Eski versiyani o'chirib, yangisini qo'yish | Muammo bo'lsa qaytish yo'q | Release papkalari (5-bob), orqaga qaytarish (20-bob) |
| "Restart tez — to'xtash yo'q" deb o'ylash | Restart paytida so'rovlar xato (16-bob) | O'lchash va nol to'xtovli usul |

## Amaliyot

1. Deploy qaysi uch savolga javob beradi?
2. CI va CD farqi nima?
3. GH bo'yicha CD workflow qachon ishga tushishi mumkin?
4. Job va step farqi?
5. Kitobda "nol to'xtovli" qanday tekshiriladi?

<details>
<summary>Javoblar</summary>

1. Kod qanday yetadi, qayerga joylanadi, eskisi qanday almashtiriladi.
2. CI — tez-tez commit va har commit'da build hamda test; CD — sinalgan kodni avtomatik chiqarish va joylashtirish.
3. Hodisada (push), jadval bo'yicha, qo'lda yoki tashqi hodisada (repository dispatch).
4. Job — bitta runner'dagi step'lar to'plami; step — bitta skript yoki action.
5. Deploy paytida uzluksiz so'rov yuborib, xato javoblarni sanash.

</details>

## Rasmiy hujjat

- [GH: Continuous deployment](https://docs.github.com/en/actions/get-started/continuous-deployment)
- [GH: Continuous integration](https://docs.github.com/en/actions/get-started/continuous-integration)
- [GH: Understanding GitHub Actions](https://docs.github.com/en/actions/get-started/understand-github-actions)
