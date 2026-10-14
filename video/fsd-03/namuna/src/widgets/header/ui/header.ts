import { CurrentUserMenu } from '@/features/auth'
import { CartCounter } from '@/entities/cart'
import { Logo } from '@/shared/ui'
export function Header(): string {
  return `<header>${Logo()}${CartCounter()}${CurrentUserMenu()}</header>`
}
