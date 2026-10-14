import type { Product } from '../model/types'
import { AddToCartButton } from '@/features/add-to-cart'
export const ProductCard = (p: Product) => `<div>${p.nomi} — ${p.narxi}</div>` + AddToCartButton(p)
