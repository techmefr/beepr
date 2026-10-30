import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDebug, DebugEnvironmentError, lazy } from '../src/debug.ts'
import { createConsoleAdapter } from '../src/console-adapter.ts'

afterEach(() => vi.restoreAllMocks())

describe('createDebug', () => {
    it('emits entries to adapters when the environment is allowed', () => {
        const onDebug = vi.fn()
        const debug = createDebug({ environment: 'staging', environments: ['development', 'staging'], adapters: [{ onDebug }] })

        debug.state('cart', { size: 3 })

        expect(debug.enabled).toBe(true)
        expect(onDebug).toHaveBeenCalledWith({ channel: 'state', label: 'cart', data: { size: 3 } })
    })

    it('is a no-op outside the allow-list', () => {
        const onDebug = vi.fn()
        const debug = createDebug({ environment: 'production', environments: ['development'], adapters: [{ onDebug }] })

        debug.trace('a')
        debug.state('b')
        debug.diagnostic('c')

        expect(debug.enabled).toBe(false)
        expect(onDebug).not.toHaveBeenCalled()
    })

    it('is disabled by default, without environment or allow-list', () => {
        const onDebug = vi.fn()

        createDebug({ adapters: [{ onDebug }] }).trace('a')
        createDebug({ environment: 'development', adapters: [{ onDebug }] }).trace('a')

        expect(onDebug).not.toHaveBeenCalled()
    })

    it('refuses to be enabled for a production environment', () => {
        expect(() => createDebug({ environment: 'production', environments: ['production'] })).toThrow('production')
        expect(() => createDebug({ environments: [' Prod '] })).toThrow('production')
    })

    it('matches environments ignoring case and surrounding spaces', () => {
        const debug = createDebug({ environment: ' Development ', environments: ['development'] })

        expect(debug.enabled).toBe(true)
    })

    it('does not stop other adapters when one throws, and reports the failure', () => {
        const failure = new Error('boom')
        const onAdapterError = vi.fn()
        const after = vi.fn()
        const debug = createDebug({
            environment: 'development',
            environments: ['development'],
            adapters: [{ onDebug: () => { throw failure } }, { onDebug: after }],
            onAdapterError,
        })

        expect(() => debug.trace('a')).not.toThrow()
        expect(onAdapterError).toHaveBeenCalledWith({ name: 'Error', message: 'boom' })
        expect(after).toHaveBeenCalledTimes(1)
    })

    it('delivers each entry to every adapter in order', () => {
        const calls: string[] = []
        const debug = createDebug({
            environment: 'development',
            environments: ['development'],
            adapters: [{ onDebug: () => calls.push('first') }, { onDebug: () => calls.push('second') }],
        })

        debug.trace('a')

        expect(calls).toEqual(['first', 'second'])
    })

    it('masks sensitive keys, nested and case-insensitive, without mutating the input', () => {
        const onDebug = vi.fn()
        const debug = createDebug({ environment: 'development', environments: ['development'], adapters: [{ onDebug }] })
        const request = { url: '/x', headers: { Authorization: 'Bearer abc', accept: 'json' }, items: [{ token: 't' }] }

        debug.trace('req', request)

        expect(onDebug.mock.calls[0][0].data).toEqual({
            url: '/x',
            headers: { Authorization: '[redacted]', accept: 'json' },
            items: [{ token: '[redacted]' }],
        })
        expect(request.headers.Authorization).toBe('Bearer abc')
    })

    it('masks extra keys given in options and survives circular data', () => {
        const onDebug = vi.fn()
        const debug = createDebug({
            environment: 'development',
            environments: ['development'],
            adapters: [{ onDebug }],
            redact: ['iban'],
        })
        const loop: Record<string, unknown> = { iban: 'FR76' }
        loop.self = loop

        debug.state('acct', loop)

        expect(onDebug.mock.calls[0][0].data).toEqual({ iban: '[redacted]', self: '[truncated]' })
    })

    it('does not evaluate lazy data when disabled and evaluates it once when enabled', () => {
        const compute = vi.fn(() => ({ big: true }))
        const onDebug = vi.fn()

        createDebug({ environment: 'production', environments: ['development'] }).trace('a', lazy(compute))
        expect(compute).not.toHaveBeenCalled()

        createDebug({ environment: 'development', environments: ['development'], adapters: [{ onDebug }] }).trace('a', lazy(compute))
        expect(compute).toHaveBeenCalledTimes(1)
        expect(onDebug.mock.calls[0][0].data).toEqual({ big: true })
    })

    it('refuses production-like environment names', () => {
        for (const name of ['prd', 'live', 'Release', 'prod-eu', 'production_fr']) {
            expect(() => createDebug({ environments: [name] })).toThrow(DebugEnvironmentError)
        }
    })

    it('masks key variants by fragment and sensitive values', () => {
        const onDebug = vi.fn()
        const debug = createDebug({ environment: 'development', environments: ['development'], adapters: [{ onDebug }] })

        debug.trace('x', {
            access_token: 'a',
            clientSecret: 'b',
            'Authorization-Header': 'c',
            privateKey: 'd',
            note: 'Bearer abc.def',
            url: 'https://api.test/x?api_key=zzz&page=2',
            author: 'kept',
        })

        expect(onDebug.mock.calls[0][0].data).toEqual({
            access_token: '[redacted]',
            clientSecret: '[redacted]',
            'Authorization-Header': '[redacted]',
            privateKey: '[redacted]',
            note: '[redacted]',
            url: 'https://api.test/x?api_key=[redacted]&page=2',
            author: 'kept',
        })
    })

    it('does not run a function passed as plain data', () => {
        const spy = vi.fn()
        const onDebug = vi.fn()

        createDebug({ environment: 'development', environments: ['development'], adapters: [{ onDebug }] }).trace('a', spy)

        expect(spy).not.toHaveBeenCalled()
    })

    it('never throws into the caller when the lazy thunk or a getter throws', () => {
        const onAdapterError = vi.fn()
        const onDebug = vi.fn()
        const debug = createDebug({ environment: 'development', environments: ['development'], adapters: [{ onDebug }], onAdapterError })
        const trap = { get boom(): string { throw new Error('getter') }, ok: 1 }

        expect(() => debug.trace('a', lazy(() => { throw new Error('thunk') }))).not.toThrow()
        expect(onAdapterError).toHaveBeenCalledWith({ name: 'Error', message: 'thunk' })

        debug.trace('b', trap)
        expect(onDebug.mock.calls[0][0].data).toEqual({ boom: '[unreadable]', ok: 1 })
    })

    it('keeps delivering when the error reporter itself throws, and reports only name and message', () => {
        const after = vi.fn()
        const debug = createDebug({
            environment: 'development',
            environments: ['development'],
            adapters: [
                { onDebug: () => { throw Object.assign(new Error('x'), { request: { headers: { Authorization: 's' } } }) } },
                { onDebug: after },
            ],
            onAdapterError: failure => {
                expect(Object.keys(failure).sort()).toEqual(['message', 'name'])
                throw new Error('reporter')
            },
        })

        expect(() => debug.trace('a')).not.toThrow()
        expect(after).toHaveBeenCalledTimes(1)
    })

    it('redacts Map, Set and Error values', () => {
        const onDebug = vi.fn()
        const debug = createDebug({ environment: 'development', environments: ['development'], adapters: [{ onDebug }] })

        debug.state('m', { map: new Map<string, unknown>([['password', 'p'], ['a', 1]]), set: new Set([1, 'Bearer zzz']), err: new Error('Bearer q') })

        expect(onDebug.mock.calls[0][0].data).toEqual({
            map: { password: '[redacted]', a: 1 },
            set: [1, '[redacted]'],
            err: { name: 'Error', message: '[redacted]' },
        })
    })

    it('hands adapters a frozen entry', () => {
        const onDebug = vi.fn()
        createDebug({ environment: 'development', environments: ['development'], adapters: [{ onDebug }] }).trace('a')

        expect(Object.isFrozen(onDebug.mock.calls[0][0])).toBe(true)
    })

    it('skips adapters without onDebug', () => {
        const debug = createDebug({ environment: 'development', environments: ['development'], adapters: [{}] })

        expect(() => debug.trace('a')).not.toThrow()
    })
})

describe('createConsoleAdapter', () => {
    it('writes to the console only through an enabled debug channel', () => {
        const log = vi.spyOn(console, 'debug').mockImplementation(() => {})
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

        const allowed = createDebug({ environment: 'development', environments: ['development'], adapters: [createConsoleAdapter()] })
        allowed.trace('t', 1)
        allowed.diagnostic('d', 2)

        const blocked = createDebug({ environment: 'production', environments: ['development'], adapters: [createConsoleAdapter()] })
        blocked.trace('x')

        expect(log).toHaveBeenCalledTimes(1)
        expect(log).toHaveBeenCalledWith('[beepr:trace] t', 1)
        expect(warn).toHaveBeenCalledWith('[beepr:diagnostic] d', 2)
    })

    it('writes the state channel through console.debug', () => {
        const log = vi.spyOn(console, 'debug').mockImplementation(() => {})

        createDebug({ environment: 'development', environments: ['development'], adapters: [createConsoleAdapter()] }).state('cart', 3)

        expect(log).toHaveBeenCalledWith('[beepr:state] cart', 3)
    })
})
