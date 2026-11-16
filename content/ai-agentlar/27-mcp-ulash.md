# 27 — MCP: tashqi tizimlarga ulanish

[Mundarija](README.md)

## Tushuncha

Agent fayl o'qiydi va buyruq ishga tushiradi. Lekin ma'lumot ko'pincha boshqa joyda bo'ladi: issue tracker'da, hujjatlar
bazasida, dizayn vositasida, kompaniyaning ichki API'sida. MCP — shularga ulanish usuli.

MCP (Introduction): **MCP** (Model Context Protocol) — AI ilovalarni tashqi tizimlarga ulash uchun ochiq kodli standart. U orqali
Claude yoki ChatGPT kabi ilovalar uch xil narsaga ulanadi:

- ma'lumot manbalariga — lokal fayllar, ma'lumotlar bazalari;
- tool'larga — qidiruv tizimlari, kalkulyatorlar;
- jarayonlarga — maxsus promptlar.

Hujjat o'xshatishi: MCP — **AI ilovalar uchun USB-C porti**. USB-C elektron qurilmalarni ulashning yagona usulini bergani kabi,
MCP ham AI ilovalarni tashqi tizimlarga ulashning yagona usulini beradi. 4-bobda ko'rdik: uchala vosita (Claude Code, Codex,
Copilot) ham MCP'ni qo'llab-quvvatlaydi. Bir marta yozilgan server hammasida ishlaydi.

### Arxitektura

MCP (Architecture overview, spetsifikatsiya 2026-07-28) — klient-server arxitekturasi:

```text
┌────────────── MCP host (Claude Code) ──────────────┐
│  MCP client 1        MCP client 2        MCP client 3│
└──────┬──────────────────┬───────────────────┬──────┘
       │ stdio            │ stdio             │ Streamable HTTP
       ▼                  ▼                   ▼
  MCP server A       MCP server B        MCP server C
  (lokal: fayllar)   (lokal: baza)       (masofaviy: Sentry)
```

| Ishtirokchi | Nima |
| --- | --- |
| **MCP host** | Bir yoki bir nechta MCP klientni boshqaradigan AI ilova (masalan, Claude Code) |
| **MCP client** | MCP server bilan ulanishni ushlab turadigan komponent. Host har bir server uchun alohida klient yaratadi |
| **MCP server** | Klientlarga kontekst beradigan dastur. Lokal yoki masofaviy bo'lishi mumkin |

MCP ikki qatlamdan iborat:

- **Ma'lumot qatlami** (data layer) — JSON-RPC 2.0 asosidagi protokol: versiya va imkoniyatlarni aniqlash, asosiy primitivlar.
- **Transport qatlami** — aloqa kanali. Ikkita transport bor:

| Transport | Qanday | Qachon |
| --- | --- | --- |
| **stdio** | Bir kompyuterdagi jarayonlar orasida standart kirish/chiqish oqimlari | Lokal server; tarmoq yuklamasi yo'q |
| **Streamable HTTP** | HTTP POST, oqim uchun ixtiyoriy Server-Sent Events | Masofaviy server; bearer token, API kaliti, header'lar bilan autentifikatsiya; MCP token olish uchun OAuth'ni tavsiya qiladi |

### Primitivlar

MCP (Architecture) — server beradigan uchta asosiy primitiv:

| Primitiv | Nima | Misol |
| --- | --- | --- |
| **Tools** | AI ilova chaqiradigan bajariladigan funksiyalar | Fayl amallari, API chaqiruvlari, bazaga so'rov |
| **Resources** | Kontekst beradigan ma'lumot manbalari | Fayl mazmuni, baza yozuvlari, API javoblari |
| **Prompts** | Model bilan muloqotni tuzishga yordam beradigan qayta ishlatiladigan shablonlar | Tizim promptlari, few-shot misollar |

Har primitivning ro'yxat olish (`*/list`) va olish yoki bajarish (`resources/read`, `prompts/get`, `tools/call`) metodlari bor.
Hujjatdagi misol: ma'lumotlar bazasi haqida kontekst beradigan server so'rov uchun **tool**, baza sxemasi uchun **resource** va
tool'lar bilan ishlash misollari uchun **prompt** taqdim etishi mumkin.

Klient tomonida ham primitiv bor: **elicitation** — server foydalanuvchidan qo'shimcha ma'lumot yoki tasdiq so'rashi.

### Claude Code'da MCP

CC (Connect to MCP servers) — server qo'shish terminalda, sessiyadan tashqarida bajariladi:

```bash
claude mcp add --transport http claude-code-docs https://code.claude.com/docs/mcp
```

Buyruq qismlari:

- `claude mcp add` — serverni Claude Code'da ro'yxatdan o'tkazadi;
- `--transport http` — server URL'da joylashgan, lokal jarayon emas;
- `claude-code-docs` — o'zingiz tanlagan nom, tool'lar shu nom bilan belgilanadi;
- URL — server manzili.

Boshqa buyruqlar:

| Buyruq | Nima qiladi |
| --- | --- |
| `claude mcp list` | Serverlar va ularning holati |
| `claude mcp get <nom>` | Bitta server haqida batafsil, qaysi doirada saqlangani |
| `claude mcp remove <nom>` | Serverni olib tashlash |
| `/mcp` (sessiya ichida) | Serverlarni ko'rish, o'chirish, autentifikatsiya |

**Doiralar** (scope), CC:

| Doira | Qayerda yuklanadi | Jamoa bilan | Qayerda saqlanadi |
| --- | --- | --- | --- |
| `local` (standart) | Faqat joriy loyihada | Yo'q | `~/.claude.json`, shu loyiha yozuvi ostida |
| `project` | Faqat joriy loyihada | Ha, git orqali | Loyiha ildizidagi `.mcp.json` |
| `user` | Barcha loyihalaringizda | Yo'q | `~/.claude.json`, yuqori darajadagi `mcpServers` |

Bir xil nom bir nechta doirada bo'lsa: local > project > user (24-bob).

**Xavfsizlik: repo o'z serverlarini o'zi tasdiqlay olmaydi.** CC (MCP) bo'yicha `.mcp.json` dagi serverlar siz papkaga ishonmaguningizcha
`⏸ Pending approval` holatida turadi. Repo'ning o'z `.claude/settings.json` idagi "hamma serverlarni yoq" kabi tasdiqlar ishonilmagan
papkada e'tiborsiz qoldiriladi. 5-bobdagi qoida shu yerda ham kerak: begona repo'dagi `.mcp.json` ni ochishdan oldin ko'rib chiqing.
Tashqi tizimdan kelgan matndagi xavflar — 37-bob.

## Amalda

CC (Connect to MCP servers) quickstart'i aynan shu tartibda sinov loyihasida bajarildi (Claude Code 2.1.325).

### 1. Qo'shish

```bash
claude mcp add --transport http claude-code-docs https://code.claude.com/docs/mcp
```

```text
Added HTTP MCP server claude-code-docs with URL: https://code.claude.com/docs/mcp to local config
File modified: ~/.claude.json [project: …/lab/v18]
```

`local config` — server faqat shu loyiha va faqat siz uchun ro'yxatdan o'tdi.

### 2. Holat

```bash
claude mcp list
```

```text
Checking MCP server health…
claude-code-docs: https://code.claude.com/docs/mcp (HTTP) - ✔ Connected
```

### 3. Ishlatish

CC quickstart'idagi so'rov (serverning nomi so'rovda tilga olingan, shunda javob veb-qidiruvdan emas, aynan shu serverdan
kelgani kafolatlanadi):

```text
Use the claude-code-docs server to look up what MCP_TIMEOUT does. Javobni o'zbekcha, 3 qatorda ber.
```

Sessiya boshida server uchta tool berdi:

```text
mcp__claude-code-docs__query_docs_filesystem_claude_code_docs
mcp__claude-code-docs__search_claude_code_docs
mcp__claude-code-docs__submit_feedback
```

Tool nomi `mcp__<server>__<tool>` ko'rinishida — javob qaysi serverdan kelganini shundan bilasiz. Sessiya qadamlari:

1. `[ToolSearch] select:mcp__claude-code-docs__search_claude_code_docs` — tool tavsifi kerak bo'lganda yuklandi (pastda tushuntirilgan);
2. `[mcp__claude-code-docs__search_claude_code_docs] {"query": "MCP_TIMEOUT environment variable"}` — serverga so'rov;
3. natija **80,1 KB** chiqdi. Claude Code uni kontekstga to'liq qo'ymadi, faylga saqladi (`Output too large (80.1KB). Full output
   saved to: …`), agent esa faylning kerakli qismini o'qidi.

Javob:

```text
`MCP_TIMEOUT` MCP serverlar ishga tushganda ulanishni qancha kutishni belgilaydi; qiymat millisekundda beriladi, standart qiymati 30 soniya.
Server sekin ishga tushsa, masalan `npx` paketni birinchi marta yuklayotganda, uni oshiring: `MCP_TIMEOUT=60000 claude`.
U tool chaqiruvi qancha davom etishini cheklamaydi (bunga `MCP_TOOL_TIMEOUT` javob beradi), ...
```

`MCP_TIMEOUT=60000 claude` misoli va "millisekundda" degan tafsilot CC (MCP quickstart) sahifasida aynan shunday yozilgan.

80 KB natijaga oid tafsilot ham CC (MCP, "MCP output limits and warnings") hujjatida bor: tool chiqishi 10 000 tokendan oshsa
ogohlantirish chiqadi, standart chegara 25 000 token (`MAX_MCP_OUTPUT_TOKENS`). O'z chegarasini e'lon qilmagan tool'ning 50 000
belgidan uzun matnli natijasi faylga saqlanadi. Server yozuvchi uchun saboq — natijani ixcham qaytarish (28-bob).

### 4. Kontekst narxi

`/context` dagi shu server qatorlari:

```text
| mcp__claude-code-docs__query_docs_filesystem_claude_code_docs | claude-code-docs | 1.1k |
| mcp__claude-code-docs__search_claude_code_docs | claude-code-docs | 346 |
| mcp__claude-code-docs__submit_feedback | claude-code-docs | 300 |
```

Bu tool tavsiflari **kechiktirilgan** (deferred) bo'limda turibdi. CC (How Claude Code works, Costs) bo'yicha MCP tool tavsiflari
standart holatda kechiktiriladi va **tool search** orqali kerak bo'lganda yuklanadi. Shuning uchun kontekstga avval faqat tool
nomlari va server ko'rsatmalari tushadi. Yuqoridagi 1-qadamdagi `ToolSearch` chaqiruvi aynan shu edi.

### 5. Olib tashlash

```bash
claude mcp remove claude-code-docs
```

```text
Removed MCP server "claude-code-docs" from local config
File modified: ~/.claude.json [project: …/lab/v18]
```

CC (MCP quickstart) eslatadi: har ulangan server kontekstda joy oladi, chunki uning tool nomlari va server ko'rsatmalari har sessiyada
yuklanadi. Ishlatmaydigan serverlarni olib tashlang yoki `/mcp` da o'chirib qo'ying.

## MCP yoki CLI?

CC (Best practices): agent ko'ra olmaydigan narsa boshqa tizimda bo'lsa va **o'sha tizimning CLI'si bo'lsa, odatda bu eng oson
yo'l**. Masalan, `gh` o'rnatilgan va kirilgan bo'lsa, Claude hech qanday tushuntirishsiz PR ochadi va review izohlarini o'qiydi.
Avval ko'rmagan CLI uchun unga `--help` ni ko'rsatish kifoya. CLI'si yo'q tizimlar uchun — MCP.

CC (Costs) sababini aytadi: `gh`, `aws`, `gcloud`, `sentry-cli` kabi CLI vositalari MCP serverlarga qaraganda kontekst bo'yicha
tejamliroq, chunki ular tool ro'yxati qo'shmaydi. Claude CLI buyruqlarini to'g'ridan-to'g'ri ishga tushiradi.

| Tizim | Tanlov | Nega |
| --- | --- | --- |
| GitHub, AWS, GCP — CLI bor | CLI (`gh`, `aws`, `gcloud`) | Tool ro'yxati yo'q, agent CLI'ni biladi yoki `--help` dan o'rganadi |
| Notion, Figma, ichki tizim — CLI yo'q | MCP | Autentifikatsiya va tool'larni server beradi |
| Brauzer | Claude in Chrome (23-bob) | Kirgan sessiyalaringiz bilan |
| O'z ma'lumotlar bazangiz | O'z MCP serveringiz yoki CLI (`psql`) | 28-bob |

## Variantlar

| Doira | Yutug'i | Kamchiligi | Qachon |
| --- | --- | --- | --- |
| `local` | Faqat siz va faqat shu loyiha; maxfiy ma'lumotli server uchun qulay | Jamoaga ulashilmaydi | Tajriba, shaxsiy server |
| `project` (`.mcp.json`) | Butun jamoa bir xil tool'larni oladi | Har kishi tasdiqlashi kerak; maxfiy ma'lumotni faylga yozmang | Jamoa uchun umumiy server |
| `user` | Barcha loyihalarda | Har loyihada kontekst oladi | Doim kerak shaxsiy vosita |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| CLI bor tizim uchun MCP o'rnatish | CC: CLI kontekst bo'yicha tejamliroq | CLI bo'lsa, CLI |
| Ko'p server ulab, unutib qo'yish | Tool nomlari va ko'rsatmalari har sessiyada joy oladi | Keraksizini `/mcp` da o'chiring yoki `claude mcp remove` |
| Begona repo'dagi `.mcp.json` ni ko'rmasdan tasdiqlash | Server sizning nomingizdan tashqi tizimlarga ulanadi | Avval faylni o'qing (5-bob) |
| Maxfiy token'ni `.mcp.json` ga yozish | Fayl git orqali hammaga tarqaladi | Muhit o'zgaruvchisi yoki `local` doira (38-bob) |
| MCP natijasini doim to'liq ishonchli deb hisoblash | Tashqi matnda zararli ko'rsatma bo'lishi mumkin | 37-bob: prompt injection |

## Amaliyot

1. MCP nima va uning USB-C o'xshatishi nimani anglatadi?
2. MCP host, client va server farqi nima?
3. Server beradigan uchta primitiv qaysilar? Har biriga misol keltiring.
4. `local`, `project` va `user` doiralari qayerda saqlanadi va kim bilan ulashiladi?
5. Tajribada server natijasi 80 KB chiqdi. Claude Code u bilan nima qildi?
6. Qachon MCP o'rniga CLI tanlash kerak?

<details>
<summary>Javoblar</summary>

1. AI ilovalarni tashqi tizimlarga (ma'lumot manbalari, tool'lar, jarayonlar) ulash uchun ochiq standart. USB-C qurilmalarni ulashning yagona usuli bo'lgani kabi, MCP AI ilovalarni tashqi tizimlarga ulashning yagona usuli; bir marta yozilgan server turli ilovalarda ishlaydi.
2. Host — klientlarni boshqaradigan AI ilova (Claude Code). Client — bitta server bilan ulanishni ushlab turadigan komponent (har server uchun alohida). Server — kontekst beradigan dastur (lokal yoki masofaviy).
3. Tools (bazaga so'rov, API chaqiruvi), Resources (fayl mazmuni, baza sxemasi), Prompts (qayta ishlatiladigan shablonlar, few-shot misollar).
4. `local` — `~/.claude.json` dagi loyiha yozuvida, faqat siz. `project` — `.mcp.json`, git orqali jamoa bilan. `user` — `~/.claude.json` dagi yuqori darajadagi `mcpServers`, faqat siz, barcha loyihalarda.
5. Natijani kontekstga to'liq qo'ymasdan faylga saqladi; agent faylning kerakli qismini o'qidi. CC bo'yicha o'z chegarasini e'lon qilmagan tool'ning 50 000 belgidan uzun natijasi faylga saqlanadi.
6. Tizimning CLI'si bo'lsa (`gh`, `aws`, `gcloud`): CC bo'yicha CLI kontekst bo'yicha tejamliroq, tool ro'yxati qo'shmaydi.

</details>

## Rasmiy hujjat

- [MCP: What is the Model Context Protocol?](https://modelcontextprotocol.io/docs/getting-started/intro)
- [MCP: Architecture overview](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture)
- [CC: Connect to MCP servers (quickstart)](https://code.claude.com/docs/en/mcp-quickstart)
- [CC: Connect Claude Code to tools via MCP](https://code.claude.com/docs/en/mcp)
- [CC: Best practices — Connect the tools Claude needs](https://code.claude.com/docs/en/best-practices#connect-the-tools-claude-needs)
- [CC: Manage costs effectively — Reduce MCP server overhead](https://code.claude.com/docs/en/costs)
