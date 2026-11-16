# 16 — Katta kod bazasi va monorepo

[Mundarija](README.md)

## Tushuncha

Kichik loyihada agent hamma narsani tez topadi. Katta kod bazasida esa ikki narsa qimmatlashadi:

1. **Ko'rsatmalar.** Ildizdagi bitta CLAUDE.md yo hamma quyi tizimlarni qamrab olishga urinib o'sib ketadi, yo hech kimga
   foyda bermaydigan darajada umumiy bo'lib qoladi (CC Set up Claude Code in a monorepo).
2. **Fayl o'qish.** Belgi (funksiya, klass) qayerda e'lon qilingani va ishlatilganini matn qidiruvi bilan topish ko'p fayl
   o'qish va `grep` chaqiruvini talab qiladi.

CC (monorepo) bu ikkalasini quyidagi vositalar bilan hal qiladi:

| Muammo | Yechim |
| --- | --- |
| Hamma ko'rsatmalar har sessiyada | Papkalar bo'yicha CLAUDE.md va `.claude/rules/` |
| Boshqa jamoalarning CLAUDE.md'lari yuklanadi | `claudeMdExcludes` |
| Generatsiya qilingan va begona (vendored) kod o'qiladi | `Read` taqiq qoidalari |
| Belgini topish uchun ko'p fayl o'qiladi | Kod tahlili plagini (LSP) |
| Bir nechta paketga tegadigan o'zgarish izchil chiqmaydi | Bitta sessiyada topshirish va avval reja |

### Qayerdan ishga tushirish

CC (monorepo): `claude` ni qayerdan ishga tushirsangiz, agent qaysi fayllarni qo'shimcha ruxsatsiz o'qiy olishi, qaysi CLAUDE.md
yuklanishi va qaysi loyiha sozlamalari qo'llanishi shunga bog'liq:

| Qayerdan | Fayllarga kirish | Ishga tushganda yuklanadigan CLAUDE.md | Qachon |
| --- | --- | --- | --- |
| Repo ildizi | Barcha fayllar | Faqat ildizdagisi; pastki papkalardagilar kerak bo'lganda | Vazifa bir nechta paketga tegadi |
| Pastki papka | Faqat shu papka, siz ko'proq ruxsat bermaguningizcha | Shu papkaniki va undan yuqoridagi hamma | Ish bitta paket ichida |

CC ogohlantiradi: `.claude/settings.json` CLAUDE.md kabi yuqori papkalardan meros qilib olinmaydi. Pastki papkadan ishga
tushirsangiz, o'sha papkaning sozlamalari kerak bo'ladi.

### Papkalar bo'yicha CLAUDE.md

CC (monorepo) ikki darajali bo'linishni taklif qiladi:

- **ildizdagi `CLAUDE.md`** — hamma joyga tegishli qoidalar (kod standartlari, commit konvensiyasi);
- **har bir paket yoki quyi tizimdagi `CLAUDE.md`** — shu joyning texnologiyasiga xos konvensiyalar.

Hujjatdagi misol:

```markdown
<!-- CLAUDE.md (ildiz) -->
Run package scripts from the package directory, not the monorepo root.
Prefix commit subjects with the package name, for example `api: add rate limiting`.
Never edit files under packages/*/generated/. Run `npm run codegen` in the package instead.
```

```markdown
<!-- packages/api/CLAUDE.md -->
Copy `.env.example` to `.env` before running anything. Tests and the dev server fail without it.
Write database queries with the Knex query builder. Never put raw SQL strings in route handlers.
Never edit a migration after it has merged. Add a new migration instead.
```

`packages/api/` dan ishga tushirsangiz, ikkala fayl yuklanadi, `packages/web/` ning ko'rsatmalari esa kontekstga tushmaydi.

**Papka CLAUDE.md'si yoki `paths` qoidasi?** (CC monorepo)

| Usul | Fayl qayerda | Qachon tanlash |
| --- | --- | --- |
| Papkadagi `CLAUDE.md` | Kod yonida, shu papkada | Har papkaning egasi o'z konvensiyalarini o'zi yuritadi; ko'rsatmalar kod bilan birga versiyalanadi |
| `.claude/rules/` + `paths` | Ildizdagi markaziy `.claude/` | Barcha konvensiyalar bir joyda bo'lsin; yoki bitta qoida ko'p tarqoq yo'llarga tegishli |

CC fayllarni dolzarb saqlash uchun maslahat beradi:

- CLAUDE.md o'zgarishlarini PR'da boshqa hujjatlar kabi ko'rib chiqing;
- katta model relizlaridan keyin qayta ko'rib chiqing: eski model cheklovini aylanib o'tish uchun yozilgan qoida yangi modelda
  ortiqcha yukka aylanishi mumkin.

### Keraksiz narsani o'qitmaslik

**Boshqa jamoalarning ko'rsatmalari.** `claudeMdExcludes` sozlamasi ko'rsatilgan CLAUDE.md va qoida fayllarini umuman
yuklamaydi (CC monorepo):

```json
{
  "claudeMdExcludes": [
    "**/packages/web/**"
  ]
}
```

Faqat o'zingiz uchun bo'lsa, bu sozlama `.claude/settings.local.json` ga yoziladi. CC aniqlik kiritadi: ro'yxat doimiy,
har vazifa uchun almashtiriladigan narsa emas. Bugun bir paket, ertaga boshqa paket bilan ishlasangiz, o'sha paket papkasidan
ishga tushiring.

**Generatsiya qilingan va begona kod.** CC (monorepo): Claude'ning qidiruvi standart holatda `.gitignore` ni hisobga oladi,
shuning uchun `node_modules/`, `dist/`, `build/` natijalarga tushmaydi. Repo'ga commit qilingan generatsiya qilingan kod yoki
begona SDK uchun `Read` taqiq qoidalari qo'shiladi:

```json
{
  "permissions": {
    "deny": [
      "Read(./**/dist/**/*)",
      "Read(./**/build/**/*)",
      "Read(./**/*.generated.*)",
      "Read(./**/vendor/**/*)"
    ]
  }
}
```

Naqshlar `/**` bilan emas, `/**/*` bilan tugaydi. Shunda qoida papka ichidagi hamma narsani yopadi, lekin papkaning o'zini
emas: agent hamon `ls dist` qila oladi.

CC cheklovni ham aytadi: taqiq qoidalari Claude'ning fayl tool'larini va Bash'dagi tanish fayl buyruqlarini (`cat`, `head`,
`grep`, `find`) yopadi. Lekin taqiqlangan fayllar bor papka bo'yicha `grep -r` qidiruvi ularni natijaga qo'shadi. O'zi fayl
ochadigan ichki jarayonlarni (subprocess) ham yopmaydi.

### Kod tahlili plagini (LSP)

CC (Code intelligence plugins): bu plagin Claude'ga muharriringizdagi kabi jonli diagnostika va "ta'rifga o'tish" imkonini
beradi. Shunda Claude o'z tahririda paydo bo'lgan tur xatosi va yetishmayotgan importni build ishga tushirmasdan ko'radi.
Ta'rif va murojaatlarni esa matn qidiruvi bilan emas, **belgi bo'yicha** topadi.

Plagin Claude Code'ni bitta til uchun **til serveriga** (language server) LSP (Language Server Protocol) orqali ulaydi. Uch
qadam:

1. **Til serveri dasturini o'rnatish.** Plagin uni o'z ichiga olmaydi. TypeScript uchun: `npm install -g
   typescript-language-server typescript`.
2. **Plaginni o'rnatish:** `/plugin install typescript-lsp@claude-plugins-official`.
3. **Server ishga tushganini tekshirish.** Server Claude shu tildagi faylni birinchi marta tahrirlaganda ishga tushadi.

CC rasmiy marketplace'dagi plaginlar ro'yxatini beradi: C/C++ (`clangd`), C#, Go (`gopls`), Java (`jdtls`), Kotlin, Lua, PHP
(`intelephense`), Python (`pyright`), Ruby, Rust (`rust-analyzer`), Swift, TypeScript/JavaScript va boshqalar.

Agent nima oladi:

- **tahrirdan keyin diagnostika** — server ko'rsatgan xato va ogohlantirishlar;
- **`LSP` tool'i** — belgilarni server orqali qidiradigan, faqat o'qiydigan tool.

Cheklov: bulut sessiyalarida plagin til serverlari ishga tushmaydi.

## Amalda: LSP agentga tur xatosini ko'rsatadi

8-bobdagi JSDoc turlari yozilgan `narx.js` olindi. Til serveri sinov repo'siga lokal o'rnatildi, plagin esa faqat shu loyiha
uchun qo'shildi (`--scope project`), shaxsiy sozlamalarga tegilmadi:

```bash
npm i typescript typescript-language-server
claude plugin install typescript-lsp@claude-plugins-official --scope project
```

```text
✔ Successfully installed plugin: typescript-lsp@claude-plugins-official (scope: project)
```

`.claude/settings.json` ga shu yozildi:

```json
{
  "enabledPlugins": {
    "typescript-lsp@claude-plugins-official": true
  }
}
```

Sessiya boshida (`stream-json` ning `init` qatori) tool'lar ro'yxatida `LSP` paydo bo'ldi va plaginlar orasida
`typescript-lsp` turardi. CC hujjati tavsiya qilgan sinov — agentga ataylab tur xatosi kiritib, keyin tuzattirish:

```text
narx.js da jami funksiyasini chaqiradigan yangi funksiya qo'sh: savatJami(savat) — jami(savat) natijasini qaytarsin,
lekin ataylab jami ni noto'g'ri argument bilan chaqir: jami('savat'). Tahrirdan keyin til serveri nima diagnostika
berganini ayt, keyin xatoni tuzat. Testlarni ishga tushirma.
```

Agentning hisoboti:

```text
**Til serveri (TypeScript) bergan diagnostikalar:**
- ✘ **Xato** `narx.js:30:15` — `Argument of type 'string' is not assignable to parameter of type
  '{ narx: number; soni: number; }[]'. [2345]`. JSDoc'da `jami` massiv kutadi, lekin unga `'savat'` satri berilgan.
- ★ **Ogohlantirish** `narx.js:29:27` — `'savat' is declared but its value is never read. [6133]`.

Diagnostikalar tahrirdan darhol keyin emas, biroz kechikib keldi.

**Tuzatish:** `jami('savat')` o'rniga `jami(savat)` yozdim.
```

Diagnostika haqiqiy ekanini tekshirish uchun xatoli variant `tsc` bilan alohida kompilyatsiya qilindi:

```text
narx.js(29,27): error TS6133: 'savat' is declared but its value is never read.
narx.js(30,15): error TS2345: Argument of type 'string' is not assignable to parameter of type '{ narx: number; soni: number; }[]'.
```

Qator, ustun va xato kodlari bir xil. Agent bu xatoni build yoki test ishga tushirmasdan, tahrir paytining o'zida ko'rdi.

Ikki kuzatish:

- Agentning o'zi aytganidek, diagnostika tahrirdan darhol emas, **biroz kechikib** keldi.
- Agent tuzatishdan keyin "til serveri hali yangi diagnostika yubormadi, shuning uchun yo'qolganini tasdiqlay olmayman" deb
  yozdi. LSP tez fikr-mulohaza beradi, lekin 8-bobdagi tekshiruvning (test, typecheck) o'rnini bosmaydi.

## Bir nechta paketga tegadigan o'zgarish

CC (monorepo) — masalan, umumiy turni barcha chaqiruv joylari bilan birga o'zgartirish:

- **Butun o'zgarishni bitta sessiyada bering.** Umumiy tahrir va uning chaqiruv joylari birga berilsa, har tahrir ortidagi
  qarorlar izchil bo'ladi. Har paketda ularni qaytadan chiqarishga to'g'ri kelmaydi.
- **Avval reja.** Plan mode'da Claude rejani faylga yozadi. Uzun sessiya qisqartiriladi, lekin reja fayli har qisqartirishdan
  keyin qayta yuklanadi (7, 15-boblar).

## Variantlar

| Vosita | Yutug'i | Kamchiligi | Qachon |
| --- | --- | --- | --- |
| Pastki papkadan ishga tushirish | Faqat kerakli CLAUDE.md va fayllar | Boshqa paketga o'tish uchun qo'shimcha ruxsat kerak | Ish bitta paketda |
| Papkalar bo'yicha CLAUDE.md | Har jamoa o'z qoidasini yuritadi | Ko'p fayl, izchillikni kuzatish kerak | Monorepo, katta quyi tizimlar |
| `claudeMdExcludes` | Begona ko'rsatmalar umuman yuklanmaydi | Doimiy ro'yxat | Hech qachon ishlamaydigan papkalar |
| `Read` taqiq qoidalari | Generatsiya qilingan va begona kod o'qilmaydi | `grep -r` natijasini yopmaydi | Commit qilingan build, vendor |
| LSP plagini | Diagnostika va belgi bo'yicha navigatsiya, kam fayl o'qish | Har dasturchida til serveri kerak; bulutda ishlamaydi | Turli tilli katta loyiha |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Butun monorepo konvensiyalari ildizdagi CLAUDE.md'da | Har sessiyada aloqasiz ko'rsatmalar yuklanadi | Paketlar bo'yicha CLAUDE.md yoki `paths` qoidalari |
| Bitta paketda ishlash uchun ildizdan ishga tushirish | Boshqa paketlarning qoidalari va fayllari aralashadi | Paket papkasidan ishga tushiring |
| Pastki papka `.claude/settings.json` ni ildizdan meros oladi deb kutish | CC: sozlamalar meros qilinmaydi | Kerakli sozlamalarni o'sha papkaga qo'ying |
| `Read(./dist/**)` deb yozish | CC: papkaning o'zi ham yopiladi | `Read(./**/dist/**/*)` |
| LSP plaginini o'rnatib, til serverini o'rnatmaslik | CC: plagin serverni o'z ichiga olmaydi | Avval binary, keyin plagin |
| LSP diagnostikasini testlar o'rniga ishlatish | Diagnostika kechikishi mumkin va faqat tur xatolarini ko'rsatadi | Testlar va typecheck baribir kerak |

## Amaliyot

1. Ildizdan va pastki papkadan ishga tushirishning farqi nima?
2. Papkadagi CLAUDE.md va `paths` qoidasi orasida qanday tanlaysiz?
3. `claudeMdExcludes` qachon kerak? Har vazifa uchun uni o'zgartirish kerakmi?
4. Nega taqiq naqshi `/**` emas, `/**/*` bilan tugaydi? Taqiq qoidalari nimani yopmaydi?
5. LSP plagini agentga nima beradi? Uni o'rnatishning uch qadami qaysi?
6. Tajribada agent tur xatosini qanday bildi va nima tekshirildi?
7. Umumiy turni barcha paketlarda o'zgartirish kerak. Vazifani qanday berasiz?

<details>
<summary>Javoblar</summary>

1. Ildizdan — barcha fayllarga kirish, ishga tushganda faqat ildizdagi CLAUDE.md. Pastki papkadan — faqat shu papka (qo'shimcha ruxsatgacha), shu papkaniki va undan yuqoridagi barcha CLAUDE.md.
2. Har papka egasi o'z konvensiyasini kod bilan birga yuritsa — papkadagi CLAUDE.md. Barcha konvensiyalar bir joyda bo'lsin yoki bitta qoida ko'p tarqoq yo'lga tegishli bo'lsa — `paths` qoidasi.
3. Hech qachon ishlamaydigan papkalar uchun (boshqa jamoa paketlari, eski kod, begona kod). Yo'q: ro'yxat doimiy, boshqa paket bilan ishlash uchun o'sha papkadan ishga tushiriladi.
4. `/**/*` papka ichidagi hamma narsani yopadi, lekin papkaning o'zini emas, agent `ls dist` qila oladi. Taqiq qoidalari papka bo'yicha `grep -r`/`find` natijasini va fayl ochadigan ichki jarayonlarni yopmaydi.
5. Tahrirdan keyin diagnostika va belgi bo'yicha qidiradigan `LSP` tool'i. Qadamlar: til serveri dasturini o'rnatish, `/plugin install …`, server ishga tushganini tekshirish (ataylab tur xatosi bilan).
6. Til serveri tahrirdan keyin TS2345 xatosini va TS6133 ogohlantirishini yubordi. Xatoli variant `tsc` bilan alohida kompilyatsiya qilinib, bir xil qator, ustun va kodlar olindi.
7. Butun o'zgarishni (umumiy tur va barcha chaqiruv joylari) bitta sessiyada, avval plan mode'da reja tuzdirib. Reja fayli qisqartirishlardan keyin qayta yuklanadi.

</details>

## Rasmiy hujjat

- [CC: Set up Claude Code in a monorepo or large codebase](https://code.claude.com/docs/en/large-codebases)
- [CC: Code intelligence plugins](https://code.claude.com/docs/en/plugins/code-intelligence)
- [CC: How Claude remembers your project — Exclude specific CLAUDE.md files](https://code.claude.com/docs/en/memory#exclude-specific-claude-md-files)
- [CC: Configure permissions — Read and Edit](https://code.claude.com/docs/en/permissions#read-and-edit)
