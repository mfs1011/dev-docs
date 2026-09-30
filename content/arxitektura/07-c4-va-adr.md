# 07 — Hujjatlashtirish: C4 va ADR

[← Oldingi: Abstraksiya darajalari](06-abstraksiya.md) · [Mundarija](README.md) · [Keyingi: SOLID amalda →](08-solid.md)

## Tushuncha

Arxitektura hujjati ikki savolga javob beradi:

| Savol | Vosita |
| --- | --- |
| **Tizim qanday tuzilgan?** | **C4 model** — to'rt darajali diagrammalar |
| **Nega shunday qilingan?** | **ADR** (Architecture Decision Record) — qarorlar jurnali |

Ikkinchisi muhimroq: tuzilmani koddan tiklash mumkin, **sabab**ni — yo'q.

## Nega shunday

Hujjatlashtirishning ikki ekstremumi:

- **Hech narsa yo'q** — bilim bir-ikki odamning boshida. Ular ketsa — ketadi. Yangi dasturchi oylab "arxeologiya" qiladi.
- **Katta Word hujjati** — 80 sahifa, bir marta yozilgan, hech kim o'qimaydi, kod bilan mos emas.

C4 va ADR — o'rta yo'l: **kichik, kod yonida, git'da, o'zgarishlar bilan birga yangilanadigan**.

## Diagramma: C4 — to'rt daraja

Xarita kabi: mamlakat → shahar → ko'cha → uy. Har daraja o'z auditoriyasi uchun.

```text
1. Context (tizim konteksti) — kim foydalanadi, qaysi tashqi tizimlar
   ┌──────────┐        ┌───────────────────┐        ┌─────────────┐
   │ Xaridor  │──────▶ │   Do'kon tizimi   │──────▶ │ Click/Payme │
   └──────────┘        └───────────────────┘        └─────────────┘
                              │   ▲
                              ▼   │
                       ┌───────────────────┐
                       │ Ombor (1C)        │
                       └───────────────────┘
   Auditoriya: hamma, shu jumladan biznes

2. Container (konteynerlar) — ishga tushiriladigan qismlar
   [Web ilova: Angular SSR]──HTTPS/JSON──▶[API: Symfony]──SQL──▶[(PostgreSQL)]
                                             │
                                             └──AMQP──▶[Worker: Messenger]──▶ Ombor
   Auditoriya: dasturchilar, DevOps

3. Component — bitta konteyner ichidagi modullar
   API: [Orders] [Billing] [Catalog] [Identity] — va ular orasidagi bog'liqlik
   Auditoriya: shu konteyner dasturchilari

4. Code — klasslar (odatda kerak emas — IDE ko'rsatadi)
```

"Container" — Docker konteyneri emas: alohida ishga tushadigan narsa (SPA, API, DB, worker).

Amaliyotda **1 va 2-darajalar** deyarli har loyihada kerak, 3 — murakkab konteynerlar uchun, 4 — deyarli hech qachon.

### Diagramma — kod sifatida

Rasm fayllari eskiradi. Matndan chiziladigan diagrammalar git'da, PR'da ko'rib chiqiladi:

```text
// Structurizr DSL
workspace {
  model {
    customer = person "Xaridor"
    shop = softwareSystem "Do'kon" {
      web = container "Web ilova" "Angular SSR"
      api = container "API" "Symfony"
      db  = container "Baza" "PostgreSQL" { tags "Database" }
    }
    payments = softwareSystem "Click/Payme" { tags "External" }
    customer -> web "Mahsulot ko'radi, buyurtma beradi"
    web -> api "JSON/HTTPS"
    api -> db "SQL"
    api -> payments "To'lov"
  }
  views { systemContext shop { include * }  container shop { include * } }
}
```

Mermaid ham ishlaydi (GitHub va ko'p docs vositalari to'g'ridan-to'g'ri chizadi):

```text
flowchart LR
  customer([Xaridor]) --> web[Web ilova<br/>Angular SSR]
  web -->|JSON/HTTPS| api[API<br/>Symfony]
  api --> db[(PostgreSQL)]
  api -->|to'lov| pay[[Click/Payme]]
```

## Psevdokod: ADR

ADR — bitta qaror, bitta qisqa fayl (Michael Nygard shabloni):

```text
docs/adr/0007-token-saqlash.md

# 7. Access token xotirada, refresh token HttpOnly cookie'da

Holat: Qabul qilindi (2026-09-30)

## Kontekst
SPA (Angular) va API (Symfony) turli subdomenlarda. XSS xavfi bor
(uchinchi tomon skriptlari: analitika, chat). Talab: foydalanuvchi 30 kun kirgan holda qolsin.

## Qaror
Access token (15 daqiqa) — faqat JS xotirasida (signal).
Refresh token (30 kun) — HttpOnly; Secure; SameSite=Strict cookie, Path=/api/auth.
Refresh single-flight: parallel 401 larda bitta so'rov.

## Ko'rib chiqilgan variantlar
- localStorage'da ikkala token — XSS'da uzoq muddatli kirish. Rad etildi.
- Faqat sessiya cookie — subdomenlar va mobil ilova uchun noqulay. Rad etildi.

## Oqibatlar
+ XSS'da refresh token o'g'irlanmaydi.
− Sahifa yangilanganda refresh so'rovi (ishga tushishda ~100 ms).
− CSRF himoyasi kerak (SameSite + XSRF token).
```

ADR qoidalari:

| Qoida | Nega |
| --- | --- |
| Raqamlangan, o'zgarmas | Tarix saqlanadi |
| Qaror o'zgarsa — **yangi** ADR, eskisi "O'rniga: 0012" holatiga | Nega o'zgarganini ham ko'ramiz |
| Kod yonida (`docs/adr/`), PR orqali | Ko'rib chiqiladi, kod bilan birga |
| Qisqa — bir sahifa | Yoziladi va o'qiladi |
| "Ko'rib chiqilgan variantlar" — majburiy | Keyingi dasturchi o'sha bahsni qaytarmaydi |

**Qachon ADR yozish:** qaror qaytarish qiyin (1-bob), bahs bo'lgan, yoki 6 oydan keyin kimdir "nega?" deb so'rashi aniq.

## Framework'larda

Framework tanlovining o'zi — birinchi ADR'lardan biri. Bu saytdagi qo'llanmalarda ko'p "ADR tayyor" qarorlar bor — ularni loyihangiz ADR'lariga asos qilib oling:

| Qaror | ADR uchun material |
| --- | --- |
| Token saqlash joyi | [Angular 58-bob](../angular/58-auth-token-refresh.md), [Next.js 26-bob](../nextjs/26-token-saqlash.md) |
| Holat boshqaruvi kutubxonasi | [Angular 60–61-boblar](../angular/60-signal-xizmatlar.md), [React 37-bob](../react/37-holat-qayerda.md), [Vue 41-bob](../vue/41-holat-boshqaruvi.md) |
| Render rejimi har marshrutga | [Angular 63-bob](../angular/63-server-marshrutlar.md), [Next.js 3-bob](../nextjs/03-render-strategiyalari.md) |
| Forma API'si | [Angular 47-bob](../angular/47-formalar-tanlov.md) — uch yondashuv solishtirmasi |
| Monolit tuzilishi | [Symfony 39-bob](../symfony/39-arxitektura.md) |

Diagrammalar uchun vositalar framework'dan mustaqil: Structurizr, Mermaid, PlantUML (C4-PlantUML), draw.io (oxirgisi — kod emas, eskirishga moyil).

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Hech narsa yozmaslik | Vaqt tejaladi (hozir) | Bilim yo'qoladi, qarorlar qayta-qayta muhokama qilinadi |
| Katta arxitektura hujjati | To'liq (yozilgan paytda) | Tez eskiradi, o'qilmaydi |
| **C4 (1–2 daraja) + ADR** | Kichik, yangilanadi, sabab saqlanadi | Intizom: har muhim PR'da "ADR kerakmi?" |
| Diagramma — rasm | Chiroyli | Eskiradi, diff yo'q |
| Diagramma — kod | Git, review, yangilanadi | Ko'rinishni boshqarish kamroq |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Faqat "nima", "nega"siz | Keyin qaror tushunarsiz, bekor qilinadi | ADR |
| Eski ADR'ni tahrirlash | Tarix yo'qoladi | Yangi ADR, eskisini "almashtirildi" deb belgilash |
| Diagrammada hamma narsa bir darajada | O'qib bo'lmaydi | C4 darajalari |
| Diagrammalar Confluence'da, kod GitHub'da | Ajralib qoladi | `docs/` repoda |
| ADR — faqat arxitektor uchun | Jamoa bilmaydi | PR orqali, hamma ko'radi |

## Amaliyot

1. Loyihangiz uchun C4 Context va Container diagrammasini Mermaid'da chizing (`docs/architecture.md`).
2. So'nggi 3 oydagi eng muhim qaror uchun ADR yozing — "ko'rib chiqilgan variantlar" bilan.
3. `docs/adr/` papkasi va shablon faylini yarating; PR shabloniga "ADR kerakmi?" punktini qo'shing.
4. Jamoadoshingizga diagrammani ko'rsating: 5 daqiqada tizimni tushundimi?

## Manbalar

- Simon Brown — C4 model: <https://c4model.com>
- Michael Nygard — *Documenting Architecture Decisions* <https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions>
- ADR shablonlari: <https://adr.github.io>
- Structurizr DSL: <https://docs.structurizr.com/dsl>
