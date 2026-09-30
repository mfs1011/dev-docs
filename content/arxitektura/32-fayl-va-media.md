# 32 — Fayl va media

[← Oldingi: Audit va o'zgarishlar tarixi](31-audit.md) · [Mundarija](README.md) · [Keyingi: Ko'p ijarachilik →](33-kop-ijarachilik.md)

## Tushuncha

Fayllar (rasm, PDF, video, eksport) — ma'lumotlar bazasidan boshqacha: katta, binar, ko'pincha o'zgarmas, CDN orqali tarqatiladi. Arxitektura qarorlari:

| Qaror | Variantlar |
| --- | --- |
| Qayerda saqlash | Lokal disk, obyekt storage (S3, MinIO, R2), DB (deyarli hech qachon) |
| Kim yuklaydi | Ilova server orqali yoki to'g'ridan-to'g'ri storage'ga (presigned URL) |
| Qanday beriladi | Ilova orqali, public URL, CDN, vaqtinchalik imzolangan URL |
| Ishlov berish | Sinxron yoki navbatda (thumbnail, video konvertatsiya, virus tekshiruvi) |

## Nega shunday

Lokal diskda fayl — gorizontal masshtabni buzadi (19-bob): ikkinchi server nusxasi birinchisining diskini ko'rmaydi, konteyner qayta yaratilsa — fayllar yo'qoladi. Fayllarni ilova orqali yuklash — katta videolar ilova xotirasi va ulanishlarini band qiladi.

## Psevdokod: saqlash modeli

```text
Obyekt storage: fayl (binar)          DB: metama'lumot
  s3://shop-media/products/7f3a…/original.jpg      files(id, owner_type, owner_id, storage_key,
  s3://shop-media/products/7f3a…/w400.webp               mime, size, checksum, status, created_at)

Qoidalar:
  - Kalit — tasodifiy (UUID), foydalanuvchi bergan fayl nomi emas (yo'l hujumi, to'qnashuv)
  - Asl nom — faqat metama'lumotda (yuklab olishda Content-Disposition uchun)
  - Ommaviy va maxfiy fayllar — alohida bucket'lar
```

## Psevdokod: presigned URL bilan yuklash

```text
1. Klient → API:      POST /uploads { filename, mime, size }
2. API:                tekshiradi (ruxsat, mime ro'yxati, hajm limiti)
                       files.insert(status = 'pending')
                       url = storage.presignPut(key, mime, maxSize, expires = 10 min)
                       → { uploadId, url }
3. Klient → Storage:   PUT url (fayl to'g'ridan-to'g'ri, ilova serverisiz)
4. Klient → API:      POST /uploads/{id}/complete
5. API / worker:       fayl bormi, hajm/checksum mosmi → virus tekshiruvi, thumbnail (navbatda)
                       status = 'ready' (yoki 'rejected')
```

Foyda: ilova serveri gigabaytlik fayllarni ko'rmaydi. Tafsilotlar (progress, katta fayllar uchun multipart) — 63-bob.

## Psevdokod: xavfsizlik

```text
Yuklashda:
  - MIME ni fayl tarkibidan aniqlash (magic bytes), klient bergan Content-Type'ga ishonmaslik
  - Ruxsat etilgan turlar — oq ro'yxat; SVG — ehtiyot (ichida skript bo'lishi mumkin)
  - Hajm limiti — presigned URL shartida ham
  - Rasmlarni qayta kodlash (re-encode) — EXIF (GPS joylashuv!) va zararli payload tozalanadi
  - Virus tekshiruvi (ClamAV) — "ready" holatidan oldin

Berishda:
  - Foydalanuvchi fayllari — ilova domenidan emas, alohida domendan (usercontent.shop.uz) — XSS izolyatsiyasi
  - Maxfiy fayllar — qisqa muddatli imzolangan URL (5 daqiqa), har berishda ruxsat tekshiruvi
  - Content-Disposition: attachment — brauzer HTML/SVG'ni sahifa sifatida ochmasin
```

## Psevdokod: ishlov berish

```text
original yuklandi → navbat:
  - thumbnail'lar: w200, w400, w800 (WebP/AVIF)
  - video: HLS'ga konvertatsiya
  - PDF: birinchi sahifa preview
Natija — alohida kalitlar; original o'zgarmaydi
Yoki: talab bo'yicha (on-the-fly) — imgproxy / Cloudflare Images / CDN transformatsiyalari + kesh
```

Talab bo'yicha o'zgartirish — oldindan barcha o'lchamlarni generatsiya qilishdan moslashuvchanroq: frontend `srcset` uchun istalgan kenglikni so'raydi.

## Framework'larda

| Ehtiyoj | Backend | Frontend |
| --- | --- | --- |
| Fayl abstraksiyasi | Flysystem (Symfony bundle); Laravel Storage — [Laravel 27-bob](../laravel/27-kesh-va-fayllar.md) | — |
| Presigned URL | AWS SDK / Flysystem `temporaryUrl` | — |
| Yuklash UI, progress | — | `FormData`, progress (`withXhr()`) — [Angular 55-bob](../angular/55-http-client.md); [Next.js 34-bob](../nextjs/34-fayl-yuklash.md) |
| Rasm optimallashtirish | — | `NgOptimizedImage` + loader (CDN) — [Angular 74-bob](../angular/74-unumdorlik.md); `next/image` |
| Ishlov berish navbati | Messenger / Queue (26-bob) | Holat polling yoki SSE (64-bob) |

Angular'da tekshirilgan nozik joy: Fetch API yuklash progressini qo'llamaydi — progress kerak bo'lsa `withXhr()`, lekin uni SSR'da ishlatmang ([Angular 55-bob](../angular/55-http-client.md)). Presigned URL bilan yuklashda progress — to'g'ridan-to'g'ri storage'ga XHR orqali.

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Lokal disk | Oddiy | Masshtab, zaxira, konteynerlarda yo'qolish |
| Obyekt storage | Masshtab, arzon, CDN bilan | Tarmoq, SDK, ruxsatlar sozlash |
| Ilova orqali yuklash | Oddiy nazorat | Server resurslari, timeout |
| Presigned URL | Serverni yuklamaydi | Ko'p qadamli oqim, "yarim yuklangan" holatlar |
| Oldindan barcha o'lchamlar | Tez berish | Saqlash hajmi, yangi o'lcham — qayta ishlash |
| Talab bo'yicha o'zgartirish | Moslashuvchan | Birinchi so'rov sekin, kesh kerak |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Foydalanuvchi fayl nomi bilan saqlash | Yo'l hujumi, to'qnashuv | Tasodifiy kalit |
| `Content-Type` ga ishonish | Zararli fayl "rasm" bo'lib o'tadi | Magic bytes |
| Foydalanuvchi SVG/HTML asosiy domendan | Stored XSS | Alohida domen, `attachment` |
| EXIF saqlanadi | Foydalanuvchi joylashuvi oshkor | Qayta kodlash |
| Maxfiy fayl uchun doimiy public URL | Havola tarqalsa — hamma ko'radi | Qisqa muddatli imzolangan URL |
| "pending" fayllar tozalanmaydi | Storage axlat bilan to'ladi | Rejalashtirilgan tozalash (34-bob) |

## Amaliyot

1. Fayllaringiz qayerda saqlanadi? Ikkinchi server nusxasi ularni ko'radimi?
2. Yuklashni presigned URL oqimiga o'tkazish rejasini yozing.
3. Rasm yuklashda EXIF tozalanadimi — telefon rasmi bilan tekshiring.
4. Foydalanuvchi yuklagan SVG sahifada ochilsa nima bo'ladi — sinab ko'ring.

## Manbalar

- OWASP — *File Upload Cheat Sheet* <https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html>
- AWS — *Uploading objects with presigned URLs*
- imgproxy: <https://imgproxy.net>
