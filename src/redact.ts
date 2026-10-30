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
]

export const REDACTED = '[redacted]'
export const TRUNCATED = '[truncated]'
export const UNREADABLE = '[unreadable]'

const MAX_DEPTH = 8

const BEARER_VALUE = /^\s*(bearer|basic)\s+\S+/i
const SENSITIVE_QUERY = /([?&](?:[\w-]*(?:token|secret|password|passwd|apikey|api_key|key)[\w-]*)=)[^&\s#]+/gi

const simplify = (name: string): string => name.toLowerCase().replace(/[^a-z0-9]/g, '')

function scrub(value: string): string {
    if (BEARER_VALUE.test(value)) return REDACTED
    return value.replace(SENSITIVE_QUERY, `$1${REDACTED}`)
}

export function createRedactor(extraKeys: readonly string[] = []): (value: unknown) => unknown {
    const fragments = [...SENSITIVE_FRAGMENTS, ...extraKeys.map(simplify)].filter(fragment => fragment !== '')
    const isSensitive = (key: string): boolean => {
        const simple = simplify(key)
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
        seen.add(value)
        if (Array.isArray(value)) return value.map(item => walk(item, depth + 1, seen))
        if (value instanceof Date) return value
        if (value instanceof Set) return [...value].map(item => walk(item, depth + 1, seen))
        if (value instanceof Error) return { name: value.name, message: scrub(value.message) }
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
