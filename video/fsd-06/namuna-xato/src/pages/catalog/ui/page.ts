import { ProductCard } from '@/entities/product/ui/product-card'
import type { Product } from '@/entities/product'
import type { Order } from '@/entities/order'
import { AddToCartButton } from '@/features/add-to-cart'
import { WishlistButton } from '@/features/wishlist'
export function Page(products: Product[], order?: Order): string {
  return products.map((p) => ProductCard(p) + AddToCartButton(p.id) + WishlistButton(p.id)).join('') + (order?.total ?? '')
}
