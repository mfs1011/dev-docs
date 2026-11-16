# 23 — Frontend: dizayndan kod va brauzerda tekshirish

[Mundarija](README.md)

## Tushuncha

Frontend'da 8-bobdagi muammo yanada keskin: kod kompilyatsiya bo'ladi, testlar o'tadi, lekin sahifa **ko'rinishda** noto'g'ri
bo'lishi mumkin. Tugma joyidan siljigan, summa chiqmagan yoki konsolda xato bor. Bularni agent faqat kodni o'qib bila olmaydi.
Unga **ko'z** kerak: maket rasmi va brauzer.

Bu bobda ikki vosita bor:

1. **Rasm** — maket (dizayn) skrinshotidan kod (10-bob).
2. **Brauzer** — agent sahifani o'zi ochadi, konsolni o'qiydi, skrinshot oladi.

### Maketdan kod

CC (Common workflows) rasm bilan ishlash misollarida frontend uchun ikkita so'rov bor:

```text
Generate CSS to match this design mockup
What HTML structure would recreate this component?
```

CP (Prompting best practices) bir ogohlantirish beradi: ko'rsatmasiz modellar umumiy, andozaviy naqshlarga og'ishi mumkin.
Foydalanuvchilar buni "AI slop" uslubi deb atashadi. CP'dagi namuna ko'rsatmadan asosiy fikrlar:

| Yo'nalish | Tavsiya |
| --- | --- |
| Shrift | Umumiy shriftlardan (Arial, Inter) qochib, o'ziga xos tanlov |
| Rang va mavzu | Yaxlit uslub; izchillik uchun CSS o'zgaruvchilari; ustun rang va keskin urg'u |
| Harakat | Effekt va mikro-interaksiyalar; HTML uchun avval faqat CSS yechimi |
| Fon | Bir xil rang o'rniga chuqurlik: gradient qatlamlari, naqshlar |

Bu tavsiya maket **yo'q** holat uchun. Maket bor bo'lsa, eng yaxshi ko'rsatma — maketning o'zi va "maketga yaqin bo'lsin" degan
talab.

### Brauzerdagi agent

CC (Use Claude Code with Chrome): Claude Code **Claude in Chrome** kengaytmasi bilan ishlaydi. Agent brauzer avtomatlashtirish
imkoniyatini oladi: kodni yozadi, keyin kontekstni almashtirmasdan brauzerda sinaydi va xatoni topadi. Hujjatdagi imkoniyatlar:

| Imkoniyat | Nima |
| --- | --- |
| Jonli debug | Konsol xatolari va DOM holatini o'qib, ularga sabab bo'lgan kodni tuzatish |
| Dizaynni tekshirish | Maketdan UI qurib, brauzerda ochib, mosligini tekshirish |
| Veb-ilovani sinash | Forma validatsiyasi, vizual regressiya, foydalanuvchi oqimlari |
| Hisobga kirilgan ilovalar | Siz kirgan saytlar bilan API'siz ishlash |
| GIF yozib olish | Brauzerdagi harakatlarni hujjatlash yoki ulashish uchun |

Ishga tushirish (CC Chrome):

```bash
claude --chrome
```

- `/chrome` — ulanish holati, ruxsatlar, kengaytmani qayta ulash. Holat panelida "Status: Enabled" va "Extension: Installed"
  bo'lsa, integratsiya ishlayapti.
- `/chrome` → **Enabled by default** — har safar `--chrome` yozmaslik uchun. CC ogohlantiradi: bu kontekst sarfini oshiradi,
  chunki brauzer tool'lari va ko'rsatmalari doim yuklanadi (12-bob).

Talablar: Chrome, Edge yoki boshqa Chromium brauzeri; kengaytma 1.0.36 va undan yangi; to'g'ridan-to'g'ri Anthropic tarifi
(Pro, Max, Ultra, Team yoki Enterprise) va `/login` bilan kirish. CC bo'yicha API kaliti yoki `claude setup-token` bilan kirilsa,
Chrome integratsiyasi o'chiq qoladi.

Ikki xavfsizlik tafsiloti (CC Chrome):

- agent brauzeringizning **kirish holatini** baham ko'radi, ya'ni siz kirgan istalgan saytga kira oladi. Saytlar bo'yicha ruxsatlar
  kengaytma sozlamalarida boshqariladi;
- login sahifasi yoki CAPTCHA'ga duch kelsa, agent to'xtaydi va uni sizdan qo'lda hal qilishni so'raydi.

CC konsol bilan ishlash haqida maslahat beradi: butun konsol chiqishini so'ramang, loglar ko'p bo'ladi. Qaysi naqshni qidirish
kerakligini ayting:

```text
Open the dashboard page and check the console for any errors when the page loads.
```

## Amalda

Ikki qadam: agent maketdan sahifa yasaydi, keyin sahifa brauzerda tekshiriladi.

### 1. Maketdan sahifa

Maket — savat kartasi (`maket.png`): "Savat" sarlavhasi, "2 ta mahsulot", ikki qator (Choynak × 1 — 85 000 so'm, Piyola × 6 —
48 000 so'm), "Jami 133 000 so'm" va yashil "Buyurtma berish" tugmasi.

So'rov (Claude Code 2.1.325):

```text
maket.png dagi savat kartasini index.html qilib yasa: bitta fayl, tashqi kutubxonasiz. Mahsulotlar JS massivdan chiqarilsin;
jami summa va 'N ta mahsulot' kodda hisoblansin (qo'lda yozilmasin). Ranglar va joylashuv maketga yaqin bo'lsin.
```

Agentning javobidan ikki joy diqqatga sazovor:

```text
Brauzerda ochib tekshirmadim: skrinshot olish uchun Chrome'ni ishga tushirish buyrug'iga ruxsat berilmadi.
Shu sabab maketga qanchalik o'xshashini bir ochib ko'rib qo'ying.
...
- **"N ta mahsulot":** kodda hisoblanadi va massivdagi mahsulot turlari sonini ko'rsatadi, donalarni emas.
  Maketda 7 dona bo'lsa ham "2 ta" deb yozilgani uchun shunday qildim.
```

Birinchisi — halol cheklov: agent natijani ko'rmagan. Ikkinchisi — maketdan chiqarilgan qaror: "2 ta mahsulot" turlarni sanaydi.
Maket buni aniq aytmaydi, agent esa raqamlarga qarab xulosa chiqardi. Bu qarorni siz tasdiqlashingiz kerak.

Kod ichida hisob haqiqatan kodda:

```js
const total = products.reduce((acc, p) => acc + p.price * p.qty, 0);
document.getElementById("cart-count").textContent = `${products.length} ta mahsulot`;
```

Sahifa lokal serverda (`python3 -m http.server`) ochildi va Claude in Chrome bilan tekshirildi. Mazmun maketga mos chiqdi:
qatorlar, summalar, jami 133 000 so'm, ranglar va tugma, konsolda xato yo'q. Bitta farq bor edi: maketda karta markazda,
sahifada esa chap yuqori burchakda. Bunday farqni testlar ham, typecheck ham ko'rsatmaydi, faqat ko'z ko'radi.

### 2. Konsoldagi xato

Sahifaga ataylab xato kiritildi: HTML'dagi `id="cart-total"` `cart-sum` ga o'zgartirildi, skript esa hamon `cart-total` ni
qidiradi. So'rov ichki sinov sessiyasida `--chrome` bilan berildi:

```text
Sahifada jami summa ko'rinmayapti. http://127.0.0.1:5191/index.html ni brauzerda ochib, konsol xatolarini o'qi,
sababini top va index.html ni tuzat. Keyin sahifani qayta ochib, xato yo'qolganini va jami ko'rinishini tekshir.
```

Sessiyada brauzer tool'lari bor edi, lekin birinchi brauzer chaqiruvi `Claude in Chrome requires permission` qaytardi. Skript
rejimida (`-p`) ruxsat so'rovini tasdiqlaydigan odam yo'q. Agent xatoni koddan topdi va tuzatdi, lekin buni ochiq aytdi:

```text
I fixed `index.html`, but I couldn't check it in the browser. Claude in Chrome needs permission, ...
**Cause (found by reading the code):** The total element in the HTML has `id="cart-sum"` (`index.html:99`), but the script
looked for `cart-total` (`index.html:134`). `getElementById("cart-total")` returns `null`, so setting `.textContent` on it
throws a `TypeError` and the total is never written. This is the error I expected to find in the console. I haven't seen
it there myself.
```

Tekshiruvni interaktiv sessiyada Claude in Chrome bilan bajardik. **Xatoli holat**, konsol:

```text
[EXCEPTION] (http://127.0.0.1:5191/index.html?xato:133:54)
TypeError: Cannot set properties of null (setting 'textContent')
```

Sahifada "Jami" yozuvi bor, summa esa bo'sh. Agent "kutgan" xato aynan shu edi.

**Tuzatilgan holat:** konsolda xato yo'q, "Jami 133 000 so'm" ko'rinyapti.

Saboq: brauzer tekshiruvi agent kodni o'qib chiqargan xulosani **tasdiqladi**. Bu yerda xulosa to'g'ri edi. Ko'rinishga oid
murakkabroq xatoda esa (siljigan element, yashirin overflow) faqat brauzer haqiqatni ko'rsatadi. 8-bobdagi qoida frontend uchun
shunday bo'ladi: **agentga ko'rish imkonini bering** — maket rasmi va brauzer. Skrinshot ham tekshiruv: CC (Best practices)
"maket yonidagi brauzer skrinshoti"ni tekshiruv turlari qatoriga qo'shadi.

## Variantlar

| Usul | Yutug'i | Kamchiligi | Qachon |
| --- | --- | --- | --- |
| Matn bilan tasvirlash | Tez | Ko'rinishni so'z bilan aniq berish qiyin | Kichik o'zgarish |
| Maket rasmi | Agent nima kerakligini ko'radi | Natijani o'zi ko'rmaydi | Yangi komponent, sahifa |
| Maket + brauzer (`--chrome`) | Agent natijani ko'rib, solishtirib, konsolni o'qib tuzatadi | Kengaytma, tarif, ruxsatlar kerak; kontekst sarfi | Muhim UI, vizual xatolar |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Frontend ishini "testlar o'tdi" bilan qabul qilish | Ko'rinishdagi xatolarni testlar ko'rmaydi | Brauzerda ko'ring yoki agentga `--chrome` bering |
| Agentdan butun konsolni so'rash | CC: loglar ko'p bo'ladi | Qaysi naqsh yoki xato turini qidirishni ayting |
| Skript rejimida brauzer tekshiruvini kutish | Tajribada ruxsat so'rovi javobsiz qoldi | Brauzer tekshiruvini interaktiv sessiyada qiling |
| Chrome'ni doim yoqiq qoldirish | CC: kontekst sarfi oshadi | Kerak bo'lganda `--chrome` |
| Maketdan chiqarilgan qarorlarni tekshirmaslik | Agent noaniq joyni o'zi talqin qiladi ("2 ta" — tur yoki dona) | Agent hisobotidagi talqinlarni tasdiqlang |
| Agent kirgan saytlarni nazorat qilmaslik | CC: agent brauzeringizning kirish holatini baham ko'radi | Kengaytmada saytlar bo'yicha ruxsatlarni sozlang |

## Amaliyot

1. Nega frontend ishini faqat testlar bilan tekshirish yetarli emas?
2. Claude in Chrome agentga qanday imkoniyatlar beradi?
3. CP'dagi "AI slop" ogohlantirishi qachon kerak va maket bo'lsa nima yaxshiroq ko'rsatma?
4. Tajribada agent maketdan qanday qaror chiqardi va uni kim tasdiqlashi kerak?
5. Skript rejimidagi sessiya nega brauzerni ishlata olmadi? Agent bunga qanday munosabat bildirdi?
6. Konsolni tekshirishni agentdan qanday so'rash kerak?

<details>
<summary>Javoblar</summary>

1. Testlar va typecheck ko'rinishdagi xatolarni (siljigan element, chiqmagan summa, konsol xatosi) ko'rmaydi; buni faqat ko'z yoki brauzer ko'rsatadi.
2. Jonli debug (konsol va DOM), dizaynni maketga solishtirish, veb-ilovani sinash, hisobga kirilgan ilovalar bilan ishlash, ma'lumot olish, takroriy amallarni avtomatlashtirish, fayl yuklash, GIF yozib olish.
3. Maket yo'q bo'lganda, model andozaviy dizaynga og'masligi uchun. Maket bo'lsa, eng yaxshi ko'rsatma — maketning o'zi va "maketga yaqin bo'lsin" talabi.
4. "2 ta mahsulot" donalarni emas, mahsulot turlarini sanaydi deb hal qildi (maketda 7 dona, lekin "2 ta"). Buni siz (dasturchi va biznes) tasdiqlashingiz kerak.
5. Brauzer chaqiruvi ruxsat so'radi, skript rejimida esa uni tasdiqlaydigan odam yo'q. Agent xatoni koddan topib tuzatdi va brauzerda tekshira olmaganini ochiq aytdi.
6. Qaysi sahifa va qaysi turdagi xato ekanini aniq aytib, masalan: "dashboard sahifasini ochib, yuklanganda konsolda xato bormi, tekshir".

</details>

## Rasmiy hujjat

- [CC: Use Claude Code with Chrome](https://code.claude.com/docs/en/chrome)
- [CC: Common workflows — Work with images](https://code.claude.com/docs/en/common-workflows#work-with-images)
- [CP: Prompting best practices — Frontend design](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
- [CC: Best practices — Give Claude a check to run](https://code.claude.com/docs/en/best-practices#give-claude-a-check-to-run)
