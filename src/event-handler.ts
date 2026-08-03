import type { SdkEvent, SdkEventHandler } from './types.ts'
import type { SdkHooksInstance } from './hooks.ts'

export function resolveEventHandler(
    local: SdkEventHandler | undefined,
    global: SdkHooksInstance,
): SdkEventHandler {
    if (local !== undefined) return local

    return (event: SdkEvent, data?: unknown) => {
        void global.callHook(event, data)
    }
}
