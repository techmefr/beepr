export type SdkEvent =
    | 'request'
    | 'success'
    | 'error'
    | 'data'
    | 'connected'
    | 'disconnected'

export type SdkEventHandler = (event: SdkEvent, data?: unknown) => void

export type DebugChannel = 'trace' | 'state' | 'diagnostic'

export type DebugEntry = {
    readonly channel: DebugChannel
    readonly label: string
    readonly data?: unknown
}
