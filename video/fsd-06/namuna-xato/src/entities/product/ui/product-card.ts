import { formatPrice } from '../lib/format-price'
import type { Product } from '../model/product'
export function ProductCard(product: Product): string {
  return `<article><h3>${product.title}</h3><p>${formatPrice(product.price)}</p></article>`
}
