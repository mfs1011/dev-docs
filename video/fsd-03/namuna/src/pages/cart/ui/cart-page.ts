import { Header } from '@/widgets/header'
import { Sidebar } from '@/widgets/sidebar'
import { CurrentUserMenu } from '@/features/auth'
import { CartCounter } from '@/entities/cart'
export function CartPage(): string {
  return Header() + Sidebar() + CurrentUserMenu() + CartCounter()
}
