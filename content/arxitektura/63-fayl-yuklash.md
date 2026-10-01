# 63 — Fayl yuklash oqimi

[← Oldingi: Avtorizatsiya](62-avtorizatsiya.md) · [Mundarija](README.md) · [Keyingi: Real vaqt →](64-real-vaqt.md)

## Tushuncha

32-bobda — fayllarni backend'da saqlash. Bu bob — **frontend va backend orasidagi oqim**: foydalanuvchi faylni tanlagandan, u tayyor bo'lib sahifada ko'ringungacha.

```text
Tanlash → Klientda tekshirish → Ruxsat so'rash → Yuklash (progress) → Tasdiqlash → Ishlov berish → Tayyor
  input     hajm/tur, preview     POST /uploads      PUT storage          POST complete   navbat (thumb,   status
                                  → presigned URL                                          virus)          ready
```

## Nega shunday

Fayl yuklash boshqa so'rovlardan farq qiladi: **katta** (megabaytlar–gigabaytlar), **uzoq** (soniyalar–daqiqalar), **uzilishi mumkin** (mobil tarmoq), va **xavfli** (zararli fayl). Oddiy `POST /upload` + `multipart/form-data` kichik fayllar uchun yetarli, lekin katta fayllarda ilova serveri band bo'ladi, timeout'lar boshlanadi, uzilganda hammasi boshidan.

## Psevdokod: shartnoma

```text
1. POST /uploads
   { "filename": "pasport.jpg", "contentType": "image/jpeg", "size": 2483021, "purpose": "kyc" }
   → 201 { "uploadId": "up_7f3a", "url": "https://storage…?X-Amz-Signature=…", "method": "PUT",
           "headers": { "Content-Type": "image/jpeg" }, "expiresAt": "…+10min", "maxSize": 10485760 }
   Server tekshiradi: ruxsat (purpose bo'yicha), tur oq ro'yxatda, hajm limiti, kvota

2. PUT {url}  (to'g'ridan-to'g'ri storage'ga, ilova serverisiz)  → 200

3. POST /uploads/up_7f3a/complete
   → 202 { "status": "processing" }
   Server: fayl haqiqatan bormi, hajm mosmi, checksum → navbat: virus, EXIF tozalash, thumbnail

4. GET /uploads/up_7f3a   (yoki SSE/WebSocket bilan push, 64-bob)
   → { "status": "ready", "fileId": "f_91bd", "variants": { "w400": "…", "w800": "…" } }
   yoki { "status": "rejected", "reason": "virus" | "invalid-image" | "too-large" }

5. Biznes ob'ektiga bog'lash: PATCH /profile { "avatarFileId": "f_91bd" }
```

`purpose` maydoni muhim: avatar, pasport, hisob-faktura — har biri boshqa limit, boshqa ruxsat, boshqa saqlash joyi (ommaviy/maxfiy bucket).

## Psevdokod: frontend tomoni

```text
onSelect(file):
    if file.size > MAX: showError("Fayl 10 MB dan oshmasin"); return      // tez fikr-mulohaza (server baribir tekshiradi)
    if file.type not in ALLOWED: showError("Faqat JPG, PNG, PDF")
    preview = URL.createObjectURL(file)                                   // darhol ko'rsatish

    { uploadId, url, headers } = await api.createUpload(meta(file))
    await putWithProgress(url, file, headers, onProgress = (p) => progress.set(p))   // XHR — fetch'da upload progress yo'q
    await api.complete(uploadId)
    status = await waitUntilReady(uploadId)                               // polling / SSE
```

UX qoidalari:
- Progress — foiz va "bekor qilish" tugmasi.
- Bir nechta fayl — har biri alohida holat (navbat, yuklanmoqda, tayyor, xato).
- Xato — aniq sabab va "qayta urinish" ("Internet uzildi" ≠ "Fayl turi noto'g'ri").
- Forma yuborilishini yuklash tugaguncha bloklash (yoki fon yuklashni forma bilan bog'lash).

## Psevdokod: katta fayllar — qismlab yuklash

```text
Fayl > 100 MB:
  multipart upload: fayl 10 MB bo'laklarga → har bo'lak alohida presigned URL bilan parallel
  uzilsa — faqat yuklanmagan bo'laklar qayta yuboriladi (resumable)
  standartlar: S3 Multipart Upload, tus protokoli (ochiq resumable standart)
```

## Framework'larda

| Ehtiyoj | Backend | Frontend |
| --- | --- | --- |
| Presigned URL | Flysystem / AWS SDK; Laravel `Storage::temporaryUploadUrl` | — |
| Kichik fayl (multipart) | Symfony `UploadedFile` + Validator; Laravel `$request->file()` — [Laravel 27-bob](../laravel/27-kesh-va-fayllar.md) | `FormData` — [Angular 55-bob](../angular/55-http-client.md) |
| Progress | — | `withXhr()` + `reportProgress` (Fetch upload progressni qo'llamaydi) — [Angular 55-bob](../angular/55-http-client.md); [Next.js 34-bob](../nextjs/34-fayl-yuklash.md) |
| Ishlov berish | Messenger / Queue — [Symfony 26](../symfony/26-messenger.md), [Laravel 25-bob](../laravel/25-navbatlar.md) | Holat polling/SSE |
| Tayyor UI | — | Uppy (tus, S3 multipart), FilePond |

`FormData` bilan yuborishda `Content-Type` ni qo'lda qo'ymaslik kerak — brauzer `boundary` ni o'zi yozadi ([Angular 55-bob](../angular/55-http-client.md)).

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Ilova orqali multipart | Oddiy, bitta so'rov | Server resurslari, timeout, katta fayllar uchun yaroqsiz |
| Presigned URL | Server yuklanmaydi, masshtab | Ko'p qadamli oqim, "yarim yuklangan" holatlar |
| Qismlab (resumable) | Katta fayllar, uzilishga chidamli | Murakkab, kutubxona kerak |
| Sinxron ishlov berish | Natija darhol | Uzoq javob, timeout |
| Asinxron (navbat) | Tez javob | Holat kuzatish (polling/push) |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Faqat klientda tur/hajm tekshiruvi | Chetlab o'tiladi | Server (va presigned shartlarida) |
| Presigned URL'da hajm/tur cheklovi yo'q | 5 GB fayl yuklanadi | URL shartlarida limit |
| "complete" siz faylni ishonchli deb bilish | Klient yuklamagan bo'lishi mumkin | Server tekshiradi |
| Ishlov berilmagan faylni ko'rsatish | Virus, EXIF oshkor | Faqat `ready` holatda |
| Progress yo'q | "Qotib qoldi" hissi | Foiz + bekor qilish |
| `purpose` siz umumiy yuklash | Barcha fayllar bir xil ruxsat/limit | Maqsad bo'yicha siyosat |

## Amaliyot

1. Yuklash oqimingizni yuqoridagi besh qadam bilan solishtiring — qaysi qadam yo'q?
2. Presigned URL oqimini bitta turdagi fayl (avatar) uchun amalga oshiring.
3. Progress va bekor qilishni qo'shing; tarmoqni "Slow 3G" ga qo'yib sinang.
4. Ishlov berish natijasini (ready/rejected) UI'da ko'rsating.

## Manbalar

- OWASP — *File Upload Cheat Sheet*
- AWS — *Uploading objects using presigned URLs*; *Multipart upload overview*
- tus — *Resumable upload protocol* <https://tus.io>
