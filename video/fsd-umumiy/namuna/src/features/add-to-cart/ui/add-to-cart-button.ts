import { Button } from '@/shared/ui'
import { addItem } from '@/entities/cart'
import type { Product } from '@/entities/product'
export const AddToCartButton = (p: Product) => { addItem(p.id); return Button('Savatga') }
