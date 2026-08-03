import { createHooks } from 'hookable'
import type { SdkEvent } from './types.ts'

export type SdkHookMap = {
    [K in SdkEvent]: (data?: unknown) => void
}

export function createSdkHooks() {
    return createHooks<SdkHookMap>()
}

export type SdkHooksInstance = ReturnType<typeof createSdkHooks>
