import { Button } from '@/shared/ui'
import { WishlistButton } from '@/features/wishlist/ui/wishlist-button'
import { addToCart } from '../api/add-to-cart'
export function AddToCartButton(productId: number): string {
  void addToCart
  return Button(`Savatga (${productId})`) + WishlistButton(productId)
}
