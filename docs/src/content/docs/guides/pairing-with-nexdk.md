---
title: Pairing with nexdk
description: How beepr plugs into an nexdk SDK without either depending on the other.
---

`beepr` has **zero dependency on `nexdk`** (or on anything else but `hookable`) — it's usable entirely on its own. But its event vocabulary and handler shape are deliberately identical to `nexdk`'s own `SdkEvent`/`SdkEventHandler` types, so a `beepr` handler is a drop-in `notify` for `createSdk`:

```ts
import { createNotify } from 'beepr'
import { createSdk } from 'nexdk'

const notify = createNotify({
  onRequest: (ctx) => console.log('→', ctx.resource),
  onSuccess: (data) => console.log('✓', data),
  onError: (err) => console.error('✗', err.message),
})

const sdk = createSdk({
  drivers: { /* … */ },
  notify, // any SdkEventHandler-shaped function works — this one happens to come from beepr
})
```

This is intentional duplication, not a shared package: `nexdk` re-exports its own `SdkEvent`/`SdkEventHandler` types so you never need `beepr` just to type a handler (see nexdk's [Events guide](https://techmefr.github.io/nexdk/guides/events/)) — `beepr` is there for when you want a typed adapter (`onRequest`/`onSuccess`/`onError`…) instead of pattern-matching the raw `(event, data)` pair yourself, or when you want the same event vocabulary in a project that has nothing to do with `nexdk` at all.

## Combining a global and a per-call handler

`mergeEventHandlers` runs both if both are defined — useful for a global `notify` set once (e.g. logging) plus a one-off handler passed to a single call:

```ts
import { mergeEventHandlers, createNotify } from 'beepr'

const globalNotify = createNotify({ onError: (err) => reportToSentry(err) })
const perCallNotify = createNotify({ onSuccess: (data) => toast.success('Saved') })

const handler = mergeEventHandlers(globalNotify, perCallNotify)
handler('success', { id: 1 }) // both fire, in order
```
