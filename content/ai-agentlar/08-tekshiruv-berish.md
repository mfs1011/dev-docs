# 08 — Agentga tekshiruv berish

[Mundarija](README.md)

## Tushuncha

Bu kitobdagi eng muhim odat shu bobda. CC (Best practices) muammoni shunday ta'riflaydi: **Claude ish tayyor ko'ringanda
to'xtaydi.** Ish haqiqatan tayyormi yoki yo'qligini ko'rsatadigan, ishga tushirib bo'ladigan narsa bo'lmasa, uning
qo'lida faqat "tayyor ko'rinyapti" degan taassurot qoladi. Amalda bu **test to'plami vazifasini siz bajarasiz** degani:
har bir xato siz tasodifan ko'rib qolguningizcha kodda turaveradi.

Yechim ham shu yerda: agentga natijasi **o'tdi** yoki **yiqildi** bo'lib qaytadigan biror narsa bering. Shunda agent siklni
o'zi yopadi: o'zgartiradi, tekshiruvni ishga tushiradi, biror narsa buzilgan bo'lsa chiqishni o'qib tuzatadi va qayta
tekshiradi.

3-bobda ko'rgan agentik sikl aynan shunga tayanadi. AE (Building effective agents) bo'yicha agent har qadamda **muhitdan
haqiqiy natija** (ground truth) olishi kerak. AE kodni agent uchun qulay soha deb hisoblaydi, chunki koddagi yechimni
avtomatik testlar bilan tekshirish mumkin. CC (Glossary) buni **tekshiruv sikli** (verification loop) deb ataydi: sessiya
ishonarli ko'ringan natijani qabul qilish o'rniga ish haqiqatan bajarilganini shu yo'l bilan biladi. Bunday sikl
bo'lmasa, CC so'zi bilan, "agent tugatdimi-yo'qmi, buni faqat agentning o'zi hal qiladi".

### Tekshiruv nima bo'lishi mumkin

CC (Best practices): agent natijasini o'qiy oladigan deyarli har qanday narsa:

| Tekshiruv | Misol |
| --- | --- |
| Test fayli | `npm test`, `pytest`, `go test` |
| Build'ning chiqish kodi | `npm run build`, `cargo build` |
| Linter | `eslint`, `ruff` |
| Chiqishni namunaviy fayl bilan solishtiruvchi skript | `diff <(node skript.js) kutilgan.txt` |
| Brauzer skrinshoti va maket | Chrome integratsiyasi (23-bob) |

CC maslahati: repo'da bulardan biri allaqachon bo'lsa, CLAUDE.md'dagi **eng foydali qator — uni ishga tushiradigan buyruq**.

### Qanchalik qattiq

CC (Best practices) qattiqlik darajalarini sanaydi. Ular "Claude o'zi hal qiladi"dan "Claude Code majburlaydi"gacha boradi
(3-bobdagi model va harness farqi):

| Daraja | Qanday | Kim hal qiladi |
| --- | --- | --- |
| So'rovda | `run the auth tests after, and keep going until they pass` | Agentning o'zi. Sozlash shart emas, istalgan vazifada ishlaydi |
| Maqsad (goal) | `/goal all tests in tests/auth pass and lint is clean` | Har navbatdan keyin alohida model suhbatga qarab shart bajarilganini tekshiradi; bajarilmagan bo'lsa, agent davom etadi |
| Stop hook | Agent navbatni tugatmoqchi bo'lganda skript ishga tushadi; skript `2` kodi bilan chiqsa, agent ishga qaytariladi | Harness. Tekshiruv o'tmaguncha navbat tugamaydi |
| Kodni yozmagan odam | `/code-review` diff'ni suhbatni ko'rmagan yangi subagentda ko'rib chiqadi | Kod yozilgan fikrlash yo'lidan ta'sirlanmagan tashqi ko'z (22-bob) |

CC (Keep Claude working toward a goal) `/goal` haqida aniqlik kiritadi: u faqat joriy sessiya uchun, siz yozgan shart
bilan ishlaydi. Stop hook esa sozlamalar faylida turadi va o'z doirasidagi har bir sessiyaga qo'llanadi. CC bo'yicha
sessiya ichida `/goal` kamdan-kam kerak bo'ladi. U asosan uzoq fon ishlari uchun: bunday ishda agent ba'zan ish hali tugamagan
bo'lsa ham navbatni oraliq hisobot bilan yakunlaydi, maqsad esa uni ishga qaytaradi.

### Dalil so'rang

CC (Best practices): qaysi usulni tanlamang, agentdan **dalil** so'rang — ishga tushirilgan buyruq va uning chiqishi yoki
skrinshot. "Hamma testlar o'tdi" degan gapning o'zi juda kam narsa aytadi. Chiqishni o'qish tekshiruvni o'zingiz qayta ishga
tushirishdan tezroq. Siz kuzatmagan sessiya uchun esa bu yagona dalil.

6-bobdagi tajribada farq ko'rindi: noaniq so'rovga agent "4 ta test o'tdi" deb yozdi. Dalil so'ralgan so'rovga esa test
chiqishining o'zini ko'rsatdi.

## Amalda: Stop hook agentni ishga qaytaradi

Stop hook — CC'dagi eng qattiq daraja. Sinov loyihasida uni ataylab qiyin sharoitda sinaymiz:

- **Agentga test buyrug'ini ishga tushirishga ruxsat berilmagan.** U testni o'zi ishga tushira olmaydi.
- **Biznes qoidasi so'rovda aytilmagan.** U faqat `test/qoidalar.test.js` da yozilgan. Haqiqiy loyihalarda ham ko'p qoida
  shunday — testda yashaydi.

```js
// test/qoidalar.test.js
// Biznes qoidalari (buxgalteriya bilan kelishilgan)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as narx from '../narx.js'

test('qoida: bo\'sh savatda yetkazish haqi olinmaydi', () => {
  if (narx.yetkazish) assert.equal(narx.yetkazish(0), 0)
})
```

CC (Best practices, "Enforce the check with a Stop hook") misolidagi kabi hook `.claude/settings.json` da:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          { "type": "command", "command": "npm test --silent 1>&2 || exit 2" }
        ]
      }
    ]
  }
}
```

Bu qatorning ikki qismi hujjatda tushuntirilgan:

- `exit 2` — to'xtashni **bloklaydigan** chiqish kodi;
- `1>&2` — test chiqishini stderr'ga yo'naltiradi, chunki CC bo'yicha buyruq stderr'ga yozgan narsa agentga "nega hali
  tugata olmaysan" degan sabab sifatida qaytadi.

So'rov (Claude Code 2.1.325, `acceptEdits` rejimi, test buyrug'iga ruxsat yo'q):

```text
narx.js ga yetkazish(summa) funksiyasini qo'sh: summa 200000 va undan ko'p bo'lsa o'zi qaytadi, aks holda 15000 qo'shiladi.
```

Sessiya qadamlari (`--output-format stream-json --include-hook-events` chiqishidan):

<div data-animatsiya="qadamli" data-nom="stop-hook"></div>

Agentning birinchi yakuniy xabari:

```text
`yetkazish(summa)` funksiyasi `narx.js` ga qo'shildi. Testlarni ishga tushira olmadim: `npm test` ruxsat talab qildi
va tasdiqlanmadi, shuning uchun o'zgarishlar hali tekshirilmagan.
```

Hook bo'lmaganda sessiya shu yerda tugardi va `yetkazish(0)` 15000 qaytaradigan kod siz ko'rmaguningizcha qolardi. Hook
esa testni ishga tushirdi, `exit 2` bilan to'xtashni blokladi va agentga shunday qaytardi:

```text
Stop hook feedback:
[npm test --silent 1>&2 || exit 2]: ...
✖ qoida: bo'sh savatda yetkazish haqi olinmaydi (0.580875ms)
ℹ tests 5
ℹ pass 4
ℹ fail 1
...
  15000 !== 0
```

Agent yiqilgan test faylini o'qidi va tuzatdi:

```diff
+// Bo'sh savat (0) yoki 200000 va undan ko'p bo'lsa yetkazish bepul,
+// aks holda 15000 qo'shiladi
+export function yetkazish(summa) {
+  if (summa === 0 || summa >= 200000) {
+    return summa
+  }
+  return summa + 15000
+}
```

Ikkinchi marta hook `pass 6`, `fail 0` bilan o'tdi va navbat tugadi. Agentning yakuniy xabarida yana bir foydali qator bor:

```text
Bitta savol ochiq qoldi: manfiy summa (masalan, qaytarilgan tovar) uchun hozir 15000 qo'shiladi.
Bu boshqacha bo'lishi kerakmi, aytsangiz o'zgartiraman.
```

### Shu tajribadan uchta saboq

1. **Agentga tekshiruvni ishga tushirish ruxsatini bering.** Bu tajribada ruxsat ataylab berilmadi. Odatda esa
   `--allowedTools "Bash(npm test*)"` yoki ruxsat qoidasi bilan beriladi (35-bob). Busiz agent siklni o'zi yopa olmaydi.
   Agent buni halol aytdi ("hali tekshirilmagan"), lekin bu xabarni o'qimasangiz, ish tekshirilmagan holda qoladi.
2. **Hook — oxirgi himoya chizig'i.** Agent o'zi tekshira olmagan va qoidani bilmagan holatda ham "tayyor"ni harness
   tasdiqladi.
3. **Test agentning o'zi ham o'zgartira oladigan fayl.** Bir tajribada (`chegirma` foizni kasr ko'rinishida qabul qilsin
   degan vazifa) agent kod bilan birga eski testni ham yangiladi va hook o'tib ketdi. U yerda bu to'g'ri edi, chunki talab
   o'zgargan edi. Lekin bu yerdan qoida chiqadi: hook "testlar o'tadi"ni tekshiradi, "testlar to'g'ri"ni emas. Diff'dagi test
   o'zgarishlarini alohida ko'ring (11-bob).

CC (Best practices) cheklovni ham aytadi: hook navbatma-navbat sakkiz marta bloklasa va bu orada bitta ham tool chaqiruvi
bo'lmasa, Claude Code keyingi blokni bekor qiladi va navbatni tugatadi. Bu chegara `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP` muhit
o'zgaruvchisi bilan oshiriladi. Hook'lar haqida batafsil — 26-bob.

## Spetsifikatsiyaga solishtirish

7-bobda `SPEC.md` yozgan bo'lsangiz, tekshiruv uchun tayyor asos bor. CC (Best practices) umumiy xato qidirish o'rniga
ishni rejaga solishtirish uchun review so'rovini o'zingiz yozishni taklif qiladi:

```text
use a subagent to review the rate limiter diff against SPEC.md, check every requirement is implemented and the listed edge cases have tests, report gaps that affect correctness and skip style
```

Tarjimasi: "rate limiter diff'ini subagent bilan SPEC.md'ga solishtir: har bir talab bajarilganini va sanalgan chegaraviy
holatlarga test borligini tekshir, to'g'rilikka ta'sir qiladigan kamchiliklarni ayt, uslubni o'tkazib yubor."

CC alohida ogohlantiradi: `skip style` qismini olib tashlamang. Muammo topishni so'ralgan tekshiruvchi **har doim nimadir
topadi**. Har bir topilmani tuzataversangiz, ortiqcha abstraksiya qatlamlari va yuz bermaydigan holatlar uchun testlar
paydo bo'ladi.

## "Tayyor" deyilgan ish nega ba'zan tayyor emas

CC (Best practices) bo'yicha sessiya kutilgandek ketmasa, sabablardan biri: "Claude tayyor dedi, lekin to'liq tayyor emas edi,
odatda o'z ishini tekshirish usuli yo'qligi uchun". Bu bobdagi tajribalarda shunday sabablar ko'rindi:

| Sabab | Belgisi | Yechim |
| --- | --- | --- |
| Tekshiruv buyrug'iga ruxsat yo'q | "testlarni ishga tushira olmadim", "hali tekshirilmagan" | Test buyrug'iga ruxsat bering |
| Agent bilmagan qoida | Testlar o'tdi, lekin biznes kutganidan boshqa natija | Qoidani so'rovga yozing yoki testga qo'shing |
| Tekshiruvni agent o'zi o'zgartirdi | Diff'da test fayli ham o'zgargan | Test o'zgarishlarini alohida ko'ring |
| Dalil yo'q | "Hammasi ishlayapti" degan gap, chiqish yo'q | Buyruq va uning chiqishini so'rang |

CP (Prompting best practices) yana bir xavfni aytadi: Claude ba'zan **testni o'tkazishga** haddan tashqari e'tibor berib,
umumiy yechim o'rniga faqat test holatlarida ishlaydigan kod yozishi mumkin. Bu haqda va uni qanday oldini olish haqida —
11-bob.

## Variantlar

| Usul | Yutug'i | Kamchiligi | Qachon |
| --- | --- | --- | --- |
| So'rovda tekshiruvni aytish | Sozlash shart emas, darhol ishlaydi | Kafolat yo'q: agent qachon qoniqishini o'zi hal qiladi | Har kungi vazifalar |
| CLAUDE.md'ga tekshiruv buyrug'i | Har sessiyada agent buyruqni biladi | Baribir iltimos, majburiyat emas | Har bir loyihada |
| `/goal` | Alohida model shartni tekshiradi; sessiya ichida sozlashsiz | Faqat joriy sessiya uchun; baholovchi ham model | Uzoq fon ishlari |
| Stop hook | Harness majburlaydi; agent o'zi tekshira olmasa ham | Sozlash kerak; testning o'zini tekshirmaydi; har to'xtashda vaqt ketadi | "Tayyor" degani albatta tekshirilgan bo'lishi kerak bo'lganda |
| `/code-review` yoki spetsifikatsiyaga review | Kod yozilgan fikrlash yo'lidan ta'sirlanmagan ko'z | Qo'shimcha token; "skip style" bo'lmasa ortiqcha topilmalar | Katta yoki muhim o'zgarish |
| CI | Hech kim chetlab o'ta olmaydi | Kechroq ishlaydi, PR ochilgandan keyin | Har doim, oxirgi qatlam sifatida |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Tekshiruvsiz vazifa berish | CC: agent ish tayyor ko'ringanda to'xtaydi; siz test to'plamiga aylanasiz | So'rovga test yoki build buyrug'ini qo'shing |
| Tekshiruv buyrug'iga ruxsat bermaslik | Agent siklni yopa olmaydi | Test buyrug'ini ruxsat etilganlar ro'yxatiga qo'shing (35-bob) |
| "Testlar o'tdi" degan gapga ishonish | CC: bu juda kam narsa aytadi | Buyruq va chiqishni so'rang |
| Stop hook'da chiqishni stdout'da qoldirish | CC: agentga stderr qaytadi | `1>&2` bilan stderr'ga yo'naltiring |
| Har review topilmasini tuzatish | CC: tekshiruvchi har doim nimadir topadi | `skip style`, faqat to'g'rilikka ta'sir qiladigani |
| Test o'zgarishlarini ko'rmaslik | Agent kod bilan birga testni ham o'zgartirishi mumkin | Diff'da test fayllarini alohida o'qing |

## Amaliyot

1. CC bo'yicha tekshiruv bo'lmasa nima bo'ladi?
2. Tekshiruv sifatida nimalardan foydalanish mumkin?
3. Qattiqlik darajalari qaysilar va ularning har birida kim hal qiladi?
4. Stop hook'dagi `exit 2` va `1>&2` nima uchun kerak?
5. Tajribada agent test buyrug'ini ishga tushira olmadi. Unda bu xatoni nima ushlab qoldi?
6. Spetsifikatsiyaga review so'rovida `skip style` nega muhim?
7. Hook "testlar o'tdi" deb tasdiqladi. Yana nimaga qarash kerak?

<details>
<summary>Javoblar</summary>

1. Agent ish tayyor ko'ringanda to'xtaydi. Amalda test to'plami vazifasini siz bajarasiz va xato siz ko'rib qolguningizcha kodda qoladi.
2. Test fayli, build chiqish kodi, linter, chiqishni namuna bilan solishtiruvchi skript, maket yonidagi brauzer skrinshoti.
3. So'rovda (agentning o'zi), `/goal` (alohida model), Stop hook (harness), `/code-review` yoki kodni yozmagan tekshiruvchi (suhbatni ko'rmagan subagent).
4. `exit 2` — to'xtashni bloklaydigan chiqish kodi. `1>&2` — chiqishni stderr'ga yo'naltiradi, stderr esa agentga sabab sifatida qaytadi.
5. Stop hook: agent to'xtamoqchi bo'lganda testlarni ishga tushirdi, qoida testi yiqildi, `exit 2` agentni ishga qaytardi va u kodni tuzatdi.
6. Muammo topishni so'ralgan tekshiruvchi har doim nimadir topadi. Hammasini tuzatish ortiqcha abstraksiya va keraksiz testlarga olib keladi.
7. Testlarning o'zi to'g'rimi: diff'da test fayllari o'zgarganmi, agent eski testni yangi kodga moslab o'zgartirmaganmi.

</details>

## Rasmiy hujjat

- [CC: Best practices — Give Claude a check to run](https://code.claude.com/docs/en/best-practices#give-claude-a-check-to-run)
- [CC: Best practices — Review against your spec, Enforce the check with a Stop hook](https://code.claude.com/docs/en/best-practices#enforce-the-check-with-a-stop-hook)
- [CC: Keep Claude working toward a goal](https://code.claude.com/docs/en/goal)
- [CC: Glossary — Verification loop](https://code.claude.com/docs/en/glossary)
- [CC: Hooks reference — Stop](https://code.claude.com/docs/en/hooks#stop)
- [AE: Building effective agents](https://www.anthropic.com/research/building-effective-agents)
- [CP: Prompting best practices — Avoid focusing on passing tests and hardcoding](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
