import type { SdkEventHandler } from './types.ts'

export function mergeEventHandlers(
    global: SdkEventHandler | undefined,
    local: SdkEventHandler | undefined,
): SdkEventHandler | undefined {
    if (global === undefined) return local
    if (local === undefined) return global
    return (event, data) => {
        global(event, data)
        local(event, data)
    }
}
