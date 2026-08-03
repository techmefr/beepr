---
title: Introduction
description: Why beepr exists and what problem it solves.
---

Most event systems tie you to a framework's own event bus, or force every listener to pattern-match on a raw `(event, data)` pair by hand. `beepr` separates two things:

- **the event vocabulary** — `request · success · error · data · connected · disconnected`, the same six events an async call or a reactive subscription can emit;
- **the adapter** — a typed object (`onRequest`, `onSuccess`, `onError`…) that `createNotify` turns into the raw handler shape a caller expects.

The result: you write typed, readable event handlers, and the raw `SdkEventHandler` shape — the thing a caller like [`nexdk`](https://github.com/techmefr/nexdk) actually invokes — is generated for you.

## Install

```bash
npm install beepr
```

## A minimal example

```ts
import { createNotify } from 'beepr'

const notify = createNotify({
  onRequest: (ctx) => console.log('→', ctx.resource, ctx.payload),
  onSuccess: (data) => console.log('✓', data),
  onError: (err) => console.error('✗', err.message),
})

notify('request', { resource: 'users', payload: { id: 1 } })
notify('success', { id: 1, name: 'Alice' })
```

From here:

- [Pairing with nexdk](/beepr/guides/pairing-with-nexdk/) — how `beepr` plugs into an `nexdk` SDK without either depending on the other.
- [beepr API](/beepr/reference/beepr/) — every runtime export.
