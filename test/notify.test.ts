import { describe, expect, it, vi } from 'vitest'
import { createNotify } from '../src/notify.ts'

describe('createNotify', () => {
    it('dispatches request, success, error and data events to the matching handlers', () => {
        const onRequest = vi.fn()
        const onSuccess = vi.fn()
        const onError = vi.fn()
        const onData = vi.fn()

        const notify = createNotify({ onRequest, onSuccess, onError, onData })

        notify('request', { resource: 'users', payload: {} })
        notify('success', { ok: true })
        notify('error', { message: 'boom', errors: { email: ['required'] } })
        notify('data', { eventType: 'INSERT' })

        expect(onRequest).toHaveBeenCalledWith({ resource: 'users', payload: {} })
        expect(onSuccess).toHaveBeenCalledWith({ ok: true })
        expect(onError).toHaveBeenCalledWith({ message: 'boom', errors: { email: ['required'] } })
        expect(onData).toHaveBeenCalledWith({ eventType: 'INSERT' })
    })

    it('dispatches connected and disconnected events to onConnected / onDisconnected', () => {
        const onConnected = vi.fn()
        const onDisconnected = vi.fn()

        const notify = createNotify({ onConnected, onDisconnected })

        notify('connected', { resource: 'messages' })
        notify('disconnected', { resource: 'messages' })

        expect(onConnected).toHaveBeenCalledWith({ resource: 'messages' })
        expect(onDisconnected).toHaveBeenCalledWith({ resource: 'messages' })
    })

    it('dispatches complete events to onComplete', () => {
        const onComplete = vi.fn()
        const notify = createNotify({ onComplete })

        notify('complete', { resource: 'messages' })

        expect(onComplete).toHaveBeenCalledWith({ resource: 'messages' })
    })

    it('redacts the complete payload', () => {
        const onComplete = vi.fn()
        const notify = createNotify({ onComplete })

        notify('complete', { token: 't', v: 1 })

        expect(onComplete).toHaveBeenCalledWith({ token: '[redacted]', v: 1 })
    })

    it('does not throw when no handler is registered for an event', () => {
        const notify = createNotify({})
        expect(() => notify('connected', {})).not.toThrow()
        expect(() => notify('disconnected', {})).not.toThrow()
        expect(() => notify('complete', {})).not.toThrow()
    })
})

describe('createNotify redaction', () => {
    it('redacts request payload, error message and data before the adapter', () => {
        const onRequest = vi.fn()
        const onError = vi.fn()
        const onData = vi.fn()
        const notify = createNotify({ onRequest, onError, onData })

        notify('request', { resource: 'users', payload: { password: 'x', name: 'n' } })
        notify('error', { message: 'bad token=abc', errors: { f: ['Bearer zzz'] } })
        notify('data', { token: 't', v: 1 })

        expect(onRequest).toHaveBeenCalledWith({ resource: 'users', payload: { password: '[redacted]', name: 'n' } })
        expect(onError).toHaveBeenCalledWith({ message: 'bad token=[redacted]', errors: { f: ['[redacted]'] } })
        expect(onData).toHaveBeenCalledWith({ token: '[redacted]', v: 1 })
    })

    it('keeps validation messages under a sensitive field name as a string array', () => {
        const onError = vi.fn()
        createNotify({ onError })('error', {
            message: 'Invalid',
            errors: { password: ['too short', 'needs a digit'], token: ['expired'], email: ['required'] },
        })
        expect(onError).toHaveBeenCalledWith({
            message: 'Invalid',
            errors: { password: ['too short', 'needs a digit'], token: ['expired'], email: ['required'] },
        })
    })

    it('still masks secrets found inside validation messages', () => {
        const onError = vi.fn()
        const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.c2lnbmF0dXJl'
        createNotify({ onError })('error', {
            message: 'Invalid',
            errors: { password: [`bad ${jwt}`, 'Bearer abc', 'token=xyz'] },
        })
        expect(onError).toHaveBeenCalledWith({
            message: 'Invalid',
            errors: { password: ['bad [redacted]', '[redacted]', 'token=[redacted]'] },
        })
    })

    it('still masks sensitive keys elsewhere in an error payload', () => {
        const onError = vi.fn()
        createNotify({ onError })('error', { message: 'x', errors: { a: ['b'] }, password: 'p' })
        expect(onError).toHaveBeenCalledWith({ message: 'x', errors: { a: ['b'] } })
    })

    it('passes raw data when redaction is disabled', () => {
        const onData = vi.fn()
        createNotify({ onData }, { redact: false })('data', { token: 't' })
        expect(onData).toHaveBeenCalledWith({ token: 't' })
    })

    it('honours extra redact keys', () => {
        const onData = vi.fn()
        createNotify({ onData }, { redactKeys: ['iban'] })('data', { iban: 'x' })
        expect(onData).toHaveBeenCalledWith({ iban: '[redacted]' })
    })
})
