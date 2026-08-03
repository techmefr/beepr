export type SdkEvent =
    | 'request'
    | 'success'
    | 'error'
    | 'data'
    | 'connected'
    | 'disconnected'

export type SdkEventHandler = (event: SdkEvent, data?: unknown) => void
