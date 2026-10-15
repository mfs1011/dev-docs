import { Button } from '@/shared/ui'
export function WishlistButton(productId: number): string {
  return Button(`♥ ${productId}`)
}
