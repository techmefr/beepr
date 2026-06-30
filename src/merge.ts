import type { PilotaEventHandler } from './types.ts'

export function mergeEventHandlers(
    global: PilotaEventHandler | undefined,
    local: PilotaEventHandler | undefined,
): PilotaEventHandler | undefined {
    if (global === undefined) return local
    if (local === undefined) return global
    return (event, data) => {
        global(event, data)
        local(event, data)
    }
}
