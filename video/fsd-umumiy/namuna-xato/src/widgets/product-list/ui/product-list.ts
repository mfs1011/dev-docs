import { ProductCard, type Product } from '@/entities/product'
import { AddToCartButton } from '@/features/add-to-cart'
export const ProductList = (list: Product[]) => list.map((p) => ProductCard(p) + AddToCartButton(p)).join('')
