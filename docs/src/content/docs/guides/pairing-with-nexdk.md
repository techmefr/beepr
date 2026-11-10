---
title: Pairing with nexdk
description: How beepr plugs into an nexdk SDK without either depending on the other.
---

beepr does not depend on nexdk, and nexdk does not depend on beepr. beepr keeps its own copy of the event union and handler type, identical to nexdk's `SdkEvent` and `SdkEventHandler`. So a beepr handler can be passed as `notify` to `createSdk`:

```ts
import { createNotify } from 'beepr'
import { createSdk } from 'nexdk'

const notify = createNotify({
  onRequest: ({ resource, method }) => console.log('request', resource, method),
  onSuccess: ({ resource, method, data }) => console.log('success', resource, method, data),
  onError: ({ status, kind, message }) => console.error(kind === 'timeout' ? 'Too slow' : `${status} ${message}`),
})

const sdk = createSdk({
  drivers: {},
  notify,
})
```

nexdk emits `request` as `{ resource, method, payload }`, `success` as `{ resource, method, data }` and `error` as `{ message, status, errors, kind, resource, method }`: beepr types them as `RequestContext`, `SuccessContext` and `ErrorContext` without importing nexdk.

The duplication is intentional: it is the price of independence. nexdk exports its own types, so you never need beepr just to type a handler. Use beepr when you want a typed adapter, redaction and composition instead of matching the raw `(event, data)` pair yourself.

## Combine a global and a per-call handler

```ts
import { createNotify, mergeEventHandlers } from 'beepr'

const globalNotify = createNotify({ onError: error => console.error(error.message) })
const perCallNotify = createNotify({ onSuccess: () => console.log('Saved') })

const handler = mergeEventHandlers(globalNotify, perCallNotify)
handler?.('success', { id: 1 })
```
