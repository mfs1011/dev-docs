# 50 — Mikro-frontendlar

[← Oldingi: Build va yetkazib berish](49-build-va-yetkazish.md) · [Mundarija](README.md) · [Keyingi: Offline va optimistik UI →](51-offline-va-optimistik-ui.md)

## Tushuncha

Mikro-frontendlar — frontend'ni **mustaqil deploy qilinadigan** qismlarga bo'lish: har jamoa o'z bo'limini (katalog, checkout, kabinet) alohida repo, alohida build va alohida reliz bilan yuritadi, brauzerda esa ular bitta ilova bo'lib birlashadi.

```text
                 ┌──────────────── Qobiq (shell) ────────────────┐
                 │ header, marshrutlash, auth, dizayn tizimi      │
                 ├──────────────┬──────────────┬─────────────────┤
                 │  Katalog     │  Checkout    │  Kabinet        │
                 │  (Jamoa A)   │  (Jamoa B)   │  (Jamoa C)      │
                 │  v3.2        │  v1.8        │  v5.0           │
                 └──────────────┴──────────────┴─────────────────┘
```

Bu — backend'dagi mikroservislarning (21-bob) frontend analogi. Va xuddi ular kabi — **tashkiliy** muammoni yechadi, texnik emas.

## Nega shunday

Mikro-frontendlar foydasi faqat bitta holatda real: **ko'p mustaqil jamoa bitta frontend'da bir-biriga xalaqit beradi** — umumiy reliz poyezdi, merge konfliktlari, bitta jamoaning xatosi hammaning deploy'ini to'xtatadi.

Narxi esa har doim real:

| Narx | Nima |
| --- | --- |
| Bundle hajmi | Har qism o'z framework nusxasini olib kelsa — 3× Vue/React |
| Izchillik | Turli dizayn versiyalari, turli UX — foydalanuvchi "uch xil sayt" ko'radi |
| Umumiy holat | Auth, savat, til — qismlar orasida qanday ulashiladi? |
| Marshrutlash | Kim qaysi URL'ga egalik qiladi, ichma-ich navigatsiya |
| Versiya mosligi | Qobiq v2, checkout v1 — shartnoma buzilsa ishlamaydi |
| Test va debug | Integratsiya xatolari faqat birlashganda ko'rinadi |
| Infratuzilma | Har qism uchun CI/CD, CDN, versiya manifesti |

## Psevdokod: birlashtirish usullari

```text
1. Build vaqtida (npm paketlar)
   shell imports "@shop/catalog@3.2"
   → Mustaqil deploy YO'Q: yangi versiya uchun shell qayta build qilinadi
   → Aslida mikro-frontend emas, monorepo paketlari (74-bob)

2. Server tomonda (SSR compose, edge includes)
   <esi:include src="https://catalog.shop.uz/fragment" />
   → SEO yaxshi, lekin interaktivlik murakkab

3. Ish vaqtida — Module Federation / import maps
   shell: const Catalog = await import("catalog/App")   // remoteEntry.js orqali
   → Haqiqiy mustaqil deploy; umumiy kutubxonalar "shared" sifatida bir marta yuklanadi

4. iframe
   <iframe src="https://legacy.shop.uz/reports">
   → Maksimal izolyatsiya (eski tizimni joylashtirish uchun yaxshi), lekin UX, a11y va o'lcham muammolari

5. Web Components
   <catalog-widget> — framework-neytral chegara
```

## Psevdokod: qismlar orasidagi shartnoma

```text
Qobiq beradi:            Qismlar bermaydi/qilmaydi:
  - auth tokeni / user     - global CSS (faqat scope'langan)
  - marshrut prefiksi      - boshqa qismning ichki store'iga murojaat
  - dizayn tokenlari       - window'ga global o'zgaruvchilar
  - hodisa shinasi         - umumiy kutubxonaning boshqa major versiyasi (shared bilan kelishilmagan)

Aloqa — faqat hodisalar orqali (27-bob g'oyasi brauzerda):
  window.dispatchEvent(new CustomEvent("cart:item-added", { detail: { sku } }))
  // checkout eshitadi; katalog checkout'ni bilmaydi
```

## Psevdokod: avval nimalarni sinab ko'rish

```text
"Jamoalar bir-biriga xalaqit beryapti" muammosiga — arzondan qimmatga:
1. Feature papkalar + import qoidalari (38-bob) + CODEOWNERS
2. Lazy bo'limlar — har bo'lim alohida chunk, alohida ega
3. Monorepo + mustaqil paketlar + affected-only CI (74-bob)
4. Trunk-based development, feature flag'lar — reliz poyezdini olib tashlaydi
5. Faqat shulardan keyin ham og'riq qolsa — mikro-frontendlar
```

Ko'p jamoalar 1–4-qadamlar bilan "mikro-frontend kerak" degan muammoni hal qiladi.

## Framework'larda

| Vosita | Holat |
| --- | --- |
| Module Federation | Webpack 5 da paydo bo'lgan; Rspack, Vite (`@module-federation/vite`) uchun ham bor |
| Angular | `@angular-architects/module-federation` / Native Federation (esbuild) — Angular lazy marshrutlari bilan ([Angular 43-bob](../angular/43-lazy-loading.md)) |
| React / Vue | Module Federation remote komponentlar; framework-neytral — single-spa |
| Next.js | Multi-Zones — har zona alohida Next ilovasi, URL prefiksi bo'yicha |
| Web Components | Angular Elements, Vue `defineCustomElement` |

Frontend kitoblarida mikro-frontendga alohida bob yo'q — ataylab: bu kitoblardagi tavsiyalar (feature tuzilma, lazy loading, dizayn tizimi) aksariyat loyihalar uchun to'g'ri yo'l.

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Bitta frontend (modulli) | Izchil UX, bitta bundle, oddiy | Katta jamoalarda muvofiqlashtirish |
| Monorepo paketlar | Kod chegaralari, umumiy vositalar | Mustaqil deploy yo'q |
| Module Federation | Mustaqil deploy | Versiya mosligi, shared kutubxonalar, murakkab debug |
| iframe | To'liq izolyatsiya | UX, a11y, o'lcham, aloqa qiyin |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Bitta jamoa uchun mikro-frontendlar | Faqat narx, foyda yo'q | Modulli frontend |
| Har qism o'z framework versiyasi | Bundle ko'payadi, UX nomuvofiq | Shared, umumiy dizayn tizimi |
| Qismlar bir-birining store'iga kiradi | Mustaqillik yo'qoladi | Hodisalar/shartnoma |
| Global CSS qismdan | Boshqa qismlarni buzadi | Scope'langan stillar, tokenlar |
| Integratsiya testlari yo'q | Birlashganda buziladi | Qobiq + qismlar E2E |
| "Texnologiya erkinligi" uchun | Kamdan-kam real ehtiyoj | Tashkiliy sabab bo'lsa |

## Amaliyot

1. Jamoalaringiz frontend'da bir-biriga qanday xalaqit beradi — aniq ro'yxat tuzing.
2. "Avval sinab ko'rish" ro'yxatidagi 1–4-qadamlardan qaysilari bajarilgan?
3. Agar mikro-frontendlar bo'lsa: qismlar orasidagi shartnomani (beriladigan va taqiqlangan narsalar) yozing.
4. Bundle tahlilida bir kutubxonaning nechta nusxasi yuklanayotganini tekshiring.

## Manbalar

- Cam Jackson — *Micro Frontends* <https://martinfowler.com/articles/micro-frontends.html>
- Luca Mezzalira — *Building Micro-Frontends*
- Module Federation <https://module-federation.io>
