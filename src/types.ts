export type SdkEvent =
    | 'request'
    | 'success'
    | 'error'
    | 'data'
    | 'complete'
    | 'connected'
    | 'disconnected'

export type SdkEventHandler = (event: SdkEvent, data?: unknown) => void

export type ErrorKind = 'timeout' | 'abort' | 'network' | 'http'

export type CallContext = {
    resource?: string
    method?: string
}

export type RequestContext = CallContext & {
    payload?: unknown
}

export type SuccessContext = CallContext & {
    data?: unknown
}

export type ErrorContext = CallContext & {
    message: string
    errors?: Record<string, string[]>
    status?: number
    kind?: ErrorKind
}

export type DebugChannel = 'trace' | 'state' | 'diagnostic'

export type DebugEntry = {
    readonly channel: DebugChannel
    readonly label: string
    readonly data?: unknown
}
