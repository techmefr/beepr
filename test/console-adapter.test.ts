import { afterEach, describe, expect, it, vi } from 'vitest'
import { createConsoleAdapter } from '../src/console-adapter.ts'
import { createNotify } from '../src/notify.ts'

describe('createConsoleAdapter', () => {
    afterEach(() => vi.restoreAllMocks())

    it('routes diagnostic entries to console.warn', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const debug = vi.spyOn(console, 'debug').mockImplementation(() => {})
        createConsoleAdapter().onDebug?.({ channel: 'diagnostic', label: 'l', data: { a: 1 } } as never)
        expect(warn).toHaveBeenCalledWith('[beepr:diagnostic] l', { a: 1 })
        expect(debug).not.toHaveBeenCalled()
    })

    it('implements onDebug only, so notify events print nothing', () => {
        const spies = (['log', 'info', 'warn', 'error', 'debug'] as const).map(name =>
            vi.spyOn(console, name).mockImplementation(() => {}),
        )
        const adapter = createConsoleAdapter()
        expect(Object.keys(adapter)).toEqual(['onDebug'])
        const notify = createNotify(adapter)
        notify('success', { a: 1 })
        notify('error', { message: 'boom', errors: { f: ['x'] } })
        for (const spy of spies) expect(spy).not.toHaveBeenCalled()
    })

    it('routes other channels to console.debug', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const debug = vi.spyOn(console, 'debug').mockImplementation(() => {})
        createConsoleAdapter().onDebug?.({ channel: 'trace', label: 'l', data: 1 } as never)
        expect(debug).toHaveBeenCalledWith('[beepr:trace] l', 1)
        expect(warn).not.toHaveBeenCalled()
    })
})
