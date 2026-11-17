# 50 — Review, xavfsizlik va PR

[Mundarija](README.md)

## Tushuncha

Kod yozildi va testlar o'tdi. Endi uni boshqalar ko'radigan holatga keltirish kerak: review, xavfsizlik tekshiruvi, commit va PR. Bu
bobda 22, 39, 21 va 47-boblardagi vositalar bitta oqimga ulanadi:

| Qadam | Vosita | Bob |
| --- | --- | --- |
| Yangi funksiya — toza sessiyada | `CLAUDE.md` + aniq so'rov | 13, 49 |
| To'g'rilik review'i | `/code-review` | 22 |
| Xavfsizlik review'i | `/security-review` | 39 |
| Topilmalarni saralash | Har biriga qaror: tuzatish yoki asoslangan rad | 22 |
| PR tavsifi | Agent yozadi, 47-bobdagi tekshiruvchi solishtiradi | 21, 47 |
| Commit va PR | Inson push qiladi, PR ochadi | 11, 35 |

## Amalda: CSV yuklab olish

Kalkulyator repo'si endi ochiq: [github.com/mfs1011/ai-agentlar-sinov](https://github.com/mfs1011/ai-agentlar-sinov). Yangi funksiya —
natija jadvalini CSV fayl qilib yuklab olish. **Yangi sessiya** (49-bobdagi uzun sessiya davom ettirilmadi): agent qarorlarni `CLAUDE.md`
dan oladi.

```text
Yangi branch feat/csv-yuklash da ishla. Natija jadvali ostiga "CSV yuklab olish" tugmasi qo'sh: fayl nomi tolovlar-<summa>-<oylar>.csv,
ustunlar: oy, to'lov (so'mda, butun son, formatlashsiz), oxirida Jami qatori, UTF-8. CSV yasash public/lib.js dagi alohida funksiyada
bo'lsin va Node testlari bilan tekshirilsin; avval test, tasdiq bo'yicha yiqilishini ko'rsat, keyin kod. Commit qil va to'xta.
```

Natija: 26 navbat, **$0.52** — 49-bobdagi uzun sessiyaning har bosqichidan arzon. Bu safar "qizil" bosqich to'g'ri bajarildi, chunki
so'rovda aytildi:

```text
Birinchi ishga tushirishda testlar tasdiqqa yetmay yiqildi: funksiyalar hali yo'q edi ...
Shuning uchun lib.js ga '' qaytaradigan bo'sh funksiyalar qo'ydim. Shundan keyin 6 ta yangi test aynan AssertionError bilan yiqildi ...
```

### Ikki review — parallel

```bash
git remote set-head origin main          # /security-review origin'ning standart branch'iga solishtiradi
claude -p "/code-review"     --allowedTools "Bash(git *)" Read Grep Glob "Bash(npm test*)" "Bash(node *)" &
claude -p "/security-review" --allowedTools "Bash(git *)" Read Grep Glob &
wait
```

**`/security-review`** ($0.31) — zaiflik topilmadi, lekin nimani tekshirgani yozilgan:

```text
No high-confidence vulnerabilities found.
...
- CSV formula injection (public/lib.js, buildPaymentsCsv): each cell is either a fixed label (Oy, To'lov, Jami) or a safe integer.
  A cell can't start with =, +, @, a tab or a carriage return ...
- Malicious file name (public/lib.js, csvFileName): the name is always tolovlar-<int>-<int>.csv ...
- DOM XSS (public/app.js, downloadCsv): ... There is no innerHTML ...
- Content Security Policy: the new button has no inline handler ...
```

"Topilmadi" — ham natija, agar **nimani** tekshirgani ko'rinsa. CSV formula injection — CSV eksportidagi haqiqiy zaiflik turi; bu yerda
yo'qligining sababi aniq: hujayralarda faqat butun sonlar.

**`/code-review`** ($0.21) — 8 ta topilma, har biri fayl, qator va "qanday sharoitda buziladi" bilan:

| # | Topilma (qisqartirilgan) | Qaror | Sabab |
| --- | --- | --- | --- |
| 1 | Ajratuvchi vergul, BOM yo'q — o'zbek yoki rus lokalidagi Excel (ro'yxat ajratuvchisi `;`) har qatorni bitta ustunda ochadi | Keyinga — ochiq savol | Maqsadli foydalanuvchilar uchun muhim bo'lishi mumkin; lekin Excel'da sinalmagan, review'chi da'vosi. Qaror: Excel'da tekshirib, alohida PR |
| 2 | Blob URL `setTimeout(…, 0)` bilan bo'shatiladi — ba'zi brauzerlarda yuklash buzilishi mumkin | Keyinga | Da'vo brauzerga bog'liq; tekshirilmagan |
| 3 | Yangi hisob ketayotganda yoki maydon o'zgarganda CSV tugmasi faol qoladi — fayl formadagi qiymatlarga mos kelmaydi | **Tuzatildi** | Aniq mantiqiy xato, ssenariysi takrorlanadi |
| 4 | Tugma bosilganda `TypeError` foydalanuvchiga ko'rinmaydi | **Tuzatildi** | Jim xato |
| 5 | CSV'dagi "Jami" — server summasi emas, mijoz hisoblagan yig'indi | Rad | Server invariantni kafolatlaydi (49-bob testlari); ikkalasi bir xil |
| 6 | Yig'indi ikki marta hisoblanadi | Rad | Kichik takror, xato emas |
| 7 | `buildPaymentsCsv` manfiy yoki tartibsiz qiymatlarni qabul qiladi | Rad | Ma'lumot faqat validatsiyadan o'tgan server javobidan keladi |
| 8 | `csvFileName` biznes chegaralarini tekshirmaydi | Rad | Xuddi shu sabab |

Bu — 22-bobdagi qoida amalda: review'chi (inson yoki agent) har doim ham haq emas. Har topilmaga qaror kerak: tuzatish yoki **asoslangan**
rad. Jamoa repo'sida rad sababi PR'da izoh sifatida yoziladi.

3 va 4-topilmalar yangi sessiyada tuzatildi ($0.52, testlar 185 → 197):

```text
4bdee4f CSV: eskirgan natija yuklanmaydi, tayyorlash xatosi #form-error'da
7dad1a0 CSV yuklab olish: buildPaymentsCsv/csvFileName (lib.js) va natija ostida tugma
```

### PR tavsifi va uni tekshirish

Tavsifni agent yozdi ($0.20):

```text
feat/csv-yuklash branch'i uchun main'ga PR tavsifini yoz (markdown, o'zbekcha): nima o'zgardi, nega, qanday tekshirildi, ko'rib chiquvchi
nimaga e'tibor bersin. Faqat git diff va git log ga tayan. Javobing faqat tavsif matni bo'lsin, boshqa hech narsa yozma.
```

Tavsif batafsil chiqdi, oxirida "Ko'rib chiquvchi nimaga e'tibor bersin" bo'limida review'dagi 1, 2 va 5-topilmalar ochiq savol sifatida
turibdi. Keyin 47-bobdagi PR tekshiruvchi agent ($0.0077):

```json
{
  "mos": false,
  "muammolar": [
    { "turi": "tavsifda_yoq",
      "tafsilot": "app.js dagi xato yo'lida (`hideResult()`) endi saqlangan natija ham bekor qilinadi (`results.invalidate()`) va CSV tugmasi
o'chadi. ... Tavsifda bu o'zgarish aytilmagan ..." }
  ]
}
```

Tavsifni yozgan agent diff'ga tayangan bo'lsa ham bitta xatti-harakat o'zgarishini tushirib qoldirgan — server yoki tarmoq xatosida ham
natija bekor bo'ladi. Bir qator qo'shildi, keyin PR ochildi: [mfs1011/ai-agentlar-sinov#1](https://github.com/mfs1011/ai-agentlar-sinov/pull/1).

### Commit atributsiyasi

49-bobdagi birinchi commit'larni tekshirganda har birining oxirida shu qator topildi:

```text
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

Claude Code standart holatda commit'larga shunday trailer (git'dagi qo'shimcha qator) qo'shadi. CC (Settings reference — `attribution`):
uni o'zgartirish yoki yashirish mumkin; hammasini yashirish — `"attribution": false` (v2.1.281+), PR tavsifidagi qator ham, commit
trailer'i ham chiqmaydi. CC shuningdek yozadi: sizning atributsiya bo'yicha ko'rsatmalaringiz (CLAUDE.md yoki xotira qoidasi) bu
qatorlardan ustun — agar ular managed settings'da o'rnatilmagan bo'lsa.

Sinov repo'sida (`.claude/settings.json`):

```json
{
  "attribution": false,
  "permissions": { "deny": ["Bash(git push *)"] }
}
```

Bu sozlamadan keyingi commit'larda trailer yo'q. Undan oldingi, hali push qilinmagan commit'lardan esa u xabarni qayta yozish bilan olib
tashlandi. Push qilingandan keyin tarixni qayta yozish — force push, ya'ni boshqalar uchun muammo; shuning uchun sozlama **birinchi
commit'dan oldin** qo'yiladi. Jamoa siyosati qanday bo'lishidan qat'i nazar (atributsiya ko'rsatiladimi yoki yo'qmi), u ataylab
tanlanishi kerak, tasodifan emas.

## Narx

| Qadam | Narx |
| --- | --- |
| Funksiya (yangi sessiya) | $0.52 |
| `/code-review` | $0.21 |
| `/security-review` | $0.31 |
| 2 topilmani tuzatish | $0.52 |
| PR tavsifi | $0.20 |
| PR tavsifini tekshirish (Haiku, 47-bob agenti) | $0.0077 |
| **Jami** | **$1.76** |

## Variantlar

| Holat | Yondashuv | Trade-off |
| --- | --- | --- |
| Kichik o'zgarish | `/code-review` yetarli | Tez; xavfsizlik alohida ko'rilmaydi |
| Foydalanuvchi kiritishi, fayllar, autentifikatsiya | + `/security-review` | Qo'shimcha $0.3 atrofida |
| Katta yoki muhim PR | + Claude Security plagini yoki Code Review (Team/Enterprise) | Chuqurroq, qimmatroq (39-bob) |
| PR tavsifi | Agent yozadi + mustaqil tekshiruv | Tavsif tushirib qoldirgan o'zgarishlar ushlanadi |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Review topilmalarining hammasini tuzattirish | Ba'zilari noto'g'ri yoki keraksiz; kod keraksiz murakkablashadi | Har biriga qaror va sabab |
| Topilmalarni jim e'tiborsiz qoldirish | Keyingi review'chi yana ko'taradi | Rad sababini yozish |
| "Zaiflik topilmadi" ni tekshirmasdan qabul qilish | Nima tekshirilgani noma'lum bo'lishi mumkin | Hisobotdagi tekshirilgan turlarni o'qish |
| Agent yozgan PR tavsifiga to'liq ishonish | Tajribada bitta o'zgarish tushib qolgan | Mustaqil solishtirish (47-bob) yoki o'zingiz o'qish |
| Atributsiya sozlamasini push'dan keyin o'ylash | Tarixni qayta yozish — force push | Birinchi commit'dan oldin `attribution` |
| Agentga push ruxsatini berish | Qaytarib bo'lmaydigan, boshqalarga ko'rinadigan amal (11-bob) | `Bash(git push *)` deny, push — inson |

## Amaliyot

1. Nega yangi funksiya uchun yangi sessiya ochildi va bu narxga qanday ta'sir qildi?
2. `/security-review` hech narsa topmadi. Bu natijaning qiymati nimada?
3. `/code-review` topilmalari qanday saralandi? Qaysi biri "keyinga" qoldirildi va nega?
4. PR tekshiruvchi agent nima topdi?
5. Claude Code commit'larga nima qo'shadi va uni qanday boshqarish mumkin?
6. Nega atributsiya sozlamasi birinchi commit'dan oldin qo'yilishi kerak?

<details>
<summary>Javoblar</summary>

1. Qarorlar CLAUDE.md'da edi, uzun tarixni qayta yuborish kerak emas edi. Funksiya $0.52 turdi — 49-bobdagi uzun sessiya bosqichlaridan arzon.
2. U nimani tekshirganini aniq yozdi (CSV formula injection, fayl nomi, DOM XSS, CSP) va har biri nega qo'llanilmasligini tushuntirdi.
3. Aniq mantiqiy xatolar (3, 4) tuzatildi; validatsiyadan o'tgan ma'lumotga oid yoki kichik takrorlar (5–8) asos bilan rad etildi; Excel ajratuvchisi (1) va blob URL (2) — sinab bo'lmagan da'volar, keyingi PR uchun ochiq savol.
4. Agent yozgan tavsifda server yoki tarmoq xatosida natija bekor bo'lishi aytilmagan edi.
5. `Co-Authored-By: Claude ...` trailer'ini; `attribution` sozlamasi bilan o'zgartirish yoki `"attribution": false` bilan yashirish mumkin.
6. Push qilingan tarixni o'zgartirish force push talab qiladi va boshqalarning nusxasini buzadi.

</details>

## Rasmiy hujjat

- [CC: Commands — /code-review, /security-review](https://code.claude.com/docs/en/commands)
- [CC: Settings reference — attribution](https://code.claude.com/docs/en/settings-reference#attribution)
- [CC: Security guidance plugin — How this fits with other security tools](https://code.claude.com/docs/en/security-guidance)
- [CC: Best practices](https://code.claude.com/docs/en/best-practices)
