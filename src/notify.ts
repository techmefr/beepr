import { errorContext, requestContext, successContext } from './context.ts'
import { createRedactor } from './redact.ts'
import type { DebugEntry, ErrorContext, RequestContext, SdkEvent, SdkEventHandler, SuccessContext } from './types.ts'

export type SdkNotifyAdapter = {
    onRequest?: (context: RequestContext) => void
    onSuccess?: (context: SuccessContext) => void
    onError?: (error: ErrorContext) => void
    onData?: (data?: unknown) => void
    onComplete?: (data?: unknown) => void
    onConnected?: (data?: unknown) => void
    onDisconnected?: (data?: unknown) => void
    onDebug?: (entry: DebugEntry) => void
}

export type NotifyOptions = {
    redact?: boolean
    redactKeys?: readonly string[]
}

function redactFieldErrors(
    errors: Record<string, string[]> | undefined,
    redact: (value: unknown) => unknown,
): Record<string, string[]> | undefined {
    if (errors === null || typeof errors !== 'object') return undefined
    const result: Record<string, string[]> = {}
    for (const [field, messages] of Object.entries(errors)) {
        Object.defineProperty(result, field, {
            value: redact(messages),
            enumerable: true,
            writable: true,
            configurable: true,
        })
    }
    return result
}

export function createNotify(adapter: SdkNotifyAdapter, options: NotifyOptions = {}): SdkEventHandler {
    const redactor = createRedactor(options.redactKeys)
    const redact = options.redact === false ? (value: unknown): unknown => value : redactor

    return (event: SdkEvent, rawData?: unknown) => {
        if (event === 'request') {
            adapter.onRequest?.(requestContext(redact(rawData)))
        }
        if (event === 'success') {
            adapter.onSuccess?.(successContext(redact(rawData)))
        }
        if (event === 'error') {
            const { errors, ...rest } = (rawData ?? {}) as { errors?: Record<string, string[]> }
            adapter.onError?.(errorContext(redact(rest), redactFieldErrors(errors, redact)))
        }
        if (event === 'data') {
            adapter.onData?.(redact(rawData))
        }
        if (event === 'complete') {
            adapter.onComplete?.(redact(rawData))
        }
        if (event === 'connected') {
            adapter.onConnected?.(redact(rawData))
        }
        if (event === 'disconnected') {
            adapter.onDisconnected?.(redact(rawData))
        }
    }
}
