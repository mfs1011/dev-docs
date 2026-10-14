import type { Product } from '../model/types'
export const ProductCard = (p: Product) => `<div>${p.nomi} — ${p.narxi}</div>`
