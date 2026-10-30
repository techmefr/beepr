import type { SdkNotifyAdapter } from './notify.ts'

export function createConsoleAdapter(): SdkNotifyAdapter {
    return {
        onDebug: ({ channel, label, data }) => {
            const method = channel === 'diagnostic' ? console.warn : console.debug
            method(`[beepr:${channel}] ${label}`, data)
        },
    }
}
