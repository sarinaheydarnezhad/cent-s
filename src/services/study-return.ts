// Return only to a concrete reader page, never to an arbitrary supplied URL.
export function studyReturnPath(value: string | null): string | null {
  if (!value) return null
  const match = /^\/student\/study\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\?page=([1-9]\d*)$/i.exec(value)
  if (!match || !Number.isSafeInteger(Number(match[2]))) return null
  return value
}
