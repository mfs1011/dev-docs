import { countItems } from '@/entities/cart/model/cart'
export const Header = () => `<header>Savat: ${countItems()}</header>`
