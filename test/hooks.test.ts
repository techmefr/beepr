import { describe, expect, it, vi } from 'vitest'
import { resolveEventHandler } from '../src/index.ts'

function createHooks() {
    const listeners = new Map<string, Array<(data?: unknown) => void>>()
    return {
        hook: (event: string, listener: (data?: unknown) => void) => {
            listeners.set(event, [...(listeners.get(event) ?? []), listener])
        },
        callHook: async (event: string, data?: unknown) => {
            for (const listener of listeners.get(event) ?? []) listener(data)
        },
    }
}

describe('resolveEventHandler — local priority', () => {
    it('returns the local handler directly when provided', () => {
        const hooks = createHooks()
        const local = vi.fn()

        const handler = resolveEventHandler(local, hooks)
        expect(handler).toBe(local)
    })

    it('calls global hooks when no local handler is provided', async () => {
        const hooks = createHooks()
        const globalSpy = vi.fn()

        hooks.hook('request', globalSpy)
        const handler = resolveEventHandler(undefined, hooks)
        handler('request', { payload: 1 })

        await new Promise(r => setTimeout(r, 10))
        expect(globalSpy).toHaveBeenCalledWith({ payload: 1 })
    })

    it('does NOT call global hooks when a local handler is provided', async () => {
        const hooks = createHooks()
        const globalSpy = vi.fn()
        const local = vi.fn()

        hooks.hook('request', globalSpy)
        const handler = resolveEventHandler(local, hooks)
        handler('request', {})

        await new Promise(r => setTimeout(r, 10))
        expect(local).toHaveBeenCalled()
        expect(globalSpy).not.toHaveBeenCalled()
    })
})
