export function safeReturnTo(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.startsWith('/') || [...value].some(char => char === '\\' || char.charCodeAt(0) <= 32 || char.charCodeAt(0) === 127)) return
  const pathname = value.split(/[?#]/, 1)[0]
  if (value.startsWith('//') || /^\/(?:auth\/google\/callback|login)(?:\/|$)/i.test(pathname)) return
  return value
}
