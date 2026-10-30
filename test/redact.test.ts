import { describe, expect, it } from 'vitest'
import { createRedactor, REDACTED, TRUNCATED } from '../src/redact.ts'

describe('createRedactor', () => {
    const redact = createRedactor()

    it('keeps a shared non-circular reference intact', () => {
        const shared = { id: 1 }
        expect(redact({ a: shared, b: shared })).toEqual({ a: { id: 1 }, b: { id: 1 } })
    })

    it('truncates real cycles', () => {
        const node: Record<string, unknown> = { name: 'x' }
        node.self = node
        expect(redact(node)).toEqual({ name: 'x', self: TRUNCATED })
    })

    it('redacts sensitive keys including pwd, jwt, auth, otp, signature', () => {
        const result = redact({ pwd: 1, jwt: 2, authHeader: 3, otp: 4, userOtp: 5, signature: 6, password: 7, ok: 8 })
        expect(result).toEqual({
            pwd: REDACTED,
            jwt: REDACTED,
            authHeader: REDACTED,
            otp: REDACTED,
            userOtp: REDACTED,
            signature: REDACTED,
            password: REDACTED,
            ok: 8,
        })
    })

    it('does not flag obvious false positives', () => {
        expect(redact({ author: 'a', footprint: 'b', hotpink: 'c' })).toEqual({
            author: 'a',
            footprint: 'b',
            hotpink: 'c',
        })
    })

    it('redacts bearer and basic values anywhere in a string', () => {
        expect(redact('Authorization: Bearer abc.def')).toBe(`Authorization: Bearer ${REDACTED}`)
        expect(redact('sent basic dXNlcjpwYXNz now')).toBe(`sent basic ${REDACTED} now`)
    })

    it('redacts token=/password= outside a query string', () => {
        expect(redact('failed token=abc123 retry')).toBe(`failed token=${REDACTED} retry`)
        expect(redact('password: hunter2')).toBe(`password: ${REDACTED}`)
    })

    it('redacts query secrets', () => {
        expect(redact('/x?api_key=abc&a=1')).toBe(`/x?api_key=${REDACTED}&a=1`)
    })

    it('redacts bare JWTs', () => {
        expect(redact('got eyJhbGciOi.eyJzdWIiOiIx.sig_-x here')).toBe(`got ${REDACTED} here`)
    })

    it('redacts extra keys, errors and maps', () => {
        const custom = createRedactor(['iban'])
        expect(custom({ iban: 'x', err: new Error('token=zzz'), m: new Map([['secret', 1]]) })).toEqual({
            iban: REDACTED,
            err: { name: 'Error', message: `token=${REDACTED}` },
            m: { secret: REDACTED },
        })
    })
})
