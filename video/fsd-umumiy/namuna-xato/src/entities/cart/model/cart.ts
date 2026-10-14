import type { Product } from '@/entities/product'
const items: Product[] = []
export const addItem = (p: Product) => items.push(p)
export const countItems = () => items.length
