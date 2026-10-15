import { post } from '@/shared/api'
export const applyPromoCode = (code: string): Promise<Response> => post('/cart/promo', { code })
