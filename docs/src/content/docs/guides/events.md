---
title: Events & adapters
description: Dispatch the six supported events through one typed handler.
---

## One event contract

`SdkEventHandler` is a function of the form `(event, data?) => void`. The event name is checked by TypeScript; payloads use `unknown` at the raw handler boundary.

| Event | Adapter callback | Typical use |
|---|---|---|
| `request` | `onRequest` | Request context and loading indicators. |
| `success` | `onSuccess` | Completed operation. |
| `error` | `onError` | Error messages and field errors. |
| `data` | `onData` | Incoming subscription data. |
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

Callbacks are optional. An error event without a message is normalized to `Unknown error`. Success, data and connection payloads remain unknown until your application narrows them.

The flat handler invokes callbacks synchronously; it does not await asynchronous work. Use [hooks](/beepr/guides/hooks/) when you need an awaited listener chain.
