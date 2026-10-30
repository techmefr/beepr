import type { SdkNotifyAdapter } from './notify.ts'
import { createRedactor } from './redact.ts'
import type { DebugChannel, DebugEntry } from './types.ts'

export type { DebugChannel, DebugEntry }

const LAZY = Symbol('beepr.lazy')

export type LazyData = { readonly [LAZY]: () => unknown }

export type DebugData = unknown

export type DebugFailure = { name: string; message: string }

export type DebugOptions = {
    environment?: string
    environments?: readonly string[]
    adapters?: readonly SdkNotifyAdapter[]
    redact?: readonly string[]
    onAdapterError?: (failure: DebugFailure) => void
}

export type Debug = {
    readonly enabled: boolean
    trace: (label: string, data?: DebugData) => void
    state: (label: string, data?: DebugData) => void
    diagnostic: (label: string, data?: DebugData) => void
}

export class DebugEnvironmentError extends Error {
    constructor(environment: string) {
        super(`Debug cannot be enabled for the production-like environment "${environment}"`)
        this.name = 'DebugEnvironmentError'
    }
}

const PRODUCTION_LIKE = /^(prod|prd|live|release|stable)/

const normalize = (name: string): string => name.trim().toLowerCase()

export function lazy(resolve: () => unknown): LazyData {
    return { [LAZY]: resolve }
}

const isLazy = (value: unknown): value is LazyData =>
    typeof value === 'object' && value !== null && LAZY in value

const toFailure = (error: unknown): DebugFailure =>
    error instanceof Error
        ? { name: error.name, message: error.message }
        : { name: 'Error', message: String(error) }

export function createDebug(options: DebugOptions = {}): Debug {
    const { environment, environments = [], adapters = [], redact = [], onAdapterError } = options
    const allowed = environments.map(normalize)
    const forbidden = allowed.find(name => PRODUCTION_LIKE.test(name))
    if (forbidden !== undefined) throw new DebugEnvironmentError(forbidden)
    const enabled = environment !== undefined && allowed.includes(normalize(environment))
    const redactor = createRedactor(redact)
    const report = (error: unknown): void => {
        const failure = toFailure(error)
        try {
            if (onAdapterError) onAdapterError(failure)
            else console.error(`[beepr:debug] ${failure.name}: ${failure.message}`)
        } catch {
            return
        }
    }

    const emit = (channel: DebugChannel) => (label: string, data?: DebugData) => {
        if (!enabled) return
        let entry: DebugEntry
        try {
            const resolved = isLazy(data) ? data[LAZY]() : data
            entry = Object.freeze({ channel, label, data: redactor(resolved) })
        } catch (error) {
            report(error)
            return
        }
        for (const adapter of adapters) {
            try {
                adapter.onDebug?.(entry)
            } catch (error) {
                report(error)
            }
        }
    }

    return {
        enabled,
        trace: emit('trace'),
        state: emit('state'),
        diagnostic: emit('diagnostic'),
    }
}
