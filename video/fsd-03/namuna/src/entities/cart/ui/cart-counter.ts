import { cart } from '../model/cart'
export function CartCounter(): string {
  return `<span>${cart.count}</span>`
}
