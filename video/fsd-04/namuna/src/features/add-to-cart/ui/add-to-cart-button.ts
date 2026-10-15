import { Button } from '@/shared/ui'
import { addToCart } from '../api/add-to-cart'
export function AddToCartButton(productId: number): string {
  void addToCart
  return Button(`Savatga (${productId})`)
}
