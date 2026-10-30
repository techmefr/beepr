import { createRedactor } from './redact.ts'
import type { DebugEntry, SdkEvent, SdkEventHandler } from './types.ts'

export type SdkNotifyAdapter = {
    onRequest?: (context: { resource?: string; payload?: unknown }) => void
    onSuccess?: (data?: unknown) => void
    onError?: (error: { message: string; errors?: Record<string, string[]> }) => void
    onData?: (data?: unknown) => void
    onConnected?: (data?: unknown) => void
    onDisconnected?: (data?: unknown) => void
    onDebug?: (entry: DebugEntry) => void
}

export type NotifyOptions = {
    redact?: boolean
    redactKeys?: readonly string[]
}

export function createNotify(adapter: SdkNotifyAdapter, options: NotifyOptions = {}): SdkEventHandler {
    const redactor = createRedactor(options.redactKeys)
    const redact = options.redact === false ? (value: unknown): unknown => value : redactor

    return (event: SdkEvent, rawData?: unknown) => {
        if (event === 'request') {
            const context = (redact(rawData) as { resource?: string; payload?: unknown } | undefined) ?? {}
            adapter.onRequest?.(context)
        }
        if (event === 'success') {
            adapter.onSuccess?.(redact(rawData))
        }
        if (event === 'error') {
            const err = (redact(rawData) ?? {}) as { message?: string; errors?: Record<string, string[]> }
            adapter.onError?.({ message: err.message ?? 'Unknown error', errors: err.errors })
        }
        if (event === 'data') {
            adapter.onData?.(redact(rawData))
        }
        if (event === 'connected') {
            adapter.onConnected?.(redact(rawData))
        }
        if (event === 'disconnected') {
            adapter.onDisconnected?.(redact(rawData))
        }
    }
}
