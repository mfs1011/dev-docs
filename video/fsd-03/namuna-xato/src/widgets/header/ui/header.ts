import { CurrentUserMenu } from '@/features/auth'
import { CartCounter } from '@/entities/cart'
import { Sidebar } from '@/widgets/sidebar'
import { HomePage } from '@/pages/home'
export function Header(): string {
  return `<header>${CartCounter()}${CurrentUserMenu()}${Sidebar()}${typeof HomePage}</header>`
}
