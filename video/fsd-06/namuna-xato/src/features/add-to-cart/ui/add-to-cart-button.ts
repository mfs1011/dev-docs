import { Button } from '@/shared/ui'
import { addToCart } from '@/features/add-to-cart'
export function AddToCartButton(productId: number): string {
  void addToCart
  return Button(`Savatga (${productId})`)
}
