# 62 — Muammolar va yechimlar

[Mundarija](README.md)

> Ma'lumotnoma: keng tarqalgan muammolar, xato xabarlari va ularning ma'nosi. Xato matnlari rasmiy "Error reference" va "Troubleshooting"
> sahifalaridan (Claude Code 2.1.325) aynan olingan. Ro'yxatda yo'q xato uchun — bob oxiridagi to'liq ma'lumotnoma.

## Avval tashxis

| Buyruq | Nima ko'rsatadi |
| --- | --- |
| `claude doctor` / `/doctor` | O'rnatish, versiya, sozlamalar holati |
| `/status` | Joriy hisob, kirish usuli (obuna yoki API kalit), model |
| `/context` | Kontekst nimalar bilan to'lgan |
| `/permissions` | Qaysi ruxsat qoidasi qaysi fayldan |
| `claude --safe-mode` | Barcha moslashtirishlarsiz (plagin, MCP, hook) ishga tushirish — muammo ulardanmi, tekshirish |
| `claude --debug-file <yo'l>` | Batafsil log faylga |

## O'rnatish va kirish

| Belgi | Ma'nosi | Nima qilish |
| --- | --- | --- |
| `zsh: command not found: claude` (macOS), `bash: claude: command not found` (Linux) | O'rnatish tugagan, lekin `claude` PATH'da yo'q | Hujjatdagi "Verify your PATH" qadamlari (`~/.local/bin` ni PATH'ga qo'shish) |
| `zsh: permission denied: …/.zshrc` | PATH'ni yozish uchun `~/.zshrc` ga yozish huquqi yo'q | Egasini `ls -l ~/.zshrc` bilan tekshirish; o'zingizniki bo'lsa `chmod u+w ~/.zshrc` |
| `Not logged in · Please run /login` | Sessiya uchun yaroqli kirish ma'lumoti yo'q | `/login` |
| `Invalid API key` | API kalit noto'g'ri yoki bekor qilingan | Kalitni tekshirish; obunadan foydalanmoqchi bo'lsangiz `unset ANTHROPIC_API_KEY` |
| Obuna o'rniga API kalitdan hisob ketyapti | `ANTHROPIC_API_KEY` o'rnatilgan bo'lsa, u obunadan ustun (`-p` da doim) | `/status` bilan tekshirish, kerak bo'lmasa `unset ANTHROPIC_API_KEY` (5-bob) |

## Limitlar va server

| Xabar | Ma'nosi | Nima qilish |
| --- | --- | --- |
| `You've hit your session limit · resets 3:45pm` / `You've hit your weekly limit · …` | Obunaning aylanma limiti tugadi; sessiya va haftalik limitlar barcha modellar uchun umumiy — model almashtirish yordam bermaydi | Ko'rsatilgan vaqtni kutish; `/usage` dagi tavsiyalar (41-bob) |
| `You've hit your Opus limit` / `… Sonnet limit` | Faqat shu model oilasining limiti | Boshqa oiladagi modelga o'tish mumkin |
| `API Error: Repeated 529 Overloaded errors. …` | API vaqtincha hamma uchun band; Claude Code allaqachon bir necha marta qayta urinib ko'rgan. **Sizning limitingiz emas** | status.claude.com ni tekshirish, birozdan keyin qayta urinish |
| `API Error: Request rejected (429) · …` | API kalit yoki bulut loyihasining tezlik chegarasi | `/status` — kutilgan kirish ma'lumoti ishlatilyaptimi; tasodifiy `ANTHROPIC_API_KEY` past darajali kalit orqali yuborishi mumkin |
| `API Error: 500 Internal server error` | Server xatosi | Qayta urinish, status sahifasi |
| `Request timed out` | Server yoki tarmoq | Xabarda internet tilga olinsa — tarmoq |

## Kontekst va sessiya

| Belgi | Ma'nosi | Nima qilish | Bob |
| --- | --- | --- | --- |
| `Prompt is too long` (interaktivda: `Context limit reached · /compact or /clear to continue`) | Suhbat va biriktirilgan fayllar model kontekst oynasidan katta | `/compact` yoki `/clear`; katta faylni bo'lib o'qitish | 12, 15 |
| `Autocompact is thrashing: the context refilled to the limit...` | Kompaktlash muvaffaqiyatli, lekin katta fayl yoki tool chiqishi kontekstni darhol qayta to'ldirdi | Faylni bo'laklab o'qitish; `/compact keep only the plan and the diff`; katta ishni subagentga; `/clear` | 15, 30 |
| Javoblar odatdagidan zaifroq tuyuladi, xato yo'q | Odatda suhbat holati, model emas. Claude Code model versiyasini jimgina o'zgartirmaydi (fallback holatlarida transkriptda xabar bo'ladi) | `/model` va `/effort` ni tekshirish; uzun yoki chalkash suhbatda `/clear` va yaxshiroq so'rov | 40, 45 |
| Buyruq osilib qoldi | — | `Ctrl+C`; javob bermasa terminalni yopib, o'sha papkada `claude --resume` — suhbat yo'qolmaydi | 9 |

## Ishlash tezligi

| Belgi | Nima qilish (CC Troubleshooting) |
| --- | --- |
| Yuqori CPU yoki xotira | `/compact`; katta vazifalar orasida qayta ishga tushirish; katta build papkalarini `.gitignore` ga; `claude --safe-mode` bilan plagin/MCP/hook sababchimi tekshirish |
| "critical memory usage" ogohlantirishi (2.5 GB dan ortiq) | Qayta ishga tushirib, `claude --continue` |
| Xotira baribir yuqori | `/heapdump` — ikki fayl yozadi. **Diqqat:** `.heapsnapshot` da butun suhbat va kirish ma'lumotlari bor; ochiq issue'ga faqat `-diagnostics.json` ni biriktiring |

## Ruxsatlar va sandbox

Qo'llanmadagi tajribalarda haqiqatan uchragan xabarlar:

| Xabar | Ma'nosi | Bob |
| --- | --- | --- |
| `Permission to use Bash with command … has been denied.` | Deny qoidasi yoki `-p`/`dontAsk` da tasdiq kerak bo'lgan buyruq | 35 |
| `This command requires approval` | Buyruq ruxsat qoidasiga mos kelmadi (masalan, muhit o'zgaruvchisi bilan boshlangan buyruq) | 49 |
| `A variable in this command can't be checked before it runs` | Claude Code buyruqni to'liq tahlil qila olmadi — tasdiq kerak | 37, 49 |
| `Operation not permitted` (sandbox ichida) | Sandbox fayl tizimi yoki `credentials` qoidasi o'qishni bloklagan | 36, 38 |

## Sinovda uchragan boshqa holatlar

| Holat | Sabab | Bob |
| --- | --- | --- |
| Commit'larda `Co-Authored-By: Claude …` | Standart atributsiya | 50 |
| `/security-review` `origin` xatosi bilan | `origin` remote yoki uning standart branch'i yo'q | 39, 50 |
| GitHub `refusing to allow an OAuth App to create or update workflow … without workflow scope` | `gh` tokenida `workflow` ruxsati yo'q | 51 |
| `-p` sessiyalari `--continue` da ko'rinmaydi | Kuzatuvsiz sessiyalar alohida; `--resume <id>` | 33 |
| Agent brauzerni ocha olmadi (`-p` da) | Brauzer tool'iga ruxsat yo'q | 23, 49 |

## Xato hisoboti

CC: `/feedback` (va `/bug`, `/share`) suhbat nusxasini Anthropic'ga yuboradi va 5 yil saqlanadi (38-bob). Yuborishdan oldin
suhbatda maxfiy ma'lumot yo'qligini tekshiring. Claude Code'ning o'zidagi xavfsizlik zaifligi — ochiq e'lon qilinmaydi, HackerOne dasturi
orqali (CC, Security).

## Rasmiy hujjat

- [CC: Error reference](https://code.claude.com/docs/en/errors)
- [CC: Troubleshooting](https://code.claude.com/docs/en/troubleshooting)
- [CC: Troubleshoot installation and login](https://code.claude.com/docs/en/troubleshoot-install)
- [CC: Debug your configuration](https://code.claude.com/docs/en/debug-your-config)
