import { countItems } from '@/entities/cart'
export const Header = () => `<header>Savat: ${countItems()}</header>`
