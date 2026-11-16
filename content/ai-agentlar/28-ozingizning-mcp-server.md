# 28 — O'z MCP serveringizni yozish

[Mundarija](README.md)

## Tushuncha

27-bobda tayyor serverga ulandik. Endi o'zimiz yozamiz. Qachon kerak bo'ladi? Agentga kompaniyangizning ichki tizimi — ma'lumotlar
bazasi, ichki API, hisobot — kerak bo'lsa va uning CLI'si bo'lmasa (27-bob: CLI bor joyda CLI). MCP serveri shu tizimni agentga
tool'lar ko'rinishida beradi.

MCP (Build an MCP server) bo'yicha server uch xil imkoniyat bera oladi:

| Imkoniyat | Nima |
| --- | --- |
| **Resources** | Klient o'qiy oladigan faylga o'xshash ma'lumot (API javobi, fayl mazmuni) |
| **Tools** | LLM chaqira oladigan funksiyalar (foydalanuvchi ruxsati bilan) |
| **Prompts** | Foydalanuvchiga vazifani bajarishda yordam beradigan tayyor shablonlar |

Rasmiy qo'llanma asosan **tool'larga** e'tibor beradi. Bu bob ham shunday.

### Yaxshi tool qanday bo'ladi

Tool'ning "foydalanuvchisi" — inson emas, model. AE (Writing effective tools for agents, 2025-09-11) shundan kelib chiqadigan
tamoyillarni beradi:

| Tamoyil | Mazmuni |
| --- | --- |
| **To'g'ri tool'larni tanlang, API'ni shunchaki o'ramang** | Ko'proq tool har doim yaxshiroq natija bermaydi. Har bir endpoint uchun alohida tool emas, muhim jarayonlar uchun bir nechta o'ylangan tool. Ko'p qadamli ishni birlashtiring: masalan, alohida "ro'yxat" va "yaratish" o'rniga bitta tool bo'sh vaqtni topib, uchrashuvni belgilaydi |
| **Nomlar maydoni** (namespacing) | Bog'liq tool'larni umumiy prefiks bilan guruhlang, masalan `asana_search`, `jira_search` |
| **Mazmunli kontekst qaytaring** | Past darajadagi identifikatorlar (`uuid`, `mime_type`) o'rniga foydali maydonlar; tushunarsiz ID'larni nomlarga aylantiring. `concise` va `detailed` javob rejimi |
| **Token tejamkorligi** | Katta javoblar uchun sahifalash, filtrlash, qisqartirish; oqilona standart qiymatlar. Xato xabari nimani tuzatish kerakligini aytsin, tushunarsiz kod yoki stack trace emas |
| **Tavsiflarni prompt kabi yozing** | Tool'ni yangi xodimga tushuntirgandek tasvirlang, yashirin kontekstni ochiq ayting. Parametr nomlari aniq bo'lsin: `user` emas, `user_id` |
| **Baholang va yaxshilang** | Natijasi tekshiriladigan, haqiqiy, ko'p qadamli baholash (eval) vazifalarini yarating; agent transkriptlari va xatolarni tahlil qiling |

AE (Building effective agents, Appendix 2) ham shunga o'xshash maslahat beradi: tool'ni loyihalashni inson-kompyuter interfeysini
loyihalashdek qiling. Tavsif va parametrlarga qarab tool qanday ishlatilishi tushunarlimi? Xato qilishni qiyinlashtiring.

### Texnik qoidalar

MCP (Build an MCP server) TypeScript qo'llanmasidan:

- paketlar: `@modelcontextprotocol/server` va `zod` (kirish sxemasi uchun); Node.js 20 yoki undan yuqori;
- `McpServer` yaratiladi, `registerTool` bilan tool qo'shiladi, `serveStdio` bilan stdio orqali ishga tushiriladi;
- **stdio serverda hech qachon `console.log()` ishlatmang.** U stdout'ga yozadi va JSON-RPC xabarlarini buzadi. Buning o'rniga
  `console.error()` (stderr) ishlating;
- `serveStdio` server yaratuvchi funksiyani (`createServer`) kerak bo'lganda chaqiradi, shuning uchun u har safar **yangi**
  `McpServer` qaytarishi kerak;
- tekshirish uchun **MCP Inspector**: `npx @modelcontextprotocol/inspector --cli node … --method tools/list`.

## Amalda: buyurtmalar serveri

Vazifa: do'kon buyurtmalari (`buyurtmalar.json`, 60 ta yozuv) haqida agent savollarga javob bera olsin. Har yozuvda texnik
`id` (UUID), mijoz, holat, mahsulotlar va sana bor:

```json
{
  "id": "b7e1c0a2-0001-4f1e-9a6b-749562111997",
  "mijoz": "Malika Yusupova",
  "holat": "yolda",
  "mahsulotlar": [{ "nom": "Kosa", "soni": 4, "narx": 8000 }, { "nom": "Kosa", "soni": 1, "narx": 85000 }],
  "sana": "2026-11-05"
}
```

### Server

O'rnatish (Node.js 26, `@modelcontextprotocol/server` 2.4.0):

```bash
npm init -y && npm pkg set type=module
npm install @modelcontextprotocol/server zod
```

`server.js` — rasmiy qo'llanmadagi tuzilma bo'yicha (soddalik uchun TypeScript emas, JavaScript):

```js
// Buyurtmalar MCP serveri (stdio). Rasmiy qo'llanmadagi namunaga asoslangan: McpServer + registerTool + serveStdio
import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { z } from "zod";
import { readFile } from "node:fs/promises";

const HOLATLAR = ["yangi", "yolda", "yetkazildi", "bekor"];
const jami = (b) => b.mahsulotlar.reduce((s, m) => s + m.narx * m.soni, 0);
const som = (n) => `${n.toLocaleString("ru-RU").replace(/ /g, " ")} so'm`;
const matn = (text) => ({ content: [{ type: "text", text }] });

function createServer() {
  const server = new McpServer({ name: "buyurtmalar", version: "1.0.0" });

  server.registerTool(
    "buyurtma_qidirish",
    {
      description:
        "Do'kon buyurtmalarini mijoz nomi va/yoki holati bo'yicha qidiradi. Natija sanasi bo'yicha yangidan eskiga. " +
        "Avval format='concise' bilan qidiring; bitta buyurtma tafsiloti kerak bo'lsa, format='detailed'.",
      inputSchema: z.object({
        mijoz: z.string().optional().describe("Mijoz ismi yoki uning bir qismi, masalan 'Aziza'"),
        holat: z.string().optional().describe(`Buyurtma holati: ${HOLATLAR.join(", ")}`),
        limit: z.number().int().min(1).max(50).default(10).describe("Nechta natija qaytarish (standart 10)"),
        format: z.enum(["concise", "detailed"]).default("concise").describe("concise — bir qator; detailed — mahsulotlar bilan"),
      }),
    },
    async ({ mijoz, holat, limit, format }) => {
      if (holat && !HOLATLAR.includes(holat)) {
        return matn(`Noma'lum holat: "${holat}". Mavjud holatlar: ${HOLATLAR.join(", ")}.`);
      }
      const hammasi = JSON.parse(await readFile(new URL("./buyurtmalar.json", import.meta.url), "utf8"));
      const topildi = hammasi
        .filter((b) => !mijoz || b.mijoz.toLowerCase().includes(mijoz.toLowerCase()))
        .filter((b) => !holat || b.holat === holat)
        .sort((a, b) => b.sana.localeCompare(a.sana));
      if (!topildi.length) {
        return matn(`Hech narsa topilmadi. Mijoz nomini qisqaroq yozib ko'ring yoki holat filtrini olib tashlang.`);
      }
      const qismi = topildi.slice(0, limit);
      const qator = (b) =>
        format === "detailed"
          ? `${b.sana} · ${b.mijoz} · ${b.holat} · ${som(jami(b))}\n` +
            b.mahsulotlar.map((m) => `   - ${m.nom} × ${m.soni} = ${som(m.narx * m.soni)}`).join("\n")
          : `${b.sana} · ${b.mijoz} · ${b.holat} · ${som(jami(b))}`;
      const qolgan = topildi.length - qismi.length;
      return matn(
        `${topildi.length} ta buyurtma topildi, ${qismi.length} tasi ko'rsatilmoqda:\n` +
          qismi.map(qator).join("\n") +
          (qolgan > 0 ? `\n… yana ${qolgan} ta. Ko'proq kerak bo'lsa limit'ni oshiring yoki filtrni toraytiring.` : ""),
      );
    },
  );

  return server;
}

serveStdio(createServer, {
  onerror: (error) => console.error("Buyurtmalar MCP server xatosi:", error),
});
console.error("Buyurtmalar MCP server stdio'da ishlayapti");
```

AE tamoyillari kodda qayerda:

| Tamoyil | Koddagi joy |
| --- | --- |
| Ko'p tool emas, bitta yaxshi tool | Bitta `buyurtma_qidirish` — mijoz va holat bo'yicha filtr bilan, har biri uchun alohida tool emas |
| Nomlar maydoni | `buyurtma_` prefiksi |
| Mazmunli kontekst | Javobda UUID yo'q, mijoz nomi, holat va hisoblangan summa bor |
| `concise` / `detailed` | `format` parametri |
| Sahifalash va standart qiymat | `limit` (standart 10, ko'pi 50) va "… yana N ta" eslatmasi |
| Yo'l ko'rsatuvchi xato | Noma'lum holatda mavjud holatlar ro'yxati; bo'sh natijada nima qilish maslahati |
| Aniq tavsif | Holatlar ro'yxati parametr tavsifida, qachon qaysi `format` — tool tavsifida |
| stdio qoidasi | Faqat `console.error` |

### 1. Inspector bilan tekshirish

```bash
npx @modelcontextprotocol/inspector --cli node server.js --protocol-era modern --method tools/list
```

Chiqishdan (qisqartirilgan):

```json
{
  "tools": [
    {
      "name": "buyurtma_qidirish",
      "description": "Do'kon buyurtmalarini mijoz nomi va/yoki holati bo'yicha qidiradi. ...",
      "inputSchema": {
        "type": "object",
        "properties": {
          "mijoz": { "description": "Mijoz ismi yoki uning bir qismi, masalan 'Aziza'", "type": "string" },
          "holat": { "description": "Buyurtma holati: yangi, yolda, yetkazildi, bekor", "type": "string" },
          "limit": { "default": 10, "description": "Nechta natija qaytarish (standart 10)", "type": "integer", "minimum": 1, "maximum": 50 },
          "format": { "default": "concise", "type": "string", "enum": ["concise", "detailed"], "...": "..." }
        }
      }
    }
  ]
}
```

`zod` sxemasi model ko'radigan JSON Schema'ga aylandi: tavsiflar, chegaralar, standart qiymatlar va `enum`.

Xato xabarini ham Inspector bilan to'g'ridan-to'g'ri chaqiramiz:

```bash
npx @modelcontextprotocol/inspector --cli node server.js --protocol-era modern \
  --method tools/call --tool-name buyurtma_qidirish --tool-arg holat=jonatilgan
```

```text
"text": "Noma'lum holat: \"jonatilgan\". Mavjud holatlar: yangi, yolda, yetkazildi, bekor."
```

### 2. Claude Code'ga ulash

CC (MCP) — lokal stdio server uchun `--` dan keyin ishga tushirish buyrug'i yoziladi:

```bash
claude mcp add buyurtmalar -- node server.js
claude mcp list
```

```text
Added stdio MCP server buyurtmalar with command: node server.js to local config
buyurtmalar: node server.js - ✔ Connected
```

### 3. Agent serverni qanday ishlatdi

Savol ataylab tool'dagi so'zlar bilan emas, oddiy tilda berildi (Claude Code 2.1.325):

```text
Aziza'ning jo'natilgan, lekin hali yetib bormagan buyurtmalari bormi? Har birining summasi va jami qancha?
```

Agentning tool chaqiruvlari:

```text
TOOL: mcp__buyurtmalar__buyurtma_qidirish {"mijoz": "Aziza", "holat": "yolda", "limit": 50}
RES:  Hech narsa topilmadi. Mijoz nomini qisqaroq yozib ko'ring yoki holat filtrini olib tashlang.
TOOL: mcp__buyurtmalar__buyurtma_qidirish {"mijoz": "Aziza", "limit": 50}
RES:  9 ta buyurtma topildi, 9 tasi ko'rsatilmoqda:
      2026-11-15 · Aziza Karimova · yetkazildi · 105 000 so'm
      2026-11-14 · Aziza Karimova · yangi · 445 000 so'm
      ...
```

Ikki narsa ko'rindi:

1. "Jo'natilgan, lekin yetib bormagan" degan iborani agent tavsifdagi holatlar ro'yxatidan **`yolda`** ga moslab oldi. Holatlar
   ro'yxatini parametr tavsifiga yozish aynan shu uchun kerak edi.
2. Bo'sh natijada server "holat filtrini olib tashlang" dedi. Agent keyingi chaqiruvda filtrni olib tashlab, umumiy rasmni oldi.
   Bu AE aytgan "xato va bo'sh natija agentni samarali yo'lga yo'naltirsin" tamoyili.

Agentning javobi:

```text
Yo'q, Aziza Karimovaning hozir yo'lda turgan buyurtmasi yo'q, shuning uchun jami summa 0 so'm.

| Holat | Soni | Summalar | Jami |
|---|---|---|---|
| yetkazildi | 2 | 105 000, 285 000 | 390 000 so'm |
| yangi | 3 | 445 000, 651 000, 144 000 | 1 240 000 so'm |
| bekor | 4 | 376 000, 90 000, 425 000, 158 000 | 1 049 000 so'm |

"Yangi" holatidagi 3 ta buyurtma hali jo'natilmagan. Ularning jami summasi 1 240 000 so'm. Eng eskisi 3-noyabrdan beri shu holatda turibdi.
```

Raqamlarni JSON'ning o'zidan hisoblab tekshirdik: 9 ta buyurtma, `{ yangi: 1240000, yetkazildi: 390000, bekor: 1049000 }` — aynan
mos.

### 4. Baholash

AE (Writing effective tools) bo'yicha keyingi qadam — **baholash**: haqiqiy savollar to'plami (masalan, "qaysi mijozning bekor
qilingan buyurtmalari ko'p?", "kecha nechta buyurtma yetkazildi?"), har birining tekshiriladigan to'g'ri javobi bilan. Ularni agentga
dasturiy ravishda berib, transkriptlarni ko'rasiz: agent qayerda adashdi, qaysi tavsif tushunarsiz, qaysi javob juda uzun. Keyin
tool'ni yaxshilaysiz. Yuqoridagi tajriba — shunday baholashning bitta savoli.

## Variantlar

| Usul | Yutug'i | Kamchiligi | Qachon |
| --- | --- | --- | --- |
| Tayyor server (27-bob) | Yozish shart emas | Hamma tizim uchun bor emas | Mashhur xizmatlar |
| CLI + skill | Server yozish shart emas; kontekstda tool ro'yxati yo'q | CLI bo'lishi kerak | Tizimning CLI'si bor |
| O'z stdio serveri | Lokal, tez, oddiy | Har dasturchi o'z kompyuterida ishga tushiradi | Lokal ma'lumot, shaxsiy vosita |
| O'z HTTP serveri | Bitta server, ko'p klient; OAuth bilan autentifikatsiya | Joylash va xavfsizlik kerak | Jamoa yoki tashkilot uchun umumiy tizim |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Har API endpoint'i uchun bitta tool | AE: ko'proq tool har doim yaxshi emas; kontekst ham oladi | Jarayonlar uchun kam, lekin o'ylangan tool'lar |
| stdio serverda `console.log` | MCP: stdout'ni buzadi, server ishlamaydi | `console.error` |
| Javobda UUID va texnik maydonlar | AE: agentga past darajadagi identifikatorlar kerak emas | Nomlar va mazmunli maydonlar |
| Chegarasiz javob | 27-bobda 80 KB natija faylga saqlandi; kontekst to'ladi | `limit`, filtr, `concise` rejim |
| "Error 400" kabi xato | AE: agent nimani tuzatishni bilmaydi | Nima noto'g'ri va qanday tuzatish kerakligini yozing |
| Noaniq parametr nomi (`q`, `user`) | AE: model noto'g'ri qiymat beradi | `mijoz`, `user_id` kabi aniq nom va tavsif |
| Faqat "ishlayapti" deb sinash | AE: tool'ni haqiqiy vazifalar bilan baholash kerak | Bir nechta haqiqiy savol va tekshiriladigan javoblar |

## Amaliyot

1. MCP serveri qanday uch imkoniyat bera oladi?
2. Nega stdio serverda `console.log` ishlatib bo'lmaydi?
3. AE bo'yicha "API'ni shunchaki o'rash" nima uchun yomon?
4. Tool javobida UUID o'rniga nima qaytarish kerak va nega?
5. Tajribada agent "jo'natilgan, lekin yetib bormagan" iborasini qanday tushundi va bunga nima yordam berdi?
6. Bo'sh natijadagi xabar agentning keyingi qadamiga qanday ta'sir qildi?

<details>
<summary>Javoblar</summary>

1. Resources (o'qiladigan ma'lumot), tools (LLM chaqiradigan funksiyalar), prompts (tayyor shablonlar).
2. `console.log` stdout'ga yozadi, stdio transportida esa stdout JSON-RPC xabarlari uchun. Ortiqcha matn xabarlarni buzadi. `console.error` (stderr) ishlatiladi.
3. Ko'p tool kontekstni egallaydi va modelni chalg'itadi; agent ko'p qadamli ishni o'zi bo'laklab bajarishga majbur bo'ladi. Kam, lekin jarayonlarni birlashtirgan tool yaxshiroq.
4. Mijoz nomi, holat, hisoblangan summa kabi mazmunli maydonlar. AE: past darajadagi identifikatorlar agentga foyda bermaydi va token sarflaydi.
5. `yolda` holati deb tushundi. Holatlar ro'yxati (`yangi, yolda, yetkazildi, bekor`) parametr tavsifida yozilgan edi.
6. Server "holat filtrini olib tashlang" dedi; agent keyingi chaqiruvda filtrsiz qidirib, umumiy rasmni oldi va to'liq javob berdi.

</details>

## Rasmiy hujjat

- [MCP: Build an MCP server](https://modelcontextprotocol.io/docs/2026-07-28/develop/build-server)
- [MCP: Architecture overview — Primitives](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture)
- [AE: Writing effective tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents)
- [AE: Building effective agents — Appendix 2](https://www.anthropic.com/research/building-effective-agents)
- [CC: Connect Claude Code to tools via MCP](https://code.claude.com/docs/en/mcp)
