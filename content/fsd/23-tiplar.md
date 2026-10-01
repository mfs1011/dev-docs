# 23 — Tiplar va validatsiya

[← Oldingi: Autentifikatsiya](22-autentifikatsiya.md) · [Mundarija](README.md) · [Keyingi: Layout'lar →](24-layoutlar.md)

## Qisqacha

Tiplar ham kod — ular ham **ishlatiladigan joy yonida** yashaydi. `shared/types` papkasi yoki `types` segmenti yaratmang: "tip bo'lish" — kodni qidirishda foydasiz xususiyat (xuddi `components`, `hooks` kabi). Backend javob tiplari (DTO) — so'rov funksiyasi yonida; mapper'lar — DTO yonida; forma sxemalari — forma yonida; props tiplari — komponent faylida.

## Qoida

| Tip turi | Qayerda |
| --- | --- |
| **Utility tiplar** (`ArrayValues<T>`) | `type-fest` kutubxonasi yoki `shared/lib/<nom>`; yoki ishlatiladigan joy yonida — har biri ham `shared` shart emas |
| **Biznes entity tiplari** | So'rovlar `shared/api`'da bo'lsa — o'sha yerda (bir-biriga ishora qilish oson). Entity'da bo'lsa — `@x` yoki parametrlangan tip |
| **DTO** | Backend tiplari alohida paketda bo'lsa — o'sha paketdan; aks holda so'rov funksiyasi yonida |
| **Mapper'lar** | DTO yonida (`shared/api` yoki `entities/x/api`) |
| **Global tiplar** (loyihaga bog'liq emas) | `shared/<maqsad>` — masalan `shared/analytics` |
| **Ilovani biladigan tiplar** (Redux `RootState`) | `app/store`'da `declare type` — `shared` va `app` orasida ongli yashirin bog'liqlik |
| **Enum'lar** | Ishlatiladigan joyga eng yaqin; segment — mazmuniga qarab (toast pozitsiyasi → `ui`, yuklanish holati → `api`/`model`) |
| **Backend javobini tekshiruvchi sxema** | So'rov funksiyasi yonida (odatda `api`) |
| **Forma sxemasi** | Forma yonida: `ui` yoki `model` |
| **Props / kontekst tiplari** | Komponent bilan bir faylda; Vue/Svelte'da kerak bo'lsa yonidagi `.ts` |
| **Ambient `.d.ts`** (tipsiz paketlar) | `shared/lib/untyped-packages/<paket>.d.ts` + bo'sh `index.ts` (`export {}`) — Steiger `shared/lib` ichidagi har papkadan public API talab qiladi (tekshirilgan) |
| **Generatsiya qilingan tiplar** (OpenAPI) | `shared/api/openapi` + README: qanday generatsiya qilinadi |

## Shablon

```text
shared/api/
├── songs.ts            SongDTO, Song, adaptSongDTO(), listSongs()   — hammasi bir faylda
├── artists.ts          ArtistDTO …                                  — songs.ts uni import qila oladi
└── openapi/
    ├── schema.d.ts     (generatsiya)
    └── README.md       "npm run gen:api — openapi-typescript bilan"
shared/lib/untyped-packages/
└── some-legacy-lib.d.ts

pages/sign-in/
├── ui/RegisterForm.tsx
└── model/registration-schema.ts   z.object({…}) — forma sxemasi
```

## Kod: DTO, mapper va sxema

::: react
```ts
// shared/api/songs.ts — DTO, domen tipi, mapper va so'rov yonma-yon
import { z } from 'zod'
import { client } from './client'

const SongDtoSchema = z.object({ id: z.number(), title: z.string(), disc_no: z.number() })
type SongDto = z.infer<typeof SongDtoSchema>

export interface Song { id: string; title: string; fullTitle: string }

function adaptSongDto(dto: SongDto): Song {
  return { id: String(dto.id), title: dto.title, fullTitle: `${dto.disc_no} / ${dto.title}` }
}

export async function listSongs(): Promise<Song[]> {
  const data = await client.get<unknown>('/songs')
  return z.array(SongDtoSchema).parse(data).map(adaptSongDto)   // backend shartnomasi buzilsa — shu yerda xato
}

// pages/home/ui/RecentActions.tsx — props tipi komponent faylida
interface RecentActionsProps { actions: Array<{ id: string; text: string }> }
export function RecentActions({ actions }: RecentActionsProps) { /* … */ }
```
:::

::: vue
```ts
// shared/api/songs.ts — DTO, domen tipi, mapper va so'rov yonma-yon
import { z } from 'zod'
import { client } from './client'

const SongDtoSchema = z.object({ id: z.number(), title: z.string(), disc_no: z.number() })
type SongDto = z.infer<typeof SongDtoSchema>

export interface Song { id: string; title: string; fullTitle: string }

function adaptSongDto(dto: SongDto): Song {
  return { id: String(dto.id), title: dto.title, fullTitle: `${dto.disc_no} / ${dto.title}` }
}

export async function listSongs(): Promise<Song[]> {
  const data = await client.get<unknown>('/songs')
  return z.array(SongDtoSchema).parse(data).map(adaptSongDto)
}

// pages/home/ui/RecentActions.vue — props tipi komponent ichida
// <script setup lang="ts">
// defineProps<{ actions: Array<{ id: string; text: string }> }>()
// </script>
```
:::

::: angular
```ts
// shared/api/songs-api.ts — DTO, domen tipi, mapper va so'rov yonma-yon
import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { map } from 'rxjs'
import { z } from 'zod'

const SongDtoSchema = z.object({ id: z.number(), title: z.string(), disc_no: z.number() })
type SongDto = z.infer<typeof SongDtoSchema>

export interface Song { id: string; title: string; fullTitle: string }

const adaptSongDto = (dto: SongDto): Song =>
  ({ id: String(dto.id), title: dto.title, fullTitle: `${dto.disc_no} / ${dto.title}` })

@Injectable({ providedIn: 'root' })
export class SongsApi {
  private readonly http = inject(HttpClient)
  list() {
    return this.http.get<unknown>('/songs').pipe(map((d) => z.array(SongDtoSchema).parse(d).map(adaptSongDto)))
  }
}
```
:::

## Qachon / qachon emas

| Savol | Javob |
| --- | --- |
| `Song` tipi `Artist`'ga ishora qiladi | So'rovlar `shared/api`'da — oddiy import; entity'larda — `@x` yoki `Song<TArtist>` |
| Javob ichida bir nechta entity (ichma-ich DTO) | Normalizatsiya (normalizr) va `@x` — ular birga refaktoring qilinadi |
| `Cart = { items: Product[] }` | Parametrlash oson: `Cart<TItem>` |
| Har joyda ishlatiladigan `Nullable<T>` | `type-fest` yoki `shared/lib` |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `shared/types/index.ts` | Bog'liq bo'lmagan narsalar bir joyda | Ishlatiladigan joy yonida |
| `model/types.ts` — slice'ning hamma tiplari | Domenlar aralashadi | `model/song.ts` |
| DTO to'g'ridan-to'g'ri UI'da | Backend nomlari (`disc_no`) komponentlarga tarqaladi | Mapper |
| Backend javobi `as Song` bilan | Xato yashirinadi, keyin uzoqda portlaydi | Sxema bilan parse |
| Generatsiya qilingan tiplar README'siz | Qanday yangilanishi noma'lum | `openapi/README.md` |

## Manbalar

- Rasmiy: *Types* <https://feature-sliced.design/docs/guides/examples/types>
- Saytda: [Arxitektura 12-bob — Tiplar orqali dizayn](../arxitektura/12-tiplar.md), [Arxitektura 68-bob — Model mos kelmasligi](../arxitektura/68-model-mos-kelmasligi.md)
