import { afterEach, describe, expect, it, vi } from 'vitest'
import { createConsoleAdapter } from '../src/console-adapter.ts'

describe('createConsoleAdapter', () => {
    afterEach(() => vi.restoreAllMocks())

    it('routes diagnostic entries to console.warn', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const debug = vi.spyOn(console, 'debug').mockImplementation(() => {})
        createConsoleAdapter().onDebug?.({ channel: 'diagnostic', label: 'l', data: { a: 1 } } as never)
        expect(warn).toHaveBeenCalledWith('[beepr:diagnostic] l', { a: 1 })
        expect(debug).not.toHaveBeenCalled()
    })

    it('routes other channels to console.debug', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const debug = vi.spyOn(console, 'debug').mockImplementation(() => {})
        createConsoleAdapter().onDebug?.({ channel: 'trace', label: 'l', data: 1 } as never)
        expect(debug).toHaveBeenCalledWith('[beepr:trace] l', 1)
        expect(warn).not.toHaveBeenCalled()
    })
})
