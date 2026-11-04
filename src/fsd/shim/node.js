// `url` va `module` — brauzerda keraklisi
export const fileURLToPath = (u) => String(u).replace(/^file:\/\//, '')
export const pathToFileURL = (p) => new URL('file://' + p)
export const isBuiltin = () => false
export function createRequire() {
  const req = (id) => { throw new Error(`require("${id}") brauzerda yo'q`) }
  req.resolve = (id) => { throw new Error(`"${id}" topilmadi`) }
  return req
}
export default { fileURLToPath, pathToFileURL, isBuiltin, createRequire }
