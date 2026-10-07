import { reactive, watch } from 'vue'
import '@/progress'
import '@/settings'
import { syncedMaps } from '@/store'

/**
 * Akkaunt va shaxsiy holatni qurilmalar o'rtasida sinxronlash (Supabase):
 * o'qish belgilari, o'qilgan boblar, tema va kod varianti (`store.js` xaritalari).
 *
 * Akkaunt ixtiyoriy: kirmagan o'quvchi uchun hamma narsa `localStorage`da qoladi.
 * SDK (~50 KB) faqat kerak bo'lganda yuklanadi — "Kirish" bosilganda, saqlangan
 * sessiya bo'lsa yoki GitHub'dan `?code=` bilan qaytilganda.
 *
 * Ziddiyat: har yozuvda `at` vaqti bor, eng yangisi yutadi. Serverda ham shu
 * qoida bor (trigger eski yozuvni yangisining ustiga yozdirmaydi) — ikki qurilma
 * bir vaqtda yozsa ham natija bir xil.
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const STORAGE_KEY = 'docs-auth'
const TABLE = 'user_state'

/** `.env`da kalitlar bo'lmasa — akkaunt tugmasi ham ko'rinmaydi */
export const syncEnabled = Boolean(SUPABASE_URL && SUPABASE_KEY)

/** Kirish usullari. Qaysilari yoqilgani — `VITE_AUTH_PROVIDERS` (Supabase'da ham yoqilgan bo'lishi kerak) */
const PROVIDER_LABELS = { github: 'GitHub', google: 'Google' }

export const providers = (import.meta.env.VITE_AUTH_PROVIDERS || 'github,google')
  .split(',')
  .map((id) => id.trim())
  .filter((id) => PROVIDER_LABELS[id])
  .map((id) => ({ id, label: PROVIDER_LABELS[id] }))

/** status: idle | syncing | synced | offline | error */
export const account = reactive({ user: null, status: 'idle', error: null })

let clientPromise = null
/** Serverdagi har yozuvning `at` qiymati (`<xarita>:<kalit>` bo'yicha) — nima yuborilishi kerakligini shundan bilamiz */
let server = {}
let pushTimer = null

function client() {
  clientPromise ??= import('@supabase/supabase-js').then(({ createClient }) => {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { flowType: 'pkce', storageKey: STORAGE_KEY, persistSession: true, detectSessionInUrl: true },
    })

    supabase.auth.onAuthStateChange((event, session) => {
      account.user = session?.user ? userInfo(session.user) : null

      if (!session) {
        server = {}
        account.status = 'idle'
        return
      }

      // Callback ichida Supabase so'rovini kutib bo'lmaydi (SDK qulflanadi) — keyingi taktga suramiz
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') setTimeout(pull, 0)
    })

    return supabase
  })

  return clientPromise
}

function userInfo(user) {
  const meta = user.user_metadata ?? {}

  return {
    id: user.id,
    name: meta.full_name ?? meta.name ?? meta.user_name ?? 'Foydalanuvchi',
    login: meta.user_name ?? null,
    email: user.email ?? null,
    avatar: meta.avatar_url ?? meta.picture ?? null,
    createdAt: user.created_at ?? null,
    // Bitta akkauntga ulangan kirish usullari (GitHub + Google bo'lishi mumkin)
    providers: (user.identities ?? []).map((identity) => identity.provider),
  }
}

const iso = (value) => new Date(value).toISOString()

/** Hamma xaritalardagi yozuvlar: [`<xarita>:<kalit>`, xarita, kalit, yozuv] */
function localEntries() {
  return Object.entries(syncedMaps).flatMap(([name, map]) =>
    Object.entries(map).map(([key, entry]) => [`${name}:${key}`, map, key, entry]),
  )
}

function toRow(id, entry) {
  const { at, cleared, ...data } = entry

  return { user_id: account.user.id, key: id, value: cleared ? null : data, updated_at: at }
}

function fromRow(row) {
  const at = iso(row.updated_at)

  return row.value ? { ...row.value, at } : { cleared: true, at }
}

/** Serverdan hammasini olib, yangisini lokalga yozadi; keyin lokalda yangiroq bo'lganini yuboradi */
async function pull() {
  if (!account.user) return

  account.status = 'syncing'

  try {
    const supabase = await client()
    const { data, error } = await supabase.from(TABLE).select('key, value, updated_at')

    if (error) throw error

    server = {}

    for (const row of data) {
      const separator = row.key.indexOf(':')
      const map = syncedMaps[row.key.slice(0, separator)]
      const key = row.key.slice(separator + 1)

      // Ilovaning yangi versiyasi yozgan, bu versiya bilmaydigan xarita — tegmaymiz
      if (separator < 0 || !map) continue

      const remote = fromRow(row)
      const local = map[key]

      server[row.key] = remote.at
      if (!local || remote.at > local.at) map[key] = remote
    }

    await push()
  } catch (error) {
    fail(error)
  }
}

async function push() {
  if (!account.user) return

  const pending = localEntries().filter(([id, , , entry]) => entry?.at && entry.at !== server[id])

  if (pending.length === 0) {
    account.status = 'synced'
    return
  }

  account.status = 'syncing'

  try {
    const supabase = await client()
    const { error } = await supabase
      .from(TABLE)
      .upsert(pending.map(([id, , , entry]) => toRow(id, entry)), { onConflict: 'user_id,key' })

    if (error) throw error

    for (const [id, , , entry] of pending) server[id] = entry.at
    account.status = 'synced'
    account.error = null
  } catch (error) {
    fail(error)
  }
}

function fail(error) {
  // Yuborilmaganlar `server`da belgilanmagan — internet qaytganda yana urinamiz
  account.status = navigator.onLine ? 'error' : 'offline'
  account.error = error?.message ?? String(error)
}

function hasStoredSession() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null
  } catch {
    return false
  }
}

function isAuthCallback() {
  const params = new URLSearchParams(window.location.search)

  return params.has('code') || params.has('error_description')
}

export function initSync() {
  if (!syncEnabled || typeof window === 'undefined') return

  if (hasStoredSession() || isAuthCallback()) client()

  watch(
    () => Object.values(syncedMaps),
    () => {
      if (!account.user) return

      clearTimeout(pushTimer)
      pushTimer = setTimeout(push, 800)
    },
    { deep: true },
  )

  // Boshqa qurilmada qo'yilgan belgi — tabga qaytilganda olinadi
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') pull()
  })
  window.addEventListener('online', pull)
}

/** Kirgandan keyin shu sahifaga qaytamiz (`#belgi` kabi langarsiz) */
const returnUrl = () => window.location.href.split('#')[0]

/**
 * Kirish va ro'yxatdan o'tish bitta amal: birinchi kirishda akkaunt o'zi yaratiladi.
 * Email bir xil bo'lsa (GitHub va Google), Supabase ikkalasini bitta akkauntga bog'laydi.
 */
export async function signIn(provider = 'github') {
  const supabase = await client()
  const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: returnUrl() } })

  if (error) fail(error)
}

/** Kirgan akkauntga yana bir kirish usulini ulash (email har xil bo'lsa ham) */
export async function linkProvider(provider) {
  const supabase = await client()
  const { error } = await supabase.auth.linkIdentity({ provider, options: { redirectTo: returnUrl() } })

  if (error) throw error
}

export async function signOut() {
  const supabase = await client()

  // Belgilar shu qurilmada qoladi — faqat sinxronlash to'xtaydi
  await supabase.auth.signOut()
}

/** Serverdagi hamma ma'lumot va akkauntning o'zi o'chiriladi; shu qurilmadagi nusxa qoladi */
export async function deleteAccount() {
  const supabase = await client()
  const { error } = await supabase.rpc('delete_my_account')

  if (error) throw error

  // Akkaunt yo'q — server bilan chiqish shart emas, faqat lokal sessiyani tozalaymiz
  await supabase.auth.signOut({ scope: 'local' })
}

/** Shu brauzerdagi hamma shaxsiy ma'lumot — JSON yuklab olish uchun */
export function exportData() {
  return {
    exportedAt: new Date().toISOString(),
    user: account.user ? { login: account.user.login, email: account.user.email } : null,
    ...Object.fromEntries(Object.entries(syncedMaps).map(([name, map]) => [name, { ...map }])),
  }
}
