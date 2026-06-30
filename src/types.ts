export type PilotaEvent =
    | 'request'
    | 'success'
    | 'error'
    | 'data'
    | 'connected'
    | 'disconnected'

export type PilotaEventHandler = (event: PilotaEvent, data?: unknown) => void
