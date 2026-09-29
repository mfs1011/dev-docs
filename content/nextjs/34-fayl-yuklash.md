# 34 — Fayl yuklash va saqlash

[← Oldingi: Drizzle va SQL yondashuvi](33-drizzle.md) · [Mundarija](README.md) · [Keyingi: To'lov: Stripe →](35-stripe.md)

## Tushuncha

Foydalanuvchi rasm yuklaydi. Uch savol:

1. **Qayerga** saqlanadi;
2. Fayl **serveringiz orqali** o'tadimi yoki to'g'ridan-to'g'ri saqlash xizmatiga ketadimi;
3. Keyin u **qanday ko'rsatiladi**.

```
Variant A — server orqali (proksi):
  Brauzer ──fayl──▶ Next ──fayl──▶ S3
                     (xotira/limit muammosi)

Variant B — presigned URL (tavsiya):
  Brauzer ──▶ Next: "menga ruxsat ber"
          ◀── {url, fields}
          ──fayl──▶ S3 (to'g'ridan-to'g'ri)
          ──▶ Next: "yuklandi, bazaga yoz"
```

Variant B deyarli har doim to'g'ri: fayl Next serveridan o'tmaydi, ya'ni xotira, timeout va tana hajmi cheklovlari yo'q.

## Nega shunday

**Diskka saqlash ishlamaydi.** `public/uploads/` ga yozish local'da ishlaydi va productionda yo'qoladi:

| Muhit | Nega ishlamaydi |
| --- | --- |
| Vercel / Lambda | Fayl tizimi faqat o'qish uchun (`/tmp` dan tashqari), instansiya o'ladi |
| Docker | Konteyner qayta ishga tushsa yo'qoladi |
| Bir necha instansiya | Yuklangan fayl faqat bitta serverda |
| `public/` | Build vaqtida nusxalanadi — ish vaqtidagi fayl u yerda emas |

Shuning uchun: **obyekt saqlash** (S3, Cloudflare R2, Backblaze B2) yoki boshqariladigan xizmat (UploadThing, Vercel Blob).

**Server orqali o'tkazish nega yomon:**

| Chegara | Qiymat |
| --- | --- |
| Server Action tanasi | Sukut bo'yicha 1 MB (sozlanadi) |
| Vercel funksiya tanasi | 4.5 MB (o'zgarmaydi) |
| Lambda javob/so'rov | 6 MB |
| Funksiya ishlash vaqti | 10–60 s |

100 MB video shu chegaralarning hech biriga sig'maydi.

## Kod: presigned URL — server tomoni

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

::: ts
```ts
// lib/storage.ts
import 'server-only'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const s3 = new S3Client({
  region: process.env.S3_REGION!,
  endpoint: process.env.S3_ENDPOINT,             // R2/MinIO uchun; AWS'da kerak emas
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.S3_BUCKET!

export async function presignUpload(key: string, contentType: string, maxBytes: number) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
    ContentLength: maxBytes,                     // hajm imzoga kiradi — o'zgartirib bo'lmaydi
  })

  return getSignedUrl(s3, command, { expiresIn: 60 })   // 1 daqiqa yetarli
}

export async function deleteObject(key: string) {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}

export function publicUrl(key: string) {
  return `${process.env.S3_PUBLIC_URL}/${key}`
}
```
:::

::: js
```js
// lib/storage.js
import 'server-only'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const s3 = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
})

const BUCKET = process.env.S3_BUCKET

export async function presignUpload(key, contentType, maxBytes) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
    ContentLength: maxBytes,
  })

  return getSignedUrl(s3, command, { expiresIn: 60 })
}

export async function deleteObject(key) {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}

export function publicUrl(key) {
  return `${process.env.S3_PUBLIC_URL}/${key}`
}
```
:::

Endi Server Action — **ruxsat so'rash**:

::: ts
```ts
// app/(app)/profile/actions.ts
'use server'

import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { requireSession } from '@/lib/dal'
import { presignUpload } from '@/lib/storage'

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const
const MAX_BYTES = 5 * 1024 * 1024               // 5 MB

const schema = z.object({
  contentType: z.enum(ALLOWED),
  size: z.number().int().positive().max(MAX_BYTES),
})

export async function createUploadUrl(input: unknown) {
  const session = await requireSession()          // 1. Ruxsat
  const parsed = schema.safeParse(input)          // 2. Validatsiya

  if (!parsed.success) {
    return { error: 'Fayl turi yoki hajmi mos emas (JPEG/PNG/WebP/AVIF, 5 MB gacha)' }
  }

  const extension = parsed.data.contentType.split('/')[1]
  // Kalitni SERVER quradi — foydalanuvchi nomi ishlatilmaydi
  const key = `avatars/${session.userId}/${randomUUID()}.${extension}`

  const url = await presignUpload(key, parsed.data.contentType, parsed.data.size)

  return { url, key }
}
```
:::

::: js
```js
// app/(app)/profile/actions.js
'use server'

import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { requireSession } from '@/lib/dal'
import { presignUpload } from '@/lib/storage'

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const MAX_BYTES = 5 * 1024 * 1024

const schema = z.object({
  contentType: z.enum(ALLOWED),
  size: z.number().int().positive().max(MAX_BYTES),
})

export async function createUploadUrl(input) {
  const session = await requireSession()
  const parsed = schema.safeParse(input)

  if (!parsed.success) {
    return { error: 'Fayl turi yoki hajmi mos emas (JPEG/PNG/WebP/AVIF, 5 MB gacha)' }
  }

  const extension = parsed.data.contentType.split('/')[1]
  const key = `avatars/${session.userId}/${randomUUID()}.${extension}`

  const url = await presignUpload(key, parsed.data.contentType, parsed.data.size)

  return { url, key }
}
```
:::

**Kalitni hech qachon foydalanuvchi bermasin.** Agar `key` ni klientdan olsangiz, u `../../../config.json` yoki boshqa foydalanuvchining papkasini yozib yuborishi mumkin.

Tasdiqlash — yuklangandan keyin:

::: ts
```ts
'use server'

import { HeadObjectCommand } from '@aws-sdk/client-s3'
import { s3 } from '@/lib/storage'

export async function confirmAvatar(key: string) {
  const session = await requireSession()

  // Kalit shu foydalanuvchiniki ekanini tekshiramiz
  if (!key.startsWith(`avatars/${session.userId}/`)) {
    return { error: 'Noto\'g\'ri kalit' }
  }

  // Fayl haqiqatan yuklanganini tasdiqlaymiz
  const head = await s3
    .send(new HeadObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }))
    .catch(() => null)

  if (!head) return { error: 'Fayl topilmadi' }

  await db.update(users).set({ avatarKey: key }).where(eq(users.id, session.userId))

  revalidatePath('/profile')

  return { ok: true }
}
```
:::

::: js
```js
'use server'

import { HeadObjectCommand } from '@aws-sdk/client-s3'
import { s3 } from '@/lib/storage'

export async function confirmAvatar(key) {
  const session = await requireSession()

  if (!key.startsWith(`avatars/${session.userId}/`)) return { error: 'Noto\'g\'ri kalit' }

  const head = await s3
    .send(new HeadObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }))
    .catch(() => null)

  if (!head) return { error: 'Fayl topilmadi' }

  await db.update(users).set({ avatarKey: key }).where(eq(users.id, session.userId))

  revalidatePath('/profile')

  return { ok: true }
}
```
:::

## Kod: klient tomoni — progress bilan

::: ts
```tsx
// app/(app)/profile/AvatarUpload.tsx
'use client'

import { useState, useTransition } from 'react'
import { createUploadUrl, confirmAvatar } from './actions'

export function AvatarUpload({ current }: { current?: string }) {
  const [preview, setPreview] = useState(current)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) return

    setError(null)
    setPreview(URL.createObjectURL(file))        // darhol ko'rsatamiz

    // 1. Ruxsat olamiz
    const permit = await createUploadUrl({ contentType: file.type, size: file.size })

    if ('error' in permit) {
      setError(permit.error)
      setPreview(current)

      return
    }

    // 2. To'g'ridan-to'g'ri S3 ga (XHR — progress uchun; fetch progress bermaydi)
    setProgress(0)

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.open('PUT', permit.url)
      xhr.setRequestHeader('Content-Type', file.type)
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
      }
      xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`S3 ${xhr.status}`)))
      xhr.onerror = () => reject(new Error('Tarmoq xatosi'))
      xhr.send(file)
    }).catch((e: Error) => {
      setError(e.message)
      setProgress(null)
    })

    // 3. Tasdiqlaymiz
    startTransition(async () => {
      const result = await confirmAvatar(permit.key)

      if ('error' in result) setError(result.error)

      setProgress(null)
    })
  }

  return (
    <div>
      {preview && <img src={preview} alt="" width={96} height={96} />}

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleChange}
        disabled={progress !== null || isPending}
      />

      {progress !== null && (
        <progress value={progress} max={100} aria-label="Yuklanmoqda">
          {progress}%
        </progress>
      )}

      {error && <p role="alert">{error}</p>}
    </div>
  )
}
```
:::

::: js
```jsx
// app/(app)/profile/AvatarUpload.jsx
'use client'

import { useState, useTransition } from 'react'
import { createUploadUrl, confirmAvatar } from './actions'

export function AvatarUpload({ current }) {
  const [preview, setPreview] = useState(current)
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState(null)
  const [isPending, startTransition] = useTransition()

  async function handleChange(event) {
    const file = event.target.files?.[0]

    if (!file) return

    setError(null)
    setPreview(URL.createObjectURL(file))

    const permit = await createUploadUrl({ contentType: file.type, size: file.size })

    if (permit.error) {
      setError(permit.error)
      setPreview(current)

      return
    }

    setProgress(0)

    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.open('PUT', permit.url)
      xhr.setRequestHeader('Content-Type', file.type)
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
      }
      xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`S3 ${xhr.status}`)))
      xhr.onerror = () => reject(new Error('Tarmoq xatosi'))
      xhr.send(file)
    }).catch((e) => {
      setError(e.message)
      setProgress(null)
    })

    startTransition(async () => {
      const result = await confirmAvatar(permit.key)

      if (result.error) setError(result.error)

      setProgress(null)
    })
  }

  return (
    <div>
      {preview && <img src={preview} alt="" width={96} height={96} />}

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleChange}
        disabled={progress !== null || isPending}
      />

      {progress !== null && <progress value={progress} max={100}>{progress}%</progress>}

      {error && <p role="alert">{error}</p>}
    </div>
  )
}
```
:::

`fetch` yuklash progressini bermaydi — shuning uchun `XMLHttpRequest`. Bu 2026-yilda ham shunday.

## Kod: kichik fayl — Server Action orqali

Agar fayl kichik bo'lsa (avatar, PDF hujjat), proksi soddaroq:

::: ts
```ts
// next.config.ts — Server Action tanasi chegarasini oshirish
const config: NextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: '4mb' },
  },
}
```

```ts
'use server'

import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3 } from '@/lib/storage'

export async function uploadDocument(formData: FormData) {
  const session = await requireSession()
  const file = formData.get('file')

  if (!(file instanceof File)) return { error: 'Fayl yuborilmadi' }
  if (file.size > 4 * 1024 * 1024) return { error: '4 MB dan katta' }
  if (file.type !== 'application/pdf') return { error: 'Faqat PDF' }

  const buffer = Buffer.from(await file.arrayBuffer())

  // Sehrli baytlarni tekshirish — MIME turini brauzer yolg'on aytishi mumkin
  if (buffer.subarray(0, 4).toString('latin1') !== '%PDF') {
    return { error: 'Fayl PDF emas' }
  }

  const key = `documents/${session.userId}/${randomUUID()}.pdf`

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: 'application/pdf',
    }),
  )

  await db.insert(documents).values({ userId: session.userId, key, name: file.name })

  revalidatePath('/documents')

  return { ok: true }
}
```
:::

::: js
```js
// next.config.mjs
const config = {
  experimental: { serverActions: { bodySizeLimit: '4mb' } },
}

// actions.js
'use server'

import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3 } from '@/lib/storage'

export async function uploadDocument(formData) {
  const session = await requireSession()
  const file = formData.get('file')

  if (!(file instanceof File)) return { error: 'Fayl yuborilmadi' }
  if (file.size > 4 * 1024 * 1024) return { error: '4 MB dan katta' }
  if (file.type !== 'application/pdf') return { error: 'Faqat PDF' }

  const buffer = Buffer.from(await file.arrayBuffer())

  if (buffer.subarray(0, 4).toString('latin1') !== '%PDF') return { error: 'Fayl PDF emas' }

  const key = `documents/${session.userId}/${randomUUID()}.pdf`

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: 'application/pdf',
    }),
  )

  revalidatePath('/documents')

  return { ok: true }
}
```
:::

**`file.type` ga ishonmang** — u brauzer aytgan qiymat. Sehrli baytlar (magic bytes) haqiqiy tekshiruv.

## Kod: rasmni ko'rsatish — `next/image`

::: ts
```tsx
import Image from 'next/image'

// Tashqi domen — next.config'da ruxsat kerak
export function Avatar({ avatarKey, name }: { avatarKey?: string; name: string }) {
  if (!avatarKey) return <div className="avatar-placeholder">{name[0]}</div>

  return (
    <Image
      src={`${process.env.NEXT_PUBLIC_S3_URL}/${avatarKey}`}
      alt={`${name} avatari`}
      width={96}
      height={96}
      quality={80}
      className="avatar"
    />
  )
}
```

```ts
// next.config.ts
const config: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.example.com', pathname: '/avatars/**' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
}
```
:::

::: js
```jsx
import Image from 'next/image'

export function Avatar({ avatarKey, name }) {
  if (!avatarKey) return <div className="avatar-placeholder">{name[0]}</div>

  return (
    <Image
      src={`${process.env.NEXT_PUBLIC_S3_URL}/${avatarKey}`}
      alt={`${name} avatari`}
      width={96}
      height={96}
      quality={80}
    />
  )
}

// next.config.mjs
const config = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.example.com', pathname: '/avatars/**' }],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
}
```
:::

`remotePatterns` da `hostname: '**'` yozmang — u ochiq rasm proksisi bo'lib qoladi va sizning hisobingizdan begona rasmlar uzatiladi.

## Kod: maxfiy fayllar

Hamma fayl ham ochiq bo'lmasligi kerak. Shartnoma, hisob-faktura — faqat egasiga:

::: ts
```ts
// lib/storage.ts
import { GetObjectCommand } from '@aws-sdk/client-s3'

export async function presignDownload(key: string, filename: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${encodeURIComponent(filename)}"`,
  })

  return getSignedUrl(s3, command, { expiresIn: 300 })    // 5 daqiqa
}
```

```ts
// app/api/documents/[id]/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await verifySession()

  if (!session) return NextResponse.json({ error: 'Kirish kerak' }, { status: 401 })

  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, Number(id)),
    columns: { id: true, key: true, name: true, userId: true },
  })

  if (!doc) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 })

  // Egalik tekshiruvi — 30-bob
  if (doc.userId !== session.userId && !session.roles.includes('admin')) {
    return NextResponse.json({ error: 'Topilmadi' }, { status: 404 })
  }

  const url = await presignDownload(doc.key, doc.name)

  return NextResponse.redirect(url)               // faylni S3 beradi, Next emas
}
```
:::

::: js
```js
// lib/storage.js
import { GetObjectCommand } from '@aws-sdk/client-s3'

export async function presignDownload(key, filename) {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${encodeURIComponent(filename)}"`,
  })

  return getSignedUrl(s3, command, { expiresIn: 300 })
}

// app/api/documents/[id]/route.js
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { id } = await params
  const session = await verifySession()

  if (!session) return NextResponse.json({ error: 'Kirish kerak' }, { status: 401 })

  const doc = await getDocument(Number(id))

  if (!doc || (doc.userId !== session.userId && !session.roles.includes('admin'))) {
    return NextResponse.json({ error: 'Topilmadi' }, { status: 404 })
  }

  const url = await presignDownload(doc.key, doc.name)

  return NextResponse.redirect(url)
}
```
:::

Fayl **Next orqali oqmaydi** — foydalanuvchi qisqa muddatli imzolangan URL'ga yo'naltiriladi. Bu funksiya vaqtini va trafikni tejaydi.

Diqqat: ruxsat yo'q bo'lganda **404**, 403 emas — hujjat borligi bilinmasin (30-bob).

## Muhandislik nuqtai nazari: saqlash xizmatini tanlash

| Xizmat | Chiqish trafigi | Narx | Qachon |
| --- | --- | --- | --- |
| **Cloudflare R2** | ✅ Bepul | Arzon | Ko'p rasm/video uzatiladigan ilova |
| **AWS S3** | 💸 Qimmat | Standart | AWS ekotizimidasiz |
| **Backblaze B2** | Arzon | Eng arzon | Zaxira, arxiv |
| **Vercel Blob** | Vercel ichida | Qimmatroq | Tez boshlash, Vercel'da |
| **UploadThing** | Boshqariladi | O'rtacha | Sozlash vaqtini tejash |
| **MinIO (o'zingizda)** | — | Server narxi | Self-host, ma'lumot chegarada qolishi kerak |

Chiqish trafigi (egress) — eng katta kutilmagan xarajat. 1 TB rasm uzatish S3'da ~$90, R2'da $0. Rasm ko'p bo'lsa **R2**.

R2 va MinIO S3 API bilan mos — yuqoridagi kod o'zgarmaydi, faqat `endpoint` qo'shiladi.

## Muhandislik nuqtai nazari: nima bazaga yoziladi

Bazaga **URL emas, kalit** yoziladi:

```
❌  avatar_url = 'https://cdn.example.com/avatars/12/a1b2.webp'
✅  avatar_key = 'avatars/12/a1b2.webp'
```

Sabab: CDN domeni o'zgarishi mumkin (provayder almashtirish, domen ko'chirish). Kalit bilan bitta muhit o'zgaruvchisini o'zgartirasiz; URL bilan — million qatorni.

Yana bir jadval kerak bo'ladi:

| Ustun | Nima uchun |
| --- | --- |
| `key` | S3 kaliti |
| `original_name` | Yuklashda ko'rsatiladi |
| `content_type` | Qayta tekshirish uchun |
| `size` | Kvota hisobi |
| `checksum` | Takrorlangan faylni aniqlash |
| `status` | `pending` / `ready` — tasdiqlanmagan yuklashlar |
| `created_at` | Tozalash uchun |

`status` muhim: presigned URL berildi, lekin foydalanuvchi yuklamadi — bazada osilgan qator qoladi. Kunlik cron `pending` va 24 soatdan eski qatorlarni o'chiradi (36-bob).

## Tipik xatolar

| Xato | Oqibat | To'g'ri yechim |
| --- | --- | --- |
| `public/uploads/` ga yozish | Productionda yo'qoladi | Obyekt saqlash |
| Kalitni klientdan olish | Yo'l bo'ylab chiqish (path traversal) | Serverda `randomUUID()` |
| `file.type` ga ishonish | Zararli fayl "rasm" bo'lib kiradi | Sehrli baytlar |
| `ContentLength` ni imzoga qo'shmaslik | Foydalanuvchi 10 GB yuklaydi | `ContentLength` bering |
| Presigned URL'ni uzoq muddatga | Havola tarqaladi | 60 s (yuklash), 300 s (yuklab olish) |
| Yuklanganini tasdiqlamaslik | Bazada bo'sh havolalar | `HeadObject` + `status` |
| Faylni Next orqali oqizish | Funksiya vaqti va trafik | `redirect` presigned URL'ga |
| `remotePatterns: hostname: '**'` | Ochiq rasm proksisi | Aniq domen |
| Bazaga to'liq URL yozish | Domen o'zgarsa hammasi buziladi | Kalit yozing |
| Maxfiy faylga 403 | Fayl borligi bilinadi | 404 |
| Ruxsat tekshirmasdan URL berish | Har kim har faylni ko'radi | Egalik tekshiruvi |

## Amaliyot

1. R2 yoki MinIO bucket yarating va presigned PUT bilan rasm yuklang.
2. `createUploadUrl` ga 100 MB hajm bering — validatsiya rad etishini tasdiqlang.
3. Presigned URL'ni oling va boshqa hajmdagi fayl yuklashga urinib ko'ring — S3 rad etishi kerak (`ContentLength` imzoda).
4. `.jpg` kengaytmali, lekin ichi HTML bo'lgan fayl yuklang — sehrli baytlar tekshiruvi ushlashi kerak.
5. Maxfiy hujjat uchun Route Handler yozing va boshqa foydalanuvchi sifatida ochishga urinib ko'ring.
6. Presigned URL muddati tugaguncha kuting va yana ishlatib ko'ring — 403 kelishi kerak.
7. `next/image` bilan avatar ko'rsating; Network panelida AVIF/WebP qaytayotganini tekshiring.

## Rasmiy hujjat

- `next/image`: <https://nextjs.org/docs/app/api-reference/components/image>
- Rasm optimizatsiyasi: <https://nextjs.org/docs/app/getting-started/images>
- Server Actions hajmi: <https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions>
- S3 presigned URL: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html>
- Cloudflare R2: <https://developers.cloudflare.com/r2/api/s3/presigned-urls/>
