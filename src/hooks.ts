import { createHooks } from 'hookable'
import type { PilotaEvent } from './types.ts'

export type PilotaHookMap = {
    [K in PilotaEvent]: (data?: unknown) => void
}

export function createPilotaHooks() {
    return createHooks<PilotaHookMap>()
}

export type PilotaHooksInstance = ReturnType<typeof createPilotaHooks>
