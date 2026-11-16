# 32 — Ko'p agentli ish

[Mundarija](README.md)

> ⚑ Bu bob rasmiy hujjat asosida yozilgan, dinamik workflow va agent teams amalda sinalmagan. Sabablar:
>
> - CC (Dynamic workflows) bo'yicha `ultracode` kalit so'zi skript rejimida (`-p`) berilgan so'rovda workflow boshlamaydi, kitobdagi
>   tajribalar esa shu rejimda qayd etiladi;
> - agent teams tajribaviy va standart holatda o'chiq;
> - ikkalasi ham ko'p token sarflaydi.
>
> Ko'p agentli ishning poydevori — subagentlar va worktree — 30–31-boblarda haqiqiy sessiyalarda ko'rsatilgan.

## Tushuncha

30-bobda bitta subagent, 31-bobda ikki parallel sessiya ko'rdik. Vazifa kattalashsa — butun kod bazasini audit qilish, 500 faylni
ko'chirish — undan ham ko'p agent kerak bo'lishi mumkin. Bu bob qachon arzishini va qachon ortiqcha ekanini ko'rsatadi.

### Agent naqshlari

3-bobda AE (Building effective agents) dagi beshta naqshni ko'rdik. Ko'p agentli ishning hammasi shularga borib taqaladi:

| Naqsh | Claude Code'da qanday ko'rinadi |
| --- | --- |
| Ketma-ket so'rovlar (prompt chaining) | Reja → yangi sessiyada qurish → review (7, 8, 22-boblar) |
| Yo'naltirish (routing) | Claude vazifani mos subagentga beradi: keng qidiruv — Explore, review — reviewer (30-bob) |
| Parallellash | Bir nechta subagent yoki worktree sessiyalari bir vaqtda (31-bob) |
| Boshqaruvchi va ishchilar | Agent teams'dagi lead; workflow skripti |
| Baholovchi va tuzatuvchi | Topilmalarni boshqa agent tekshiradi; Stop hook "tayyor"ni tekshiradi (8-bob) |

AE'ning asosiy maslahati shu yerda ayniqsa muhim: **eng oddiy yechimdan boshlang, murakkablikni faqat kerak bo'lganda oshiring.**

### Kim reja tuzadi

CC (Dynamic workflows) ko'p bosqichli vazifani bajarishning to'rt yo'lini **rejani kim ushlab turishi** bo'yicha ajratadi:

| | Subagentlar | Skill'lar | Agent teams | Workflow'lar |
| --- | --- | --- | --- | --- |
| Nima | Claude ishga tushiradigan ishchi | Claude amal qiladigan ko'rsatma | Lead agent boshqaradigan teng sessiyalar | Runtime bajaradigan skript |
| Keyingi qadamni kim hal qiladi | Claude, navbatma-navbat | Claude, ko'rsatmaga qarab | Lead agent | **Skript** |
| Oraliq natijalar qayerda | Claude kontekstida | Claude kontekstida | Umumiy vazifalar ro'yxatida | Skript o'zgaruvchilarida |
| Masshtab | Bir navbatda bir nechta vazifa | Subagentlar bilan bir xil | Bir nechta uzoq ishlaydigan teng agent | Bir ishga tushirishda o'nlab–yuzlab agent |
| To'xtatilsa | Navbat qaytadan boshlanadi | Navbat qaytadan boshlanadi | Jamoa a'zolari ishlashda davom etadi | Shu sessiyada davom ettiriladi |

### Dinamik workflow

CC (Dynamic workflows): **dinamik workflow** — ko'p subagentni bir vaqtda boshqaradigan JavaScript skript. Claude skriptni siz
tasvirlagan vazifa uchun yozadi, runtime esa uni fonda bajaradi, sessiyangiz esa bu orada band bo'lmaydi.

Hujjat bo'yicha workflow rejani **kodga** ko'chiradi. Subagentlar, skill'lar va agent teams'da Claude orkestrator bo'lib, har natija
uning kontekstiga tushadi. Workflow'da esa sikl, tarmoqlanish va oraliq natijalar skriptning o'zida turadi, Claude kontekstida faqat
**yakuniy javob** qoladi. Bundan tashqari workflow takrorlanadigan sifat naqshini qo'llay oladi: mustaqil agentlar bir-birining
topilmalarini **xabar qilinishidan oldin** tekshiradi.

Qanday boshlanadi (CC):

| Usul | Qanday |
| --- | --- |
| Tayyor workflow | `/deep-research` — savolni ko'p manbada o'rganib, manbali hisobot beradi |
| So'rovda | `ultracode:` kalit so'zi yoki o'z so'zlaringiz bilan: "use a workflow …" |
| Butun sessiya uchun | `/effort ultracode` — Claude har jiddiy vazifaga workflow rejalaydi |

CC'dagi so'rov namunalari:

```text
use a workflow to audit every route handler under src/routes/ for missing authentication checks, and adversarially verify each finding before reporting it

use a workflow to run npx tsc --noEmit and keep fixing the reported errors until the type check passes or two rounds in a row make no progress

use a workflow to migrate every component under src/components/ from JavaScript to TypeScript, working on each file in its own isolated copy
```

Cheklovlar (CC, "Behavior and limits"):

| Cheklov | Ma'nosi |
| --- | --- |
| Ish davomida foydalanuvchi kiritishi yo'q | Bosqichlar orasida tasdiq kerak bo'lsa, har bosqichni alohida workflow qiling |
| Skriptning o'zi fayl va shell'ga kirmaydi | Ishni agentlar qiladi, skript ularni muvofiqlashtiradi |
| Standart holatda bir vaqtda 16 tagacha agent | Lokal resurslarni cheklash |
| Bir ishga tushirishda jami 1000 tagacha agent | Cheksiz sikllardan himoya |

**Narx.** CC (Dynamic workflows, Cost): workflow ko'p agent ishga tushiradi, shuning uchun bitta ishga tushirish shu vazifani suhbatda
bajarishdan sezilarli ko'proq token sarflashi mumkin. Hujjat maslahati: katta vazifadan oldin workflow'ni **kichik bo'lakda** sinab
ko'ring (butun repo emas, bitta papka). Ishga tushirish 25 tadan ortiq agentni rejalashtirsa yoki taxminiy token soni 1,5 milliondan
oshsa, Claude Code `Large workflow` ogohlantirishini ko'rsatadi. `/workflows` da har agentning token sarfi ko'rinadi va ishni
to'xtatish mumkin. `/effort ultracode` haqida CC ogohlantiradi: u **har** vazifaga ta'sir qiladi va sessiya yoki haftalik limitga
tezroq yetkazadi.

### Agent teams

CC (Agent teams): bir sessiya **jamoa boshlig'i** (team lead) bo'ladi — ishni muvofiqlashtiradi, vazifalarni taqsimlaydi va natijalarni
yig'adi. Jamoa a'zolari mustaqil, har biri o'z kontekstida ishlaydi va **bir-biri bilan to'g'ridan-to'g'ri** muloqot qiladi.

| | Subagentlar | Agent teams |
| --- | --- | --- |
| Muloqot | Natijani chaqiruvchiga qaytaradi | A'zolar bir-biriga to'g'ridan-to'g'ri yozadi |
| Muvofiqlashtirish | Asosiy agent boshqaradi | O'zaro xabarlar va umumiy vazifalar ro'yxati |
| Eng mos | Faqat natija muhim bo'lgan aniq vazifalar | Muhokama va hamkorlik talab qiladigan murakkab ish |
| Token narxi | Pastroq: natijalar xulosa bo'lib qaytadi | Yuqoriroq: har a'zo alohida Claude nusxasi |

CC bo'yicha eng kuchli holatlar:

- bir muammoning turli tomonlarini parallel o'rganish va bir-birining topilmalarini tanqid qilish;
- har biri alohida qismga egalik qiladigan yangi modullar;
- raqobatdosh farazlar bilan debug;
- frontend, backend va testlarni turli a'zolar bajaradigan ish.

Ketma-ket vazifalar, bir faylni tahrirlash yoki bog'liqliklari ko'p ish uchun esa bitta sessiya yoki subagentlar samaraliroq.

**Narx.** CC (Costs): jamoa a'zolari plan mode'da ishlaganda agent teams oddiy sessiyadan **taxminan 7 baravar ko'p token** ishlatadi,
chunki har a'zo o'z kontekstiga ega va alohida Claude nusxasi sifatida ishlaydi. CC'dagi tavsiyalar:

- a'zolar uchun Sonnet ishlating;
- jamoani kichik tuting;
- ishga tushirish so'rovini aniq yozing;
- ishi tugagan a'zolarni to'xtating.

Yoqish: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`.

CC'dagi ma'lum cheklovlar: `/resume` va `/rewind` jarayon ichidagi a'zolarni tiklamaydi; vazifa holati kechikishi mumkin; har sessiyada
bitta jamoa; a'zolar o'z a'zolarini yarata olmaydi; lead almashtirilmaydi.

## Qachon arziydi, qachon ortiqcha

Rasmiy hujjatlardagi mezonlar asosida qaror ketma-ketligi:

```text
Vazifani bitta sessiya bajara oladimi?
  ├─ ha → bitta sessiya (eng oddiy yechim, AE)
  └─ yo'q → yon vazifa suhbatni to'ldiradimi yoki mustaqil tekshiruvchi kerakmi?
        ├─ ha → subagent (30-bob)
        └─ yo'q → bir nechta mustaqil vazifa, har birini o'zingiz kuzatmoqchisiz?
              ├─ ha → worktree sessiyalari / agent view (31-bob)
              └─ yo'q → o'nlab–yuzlab bir xil element yoki natijalarni o'zaro tekshirish kerak?
                    ├─ ha → dinamik workflow (avval kichik bo'lakda!)
                    └─ yo'q → a'zolar muhokama qilishi kerakmi? → agent teams (tajribaviy, ~7x token)
```

## Variantlar

| Usul | Yutug'i | Kamchiligi | Narx |
| --- | --- | --- | --- |
| Bitta sessiya | Oddiy, kontekst bitta joyda | Katta ishga sig'maydi | Eng past |
| Subagentlar | Alohida kontekst, cheklangan tool'lar | Har subagent o'z tokenlarini sarflaydi | O'rtacha |
| Worktree sessiyalari | To'liq mustaqil, siz boshqarasiz | Kuzatish va merge sizda | Sessiyalar soniga mutanosib |
| Dinamik workflow | Yuzlab agent, o'zaro tekshiruv, qayta ishga tushiriladigan skript | Ish davomida aralashib bo'lmaydi | Yuqori (kichik bo'lakda sinang) |
| Agent teams | A'zolar muhokama qiladi va bir-birini tanqid qiladi | Tajribaviy, cheklovlari bor | Juda yuqori (~7x) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Har vazifaga ko'p agent | AE: avval eng oddiy yechim; ko'p agent — ko'p token va xato yig'ilishi | Bitta sessiyadan boshlang |
| Katta workflow'ni darhol butun repo'da ishga tushirish | CC: avval kichik bo'lakda sinash | Bitta papkada sinang, `/workflows` da sarfni ko'ring |
| `/effort ultracode` ni oddiy ish uchun yoqib qoldirish | CC: har vazifa ko'proq token va vaqt oladi | Kerak bo'lgan vazifadan keyin `/effort ultracode off` |
| Bir faylni tahrirlaydigan ishga agent teams | CC: a'zolar worktree bilan ajratilmaydi; ketma-ket ish uchun bitta sessiya samaraliroq | Ishni fayllar bo'yicha bo'ling yoki bitta sessiya |
| Ishi tugagan a'zolarni qoldirish | CC: har faol a'zo token sarflashda davom etadi | Tugaganda to'xtating |

## Amaliyot

1. AE'dagi beshta naqsh Claude Code'da qanday ko'rinishda uchraydi?
2. Subagent, skill, agent teams va workflow'da "keyingi qadamni kim hal qiladi"?
3. Dinamik workflow nima va u Claude kontekstida nima qoldiradi?
4. Workflow'ning narxini qanday nazorat qilish mumkin?
5. Agent teams subagentlardan nimasi bilan farq qiladi va qancha qimmat?
6. Qanday vazifaga ko'p agent ortiqcha?

<details>
<summary>Javoblar</summary>

1. Zanjir — reja → qurish → review; yo'naltirish — mos subagentga berish; parallellash — subagentlar va worktree'lar; boshqaruvchi va ishchilar — agent teams lead va workflow skripti; baholovchi va tuzatuvchi — topilmalarni boshqa agent tekshirishi va Stop hook.
2. Subagent — Claude, navbatma-navbat; skill — Claude, ko'rsatmaga qarab; agent teams — lead agent; workflow — skript.
3. Claude yozadigan va runtime fonda bajaradigan, ko'p subagentni boshqaradigan JavaScript skript. Oraliq natijalar skript o'zgaruvchilarida qoladi, Claude kontekstiga faqat yakuniy javob tushadi.
4. Avval kichik bo'lakda sinash, `/workflows` da har agent sarfini kuzatish va kerak bo'lsa to'xtatish, kichik o'lcham yo'riqnomasi. 25 tadan ortiq agent yoki 1,5 mln tokendan ortiq rejada `Large workflow` ogohlantirishi chiqadi.
5. Agent teams a'zolari bir-biriga to'g'ridan-to'g'ri yozadi va umumiy vazifalar ro'yxatidan foydalanadi; subagentlar faqat chaqiruvchiga natija qaytaradi. CC: plan mode'dagi a'zolar bilan taxminan 7 baravar ko'p token.
6. Bitta sessiya bajara oladigan, ketma-ket, bir faylni tahrirlaydigan yoki bog'liqliklari ko'p vazifaga.

</details>

## Rasmiy hujjat

- [AE: Building effective agents](https://www.anthropic.com/research/building-effective-agents)
- [CC: Orchestrate subagents at scale with dynamic workflows](https://code.claude.com/docs/en/workflows)
- [CC: Orchestrate teams of Claude Code sessions](https://code.claude.com/docs/en/agent-teams)
- [CC: Run agents in parallel](https://code.claude.com/docs/en/agents)
- [CC: Manage costs effectively — Agent team token costs](https://code.claude.com/docs/en/costs)
