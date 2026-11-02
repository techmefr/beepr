---
title: Events & adapters
description: Dispatch the seven supported events through one typed handler.
---

## One event contract

`SdkEventHandler` is `(event, data?) => void`. TypeScript checks the event name. Payloads are `unknown` at the raw handler boundary.

| Event | Adapter callback | Typical use |
|---|---|---|
| `request` | `onRequest` | Request context and loading indicators. |
| `success` | `onSuccess` | Completed operation. |
| `error` | `onError` | Error messages and field errors. |
| `data` | `onData` | Incoming subscription data. |
| `complete` | `onComplete` | Subscription finished by the server. |
| `connected` | `onConnected` | Connection established. |
| `disconnected` | `onDisconnected` | Connection lost or closed. |

## Build an adapter

```ts
import { createNotify } from 'beepr'

const notify = createNotify({
  onError: ({ message, errors }) => {
    console.error(message)
    if (errors) console.table(errors)
  },
  onConnected: () => console.log('Connected'),
  onDisconnected: () => console.log('Disconnected'),
})

notify('error', { message: 'Validation failed', errors: { name: ['Required'] } })
```

Callbacks are optional. An error event without a message becomes `Unknown error`. Other payloads stay `unknown` until your code narrows them.

Every payload is [redacted](/beepr/guides/redaction/) before the callback runs.

The handler calls callbacks synchronously and does not await async work. For an awaited chain, use [hooks](/beepr/guides/hooks/).
