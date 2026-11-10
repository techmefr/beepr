import type { ErrorContext, RequestContext, SuccessContext } from './types.ts'

const TYPED_FIELDS: Record<string, string> = {
    resource: 'string',
    method: 'string',
    status: 'number',
    kind: 'string',
}

function normalized(source: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(source)) {
        const expected = TYPED_FIELDS[key]
        if (expected === undefined || typeof value === expected) result[key] = value
    }
    return result
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function withField(value: unknown, field: 'payload' | 'data'): Record<string, unknown> {
    if (value === undefined) return {}
    return isRecord(value) ? normalized(value) : { [field]: value }
}

export function requestContext(value: unknown): RequestContext {
    return withField(value, 'payload') as RequestContext
}

export function successContext(value: unknown): SuccessContext {
    return withField(value, 'data') as SuccessContext
}

export function errorContext(value: unknown, errors: Record<string, string[]> | undefined): ErrorContext {
    const source = isRecord(value) ? normalized(value) : {}
    const context: ErrorContext = { message: typeof source.message === 'string' ? source.message : 'Unknown error', errors }
    for (const key of Object.keys(TYPED_FIELDS)) {
        if (key in source) Object.assign(context, { [key]: source[key] })
    }
    return context
}
