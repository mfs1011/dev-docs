import { get } from '@/shared/api'
import { Header } from '@/widgets/header'
import { ProductList } from '@/widgets/product-list'
export const CatalogPage = async () => Header() + ProductList(await get('/mahsulotlar'))
