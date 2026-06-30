# beepr

A tiny, typed event/notify engine. One handler contract, composable adapters,
zero framework lock-in. Built on [`hookable`](https://github.com/unjs/hookable).

## Install

```bash
pnpm add beepr
```

## Usage

```ts
import { createNotify, mergeEventHandlers } from 'beepr'
import type { PilotaEvent, PilotaEventHandler } from 'beepr'

// Turn a typed adapter into a raw (event, data) => void handler
const notify = createNotify({
  onRequest: ctx => console.log('→', ctx.resource),
  onSuccess: data => console.log('ok', data),
  onError:   err => console.error(err.message),
  onConnected:    () => {},
  onDisconnected: () => {},
})

// Combine a global handler with a per-call one (both fire)
const handler = mergeEventHandlers(globalNotify, notify)
handler('success', { id: 1 })
```

Events: `request · success · error · data · connected · disconnected`.

- **`createNotify(adapter)`** → `PilotaEventHandler`.
- **`mergeEventHandlers(a, b)`** — call both if both are defined.
- **`createPilotaHooks()`** — a `hookable` instance typed with the event map.

Useful on its own as a typed notification bus, or as the event layer for
[`nexdk`](https://www.npmjs.com/package/nexdk).

## License

MIT © techmefr
