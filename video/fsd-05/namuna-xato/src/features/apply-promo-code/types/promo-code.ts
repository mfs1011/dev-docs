export interface PromoCode { code: string }
export const isValid = (code: string): boolean => /^[A-Z0-9]{4,12}$/.test(code)
