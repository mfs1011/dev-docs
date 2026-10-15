import { applyPromoCode } from '../api/apply-promo-code'
import { isValid } from '../model/promo-code'
import { normalizeCode } from '../lib/normalize-code'
import { MAX_CODE_LENGTH } from '../config/limits'
export function PromoCodeForm(raw: string): string {
  const code = normalizeCode(raw)
  if (isValid(code)) void applyPromoCode(code)
  return `<input maxlength="${MAX_CODE_LENGTH}" value="${code}">`
}
