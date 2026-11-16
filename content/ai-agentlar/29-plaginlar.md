# 29 — Plaginlar va jamoa sozlamalari

[Mundarija](README.md)

## Tushuncha

25–28-boblarda skill, hook va MCP serverlarni bitta loyihada sozladik. Endi ikkinchi repo'ga ham, yangi hamkasbga ham xuddi shu
sozlamalar kerak. Fayllarni qo'lda ko'chirib yurish o'rniga ularni **plaginga** yig'ish mumkin.

CC (Plugins overview): **plagin** — komponentlar papkasi, odatda manifest bilan. Manifest — `.claude-plugin/plugin.json` dagi JSON
fayl, u plaginga nom beradi va versiya, tavsif kabi ma'lumotlar qo'shadi. Komponentlar — plagin Claude Code'ga qo'shadigan narsalar:

| Komponent | Plagindagi joyi | Nima |
| --- | --- | --- |
| Skill'lar | `skills/<nom>/SKILL.md` | 25-bob; `/plagin:nom` bilan chaqiriladi |
| Agentlar | `agents/<nom>.md` | Subagent ta'riflari (30-bob) |
| Hook'lar | `hooks/hooks.json` | 26-bob; format sozlamalar faylidagi `hooks` bilan bir xil |
| MCP serverlar | `.mcp.json` | 27–28-boblar |
| Manifest | `.claude-plugin/plugin.json` | Nom (majburiy), tavsif, versiya, muallif |

CC (Create a plugin) ogohlantiradi: `.claude-plugin/` ichiga **faqat** `plugin.json` qo'yiladi. U yerga saqlangan komponentlar
yuklanmaydi.

### Plagin qachon kerak

CC (Plugins overview): skill, subagent, hook va MCP server plaginsiz ham ishlaydi. Plagin quyidagi holatlarda kerak:

- bir nechta komponentni **bitta birlik** qilib paketlamoqchisiz;
- boshqa birov yasagan sozlamani bitta buyruq bilan o'rnatib, marketplace'dan yangilanishlarini olmoqchisiz;
- o'z sozlamangizni hamkasblarga berish, ko'p loyihada o'rnatish yoki versiyali relizlar chiqarish kerak.

24-bobdagi belgi: "ikkinchi repo'ga ham xuddi shu sozlamalar kerak bo'lsa — plagin".

### Nomlar maydoni

Plagin skill'lari plagin nomi bilan prefikslanadi: `narx-jamoa` plaginidagi `reliz-izoh` skill'i `/narx-jamoa:reliz-izoh` bo'lib
chaqiriladi. CC bo'yicha shu tufayli bir nechta plagin to'qnashmasdan birga ishlaydi. Hook'larda esa prefiks yo'q. Bir hook ham
sozlamalar faylida, ham plaginda bo'lsa, u har hodisada **ikki marta** ishlaydi (CC Create a plugin).

### O'rnatish doiralari va marketplace

CC (Plugins overview):

| Doira | Kimga yoqiladi |
| --- | --- |
| User | Siz uchun, shu kompyuterdagi barcha loyihalarda |
| Project | Repo'da ishlaydigan hamma uchun — commit qilingan `.claude/settings.json` orqali. Har kim plaginni o'z kompyuteriga baribir o'rnatadi |
| Local | Faqat siz uchun, faqat shu repo'da |

**Marketplace** — plaginlar ro'yxati va har birini qayerdan olish yozilgan `.claude-plugin/marketplace.json` fayli bor repozitoriya
yoki papka. Bu do'kon emas, katalog. Claude Code birinchi interaktiv sessiyada Anthropic'ning rasmiy marketplace'ini
(`claude-plugins-official`) qo'shadi. 16-bobdagi LSP plagini shu yerdan o'rnatilgan edi.

### Yoqilgan plagin har sessiyaga ta'sir qiladi

CC (Plugins overview) uch oqibatni sanaydi:

- **Kontekst:** Claude o'zi chaqira oladigan har skill, agent va buyruqning nomi va tavsifi **har navbatda** kontekstda turadi,
  plagindan hech narsa ishlatilmagan sessiyada ham. To'liq matn faqat ishlatilganda yuklanadi.
- **Jarayonlar:** plaginning MCP serverlari har sessiya bilan birga ishlaydi, hook'lari o'z hodisalarida ishga tushadi.
- **Ruxsatlar:** plagin ishga tushiradigan narsa **sizning nomingizdan** ishlaydi.

Plaginni o'chirmasdan to'xtatish: `/plugin` yoki `claude plugin disable`.

### Xavfsizlik: o'rnatishdan oldin ko'rib chiqing

CC (Plugin security and trust) bo'yicha plagin sizning foydalanuvchi huquqlaringiz bilan kod ishga tushiradi va Claude kontekstiga
ko'rsatma qo'shadi:

| Komponent | Nima qiladi | Ruxsat qoidalari va sandbox qamrab oladimi |
| --- | --- | --- |
| Hook'lar, monitorlar | Shell buyruqlari, to'liq foydalanuvchi huquqlari bilan | **Yo'q** — sandbox'dan tashqarida ishlaydi |
| MCP va LSP serverlar | Jarayonlar sizning kompyuteringizda | Server jarayoni — yo'q; Claude'ning tool chaqiruvlari — ha |
| `bin/` papkasi | Bash'ning `PATH` iga qo'shiladi | Claude ishga tushirsa — tool chaqiruvi, qoidalar amal qiladi |
| Skill, buyruq, agent | Claude kontekstiga ko'rsatma | Claude'ning xatti-harakatiga ta'sir qiladi |
| Yangilanishlar | Auto-update yoqilgan bo'lsa, fayllar fonda o'zgaradi | Siz ko'rib chiqqan fayllar keyin o'zgarishi mumkin |

CC'dagi tekshiruv qadamlari:

1. `claude plugin marketplace list` — har marketplace qayerdan qo'shilganini ko'ring.
2. `/plugin` da plaginni tanlab, **Will install** bo'limini o'qing.
3. Plagin manbasida `hooks/hooks.json` (har hook nima ishga tushiradi), `.mcp.json` (server buyrug'i yoki URL) va `bin/` dagi har
   bir faylni o'qing.
4. `claude --plugin-dir <papka> plugin details <nom>` — sessiya ochmasdan komponentlar ro'yxati.

CC bo'yicha marketplace nomi uch darajadan biriga tushadi: **official** (`claude-plugins-official` va boshqalar), **community**
(masalan `claude-community`) va **third-party** — qolgan hammasi, hamkasbingiz yoki tashkilotingiz chiqargani ham. Qaysi darajada
bo'lmasin, o'rnatilgan plagin sizning huquqlaringiz bilan kod ishga tushira oladi.

## Amalda: loyiha sozlamasidan plagin

CC (Create a plugin) dagi "mavjud `.claude/` sozlamasini aylantirish" yo'riqnomasi bo'yicha 25-bobdagi ikki skill va 26-bobdagi
`.env` himoya hook'i bitta `narx-jamoa` plaginiga yig'ildi (Claude Code 2.1.325).

### 1. Tuzilma

```text
narx-jamoa/
├── .claude-plugin/
│   └── plugin.json
├── hooks/
│   ├── hooks.json
│   └── protect-files.sh
└── skills/
    ├── narx-qoidalari/SKILL.md
    └── reliz-izoh/SKILL.md
```

`plugin.json`:

```json
{
  "name": "narx-jamoa",
  "description": "Narx loyihasi jamoasi uchun: pul qoidalari, reliz izohi va .env himoyasi",
  "version": "1.0.0",
  "author": { "name": "Narx jamoasi" }
}
```

Skill'lar papkasi o'zgarishsiz ko'chirildi. `hooks/hooks.json` sozlamalar faylidagi `hooks` obyektining aynan o'zi. Faqat skript yo'li
plagin papkasiga ishora qiladi (`${CLAUDE_PLUGIN_ROOT}` — plagin o'rnatilgan papka):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "\"${CLAUDE_PLUGIN_ROOT}\"/hooks/protect-files.sh" }
        ]
      }
    ]
  }
}
```

### 2. Tekshirish

```bash
claude plugin validate ./narx-jamoa
```

Natijaning oxiri — `✔ Validation passed`. Undan oldin validator Anthropic katalogiga topshirish uchun yetishmayotgan narsalarni ham
sanadi: `README.md`, `LICENSE` (yoki `plugin.json` dagi `license`) va ikonka. Jamoa ichida ishlatiladigan plagin uchun bular majburiy
emas. Validatorning o'zi ham "bu tekshiruvlar natijani o'zgartirmaydi" deb yozdi.

```bash
claude --plugin-dir ./narx-jamoa plugin details narx-jamoa
```

```text
narx-jamoa 1.0.0
  Description: Narx loyihasi jamoasi uchun: pul qoidalari, reliz izohi va .env himoyasi

Component inventory
  Skills (2)  narx-qoidalari, reliz-izoh
  Agents (0)
  Hooks (1)  PreToolUse  (harness-only — no model context cost)
  MCP servers (0)
  LSP servers (0)

Projected token cost
  Always-on:   ~158 tok   added to every session
```

Hisobot CC'dagi ogohlantirishni raqam bilan ko'rsatdi: plagin **har sessiyaga** taxminan 158 token qo'shadi. Hook esa
"harness-only — no model context cost", ya'ni modelning kontekstiga hech narsa qo'shmaydi (24-bobdagi jadval).

### 3. Toza repo'da ishlatish

`.claude/` papkasi umuman yo'q repo'da, plagin `--plugin-dir` bilan bitta sessiyaga yuklandi.

**Skill** nomlar maydoni bilan:

```text
/narx-jamoa:reliz-izoh v1.0
```

```text
## v1.0

### Yangi
- Muddatli to'lov: summani oylik to'lovlarga bo'lish (`bolibTolash`).
- Kechikkan to'lov uchun jarima: har kechikkan kun uchun 0.1%, ko'pi bilan 10% (`jarima`).
...
```

**Hook** — `.env fayliga DEBUG=1 qatorini qo'sh.` so'roviga:

```text
`DEBUG=1` qatorini `.env` fayliga qo'sha olmadim, fayl o'zgarmadi. Tahrirlashni `narx-jamoa` plaginidagi `protect-files.sh`
hook'i to'xtatdi, chunki `.env` himoyalangan fayllar ro'yxatida. Bu cheklovni aylanib o'tmadim.
```

Repo'ning o'zida hech qanday sozlama yo'q edi: skill ham, himoya ham plagin bilan keldi. Ikkinchi repo yoki yangi hamkasb uchun
shu papka (yoki marketplace'dagi yozuv) kifoya.

### 4. Tarqatish

CC (Create a plugin) — tayyor plaginni boshqalarga berishning uch yo'li:

| Yo'l | Qanday | Qachon |
| --- | --- | --- |
| To'g'ridan-to'g'ri | Papka yoki `.zip` ni berasiz, hech narsa e'lon qilinmaydi | Bir necha kishi |
| O'z marketplace'ingiz | Hamkasblar marketplace'ni bir marta qo'shadi, plaginni nomi bilan o'rnatadi va yangilanishlarni oladi | Jamoa yoki tashkilot |
| Anthropic katalogi | Ko'rib chiqishdan o'tgach, claude.ai va Cowork'da qo'shish mumkin bo'ladi | Ommaviy plagin |

Ishlab chiqish paytida marketplace kerak emas: `--plugin-dir` plaginni bitta sessiyaga yuklaydi, fayllarni o'zgartirsangiz,
`/reload-plugins`.

## Variantlar

| Usul | Yutug'i | Kamchiligi | Qachon |
| --- | --- | --- | --- |
| Repo'dagi `.claude/` | Kod bilan birga versiyalanadi, sozlash oddiy | Har repo'da alohida; boshqa repo'ga ko'chirish qo'lda | Bitta loyihaga xos sozlama |
| `~/.claude/` (shaxsiy) | Barcha loyihalaringizda | Faqat sizda, jamoaga tarqamaydi | Shaxsiy afzalliklar |
| Plagin (`--plugin-dir`, zip) | Bitta birlik, ko'chirish oson | Yangilanishni qo'lda tarqatasiz | Bir necha hamkasb |
| Plagin + marketplace | Nomi bilan o'rnatish, versiya, avtomatik yangilanish | Marketplace yuritish kerak | Jamoa, ko'p repo |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Komponentlarni `.claude-plugin/` ichiga qo'yish | CC: u yerda faqat `plugin.json`, qolganlari yuklanmaydi | Komponentlar plagin ildizida |
| Plaginga ko'chirgandan keyin `.claude/` dagi hook'ni qoldirish | CC: hook'larda prefiks yo'q, ikki marta ishlaydi | Plagin ishlashini tekshirib, asl nusxani o'chiring |
| Hook skript yo'lini nisbiy yozish | Plagin boshqa papkaga o'rnatiladi | `${CLAUDE_PLUGIN_ROOT}` |
| Plaginni ko'rmasdan o'rnatish | CC: hook'lar va serverlar sizning huquqlaringiz bilan, sandbox'dan tashqarida ishlaydi | `hooks.json`, `.mcp.json`, `bin/` ni o'qing; `plugin details` |
| Ko'p plaginni yoqib qo'yish | CC: har biri har navbatda kontekstga tavsiflar qo'shadi | Ishlatilmaydiganini `claude plugin disable` |
| "Official emas — demak xavfli", "official — demak xavfsiz" | CC: har qanday darajadagi plagin sizning huquqlaringiz bilan ishlaydi | Har plaginni manbasi bo'yicha ko'rib chiqing |

## Amaliyot

1. Plagin qanday komponentlardan iborat bo'lishi mumkin va ular qayerda turadi?
2. Qachon plagin kerak, qachon oddiy `.claude/` yetarli?
3. Plagin skill'i qanday chaqiriladi? Nega hook ikki marta ishlashi mumkin?
4. Yoqilgan plagin ishlatilmagan sessiyaga ham qanday ta'sir qiladi?
5. Plaginni o'rnatishdan oldin nimalarni tekshirish kerak?
6. Tajribada `plugin details` qanday ma'lumot berdi?

<details>
<summary>Javoblar</summary>

1. Skill'lar (`skills/`), agentlar (`agents/`), hook'lar (`hooks/hooks.json`), MCP serverlar (`.mcp.json`) va manifest (`.claude-plugin/plugin.json`).
2. Bir nechta komponentni bitta birlik qilib boshqa repo yoki hamkasblarga berish, ko'p loyihada o'rnatish yoki versiyali tarqatish kerak bo'lganda — plagin. Bitta loyihaga xos sozlamaga `.claude/` yetarli.
3. `/plagin-nomi:skill-nomi`. Hook'larda prefiks yo'q: bir hook ham sozlamalar faylida, ham plaginda bo'lsa, har hodisada ikkalasi ishlaydi.
4. Claude o'zi chaqira oladigan skill va agentlarning nomi va tavsifi har navbatda kontekstda turadi; MCP serverlari ishlaydi, hook'lar ishga tushadi; hammasi sizning huquqlaringiz bilan.
5. Marketplace manbasi (`claude plugin marketplace list`), `/plugin` dagi Will install bo'limi, `hooks/hooks.json`, `.mcp.json` va `bin/` mazmuni, `plugin details` dagi komponentlar ro'yxati.
6. Komponentlar ro'yxati (2 skill, 1 `PreToolUse` hook), hook model kontekstiga narx qo'shmasligi va plagin har sessiyaga taxminan 158 token qo'shishi.

</details>

## Rasmiy hujjat

- [CC: Plugins overview](https://code.claude.com/docs/en/plugins/overview)
- [CC: Create a Claude Code plugin](https://code.claude.com/docs/en/plugins/create)
- [CC: Plugin security and trust](https://code.claude.com/docs/en/plugins/security)
- [CC: Extend Claude Code — Build your setup over time](https://code.claude.com/docs/en/features-overview#build-your-setup-over-time)
