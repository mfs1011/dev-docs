import { applyPromoCode } from '../api/apply-promo-code'
import { isValid } from '../types/promo-code'
import { normalizeCode } from '../utils/normalize-code'
import { MAX_CODE_LENGTH } from '../constants/limits'
export function PromoCodeForm(raw: string): string {
  const code = normalizeCode(raw)
  if (isValid(code)) void applyPromoCode(code)
  return `<input maxlength="${MAX_CODE_LENGTH}" value="${code}">`
}
