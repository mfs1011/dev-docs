# 57 — VS Code va JetBrains

[Mundarija](README.md)

> ⚑ Rasmiy hujjat asosida (Claude Code 2.1.325). Qo'llanmadagi tajribalar terminalda o'tkazilgan; IDE integratsiyalari sinalmadi.

## Tushuncha

Agent bir xil — faqat oynasi boshqa. CC (Platforms and integrations): VS Code va JetBrains — muharrirdan chiqmasdan ishlash uchun:
qatordagi diff'lar, tanlangan kodni kontekstga berish, IDE diagnostikasi. Ikkala muharrir ham har qanday pullik Claude obunasi (Pro, Max,
Ultra, Team, Enterprise) yoki Claude Console hisobi bilan ishlaydi — API kalit shart emas.

Ikkalasining tuzilishi turlicha:

| | VS Code | JetBrains |
| --- | --- | --- |
| Shakli | Kengaytma: o'z grafik chat paneli | Plagin: IDE terminalida `claude` ni ishga tushiradi va unga ulanadi |
| CLI kerakmi | Panel uchun yo'q — kengaytma CLI nusxasini o'zi bilan olib keladi. Terminalda `claude` uchun alohida o'rnatish | Ha — plagin CLI'ni o'zi bilan olib kelmaydi |
| O'rnatish | Extensions (`Cmd+Shift+X`) → "Claude Code"; Cursor uchun ham | JetBrains Marketplace'dan "Claude Code" plagini, IDE'ni qayta ishga tushirish |
| Talab | VS Code 1.94.0 yoki yangiroq | IntelliJ IDEA, PyCharm, Android Studio, WebStorm, PhpStorm, GoLand va boshqalar |

Ikkala holatda ham CC eslatadi: kengaytmalar do'konlari uchinchi tomon dasturi, Anthropic ularni tasdiqlamaydi va tekshirmaydi —
Anthropic faqat nashrga yuboradi.

## VS Code

CC (Use Claude Code in VS Code) — kengaytma imkoniyatlari:

| Imkoniyat | Mazmuni |
| --- | --- |
| Reja ko'rib chiqish | Claude rejasini qabul qilishdan oldin ko'rish va tahrirlash (7-bob) |
| Tahrirlarni avtomatik qabul qilish | Accept edits rejimi (35-bob) |
| Tanlangan kod | Tanlangan matn va ochiq fayl avtomatik ko'rinadi; `Option+K` / `Alt+K` — `@app.ts#5-10` kabi qator oralig'i bilan eslatma |
| Checkpoint'lar | Xabar ustida: suhbatni shu yerdan ayirish, kodni shu yerga qaytarish yoki ikkalasi (9-bob) |
| Bir nechta suhbat | Alohida tab yoki oynalarda |
| Plaginlar, MCP | Panelda `/mcp`, plaginlarni boshqarish oynasi (27, 29-boblar) |

### Kengaytma va CLI farqi

| Imkoniyat | CLI | VS Code kengaytmasi |
| --- | --- | --- |
| Buyruqlar va skill'lar | Hammasi | Bir qismi (`/` bilan ko'ring) |
| MCP sozlash | Ha | Ha |
| Checkpoint'lar | Ha | Ha |
| `!` shell rejimi | Ha | Yo'q |
| Tab bilan to'ldirish | Ha | Yo'q |

CLI'dagi imkoniyat kerak bo'lsa — VS Code terminalida (`` Cmd+` `` / `` Ctrl+` ``) `claude`. Integratsiyalashgan terminalda u kengaytmaga
avtomatik ulanadi; tashqi terminaldan — `/ide`. Kengaytma va CLI bitta suhbat tarixini ishlatadi: kengaytmadagi suhbatni terminalda
`claude --resume` bilan davom ettirish mumkin.

### Maxfiylik: tanlangan matn

Tanlangan matn va ochiq fayl nomi xabarga qo'shiladi. O'chirish — VS Code sozlamalarida **Attach Selection** va **Attach Open File**.
Chat panelida `files.exclude`/`search.exclude` ga mos yoki git e'tiborsiz qoldiradigan fayllardagi tanlov yuborilmaydi (faqat yo'li). Lekin
CC ogohlantiradi: bu filtr **faqat chat panelida**; integratsiyalashgan terminaldagi `claude` bunday fayllardagi tanlangan matnni olishi
mumkin. Fayl mazmunini to'liq yopish — `Read` deny qoidasi (35, 38-boblar).

## JetBrains

CC (JetBrains IDEs) — plagin imkoniyatlari:

| Imkoniyat | Mazmuni |
| --- | --- |
| Tez ishga tushirish | `Cmd+Esc` / `Ctrl+Esc` |
| Diff ko'rish | O'zgarishlar IDE diff oynasida; `/config` → **Diff tool** (`auto` yoki `terminal`) |
| Tanlov konteksti | Joriy tanlov yoki tab avtomatik ulashiladi; `Read` deny qoidasi mos fayllar uchun buni bloklaydi |
| Fayl havolalari | `Cmd+Option+K` / `Alt+Ctrl+K` — `@src/auth.ts#L1-99` |
| Diagnostika | Claude IDE inspeksiyalarini (lint, sintaksis xatolari) `getDiagnostics` tool'i bilan o'qiydi |

Ishlash tartibi: IDE terminalida `claude` — barcha integratsiyalar faol; tashqi terminaldan — `/ide` (`Connected to IntelliJ IDEA.` kabi
xabar). Fayllar bir xil bo'lishi uchun Claude Code'ni IDE loyihasi ildizidan ishga tushiring.

Ichkarida: plagin lokal MCP server (`ide`) ishga tushiradi — CLI unga avtomatik ulanadi; u `/mcp` ro'yxatida ko'rinmaydi. Tashkilotingiz
`PreToolUse` hook bilan MCP tool'larni ruxsat ro'yxati orqali cheklasa, buni bilish kerak (26-bob).

### Xavfsizlik

CC (JetBrains — Security considerations): `acceptEdits` rejimida Claude Code IDE avtomatik bajarishi mumkin bo'lgan **IDE konfiguratsiya
fayllarini** o'zgartirishi mumkin. Tavsiyalar:

- tahrirlar uchun Manual rejim — `acceptEdits` va auto rejimlar ishchi papkadagi tahrirlarni (himoyalangan yo'llardan tashqari) so'ramasdan
  tasdiqlaydi;
- faqat ishonchli so'rovlar bilan ishlash (37-bob);
- Claude Code qaysi fayllarni o'zgartira olishini bilish.

## Variantlar

| Holat | Tanlov | Trade-off |
| --- | --- | --- |
| Asosan muharrirda, diff'larni ko'z bilan ko'rish muhim | IDE integratsiyasi | Qulay ko'rish; ba'zi CLI imkoniyatlari yo'q (VS Code) |
| Skript, CI, `!` rejimi, barcha buyruqlar | CLI | To'liq imkoniyat |
| Ikkalasi | IDE terminalida `claude` — integratsiya ham, CLI ham | Bitta suhbat tarixi |
| JetBrains, tahrirlarni avtomatik qabul qilish | Ehtiyotkorlik bilan | IDE konfiguratsiyasi orqali kod bajarilishi xavfi |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| VS Code kengaytmasini o'rnatib, terminalda `claude` kutish | Kengaytma CLI'ni PATH'ga qo'shmaydi | Alohida CLI o'rnatish |
| JetBrains'da faqat plaginni o'rnatish | Plagin CLI'ni o'zi bilan olib kelmaydi | Avval CLI, keyin plagin |
| Tanlangan maxfiy matn yuborilmaydi deb o'ylash | Panel filtri terminaldagi `claude` ga taalluqli emas | `Read` deny qoidasi |
| JetBrains'da `acceptEdits` ni o'ylamasdan | IDE konfiguratsiya fayllari o'zgarishi mumkin | Manual rejim |
| Tashqi terminalda IDE imkoniyatlarini kutish | Ulanmagan | `/ide` |

## Amaliyot

1. VS Code kengaytmasi va JetBrains plaginining tuzilishi qanday farq qiladi?
2. VS Code kengaytmasida CLI'ning qaysi imkoniyatlari yo'q va ularni qanday olasiz?
3. Tanlangan matnni Claude'dan qanday yashirasiz va panel filtrining chegarasi qayerda?
4. JetBrains'da `acceptEdits` rejimi qanday xavf tug'diradi?
5. Tashqi terminaldagi Claude Code'ni IDE'ga qanday ulaysiz?

<details>
<summary>Javoblar</summary>

1. VS Code kengaytmasi — o'z chat paneli va ichki CLI nusxasi bilan; JetBrains plagini — IDE terminalidagi `claude` ga ulanadi, CLI alohida o'rnatiladi.
2. Barcha buyruqlar va skill'lar (faqat bir qismi bor), `!` shell rejimi, Tab bilan to'ldirish; VS Code terminalida `claude` ishga tushirish.
3. Attach Selection va Attach Open File sozlamalari; panel `files.exclude`/git e'tiborsiz fayllardagi tanlovni yubormaydi, lekin terminaldagi `claude` ga bu filtr taalluqli emas — `Read` deny qoidasi kerak.
4. Claude Code IDE avtomatik bajarishi mumkin bo'lgan konfiguratsiya fayllarini so'ramasdan o'zgartirishi mumkin.
5. `/ide` buyrug'i bilan.

</details>

## Rasmiy hujjat

- [CC: Use Claude Code in VS Code](https://code.claude.com/docs/en/vs-code)
- [CC: JetBrains IDEs](https://code.claude.com/docs/en/jetbrains)
- [CC: Platforms and integrations](https://code.claude.com/docs/en/platforms)
