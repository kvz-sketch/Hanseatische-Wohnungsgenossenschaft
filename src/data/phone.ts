/** Normalise a German phone number to E.164, or null when it can't be one. */
export function toE164(input: string): string | null {
  const raw = input.trim()
  const digits = raw.replace(/\D/g, '')
  if (digits.length < 6) return null
  let n = raw.startsWith('+')
    ? digits
    : digits.startsWith('00')
      ? digits.slice(2)
      : digits.startsWith('49') && digits.length >= 12
        ? digits
        : '49' + digits.replace(/^0+/, '')
  if (n.startsWith('49')) n = '49' + n.slice(2).replace(/^0+/, '')
  if (n.length < 7 || n.length > 15) return null
  return '+' + n
}
