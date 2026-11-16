# 26 — Hook'lar: istisnosiz qoidalar

[Mundarija](README.md)

## Tushuncha

3-bobda ko'rsatmalar ikki turga bo'lingan edi: **model qaror qiladi** (so'rov, CLAUDE.md, skill) va **harness majburlaydi** (hook,
taqiq qoidasi). Hook — ikkinchi turning asosiy vositasi.

CC (Best practices) qoidani shunday aytadi: biror narsa **har safar** bo'lishi kerak bo'lsa, uni hook, taqiq qoidasi yoki
boshqariladigan sozlama qiling. CLAUDE.md esa yo'riqnomalar uchun, va Claude yo'riqnoma bu holatga mos emas deb hal qilishi mumkin.

Hujjatdagi misol — CLAUDE.md'dagi uchta qator:

- "`.env` ni hech qachon o'qima";
- "tahrirdan keyin doim formatlagichni ishga tushir";
- "`migrations` papkasiga tegma".

Claude ularga deyarli har doim amal qiladi. "Deyarli" yetmaydigan holatlar uchun bularni CLAUDE.md'dan chiqarib, Claude Code o'zi
qo'llaydigan konfiguratsiyaga o'tkazing. Shundan keyin natija modelning nimani eslashi yoki nima qaror qilishiga bog'liq bo'lmaydi.

### Hook nima

CC (Automate actions with hooks): hook'lar Claude'ning sikli ichidagi aniq nuqtalarda sizning narsangizni ishga tushiradi:

- tool chaqiruvidan oldin yoki keyin;
- Claude to'xtamoqchi bo'lganda;
- sessiya boshlanganda va hokazo.

Ishga tushadigan narsa beshta turda bo'ladi:

| Tur | Nima | Deterministikmi |
| --- | --- | --- |
| `command` | Shell buyrug'i (odatiy holat) | Ha |
| `http` | URL'ga POST so'rov | Ha |
| `mcp_tool` | MCP serveringizdagi tool chaqiruvi | Ha |
| `prompt` | Bitta navbatli LLM baholashi | Yo'q — boshqa model hal qiladi |
| `agent` | Tool'lari bor ko'p navbatli tekshiruv (tajribaviy) | Yo'q |

CC (Best practices) aniqlik kiritadi: `prompt` va `agent` hook'lari **boshqa modeldan** qaror so'raydi, shuning uchun ular ham
deterministik emas. Haqiqiy majburlash uchun `command` yoki `http` ishlating. Hook'ning o'zi qulasa yoki vaqti tugasa ham harakat
to'xtatilishi kerak bo'lsa, `onFailure: "block"` qo'shing. Masalan, commit'lardagi sirlarni skanerlaydigan hook uchun skaner
ishlamay qolganda commit'ni tekshirilmagan holda o'tkazib yuborishdan ko'ra bloklash yaxshiroq.

### Asosiy hodisalar

CC (hooks guide) 30 dan ortiq hodisani sanaydi. Kundalik ishda eng ko'p kerak bo'ladiganlari:

| Hodisa | Qachon | Odatiy ishlatilishi |
| --- | --- | --- |
| `PreToolUse` | Tool chaqiruvidan **oldin**; uni bloklay oladi | Himoyalangan fayllar, xavfli buyruqlar |
| `PostToolUse` | Tool chaqiruvi muvaffaqiyatli tugagach | Formatlash, lint |
| `Stop` | Claude javobini tugatganda | "Tayyor"ni tekshirish (8-bob) |
| `SessionStart` | Sessiya boshlanganda yoki davom ettirilganda | Kontekst qo'shish, qisqartirishdan keyin qayta kiritish |
| `UserPromptSubmit` | So'rov yuborilganda, Claude ishlov berishidan oldin | So'rovni tekshirish yoki boyitish |
| `Notification` | Claude Code bildirishnoma yuborganda | Claude sizni kutayotganda ogohlantirish |
| `PreCompact`, `PostCompact` | Kontekst qisqartirishdan oldin va keyin | Muhim narsani saqlash |
| `SessionEnd` | Sessiya tugaganda | Tozalash, log |

### Qanday ishlaydi

- Hodisa ro'y berganda Claude Code mos hook'larni **parallel** ishga tushiradi.
- `matcher` qaysi tool'lar uchun ishlashini cheklaydi: `"Edit|Write"`.
- Hook kirishni stdin orqali JSON ko'rinishida oladi (masalan, `tool_input.file_path`).
- **Chiqish kodi 2** — bloklash. stderr'ga yozilgan matn Claude'ga sabab bo'lib qaytadi.
- Hook'lar bir nechta manbadan (foydalanuvchi, loyiha, plagin) kelsa, **hammasi** ishlaydi (24-bob).

CC'dagi cheklovlar:

| Cheklov | Ma'nosi |
| --- | --- |
| Command hook faqat stdout, stderr va chiqish kodi bilan muloqot qiladi | `/` buyruqlarini yoki tool chaqiruvlarini ishga tushira olmaydi |
| `PostToolUse` harakatni bekor qila olmaydi | Tool allaqachon bajarilgan; bloklash kerak bo'lsa — `PreToolUse` |
| `Stop` har javob tugaganda ishlaydi | Faqat vazifa tugaganda emas; foydalanuvchi to'xtatganda ishlamaydi |
| Vaqt chegaralari | `command`/`http`: 10 daqiqa (ba'zi hodisalarda kamroq), `prompt`: 30 soniya, `agent`: 60 soniya |

Hook'larni o'zingiz yozishingiz shart emas. CC (Best practices): `write a hook that blocks edits to the migrations folder` deb so'rash
ishlaydi, natijani esa `/hooks` ko'rsatadi.

### Formatlagich misoli

CC (Best practices) — har `Edit` yoki `Write` dan keyin Prettier:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "f=$(jq -r '.tool_input.file_path') && npx prettier --write --ignore-unknown \"$f\"" }
        ]
      }
    ]
  }
}
```

Hujjat bo'yicha endi Claude bu qoidani eslab qoladimi-yo'qmi muhim emas, chunki uni Claude ishga tushirmaydi.

## Amalda: `.env` ni himoyalash

CC (hooks guide) misoli aynan shu ko'rinishda sinov repo'siga qo'shildi. Skript — `.claude/hooks/protect-files.sh`:

```bash
#!/bin/bash
# protect-files.sh

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Normalize Windows backslash separators so the patterns below match
FILE_PATH="${FILE_PATH//\\//}"

PROTECTED_PATTERNS=(".env" "package-lock.json" ".git/")

for pattern in "${PROTECTED_PATTERNS[@]}"; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    echo "Blocked: $FILE_PATH matches protected pattern '$pattern'" >&2
    exit 2
  fi
done

exit 0
```

Skript bajariladigan qilinadi (`chmod +x`) va `.claude/settings.json` ga qo'shiladi:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/protect-files.sh"
          }
        ]
      }
    ]
  }
}
```

So'rov (Claude Code 2.1.325, `acceptEdits` — tahrirlar odatda ruxsatsiz o'tadigan rejim):

```text
.env fayliga DEBUG=1 qatorini qo'sh.
```

Sessiya:

1. `[Read] .env` — agent faylni o'qidi.
2. `[Edit] .env` — tahrirga urindi.
3. Hook ishladi, chiqish kodi 2, agentga qaytgan xabar:

```text
PreToolUse:Edit hook error: ["$CLAUDE_PROJECT_DIR"/.claude/hooks/protect-files.sh]: Blocked: …/v17/.env matches protected pattern '.env'
```

Agentning javobi:

```text
`DEBUG=1` qatorini `.env` fayliga qo'sha olmadim, fayl o'zgarmadi. Loyihadagi `.claude/hooks/protect-files.sh` hooki `.env`
faylini himoyalangan deb hisoblab, tahrirni bloklab qo'ydi. Bu himoyani boshqa yo'l bilan, masalan shell orqali, aylanib o'tmadim.
```

`cat .env` — fayl o'zgarmagan. `acceptEdits` rejimi tahrirlarni so'ramasdan o'tkazadi, lekin hook baribir blokladi: hook ruxsat
rejimidan qat'i nazar ishlaydi.

### Hook nimani qamrab olmaydi

Agent shell orqali aylanib o'tmadi. Lekin bu **modelning tanlovi**, hook'ning kafolati emas. CC (hooks guide) aniq ogohlantiradi:

- Claude himoyalangan fayllarni **shell buyruqlari** bilan baribir o'zgartira oladi (`echo "DEBUG=1" >> .env` — `Edit` emas, `Bash`).
  Bunday buyruqlarning bir qismini bloklash uchun `permissions.deny` ga har yo'l uchun `Edit` taqiq qoidasi qo'shing, masalan
  `Edit(/.env)`.
- Bu qoidalar bilan ham Claude `.env` ni boshqa yo'llar bilan o'zgartirishi mumkin. Buyruqlar qaysi fayllarga yoza olishini
  cheklash uchun **sandbox** kerak (36-bob).

Himoya qatlamlari: hook (tool darajasi) → taqiq qoidasi (ruxsat darajasi, 35-bob) → sandbox (operatsion tizim darajasi, 36-bob).

## Qachon hook kerak emas

CC (Best practices) ogohlantiradi: hook — **nol istisnoli** qoida uchun. "Nomlangan eksportlarni afzal ko'r" qoidasining
istisnolari ko'p, shuning uchun u CLAUDE.md'da qoladi. 3-bobdagi teskari qoida ham shu yerda: shunchaki didga oid narsa uchun hook
bo'lsa, uni o'chirib, qarorni Claude'ga qoldiring.

## Variantlar

| Qoida turi | Joy | Nega |
| --- | --- | --- |
| "Odatda shunday qil" | CLAUDE.md | Claude vaziyatga qarab hal qiladi |
| "Tahrirdan keyin har safar X" | `PostToolUse` hook | Claude eslab qolishiga bog'liq emas |
| "Bu faylga hech qachon tegma" | `PreToolUse` hook + `Edit` taqiq qoidasi | Tool va ruxsat darajasida |
| "Bu buyruqni hech qachon ishga tushirma" | Taqiq qoidasi (35-bob) | Ruxsat darajasida |
| "Bu faylga hech qanday jarayon yozmasin" | Sandbox (36-bob) | Operatsion tizim darajasida |
| "Tayyor degani testlar o'tgani" | `Stop` hook (8-bob) | Navbat tekshiruvsiz tugamaydi |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| "`.env` ni tahrirlama" ni faqat CLAUDE.md'ga yozish | CC: iltimos, kafolat emas | `PreToolUse` hook |
| `PostToolUse` bilan bloklashga urinish | CC: tool allaqachon bajarilgan | `PreToolUse` |
| Hook xabarini stdout'ga yozish | Bloklashda Claude'ga stderr qaytadi | `>&2` va `exit 2` |
| Hook skriptini bajariladigan qilmaslik | CC: macOS va Linux'da `chmod +x` shart | `chmod +x .claude/hooks/*.sh` |
| `prompt` hook'ni majburlash deb hisoblash | CC: boshqa model hal qiladi, deterministik emas | `command` yoki `http` |
| Hook bor — demak fayl to'liq himoyalangan | CC: shell buyruqlari `Edit` hook'idan o'tib ketishi mumkin | Taqiq qoidasi va sandbox ham |
| Didga oid qoidaga hook | CC: hook — nol istisnoli qoida uchun | CLAUDE.md |

## Amaliyot

1. CC bo'yicha qaysi qoidalarni CLAUDE.md'dan hook'ga o'tkazish kerak?
2. Hook'larning qaysi turlari deterministik va qaysilari emas?
3. `PreToolUse` va `PostToolUse` farqi nima?
4. Hook skriptida chiqish kodi 2 va stderr nima vazifani bajaradi?
5. Tajribada `.env` qanday himoyalandi va agent nima dedi?
6. `.env` ni to'liq himoyalash uchun hook'dan tashqari yana nima kerak?

<details>
<summary>Javoblar</summary>

1. Har safar bo'lishi kerak bo'lgan, istisnosiz qoidalarni: "deyarli har doim" yetmaydigan holatlar.
2. Deterministik: `command`, `http`, `mcp_tool`. Deterministik emas: `prompt` va `agent` (boshqa model qaror qiladi).
3. `PreToolUse` tool chaqiruvidan oldin ishlaydi va uni bloklay oladi. `PostToolUse` tool muvaffaqiyatli bajarilgandan keyin ishlaydi va harakatni bekor qila olmaydi.
4. Chiqish kodi 2 harakatni bloklaydi; stderr'dagi matn Claude'ga bloklash sababi bo'lib qaytadi.
5. `PreToolUse` hook `.env` dagi `Edit` ni chiqish kodi 2 bilan blokladi, "Blocked: …" xabari agentga qaytdi. Agent fayl o'zgarmaganini va himoyani shell orqali aylanib o'tmaganini aytdi.
6. `Edit(/.env)` kabi taqiq qoidalari (shell buyruqlarining bir qismini yopadi) va buyruqlar qaysi fayllarga yoza olishini cheklaydigan sandbox.

</details>

## Rasmiy hujjat

- [CC: Automate actions with hooks](https://code.claude.com/docs/en/hooks-guide)
- [CC: Hooks reference](https://code.claude.com/docs/en/hooks)
- [CC: Best practices — Enforce the rules that can't have exceptions](https://code.claude.com/docs/en/best-practices#enforce-the-rules-that-cant-have-exceptions)
- [CC: Extend Claude Code — Hook vs Skill](https://code.claude.com/docs/en/features-overview#compare-similar-features)
