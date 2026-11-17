# 61 — Buyruqlar va sozlamalar

[Mundarija](README.md)

> Ma'lumotnoma: qo'llanmada ishlatilgan eng kerakli buyruqlar, bayroqlar, tugmalar va sozlama kalitlari — har biri batafsil yozilgan
> bobga havola bilan. Hammasi Claude Code 2.1.325 hujjatidan tekshirilgan. To'liq ro'yxatlar — bob oxiridagi rasmiy sahifalarda.

## Sessiya ichidagi buyruqlar

| Buyruq | Nima qiladi | Bob |
| --- | --- | --- |
| `/init` | Kod bazasidan boshlang'ich CLAUDE.md yaratadi | 5, 13 |
| `/memory` | CLAUDE.md va xotira fayllarini ko'rish, tahrirlash | 13, 14 |
| `/clear` | Yangi suhbat — kontekst tozalanadi | 9, 15, 41 |
| `/compact [ko'rsatma]` | Suhbatni xulosaga almashtiradi | 15, 41 |
| `/context` | Kontekst nimalar bilan to'lganini ko'rsatadi | 12, 41 |
| `/rewind` | Kod, suhbat yoki ikkalasini oldingi so'rovga qaytaradi | 9 |
| `/resume`, `/rename <nom>` | Oldingi sessiyaga qaytish, sessiyani nomlash | 15, 45 |
| `/fork` | Sessiyadan nusxa olish | — |
| `/btw` | Tez savol — tarixga qo'shilmaydi | 45 |
| `/model`, `/effort` | Model va fikrlash darajasi | 40 |
| `/usage` | Token, taxminiy narx, kesh, reja limitlari | 41 |
| `/insights` | Ish uslubingiz haqida hisobot | 42 |
| `/permissions` | Ruxsat qoidalari va ularning manbasi | 35 |
| `/sandbox` | Sandbox holati va sozlamasi | 36 |
| `/hooks` | Hook'larni ko'rish | 26 |
| `/mcp` | MCP serverlar, ulash va o'chirish | 27 |
| `/plugin` | Plaginlar va marketplace'lar | 29 |
| `/agents` | Subagentlar | 30 |
| `/output-style` | Chiqish uslubi (Explanatory, Learning va b.) | 43 |
| `/code-review` | Diff'ni to'g'rilik bo'yicha review | 22, 50 |
| `/security-review` | Branch diff'ini xavfsizlik bo'yicha review | 39, 50 |
| `/loop`, `/goal` | Takroriy vazifa; maqsadga yetguncha ishlash | 34 |
| `/config`, `/status`, `/doctor`, `/help` | Sozlamalar menyusi, holat, tashxis, yordam | 5 |

## So'rov qatori belgilari va tugmalar

| Tugma / belgi | Nima qiladi | Bob |
| --- | --- | --- |
| `/` boshida | Buyruq yoki skill | 25 |
| `@` | Fayl yo'lini kontekstga qo'shish (avtoto'ldirish) | 10 |
| `!` boshida | Shell rejimi: buyruqni o'zingiz bajarasiz, chiqishi sessiyaga qo'shiladi | 5 |
| `Shift+Tab` | Ruxsat rejimlari orasida aylanish (Manual → accept edits → plan → …) | 7, 35 |
| `Esc` | Agentni harakat o'rtasida to'xtatish, ish saqlanadi | 9, 45 |
| `Esc` `Esc` (bo'sh qatorda) | Rewind menyusi | 9 |
| `Ctrl+O` | Batafsil ko'rinish: tool chaqiruvlari, fikrlash | — |
| `Ctrl+B` | Bash buyrug'ini yoki agentni fonga o'tkazish | — |
| `Ctrl+R` | Oldingi so'rovlar bo'yicha qidirish | — |
| `Ctrl+G` | So'rovni matn muharririda yozish | — |
| `Option+P` / `Alt+P` | Modelni almashtirish | 40 |
| `Ctrl+C` | To'xtatish; bo'sh qatorda ikki marta — chiqish | — |

## Buyruq qatori (CLI)

| Buyruq yoki bayroq | Nima qiladi | Bob |
| --- | --- | --- |
| `claude` | Interaktiv sessiya | 5 |
| `claude -p "…"` (`--print`) | Kuzatuvsiz rejim: bitta so'rov, javob, chiqish | 33 |
| `-c` (`--continue`), `-r` (`--resume`) | Oxirgi sessiyani yoki tanlangan sessiyani davom ettirish | 9 |
| `--model`, `--effort` | Model va fikrlash darajasi shu sessiya uchun | 40 |
| `--permission-mode <rejim>` | `default`, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions` | 35, 48 |
| `--allowedTools`, `--disallowedTools` | Tool'larni so'ramasdan ruxsat berish yoki bloklash | 33, 35 |
| `--output-format text\|json\|stream-json` | `-p` natijasi formati (`stream-json` bilan `--verbose`) | 33 |
| `--max-turns`, `--max-budget-usd` | Navbat va sarf chegarasi | 33, 34 |
| `--no-session-persistence` | Sessiyani diskka saqlamaslik | 33, 38 |
| `--bare` | Hook, skill, plagin, MCP, CLAUDE.md yuklanmaydi (CI uchun) | 33, 37 |
| `--settings`, `--setting-sources` | Qo'shimcha sozlama; qaysi sozlama fayllari yuklanishi | 3, 36 |
| `--add-dir <papka>` | Qo'shimcha ishchi papka | 13 |
| `-w` (`--worktree`) | Alohida git worktree'da ishlash | 31 |
| `--append-system-prompt` | Tizim ko'rsatmasiga qo'shimcha | — |
| `--include-hook-events` | `stream-json` oqimida hook hodisalari | 8, 39 |
| `claude mcp add`, `claude plugin install` | MCP server qo'shish, plagin o'rnatish | 27, 29 |
| `claude purge <yo'l>` | Loyihaning lokal transkriptlari va holatini o'chirish | 38 |
| `claude setup-token` | Obuna uchun uzoq muddatli token (CI uchun) | 51 |

## Sozlama kalitlari

Fayllar: `~/.claude/settings.json` (foydalanuvchi), `.claude/settings.json` (jamoa, git'da), `.claude/settings.local.json` (shaxsiy),
managed (tashkilot). Ustunlik va ro'yxatlar birlashishi — 44-bob.

| Kalit | Nima uchun | Bob |
| --- | --- | --- |
| `permissions.allow` / `ask` / `deny` | Tool ruxsat qoidalari (deny → ask → allow) | 35 |
| `permissions.defaultMode` | Standart ruxsat rejimi | 35 |
| `sandbox.enabled`, `sandbox.filesystem.*`, `sandbox.network.*` | Bash buyruqlarini OS darajasida izolyatsiya | 36 |
| `sandbox.credentials` | Kirish ma'lumotlarini sandbox buyruqlaridan yashirish | 38 |
| `hooks` | Hayot siklidagi avtomatik amallar | 26 |
| `enabledPlugins` | Loyiha yoki jamoa plaginlari | 29, 39 |
| `model`, `availableModels`, `modelSettings`, `effortLevel` | Model va effort | 40 |
| `outputStyle` | Chiqish uslubi | 43 |
| `attribution` | Commit va PR atributsiyasi (`false` — yashirish) | 50 |
| `cleanupPeriodDays` | Lokal transkriptlar saqlanadigan kunlar | 38 |
| `promptCacheTtl` | Asosiy suhbat keshining muddati (`5m`/`1h`) | 41 |
| `env` | Sessiya uchun muhit o'zgaruvchilari | — |

## Muhim muhit o'zgaruvchilari

| O'zgaruvchi | Nima uchun | Bob |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | API kalit (obuna o'rniga ishlatiladi) | 5, 47 |
| `ANTHROPIC_BASE_URL` | So'rovlar yuboriladigan manzil (gateway, lokal server) | 55 |
| `CLAUDE_CODE_EFFORT_LEVEL` | Effort'ni majburlash | 40 |
| `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB` | Bola jarayonlar muhitidan sirlarni olib tashlash | 38 |
| `CLAUDE_CODE_SKIP_PROMPT_HISTORY` | Transkript va tarixni yozmaslik | 38 |
| `CLAUDE_CODE_ENABLE_TELEMETRY` + `OTEL_*` | OpenTelemetry eksporti | 42 |
| `DISABLE_TELEMETRY`, `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` | Anthropic telemetriyasini o'chirish | 38 |

## Amaliyot

1. Sessiyani to'liq tozalash va faqat xulosaga almashtirish buyruqlari qaysilar?
2. Kuzatuvsiz skriptda sessiyani saqlamaslik va sarfni cheklash uchun qaysi bayroqlar ishlatiladi?
3. Jamoaning `git push` taqiqi qaysi faylda va qaysi kalitda yoziladi?
4. Commit atributsiyasini qanday yashirasiz?

<details>
<summary>Javoblar</summary>

1. `/clear` — yangi suhbat; `/compact` — tarixni xulosaga almashtiradi.
2. `--no-session-persistence`, `--max-budget-usd` (va `--max-turns`).
3. `.claude/settings.json` da `permissions.deny: ["Bash(git push *)"]`.
4. Sozlamada `"attribution": false`.

</details>

## Rasmiy hujjat

- [CC: Commands](https://code.claude.com/docs/en/commands)
- [CC: CLI reference](https://code.claude.com/docs/en/cli-reference)
- [CC: Interactive mode — keyboard shortcuts](https://code.claude.com/docs/en/interactive-mode)
- [CC: Settings](https://code.claude.com/docs/en/settings) · [CC: Settings reference](https://code.claude.com/docs/en/settings-reference)
- [CC: Environment variables](https://code.claude.com/docs/en/env-vars)
