export const SENSITIVE_FRAGMENTS: readonly string[] = [
    'password',
    'passwd',
    'secret',
    'token',
    'apikey',
    'authorization',
    'cookie',
    'credential',
    'privatekey',
    'sessionid',
    'bearer',
    'pwd',
    'jwt',
    'auth',
    'otp',
    'signature',
]

export const REDACTED = '[redacted]'
export const TRUNCATED = '[truncated]'
export const UNREADABLE = '[unreadable]'

const MAX_DEPTH = 8

const BEARER_VALUE = /\b(bearer|basic)\s+[\w.~+/=-]+/gi
const SENSITIVE_QUERY = /([?&](?:[\w-]*(?:token|secret|password|passwd|pwd|apikey|api_key|key)[\w-]*)=)[^&\s#]+/gi
const SENSITIVE_ASSIGNMENT = /(\b[\w-]*(?:token|secret|password|passwd|pwd|apikey|api_key)[\w-]*\s*[=:]\s*)[^&\s#,;]+/gi
const JWT_VALUE = /\beyJ[\w-]+\.[\w-]+\.[\w-]+/g
const OTP_KEY = /(?:^|[^a-zA-Z0-9])(?:otp|OTP|Otp)(?:$|[^a-zA-Z0-9]|[A-Z])|[a-z0-9]Otp(?![a-z])|[a-z0-9]OTP/
const WORD_FRAGMENTS = new Set(['otp'])

const simplify = (name: string): string => name.toLowerCase().replace(/[^a-z0-9]/g, '')

const LEADING_CREDENTIAL = /^\s*(bearer|basic)\s+\S+/i

function scrub(value: string): string {
    if (LEADING_CREDENTIAL.test(value)) return REDACTED
    return value
        .replace(BEARER_VALUE, `$1 ${REDACTED}`)
        .replace(JWT_VALUE, REDACTED)
        .replace(SENSITIVE_QUERY, `$1${REDACTED}`)
        .replace(SENSITIVE_ASSIGNMENT, `$1${REDACTED}`)
}

export function createRedactor(extraKeys: readonly string[] = []): (value: unknown) => unknown {
    const fragments = [...SENSITIVE_FRAGMENTS, ...extraKeys.map(simplify)].filter(
        fragment => fragment !== '' && !WORD_FRAGMENTS.has(fragment),
    )
    const isSensitive = (key: string): boolean => {
        if (OTP_KEY.test(key)) return true
        const simple = simplify(key).replace(/author(?!iz)/g, '')
        return fragments.some(fragment => simple.includes(fragment))
    }

    const read = (source: object, key: string): unknown => {
        try {
            return (source as Record<string, unknown>)[key]
        } catch {
            return UNREADABLE
        }
    }

    const walk = (value: unknown, depth: number, seen: WeakSet<object>): unknown => {
        if (typeof value === 'string') return scrub(value)
        if (value === null || typeof value !== 'object') return value
        if (depth >= MAX_DEPTH || seen.has(value)) return TRUNCATED
        if (value instanceof Date) return value
        if (value instanceof Error) return { name: value.name, message: scrub(value.message) }
        seen.add(value)
        try {
            return walkObject(value, depth, seen)
        } finally {
            seen.delete(value)
        }
    }

    const walkObject = (value: object, depth: number, seen: WeakSet<object>): unknown => {
        if (Array.isArray(value)) return value.map(item => walk(item, depth + 1, seen))
        if (value instanceof Set) return [...value].map(item => walk(item, depth + 1, seen))
        const entries: Array<[string, unknown]> =
            value instanceof Map
                ? [...value].map(([key, nested]) => [String(key), nested])
                : Object.keys(value).map(key => [key, read(value, key)])
        const copy: Record<string, unknown> = {}
        for (const [key, nested] of entries) {
            Object.defineProperty(copy, key, {
                value: isSensitive(key) ? REDACTED : walk(nested, depth + 1, seen),
                enumerable: true,
                writable: true,
                configurable: true,
            })
        }
        return copy
    }

    return value => walk(value, 0, new WeakSet())
}
