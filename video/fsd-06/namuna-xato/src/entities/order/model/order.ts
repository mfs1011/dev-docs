import type { AddToCartButton } from '@/features/add-to-cart'
export interface Order { id: number; total: number; button?: typeof AddToCartButton }
