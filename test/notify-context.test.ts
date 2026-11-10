import { describe, expect, it, vi } from 'vitest'
import { createNotify } from '../src/notify.ts'
import type { ErrorContext, RequestContext, SuccessContext } from '../src/index.ts'

describe('createNotify call context', () => {
    it('gives onRequest and onSuccess the resource and the method', () => {
        const onRequest = vi.fn<(context: RequestContext) => void>()
        const onSuccess = vi.fn<(context: SuccessContext) => void>()
        const notify = createNotify({ onRequest, onSuccess })

        notify('request', { resource: 'users', method: 'get', payload: { token: 't', q: 1 } })
        notify('success', { resource: 'users', method: 'get', data: { id: 1, password: 'p' } })

        expect(onRequest).toHaveBeenCalledWith({ resource: 'users', method: 'get', payload: { token: '[redacted]', q: 1 } })
        expect(onSuccess).toHaveBeenCalledWith({ resource: 'users', method: 'get', data: { id: 1, password: '[redacted]' } })
    })

    it('gives onError the status, the kind, the resource and the method', () => {
        const onError = vi.fn<(error: ErrorContext) => void>()
        createNotify({ onError })('error', {
            message: 'Invalid token=abc',
            status: 422,
            kind: 'http',
            resource: 'users',
            method: 'mutate',
            errors: { password: ['too short'] },
        })
        expect(onError).toHaveBeenCalledWith({
            message: 'Invalid token=[redacted]',
            status: 422,
            kind: 'http',
            resource: 'users',
            method: 'mutate',
            errors: { password: ['too short'] },
        })
    })

    it('passes a timeout with status 0', () => {
        const onError = vi.fn<(error: ErrorContext) => void>()
        createNotify({ onError })('error', { message: 'timeout', status: 0, kind: 'timeout', resource: 'users', method: 'get' })
        const [error] = onError.mock.calls[0]
        expect(error.status).toBe(0)
        expect(error.kind).toBe('timeout')
    })

    it('ignores context fields of the wrong type', () => {
        const onError = vi.fn<(error: ErrorContext) => void>()
        createNotify({ onError })('error', { message: 'x', status: '500', kind: 3, resource: {}, method: null })
        expect(onError.mock.calls[0][0]).toEqual({ message: 'x', errors: undefined })
        expect(Object.keys(onError.mock.calls[0][0]).sort()).toEqual(['errors', 'message'])
    })

    it('keeps a handler typed with the old signatures assignable', () => {
        const legacy = { onSuccess: (data?: unknown) => void data, onError: (error: { message: string }) => void error }
        expect(() => createNotify(legacy)('success', 1)).not.toThrow()
    })

    it('wraps a non-object success payload in data and gives an empty context when it is absent', () => {
        const onSuccess = vi.fn<(context: SuccessContext) => void>()
        const notify = createNotify({ onSuccess })
        notify('success', 1)
        notify('success', ['a'])
        notify('success')
        expect(onSuccess.mock.calls).toEqual([[{ data: 1 }], [{ data: ['a'] }], [{}]])
    })

    it('wraps a non-object request payload in payload and gives an empty context when it is absent', () => {
        const onRequest = vi.fn<(context: RequestContext) => void>()
        const notify = createNotify({ onRequest })
        notify('request', 'raw')
        notify('request', null)
        notify('request')
        expect(onRequest.mock.calls).toEqual([[{ payload: 'raw' }], [{ payload: null }], [{}]])
    })

    it('drops request and success context fields of the wrong type', () => {
        const onRequest = vi.fn<(context: RequestContext) => void>()
        const onSuccess = vi.fn<(context: SuccessContext) => void>()
        const notify = createNotify({ onRequest, onSuccess })
        notify('request', { resource: 1, method: 'get', payload: {} })
        notify('success', { resource: 'users', status: '200', data: 2 })
        expect(onRequest).toHaveBeenCalledWith({ method: 'get', payload: {} })
        expect(onSuccess).toHaveBeenCalledWith({ resource: 'users', data: 2 })
    })
})
