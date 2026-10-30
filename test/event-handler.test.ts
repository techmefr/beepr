import { describe, expect, it, vi } from 'vitest'
import { resolveEventHandler } from '../src/event-handler.ts'
import type { SdkHooksInstance } from '../src/hooks.ts'

describe('resolveEventHandler', () => {
    it('returns the local handler when provided', () => {
        const local = vi.fn()
        const callHook = vi.fn()
        const handler = resolveEventHandler(local, { callHook } as unknown as SdkHooksInstance)
        expect(handler).toBe(local)
        expect(callHook).not.toHaveBeenCalled()
    })

    it('falls back to the global hooks', () => {
        const callHook = vi.fn().mockResolvedValue(undefined)
        const handler = resolveEventHandler(undefined, { callHook } as unknown as SdkHooksInstance)
        handler('success', { ok: true })
        expect(callHook).toHaveBeenCalledWith('success', { ok: true })
    })
})
