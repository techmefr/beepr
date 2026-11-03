import type { SdkEvent, SdkEventHandler } from './types.ts'

export interface HookCaller {
    callHook: (event: SdkEvent, data?: unknown) => unknown
}

export function resolveEventHandler(
    local: SdkEventHandler | undefined,
    global: HookCaller,
): SdkEventHandler {
    if (local !== undefined) return local

    return (event: SdkEvent, data?: unknown) => {
        void global.callHook(event, data)
    }
}
