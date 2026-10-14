import { get } from '@/shared/api'
import { Header } from '@/widgets/header'
import { ProductList } from '@/widgets/product-list'
import { AddToCartButton } from '@/features/add-to-cart'
import { ProductCard } from '@/entities/product'
export const CartPage = async () => Header() + ProductList(await get('/tavsiya')) + String(AddToCartButton) + String(ProductCard)
