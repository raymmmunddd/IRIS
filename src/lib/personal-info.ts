function normalizeWhitespace(value: string) {
  return value.normalize("NFC").replace(/\s+/gu, " ").trim()
}

function normalizeTitleCase(value: string) {
  return normalizeWhitespace(value)
    .toLocaleLowerCase("en-PH")
    .replace(/(^|[\s'-])(\p{L})/gu, (_match, separator: string, letter: string) =>
      `${separator}${letter.toLocaleUpperCase("en-PH")}`
    )
}

export function normalizePersonName(value: string) {
  return normalizeTitleCase(value)
}

export function normalizeAddress(value: string) {
  return normalizeTitleCase(value)
}

export function normalizeContact(value: string) {
  const normalized = normalizeWhitespace(value)
  const digits = normalized.replace(/\D/g, "")
  let mobileDigits = digits

  if (digits.startsWith("63") && digits.length === 12) {
    mobileDigits = digits.slice(2)
  } else if (digits.startsWith("0") && digits.length === 11) {
    mobileDigits = digits.slice(1)
  }

  if (mobileDigits.length !== 10 || !mobileDigits.startsWith("9")) {
    return normalized
  }

  return `+63 ${mobileDigits.slice(0, 3)} ${mobileDigits.slice(3, 6)} ${mobileDigits.slice(6)}`
}
